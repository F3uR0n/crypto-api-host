const APP_CONFIG = window.APP_CONFIG || {};
const API_KEY = APP_CONFIG.COINGECKO_API_KEY || "";
const API_BASE = "https://api.coingecko.com/api/v3";

const state = {
  coins: [],
  filtered: [],
  search: "",
  sortKey: "market_cap",
  sortDir: "desc",
  filter: "all",
  capTier: "top50",
  selectedCoinId: null,
  chartRange: "30",
  chartMetric: "prices"
};

const elements = {
  table: document.getElementById("coinTable"),
  searchInput: document.getElementById("searchInput"),
  searchButton: document.getElementById("searchButton"),
  sortSelect: document.getElementById("sortSelect"),
  sortDirection: document.getElementById("sortDirection"),
  filterSelect: document.getElementById("filterSelect"),
  capSelect: document.getElementById("capSelect"),
  resultCount: document.getElementById("resultCount"),
  quickFilters: document.getElementById("quickFilters"),
  lastUpdated: document.getElementById("lastUpdated"),
  chartCoin: document.getElementById("chartCoin"),
  chartRange: document.getElementById("chartRange"),
  chartMetric: document.getElementById("chartMetric"),
  chartSubtitle: document.getElementById("chartSubtitle"),
  searchStatus: document.getElementById("searchStatus"),
  topGainer: document.getElementById("topGainer"),
  topGainerValue: document.getElementById("topGainerValue"),
  topLoser: document.getElementById("topLoser"),
  topLoserValue: document.getElementById("topLoserValue"),
  topVolume: document.getElementById("topVolume"),
  topVolumeValue: document.getElementById("topVolumeValue")
};

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2
});

const compactUsd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 2
});

const compactNumber = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 2
});

let trendChart = null;

function formatPercent(value) {
  if (value === null || value === undefined) return "--";
  return `${value.toFixed(2)}%`;
}

function formatUsd(value, compact = false) {
  if (value === null || value === undefined) return "--";
  return compact ? compactUsd.format(value) : usd.format(value);
}

function formatNumber(value) {
  if (value === null || value === undefined) return "--";
  return compactNumber.format(value);
}

