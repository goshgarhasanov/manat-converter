// Pulsuz, açar tələb etməyən ziyarət sayğacı (abacus.jasoncameron.dev).
// Statik sayt üçün — öz backend lazım deyil. Xəta olarsa səssizcə gizlənir.
//
// /hit/<ns>/<key> → artırır və {value} qaytarır
// /get/<ns>/<key> → artırmadan oxuyur
//
// Hər brauzer sessiyası gün ərzində yalnız bir dəfə sayılır (sessionStorage).

const NS = "cevir-goshgarhasanov";
const BASE = "https://abacus.jasoncameron.dev";

export interface VisitStats {
  total: number;
  today: number;
}

function dayKey(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `day${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}`;
}

async function call(path: string): Promise<number | null> {
  try {
    const r = await fetch(`${BASE}${path}`, { cache: "no-store" });
    if (!r.ok) return null;
    const j = await r.json();
    return typeof j.value === "number" ? j.value : null;
  } catch {
    return null;
  }
}

export async function loadVisitStats(): Promise<VisitStats | null> {
  const dk = dayKey();
  const sessionKey = `cevir:counted:${dk}`;
  let countedToday = false;
  try {
    countedToday = sessionStorage.getItem(sessionKey) === "1";
  } catch {
    /* sessionStorage yoxdur */
  }
  const verb = countedToday ? "get" : "hit";
  const [total, today] = await Promise.all([
    call(`/${verb}/${NS}/total`),
    call(`/${verb}/${NS}/${dk}`),
  ]);
  if (!countedToday) {
    try {
      sessionStorage.setItem(sessionKey, "1");
    } catch {
      /* yazıla bilmədi */
    }
  }
  if (total == null && today == null) return null;
  return { total: total ?? 0, today: today ?? 0 };
}
