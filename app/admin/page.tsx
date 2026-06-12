"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

// CẤU HÌNH ADMIN (Lưu ý: Không đổi email này để khớp logic bảo vệ layout)
const ADMIN_EMAIL = "tranthienhaudau2@gmail.com";

export default function AdminDashboard() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form Đăng nhập
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoginError("Sai email hoặc mật khẩu!");
    } else {
      // Thành công, layout sẽ tự động kiểm tra quyền và render lại header Dashboard
      window.location.reload();
    }
    setIsLoggingIn(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">
        Đang tải hệ thống...
      </div>
    );
  }

  // --- NẾU CHƯA ĐĂNG NHẬP -> HIỆN FORM ĐĂNG NHẬP DÀNH CHO ADMIN ---
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
              🛡️
            </div>
            <h1 className="text-2xl font-bold text-gray-800">
              ĐĂNG NHẬP ADMIN
            </h1>
            <p className="text-gray-500 text-sm mt-2">
              Quản trị viên Nhà Thuốc
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="admin@thienhau.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Mật khẩu
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="••••••••"
                required
              />
            </div>

            {loginError && (
              <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center font-medium">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition"
            >
              {isLoggingIn ? "Đang xử lý..." : "Đăng nhập hệ thống"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- NẾU ĐÃ ĐĂNG NHẬP VÀ ĐƯỢC CHỨNG NHẬN LÀ ADMIN (THÔNG QUA LAYOUT) -> HIỆN DASHBOARD CHÍNH ---
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
              Sản phẩm
            </h3>
            <p className="text-gray-500 text-xs mt-1 text-center">
              Quản lý danh sách SP
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
        </div>
      </div>
    </div>
  );
}
