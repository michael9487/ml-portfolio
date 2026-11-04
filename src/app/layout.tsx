import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Montserrat, Noto_Sans_TC } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { PortfolioProvider } from "@/components/PortfolioProvider";
import "./globals.css";

const sans = Noto_Sans_TC({ weight: ["400", "500", "700"], variable: "--font-noto-sans", preload: false });
const mono = IBM_Plex_Mono({ weight: ["400"], subsets: ["latin"], variable: "--font-plex-mono" });
const montserrat = Montserrat({ weight: ["400", "500", "600", "700"], subsets: ["latin"], variable: "--font-montserrat" });

const description = "半年的前端作品，畫成一張星圖。用 LINE 登入後可以收藏與投票，瀏覽統計即時更新。";

export const metadata: Metadata = {
  metadataBase: new URL("https://ml-chen-portfolio.vercel.app"),
  title: { default: "前端作品集 2026", template: "%s｜前端作品集 2026" },
  description,
  openGraph: {
    type: "website",
    locale: "zh_TW",
    siteName: "ML Web Developer",
    title: "前端作品集 2026｜ML Web Developer",
    description,
    url: "/",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { themeColor: "#090912" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant-TW" className={`${sans.variable} ${mono.variable} ${montserrat.variable}`}>
      <body>
        <PortfolioProvider>
          <Header />
          {children}
          <Footer />
        </PortfolioProvider>
      </body>
    </html>
  );
}
