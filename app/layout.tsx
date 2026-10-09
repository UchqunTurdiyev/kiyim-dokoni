import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import MetaPixel from "@/components/MetaPixel";
import { site } from "@/lib/site";
import "./globals.css";

const font = Montserrat({ subsets: ["latin", "cyrillic"], weight: ["400", "500", "600", "700", "800"] });

export const metadata: Metadata = {
  title: `${site.name} — ${site.title}`,
  description: site.offer,
};

export const viewport: Viewport = { themeColor: "#111111", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz">
      <body className={font.className}>
        <MetaPixel />
        {children}
      </body>
    </html>
  );
}
