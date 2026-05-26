"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getMeta,
  DEFAULT_FEATURED,
  POPULAR_ORDER,
  type CurrencyType,
} from "@/lib/currencies";
import { fetchRates, type RatesResult } from "@/lib/rates";

type RatesResponse = RatesResult;

const STORAGE_KEY = "manat:featured";

/** Dəyəri Azərbaycan formatında göstər (kripto üçün daha çox onluq). */
function formatValue(value: number, type: CurrencyType): string {
  if (!isFinite(value)) return "—";
  if (value === 0) return "0";
  if (type === "crypto") {
    const digits = value >= 1 ? 4 : value >= 0.01 ? 6 : 8;
    return value.toLocaleString("az-AZ", { maximumFractionDigits: digits });
  }
  return value.toLocaleString("az-AZ", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function sortByPopularity(a: string, b: string): number {
  const ia = POPULAR_ORDER.indexOf(a);
  const ib = POPULAR_ORDER.indexOf(b);
  const oa = ia === -1 ? 999 : ia;
  const ob = ib === -1 ? 999 : ib;
  return oa - ob || a.localeCompare(b);
}

export default function Page() {
  const [amount, setAmount] = useState("100");
  const [data, setData] = useState<RatesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [featured, setFeatured] = useState<string[]>(DEFAULT_FEATURED);
  const [showAll, setShowAll] = useState(false);
  const [query, setQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  // localStorage-dan seçilmişləri oxu (yalnız brauzerdə).
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const arr = JSON.parse(saved);
        if (Array.isArray(arr) && arr.every((x) => typeof x === "string")) {
          setFeatured(arr);
        }
      }
    } catch {
      /* localStorage əlçatan deyilsə, default qalır */
    }
  }, []);

  // Seçilmişlər dəyişdikcə yadda saxla.
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(featured));
    } catch {
      /* yazıla bilmədi — kritik deyil */
    }
  }, [featured, mounted]);

  async function loadRates() {
    setLoading(true);
    setError(null);
    try {
      const json = await fetchRates();
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Naməlum xəta baş verdi.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRates();
  }, []);

  const amountNum = useMemo(() => {
    const n = parseFloat(amount.replace(/\s/g, "").replace(",", "."));
    return isFinite(n) ? n : 0;
  }, [amount]);

  // Bütün valyuta kodları (bazadan başqa), populyarlığa görə sıralı.
  const allCodes = useMemo(() => {
    if (!data) return [];
    return Object.keys(data.rates)
      .filter((c) => c !== "AZN")
      .sort(sortByPopularity);
  }, [data]);

  const featuredCodes = useMemo(
    () => featured.filter((c) => data?.rates[c] !== undefined),
    [featured, data],
  );

  const visibleCodes = useMemo(() => {
    if (!showAll) return featuredCodes;
    const q = query.trim().toLowerCase();
    if (!q) return allCodes;
    return allCodes.filter((code) => {
      const meta = getMeta(code);
      return (
        code.toLowerCase().includes(q) || meta.name.toLowerCase().includes(q)
      );
    });
  }, [showAll, featuredCodes, allCodes, query]);

  function toggleFeatured(code: string) {
    setFeatured((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-8 sm:pt-12">
      {/* Başlıq */}
      <header className="mb-8 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-2xl font-black text-slate-950 shadow-lg shadow-emerald-500/20">
            ₼
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              Manat Çevirici
            </h1>
            <p className="mt-0.5 text-sm text-slate-400">
              Canlı məzənnə ilə valyuta və kripto çevirici
            </p>
          </div>
        </div>
        <button
          onClick={loadRates}
          disabled={loading}
          title="Məzənnələri yenilə"
          className="flex-none rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-700/60 disabled:opacity-40"
        >
          <span className={loading ? "inline-block animate-spin" : ""}>↻</span>{" "}
          Yenilə
        </button>
      </header>

      {/* Daxiletmə xanası */}
      <section className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl shadow-black/20">
        <label
          htmlFor="amount"
          className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400"
        >
          Məbləğ (Azərbaycan manatı)
        </label>
        <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3 transition focus-within:border-emerald-500/70 focus-within:ring-2 focus-within:ring-emerald-500/20">
          <span className="text-3xl font-black text-emerald-400">₼</span>
          <input
            id="amount"
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d.,]/g, ""))}
            placeholder="0"
            autoComplete="off"
            className="w-full bg-transparent text-3xl font-bold text-white outline-none placeholder:text-slate-600"
          />
          <span className="flex-none text-sm font-semibold text-slate-500">
            AZN
          </span>
        </div>
      </section>

      {/* İdarəetmə zolağı */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-slate-300">
          {showAll
            ? "Bütün valyutalar"
            : `Seçilmiş valyutalar (${featuredCodes.length})`}
        </h2>
        <button
          onClick={() => {
            setShowAll((v) => !v);
            setQuery("");
          }}
          className="rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-1.5 text-sm text-emerald-300 transition hover:bg-slate-700/60"
        >
          {showAll
            ? "← Yalnız seçilmişlər"
            : `Hamısını göstər${allCodes.length ? ` (${allCodes.length})` : ""}`}
        </button>
      </div>

      {/* Axtarış (yalnız "hamısı" rejimində) */}
      {showAll && (
        <div className="mb-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Valyuta axtar — məs. dollar, USD, rubl…"
            className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-2.5 text-sm text-white outline-none transition focus:border-emerald-500/70 placeholder:text-slate-600"
          />
        </div>
      )}

      {/* Vəziyyətlər */}
      {loading && !data && (
        <p className="py-10 text-center text-slate-400">Məzənnələr yüklənir…</p>
      )}
      {error && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          ⚠ {error}
        </div>
      )}

      {/* Boş seçim halı */}
      {data && !showAll && featuredCodes.length === 0 && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-8 text-center text-slate-400">
          Seçilmiş valyuta yoxdur.
          <button
            onClick={() => setShowAll(true)}
            className="ml-1 text-emerald-300 underline-offset-2 hover:underline"
          >
            Valyuta əlavə et
          </button>
        </div>
      )}

      {/* Valyuta siyahısı */}
      {data && visibleCodes.length > 0 && (
        <div className="grid gap-2.5 sm:grid-cols-2">
          {visibleCodes.map((code) => {
            const meta = getMeta(code);
            const rate = data.rates[code];
            const isFav = featured.includes(code);
            return (
              <div
                key={code}
                className="group flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/50 p-3.5 transition hover:border-slate-700 hover:bg-slate-900"
              >
                <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-slate-800 text-xl">
                  {meta.flag}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{code}</span>
                    {meta.type === "crypto" && (
                      <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-300">
                        kripto
                      </span>
                    )}
                  </div>
                  <div className="truncate text-xs text-slate-400">
                    {meta.name}
                  </div>
                </div>
                <div className="flex-none text-right">
                  <div className="font-bold tabular-nums text-emerald-300">
                    {formatValue(amountNum * rate, meta.type)}
                  </div>
                  <div className="text-[11px] tabular-nums text-slate-500">
                    1 ₼ = {formatValue(rate, meta.type)}
                  </div>
                </div>
                <button
                  onClick={() => toggleFeatured(code)}
                  title={
                    isFav ? "Seçilmişlərdən çıxar" : "Seçilmişlərə əlavə et"
                  }
                  className={`flex-none rounded-lg p-1.5 text-lg transition ${
                    isFav
                      ? "text-amber-400 hover:text-amber-300"
                      : "text-slate-600 hover:text-slate-300"
                  }`}
                >
                  {isFav ? "★" : "☆"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* "Hamısı" rejimində heç nə tapılmadı */}
      {data && showAll && visibleCodes.length === 0 && (
        <p className="py-8 text-center text-slate-400">
          “{query}” üzrə valyuta tapılmadı.
        </p>
      )}

      {/* Altbilgi */}
      <footer className="mt-10 space-y-1 text-center text-xs text-slate-500">
        {data && (
          <p>
            Son yeniləmə:{" "}
            {new Date(data.updatedAt).toLocaleString("az-AZ")}
            {!data.source.crypto && " · kripto məzənnələri müvəqqəti əlçatan deyil"}
          </p>
        )}
        <p>
          Mənbə: open.er-api.com (valyuta) · CoinGecko (kripto). Məzənnələr
          məlumat xarakterlidir.
        </p>
      </footer>
    </main>
  );
}
