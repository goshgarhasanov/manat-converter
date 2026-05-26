import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Manat — Valyuta Çevirici",
  description:
    "Manat (AZN) əsaslı canlı valyuta çevirici. Bütün dünya valyutaları və populyar kriptovalyutalar — real vaxtda məzənnə ilə.",
  applicationName: "Manat Çevirici",
  authors: [{ name: "goshgarhasanov" }],
  keywords: ["manat", "AZN", "valyuta çevirici", "məzənnə", "kripto", "Azərbaycan"],
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
