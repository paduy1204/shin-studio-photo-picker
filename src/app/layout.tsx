import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import "./globals.css";

const quicksand = Quicksand({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-quicksand",
});

export const metadata: Metadata = {
  title: "Shin Studio | Photo Picker",
  description: "Hệ thống chọn ảnh chất lượng cao dành cho khách hàng của Shin Studio.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={quicksand.variable}>
      <body style={{ fontFamily: "var(--font-quicksand), sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
