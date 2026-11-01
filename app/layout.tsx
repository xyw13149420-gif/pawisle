import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

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
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
