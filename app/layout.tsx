import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// Import CartProvider (Đảm bảo file này có "use client" ở đầu)
import { CartProvider } from "@/context/CartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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
      <body className={inter.className} suppressHydrationWarning={true}>
        {/* CartProvider phải bọc toàn bộ nội dung bên trong Body */}
        <CartProvider>
          <Header />
          {children}
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}