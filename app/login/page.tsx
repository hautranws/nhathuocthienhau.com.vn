"use client";
import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

const ADMIN_EMAIL = "admin@thienhau.com";
const ADMIN_PHONE_CORE = "989217112"; // 9 số cuối của SĐT Admin

export default function LoginPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  
  // State cho SĐT
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  // [MỚI] State cho Email
  const [isEmailMode, setIsEmailMode] = useState(false); // false = SĐT, true = Email
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // --- GỬI OTP QUA SMS ---
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
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });
      if (error) throw error;

      setOtpSent(true);
      setMessage("");
    } catch (error: any) {
      setMessage(`❌ Lỗi gửi mã: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // --- XÁC THỰC MÃ OTP ---
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

      if (data.user) {
        router.push("/");
        router.refresh();
      }
    } catch (error: any) {
      setMessage(`❌ Mã OTP không đúng hoặc hết hạn.`);
    } finally {
      setLoading(false);
    }
  };

  // --- [MỚI] ĐĂNG NHẬP BẰNG EMAIL & PASSWORD ---
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return setMessage("❌ Vui lòng nhập email và mật khẩu");
    
    setLoading(true);
    setMessage("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) throw error;

      if (data.user) {
        // Đăng nhập thành công
        router.push("/");
        router.refresh();
      }
    } catch (error: any) {
      setMessage(`❌ Đăng nhập thất bại: Sai email hoặc mật khẩu.`);
    } finally {
      setLoading(false);
    }
  };

  // --- ĐĂNG NHẬP GOOGLE ---
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 font-sans p-4 relative overflow-hidden">
      {/* Nút đóng (Về trang chủ) */}
      <Link href="/" className="absolute top-4 right-4 text-gray-500 hover:text-black">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </Link>

      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md relative animate-fade-in-up">
        
        {/* --- TITLE --- */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            {isEmailMode ? "Đăng nhập bằng Email" : "Đăng nhập"}
          </h1>
          <p className="text-gray-500 text-sm mt-2 px-4">
            Vui lòng đăng nhập để hưởng những đặc quyền dành cho thành viên.
          </p>
        </div>

        {/* --- TIỆN ÍCH (ICON) --- */}
        <div className="flex justify-between items-start text-center mb-8 gap-2">
           <div className="flex-1 flex flex-col items-center">
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-2">
                 <span className="text-xl">🚚</span>
              </div>
              <p className="text-xs text-gray-600 font-medium">Miễn phí vận chuyển</p>
           </div>
           <div className="flex-1 flex flex-col items-center">
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-2">
                 <span className="text-xl">🥇</span>
              </div>
              <p className="text-xs text-gray-600 font-medium">Số 1 thuốc kê đơn</p>
           </div>
           <div className="flex-1 flex flex-col items-center">
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-2">
                 <span className="text-xl">⚡</span>
              </div>
              <p className="text-xs text-gray-600 font-medium">Giao nhanh trong 1 giờ</p>
           </div>
        </div>

        {/* --- NỘI DUNG CHÍNH (SWITCH GIỮA SĐT VÀ EMAIL) --- */}
        {isEmailMode ? (
            // [MỚI] FORM EMAIL
            <form onSubmit={handleEmailLogin} className="space-y-4">
                <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Nhập địa chỉ Email"
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800"
                />
                <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mật khẩu"
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white font-bold py-3 rounded-full hover:bg-blue-700 transition shadow-lg disabled:bg-gray-400"
                >
                    {loading ? "Đang xử lý..." : "Đăng nhập"}
                </button>
                <div className="text-center mt-2">
                    <button type="button" onClick={() => setIsEmailMode(false)} className="text-sm text-blue-600 hover:underline">
                        Quay lại đăng nhập SĐT
                    </button>
                </div>
            </form>
        ) : (
            // FORM SỐ ĐIỆN THOẠI (CŨ)
            !otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
                <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Nhập số điện thoại"
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 placeholder:text-gray-400"
                />
                
                <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-full hover:bg-blue-700 transition shadow-lg disabled:bg-gray-400"
                >
                {loading ? "Đang gửi..." : "Tiếp tục"}
                </button>
            </form>
            ) : (
            /* --- FORM NHẬP OTP --- */
            <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="text-center mb-2">
                    <p className="text-sm text-gray-600">
                        Mã xác thực gửi tới <b>{phone}</b>
                    </p>
                    <button type="button" onClick={() => setOtpSent(false)} className="text-xs text-blue-500 underline">Đổi số điện thoại</button>
                </div>
                <input
                type="text"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Nhập mã OTP (6 số)"
                maxLength={6}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-center text-xl tracking-widest font-bold"
                />
                <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-full hover:bg-blue-700 transition shadow-lg disabled:bg-gray-400"
                >
                {loading ? "Đang kiểm tra..." : "Xác nhận"}
                </button>
            </form>
            )
        )}

        {/* THÔNG BÁO LỖI */}
        {message && (
          <div className="mt-3 text-center text-sm text-red-600 bg-red-50 p-2 rounded">
            {message}
          </div>
        )}

        {/* --- NÚT ĐĂNG NHẬP KHÁC --- */}
        <div className="mt-4">
           {/* Nút lớn Google */}
           <button 
             onClick={handleGoogleLogin}
             className="w-full bg-red-600 text-white font-bold py-3 rounded-full hover:bg-red-700 transition shadow-lg flex items-center justify-center gap-2 mb-6"
           >
              <span className="bg-yellow-400 p-0.5 rounded-full text-xs">⭐</span>
              Đăng nhập bằng tài khoản Google
           </button>

           <div className="relative flex justify-center text-sm text-gray-500 mb-4">
              <span className="bg-white px-2 z-10">hoặc đăng nhập bằng</span>
              <div className="absolute inset-0 flex items-center">
                 <div className="w-full border-t border-gray-200"></div>
              </div>
           </div>

           <div className="flex justify-center gap-4">
              {/* Icon Google Tròn */}
              <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition" onClick={handleGoogleLogin}>
                 <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google"/>
              </button>
              
              {/* Icon Facebook */}
              <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition text-blue-600">
                 <span className="text-xl font-bold">f</span>
              </button>
              
              {/* Icon Apple */}
              <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition text-black">
                 <span className="text-xl"></span>
              </button>

              {/* [MỚI] ICON EMAIL - Bấm vào sẽ chuyển form sang chế độ nhập Email */}
              <button 
                onClick={() => setIsEmailMode(true)}
                className={`w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition ${isEmailMode ? 'bg-blue-100 border-blue-500' : ''}`}
                title="Đăng nhập bằng Email"
              >
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                 </svg>
              </button>
           </div>
        </div>

      </div>
    </div>
  );
}