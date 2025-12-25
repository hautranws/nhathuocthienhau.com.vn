"use client";
import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

// --- QUAN TRỌNG: KHAI BÁO EMAIL CỦA BẠN Ở ĐÂY ---
const ADMIN_EMAIL = "admin@gmail.com";
// -----------------------------------------------

export default function LoginPage() {
  const router = useRouter();

  // --- STATE CŨ ---
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // --- STATE MỚI ---
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  // --- 1. LOGIC XỬ LÝ EMAIL ---
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (isLogin) {
        // Đăng nhập
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        checkUserAndRedirect(email);
      } else {
        // Đăng ký
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

  // --- 2. LOGIC GOOGLE (Supabase tự động Đăng ký nếu chưa có tk) ---
  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) setMessage(`❌ Lỗi Google: ${error.message}`);
    setLoading(false);
  };

  // --- 3. LOGIC PHONE (Supabase tự động Đăng ký nếu chưa có tk) ---
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return setMessage("❌ Vui lòng nhập số điện thoại");
    setLoading(true);
    setMessage("");

    let formattedPhone = phone.trim();
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "+84" + formattedPhone.substring(1);
    }

    try {
      // Hàm này hoạt động cho cả Đăng nhập và Đăng ký
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });
      if (error) throw error;

      setOtpSent(true);
      setMessage("✅ Mã OTP đã được gửi!");
    } catch (error: any) {
      setMessage(`❌ Lỗi gửi OTP: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // --- 4. XÁC THỰC OTP ---
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let formattedPhone = phone.trim();
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "+84" + formattedPhone.substring(1);
    }

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp,
        type: "sms",
      });
      if (error) throw error;

      // Thông báo chung cho cả đăng ký và đăng nhập
      setMessage("✅ Xác thực thành công!");

      if (data.user) {
        router.push("/");
      }
    } catch (error: any) {
      setMessage(`❌ Mã OTP không đúng hoặc hết hạn: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const checkUserAndRedirect = (emailCheck: string) => {
    if (emailCheck === ADMIN_EMAIL) {
      router.push("/admin");
    } else {
      router.push("/");
    }
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 font-sans p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-blue-800 uppercase tracking-tighter">
            Nhà Thuốc Thiên Hậu
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            Đăng nhập / Đăng ký hệ thống
          </p>
        </div>

        {/* --- TAB CHỌN LOGIN / REGISTER --- */}
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
              // Không reset loginMethod về email nữa để khách có thể chọn Đăng ký bằng SĐT
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

        {/* --- HIỂN THỊ THÔNG BÁO --- */}
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

        {/* --- [ĐÃ SỬA] CHUYỂN ĐỔI EMAIL / SĐT (Hiện ở CẢ 2 tab) --- */}
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => {
              setLoginMethod("email");
              setMessage("");
            }}
            className={`flex-1 text-xs py-2 rounded border ${
              loginMethod === "email"
                ? "bg-blue-100 border-blue-300 text-blue-800 font-bold"
                : "bg-gray-50 text-gray-600"
            }`}
          >
            📧 Email
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginMethod("phone");
              setMessage("");
            }}
            className={`flex-1 text-xs py-2 rounded border ${
              loginMethod === "phone"
                ? "bg-blue-100 border-blue-300 text-blue-800 font-bold"
                : "bg-gray-50 text-gray-600"
            }`}
          >
            📱 Số điện thoại
          </button>
        </div>

        {/* --- FORM 1: EMAIL (Login & Register Logic riêng) --- */}
        {loginMethod === "email" && (
          <form onSubmit={handleEmailAuth} className="space-y-4">
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
        )}

        {/* --- FORM 2: PHONE (Dùng chung cho cả Login/Register) --- */}
        {/* [ĐÃ SỬA] Bỏ điều kiện isLogin để hiện ở cả tab Đăng ký */}
        {loginMethod === "phone" && (
          <form
            onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}
            className="space-y-4"
          >
            {!otpSent ? (
              // Bước 1: Nhập số điện thoại
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0912345678"
                  className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition shadow-lg disabled:bg-gray-400"
                >
                  {/* Thay đổi text nút bấm tùy theo đang ở tab nào */}
                  {loading
                    ? "Đang gửi..."
                    : isLogin
                    ? "GỬI MÃ OTP (ĐĂNG NHẬP)"
                    : "GỬI MÃ OTP (ĐĂNG KÝ)"}
                </button>
              </div>
            ) : (
              // Bước 2: Nhập mã OTP
              <div>
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-600">
                    Mã xác thực đã gửi tới <b>{phone}</b>
                  </p>
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="text-xs text-blue-500 underline"
                  >
                    Gửi lại / Đổi số
                  </button>
                </div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nhập mã OTP
                </label>
                <input
                  type="text"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-center tracking-widest text-xl font-bold"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition shadow-lg disabled:bg-gray-400"
                >
                  {loading ? "Đang kiểm tra..." : "XÁC NHẬN"}
                </button>
              </div>
            )}
          </form>
        )}

        {/* --- LINK QUÊN MẬT KHẨU (CHỈ CHO EMAIL + LOGIN) --- */}
        {isLogin && loginMethod === "email" && (
          <div className="text-center mt-4">
            <a href="#" className="text-sm text-blue-500 hover:underline">
              Quên mật khẩu?
            </a>
          </div>
        )}

        {/* --- SOCIAL LOGIN (Hiện ở CẢ 2 tab) --- */}
        {/* [ĐÃ SỬA] Bỏ điều kiện isLogin để hiện ở cả tab Đăng ký */}
        <>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                {isLogin ? "Hoặc đăng nhập với" : "Hoặc đăng ký với"}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {/* Nút Google */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                className="w-5 h-5"
                alt="Google"
              />
              <span className="text-gray-700 font-medium">Google</span>
            </button>
          </div>
        </>
      </div>
    </div>
  );
}
