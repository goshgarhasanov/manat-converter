// Valyuta metadatası — kodlar, Azərbaycan dilində adlar, bayraq/işarələr.
// API yalnız məzənnələri verir; ad və görünüş buradan götürülür.

export type CurrencyType = "fiat" | "crypto";

export interface CurrencyMeta {
  name: string; // Azərbaycan dilində ad
  flag: string; // bayraq emojisi (fiat) və ya işarə (kripto)
  type: CurrencyType;
}

// CoinGecko id → valyuta kodu. Kripto məzənnələri bu siyahıya görə çəkilir.
export const CRYPTO_IDS: Record<string, string> = {
  bitcoin: "BTC",
  ethereum: "ETH",
  tether: "USDT",
  "usd-coin": "USDC",
  binancecoin: "BNB",
  ripple: "XRP",
  solana: "SOL",
  tron: "TRX",
  dogecoin: "DOGE",
  "the-open-network": "TON",
  cardano: "ADA",
};

// İstifadəçi dəyişməyibsə, ön planda göstərilən 5 valyuta.
export const DEFAULT_FEATURED = ["USD", "USDT", "BTC", "RUB", "TRY"];

// "Hamısını göstər" siyahısında sıralama üçün populyarlıq ardıcıllığı.
export const POPULAR_ORDER = [
  "USD", "EUR", "RUB", "TRY", "GBP", "GEL", "IRR", "AED",
  "USDT", "BTC", "ETH", "USDC", "BNB", "XRP", "SOL", "TON", "TRX", "DOGE", "ADA",
];

export const CURRENCY_META: Record<string, CurrencyMeta> = {
  AZN: { name: "Azərbaycan manatı", flag: "🇦🇿", type: "fiat" },
  USD: { name: "ABŞ dolları", flag: "🇺🇸", type: "fiat" },
  EUR: { name: "Avro", flag: "🇪🇺", type: "fiat" },
  GBP: { name: "Britaniya funt sterlinqi", flag: "🇬🇧", type: "fiat" },
  RUB: { name: "Rusiya rublu", flag: "🇷🇺", type: "fiat" },
  TRY: { name: "Türk lirəsi", flag: "🇹🇷", type: "fiat" },
  GEL: { name: "Gürcüstan larisi", flag: "🇬🇪", type: "fiat" },
  IRR: { name: "İran rialı", flag: "🇮🇷", type: "fiat" },
  AED: { name: "BƏƏ dirhəmi", flag: "🇦🇪", type: "fiat" },
  SAR: { name: "Səudiyyə rialı", flag: "🇸🇦", type: "fiat" },
  QAR: { name: "Qatar rialı", flag: "🇶🇦", type: "fiat" },
  KWD: { name: "Küveyt dinarı", flag: "🇰🇼", type: "fiat" },
  CNY: { name: "Çin yuanı", flag: "🇨🇳", type: "fiat" },
  JPY: { name: "Yapon yeni", flag: "🇯🇵", type: "fiat" },
  KRW: { name: "Cənubi Koreya vonu", flag: "🇰🇷", type: "fiat" },
  INR: { name: "Hindistan rupisi", flag: "🇮🇳", type: "fiat" },
  CHF: { name: "İsveçrə frankı", flag: "🇨🇭", type: "fiat" },
  CAD: { name: "Kanada dolları", flag: "🇨🇦", type: "fiat" },
  AUD: { name: "Avstraliya dolları", flag: "🇦🇺", type: "fiat" },
  NZD: { name: "Yeni Zelandiya dolları", flag: "🇳🇿", type: "fiat" },
  KZT: { name: "Qazaxıstan tengəsi", flag: "🇰🇿", type: "fiat" },
  UAH: { name: "Ukrayna qrivnası", flag: "🇺🇦", type: "fiat" },
  AMD: { name: "Ermənistan dramı", flag: "🇦🇲", type: "fiat" },
  BYN: { name: "Belarus rublu", flag: "🇧🇾", type: "fiat" },
  UZS: { name: "Özbəkistan sumu", flag: "🇺🇿", type: "fiat" },
  TMT: { name: "Türkmənistan manatı", flag: "🇹🇲", type: "fiat" },
  KGS: { name: "Qırğızıstan somu", flag: "🇰🇬", type: "fiat" },
  TJS: { name: "Tacikistan somonisi", flag: "🇹🇯", type: "fiat" },
  PLN: { name: "Polşa zlotısı", flag: "🇵🇱", type: "fiat" },
  SEK: { name: "İsveç kronu", flag: "🇸🇪", type: "fiat" },
  NOK: { name: "Norveç kronu", flag: "🇳🇴", type: "fiat" },
  DKK: { name: "Danimarka kronu", flag: "🇩🇰", type: "fiat" },
  CZK: { name: "Çexiya kronu", flag: "🇨🇿", type: "fiat" },
  HUF: { name: "Macarıstan forinti", flag: "🇭🇺", type: "fiat" },
  RON: { name: "Rumıniya leyi", flag: "🇷🇴", type: "fiat" },
  BGN: { name: "Bolqarıstan levi", flag: "🇧🇬", type: "fiat" },
  ILS: { name: "İsrail şekeli", flag: "🇮🇱", type: "fiat" },
  EGP: { name: "Misir funtu", flag: "🇪🇬", type: "fiat" },
  ZAR: { name: "Cənubi Afrika randı", flag: "🇿🇦", type: "fiat" },
  HKD: { name: "Honkonq dolları", flag: "🇭🇰", type: "fiat" },
  SGD: { name: "Sinqapur dolları", flag: "🇸🇬", type: "fiat" },
  THB: { name: "Tayland bahtı", flag: "🇹🇭", type: "fiat" },
  MYR: { name: "Malayziya rinqiti", flag: "🇲🇾", type: "fiat" },
  IDR: { name: "İndoneziya rupisi", flag: "🇮🇩", type: "fiat" },
  PKR: { name: "Pakistan rupisi", flag: "🇵🇰", type: "fiat" },
  MXN: { name: "Meksika pesosu", flag: "🇲🇽", type: "fiat" },
  BRL: { name: "Braziliya realı", flag: "🇧🇷", type: "fiat" },

  // Kriptovalyutalar
  BTC: { name: "Bitkoin", flag: "₿", type: "crypto" },
  ETH: { name: "Ethereum", flag: "Ξ", type: "crypto" },
  USDT: { name: "Tether", flag: "₮", type: "crypto" },
  USDC: { name: "USD Coin", flag: "🔵", type: "crypto" },
  BNB: { name: "BNB", flag: "🟡", type: "crypto" },
  XRP: { name: "Ripple", flag: "🪙", type: "crypto" },
  SOL: { name: "Solana", flag: "◎", type: "crypto" },
  TON: { name: "Toncoin", flag: "💎", type: "crypto" },
  TRX: { name: "TRON", flag: "🪙", type: "crypto" },
  DOGE: { name: "Dogecoin", flag: "🐶", type: "crypto" },
  ADA: { name: "Cardano", flag: "🪙", type: "crypto" },
};

// Metadatası olmayan kodlar üçün ehtiyat dəyər.
export function getMeta(code: string): CurrencyMeta {
  return CURRENCY_META[code] ?? { name: code, flag: "🌐", type: "fiat" };
}
