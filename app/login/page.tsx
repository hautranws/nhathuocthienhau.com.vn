"use client";
import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

// --- QUAN TRỌNG: KHAI BÁO EMAIL CỦA BẠN Ở ĐÂY ---
const ADMIN_EMAIL = "admin@gmail.com"; // <--- Thay bằng email admin của bạn
// -----------------------------------------------

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (isLogin) {
        // --- 1. LOGIC ĐĂNG NHẬP ---
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        // --- 2. PHÂN LUỒNG NGƯỜI DÙNG ---
        // Nếu email trùng với Admin -> Vào trang quản trị
        if (email === ADMIN_EMAIL) {
          router.push("/admin");
        } else {
          // Nếu là khách hàng bình thường -> Về trang chủ mua sắm
          router.push("/");
        }

        router.refresh();
      } else {
        // --- LOGIC ĐĂNG KÝ ---
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;

        setMessage("✅ Đăng ký thành công! Hãy kiểm tra Email xác nhận.");
      }
    } catch (error: any) {
      setMessage(`❌ Lỗi: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 font-sans p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-blue-800 uppercase tracking-tighter">
            Nhà Thuốc Thiên Hậu
          </h1>
          <p className="text-gray-500 text-sm mt-2">Đăng nhập hệ thống</p>
        </div>

        <div className="flex border-b mb-6">
          <button
            onClick={() => {
              setIsLogin(true);
              setMessage("");
            }}
            className={`flex-1 py-3 text-sm font-bold ${
              isLogin
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-400 hover:text-blue-500"
            }`}
          >
            ĐĂNG NHẬP
          </button>
          <button
            onClick={() => {
              setIsLogin(false);
              setMessage("");
            }}
            className={`flex-1 py-3 text-sm font-bold ${
              !isLogin
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-400 hover:text-blue-500"
            }`}
          >
            ĐĂNG KÝ
          </button>
        </div>

        {message && (
          <div
            className={`p-3 rounded mb-4 text-sm ${
              message.includes("❌")
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition shadow-lg disabled:bg-gray-400"
          >
            {loading
              ? "Đang xử lý..."
              : isLogin
              ? "ĐĂNG NHẬP"
              : "ĐĂNG KÝ TÀI KHOẢN"}
          </button>
        </form>

        {isLogin && (
          <div className="text-center mt-4">
            <a href="#" className="text-sm text-blue-500 hover:underline">
              Quên mật khẩu?
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
