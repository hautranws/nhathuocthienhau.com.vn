"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import {
  getSafeSupabaseUser,
  safeSupabaseSignOut,
  supabase,
} from "@/lib/supabaseClient";

// Import Component con
import { Icons } from "./icons";
import { GridItem, SmallItem } from "./sub-components";
import SearchBar from "./header/SearchBar";
import { NAV_ITEMS, BENH_SIDEBAR } from "./header/constants";

// 👇 IMPORT COMPONENT MENU MỚI (DROPDOWN GIỐNG LONG CHÂU)
import UserDropdown from "@/components/UserDropdown";

// Import Data Thuốc để lấy ví dụ hiển thị
import { THUOC_DATA } from "@/components/data";

export default function Header() {
  const router = useRouter();
  const { totalItems, cartHighlight } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [activeMegaTab, setActiveMegaTab] = useState("Vitamin");
  const [openMobileGroup, setOpenMobileGroup] = useState<string | null>("TPCN");
  const [mobileSearchTerm, setMobileSearchTerm] = useState("");

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await getSafeSupabaseUser();
        setUser(currentUser);
      } catch (error) {
        console.warn("Supabase getUser failed in Header:", error);
        setUser(null);
      }
    };
    checkUser();
  }, []);

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const toggleMobileGroup = (groupId: string) => {
    setOpenMobileGroup((current) => (current === groupId ? null : groupId));
  };

  const handleMobileSearch = () => {
    const trimmed = mobileSearchTerm.trim();
    if (!trimmed) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    setIsMobileMenuOpen(false);
  };

  // Hàm này giữ lại để dùng cho Mobile Menu (Menu điện thoại)
  const handleLogout = async () => {
    await safeSupabaseSignOut();
    setUser(null);
    window.location.reload();
  };

  const renderDynamicContent = (
    dataConfig: any,
    itemLabel: string,
    groupKey: string,
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

    const MAX_DISPLAY = 6;
    const shouldShowMore = activeData.items.length > MAX_DISPLAY;
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
            ),
          )}

          {shouldShowMore && (
            <Link
              href={`/category/${itemLabel}?group=${groupKey}`}
              className="flex items-center gap-3 p-2 border border-gray-200 rounded-lg hover:shadow-md bg-white group/more transition-all cursor-pointer h-full min-h-[60px]"
            >
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 group-hover/more:text-blue-600 group-hover/more:bg-blue-100 shrink-0">
                <span className="text-xl">➔</span>
              </div>
              <div className="flex flex-col justify-center">
                <span className="font-bold text-sm text-gray-700 group-hover/more:text-blue-700">
                  Xem tất cả
                </span>
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
    <header className="bg-white text-gray-800 shadow-md sticky top-0 z-50 font-sans border-b border-gray-200">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `,
        }}
      />

      {/* --- TẦNG 1: LOGO & TÌM KIẾM (Nền trắng) --- */}
      <div className="container mx-auto px-3 py-3 md:px-4 md:py-4 flex flex-wrap md:flex-nowrap justify-between items-center gap-3 md:gap-4 relative z-50 bg-white">
        <button
          onClick={toggleMenu}
          className="md:hidden text-2xl p-2 focus:outline-none text-blue-700 shrink-0"
        >
          {isMobileMenuOpen ? "✕" : "☰"}
        </button>

        {/* LOGO */}
        <div className="flex-none flex items-center mr-2 md:mr-4 min-w-0">
          <Link href="/" className="flex items-center gap-3 cursor-pointer">
            <img
              src="/logo-thien-hau.png"
              alt="Nhà Thuốc Thiên Hậu"
              className="h-20 sm:h-24 md:h-44 w-auto object-contain p-0 md:p-2"
            />
          </Link>
        </div>

        {/* SEARCH BAR */}
        <div className="hidden md:block flex-1 max-w-2xl">
          <SearchBar />
        </div>

        {/* USER INFO & CART */}
        <div className="flex items-center gap-2 md:gap-6">
          {user ? (
            // 👇 THAY ĐỔI Ở ĐÂY: SỬ DỤNG COMPONENT MỚI
            <UserDropdown user={user} />
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 bg-red-600 text-white px-3 py-2 md:px-4 md:py-3 rounded-full hover:bg-red-700 transition shadow-lg hover:shadow-xl"
            >
              <span className="text-xl">👤</span>
              <span className="font-bold hidden md:block">Đăng nhập</span>
            </Link>
          )}

          <Link
            href="/checkout"
            className={`flex items-center gap-2 bg-blue-700 text-white px-3 py-2 md:px-4 md:py-3 rounded-full hover:bg-blue-800 transition relative shadow-lg hover:shadow-xl ${
              cartHighlight
                ? "ring-4 ring-red-500/80 ring-offset-2 ring-offset-white animate-pulse"
                : ""
            }`}
          >
            <span className="text-xl">🛒</span>
            <span className="font-bold hidden md:block">Giỏ hàng</span>
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                {totalItems}
              </span>
            )}
          </Link>
        </div>

        <div className="md:hidden w-full px-1 -mt-1">
          <div className="flex items-center gap-2 rounded-2xl border border-blue-100 bg-blue-50 px-3 py-2 shadow-sm">
            <span className="text-blue-600 text-base shrink-0">🔍</span>
            <input
              type="text"
              value={mobileSearchTerm}
              onChange={(e) => setMobileSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleMobileSearch();
              }}
              placeholder="Tìm thuốc, sản phẩm..."
              className="w-full bg-transparent outline-none text-sm text-gray-800 placeholder:text-gray-500"
            />
            <button
              type="button"
              onClick={handleMobileSearch}
              className="shrink-0 rounded-full bg-blue-700 px-3 py-1.5 text-xs font-bold text-white shadow-sm"
            >
              Tìm
            </button>
          </div>
        </div>
      </div>

      {/* --- TẦNG 2: MEGA MENU (SỬA THÀNH NỀN XANH ĐẬM) --- */}
      <div className="hidden md:block bg-blue-800 border-t border-blue-900 relative shadow-sm">
        <div className="container mx-auto">
          {/* Sửa text-gray-700 thành text-white */}
          <ul className="flex justify-center gap-8 text-sm font-bold text-white px-4">
            {/* 1. RENDER CÁC MỤC MENU CŨ (TỪ CONSTANTS) */}
            {NAV_ITEMS.map((item) => (
              <li
                key={item.id}
                // Sửa hover:text-blue-700 thành hover:text-yellow-300 để nổi bật trên nền xanh
                className="group py-4 cursor-pointer hover:text-yellow-300 flex items-center gap-1 static border-b-2 border-transparent hover:border-yellow-300 transition-all"
                onMouseEnter={() => {
                  if (item.label === "Thuốc") {
                    setActiveMegaTab("tra-cuu-thuoc");
                  } else if (item.defaultTab) {
                    setActiveMegaTab(item.defaultTab);
                  }
                }}
              >
                <Link href={item.href} className="uppercase tracking-wide">
                  {item.label}
                </Link>{" "}
                <span className="text-[10px] opacity-70">▼</span>
                {/* --- DROPDOWN PANEL (GIỮ NGUYÊN NỀN TRẮNG CHỮ ĐEN) --- */}
                <div className="absolute top-full left-0 w-full bg-white text-gray-800 shadow-2xl rounded-b-xl border-t border-gray-100 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 z-40 origin-top text-left mt-[1px]">
                  <div className="container mx-auto flex h-[500px]">
                    <div className="w-1/4 bg-gray-50 p-2 overflow-y-auto border-r custom-scrollbar">
                      <ul className="space-y-1">
                        {item.type === "dynamic" &&
                          item.data &&
                          Object.keys(item.data).map((key) => (
                            <li
                              key={key}
                              onMouseEnter={() => setActiveMegaTab(key)}
                              className={`px-4 py-3 font-bold rounded cursor-pointer flex justify-between items-center transition ${
                                activeMegaTab === key
                                  ? "bg-white text-blue-700 border-l-4 border-blue-600 shadow-sm"
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

                        {item.label === "Thuốc" && (
                          <>
                            <li
                              onMouseEnter={() =>
                                setActiveMegaTab("tra-cuu-thuoc")
                              }
                              className={`px-4 py-3 font-bold rounded cursor-pointer flex justify-between items-center transition ${
                                activeMegaTab === "tra-cuu-thuoc"
                                  ? "bg-white text-blue-700 border-l-4 border-blue-600 shadow-sm"
                                  : "hover:bg-white text-gray-600 hover:text-blue-700"
                              }`}
                            >
                              <div className="flex items-center gap-2 w-full">
                                <span className="text-xl text-blue-500">
                                  💊
                                </span>{" "}
                                Tra cứu thuốc
                              </div>
                              <span className="text-xs">›</span>
                            </li>
                            <li
                              onMouseEnter={() =>
                                setActiveMegaTab("tra-cuu-duoc-chat")
                              }
                              className={`px-4 py-3 font-bold rounded cursor-pointer flex justify-between items-center transition ${
                                activeMegaTab === "tra-cuu-duoc-chat"
                                  ? "bg-white text-blue-700 border-l-4 border-blue-600 shadow-sm"
                                  : "hover:bg-white text-gray-600 hover:text-blue-700"
                              }`}
                            >
                              <div className="flex items-center gap-2 w-full">
                                <span className="text-xl text-purple-500">
                                  🧪
                                </span>{" "}
                                Tra cứu dược chất
                              </div>
                              <span className="text-xs">›</span>
                            </li>
                            <li
                              onMouseEnter={() =>
                                setActiveMegaTab("tra-cuu-duoc-lieu")
                              }
                              className={`px-4 py-3 font-bold rounded cursor-pointer flex justify-between items-center transition ${
                                activeMegaTab === "tra-cuu-duoc-lieu"
                                  ? "bg-white text-blue-700 border-l-4 border-blue-600 shadow-sm"
                                  : "hover:bg-white text-gray-600 hover:text-blue-700"
                              }`}
                            >
                              <div className="flex items-center gap-2 w-full">
                                <span className="text-xl text-green-500">
                                  🌿
                                </span>{" "}
                                Tra cứu dược liệu
                              </div>
                              <span className="text-xs">›</span>
                            </li>
                          </>
                        )}

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

                    <div className="w-3/4 p-6 overflow-y-auto bg-white custom-scrollbar">
                      {item.type === "dynamic" &&
                        renderDynamicContent(
                          item.data,
                          item.label,
                          activeMegaTab,
                        )}

                      {item.label === "Thuốc" && (
                        <div className="animate-fade-in h-full flex flex-col">
                          {activeMegaTab === "tra-cuu-thuoc" && (
                            <>
                              <div className="flex items-center gap-2 mb-6 pb-2 border-b">
                                <span className="text-2xl">💊</span>
                                <h3 className="text-xl font-bold text-gray-800">
                                  Thuốc thông dụng
                                </h3>
                              </div>
                              <div className="grid grid-cols-2 gap-4 mb-6">
                                <GridItem
                                  href="/category/Thuốc?group=NhomTriLieu&sub=ThuocKhangSinh"
                                  sticker="💊"
                                  title="Thuốc kháng sinh, kháng nấm"
                                  count="Đa dạng"
                                />
                                <GridItem
                                  href="/category/Thuốc?group=NhomTriLieu&sub=ThuocTimMach"
                                  sticker="❤️"
                                  title="Thuốc tim mạch & máu"
                                  count="Phổ biến"
                                />
                                <GridItem
                                  href="/category/Thuốc?group=NhomTriLieu&sub=ThuocThanKinh"
                                  sticker="🧠"
                                  title="Thuốc thần kinh"
                                  count="Chuyên khoa"
                                />
                                <GridItem
                                  href="/category/Thuốc?group=NhomTriLieu&sub=ThuocTieuHoa"
                                  sticker="🌭"
                                  title="Thuốc tiêu hoá & gan mật"
                                  count="Thông dụng"
                                />
                              </div>
                              <div className="mb-6">
                                <Link
                                  href="/tra-cuu-thuoc"
                                  className="text-blue-600 font-bold hover:underline flex items-center gap-1"
                                >
                                  Xem tất cả <span className="text-xs">›</span>
                                </Link>
                              </div>
                              <div className="mt-auto">
                                <p className="font-bold text-gray-800 mb-2">
                                  Xem theo chữ cái
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {"ABCDEFGHIJKLMNOPQRSTUVWXYZ"
                                    .split("")
                                    .map((char) => (
                                      <Link
                                        key={char}
                                        href={`/tra-cuu-thuoc?alpha=${char}`}
                                        className="w-8 h-8 flex items-center justify-center bg-gray-50 border border-gray-200 rounded hover:bg-blue-600 hover:text-white hover:border-blue-600 transition text-sm font-semibold text-gray-600"
                                      >
                                        {char}
                                      </Link>
                                    ))}
                                </div>
                              </div>
                            </>
                          )}
                          {activeMegaTab === "tra-cuu-duoc-chat" && (
                            <>
                              <div className="flex justify-between items-center mb-4 border-b pb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-2xl">🧪</span>
                                  <h3 className="font-bold text-gray-800 text-xl">
                                    Dược chất thông dụng
                                  </h3>
                                </div>
                                <Link
                                  href="/tra-cuu-duoc-chat"
                                  className="text-blue-600 text-sm font-bold hover:underline flex items-center"
                                >
                                  Xem tất cả{" "}
                                  <span className="ml-1 text-xs">›</span>
                                </Link>
                              </div>
                              <div className="grid grid-cols-3 gap-y-3 gap-x-6 mb-8">
                                {[
                                  "Paracetamol",
                                  "Ibuprofen",
                                  "Vitamin C",
                                  "Berberin",
                                  "Glucosamine",
                                  "Canxi",
                                  "Sắt",
                                  "Magie",
                                  "Kẽm",
                                  "Collagen",
                                  "Biotin",
                                  "Omega 3",
                                  "Curcumin",
                                  "Melatonin",
                                ].map((item) => (
                                  <Link
                                    key={item}
                                    href={`/tra-cuu-thuoc?keyword=${item}`}
                                    className="text-gray-600 hover:text-blue-600 hover:font-bold text-sm transition"
                                  >
                                    {item}
                                  </Link>
                                ))}
                              </div>
                              <div className="mt-auto">
                                <p className="font-bold text-gray-800 mb-2">
                                  Xem theo chữ cái
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {"ABCDEFGHIJKLMNOPQRSTUVWXYZ"
                                    .split("")
                                    .map((char) => (
                                      <Link
                                        key={char}
                                        href="/tra-cuu-duoc-chat"
                                        className="w-8 h-8 flex items-center justify-center bg-gray-50 border border-gray-200 rounded hover:bg-blue-600 hover:text-white hover:border-blue-600 transition text-sm font-semibold text-gray-600"
                                      >
                                        {char}
                                      </Link>
                                    ))}
                                </div>
                              </div>
                            </>
                          )}
                          {activeMegaTab === "tra-cuu-duoc-lieu" && (
                            <>
                              <div className="flex justify-between items-center mb-4 border-b pb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-2xl">🌿</span>
                                  <h3 className="font-bold text-gray-800 text-xl">
                                    Dược liệu thông dụng
                                  </h3>
                                </div>
                                <Link
                                  href="/tra-cuu-duoc-lieu"
                                  className="text-blue-600 text-sm font-bold hover:underline flex items-center"
                                >
                                  Xem tất cả{" "}
                                  <span className="ml-1 text-xs">›</span>
                                </Link>
                              </div>
                              <div className="grid grid-cols-3 gap-y-3 gap-x-6 mb-8">
                                {[
                                  "Cam thảo",
                                  "Bình bát",
                                  "Bồ kết (Gai)",
                                  "Bối mẫu (Thân hành)",
                                  "Bạch mao căn",
                                  "Câu đằng",
                                  "Bán biên liên",
                                  "Ca cao",
                                  "Bụp giấm",
                                  "Bại tương thảo",
                                  "Bạch tật lê",
                                  "Atiso",
                                ].map((item) => (
                                  <Link
                                    key={item}
                                    href={`/tra-cuu-thuoc?keyword=${item}`}
                                    className="text-gray-600 hover:text-blue-600 hover:font-bold text-sm transition"
                                  >
                                    {item}
                                  </Link>
                                ))}
                              </div>
                              <div className="mt-auto">
                                <p className="font-bold text-gray-800 mb-2">
                                  Xem theo chữ cái
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {"ABCDEFGHIJKLMNOPQRSTUVWXYZ"
                                    .split("")
                                    .map((char) => (
                                      <Link
                                        key={char}
                                        href="/tra-cuu-duoc-lieu"
                                        className="w-8 h-8 flex items-center justify-center bg-gray-50 border border-gray-200 rounded hover:bg-blue-600 hover:text-white hover:border-blue-600 transition text-sm font-semibold text-gray-600"
                                      >
                                        {char}
                                      </Link>
                                    ))}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      )}

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
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}

            {/* 👇 2. ĐÃ THÊM: MỤC "HỆ THỐNG NHÀ THUỐC" (Nằm kế bên mục cuối cùng) */}
            <li className="group py-4 cursor-pointer hover:text-yellow-300 flex items-center gap-1 static border-b-2 border-transparent hover:border-yellow-300 transition-all">
              <Link
                href="/he-thong-nha-thuoc"
                className="uppercase tracking-wide"
              >
                Hệ thống nhà thuốc
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={toggleMenu}></div>
          <div className="relative bg-white w-[88%] max-w-sm h-full shadow-xl flex flex-col animate-slide-in">
            <div className="p-4 bg-gradient-to-r from-blue-700 to-blue-600 text-white flex justify-between items-center">
              <span className="font-bold text-lg">MENU</span>
              <button onClick={toggleMenu} className="text-2xl">
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-3 text-gray-800 font-medium">
              <Link
                href="/"
                className="flex items-center justify-between px-4 py-3 mx-3 mb-2 rounded-xl bg-blue-50 text-blue-700 font-bold border border-blue-100"
                onClick={toggleMenu}
              >
                <span className="flex items-center gap-3">
                  <span className="text-lg">🏠</span>
                  Trang chủ
                </span>
                <span className="text-sm">›</span>
              </Link>

              <div className="px-3 space-y-2">
                {NAV_ITEMS.map((item) => {
                  const isOpen = openMobileGroup === item.id;
                  const hasChildren = item.type === "dynamic" && item.data;
                  const groupEntries = hasChildren
                    ? Object.entries(item.data).slice(0, 5)
                    : [];

                  return (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-gray-200 overflow-hidden bg-white"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          hasChildren
                            ? toggleMobileGroup(item.id)
                            : toggleMenu()
                        }
                        className="w-full flex items-center justify-between px-4 py-3 text-left font-semibold hover:bg-gray-50"
                      >
                        <span>{item.label}</span>
                        {hasChildren ? (
                          <span
                            className={`text-gray-500 transition-transform ${isOpen ? "rotate-90" : ""}`}
                          >
                            ›
                          </span>
                        ) : (
                          <span className="text-gray-400">›</span>
                        )}
                      </button>

                      {isOpen && hasChildren && (
                        <div className="border-t bg-gray-50 p-2 space-y-1">
                          <Link
                            href={item.href}
                            className="flex items-center justify-between px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm font-semibold text-blue-700"
                            onClick={toggleMenu}
                          >
                            Xem tất cả {item.label}
                            <span>›</span>
                          </Link>

                          {groupEntries.map(([key, group]: any) => (
                            <Link
                              key={key}
                              href={`${item.href}?group=${key}`}
                              className="flex items-center justify-between px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm hover:bg-blue-50"
                              onClick={toggleMenu}
                            >
                              <span className="flex items-center gap-2 min-w-0">
                                <span className="text-base">
                                  {(Icons as any)[key] || group.icon || "📦"}
                                </span>
                                <span className="truncate">{group.title}</span>
                              </span>
                              <span className="text-gray-400">›</span>
                            </Link>
                          ))}
                        </div>
                      )}

                      {!hasChildren && item.id === "THUOC" && (
                        <div className="border-t bg-gray-50 p-2 space-y-1">
                          <Link
                            href="/category/Thuốc?group=NhomTriLieu"
                            className="flex items-center justify-between px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm"
                            onClick={toggleMenu}
                          >
                            Nhóm trị liệu <span>›</span>
                          </Link>
                          <Link
                            href="/tra-cuu-thuoc"
                            className="flex items-center justify-between px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm"
                            onClick={toggleMenu}
                          >
                            Tra cứu thuốc <span>›</span>
                          </Link>
                        </div>
                      )}
                    </div>
                  );
                })}

                <Link
                  href="/he-thong-nha-thuoc"
                  className="flex items-center justify-between px-4 py-3 rounded-2xl border border-gray-200 bg-white"
                  onClick={toggleMenu}
                >
                  <span>HỆ THỐNG NHÀ THUỐC</span>
                  <span className="text-gray-400">›</span>
                </Link>
              </div>

              <div className="mt-4 px-6">
                {user ? (
                  <button
                    onClick={handleLogout}
                    className="w-full bg-gray-700 text-white py-3 rounded-2xl mb-2 font-semibold"
                  >
                    Đăng xuất
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="block w-full bg-red-600 text-white py-3 rounded-2xl mb-2 text-center font-bold shadow-md"
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
