"use client";
import React from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function Header() {
  const { totalItems } = useCart();

  return (
    <header className="bg-blue-700 text-white p-4 shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        {/* LOGO */}
        <Link
          href="/"
          className="flex flex-col font-bold leading-tight cursor-pointer"
        >
          <span className="text-sm text-yellow-400">Hệ thống chính hãng</span>
          <span className="text-2xl tracking-tighter uppercase">
            NHÀ THUỐC THIÊN HẬU
          </span>
        </Link>

        {/* THANH TÌM KIẾM */}
        <div className="flex-1 max-w-2xl mx-8 relative">
          <input
            type="text"
            placeholder="Tìm tên thuốc, bệnh lý, thực phẩm chức năng..."
            className="w-full py-2 px-4 rounded-full text-black outline-none shadow-lg"
          />
          <button className="absolute right-1 top-1 bottom-1 bg-blue-800 px-4 rounded-full hover:bg-blue-900">
            🔍
          </button>
        </div>

        {/* GIỎ HÀNG & ĐĂNG NHẬP */}
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center text-xs cursor-pointer hover:opacity-80">
            <span className="text-lg">👤</span>
            <span>Đăng nhập</span>
          </div>

          {/* NÚT GIỎ HÀNG (ĐÃ SỬA THÀNH LINK) */}
          <Link
            href="/checkout"
            className="flex items-center gap-2 bg-blue-800 px-4 py-2 rounded-full hover:bg-blue-900 transition relative shadow-md"
          >
            <span className="text-xl">🛒</span>
            <span className="font-bold">Giỏ hàng</span>
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* --- PHẦN MEGA MENU --- */}
      <div className="container mx-auto mt-4 relative">
        <ul className="flex gap-6 text-sm font-medium text-blue-100">
          {/* 1. THỰC PHẨM CHỨC NĂNG */}
          <li className="group py-2 cursor-pointer hover:text-white hover:underline flex items-center gap-1">
            <span>Thực phẩm chức năng</span>
            <svg
              className="w-3 h-3 transition-transform group-hover:rotate-180"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              ></path>
            </svg>
            <div className="absolute top-full left-0 w-full bg-white text-gray-800 shadow-2xl rounded-b-lg border-t border-gray-200 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 ease-in-out transform origin-top translate-y-2 group-hover:translate-y-0 z-50">
              <div className="flex h-[450px]">
                <div className="w-1/4 bg-gray-50 p-2 overflow-y-auto border-r">
                  <ul>
                    <li className="px-4 py-3 bg-blue-50 text-blue-700 font-bold rounded shadow-sm cursor-pointer flex justify-between items-center border-l-4 border-blue-600">
                      Vitamin & Khoáng chất <span className="text-xs">›</span>
                    </li>
                    <li className="px-4 py-3 hover:bg-white hover:text-blue-700 hover:font-bold cursor-pointer transition rounded">
                      Sinh lý - Nội tiết tố
                    </li>
                    <li className="px-4 py-3 hover:bg-white hover:text-blue-700 hover:font-bold cursor-pointer transition rounded">
                      Hỗ trợ tiêu hóa
                    </li>
                  </ul>
                </div>
                <div className="w-3/4 p-6 overflow-y-auto">
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="flex items-center gap-3 p-3 border rounded-lg hover:shadow-md cursor-pointer bg-white">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        💊
                      </div>
                      <span className="font-medium text-sm">
                        Bổ sung Canxi & Vitamin D
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 border rounded-lg hover:shadow-md cursor-pointer bg-white">
                      <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                        ⚡
                      </div>
                      <span className="font-medium text-sm">
                        Vitamin tổng hợp
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </li>

          {/* 2. DƯỢC MỸ PHẨM */}
          <li className="group py-2 cursor-pointer hover:text-white hover:underline flex items-center gap-1">
            <span>Dược mỹ phẩm</span>
            <svg
              className="w-3 h-3 transition-transform group-hover:rotate-180"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              ></path>
            </svg>
            <div className="absolute top-full left-0 w-full bg-white text-gray-800 shadow-2xl rounded-b-lg border-t border-gray-200 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 ease-in-out transform origin-top translate-y-2 group-hover:translate-y-0 z-50">
              <div className="flex h-[450px]">
                <div className="w-1/4 bg-gray-50 p-2 overflow-y-auto border-r">
                  <ul>
                    <li className="px-4 py-3 bg-white text-blue-700 font-bold rounded shadow-sm cursor-pointer flex justify-between items-center">
                      Chăm sóc da mặt <span className="text-xs">›</span>
                    </li>
                    <li className="px-4 py-3 hover:bg-white hover:text-blue-700 hover:font-bold cursor-pointer transition rounded">
                      Chăm sóc cơ thể
                    </li>
                  </ul>
                </div>
                <div className="w-3/4 p-6 overflow-y-auto">
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-3 p-3 border rounded-lg hover:shadow-md cursor-pointer hover:border-blue-500 transition bg-white">
                      <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-lg">
                        🧴
                      </div>
                      <span className="font-medium text-sm">Sữa rửa mặt</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </li>

          {/* 3. THUỐC */}
          <li className="group py-2 cursor-pointer hover:text-white hover:underline flex items-center gap-1">
            <span>Thuốc</span>
            <svg
              className="w-3 h-3 transition-transform group-hover:rotate-180"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              ></path>
            </svg>
            <div className="absolute top-full left-0 w-full bg-white text-gray-800 shadow-2xl rounded-b-lg border-t border-gray-200 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 ease-in-out transform origin-top translate-y-2 group-hover:translate-y-0 z-50">
              <div className="flex h-[450px]">
                <div className="w-1/4 bg-gray-50 p-2 border-r">
                  <ul>
                    <li className="px-4 py-4 bg-white text-blue-700 font-bold rounded-lg shadow-sm cursor-pointer flex items-center gap-3 border-l-4 border-blue-600 mb-2">
                      <span className="text-xl">💊</span> Tra cứu thuốc
                    </li>
                  </ul>
                </div>
                <div className="w-3/4 p-6 overflow-y-auto flex flex-col justify-between">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="flex items-center gap-3 p-4 border rounded-lg hover:shadow-md cursor-pointer bg-white group/card">
                      <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center text-2xl group-hover/card:bg-green-100">
                        🦠
                      </div>
                      <span className="font-semibold text-sm text-gray-700 group-hover/card:text-blue-700">
                        Thuốc kháng sinh, kháng nấm
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </li>

          {/* 4. CHĂM SÓC CÁ NHÂN */}
          <li className="group py-2 cursor-pointer hover:text-white hover:underline flex items-center gap-1">
            <span>Chăm sóc cá nhân</span>
            <svg
              className="w-3 h-3 transition-transform group-hover:rotate-180"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              ></path>
            </svg>
            <div className="absolute top-full left-0 w-full bg-white text-gray-800 shadow-2xl rounded-b-lg border-t border-gray-200 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 ease-in-out transform origin-top translate-y-2 group-hover:translate-y-0 z-50">
              <div className="flex h-[450px]">
                <div className="w-1/4 bg-gray-50 p-2 overflow-y-auto border-r">
                  <ul>
                    <li className="px-4 py-3 bg-blue-50 text-blue-700 font-bold rounded shadow-sm cursor-pointer flex justify-between items-center border-l-4 border-blue-600">
                      💍 Hỗ trợ tình dục <span className="text-xs">›</span>
                    </li>
                  </ul>
                </div>
                <div className="w-3/4 p-6 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="flex items-center gap-4 p-6 border rounded-xl hover:shadow-lg cursor-pointer bg-white group/banner">
                      <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-3xl group-hover/banner:bg-blue-100">
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
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </li>

          <li className="py-2 cursor-pointer hover:text-white hover:underline">
            Thiết bị y tế
          </li>
          <li className="py-2 cursor-pointer hover:text-white hover:underline">
            Bệnh & Góc sức khỏe
          </li>
          <li className="py-2 cursor-pointer hover:text-white hover:underline">
            Hệ thống nhà thuốc
          </li>
        </ul>
      </div>
    </header>
  );
}
