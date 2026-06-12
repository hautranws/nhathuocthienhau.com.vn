"use client";
import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

// --- CẤU HÌNH ADMIN (Khớp với file admin/page.tsx) ---
const ADMIN_EMAIL = "tranthienhaudau2@gmail.com";
const ADMIN_PHONE_CORE = "989217112";
// ------------------------------------------------------

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      // 1. Lấy thông tin người đang đăng nhập
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        // Chưa đăng nhập -> Nếu ở trang gốc /admin thì hiển thị form (Không đá về /login nữa)
        if (pathname === "/admin") {
          setAuthorized(false);
          setIsChecking(false);
        } else {
          // Nếu vào link con (VD: /admin/inventory) mà chưa đăng nhập -> Đá ra ngoài
          router.push("/admin");
        }
      } else {
        // 2. KIỂM TRA EMAIL HOẶC SĐT CÓ PHẢI ADMIN KHÔNG?
        const userPhone = session.user.phone || "";
        const userEmail = session.user.email || "";
        const cleanPhone = userPhone.replace(/[^0-9]/g, "");

        const isPhoneMatch = cleanPhone.includes(ADMIN_PHONE_CORE);
        const isEmailMatch = userEmail === ADMIN_EMAIL;

        if (isEmailMatch || isPhoneMatch) {
          setAuthorized(true); // Đúng là Admin -> Cho vào
          setIsChecking(false);
        } else {
          // Đã đăng nhập nhưng là KHÁCH HÀNG -> Đá về trang chủ
          alert("Bạn không có quyền truy cập trang Quản trị!");
          router.push("/");
        }
      }
    };

    checkUser();
  }, [router, pathname]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Đang kiểm tra quyền Admin...
      </div>
    );
  }

  // Nếu chưa đăng nhập và đang ở trang form login (app/admin/page.tsx)
  // Ta không render phần Header (🛡️ TRANG QUẢN TRỊ VIÊN)
  if (!authorized) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-8 py-3 flex justify-between items-center shadow-sm">
        <span className="font-bold text-blue-900">🛡️ TRANG QUẢN TRỊ VIÊN</span>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            router.push("/admin");
          }}
          className="text-sm text-red-600 hover:text-red-800 font-medium"
        >
          Đăng xuất
        </button>
      </div>
      {children}
    </div>
  );
}
