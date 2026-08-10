"use client";
import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getSafeSupabaseUser, safeSupabaseSignOut, supabase } from "@/lib/supabaseClient";

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
    const checkAdmin = async () => {
      try {
        // 1. Check if user is logged in
        const user = await getSafeSupabaseUser();

        if (!user) {
          router.push("/login?redirect=/admin");
          return;
        }

        // 2. Check if user is admin in database
        const { data: adminData, error } = await supabase
          .from("admin_users")
          .select("id")
          .eq("user_id", user.id)
          .eq("is_active", true)
          .single();

        if (error) {
          console.error("Admin check DB error:", error.message, error.code);
        }

        if (!adminData) {
          // User is not admin - redirect to home
          router.push("/");
          return;
        }

        // User is admin - allow access
        setAuthorized(true);
        setIsChecking(false);
      } catch (err) {
        console.error("Admin check error:", err);
        router.push("/");
      }
    };

    checkAdmin();
  }, [router]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Đang kiểm tra quyền Admin...
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-8 py-3 flex justify-between items-center shadow-sm">
        <span className="font-bold text-blue-900">🛡️ TRANG QUẢN TRỊ VIÊN</span>
        <button
          onClick={async () => {
            await safeSupabaseSignOut();
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
