"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import Banner from "@/components/Banner";
// --- [THÊM] Import component xem trước FlashSale (để tránh lỗi vì bên dưới có dùng) ---
import FlashSale from "@/components/FlashSale";
import AdminFlashSaleManager from "@/components/admin/AdminFlashSaleManager";

export default function AdminDashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("id", { ascending: false });

      if (!error && data) {
        setProducts(data);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      <main className="container mx-auto p-4 pt-6">
        {/* --- PHẦN 1: MENU QUẢN TRỊ (GIỮ NGUYÊN) --- */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-red-700 mb-6 border-l-8 border-red-700 pl-4 uppercase">
            Trang Quản Trị (Admin)
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

            <div className="flex flex-col items-center justify-center p-8 bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300 opacity-60">
              <div className="text-5xl mb-3">📦</div>
              <h3 className="text-xl font-bold text-gray-600">Quản lý kho</h3>
              <p className="text-gray-400 text-sm mt-1">
                Sửa / Xóa (Đang phát triển)
              </p>
            </div>

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

        {/* --- PHẦN 2: NỘI DUNG CHÍNH --- */}

        {/* [MỚI] --- BẢNG QUẢN LÝ FLASH SALE NẰM Ở ĐÂY --- */}
        <div className="mb-10">
          <AdminFlashSaleManager />
        </div>
        {/* ------------------------------------------------ */}

        <div className="opacity-90">
          <h2 className="text-xl font-bold text-gray-500 mb-4">
            ⬇️ Xem trước giao diện trang chủ & Kho hàng hiện tại:
          </h2>

          {/* Banner & Flashsale cũ (Preview) */}
          <div className="mb-8 pointer-events-none grayscale-[50%] scale-95 origin-top-left">
            <Banner />
          </div>

          {/* Component FlashSale hiển thị đếm ngược (Preview) */}
          <div className="mb-8">
            <FlashSale />
          </div>

          {/* Danh sách sản phẩm từ kho (GIỮ NGUYÊN) */}
          <h2 className="text-2xl font-bold text-gray-800 mb-6 border-l-4 border-blue-600 pl-4 flex justify-between items-center">
            <span>📦 Danh sách trong kho ({products.length})</span>
            <Link
              href="/admin/add"
              className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 font-normal"
            >
              + Thêm mới
            </Link>
          </h2>

          {loading ? (
            <div className="text-center py-10">Đang tải dữ liệu...</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {products.length > 0 ? (
                products.map((product) => {
                  let thumbnail = product.img;
                  try {
                    if (product.img && product.img.startsWith("[")) {
                      const parsed = JSON.parse(product.img);
                      if (Array.isArray(parsed) && parsed.length > 0) {
                        thumbnail = parsed[0];
                      }
                    }
                  } catch (e) {
                    thumbnail = product.img;
                  }

                  return (
                    <Link
                      key={product.id}
                      href={`/admin/products/${product.id}`}
                      className="block group"
                    >
                      <div className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition cursor-pointer relative border border-gray-100 flex flex-col justify-between h-full">
                        {product.discount && (
                          <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] px-2 py-1 rounded font-bold z-10">
                            {product.discount}
                          </span>
                        )}

                        {product.is_best_seller && (
                          <span className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-[10px] px-2 py-1 rounded-full font-bold z-10 shadow-md border border-white flex items-center gap-1 animate-pulse">
                            🔥 HOT
                          </span>
                        )}

                        <div className="h-40 rounded-lg mb-4 flex items-center justify-center overflow-hidden bg-gray-50">
                          {thumbnail &&
                          (thumbnail.startsWith("http") ||
                            thumbnail.startsWith("data:")) ? (
                            <img
                              src={thumbnail}
                              alt={product.title}
                              className="h-full object-contain mix-blend-multiply"
                            />
                          ) : (
                            <span className="text-gray-400 font-medium text-xs">
                              [Chưa có ảnh]
                            </span>
                          )}
                        </div>

                        <div>
                          <h3 className="font-bold text-gray-800 text-sm line-clamp-2 mb-2 min-h-[40px] group-hover:text-blue-700">
                            {product.title || product.name}
                          </h3>

                          <p className="text-blue-600 font-bold text-lg">
                            {Number(product.price).toLocaleString("vi-VN")}đ
                            {product.unit && (
                              <span className="text-gray-400 font-normal text-xs ml-1">
                                / {product.unit}
                              </span>
                            )}
                          </p>
                        </div>

                        <div className="mt-3 w-full bg-blue-50 text-blue-700 font-bold py-2 rounded text-center text-xs uppercase hover:bg-blue-100 transition">
                          Sửa SP này ✏️
                        </div>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="col-span-4 text-center py-10 text-gray-500 bg-white rounded-lg border border-dashed border-gray-300">
                  <p className="text-xl">📭 Kho hàng đang trống.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
