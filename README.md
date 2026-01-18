# 🚀 Crypto API Host (Crypto Dashboard)

A responsive and interactive **cryptocurrency dashboard** built using **HTML, CSS, and JavaScript**, powered by the **CoinGecko public API**.
This project allows users to track real-time crypto market data, search for specific coins, and sort them based on different market metrics.

---

## 📌 Features

* 🔍 **Search any cryptocurrency** by name (e.g., Bitcoin, Ethereum)
* 💵 **Sort coins by price**
* 📈 **Sort coins by 24h percentage change**
* 🏦 **Sort coins by market capitalization**
* 📊 Displays:

  * Current price (USD)
  * 24-hour price change
  * Market cap
  * Coin logo and symbol
* 🎨 Modern dark-themed UI for better readability

---

## 🛠️ Tech Stack

* **HTML5** – Structure
* **CSS3** – Styling and layout
* **JavaScript (ES6)** – Logic and API handling
* **CoinGecko API** – Live cryptocurrency data

---

## ⚙️ How It Works

1. Fetches top 30 cryptocurrencies by market cap from CoinGecko
2. Stores data in memory for sorting and filtering
3. Dynamically updates the table based on user interaction
4. Uses CoinGecko search API to fetch individual coin data

---

## 📁 Project Structure

```
crypto-api-host/
│
├── index.html      # Main HTML file
├── style.css       # Styling
├── script.js       # API logic and DOM manipulation
└── README.md
```

---

## 🚧 Limitations

* Uses **public CoinGecko API** (rate-limited)
* No backend or database
* Data refresh requires page reload

---

## 🌱 Future Improvements

* 📊 Add charts (price history)
* 🔄 Auto-refresh market data
* ⭐ Favorite/watchlist system
* 📱 Improved mobile responsiveness
* 🌍 Multi-currency support (USD, EUR, BDT)

---

## 🎯 Purpose of This Project

This project was built to:

* Practice **API integration**
* Improve **JavaScript DOM manipulation**
* Learn **client-side sorting & filtering**
* Build a real-world dashboard UI

---

## 📜 License

This project is open-source and free to use for learning purposes.

---

### ⭐ If you like this project, give it a star!