<div align="center">

# ⇄ Çevir — Live Currency & Crypto Converter

**Convert between any two of 170+ world currencies and major cryptocurrencies — in real time.**

Pick a base currency, type an amount, and see instant conversions across the currencies you care about.

[**🔗 Live Demo**](https://goshgarhasanov.github.io/manat-converter/)

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38BDF8?logo=tailwindcss&logoColor=white)
![Deploy](https://img.shields.io/badge/GitHub_Pages-deployed-success?logo=github)
![License](https://img.shields.io/badge/license-MIT-green)

</div>

---

## ✨ Features

- **Any base currency** — convert *from* any of 170+ fiat currencies or cryptocurrencies, not just one. The selected base is automatically excluded from the results list.
- **Live exchange rates** — fiat rates and crypto prices are fetched on the fly and recalculated instantly as you type.
- **Configurable favourites** — pin up to **5** currencies for a focused, at-a-glance view. Your selection persists in the browser (`localStorage`).
- **Browse everything** — switch to *All* to search the full list of 170+ currencies and add/remove favourites with a tap.
- **Fiat + crypto in one place** — USD, EUR, RUB, TRY, GEL… alongside BTC, ETH, USDT, BNB, SOL and more.
- **Mobile-first, accessible UI** — sticky converter bar, quick-amount chips, tap-to-copy values, skeleton loading states, large touch targets, keyboard and screen-reader support.
- **Zero backend, zero keys** — a fully static site that talks directly to free, public, key-less APIs. Cheap to host, nothing to leak.

## 🧱 Tech Stack

| Area | Technology |
|------|------------|
| Framework | Next.js 15 (App Router, static export) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Fiat rates | [open.er-api.com](https://open.er-api.com) — no API key |
| Crypto prices | [CoinGecko API](https://www.coingecko.com/en/api) — no API key |
| Hosting | GitHub Pages (CI/CD via GitHub Actions) |

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Run the dev server
npm run dev          # → http://localhost:3000

# 3. Production build (static export to ./out)
npm run build
```

> The app is exported as a static site (`output: "export"`), so the contents of `./out` can be served from any static host.

## 🧭 How It Works

All rates are normalised to a single pivot (AZN) and stored as **“units of currency X per 1 AZN”**. Converting between an arbitrary base **B** and target **T** is then a single, exact expression:

```
amount_in_T = amount_in_B × (rate[T] / rate[B])
```

- Fiat rates come from `open.er-api.com` (AZN base).
- Crypto prices come from CoinGecko in USD and are converted to the same AZN pivot, so fiat and crypto share one consistent rate table.
- Because everything shares one pivot, **any** currency — including crypto — can be used as the base.

## 📁 Project Structure

```
src/
├─ app/
│  ├─ page.tsx          # converter UI (client component)
│  ├─ layout.tsx        # document shell + metadata
│  └─ globals.css       # Tailwind + theme
└─ lib/
   ├─ rates.ts          # fetch + merge fiat & crypto into one rate table
   └─ currencies.ts     # currency metadata (name, flag, type)
```

## 🗺️ Roadmap

- [ ] Reverse/swap base ⇄ target with one tap
- [ ] 7/30-day rate history sparkline
- [ ] Offline cache of the last fetched rates (PWA)
- [ ] Locale-aware number parsing for pasted amounts

## ⚠️ Disclaimer

Exchange rates are sourced from public providers and are **for informational purposes only**. They may differ from official or bank rates and should not be used for financial decisions.

## 👤 Author

**Goshgar Hasanzadeh** — [GitHub](https://github.com/goshgarhasanov)

If this project is useful to you, you can support me with a coffee ☕
→ **[kofe.al/goshgarhasanov](https://kofe.al/goshgarhasanov)**

## 📄 License

Released under the [MIT License](LICENSE).
