"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/lib/supabaseClient";

// Import các file đã tách
import { Icons } from "./icons";
import { TPCN_DATA, DMP_DATA } from "./data";
import { GridItem, SmallItem, ProductCard } from "./sub-components";

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

  // Hàm render nội dung Mega Menu tự động từ DATA
  const renderContent = (dataConfig: any, pathPrefix: string) => {
    const activeData = dataConfig[activeMegaTab];
    if (!activeData || !activeData.items || activeData.items.length === 0) {
      return (
        <div className="animate-fade-in flex h-full items-center justify-center text-gray-400">
          <p>Nội dung đang cập nhật...</p>
        </div>
      );
    }

    return (
      <div className="animate-fade-in">
        <div className="flex items-center gap-2 mb-6 pb-2 border-b">
          {/* Lấy Icon từ object Icons nếu có, hoặc dùng text */}
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
                href={`/category/${pathPrefix}?sub=${item.sub}`}
                sticker={item.sticker}
                title={item.title}
                bg={item.bg}
              />
            ) : (
              <GridItem
                key={idx}
                href={`/category/${pathPrefix}?sub=${item.sub}`}
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
      {/* TẦNG 1: LOGO & TÌM KIẾM (GIỮ NGUYÊN) */}
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

      {/* TẦNG 2: MEGA MENU */}
      <div className="hidden md:block bg-blue-800/50 relative">
        <div className="container mx-auto">
          <ul className="flex justify-center gap-6 text-sm font-medium text-white px-4">
            {/* 1. THỰC PHẨM CHỨC NĂNG */}
            <li
              className="group py-3 cursor-pointer hover:text-yellow-300 flex items-center gap-1 static"
              onMouseEnter={() => setActiveMegaTab("Vitamin")}
            >
              <Link href="/category/Thực phẩm chức năng">
                Thực phẩm chức năng
              </Link>{" "}
              <span className="text-xs">▼</span>
              <div className="absolute top-full left-0 w-full bg-white text-gray-800 shadow-2xl border-t border-gray-200 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 z-40 origin-top text-left">
                <div className="container mx-auto flex h-[500px]">
                  <div className="w-1/4 bg-gray-50 p-2 overflow-y-auto border-r">
                    <ul className="space-y-1">
                      {Object.keys(TPCN_DATA).map((key) => (
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
                            href={`/category/Thực phẩm chức năng?sub=${key}`}
                            className="flex items-center gap-3 w-full"
                          >
                            {(Icons as any)[key]} {TPCN_DATA[key].title}
                          </Link>
                          <span className="text-xs">›</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="w-3/4 p-8 overflow-y-auto bg-white">
                    {renderContent(TPCN_DATA, "TPCN")}
                    {/* Bán chạy nhất của TPCN */}
                    <div className="mt-4 border-t pt-4">
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
                  </div>
                </div>
              </div>
            </li>

            {/* 2. DƯỢC MỸ PHẨM */}
            <li
              className="group py-3 cursor-pointer hover:text-yellow-300 flex items-center gap-1 static"
              onMouseEnter={() => setActiveMegaTab("ChamSocDaMat")}
            >
              <Link href="/category/Dược mỹ phẩm">Dược mỹ phẩm</Link>{" "}
              <span className="text-xs">▼</span>
              <div className="absolute top-full left-0 w-full bg-white text-gray-800 shadow-2xl rounded-b-lg border-t border-gray-200 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 z-40 origin-top text-left">
                <div className="container mx-auto flex h-[500px]">
                  <div className="w-1/4 bg-gray-50 p-2 overflow-y-auto border-r">
                    <ul className="space-y-1">
                      {[
                        { id: "ChamSocDaMat", icon: "💆‍♀️" },
                        { id: "ChamSocCoThe", icon: "🧖‍♀️" },
                        { id: "GiaiPhapLanDa", icon: "🧴" },
                        { id: "ChamSocToc", icon: "💇‍♀️" },
                        { id: "TrangDiem", icon: "💄" },
                        { id: "VungMat", icon: "👁️" },
                        { id: "ThienNhien", icon: "🌿" },
                      ].map((item) => (
                        <li
                          key={item.id}
                          onMouseEnter={() => setActiveMegaTab(item.id)}
                          className={`px-4 py-3 font-bold rounded cursor-pointer flex justify-between items-center transition ${
                            activeMegaTab === item.id
                              ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600"
                              : "hover:bg-white text-gray-600 hover:text-blue-700"
                          }`}
                        >
                          <Link
                            href={`/category/Dược mỹ phẩm?sub=${
                              DMP_DATA[item.id].title
                            }`}
                            className="flex items-center gap-2 w-full"
                          >
                            <span className="text-xl">{item.icon}</span>{" "}
                            {DMP_DATA[item.id].title}
                          </Link>
                          <span className="text-xs">›</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="w-3/4 p-6 overflow-y-auto bg-white">
                    {renderContent(DMP_DATA, "DMP")}
                    <div className="mt-8">
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
                          title="Gel rửa mặt giảm mụn Decumar"
                          price="65.000đ"
                          oldPrice="85.000đ"
                          discount="-25%"
                          img="https://cdn.nhathuoclongchau.com.vn/unsafe/375x0/filters:quality(90)/https://cms-prod.s3-sgn09.fptcloud.com/00029380_gel-rua-mat-giam-mun-decumar-advanced-100g_5990_62ad_large_f27702220e.jpg"
                          unit=""
                        />
                        <ProductCard
                          title="Sữa rửa mặt Sắc Ngọc Khang"
                          price="69.000đ"
                          unit="/ Tuýp"
                          img="https://cdn.nhathuoclongchau.com.vn/unsafe/375x0/filters:quality(90)/https://cms-prod.s3-sgn09.fptcloud.com/00021396_sua-rua-mat-sac-ngoc-khang-100g-sang-da-ngua-mun-nam-tan-nhang-3932-5d54_large_3743ec34aa.jpg"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </li>

            {/* 3. THUỐC */}
            <li
              className="group py-3 cursor-pointer hover:text-yellow-300 flex items-center gap-1 static"
              onMouseEnter={() => setActiveMegaTab("TraCuuThuoc")}
            >
              <Link href="/category/Thuốc">Thuốc</Link>{" "}
              <span className="text-xs">▼</span>
              <div className="absolute top-full left-0 w-full bg-white text-gray-800 shadow-2xl rounded-b-lg border-t border-gray-200 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 z-40 origin-top text-left">
                <div className="container mx-auto flex h-[500px]">
                  <div className="w-1/4 bg-gray-50 p-2 border-r">
                    <ul className="space-y-1">
                      {[
                        { id: "TraCuuThuoc", l: "Tra cứu thuốc", i: "💊" },
                        {
                          id: "TraCuuDuocChat",
                          l: "Tra cứu dược chất",
                          i: "⚗️",
                        },
                        {
                          id: "TraCuuDuocLieu",
                          l: "Tra cứu dược liệu",
                          i: "🌿",
                        },
                      ].map((item) => (
                        <li
                          key={item.id}
                          onMouseEnter={() => setActiveMegaTab(item.id)}
                          className={`px-4 py-4 font-bold rounded-lg cursor-pointer flex items-center gap-3 mb-2 transition ${
                            activeMegaTab === item.id
                              ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600"
                              : "hover:bg-white text-gray-600 hover:text-blue-700"
                          }`}
                        >
                          <span className="text-xl">{item.i}</span> {item.l}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="w-3/4 p-6 overflow-y-auto">
                    {activeMegaTab === "TraCuuThuoc" && (
                      <div className="animate-fade-in grid grid-cols-3 gap-4 mb-6">
                        {[
                          { t: "Thuốc kháng sinh", i: "🦠", bg: "bg-green-50" },
                          {
                            t: "Thuốc điều trị ung thư",
                            i: "🧬",
                            bg: "bg-red-50",
                          },
                          { t: "Thuốc tim mạch", i: "❤️", bg: "bg-pink-50" },
                          { t: "Thuốc thần kinh", i: "🧠", bg: "bg-purple-50" },
                          { t: "Thuốc tiêu hóa", i: "🤢", bg: "bg-yellow-50" },
                        ].map((i, x) => (
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
                  </div>
                </div>
              </div>
            </li>

            {/* 4. CHĂM SÓC CÁ NHÂN */}
            <li
              className="group py-3 cursor-pointer hover:text-yellow-300 flex items-center gap-1 static"
              onMouseEnter={() => setActiveMegaTab("HoTroTinhDuc")}
            >
              <Link href="/category/Chăm sóc cá nhân">Chăm sóc cá nhân</Link>{" "}
              <span className="text-xs">▼</span>
              <div className="absolute top-full left-0 w-full bg-white text-gray-800 shadow-2xl rounded-b-lg border-t border-gray-200 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 z-40 origin-top text-left">
                <div className="container mx-auto flex h-[500px]">
                  <div className="w-1/4 bg-gray-50 p-2 overflow-y-auto border-r">
                    <ul className="space-y-1">
                      {[
                        { id: "HoTroTinhDuc", l: "Hỗ trợ tình dục", i: "💍" },
                        {
                          id: "ThucPhamDoUong",
                          l: "Thực phẩm - Đồ uống",
                          i: "🍹",
                        },
                        { id: "VeSinhCaNhan", l: "Vệ sinh cá nhân", i: "🚿" },
                        { id: "RangMieng", l: "Chăm sóc răng miệng", i: "🦷" },
                        { id: "DoDung", l: "Đồ dùng gia đình", i: "🏠" },
                      ].map((item) => (
                        <li
                          key={item.id}
                          onMouseEnter={() => setActiveMegaTab(item.id)}
                          className={`px-4 py-3 font-bold rounded cursor-pointer flex justify-between items-center transition ${
                            activeMegaTab === item.id
                              ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600"
                              : "hover:bg-white text-gray-600 hover:text-blue-700"
                          }`}
                        >
                          <Link
                            href={`/category/CSCN?sub=${item.l}`}
                            className="flex items-center gap-2 w-full"
                          >
                            <span className="text-xl">{item.i}</span> {item.l}
                          </Link>
                          <span className="text-xs">›</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="w-3/4 p-6 overflow-y-auto">
                    {activeMegaTab === "HoTroTinhDuc" && (
                      <div className="animate-fade-in">
                        <div className="grid grid-cols-2 gap-6 mb-8">
                          <Link
                            href="#"
                            className="flex items-center gap-4 p-6 border rounded-xl hover:shadow-lg bg-white group/banner"
                          >
                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-3xl">
                              🛡️
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-800 text-lg group-hover/banner:text-blue-700">
                                Bao cao su
                              </h4>
                              <p className="text-gray-500 text-sm">
                                Đa dạng, an toàn, kín đáo
                              </p>
                            </div>
                          </Link>
                          <Link
                            href="#"
                            className="flex items-center gap-4 p-6 border rounded-xl hover:shadow-lg bg-white group/banner"
                          >
                            <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center text-3xl">
                              💧
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-800 text-lg group-hover/banner:text-blue-700">
                                Gel bôi trơn
                              </h4>
                              <p className="text-gray-500 text-sm">
                                Mượt mà, tăng khoái cảm
                              </p>
                            </div>
                          </Link>
                        </div>
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-bold text-gray-800">
                            Bán chạy nhất
                          </h4>
                          <span className="text-blue-600 text-xs cursor-pointer hover:underline">
                            Xem tất cả ›
                          </span>
                        </div>
                        <div className="flex gap-4 overflow-x-auto pb-4">
                          <ProductCard
                            title="Bao cao su Okamoto..."
                            price="164.000đ"
                            unit=""
                            discount="-20%"
                            img="[Ảnh Okamoto]"
                          />
                          <ProductCard
                            title="Bao cao su Sagami..."
                            price="118.000đ"
                            unit=""
                            discount="-15%"
                            img="[Ảnh Sagami]"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </li>

            {/* 5. THIẾT BỊ Y TẾ */}
            <li
              className="group py-3 cursor-pointer hover:text-yellow-300 flex items-center gap-1 static"
              onMouseEnter={() => setActiveMegaTab("DungCuYTe")}
            >
              <Link href="/category/Thiết bị y tế">Thiết bị y tế</Link>{" "}
              <span className="text-xs">▼</span>
              <div className="absolute top-full left-0 w-full bg-white text-gray-800 shadow-2xl rounded-b-lg border-t border-gray-200 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 z-40 origin-top text-left">
                <div className="container mx-auto flex h-[500px]">
                  <div className="w-1/4 bg-gray-50 p-2 border-r">
                    <ul className="space-y-1">
                      {[
                        { id: "DungCuYTe", l: "Dụng cụ y tế", i: "💉" },
                        { id: "DungCuTheoDoi", l: "Dụng cụ theo dõi", i: "🩺" },
                        { id: "DungCuSoCuu", l: "Dụng cụ sơ cứu", i: "🚑" },
                        { id: "KhauTrang", l: "Khẩu trang y tế", i: "😷" },
                        { id: "ThietBiHoTro", l: "Thiết bị hỗ trợ", i: "🦽" },
                      ].map((item) => (
                        <li
                          key={item.id}
                          onMouseEnter={() => setActiveMegaTab(item.id)}
                          className={`px-4 py-3 font-bold rounded cursor-pointer flex justify-between items-center transition ${
                            activeMegaTab === item.id
                              ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600"
                              : "hover:bg-white text-gray-600 hover:text-blue-700"
                          }`}
                        >
                          <Link
                            href={`/category/TBYT?sub=${item.l}`}
                            className="flex items-center gap-2 w-full"
                          >
                            <span className="text-xl">{item.i}</span> {item.l}
                          </Link>
                          <span className="text-xs">›</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="w-3/4 p-6 overflow-y-auto">
                    {activeMegaTab === "DungCuYTe" && (
                      <div className="animate-fade-in grid grid-cols-3 gap-6 mb-8">
                        {[
                          { t: "Kim tiêm, bơm tiêm", i: "💉" },
                          { t: "Bông băng gạc", i: "🩹" },
                          { t: "Que thử đường huyết", i: "🧪" },
                        ].map((x, i) => (
                          <Link
                            key={i}
                            href="#"
                            className="flex items-center gap-4 p-4 border rounded-xl hover:shadow-lg bg-white group/item"
                          >
                            <div className="text-3xl">{x.i}</div>
                            <span className="font-bold text-gray-700 group-hover/item:text-blue-700">
                              {x.t}
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}
                    {activeMegaTab === "DungCuTheoDoi" && (
                      <div className="animate-fade-in grid grid-cols-2 gap-6 mb-8">
                        <Link
                          href="#"
                          className="flex items-center gap-4 p-6 border rounded-xl hover:shadow-lg bg-white group/banner"
                        >
                          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-3xl">
                            🌡️
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-800 text-lg group-hover/banner:text-blue-700">
                              Nhiệt kế
                            </h4>
                            <p className="text-gray-500 text-sm">
                              Đo nhiệt độ chính xác
                            </p>
                          </div>
                        </Link>
                        <Link
                          href="#"
                          className="flex items-center gap-4 p-6 border rounded-xl hover:shadow-lg bg-white group/banner"
                        >
                          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-3xl">
                            🩸
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-800 text-lg group-hover/banner:text-blue-700">
                              Máy đo huyết áp
                            </h4>
                            <p className="text-gray-500 text-sm">
                              Theo dõi sức khỏe tại nhà
                            </p>
                          </div>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </li>

            {/* 6. BỆNH & GÓC SỨC KHỎE */}
            <li className="group py-3 cursor-pointer hover:text-yellow-300 flex items-center gap-1 static">
              <Link href="#">Bệnh & Góc sức khỏe</Link>{" "}
              <span className="text-xs">▼</span>
              <div className="absolute top-full left-0 w-full bg-white text-gray-800 shadow-2xl rounded-b-lg border-t border-gray-200 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 z-40 origin-top text-left">
                <div className="container mx-auto flex h-[500px]">
                  <div className="w-1/4 bg-gray-50 p-2 border-r">
                    <ul>
                      <li className="px-4 py-3 bg-blue-50 text-blue-700 font-bold rounded shadow-sm cursor-pointer flex justify-between items-center border-l-4 border-blue-600">
                        <Link
                          href="#"
                          className="flex items-center gap-2 w-full"
                        >
                          <span className="text-xl">🩺</span> Góc sức khỏe
                        </Link>
                        <span className="text-xs">›</span>
                      </li>
                      {[
                        { t: "Chuyên trang ung thư", i: "🧬" },
                        { t: "Bệnh thường gặp", i: "🤕" },
                        { t: "Tin khuyến mại", i: "🎉" },
                        { t: "Truyền Thông", i: "🌟" },
                      ].map((x, i) => (
                        <li
                          key={i}
                          className="px-4 py-3 hover:bg-white hover:text-blue-700 hover:font-bold cursor-pointer transition rounded flex items-center gap-2"
                        >
                          <Link
                            href="#"
                            className="flex items-center gap-2 w-full"
                          >
                            <span className="text-xl">{x.i}</span> {x.t}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="w-3/4 p-8 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div className="flex flex-col gap-2 group cursor-pointer">
                        <div className="h-40 bg-gray-100 rounded-lg overflow-hidden relative">
                          <div className="w-full h-full bg-blue-100 flex items-center justify-center text-gray-400">
                            [Ảnh bài viết 1]
                          </div>
                        </div>
                        <h4 className="font-bold text-gray-800 text-lg group-hover:text-blue-600 line-clamp-2">
                          5 Dấu hiệu cảnh báo bệnh tiểu đường bạn không nên bỏ
                          qua
                        </h4>
                        <p className="text-sm text-gray-500 line-clamp-2">
                          Tiểu đường là căn bệnh nguy hiểm nhưng thường diễn
                          biến âm thầm...
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 group cursor-pointer">
                        <div className="h-40 bg-gray-100 rounded-lg overflow-hidden relative">
                          <div className="w-full h-full bg-green-100 flex items-center justify-center text-gray-400">
                            [Ảnh bài viết 2]
                          </div>
                        </div>
                        <h4 className="font-bold text-gray-800 text-lg group-hover:text-blue-600 line-clamp-2">
                          Bí quyết tăng cường sức đề kháng cho trẻ khi giao mùa
                        </h4>
                        <p className="text-sm text-gray-500 line-clamp-2">
                          Thời tiết thay đổi thất thường khiến trẻ dễ ốm vặt...
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </li>
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
              {[
                "Thực phẩm chức năng",
                "Dược mỹ phẩm",
                "Thuốc",
                "Chăm sóc cá nhân",
                "Thiết bị y tế",
              ].map((cat) => (
                <Link
                  key={cat}
                  href={`/category/${cat}`}
                  className="block px-6 py-3 hover:bg-gray-100 border-b"
                  onClick={toggleMenu}
                >
                  {cat}
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
