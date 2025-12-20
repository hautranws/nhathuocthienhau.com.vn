import React from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import Banner from "@/components/Banner"; // Giữ nguyên theo yêu cầu
import FlashSale from "@/components/FlashSale"; // Giữ nguyên theo yêu cầu

export default async function AdminDashboard() {
  // Lấy dữ liệu từ kho Supabase
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .order("id", { ascending: false }); // Sắp xếp sản phẩm mới nhất lên đầu

  if (error) {
    console.error("Lỗi lấy hàng:", error);
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      <main className="container mx-auto p-4 pt-6">
        {/* --- PHẦN 1: MENU QUẢN TRỊ (BƯỚC 2 - MỚI THÊM) --- */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-red-700 mb-6 border-l-8 border-red-700 pl-4 uppercase">
            Trang Quản Trị (Admin)
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Nút Đăng sản phẩm */}
            <Link
              href="/admin/add"
              className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-md border-2 border-transparent hover:border-blue-500 hover:shadow-xl transition cursor-pointer group"
            >
              <div className="text-5xl mb-3 group-hover:scale-110 transition">
                ➕
              </div>
              <h3 className="text-xl font-bold text-blue-900">
                Đăng sản phẩm mới
              </h3>
              <p className="text-gray-500 text-sm mt-1">
                Thêm hàng vào kho Supabase
              </p>
            </Link>

            {/* Nút Quản lý kho (Để dành) */}
            <div className="flex flex-col items-center justify-center p-8 bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300 opacity-60">
              <div className="text-5xl mb-3">📦</div>
              <h3 className="text-xl font-bold text-gray-600">Quản lý kho</h3>
              <p className="text-gray-400 text-sm mt-1">
                Sửa / Xóa (Đang phát triển)
              </p>
            </div>

            {/* Nút Đơn hàng (Để dành) */}
            <div className="flex flex-col items-center justify-center p-8 bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300 opacity-60">
              <div className="text-5xl mb-3">🛒</div>
              <h3 className="text-xl font-bold text-gray-600">Đơn hàng</h3>
              <p className="text-gray-400 text-sm mt-1">
                Xem đơn khách đặt (Đang phát triển)
              </p>
            </div>
          </div>
        </div>

        {/* Đường kẻ phân cách */}
        <hr className="border-t-4 border-gray-200 my-10" />

        {/* --- PHẦN 2: NỘI DUNG CŨ (ĐƯỢC GIỮ NGUYÊN) --- */}
        <div className="opacity-90">
          <h2 className="text-xl font-bold text-gray-500 mb-4">
            ⬇️ Xem trước giao diện trang chủ & Kho hàng hiện tại:
          </h2>

          {/* Banner & Flashsale cũ */}
          <div className="mb-8 pointer-events-none grayscale-[50%] scale-95 origin-top-left">
            <Banner />
          </div>
          <div className="mb-8">
            <FlashSale />
          </div>

          {/* Danh sách sản phẩm từ kho */}
          <h2 className="text-2xl font-bold text-gray-800 mb-6 border-l-4 border-blue-600 pl-4 flex justify-between items-center">
            <span>📦 Danh sách trong kho ({products?.length || 0})</span>
            <Link
              href="/admin/add"
              className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 font-normal"
            >
              + Thêm mới
            </Link>
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {products && products.length > 0 ? (
              products.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`} // Link tới trang chi tiết
                  className="block group"
                >
                  <div className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition cursor-pointer relative border border-gray-100 flex flex-col justify-between h-full">
                    {product.discount && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] px-2 py-1 rounded font-bold z-10">
                        {product.discount}
                      </span>
                    )}

                    {/* Sửa lại phần hiển thị ảnh cho đúng chuẩn <img> */}
                    <div className="h-40 rounded-lg mb-4 flex items-center justify-center overflow-hidden bg-gray-50">
                      {product.img && product.img.startsWith("http") ? (
                        <img
                          src={product.img}
                          alt={product.title}
                          className="h-full object-contain"
                        />
                      ) : (
                        <span className="text-gray-400 font-medium">
                          [Chưa có ảnh]
                        </span>
                      )}
                    </div>

                    <div>
                      {/* Ưu tiên hiển thị title (tên mới), nếu không có thì lấy name (tên cũ) */}
                      <h3 className="font-bold text-gray-800 text-sm line-clamp-2 mb-2 min-h-[40px] group-hover:text-blue-700">
                        {product.title || product.name}
                      </h3>

                      <p className="text-blue-600 font-bold text-lg">
                        {product.price?.toLocaleString("vi-VN")}đ
                        {product.unit && (
                          <span className="text-gray-400 font-normal text-xs ml-1">
                            / {product.unit}
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="mt-3 w-full bg-blue-50 text-blue-700 font-bold py-2 rounded text-center text-xs uppercase">
                      Mã: {product.id}
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-4 text-center py-10 text-gray-500 bg-white rounded-lg border border-dashed border-gray-300">
                <p className="text-xl">📭 Kho hàng đang trống.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
