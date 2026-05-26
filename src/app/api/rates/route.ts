import { NextResponse } from "next/server";
import { CRYPTO_IDS } from "@/lib/currencies";

// Məzənnələr: 1 AZN = `rates[CODE]` vahid valyuta.
// Fiat:  open.er-api.com (açar tələb etmir) — AZN bazasında ~160 valyuta.
// Kripto: CoinGecko (açar tələb etmir) — USD qiyməti AZN→USD ilə çevrilir.

export const revalidate = 300; // 5 dəqiqə keş

interface RatesPayload {
  base: "AZN";
  updatedAt: string;
  rates: Record<string, number>;
  source: { fiat: boolean; crypto: boolean };
}

export async function GET() {
  const rates: Record<string, number> = {};
  let fiatOk = false;
  let cryptoOk = false;
  let updatedAt = new Date().toISOString();

  // 1) Fiat məzənnələri (AZN bazası).
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/AZN", {
      next: { revalidate: 300 },
    });
    const data = await res.json();
    if (data?.result === "success" && data.rates) {
      for (const [code, value] of Object.entries(data.rates)) {
        if (typeof value === "number" && isFinite(value)) rates[code] = value;
      }
      fiatOk = true;
      if (data.time_last_update_utc) {
        updatedAt = new Date(data.time_last_update_utc).toISOString();
      }
    }
  } catch {
    // fiat alınmadı — kripto yenə cəhd ediləcək
  }

  // 2) Kripto qiymətləri (USD) → AZN→kripto.
  // 1 AZN = rates.USD USD; 1 kripto = priceUsd USD → 1 AZN = rates.USD / priceUsd kripto.
  const azToUsd = rates.USD;
  if (azToUsd && azToUsd > 0) {
    try {
      const ids = Object.keys(CRYPTO_IDS).join(",");
      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`,
        { next: { revalidate: 120 } },
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
      // kripto alınmadı — yalnız fiat qaytarılacaq
    }
  }

  if (!fiatOk && !cryptoOk) {
    return NextResponse.json(
      { error: "Məzənnələr hazırda əlçatan deyil. Bir az sonra yenidən cəhd edin." },
      { status: 502 },
    );
  }

  const payload: RatesPayload = {
    base: "AZN",
    updatedAt,
    rates,
    source: { fiat: fiatOk, crypto: cryptoOk },
  };
  return NextResponse.json(payload);
}
