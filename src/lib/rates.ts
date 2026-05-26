// Məzənnə çəkici — birbaşa brauzerdən (statik sayt üçün). Hər iki mənbə
// CORS-a icazə verir (Access-Control-Allow-Origin: *), ona görə server
// route-suz işləyir və GitHub Pages-də deploy oluna bilir.
//
// rates[CODE] = 1 manatın həmin valyutadakı qarşılığı → çevirmə: məbləğ × rate.
import { CRYPTO_IDS } from "./currencies";

export interface RatesResult {
  base: "AZN";
  updatedAt: string;
  rates: Record<string, number>;
  source: { fiat: boolean; crypto: boolean };
}

export async function fetchRates(): Promise<RatesResult> {
  const rates: Record<string, number> = {};
  let fiatOk = false;
  let cryptoOk = false;
  let updatedAt = new Date().toISOString();

  // 1) Fiat (AZN bazası)
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/AZN");
    const data = await res.json();
    if (data?.result === "success" && data.rates) {
      for (const [code, value] of Object.entries(data.rates)) {
        if (typeof value === "number" && isFinite(value)) rates[code] = value;
      }
      rates.AZN = 1; // baza özü (istənilən valyutadan çevirmə üçün lazımdır)
      fiatOk = true;
      if (data.time_last_update_utc) {
        updatedAt = new Date(data.time_last_update_utc).toISOString();
      }
    }
  } catch {
    /* fiat alınmadı */
  }

  // 2) Kripto (USD qiymət → AZN→kripto = (AZN→USD) / qiymətUSD)
  const azToUsd = rates.USD;
  if (azToUsd && azToUsd > 0) {
    try {
      const ids = Object.keys(CRYPTO_IDS).join(",");
      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`,
      );
      const data = (await res.json()) as Record<string, { usd?: number }>;
      for (const [id, code] of Object.entries(CRYPTO_IDS)) {
        const priceUsd = data?.[id]?.usd;
        if (typeof priceUsd === "number" && priceUsd > 0) {
          rates[code] = azToUsd / priceUsd;
          cryptoOk = true;
        }
      }
    } catch {
      /* kripto alınmadı */
    }
  }

  if (!fiatOk && !cryptoOk) {
    throw new Error("Məzənnələr hazırda əlçatan deyil. Bir az sonra yenidən cəhd edin.");
  }
  return { base: "AZN", updatedAt, rates, source: { fiat: fiatOk, crypto: cryptoOk } };
}