function formatChartLabel(date) {
  if (state.chartRange === "max" || Number(state.chartRange) >= 365) {
    return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

async function fetchJson(url) {
  const options = API_KEY
    ? { headers: { "x-cg-pro-api-key": API_KEY } }
    : undefined;
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
}

async function fetchCoins() {
  try {
    const data = await fetchJson(
      `${API_BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h,7d,30d`
    );
    state.coins = data;
    state.selectedCoinId = data[0]?.id || null;
    populateCoinSelect();
    applyFilters();
    updateHighlights();
    updateLastUpdated();
    if (state.selectedCoinId) {
      await loadTrend(state.selectedCoinId);
    }
  } catch (err) {
    console.error("Error fetching data:", err);
    elements.resultCount.textContent = "Unable to load data.";
  }
}

function updateLastUpdated() {
  const now = new Date();
  elements.lastUpdated.textContent = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function populateCoinSelect() {
  elements.chartCoin.innerHTML = "";
  state.coins.forEach(coin => {
    const option = document.createElement("option");
    option.value = coin.id;
    option.textContent = `${coin.name} (${coin.symbol.toUpperCase()})`;
    elements.chartCoin.appendChild(option);
  });
  elements.chartCoin.value = state.selectedCoinId || "";
}

function applyFilters() {
  let list = [...state.coins];
  const query = state.search.trim().toLowerCase();

  if (query) {
    list = list.filter(coin => {
      return (
        coin.name.toLowerCase().includes(query) ||
        coin.symbol.toLowerCase().includes(query)
      );
    });
  }

  if (state.capTier === "top10") list = list.filter(coin => coin.market_cap_rank <= 10);
  if (state.capTier === "top30") list = list.filter(coin => coin.market_cap_rank <= 30);

  if (state.filter === "gainers") {
    list = list.filter(coin => (coin.price_change_percentage_24h || 0) > 0);
  }
  if (state.filter === "losers") {
    list = list.filter(coin => (coin.price_change_percentage_24h || 0) < 0);
  }
  if (state.filter === "volume") {
    list = list.sort((a, b) => b.total_volume - a.total_volume);
  }
  if (state.filter === "movers") {
    list = list.filter(coin => Math.abs(coin.price_change_percentage_7d_in_currency || 0) >= 12);
  }

  list.sort((a, b) => {
    const dir = state.sortDir === "asc" ? 1 : -1;
    switch (state.sortKey) {
      case "price":
        return dir * (a.current_price - b.current_price);
      case "change24h":
        return dir * ((a.price_change_percentage_24h || 0) - (b.price_change_percentage_24h || 0));
      case "change7d":
        return dir * ((a.price_change_percentage_7d_in_currency || 0) - (b.price_change_percentage_7d_in_currency || 0));
      case "volume":
        return dir * (a.total_volume - b.total_volume);
      case "name":
        return dir * a.name.localeCompare(b.name);
      case "market_cap":
      default:
        return dir * (a.market_cap - b.market_cap);
    }
  });

  state.filtered = list;
  elements.resultCount.textContent = `Showing ${list.length} assets`;
  displayCoins(list);
}

function displayCoins(list) {
  elements.table.innerHTML = "";
  list.forEach(coin => {
    const change24hClass = (coin.price_change_percentage_24h || 0) >= 0 ? "positive" : "negative";
    const change7dClass = (coin.price_change_percentage_7d_in_currency || 0) >= 0 ? "positive" : "negative";
    const change30dClass = (coin.price_change_percentage_30d_in_currency || 0) >= 0 ? "positive" : "negative";

    const row = document.createElement("tr");
    if (coin.id === state.selectedCoinId) row.classList.add("is-selected");
    row.dataset.coinId = coin.id;
    row.innerHTML = `
      <td>${coin.market_cap_rank ?? "--"}</td>
      <td>
        <div class="asset-cell">
          <img src="${coin.image}" alt="${coin.name}" />
          <div>
            <div>${coin.name}</div>
            <div class="symbol">${coin.symbol.toUpperCase()}</div>
          </div>
        </div>
      </td>
      <td>${formatUsd(coin.current_price)}</td>
      <td class="${change24hClass}">${formatPercent(coin.price_change_percentage_24h)}</td>
      <td class="${change7dClass}">${formatPercent(coin.price_change_percentage_7d_in_currency)}</td>
      <td class="${change30dClass}">${formatPercent(coin.price_change_percentage_30d_in_currency)}</td>
      <td>${formatUsd(coin.market_cap, true)}</td>
      <td>${formatUsd(coin.total_volume, true)}</td>
    `;
    row.addEventListener("click", () => selectCoin(coin.id));
    elements.table.appendChild(row);
  });
}

function updateHighlights() {
  if (!state.coins.length) return;
  const sortedByChange = [...state.coins].sort(
    (a, b) => (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0)
  );
  const sortedByLoss = [...state.coins].sort(
    (a, b) => (a.price_change_percentage_24h || 0) - (b.price_change_percentage_24h || 0)
  );
  const sortedByVolume = [...state.coins].sort((a, b) => b.total_volume - a.total_volume);

  const gainer = sortedByChange[0];
  const loser = sortedByLoss[0];
  const volume = sortedByVolume[0];

  elements.topGainer.textContent = gainer ? gainer.name : "--";
  elements.topGainerValue.textContent = gainer
    ? `${formatPercent(gainer.price_change_percentage_24h)} in 24h`
    : "--";
  elements.topLoser.textContent = loser ? loser.name : "--";
  elements.topLoserValue.textContent = loser
    ? `${formatPercent(loser.price_change_percentage_24h)} in 24h`
    : "--";
  elements.topVolume.textContent = volume ? volume.name : "--";
  elements.topVolumeValue.textContent = volume
    ? `${formatUsd(volume.total_volume, true)} volume`
    : "--";
}

async function selectCoin(coinId) {
  state.selectedCoinId = coinId;
  elements.chartCoin.value = coinId;
  displayCoins(state.filtered);
  await loadTrend(coinId);
}

async function loadTrend(coinId) {
  if (!coinId) return;
  try {
    const data = await fetchJson(
      `${API_BASE}/coins/${coinId}/market_chart?vs_currency=usd&days=${state.chartRange}`
    );
    updateChart(data);
    const coin = state.coins.find(item => item.id === coinId);
    const name = coin ? coin.name : coinId;
    const rangeLabel = state.chartRange === "max" ? "all available history" : `${state.chartRange} days`;
    elements.chartSubtitle.textContent = `${name} history for ${rangeLabel}`;
  } catch (err) {
    console.error("Error loading trend data:", err);
  }
}

function updateChart(data) {
  const metric = state.chartMetric;
  const series = data[metric] || [];
  const labels = series.map(entry => formatChartLabel(new Date(entry[0])));
  const values = series.map(entry => entry[1]);
  const isPositive = values[values.length - 1] >= values[0];
  const lineColor = isPositive ? "#4ade80" : "#f87171";

  if (!trendChart) {
    const ctx = document.getElementById("trendChart").getContext("2d");
    trendChart = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: metric.replace("_", " "),
            data: values,
            borderColor: lineColor,
            borderWidth: 2,
            tension: 0.3,
            pointRadius: 0,
            fill: true,
            backgroundColor: createGradient(ctx, lineColor)
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              maxTicksLimit: 10,
              color: "#94a3b8"
            }
          },
          y: {
            grid: { color: "rgba(148, 163, 184, 0.08)" },
            ticks: {
              callback: value => formatNumber(value)
            }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: context => formatUsd(context.parsed.y, true)
            }
          }
        }
      }
    });
  } else {
    trendChart.data.labels = labels;
    trendChart.data.datasets[0].data = values;
    trendChart.data.datasets[0].borderColor = lineColor;
    trendChart.data.datasets[0].backgroundColor = createGradient(trendChart.ctx, lineColor);
    trendChart.update();
  }
}

