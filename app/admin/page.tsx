"use client";
import React from "react";
import Link from "next/link";

import AdminHomepageManager from "@/components/admin/AdminHomepageManager";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span>📊</span> Bảng Điều Khiển
        </h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {/* 1. Sản phẩm */}
          <Link
            href="/admin/products"
            className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-md border-2 border-transparent hover:border-blue-500 hover:shadow-xl transition cursor-pointer group"
          >
            <div className="text-5xl mb-3 group-hover:scale-110 transition">
              📦
            </div>
            <h3 className="text-xl font-bold text-blue-800 text-center">
              Danh sách SP
            </h3>
            <p className="text-gray-500 text-xs mt-1 text-center">
              Quản lý & Chỉnh sửa
            </p>
          </Link>

          {/* 1b. Thêm sản phẩm */}
          <Link
            href="/admin/add"
            className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-md border-2 border-transparent hover:border-yellow-500 hover:shadow-xl transition cursor-pointer group"
          >
            <div className="text-5xl mb-3 group-hover:scale-110 transition">
              ➕
            </div>
            <h3 className="text-xl font-bold text-yellow-700 text-center">
              Thêm sản phẩm
            </h3>
            <p className="text-gray-500 text-xs mt-1 text-center">
              Tạo sản phẩm mới
            </p>
          </Link>

          {/* 2. Kho hàng */}
          <Link
            href="/admin/inventory"
            className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-md border-2 border-transparent hover:border-green-500 hover:shadow-xl transition cursor-pointer group"
          >
            <div className="text-5xl mb-3 group-hover:scale-110 transition">
              🏢
            </div>
            <h3 className="text-xl font-bold text-green-700 text-center">
              Kho hàng
            </h3>
            <p className="text-gray-500 text-xs mt-1 text-center">
              Cập nhật giá & Tồn kho
            </p>
          </Link>

          {/* 3. Đơn hàng */}
          <Link
            href="/admin/orders"
            className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-md border-2 border-transparent hover:border-orange-500 hover:shadow-xl transition cursor-pointer group"
          >
            <div className="text-5xl mb-3 group-hover:scale-110 transition">
              🛒
            </div>
            <h3 className="text-xl font-bold text-orange-700 text-center">
              Đơn hàng
            </h3>
            <p className="text-gray-500 text-xs mt-1 text-center">
              Xử lý đơn khách đặt
            </p>
          </Link>

          {/* 4. Mã giảm giá */}
          <Link
            href="/admin/coupons"
            className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-md border-2 border-transparent hover:border-purple-500 hover:shadow-xl transition cursor-pointer group"
          >
            <div className="text-5xl mb-3 group-hover:scale-110 transition">
              🎫
            </div>
            <h3 className="text-xl font-bold text-purple-700 text-center">
              Khuyến mãi
            </h3>
            <p className="text-gray-500 text-xs mt-1 text-center">
              Quản lý mã Coupon
            </p>
          </Link>

          {/* 5. Banner */}
          <Link
            href="/admin/banners"
            className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-md border-2 border-transparent hover:border-pink-500 hover:shadow-xl transition cursor-pointer group"
          >
            <div className="text-5xl mb-3 group-hover:scale-110 transition">
              🖼️
            </div>
            <h3 className="text-xl font-bold text-pink-700 text-center">
              Banner
            </h3>
            <p className="text-gray-500 text-xs mt-1 text-center">
              Đổi ảnh bìa trang chủ
            </p>
          </Link>

          {/* 6. Flash Sale */}
          <Link
            href="/admin/flash-sale"
            className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-md border-2 border-transparent hover:border-red-500 hover:shadow-xl transition cursor-pointer group"
          >
            <div className="text-5xl mb-3 group-hover:scale-110 transition">
              ⚡
            </div>
            <h3 className="text-xl font-bold text-red-600 text-center">
              Flash Sale
            </h3>
            <p className="text-gray-500 text-xs mt-1 text-center">
              Sale chớp nhoáng
            </p>
          </Link>

          {/* 7. Đồng bộ giá */}
          <Link
            href="/admin/sync-prices"
            className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-md border-2 border-transparent hover:border-cyan-500 hover:shadow-xl transition cursor-pointer group"
          >
            <div className="text-5xl mb-3 group-hover:scale-110 transition">
              📊
            </div>
            <h3 className="text-xl font-bold text-cyan-700 text-center">
              Đồng bộ giá
            </h3>
            <p className="text-gray-500 text-xs mt-1 text-center">
              Cập nhật từ Excel Sapo
            </p>
          </Link>

          {/* 8. Địa chỉ nhà thuốc */}
          <Link
            href="/admin/stores"
            className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-md border-2 border-transparent hover:border-teal-500 hover:shadow-xl transition cursor-pointer group"
          >
            <div className="text-5xl mb-3 group-hover:scale-110 transition">
              📍
            </div>
            <h3 className="text-xl font-bold text-teal-700 text-center">
              Chi nhánh
            </h3>
            <p className="text-gray-500 text-xs mt-1 text-center">
              Địa chỉ & Bản đồ
            </p>
          </Link>

          {/* 9. Quản lý SKU */}
          <Link
            href="/admin/manage-sku"
            className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-md border-2 border-transparent hover:border-indigo-500 hover:shadow-xl transition cursor-pointer group"
          >
            <div className="text-5xl mb-3 group-hover:scale-110 transition">
              🏷️
            </div>
            <h3 className="text-xl font-bold text-indigo-700 text-center">
              Quản lý SKU
            </h3>
            <p className="text-gray-500 text-xs mt-1 text-center">
              Cập nhật SKU hàng loạt
            </p>
          </Link>

          {/* 10. Sản phẩm bán chạy */}
          <Link
            href="/admin/best-sellers"
            className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-md border-2 border-transparent hover:border-orange-500 hover:shadow-xl transition cursor-pointer group"
          >
            <div className="text-5xl mb-3 group-hover:scale-110 transition">
              🔥
            </div>
            <h3 className="text-xl font-bold text-orange-600 text-center">
              Bán chạy
            </h3>
            <p className="text-gray-500 text-xs mt-1 text-center">
              Quản lý sản phẩm nổi bật
            </p>
          </Link>
        </div>

        {/* Quản lý sản phẩm trang chủ */}
        <AdminHomepageManager />
      </div>
    </div>
  );
}
