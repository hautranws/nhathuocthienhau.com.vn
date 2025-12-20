"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/lib/supabaseClient";

// 1. Import các thành phần
import { Icons } from "./icons";
import { TPCN_DATA, DMP_DATA, CSCN_DATA, TBYT_DATA } from "./data";
import { GridItem, SmallItem, ProductCard } from "./sub-components";

// --- CẤU HÌNH MENU CHÍNH ---
// Giúp code gọn hơn, dễ quản lý thứ tự hiển thị
const NAV_ITEMS = [
  {
    id: "TPCN",
    label: "Thực phẩm chức năng",
    href: "/category/Thực phẩm chức năng",
    data: TPCN_DATA, // Dữ liệu từ file data.ts
    defaultTab: "Vitamin",
    type: "dynamic", // Loại: Tự động lấy từ data
  },
  {
    id: "DMP",
    label: "Dược mỹ phẩm",
    href: "/category/Dược mỹ phẩm",
    data: DMP_DATA,
    defaultTab: "ChamSocDaMat",
    type: "dynamic",
  },
  {
    id: "THUOC",
    label: "Thuốc",
    href: "/category/Thuốc",
    data: null, // Không dùng data chung
    defaultTab: "TraCuuThuoc",
    type: "custom_thuoc", // Loại: Custom giao diện riêng
  },
  {
    id: "CSCN",
    label: "Chăm sóc cá nhân",
    href: "/category/Chăm sóc cá nhân",
    data: CSCN_DATA,
    defaultTab: "HoTroTinhDuc",
    type: "dynamic",
  },
  {
    id: "TBYT",
    label: "Thiết bị y tế",
    href: "/category/Thiết bị y tế",
    data: TBYT_DATA,
    defaultTab: "DungCuYTe",
    type: "dynamic",
  },
  {
    id: "BENH",
    label: "Bệnh & Góc sức khỏe",
    href: "#",
    data: null,
    defaultTab: null,
    type: "custom_benh",
  },
];

// --- DỮ LIỆU TĨNH CHO MỤC "THUỐC" & "BỆNH" (Giữ nguyên nội dung cũ) ---
const THUOC_SIDEBAR = [
  { id: "TraCuuThuoc", l: "Tra cứu thuốc", i: "💊" },
  { id: "TraCuuDuocChat", l: "Tra cứu dược chất", i: "⚗️" },
  { id: "TraCuuDuocLieu", l: "Tra cứu dược liệu", i: "🌿" },
];

const THUOC_GRID = [
  { t: "Thuốc kháng sinh", i: "🦠", bg: "bg-green-50" },
  { t: "Thuốc điều trị ung thư", i: "🧬", bg: "bg-red-50" },
  { t: "Thuốc tim mạch", i: "❤️", bg: "bg-pink-50" },
  { t: "Thuốc thần kinh", i: "🧠", bg: "bg-purple-50" },
  { t: "Thuốc tiêu hóa", i: "🤢", bg: "bg-yellow-50" },
];

const BENH_SIDEBAR = [
  { t: "Chuyên trang ung thư", i: "🧬" },
  { t: "Bệnh thường gặp", i: "🤕" },
  { t: "Tin khuyến mại", i: "🎉" },
  { t: "Truyền Thông", i: "🌟" },
];

