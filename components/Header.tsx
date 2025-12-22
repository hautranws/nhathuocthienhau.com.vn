// components/Header.tsx
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/lib/supabaseClient";

// Import Component con và Data đã tách
import { Icons } from "./icons";
import { GridItem, SmallItem, ProductCard } from "./sub-components";
import SearchBar from "./header/SearchBar";
import {
  NAV_ITEMS,
  THUOC_SIDEBAR,
  THUOC_GRID,
  BENH_SIDEBAR,
} from "./header/constants";

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

  // --- HÀM HELPER: Render nội dung cột phải ---
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
              <span className="text-2xl">{(activeData as any).icon}</span>{" "}
              {activeData.title}
            </h3>
          )}
          <p>Nội dung đang cập nhật...</p>
        </div>
      );
    }

    // --- LOGIC MỚI: Xử lý nút "Xem thêm" ---
    const MAX_DISPLAY = 5; // Chỉ hiện tối đa 5 mục
    const shouldShowMore = activeData.items.length > MAX_DISPLAY;

    // Nếu dài hơn 5 thì cắt lấy 5 cái đầu, ngược lại lấy hết
    const displayItems = shouldShowMore
      ? activeData.items.slice(0, MAX_DISPLAY)
      : activeData.items;

    return (
      <div className="animate-fade-in">
        <div className="flex items-center gap-2 mb-6 pb-2 border-b">
          {(Icons as any)[activeMegaTab] || (
            <span className="text-2xl text-blue-600">
              {(activeData as any).icon || ""}
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
          {/* Render các mục (Đã được cắt gọn nếu dài) */}
          {displayItems.map((item: any, idx: number) =>
            activeData.type === "small" ? (
              <SmallItem
                key={idx}
                href={`/category/${itemLabel}?group=${groupKey}&sub=${item.sub}`}
                sticker={item.sticker}
                title={item.title}
                bg={item.bg}
              />
            ) : (
              <GridItem
                key={idx}
                href={`/category/${itemLabel}?group=${groupKey}&sub=${item.sub}`}
                sticker={item.sticker}
                title={item.title}
                count={item.count}
              />
            )
          )}

          {/* --- NÚT XEM THÊM (Chỉ hiện khi danh sách dài hơn 5) --- */}
          {shouldShowMore && (
            <Link
              // Link này sẽ dẫn đến trang danh sách đầy đủ của nhóm đó
              href={`/category/${itemLabel}?group=${groupKey}`}
              className="flex items-center gap-3 p-2 border border-gray-200 rounded-lg hover:shadow-md bg-white group/more transition-all cursor-pointer h-full min-h-[60px]"
            >
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 group-hover/more:text-blue-600 group-hover/more:bg-blue-100 shrink-0">
                {/* Icon 3 chấm tròn */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="1"></circle>
                  <circle cx="19" cy="12" r="1"></circle>
                  <circle cx="5" cy="12" r="1"></circle>
                </svg>
              </div>
              <div className="flex flex-col justify-center">
                <span className="font-bold text-sm text-gray-700 group-hover/more:text-blue-700">
                  Xem thêm
                </span>
                {/* Hiển thị số lượng còn lại */}
                <span className="text-xs text-gray-500">
                  Còn {activeData.items.length - MAX_DISPLAY} mục
                </span>
              </div>
            </Link>
          )}
        </div>
      </div>
    );
  };

  return (
    <header className="bg-blue-700 text-white shadow-md sticky top-0 z-50 font-sans">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `,
        }}
      />

      {/* --- TẦNG 1: LOGO & TÌM KIẾM --- */}
      <div className="container mx-auto px-4 py-10 flex flex-wrap justify-between items-center gap-4 relative z-50 bg-blue-700">
        <button
          onClick={toggleMenu}
          className="md:hidden text-2xl p-2 focus:outline-none"
        >
          {isMobileMenuOpen ? "✕" : "☰"}
        </button>

        {/* LOGO */}
        <div className="flex-none flex items-center mr-4">
          <Link href="/" className="flex items-center gap-3 cursor-pointer">
            <div className="bg-white text-blue-700 rounded-full w-10 h-10 flex items-center justify-center font-bold text-xl shadow-md border-2 border-blue-200">
              💊
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-bold text-yellow-400 uppercase tracking-wide">
                Hệ thống chính hãng
              </span>
              <div className="flex flex-col -mt-1">
                <span className="text-xl md:text-2xl font-black tracking-tighter uppercase text-white">
                  NHÀ THUỐC
                </span>
                <span className="text-xl md:text-2xl font-black tracking-tighter uppercase text-white leading-none">
                  THIÊN HẬU
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* COMPONENT TÌM KIẾM */}
        <SearchBar />

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

      {/* --- TẦNG 2: MEGA MENU --- */}
      <div className="hidden md:block bg-white border-b border-gray-200 relative">
        <div className="container mx-auto">
          <ul className="flex justify-center gap-6 text-sm font-bold text-gray-800 px-4">
            {NAV_ITEMS.map((item) => (
              <li
                key={item.id}
                className="group py-3 cursor-pointer hover:text-blue-700 flex items-center gap-1 static"
                onMouseEnter={() =>
                  item.defaultTab && setActiveMegaTab(item.defaultTab)
                }
              >
                <Link href={item.href}>{item.label}</Link>{" "}
                <span className="text-xs">▼</span>
                <div className="absolute top-full left-0 w-full bg-white text-gray-800 shadow-2xl rounded-b-lg border-t border-gray-200 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 z-40 origin-top text-left">
                  <div className="container mx-auto flex h-[500px]">
                    {/* SIDEBAR TRÁI */}
                    <div className="w-1/4 bg-gray-50 p-2 overflow-y-auto border-r">
                      <ul className="space-y-1">
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

                        {/* CASE 2: Menu Thuốc */}
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

                        {/* CASE 3: Menu Bệnh */}
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

                    {/* CONTENT PHẢI */}
                    <div className="w-3/4 p-6 overflow-y-auto bg-white">
                      {item.type === "dynamic" &&
                        renderDynamicContent(
                          item.data,
                          item.label,
                          activeMegaTab
                        )}

                      {/* Banner / Sản phẩm bán chạy */}
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

                      {/* Content Thuốc */}
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

                      {/* Content Bệnh */}
                      {item.type === "custom_benh" && (
                        <div className="grid grid-cols-2 gap-6 mb-6">
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

      {/* MENU MOBILE */}
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
