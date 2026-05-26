# ₼ Manat Çevirici

Manat (AZN) əsaslı **canlı valyuta çevirici** — dünya valyutaları və populyar kriptovalyutalar bir yerdə. Məbləği manatla daxil edin, nəticə dərhal seçdiyiniz valyutalarda görünür.

> Next.js (App Router) + TypeScript + Tailwind CSS ilə hazırlanıb. Tam Azərbaycan dilində.

## ✨ İmkanlar

- **Canlı çevirmə** — manatı yazdıqca nəticələr real vaxtda yenilənir.
- **Seçilmiş valyutalar** — ön planda göstərilən valyutaları özünüz seçirsiniz (standart: USD, USDT, BTC, RUB, TRY). Seçim brauzerdə (`localStorage`) yadda qalır.
- **Bütün valyutalar** — “Hamısını göstər” ilə 160-dan çox valyuta + kripto; axtarış zolağı ilə tez tapın.
- **Əlavə et / çıxar** — istənilən valyutanı ulduz (★) ilə seçilmişlərə əlavə edin və ya çıxarın.
- **Fiat + kripto** — ABŞ dolları, avro, rubl, lirə… və Bitkoin, Ethereum, Tether, BNB, Solana və s.
- **Avtomatik keş** — məzənnələr serverdə 5 dəqiqə keşlənir (sürət + API limitlərinə hörmət).

## 🧱 Texnologiyalar

| Sahə | Texnologiya |
|------|-------------|
| Çərçivə | Next.js 15 (App Router) |
| Dil | TypeScript |
| Üslub | Tailwind CSS v4 |
| Məzənnə (fiat) | [open.er-api.com](https://open.er-api.com) — açar tələb etmir |
| Məzənnə (kripto) | [CoinGecko API](https://www.coingecko.com/en/api) — açar tələb etmir |

## 🚀 İşə salmaq

```bash
npm install
npm run dev
```

Sonra brauzerdə [http://localhost:3000](http://localhost:3000) ünvanını açın.

Produksiya üçün:

```bash
npm run build
npm start
```

## 🧭 Necə işləyir?

- `GET /api/rates` — server fiat məzənnələrini (AZN bazası ilə) və kripto qiymətlərini (USD → AZN çevrilməklə) birləşdirib vahid JSON qaytarır: `{ base: "AZN", rates: { USD, EUR, BTC, … } }`.
- Hər `rates[KOD]` dəyəri **1 manatın** həmin valyutadakı qarşılığıdır, ona görə çevirmə sadəcə `məbləğ × rates[KOD]`-dur.
- Valyuta adları və bayraqları `src/lib/currencies.ts` faylındadır.

## 📁 Struktur

```
src/
├─ app/
│  ├─ api/rates/route.ts   # məzənnə birləşdirici (fiat + kripto)
│  ├─ page.tsx             # çevirici interfeysi
│  ├─ layout.tsx
│  └─ globals.css
└─ lib/
   └─ currencies.ts        # valyuta metadatası (ad, bayraq, tip)
```

## 📝 Qeyd

Məzənnələr **məlumat xarakterlidir** və açıq mənbələrdən gəlir; rəsmi/bank məzənnəsindən fərqlənə bilər.

## 📄 Lisenziya

MIT
