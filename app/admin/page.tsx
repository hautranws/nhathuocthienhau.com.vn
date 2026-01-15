"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Banner from "@/components/Banner";
import FlashSale from "@/components/FlashSale";
import AdminFlashSaleManager from "@/components/admin/AdminFlashSaleManager";
import AdminBannerManager from "@/components/admin/AdminBannerManager";

// CẤU HÌNH ADMIN
const ADMIN_PHONE_CORE = "989217112"; 
const ADMIN_EMAIL = "admin@thienhau.com";

export default function AdminDashboard() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Trạng thái auth
  const [authStatus, setAuthStatus] = useState<"checking" | "login_required" | "authorized" | "denied">("checking");
  const [userInfo, setUserInfo] = useState<any>(null);

  // Form login
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  const checkAuthAndFetchData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    setUserInfo(user);

    if (!user) {
      setAuthStatus("login_required");
      setLoading(false);
      return;
    }

    const userPhone = user.phone || "";
    const userEmail = user.email || "";
    const cleanPhone = userPhone.replace(/[^0-9]/g, "");

    const isPhoneMatch = cleanPhone.includes(ADMIN_PHONE_CORE);
    const isEmailMatch = userEmail === ADMIN_EMAIL;

    if (!isPhoneMatch && !isEmailMatch) {
      setAuthStatus("denied");
      setLoading(false);
      return;
    }

    setAuthStatus("authorized");

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: false });

    if (!error && data) {
      setProducts(data);
    }
    setLoading(false);
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword,
    });
    if (error) {
      alert("Đăng nhập thất bại: " + error.message);
      setLoginLoading(false);
    } else {
      window.location.reload();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  // --- GIAO DIỆN LOGIN ---
  if (authStatus === "login_required") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border-t-8 border-blue-800">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-blue-900 uppercase">Quản Trị Viên</h1>
            <p className="text-gray-500 text-sm">Nhà Thuốc Thiên Hậu</p>
          </div>
          <form onSubmit={handleAdminLogin} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-bold mb-2">Email Admin</label>
              <input type="email" required className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500" placeholder="admin@thienhau.com" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2">Mật khẩu</label>
              <input type="password" required className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500" placeholder="********" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} />
            </div>
            <button type="submit" disabled={loginLoading} className="w-full bg-blue-800 text-white font-bold py-3 rounded hover:bg-blue-900 transition flex justify-center items-center">
              {loginLoading ? "Đang xử lý..." : "ĐĂNG NHẬP ADMIN"}
            </button>
          </form>
          <div className="mt-6 text-center pt-4 border-t">
            <Link href="/" className="text-sm text-gray-500 hover:text-blue-600">← Quay về trang chủ bán hàng</Link>
          </div>
        </div>
      </div>
    );
  }

  // --- GIAO DIỆN TỪ CHỐI ---
  if (authStatus === "denied") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-xl shadow-xl max-w-lg w-full border-t-8 border-red-600">
          <h1 className="text-2xl font-bold text-red-700 mb-2">⛔ SAI TÀI KHOẢN</h1>
          <p className="text-gray-600 mb-4">Bạn đang đăng nhập bằng tài khoản khách hàng, không phải Admin.</p>
          <div className="bg-yellow-50 p-3 rounded mb-6 text-sm border border-yellow-200">
            <strong>Đang đăng nhập là:</strong><br />{userInfo?.email || userInfo?.phone}
          </div>
          <button onClick={handleLogout} className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition shadow-lg">ĐĂNG XUẤT ĐỂ NHẬP EMAIL ADMIN</button>
        </div>
      </div>
    );
  }

  // --- GIAO DIỆN DASHBOARD ---
  if (authStatus === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-700"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      <main className="container mx-auto p-4 pt-6">
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-red-700 mb-6 border-l-8 border-red-700 pl-4 uppercase flex justify-between items-center">
            <span>Trang Quản Trị (Admin)</span>
            <button onClick={handleLogout} className="text-sm bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 font-normal normal-case">Đăng xuất</button>
          </h1>

          {/* --- SỬA PHẦN NÀY: GRID 5 CỘT CHO ĐẸP --- */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <Link href="/admin/add" className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-md border-2 border-transparent hover:border-blue-500 hover:shadow-xl transition cursor-pointer group">
              <div className="text-5xl mb-3 group-hover:scale-110 transition">➕</div>
              <h3 className="text-xl font-bold text-blue-900 text-center">Thêm SP Mới</h3>
              <p className="text-gray-500 text-xs mt-1 text-center">Thêm hàng vào kho</p>
            </Link>

            {/* Nút Quản lý kho */}
            <Link href="/admin/inventory" className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-md border-2 border-transparent hover:border-orange-500 hover:shadow-xl transition cursor-pointer group">
              <div className="text-5xl mb-3 group-hover:scale-110 transition">📦</div>
              <h3 className="text-xl font-bold text-orange-700 text-center">Quản lý kho</h3>
              <p className="text-gray-500 text-xs mt-1 text-center">Sửa giá & Tồn kho</p>
            </Link>

            {/* Nút Đơn hàng */}
            <Link href="/admin/orders" className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-md border-2 border-transparent hover:border-green-500 hover:shadow-xl transition cursor-pointer group">
              <div className="text-5xl mb-3 group-hover:scale-110 transition">🛒</div>
              <h3 className="text-xl font-bold text-green-700 text-center">Đơn hàng</h3>
              <p className="text-gray-500 text-xs mt-1 text-center">Xem & Xử lý đơn</p>
            </Link>

            {/* Nút Mã giảm giá */}
            <Link href="/admin/coupons" className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-md border-2 border-transparent hover:border-purple-500 hover:shadow-xl transition cursor-pointer group">
              <div className="text-5xl mb-3 group-hover:scale-110 transition">🎫</div>
              <h3 className="text-xl font-bold text-purple-700 text-center">Mã giảm giá</h3>
              <p className="text-gray-500 text-xs mt-1 text-center">Tạo Coupon KM</p>
            </Link>

            {/* [MỚI] Nút Nhật ký hoạt động */}
            <Link href="/admin/activity" className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-md border-2 border-transparent hover:border-teal-500 hover:shadow-xl transition cursor-pointer group">
              <div className="text-5xl mb-3 group-hover:scale-110 transition">📅</div>
              <h3 className="text-xl font-bold text-teal-700 text-center">Nhật ký đăng bài</h3>
              <p className="text-gray-500 text-xs mt-1 text-center">Xem lịch sử</p>
            </Link>
          </div>
          {/* --- HẾT PHẦN SỬA --- */}
        </div>

        <hr className="border-t-4 border-gray-200 my-10" />

        <div className="mb-10"><AdminBannerManager /></div>
        <div className="mb-10"><AdminFlashSaleManager /></div>

        <div className="opacity-90">
          <h2 className="text-xl font-bold text-gray-500 mb-4">⬇️ Xem trước giao diện trang chủ & Kho hàng hiện tại:</h2>
          <div className="mb-8 pointer-events-none grayscale-[20%] scale-95 origin-top-left border border-gray-200 rounded-xl p-2">
            <p className="text-xs text-gray-400 mb-1">Demo Banner:</p>
            <Banner />
          </div>
          <div className="mb-8"><FlashSale /></div>

          <h2 className="text-2xl font-bold text-gray-800 mb-6 border-l-4 border-blue-600 pl-4 flex justify-between items-center">
            <span>📦 Danh sách trong kho ({products.length})</span>
            <Link href="/admin/add" className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 font-normal">+ Thêm mới</Link>
          </h2>

          {loading ? (
            <div className="text-center py-10">Đang tải dữ liệu...</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {products.map((product) => (
                <Link key={product.id} href={`/admin/products/${product.id}`} className="block group">
                  <div className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition cursor-pointer relative border border-gray-100 flex flex-col justify-between h-full">
                     {/* Giữ nguyên phần render sản phẩm như cũ */}
                     <div className="h-40 rounded-lg mb-4 flex items-center justify-center overflow-hidden bg-gray-50">
                        <img src={product.img || "https://via.placeholder.com/150"} alt={product.title} className="h-full object-contain mix-blend-multiply" />
                     </div>
                     <div>
                        <h3 className="font-bold text-gray-800 text-sm line-clamp-2 mb-2">{product.title || product.name}</h3>
                        <p className="text-blue-600 font-bold text-lg">{Number(product.price).toLocaleString("vi-VN")}đ</p>
                     </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}