export default function Header() {
  const { totalItems } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [activeMegaTab, setActiveMegaTab] = useState("Vitamin");

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
  }, []);

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.reload();
  };

  // --- HÀM HELPER: Render nội dung cột phải (Dynamic) ---
  // SỬA: Thêm tham số groupKey để biết đang ở nhóm nào (ví dụ: Vitamin)
  const renderDynamicContent = (
    dataConfig: any,
    itemLabel: string,
    groupKey: string
  ) => {
    if (!dataConfig) return null;
    const activeData = dataConfig[activeMegaTab];

    if (!activeData || !activeData.items || activeData.items.length === 0) {
      return (
        <div className="animate-fade-in flex flex-col h-full items-center justify-center text-gray-400">
          {activeData && (
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">{activeData.icon}</span>{" "}
              {activeData.title}
            </h3>
          )}
          <p>Nội dung đang cập nhật...</p>
        </div>
      );
    }

    return (
      <div className="animate-fade-in">
        <div className="flex items-center gap-2 mb-6 pb-2 border-b">
          {(Icons as any)[activeMegaTab] || (
            <span className="text-2xl text-blue-600">
              {activeData.icon || ""}
            </span>
          )}
          <h3 className="text-xl font-bold text-gray-800">
            {activeData.title}
          </h3>
        </div>
        <div
          className={`grid ${
            activeData.type === "small" ? "grid-cols-3" : "grid-cols-2"
          } gap-4 mb-8`}
        >
          {activeData.items.map((item: any, idx: number) =>
            activeData.type === "small" ? (
              <SmallItem
                key={idx}
                // SỬA: Thêm tham số group vào URL: ?group=Vitamin&sub=Canxi
                href={`/category/${itemLabel}?group=${groupKey}&sub=${item.sub}`}
                sticker={item.sticker}
                title={item.title}
                bg={item.bg}
              />
            ) : (
              <GridItem
                key={idx}
                // SỬA: Thêm tham số group vào URL: ?group=Vitamin&sub=Canxi
                href={`/category/${itemLabel}?group=${groupKey}&sub=${item.sub}`}
                sticker={item.sticker}
                title={item.title}
                count={item.count}
              />
            )
          )}
        </div>
      </div>
    );
  };

  return (
    <header className="bg-blue-700 text-white shadow-md sticky top-0 z-50 font-sans">
      {/* --- TẦNG 1: LOGO & TÌM KIẾM --- */}
      <div className="container mx-auto p-4 flex flex-wrap justify-between items-center gap-4 relative z-50 bg-blue-700">
        <button
          onClick={toggleMenu}
          className="md:hidden text-2xl p-2 focus:outline-none"
        >
          {isMobileMenuOpen ? "✕" : "☰"}
        </button>
        <Link
          href="/"
          className="flex flex-col font-bold leading-tight cursor-pointer"
        >
          <span className="text-[10px] md:text-sm text-yellow-400">
            Hệ thống chính hãng
          </span>
          <span className="text-lg md:text-2xl tracking-tighter uppercase">
            NHÀ THUỐC THIÊN HẬU
          </span>
        </Link>
        <div className="hidden md:block flex-1 max-w-xl mx-4 relative">
          <input
            type="text"
            placeholder="Tìm tên thuốc, bệnh lý..."
            className="w-full py-2 px-4 rounded-full text-black outline-none shadow-lg"
          />
          <button className="absolute right-1 top-1 bottom-1 bg-blue-800 px-4 rounded-full hover:bg-blue-900">
            🔍
          </button>
        </div>
        <div className="flex items-center gap-6">
          {user ? (
            <div className="flex flex-col items-end text-xs">
              <span className="font-bold text-yellow-300">
                Chào, {user.email?.split("@")[0]}
              </span>
              <button
                onClick={handleLogout}
                className="text-white hover:underline opacity-80"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex flex-col items-center text-xs cursor-pointer hover:opacity-80"
            >
              <span className="text-lg">👤</span>
              <span>Đăng nhập</span>
            </Link>
          )}
          <Link
            href="/checkout"
            className="flex items-center gap-2 bg-blue-800 px-3 py-2 rounded-full hover:bg-blue-900 transition relative shadow-md"
          >
            <span className="text-xl">🛒</span>
            <span className="font-bold hidden md:block">Giỏ hàng</span>
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center border-2 border-white">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* --- TẦNG 2: MEGA MENU (ĐÃ LÀM GỌN) --- */}
      <div className="hidden md:block bg-blue-800/50 relative">
        <div className="container mx-auto">
          <ul className="flex justify-center gap-6 text-sm font-medium text-white px-4">
            {NAV_ITEMS.map((item) => (
              <li
                key={item.id}
                className="group py-3 cursor-pointer hover:text-yellow-300 flex items-center gap-1 static"
                onMouseEnter={() =>
                  item.defaultTab && setActiveMegaTab(item.defaultTab)
                }
              >
                <Link href={item.href}>{item.label}</Link>{" "}
                <span className="text-xs">▼</span>
                <div className="absolute top-full left-0 w-full bg-white text-gray-800 shadow-2xl rounded-b-lg border-t border-gray-200 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 z-40 origin-top text-left">
                  <div className="container mx-auto flex h-[500px]">
                    {/* --- SIDEBAR TRÁI --- */}
                    <div className="w-1/4 bg-gray-50 p-2 overflow-y-auto border-r">
                      <ul className="space-y-1">
                        {/* CASE 1: Menu Động (TPCN, DMP, CSCN, TBYT) */}
                        {item.type === "dynamic" &&
                          item.data &&
                          Object.keys(item.data).map((key) => (
                            <li
                              key={key}
                              onMouseEnter={() => setActiveMegaTab(key)}
                              className={`px-4 py-3 font-bold rounded cursor-pointer flex justify-between items-center transition ${
                                activeMegaTab === key
                                  ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600"
                                  : "hover:bg-white text-gray-600 hover:text-blue-700"
                              }`}
                            >
                              <Link
                                // SỬA: Thêm tham số group vào URL cho link sidebar trái
                                href={`${item.href}?group=${key}`}
                                className="flex items-center gap-2 w-full"
                              >
                                <span className="text-xl">
                                  {(Icons as any)[key] ||
                                    (item.data[key] as any).icon ||
                                    "📦"}
                                </span>
                                {item.data[key].title}
                              </Link>
                              <span className="text-xs">›</span>
                            </li>
                          ))}

                        {/* CASE 2: Menu Thuốc (Custom) */}
                        {item.type === "custom_thuoc" &&
                          THUOC_SIDEBAR.map((sub) => (
                            <li
                              key={sub.id}
                              onMouseEnter={() => setActiveMegaTab(sub.id)}
                              className={`px-4 py-4 font-bold rounded-lg cursor-pointer flex items-center gap-3 mb-2 transition ${
                                activeMegaTab === sub.id
                                  ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600"
                                  : "hover:bg-white text-gray-600 hover:text-blue-700"
                              }`}
                            >
                              <Link
                                href={`/category/Thuốc?sub=${sub.id}`}
                                className="flex items-center gap-2 w-full"
                              >
                                <span className="text-xl">{sub.i}</span> {sub.l}
                              </Link>
                            </li>
                          ))}

                        {/* CASE 3: Menu Bệnh (Custom) */}
                        {item.type === "custom_benh" && (
                          <>
                            <li className="px-4 py-3 bg-blue-50 text-blue-700 font-bold rounded shadow-sm cursor-pointer flex justify-between items-center border-l-4 border-blue-600">
                              <Link
                                href="#"
                                className="flex items-center gap-2 w-full"
                              >
                                <span className="text-xl">🩺</span> Góc sức khỏe
                              </Link>
                              <span className="text-xs">›</span>
                            </li>
                            {BENH_SIDEBAR.map((sub, i) => (
                              <li
                                key={i}
                                className="px-4 py-3 hover:bg-white hover:text-blue-700 hover:font-bold cursor-pointer transition rounded flex items-center gap-2"
                              >
                                <Link
                                  href="#"
                                  className="flex items-center gap-2 w-full"
                                >
                                  <span className="text-xl">{sub.i}</span>{" "}
                                  {sub.t}
                                </Link>
                              </li>
                            ))}
                          </>
                        )}
                      </ul>
                    </div>

                    {/* --- CONTENT PHẢI --- */}
                    <div className="w-3/4 p-6 overflow-y-auto bg-white">
                      {/* CASE 1: Content Động (Dùng hàm helper) */}
                      {/* SỬA: Truyền thêm activeMegaTab (chính là groupKey như Vitamin, SinhLy...) vào hàm render */}
                      {item.type === "dynamic" &&
                        renderDynamicContent(
                          item.data,
                          item.label,
                          activeMegaTab
                        )}

                      {/* Hiển thị thêm Banner/Sản phẩm bán chạy cho TPCN & DMP */}
                      {["TPCN", "DMP"].includes(item.id) && (
                        <div className="mt-8 border-t pt-4">
                          <div className="flex justify-between items-center mb-4 border-l-4 border-blue-600 pl-3">
                            <h4 className="font-bold text-gray-800 text-lg">
                              Bán chạy nhất
                            </h4>
                            <span className="text-blue-600 text-sm cursor-pointer hover:underline">
                              Xem tất cả ›
                            </span>
                          </div>
                          <div className="grid grid-cols-4 gap-4">
                            <ProductCard
                              title="Viên uống Immuvita Easylife"
                              price="390.000đ"
                              img="[Ảnh Immuvita]"
                            />
                            <ProductCard
                              title="Siro ống uống Canxi-D3-K2"
                              price="105.000đ"
                              img="[Ảnh Siro Canxi]"
                            />
                            <ProductCard
                              title="Siro Brauer Baby Kids"
                              price="396.000đ"
                              img="[Ảnh Brauer]"
                            />
                            <ProductCard
                              title="Viên uống Omexxel 3-6-9"
                              price="453.000đ"
                              img="[Ảnh Omexxel]"
                            />
                          </div>
                        </div>
                      )}

                      {/* CASE 2: Content Thuốc (Custom) */}
                      {item.type === "custom_thuoc" &&
                        activeMegaTab === "TraCuuThuoc" && (
                          <div className="animate-fade-in grid grid-cols-3 gap-4 mb-6">
                            {THUOC_GRID.map((i, x) => (
                              <Link
                                key={x}
                                href="#"
                                className="flex items-center gap-3 p-4 border rounded-lg hover:shadow-md bg-white group/card"
                              >
                                <div
                                  className={`w-12 h-12 ${i.bg} rounded-lg flex items-center justify-center text-2xl`}
                                >
                                  {i.i}
                                </div>
                                <span className="font-semibold text-sm text-gray-700 group-hover/card:text-blue-700">
                                  {i.t}
                                </span>
                              </Link>
                            ))}
                          </div>
                        )}

                      {/* CASE 3: Content Bệnh (Custom) */}
                      {item.type === "custom_benh" && (
                        <div className="grid grid-cols-2 gap-6 mb-6">
                          {/* Bài viết mẫu 1 */}
                          <div className="flex flex-col gap-2 group cursor-pointer">
                            <div className="h-40 bg-gray-100 rounded-lg overflow-hidden relative">
                              <div className="w-full h-full bg-blue-100 flex items-center justify-center text-gray-400">
                                [Ảnh bài viết 1]
                              </div>
                            </div>
                            <h4 className="font-bold text-gray-800 text-lg group-hover:text-blue-600 line-clamp-2">
                              5 Dấu hiệu cảnh báo bệnh tiểu đường
                            </h4>
                            <p className="text-sm text-gray-500 line-clamp-2">
                              Tiểu đường là căn bệnh nguy hiểm...
                            </p>
                          </div>
                          {/* Bài viết mẫu 2 */}
                          <div className="flex flex-col gap-2 group cursor-pointer">
                            <div className="h-40 bg-gray-100 rounded-lg overflow-hidden relative">
                              <div className="w-full h-full bg-green-100 flex items-center justify-center text-gray-400">
                                [Ảnh bài viết 2]
                              </div>
                            </div>
                            <h4 className="font-bold text-gray-800 text-lg group-hover:text-blue-600 line-clamp-2">
                              Bí quyết tăng cường sức đề kháng
                            </h4>
                            <p className="text-sm text-gray-500 line-clamp-2">
                              Thời tiết thay đổi thất thường...
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* --- MENU MOBILE --- */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={toggleMenu}></div>
          <div className="relative bg-white w-3/4 max-w-xs h-full shadow-xl flex flex-col animate-slide-in">
            <div className="p-4 bg-blue-700 text-white flex justify-between items-center">
              <span className="font-bold text-lg">DANH MỤC</span>
              <button onClick={toggleMenu} className="text-2xl">
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-4 text-gray-800 font-medium">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="block px-6 py-3 hover:bg-gray-100 border-b"
                  onClick={toggleMenu}
                >
                  {item.label}
                </Link>
              ))}
              <div className="mt-4 px-6">
                {user ? (
                  <button
                    onClick={handleLogout}
                    className="w-full bg-red-500 text-white py-2 rounded-lg mb-2"
                  >
                    Đăng xuất
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="block w-full bg-blue-600 text-white py-2 rounded-lg mb-2 text-center"
                    onClick={toggleMenu}
                  >
                    Đăng nhập
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