function createGradient(ctx, color) {
  const gradient = ctx.createLinearGradient(0, 0, 0, 180);
  gradient.addColorStop(0, `${color}55`);
  gradient.addColorStop(1, "rgba(15, 23, 42, 0)");
  return gradient;
}

async function lookupCoin() {
  const query = elements.searchInput.value.trim();
  if (!query) {
    elements.searchStatus.textContent = "Live filter updates as you type.";
    return;
  }

  try {
    const data = await fetchJson(`${API_BASE}/search?query=${encodeURIComponent(query)}`);
    const result = data.coins[0];
    if (!result) {
      elements.searchStatus.textContent = "No matching asset found in CoinGecko.";
      return;
    }

    if (!state.coins.some(coin => coin.id === result.id)) {
      const [coinData] = await fetchJson(
        `${API_BASE}/coins/markets?vs_currency=usd&ids=${result.id}&sparkline=false&price_change_percentage=24h,7d,30d`
      );
      if (coinData) {
        state.coins = [coinData, ...state.coins];
        populateCoinSelect();
      }
    }

    elements.searchStatus.textContent = `Pinned ${result.name} from CoinGecko search.`;
    state.search = result.name.toLowerCase();
    elements.searchInput.value = result.name;
    applyFilters();
    await selectCoin(result.id);
  } catch (err) {
    console.error(err);
    elements.searchStatus.textContent = "Search failed. Try again shortly.";
  }
}

function updateQuickFilters(filter) {
  state.filter = filter;
  const chips = Array.from(elements.quickFilters.querySelectorAll(".chip"));
  chips.forEach(chip => {
    chip.classList.toggle("is-active", chip.dataset.filter === filter);
  });
  elements.filterSelect.value = filter;
}

function bindEvents() {
  elements.searchInput.addEventListener("input", event => {
    state.search = event.target.value;
    applyFilters();
  });

  elements.searchButton.addEventListener("click", lookupCoin);

  elements.sortSelect.addEventListener("change", event => {
    state.sortKey = event.target.value;
    applyFilters();
  });

  elements.sortDirection.addEventListener("change", event => {
    state.sortDir = event.target.value;
    applyFilters();
  });

  elements.filterSelect.addEventListener("change", event => {
    state.filter = event.target.value;
    updateQuickFilters(state.filter);
    applyFilters();
  });

  elements.capSelect.addEventListener("change", event => {
    state.capTier = event.target.value;
    applyFilters();
  });

  elements.quickFilters.addEventListener("click", event => {
    if (!event.target.matches(".chip")) return;
    updateQuickFilters(event.target.dataset.filter);
    applyFilters();
  });

  elements.chartCoin.addEventListener("change", event => {
    selectCoin(event.target.value);
  });

  elements.chartRange.addEventListener("change", event => {
    state.chartRange = event.target.value;
    loadTrend(state.selectedCoinId);
  });

  elements.chartMetric.addEventListener("change", event => {
    state.chartMetric = event.target.value;
    loadTrend(state.selectedCoinId);
  });
}

bindEvents();
fetchCoins();
