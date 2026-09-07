"use client";
import React, { Suspense, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { normalizeVietnamPhone } from "@/lib/twilio-auth";

function OtpBoxes({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length: 6 }, (_, index) => value[index] ?? "");

  const updateDigit = (index: number, input: string) => {
    const digit = input.replace(/\D/g, "").slice(-1);
    const nextDigits = [...digits];
    nextDigits[index] = digit;
    onChange(nextDigits.join(""));
    if (digit && index < 5) inputRefs.current[index + 1]?.focus();
  };

  return (
    <div
      className="flex justify-center gap-2"
      onPaste={(event) => {
        const pasted = event.clipboardData
          .getData("text")
          .replace(/\D/g, "")
          .slice(0, 6);
        if (!pasted) return;
        event.preventDefault();
        onChange(pasted);
        inputRefs.current[Math.min(pasted.length, 5)]?.focus();
      }}
    >
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => {
            inputRefs.current[index] = element;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={digit}
          onChange={(event) => updateDigit(index, event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Backspace" && !digit && index > 0) {
              inputRefs.current[index - 1]?.focus();
            }
          }}
          className="h-12 w-11 rounded-xl border-2 border-gray-200 text-center text-xl font-bold text-gray-800 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          aria-label={`Số OTP thứ ${index + 1}`}
        />
      ))}
    </div>
  );
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/";

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // State cho SĐT
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [pin, setPin] = useState("");
  const [requiresPin, setRequiresPin] = useState(false);
  const [needsPinSetup, setNeedsPinSetup] = useState(false);
  const [isForgotPin, setIsForgotPin] = useState(false);

  // State cho Email
  const [isEmailMode, setIsEmailMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // --- KIỂM TRA SỐ ĐIỆN THOẠI ---
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return setMessage("❌ Vui lòng nhập số điện thoại");
    setLoading(true);
    setMessage("");

    const formattedPhone = normalizeVietnamPhone(phone);

    try {
      if (isForgotPin) {
        const response = await fetch("/api/auth/twilio/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: formattedPhone }),
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || "Không gửi được mã OTP.");
        }

        setOtpSent(true);
        setMessage("✅ Đã gửi mã OTP Twilio để đặt lại mã PIN.");
        return;
      }

      const checkResponse = await fetch("/api/auth/twilio/check-phone", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone: formattedPhone }),
      });
      const checkResult = await checkResponse.json();

      if (!checkResponse.ok || !checkResult.success) {
        throw new Error(checkResult.error || "Không thể kiểm tra tài khoản.");
      }

      if (checkResult.hasPin) {
        setRequiresPin(true);
        setMessage("✅ Số điện thoại đã có tài khoản. Vui lòng nhập mã PIN 6 số.");
        return;
      }

      const response = await fetch("/api/auth/twilio/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone: formattedPhone }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Không gửi được mã OTP.");
      }

      setOtpSent(true);
      setMessage("✅ Đã gửi mã OTP qua Twilio SMS.");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Không gửi được mã OTP.";
      setMessage(`❌ Lỗi gửi mã: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePinLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/twilio/login-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, pin }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Mã PIN không đúng.");
      }

      window.location.assign(result.redirectTo ?? redirectTo);
    } catch (error: unknown) {
      setMessage(`❌ ${error instanceof Error ? error.message : "Mã PIN không đúng."}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(pin)) {
      return setMessage("❌ Mã PIN phải gồm đúng 6 chữ số.");
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/twilio/set-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Không thể lưu mã PIN.");
      }

      window.location.assign(result.redirectTo ?? redirectTo);
    } catch (error: unknown) {
      setMessage(`❌ ${error instanceof Error ? error.message : "Không thể lưu mã PIN."}`);
    } finally {
      setLoading(false);
    }
  };

  // --- XÁC THỰC MÃ OTP ---
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formattedPhone = normalizeVietnamPhone(phone);

    try {
      const response = await fetch("/api/auth/twilio/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: formattedPhone,
          otp,
          resetPin: isForgotPin,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Mã OTP không đúng hoặc hết hạn.");
      }

      if (result.requiresPin) {
        setNeedsPinSetup(true);
        setMessage(
          isForgotPin
            ? "✅ Đã xác minh số điện thoại. Hãy đặt mã PIN mới."
            : "✅ Số điện thoại đã được xác minh. Hãy tạo mã PIN 6 số.",
        );
      } else {
        window.location.assign(result.redirectTo ?? redirectTo);
      }
    } catch (error: unknown) {
      setMessage(
        `❌ ${error instanceof Error ? error.message : "Lỗi xác thực OTP."}`,
      );
    } finally {
      setLoading(false);
    }
  };

  // --- [MỚI] ĐĂNG NHẬP BẰNG EMAIL & PASSWORD ---
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password)
      return setMessage("❌ Vui lòng nhập email và mật khẩu");

    setLoading(true);
    setMessage("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) throw error;

      if (data.user) {
        // Check if user is admin in database
        const { data: adminData } = await supabase
          .from("admin_users")
          .select("id")
          .eq("user_id", data.user.id)
          .eq("is_active", true)
          .single();

        router.push(adminData ? "/admin" : "/");
      }
    } catch {
      setMessage(`❌ Đăng nhập thất bại: Sai email hoặc mật khẩu.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 font-sans p-4 relative overflow-hidden">
      {/* Nút đóng (Về trang chủ) */}
      <Link
        href="/"
        className="absolute top-4 right-4 text-gray-500 hover:text-black"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-8 h-8"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
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
            <p className="text-xs text-gray-600 font-medium">
              Miễn phí vận chuyển
            </p>
          </div>
          <div className="flex-1 flex flex-col items-center">
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-2">
              <span className="text-xl">🥇</span>
            </div>
            <p className="text-xs text-gray-600 font-medium">
              Số 1 thuốc kê đơn
            </p>
          </div>
          <div className="flex-1 flex flex-col items-center">
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-2">
              <span className="text-xl">⚡</span>
            </div>
            <p className="text-xs text-gray-600 font-medium">
              Giao nhanh trong 1 giờ
            </p>
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
              <button
                type="button"
                onClick={() => setIsEmailMode(false)}
                className="text-sm text-blue-600 hover:underline"
              >
                Quay lại đăng nhập SĐT
              </button>
            </div>
          </form>
        ) : needsPinSetup ? (
          <form onSubmit={handleSetPin} className="space-y-4">
            <p className="text-center text-sm text-gray-600">
              Tạo mã PIN 6 số để lần sau đăng nhập nhanh hơn.
            </p>
            <input
              type="password"
              inputMode="numeric"
              required
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="Tạo mã PIN (6 số)"
              maxLength={6}
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-center text-xl tracking-widest font-bold"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-full hover:bg-blue-700 transition shadow-lg disabled:bg-gray-400"
            >
              {loading ? "Đang lưu..." : "Lưu mã PIN"}
            </button>
          </form>
        ) : requiresPin ? (
          <form onSubmit={handlePinLogin} className="space-y-4">
            <p className="text-center text-sm text-gray-600">
              Nhập mã PIN 6 số của bạn để tiếp tục.
            </p>
            <input
              type="password"
              inputMode="numeric"
              required
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="Mã PIN (6 số)"
              maxLength={6}
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-center text-xl tracking-widest font-bold"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-full hover:bg-blue-700 transition shadow-lg disabled:bg-gray-400"
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsForgotPin(true);
                setRequiresPin(false);
                setOtpSent(false);
                setOtp("");
                setPin("");
                setMessage("Nhập số điện thoại để nhận OTP đặt lại mã PIN.");
              }}
              className="w-full text-sm font-medium text-blue-600 hover:underline"
            >
              Quên mã PIN?
            </button>
            <button
              type="button"
              onClick={() => {
                setRequiresPin(false);
                setPin("");
              }}
              className="w-full text-sm text-blue-600 hover:underline"
            >
              Dùng số điện thoại khác
            </button>
          </form>
        ) : !otpSent ? (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            {isForgotPin && (
              <p className="text-center text-sm font-medium text-blue-700">
                Đặt lại mã PIN bằng OTP Twilio
              </p>
            )}
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
              <button
                type="button"
                onClick={() => setOtpSent(false)}
                className="text-xs text-blue-500 underline"
              >
                Đổi số điện thoại
              </button>
            </div>
            <OtpBoxes value={otp} onChange={setOtp} />
            <p className="text-center text-xs text-gray-500">Nhập mã OTP 6 số đã nhận qua SMS</p>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-full hover:bg-blue-700 transition shadow-lg disabled:bg-gray-400"
            >
              {loading ? "Đang kiểm tra..." : "Xác nhận"}
            </button>
          </form>
        )}

        {/* THÔNG BÁO LỖI */}
        {message && (
          <div className="mt-3 text-center text-sm text-red-600 bg-red-50 p-2 rounded">
            {message}
          </div>
        )}

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setIsEmailMode((prev) => !prev)}
            className="text-sm text-blue-600 hover:underline"
          >
            {isEmailMode ? "Sử dụng SĐT" : "Đăng nhập bằng Email"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-gray-500">
          Đang tải...
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
