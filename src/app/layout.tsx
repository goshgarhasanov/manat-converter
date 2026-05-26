import type { Metadata, Viewport } from "next";
import "./globals.css";

// GitHub Pages-də layihə /manat-converter alt-yolundadır; lokal dev-də boş.
const BP = process.env.NODE_ENV === "production" ? "/manat-converter" : "";

export const metadata: Metadata = {
  title: "Çevir — Valyuta Çevirici",
  description:
    "Çevir — istənilən valyutadan istənilən valyutaya canlı çevirici. 170+ dünya valyutası və populyar kriptovalyutalar, real vaxtda məzənnə ilə.",
  applicationName: "Çevir",
  authors: [{ name: "Goshgar Hasanzadeh", url: "https://github.com/goshgarhasanov" }],
  keywords: ["valyuta çevirici", "məzənnə", "manat", "AZN", "USD", "kripto", "Azərbaycan", "currency converter"],
  manifest: `${BP}/manifest.webmanifest`,
  icons: {
    icon: [
      { url: `${BP}/icons/favicon-32.png`, sizes: "32x32", type: "image/png" },
      { url: `${BP}/icons/icon-192.png`, sizes: "192x192", type: "image/png" },
      { url: `${BP}/icons/icon-512.png`, sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: `${BP}/icons/apple-icon-180.png`, sizes: "180x180" }],
  },
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Çevir" },
};

export const viewport: Viewport = {
  themeColor: "#060a12",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="az" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
