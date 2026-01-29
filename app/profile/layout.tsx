"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { 
  User, 
  Package, 
  MapPin, 
  FileText, 
  LogOut, 
  Syringe 
} from "lucide-react";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const menuItems = [
    { name: "Thông tin cá nhân", href: "/profile", icon: <User size={20} /> },
    { name: "Đơn hàng của tôi", href: "/profile/orders", icon: <Package size={20} /> },
    { name: "Sổ địa chỉ nhận hàng", href: "/profile/address", icon: <MapPin size={20} /> },
    // { name: "Lịch hẹn tiêm chủng", href: "/profile/vaccine-schedule", icon: <Syringe size={20} /> }, // Tạm ẩn nếu chưa cần
    { name: "Đơn thuốc của tôi", href: "/profile/prescriptions", icon: <FileText size={20} /> },
  ];

  const displayName = user?.user_metadata?.full_name || "Khách hàng";
  const displayPhone = user?.phone || user?.email || "Chưa cập nhật";

  return (
    <div className="bg-gray-100 min-h-screen py-6 font-sans">
      <div className="container mx-auto px-4 flex flex-col md:flex-row gap-6">
        
        {/* --- CỘT TRÁI (SIDEBAR) --- */}
        <div className="w-full md:w-1/4 flex flex-col gap-4">
          {/* Card Thông tin tóm tắt */}
          <div className="bg-blue-600 rounded-xl p-6 text-white flex flex-col items-center text-center shadow-lg relative overflow-hidden">
             {/* Trang trí nền */}
             <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
             <div className="absolute bottom-0 left-0 w-16 h-16 bg-white opacity-10 rounded-full -ml-8 -mb-8"></div>
             
             <div className="w-16 h-16 bg-blue-400 rounded-full flex items-center justify-center text-2xl font-bold mb-3 border-4 border-blue-500 shadow-sm relative z-10">
                {displayName.charAt(0).toUpperCase()}
             </div>
             <h3 className="font-bold text-lg relative z-10">{displayName.toUpperCase()}</h3>
             <p className="text-blue-200 text-sm relative z-10">{displayPhone}</p>
          </div>

          {/* Menu Danh mục */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
             {menuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    className={`flex items-center gap-3 px-5 py-4 transition border-b border-gray-50 last:border-0 ${
                        isActive 
                        ? "bg-blue-50 text-blue-700 font-bold border-l-4 border-l-blue-600" 
                        : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
                    }`}
                  >
                     <span className={isActive ? "text-blue-600" : "text-gray-400"}>{item.icon}</span>
                     <span>{item.name}</span>
                  </Link>
                );
             })}
             
             <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-5 py-4 text-gray-600 hover:bg-red-50 hover:text-red-600 transition text-left border-t border-gray-100"
             >
                <span className="text-gray-400"><LogOut size={20} /></span>
                <span>Đăng xuất</span>
             </button>
          </div>
        </div>

        {/* --- CỘT PHẢI (NỘI DUNG CHÍNH) --- */}
        <div className="flex-1">
           {children}
        </div>

      </div>
    </div>
  );
}