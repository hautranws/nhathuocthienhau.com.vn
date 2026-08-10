import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// Import CartProvider
import { CartProvider } from "@/context/CartContext";
import Header from "@/components/Header";
import MobileBottomNav from "@/components/MobileBottomNav";
import Footer from "@/components/Footer";
import LiveChat from "@/components/LiveChat";
import PageLoader from "@/components/PageLoader";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nhà Thuốc Thiên Hậu",
  description: "Hệ thống nhà thuốc chính hãng",
  icons: {
    icon: "/logo-thienhau-tab.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning={true}>
        {/* CartProvider bọc toàn bộ nội dung để chia sẻ dữ liệu Giỏ hàng */}
        <CartProvider>
          <PageLoader />
          {/* Thanh thông báo chạy chữ */}
          <div className="w-full bg-[#0a6e3f] overflow-hidden py-1.5">
            <span className="animate-marquee text-white text-sm font-medium">
              🚚&nbsp; FREESHIP TOÀN QUỐC TẬN NHÀ CHO ĐƠN TỪ 99K
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;✨&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              FREESHIP TOÀN QUỐC TẬN NHÀ CHO ĐƠN TỪ 99K
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;✨&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              FREESHIP TOÀN QUỐC TẬN NHÀ CHO ĐƠN TỪ 99K
            </span>
          </div>
          <Header />

          <div className="pb-20 md:pb-0">{children}</div>

          <MobileBottomNav />

          <LiveChat />

          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
