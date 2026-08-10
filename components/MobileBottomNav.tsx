"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";

const navItems = [
  { href: "/", label: "Trang chủ", icon: "🏠" },
  { href: "/search", label: "Tìm", icon: "🔍" },
  { href: "/category/Thực phẩm chức năng", label: "Danh mục", icon: "📚" },
  { href: "/checkout", label: "Giỏ hàng", icon: "🛒" },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { totalItems, cartHighlight } = useCart();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-t border-gray-200 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-4">
        {navItems.map((item) => {
          const active =
            pathname === item.href || pathname?.startsWith(item.href + "/");
          const isCart = item.href === "/checkout";

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-semibold transition-colors ${
                active ? "text-blue-700" : "text-gray-500"
              } ${
                isCart && cartHighlight
                  ? "ring-4 ring-red-500/80 ring-offset-2 ring-offset-white rounded-2xl"
                  : ""
              }`}
            >
              <span
                className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-xl ${active ? "scale-110" : ""}`}
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
              {isCart && totalItems > 0 && (
                <span className="absolute top-1.5 right-[26%] bg-red-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                  {totalItems}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
