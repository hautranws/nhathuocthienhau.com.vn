import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
// Import CartProvider
import { CartProvider } from "@/context/CartContext";
import Header from "@/components/Header";
import MobileBottomNav from "@/components/MobileBottomNav";
import Footer from "@/components/Footer";
import LiveChat from "@/components/LiveChat";
import PageLoader from "@/components/PageLoader";
import PurchaseChannelBanner from "@/components/PurchaseChannelBanner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  title: {
    default: "Nhà Thuốc Thiên Hậu",
    template: "%s | Nhà Thuốc Thiên Hậu",
  },
  description:
    "Nhà Thuốc Thiên Hậu cung cấp thuốc chính hãng, thực phẩm bảo vệ sức khỏe và dược mỹ phẩm chất lượng.",
  keywords: [
    "Nhà Thuốc Thiên Hậu",
    "nhà thuốc Thiên Hậu",
    "thuốc chính hãng",
    "mua thuốc online",
  ],
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: "Nhà Thuốc Thiên Hậu",
    title: "Nhà Thuốc Thiên Hậu",
    description:
      "Thuốc chính hãng, thực phẩm bảo vệ sức khỏe và dược mỹ phẩm chất lượng.",
  },
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
    <html lang="vi">
      <body className={inter.className} suppressHydrationWarning={true}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Pharmacy",
              name: "Nhà Thuốc Thiên Hậu",
              url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
              description:
                "Nhà Thuốc Thiên Hậu cung cấp thuốc chính hãng và các sản phẩm chăm sóc sức khỏe.",
            }),
          }}
        />
        {/* CartProvider bọc toàn bộ nội dung để chia sẻ dữ liệu Giỏ hàng */}
        <CartProvider>
          <Suspense fallback={null}>
            <PageLoader />
          </Suspense>
          <PurchaseChannelBanner />
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
