import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Năng Lực Tự Nhiên & Thiền Chuyển Hoá Cảm Xúc | Minh Hằng",
  description: "Tư vấn phát triển theo năng lực tự nhiên, thấu hiểu và chuyển hoá cảm xúc, đưa năng lượng về tính Không.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#3D5A4C",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full">
      <body className="min-h-full flex flex-col font-sans bg-[#FAF8F5] text-[#2D2A26] antialiased selection:bg-[#3D5A4C]/20 selection:text-[#1F332A]">
        {children}
      </body>
    </html>
  );
}
