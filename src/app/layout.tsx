import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Çevir — Valyuta Çevirici",
  description:
    "Çevir — istənilən valyutadan istənilən valyutaya canlı çevirici. 170+ dünya valyutası və populyar kriptovalyutalar, real vaxtda məzənnə ilə.",
  applicationName: "Çevir",
  authors: [{ name: "Goshgar Hasanzadeh", url: "https://github.com/goshgarhasanov" }],
  keywords: ["valyuta çevirici", "məzənnə", "manat", "AZN", "USD", "kripto", "Azərbaycan", "currency converter"],
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
