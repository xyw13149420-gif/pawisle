import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import "./globals.css";

/**
 * 标题用宋体（思源宋体 600，按项目实际用字做了子集，约 27KB）。
 * 正文仍是系统黑体——中文长段落用宋体会难读。
 */
const serif = localFont({
  src: "./fonts/pawisle-serif.woff2",
  weight: "600",
  display: "swap",
  variable: "--font-serif",
  fallback: ["Songti SC", "SimSun", "STSong", "serif"],
});

export const metadata: Metadata = {
  applicationName: "茸屿 Pawisle",
  title: {
    default: "茸屿 Pawisle · 和它一起住在柔软的小岛",
    template: "%s · 茸屿 Pawisle",
  },
  description: "茸屿 Pawisle，人宠共同生活的柔软小岛。",
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#FFFAF4",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN" className={serif.variable}>
      <body>{children}</body>
    </html>
  );
}
