"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getMeta,
  DEFAULT_FEATURED,
  POPULAR_ORDER,
  type CurrencyType,
} from "@/lib/currencies";
import { fetchRates, type RatesResult } from "@/lib/rates";

const STORAGE_KEY = "manat:featured";
const QUICK_AMOUNTS = [1, 10, 50, 100, 500, 1000];

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
  return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib) || a.localeCompare(b);
}

export default function Page() {
  const [amount, setAmount] = useState("100");
  const [data, setData] = useState<RatesResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [featured, setFeatured] = useState<string[]>(DEFAULT_FEATURED);
  const [showAll, setShowAll] = useState(false);
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

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
      /* localStorage yoxdur */
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(featured));
    } catch {
      /* yazıla bilmədi */
    }
  }, [featured, mounted]);

  async function loadRates() {
    setLoading(true);
    setError(null);
    try {
      setData(await fetchRates());
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

  function copyValue(code: string, value: number, type: CurrencyType) {
    const text = formatValue(value, type).replace(/\s/g, "");
    navigator.clipboard
      ?.writeText(text)
      .then(() => {
        setCopied(code);
        setTimeout(() => setCopied((c) => (c === code ? null : c)), 1200);
      })
      .catch(() => {});
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-4 sm:px-6">
      {/* ── Hero ───────────────────────────────────────────────── */}
      <header className="flex items-start justify-between gap-3 pt-7 sm:pt-10">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-2xl font-black text-slate-950 shadow-lg shadow-emerald-500/25">
            ₼
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white sm:text-2xl">
              Manat Çevirici
            </h1>
            <p className="mt-0.5 flex items-center gap-1.5 text-[13px] text-slate-400">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              Canlı məzənnə
            </p>
          </div>
        </div>
        <button
          onClick={loadRates}
          disabled={loading}
          aria-label="Məzənnələri yenilə"
          className="flex-none rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-200 transition active:scale-95 hover:bg-white/10 disabled:opacity-40"
        >
          <span className={"inline-block " + (loading ? "animate-spin" : "")}>↻</span>
        </button>
      </header>

      {/* ── Sticky çevirici (həmişə görünür) ───────────────────── */}
      <div className="sticky top-0 z-20 -mx-4 mt-5 border-b border-white/5 bg-[#05080e]/80 px-4 pb-4 pt-4 backdrop-blur-xl sm:-mx-6 sm:px-6">
        <label htmlFor="amount" className="sr-only">
          Manat məbləği
        </label>
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 transition focus-within:border-emerald-500/60 focus-within:bg-white/[0.06] focus-within:ring-2 focus-within:ring-emerald-500/15">
          <span className="text-2xl font-black text-emerald-400 sm:text-3xl">₼</span>
          <input
            id="amount"
            type="text"
            inputMode="decimal"
            enterKeyHint="done"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d.,]/g, ""))}
            placeholder="0"
            autoComplete="off"
            aria-label="Manat məbləği"
            className="tnum w-full min-w-0 bg-transparent text-2xl font-bold text-white outline-none placeholder:text-slate-600 sm:text-3xl"
          />
          {amount && (
            <button
              onClick={() => setAmount("")}
              aria-label="Təmizlə"
              className="flex-none rounded-full p-1.5 text-slate-500 transition active:scale-90 hover:bg-white/10 hover:text-slate-200"
            >
              ✕
            </button>
          )}
          <span className="flex-none text-sm font-semibold text-slate-500">AZN</span>
        </div>

        {/* Sürətli məbləğlər */}
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {QUICK_AMOUNTS.map((q) => {
            const active = amountNum === q;
            return (
              <button
                key={q}
                onClick={() => setAmount(String(q))}
                className={
                  "rounded-full px-3 py-1.5 text-xs font-semibold tabular-nums transition active:scale-95 " +
                  (active
                    ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40"
                    : "bg-white/5 text-slate-300 hover:bg-white/10")
                }
              >
                {q.toLocaleString("az-AZ")} ₼
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Toolbar ────────────────────────────────────────────── */}
      <div className="mb-3 mt-5 flex items-center justify-between gap-3">
        <div
          role="tablist"
          aria-label="Görünüş"
          className="inline-flex rounded-xl border border-white/10 bg-white/5 p-1 text-sm"
        >
          <button
            role="tab"
            aria-selected={!showAll}
            onClick={() => {
              setShowAll(false);
              setQuery("");
            }}
            className={
              "rounded-lg px-3 py-1.5 font-medium transition " +
              (!showAll ? "bg-emerald-500/20 text-emerald-200" : "text-slate-400 hover:text-slate-200")
            }
          >
            Seçilmişlər
            <span className="ml-1 text-xs opacity-70">{featuredCodes.length}</span>
          </button>
          <button
            role="tab"
            aria-selected={showAll}
            onClick={() => setShowAll(true)}
            className={
              "rounded-lg px-3 py-1.5 font-medium transition " +
              (showAll ? "bg-emerald-500/20 text-emerald-200" : "text-slate-400 hover:text-slate-200")
            }
          >
            Hamısı
            {allCodes.length > 0 && (
              <span className="ml-1 text-xs opacity-70">{allCodes.length}</span>
            )}
          </button>
        </div>
      </div>

      {/* Axtarış */}
      {showAll && (
        <div className="mb-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Axtar — dollar, USD, rubl…"
            aria-label="Valyuta axtar"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition focus:border-emerald-500/60 focus:bg-white/[0.07] placeholder:text-slate-600"
          />
        </div>
      )}

      {/* ── Məzmun ─────────────────────────────────────────────── */}
      <div className="flex-1">
        {loading && !data && (
          <div className="grid gap-2.5 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-3.5"
              >
                <div className="h-10 w-10 flex-none animate-pulse rounded-xl bg-white/10" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-16 animate-pulse rounded bg-white/10" />
                  <div className="h-2.5 w-24 animate-pulse rounded bg-white/5" />
                </div>
                <div className="h-4 w-14 animate-pulse rounded bg-white/10" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            ⚠ {error}
          </div>
        )}

        {data && !showAll && featuredCodes.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-10 text-center text-slate-400">
            Seçilmiş valyuta yoxdur.
            <button
              onClick={() => setShowAll(true)}
              className="ml-1 font-semibold text-emerald-300 underline-offset-2 hover:underline"
            >
              Valyuta əlavə et →
            </button>
          </div>
        )}

        {data && visibleCodes.length > 0 && (
          <div className="grid gap-2.5 sm:grid-cols-2">
            {visibleCodes.map((code) => {
              const meta = getMeta(code);
              const rate = data.rates[code];
              const isFav = featured.includes(code);
              const isCopied = copied === code;
              return (
                <div
                  key={code}
                  className="group flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-3.5 transition hover:border-white/15 hover:bg-white/[0.06]"
                >
                  <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-white/5 text-xl">
                    {meta.flag}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white">{code}</span>
                      {meta.type === "crypto" && (
                        <span className="rounded bg-amber-500/15 px-1.5 py-px text-[10px] font-bold uppercase tracking-wide text-amber-300">
                          kripto
                        </span>
                      )}
                    </div>
                    <div className="truncate text-xs text-slate-400">{meta.name}</div>
                  </div>

                  {/* Dəyər — toxunaraq kopyala */}
                  <button
                    onClick={() => copyValue(code, amountNum * rate, meta.type)}
                    aria-label={`${code} dəyərini kopyala`}
                    className="flex-none text-right transition active:scale-95"
                  >
                    <div className="tnum font-bold text-emerald-300">
                      {isCopied ? "✓ kopyalandı" : formatValue(amountNum * rate, meta.type)}
                    </div>
                    <div className="tnum text-[11px] text-slate-500">
                      1 ₼ = {formatValue(rate, meta.type)}
                    </div>
                  </button>

                  <button
                    onClick={() => toggleFeatured(code)}
                    aria-label={isFav ? "Seçilmişlərdən çıxar" : "Seçilmişlərə əlavə et"}
                    aria-pressed={isFav}
                    className={
                      "flex h-10 w-10 flex-none items-center justify-center rounded-xl text-lg transition active:scale-90 " +
                      (isFav
                        ? "text-amber-400 hover:bg-amber-400/10"
                        : "text-slate-600 hover:bg-white/5 hover:text-slate-300")
                    }
                  >
                    {isFav ? "★" : "☆"}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {data && showAll && visibleCodes.length === 0 && (
          <p className="py-10 text-center text-slate-400">
            “{query}” üzrə valyuta tapılmadı.
          </p>
        )}
      </div>

      {/* ── Altbilgi ───────────────────────────────────────────── */}
      <footer className="mt-10 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-6">
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-amber-500/15 bg-amber-500/[0.04] px-4 py-5 text-center">
          <p className="text-sm text-slate-300">
            Bu alət faydalı oldusa, bir qəhvə ilə dəstək ola bilərsən ☕
          </p>
          <a
            href="https://kofe.al/goshgarhasanov"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 px-5 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition active:scale-95 hover:brightness-110"
          >
            ☕ Mənə qəhvə al
          </a>
        </div>

        <div className="mt-5 space-y-1 text-center text-xs text-slate-500">
          {data && (
            <p className="tnum">
              Son yeniləmə: {new Date(data.updatedAt).toLocaleString("az-AZ")}
              {!data.source.crypto && " · kripto müvəqqəti əlçatan deyil"}
            </p>
          )}
          <p>Mənbə: open.er-api.com · CoinGecko — məlumat xarakterlidir.</p>
          <p className="pt-1 text-slate-400">
            Developed by{" "}
            <a
              href="https://github.com/goshgarhasanov"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-slate-300 underline-offset-2 hover:text-emerald-300 hover:underline"
            >
              Goshgar Hasanzadeh
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
