const API_KEY = "CG-QHWAo1EUjWH14DJnKPXWsCMW"; // Replace with your real key

let coins = [];

async function fetchCoins() {
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=30&page=1&sparkline=false"
    );
    coins = await response.json();
    displayCoins(coins);
  } catch (err) {
    console.error("Error fetching data:", err);
  }
}

function displayCoins(list) {
  const table = document.getElementById("coinTable");
  table.innerHTML = "";

  list.forEach(coin => {
    const changeClass = coin.price_change_percentage_24h >= 0 ? "positive" : "negative";
    table.innerHTML += `
      <tr>
        <td><img src="${coin.image}" width="25" style="vertical-align: middle;"> ${coin.name}</td>
        <td>${coin.symbol.toUpperCase()}</td>
        <td>$${coin.current_price.toLocaleString()}</td>
        <td class="${changeClass}">${coin.price_change_percentage_24h?.toFixed(2)}%</td>
        <td>$${coin.market_cap.toLocaleString()}</td>
      </tr>
    `;
  });
}

function sortBy(criteria) {
  if (criteria === "price") coins.sort((a, b) => b.current_price - a.current_price);
  if (criteria === "change") coins.sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h);
  if (criteria === "market_cap") coins.sort((a, b) => b.market_cap - a.market_cap);
  displayCoins(coins);
}

async function searchCoin() {
  const query = document.getElementById("searchInput").value.toLowerCase().trim();
  if (!query) return displayCoins(coins);

  try {
    const res = await fetch(`https://api.coingecko.com/api/v3/search?query=${query}`);
    const data = await res.json();
    const firstResult = data.coins[0];
    if (!firstResult) {
      alert("No coin found!");
      return;
    }

    const coinDetails = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${firstResult.id}`
    );
    const coinData = await coinDetails.json();

    displayCoins(coinData);
  } catch (err) {
    console.error(err);
  }
}

fetchCoins();
