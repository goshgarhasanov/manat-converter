"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getMeta,
  DEFAULT_FEATURED,
  POPULAR_ORDER,
  type CurrencyType,
} from "@/lib/currencies";
import { fetchRates, type RatesResult } from "@/lib/rates";

const KEY_FEATURED = "cevir:featured";
const KEY_BASE = "cevir:base";
const QUICK_AMOUNTS = [1, 10, 50, 100, 500, 1000];
const MAX_FEATURED = 5; // seçilmişlər siyahısı ən çox 5 valyuta saxlayır

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

// ─── Rəqəmi Azərbaycan dilində sözlə yazma ──────────────────────────────
const AZ_ONES = ["", "bir", "iki", "üç", "dörd", "beş", "altı", "yeddi", "səkkiz", "doqquz"];
const AZ_TENS = ["", "on", "iyirmi", "otuz", "qırx", "əlli", "altmış", "yetmiş", "səksən", "doxsan"];
const AZ_SCALES = ["", "min", "milyon", "milyard"];

function azThreeDigits(n: number): string {
  const h = Math.floor(n / 100);
  const t = Math.floor((n % 100) / 10);
  const o = n % 10;
  const parts: string[] = [];
  if (h) parts.push(h === 1 ? "yüz" : AZ_ONES[h] + " yüz");
  if (t) parts.push(AZ_TENS[t]);
  if (o) parts.push(AZ_ONES[o]);
  return parts.join(" ");
}

function azInteger(num: number): string {
  if (num === 0) return "sıfır";
  const groups: number[] = [];
  let n = num;
  while (n > 0) {
    groups.push(n % 1000);
    n = Math.floor(n / 1000);
  }
  const parts: string[] = [];
  for (let i = groups.length - 1; i >= 0; i--) {
    const g = groups[i];
    if (!g) continue;
    if (i === 0) parts.push(azThreeDigits(g));
    else if (i === 1 && g === 1) parts.push("min"); // 1000 → "min", "bir min" deyil
    else parts.push(azThreeDigits(g) + " " + AZ_SCALES[i]);
  }
  return parts.join(" ");
}

// Fiat dəyərini sözlə: tam hissə + (varsa) "tam" + qəpik hissəsi. İlk hərf böyük.
function valueToWords(value: number): string {
  if (!isFinite(value) || value < 0) return "";
  const intPart = Math.floor(value + 1e-9);
  if (intPart >= 1e12) return ""; // çox böyük rəqəm sözlə yazılmır
  const frac = Math.round((value - intPart) * 100);
  let w = azInteger(intPart);
  if (frac > 0) w += " tam " + azInteger(frac);
  return w.charAt(0).toUpperCase() + w.slice(1);
}

function sortByPopularity(a: string, b: string): number {
  const ia = POPULAR_ORDER.indexOf(a);
  const ib = POPULAR_ORDER.indexOf(b);
  return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib) || a.localeCompare(b);
}

// Məbləği etibarlı şəkildə oxu: sonuncu "," və ya "." onluq sayılır,
// qalan ayırıcılar (minlik) silinir. Beləcə "1.000,50" → 1000.5, "1,234.56" → 1234.56.
function parseAmount(raw: string): number {
  const cleaned = raw.replace(/\s/g, "");
  if (!cleaned) return 0;
  const lastSep = Math.max(cleaned.lastIndexOf(","), cleaned.lastIndexOf("."));
  const normalized =
    lastSep === -1
      ? cleaned
      : `${cleaned.slice(0, lastSep).replace(/[.,]/g, "")}.${cleaned
          .slice(lastSep + 1)
          .replace(/[.,]/g, "")}`;
  const n = parseFloat(normalized);
  return isFinite(n) && n >= 0 ? n : 0;
}

// Valyuta kodu/adı axtarış sorğusuna uyğun gəlirmi.
function matches(code: string, q: string): boolean {
  const s = q.trim().toLowerCase();
  if (!s) return true;
  return code.toLowerCase().includes(s) || getMeta(code).name.toLowerCase().includes(s);
}

