import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="vi">
      <body>
        {children}
      </body>
    </html>
  );
}
