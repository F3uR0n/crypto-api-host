# Crypto API Host

Nebula Markets is a modern cryptocurrency dashboard that surfaces live market leaders and multi-year trendlines in a single view. It combines rich filtering, instant search, and interactive charts powered by the CoinGecko API.

## Features

- Live market overview with rank, price, and multi-horizon change metrics
- Advanced sorting with configurable direction and market-cap tiers
- Quick filters for gainers, losers, high-volume assets, and big movers
- Trend explorer chart for price, market cap, and volume over months or years
- Insight cards highlighting top gainer, top loser, and volume leader

## Tech Stack

- HTML5
- CSS3
- JavaScript (ES6)
- Chart.js
- CoinGecko API

## Live Link

Live link: https://f3ur0n.github.io/crypto-api-host/

## Configuration

If you have a CoinGecko Pro key, create a local config file so it is not committed:

1. Copy config.example.js to config.js
2. Add your API key inside config.js

The config.js file is ignored by Git and safe for local use only.

## Project Structure

```
crypto-api-host/
├── .gitignore
├── config.example.js
├── config.js          # local only, ignored by Git
├── index.html
├── script.js
├── style.css
└── README.md
```

## How It Works

1. Loads the top 50 assets by market cap from CoinGecko.
2. Applies client-side filters, search, and sorting for fast navigation.
3. Fetches historical data for the selected asset to render the chart.

## About

Nebula Markets is a focused front-end project built to visualize crypto market movement with clarity. The interface emphasizes fast scanning, flexible filtering, and long-term trend context without a backend or heavy tooling. It is ideal for showcasing API integration, data visualization, and UI polish.