export default function Page() {
  const [amount, setAmount] = useState("100");
  const [base, setBase] = useState("AZN");
  const [data, setData] = useState<RatesResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [featured, setFeatured] = useState<string[]>(DEFAULT_FEATURED);
  const [showAll, setShowAll] = useState(false);
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerQuery, setPickerQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState<Date | null>(null);

  // localStorage oxu (yalnız brauzerdə)
  useEffect(() => {
    setMounted(true);
    try {
      const savedF = localStorage.getItem(KEY_FEATURED);
      if (savedF) {
        const arr = JSON.parse(savedF);
        if (Array.isArray(arr) && arr.every((x) => typeof x === "string")) {
          setFeatured([...new Set<string>(arr)].slice(0, MAX_FEATURED));
        }
      }
      const savedB = localStorage.getItem(KEY_BASE);
      if (savedB && /^[A-Z]{2,5}$/.test(savedB)) setBase(savedB);
    } catch {
      /* localStorage yoxdur */
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(KEY_FEATURED, JSON.stringify(featured));
    } catch {
      /* yazıla bilmədi */
    }
  }, [featured, mounted]);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(KEY_BASE, base);
    } catch {
      /* yazıla bilmədi */
    }
  }, [base, mounted]);

  // Modal açıq olanda arxa fonun sürüşməsini blokla + Escape ilə bağla
  useEffect(() => {
    if (!pickerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPickerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [pickerOpen]);

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

  // Canlı saat (hidrasiya sıçrayışı olmasın deyə yalnız brauzerdə işləyir).
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Baza valyutası məzənnələrdə yoxdursa (köhnə localStorage) AZN-ə qayıt.
  useEffect(() => {
    if (data && base !== "AZN" && data.rates[base] === undefined) setBase("AZN");
  }, [data, base]);

  const amountNum = useMemo(() => parseAmount(amount), [amount]);

  // Bütün kodlar (AZN daxil) — baza seçimi üçün.
  const allCodes = useMemo(() => {
    if (!data) return [];
    return Object.keys(data.rates).sort(sortByPopularity);
  }, [data]);

  // Seçilmiş baza məzənnəsi (1 AZN = rates[base]). base=AZN → 1.
  const baseRate = data?.rates[base] ?? 0;
  const baseValid = baseRate > 0;

  // Hədəf valyutalar — BAZA istisna olunur (özü-özünə çevrilmə göstərilməsin).
  const featuredTargets = useMemo(
    () =>
      featured.filter(
        (c) => c !== base && data?.rates[c] !== undefined,
      ),
    [featured, base, data],
  );

  const visibleTargets = useMemo(() => {
    if (!showAll) return featuredTargets;
    return allCodes.filter((c) => c !== base && matches(c, query));
  }, [showAll, featuredTargets, allCodes, base, query]);

  function convert(code: string): number {
    if (!data || !baseValid) return NaN;
    return (amountNum * data.rates[code]) / baseRate;
  }

  function showNotice(msg: string) {
    setNotice(msg);
    window.setTimeout(() => setNotice((n) => (n === msg ? null : n)), 2200);
  }

  function toggleFeatured(code: string) {
    if (featured.includes(code)) {
      setFeatured(featured.filter((c) => c !== code));
      return;
    }
    if (featured.length >= MAX_FEATURED) {
      showNotice(`Maksimum ${MAX_FEATURED} valyuta seçilə bilər — əvvəlcə birini çıxarın.`);
      return;
    }
    setFeatured([...featured, code]);
  }

  function chooseBase(code: string) {
    setBase(code);
    setPickerOpen(false);
    setPickerQuery("");
  }

  function copyValue(code: string, value: number, type: CurrencyType) {
    if (!isFinite(value)) return;
    navigator.clipboard
      ?.writeText(formatValue(value, type).replace(/\s/g, ""))
      .then(() => {
        setCopied(code);
        setTimeout(() => setCopied((c) => (c === code ? null : c)), 1200);
      })
      .catch(() => {});
  }

  const atLimit = featured.length >= MAX_FEATURED;
  const baseMeta = getMeta(base);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-4 sm:px-6">
      {/* ── Tarix və canlı saat ────────────────────────────────── */}
      <div className="flex justify-center pt-6">
        {now ? (
          <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 shadow-lg shadow-black/20">
            <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/30">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <polyline points="12 7 12 12 15 14" />
              </svg>
            </span>
            <div className="text-left">
              <div className="tnum bg-gradient-to-r from-cyan-300 to-emerald-300 bg-clip-text text-2xl font-black leading-none text-transparent sm:text-3xl">
                {now.toLocaleTimeString("az-AZ", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </div>
              <div className="mt-1.5 flex items-center gap-1.5 text-xs font-medium capitalize text-slate-400">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 flex-none text-violet-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                {now.toLocaleDateString("az-AZ", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </div>
            </div>
          </div>
        ) : (
          // Yer tutucu — hidrasiya sıçrayışının qarşısını alır
          <div className="h-[68px]" />
        )}
      </div>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <header className="mt-6 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-2xl font-black text-slate-950 shadow-lg shadow-emerald-500/25">
            ⇄
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white sm:text-2xl">
              Çevir
            </h1>
            <p className="mt-0.5 flex items-center gap-1.5 text-[13px] text-slate-400">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              Valyuta çevirici · canlı məzənnə
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

      {/* ── Sticky çevirici ────────────────────────────────────── */}
      <div className="sticky top-0 z-20 -mx-4 mt-5 border-b border-white/5 bg-[#05080e]/80 px-4 pb-4 pt-4 backdrop-blur-xl sm:-mx-6 sm:px-6">
        <div className="flex items-stretch gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-2 transition focus-within:border-emerald-500/60 focus-within:bg-white/[0.06] focus-within:ring-2 focus-within:ring-emerald-500/15">
          {/* Baza valyutası seçici */}
          <button
            onClick={() => setPickerOpen(true)}
            aria-label="Baza valyutasını seç"
            className="flex flex-none items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-left transition active:scale-95 hover:bg-white/10"
          >
            <span className="text-xl leading-none">{baseMeta.flag}</span>
            <span className="font-bold text-white">{base}</span>
            <span className="text-slate-500">⌄</span>
          </button>

          <label htmlFor="amount" className="sr-only">
            Məbləğ
          </label>
          <input
            id="amount"
            type="text"
            inputMode="decimal"
            enterKeyHint="done"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d.,]/g, ""))}
            placeholder="0"
            autoComplete="off"
            aria-label="Məbləğ"
            className="tnum w-full min-w-0 bg-transparent px-1 text-2xl font-bold text-white outline-none placeholder:text-slate-600 sm:text-3xl"
          />
          {amount && (
            <button
              onClick={() => setAmount("")}
              aria-label="Təmizlə"
              className="flex-none self-center rounded-full p-1.5 text-slate-500 transition active:scale-90 hover:bg-white/10 hover:text-slate-200"
            >
              ✕
            </button>
          )}
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
                {q.toLocaleString("az-AZ")}
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
            <span
              className={
                "ml-1 text-xs " + (atLimit ? "font-bold text-amber-300" : "opacity-70")
              }
            >
              {featured.length}/{MAX_FEATURED}
            </span>
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

        {data && !showAll && featuredTargets.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-10 text-center text-slate-400">
            Göstəriləcək valyuta yoxdur.
            <button
              onClick={() => setShowAll(true)}
              className="ml-1 font-semibold text-emerald-300 underline-offset-2 hover:underline"
            >
              Valyuta əlavə et →
            </button>
          </div>
        )}

        {data && visibleTargets.length > 0 && (
          <div className="grid gap-2.5 sm:grid-cols-2">
            {visibleTargets.map((code) => {
              const meta = getMeta(code);
              const value = convert(code);
              const unit = baseValid ? data.rates[code] / baseRate : NaN;
              const isFav = featured.includes(code);
              const isCopied = copied === code;
              const lockedOut = !isFav && atLimit;
              const words = meta.type === "fiat" && amountNum > 0 ? valueToWords(value) : "";
              return (
                <div
                  key={code}
                  className="group rounded-2xl border border-white/[0.07] bg-white/[0.03] p-3.5 transition hover:border-white/15 hover:bg-white/[0.06]"
                >
                  <div className="flex items-center gap-3">
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

                    <button
                      onClick={() => copyValue(code, value, meta.type)}
                      aria-label={`${code} dəyərini kopyala`}
                      className="flex-none text-right transition active:scale-95"
                    >
                      <div className="tnum font-bold text-emerald-300">
                        {isCopied ? "✓ kopyalandı" : formatValue(value, meta.type)}
                      </div>
                      <div className="tnum text-[11px] text-slate-500">
                        1 {base} = {formatValue(unit, meta.type)}
                      </div>
                    </button>

                    <button
                      onClick={() => toggleFeatured(code)}
                      aria-label={isFav ? "Seçilmişlərdən çıxar" : "Seçilmişlərə əlavə et"}
                      aria-pressed={isFav}
                      title={
                        isFav
                          ? "Seçilmişlərdən çıxar"
                          : lockedOut
                            ? `Limit dolub (${MAX_FEATURED}/${MAX_FEATURED})`
                            : "Seçilmişlərə əlavə et"
                      }
                      className={
                        "flex h-10 w-10 flex-none items-center justify-center rounded-xl transition active:scale-90 " +
                        (isFav
                          ? "text-rose-400 hover:bg-rose-500/10"
                          : lockedOut
                            ? "text-slate-700"
                            : "text-emerald-400 hover:bg-emerald-500/10")
                      }
                    >
                      {isFav ? (
                        // Zibil qutusu — seçilmişlərdən çıxar
                        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          <line x1="10" y1="11" x2="10" y2="17" />
                          <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                      ) : (
                        // Plus — seçilmişlərə əlavə et
                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {words && (
                    <div className="mt-2.5 border-t border-white/5 pt-2 text-[11px] italic text-slate-500">
                      {words}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {data && showAll && visibleTargets.length === 0 && (
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

        {/* Rəngli, gözə çarpan müəllif krediti */}
        <div className="mt-6 flex justify-center">
          <a
            href="https://github.com/goshgarhasanov"
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 transition hover:border-emerald-400/30 hover:bg-white/[0.06]"
          >
            <span className="text-xs font-medium text-slate-400">Developed by</span>
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400 bg-clip-text text-sm font-extrabold tracking-tight text-transparent">
              Goshgar Hasanzadeh
            </span>
            <span className="text-sm transition group-hover:rotate-12">✦</span>
          </a>
        </div>

        <div className="mt-5 space-y-1 text-center text-[11px] text-slate-500">
          {data && (
            <p className="tnum">
              Son yeniləmə: {new Date(data.updatedAt).toLocaleString("az-AZ")}
              {!data.source.crypto && " · kripto müvəqqəti əlçatan deyil"}
            </p>
          )}
          <p>© {new Date().getFullYear()} Çevir · Bütün hüquqlar qorunur</p>
        </div>
      </footer>

      {/* ── Baza valyutası seçici (modal) ──────────────────────── */}
      {pickerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
          onClick={() => setPickerOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Baza valyutasını seç"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-[#0a0f18] shadow-2xl sm:rounded-3xl"
          >
            <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
              <h2 className="font-bold text-white">Baza valyutası</h2>
              <button
                onClick={() => setPickerOpen(false)}
                aria-label="Bağla"
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="p-3">
              <input
                type="text"
                value={pickerQuery}
                onChange={(e) => setPickerQuery(e.target.value)}
                placeholder="Axtar — manat, USD, rubl…"
                autoFocus
                aria-label="Baza valyutası axtar"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition focus:border-emerald-500/60 placeholder:text-slate-600"
              />
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
              {allCodes
                .filter((code) => matches(code, pickerQuery))
                .map((code) => {
                  const meta = getMeta(code);
                  const selected = code === base;
                  return (
                    <button
                      key={code}
                      onClick={() => chooseBase(code)}
                      className={
                        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition " +
                        (selected ? "bg-emerald-500/15" : "hover:bg-white/5")
                      }
                    >
                      <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-white/5 text-lg">
                        {meta.flag}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-bold text-white">{code}</span>
                        <span className="block truncate text-xs text-slate-400">
                          {meta.name}
                        </span>
                      </span>
                      {selected && <span className="text-emerald-400">✓</span>}
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* ── Toast (limit bildirişi) ────────────────────────────── */}
      {notice && (
        <div className="pointer-events-none fixed inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-[60] flex justify-center px-4">
          <div className="pointer-events-auto rounded-xl border border-amber-500/30 bg-amber-500/15 px-4 py-2.5 text-sm font-medium text-amber-200 shadow-lg backdrop-blur">
            {notice}
          </div>
        </div>
      )}
    </div>
  );
}
