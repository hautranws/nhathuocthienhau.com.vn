import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import Header from "../components/Header";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nhà Thuốc Thiên Hậu",
  description: "Hệ thống nhà thuốc chính hãng",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CartProvider>
          <Header /> {/* <--- 2. Đặt Header nằm cố định ở đây */}
          {children} {/* Đây là nội dung thay đổi (Trang chủ/Chi tiết) */}
        </CartProvider>
      </body>
    </html>
  );
}
