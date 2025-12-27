import React from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import Banner from "@/components/Banner";
import FlashSale from "@/components/FlashSale";
import CategoryGrid from "@/components/CategoryGrid";
import ProductCard from "@/components/ProductCard"; // Đảm bảo đã import
import BestSellerSection from "@/components/BestSellerSection";

export default async function Home() {
  // 1. Lấy tất cả sản phẩm (Code cũ)
  const { data: products, error } = await supabase.from("products").select("*");

  // --- [MỚI] BƯỚC 2: THÊM LOGIC LẤY SẢN PHẨM BÁN CHẠY ---
  const { data: bestSellers } = await supabase
    .from("products")
    .select("*")
    .eq("is_best_seller", true) // Chỉ lấy sp có is_best_seller = true
    .limit(10); // Lấy tối đa 10 sản phẩm
  // ------------------------------------------------------

  if (error) console.error("Lỗi lấy hàng:", error);

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <main className="container mx-auto p-4 pt-6">
        <div className="mb-8">
          <Banner />
        </div>


        <div className="mb-8">
          <FlashSale />
        </div>

        {/* --- [MỚI] BƯỚC 3: CHÈN GIAO DIỆN BÁN CHẠY (STYLE LONG CHÂU) --- */}
        <section className="mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Tiêu đề mục */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-red-600 to-orange-500 text-white">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔥</span>
                <h2 className="text-xl font-bold uppercase">
                  Sản phẩm bán chạy
                </h2>
              </div>
              <Link
                href="/san-pham-ban-chay"
                className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition"
              >
                Xem tất cả →
              </Link>
            </div>

            {/* Danh sách sản phẩm */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-0 divide-x divide-y divide-gray-100">
              {bestSellers && bestSellers.length > 0 ? (
                bestSellers.map((product) => (
                  <Link
                    href={`/san-pham/${product.id}`}
                    key={product.id}
                    className="group block p-4 hover:shadow-lg transition relative bg-white"
                  >
                    {/* Ảnh sản phẩm (Xử lý ảnh JSON hoặc string thường) */}
                    <div className="aspect-square relative mb-3 overflow-hidden rounded-lg bg-gray-50">
                      <img
                        src={
                          product.img && product.img.startsWith("[")
                            ? JSON.parse(product.img)[0]
                            : product.img
                        }
                        alt={product.title}
                        className="object-cover w-full h-full group-hover:scale-105 transition duration-300"
                      />
                    </div>

                    {/* Tên sản phẩm */}
                    <h3 className="text-sm font-medium text-gray-800 line-clamp-2 min-h-[40px] group-hover:text-blue-600">
                      {product.title}
                    </h3>

                    {/* Giá */}
                    <div className="mt-2">
                      <div className="flex items-end gap-2">
                        <span className="text-red-600 font-bold text-lg">
                          {Number(product.price).toLocaleString("vi-VN")}đ
                        </span>
                        {product.old_price && (
                          <span className="text-gray-400 text-xs line-through mb-1">
                            {Number(product.old_price).toLocaleString("vi-VN")}đ
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Nút mua nhanh */}
                    <div className="mt-3 w-full bg-blue-600 text-white text-center py-2 rounded-full font-bold text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                      Chọn mua
                    </div>
                  </Link>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500 col-span-full">
                  Chưa có sản phẩm bán chạy nào được chọn.
                </div>
              )}
            </div>
          </div>
        </section>
        {/* ------------------------------------------------------------- */}

        <CategoryGrid />

        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6 border-l-4 border-blue-600 pl-4">
          Sản phẩm từ kho hàng (Realtime)
        </h2>

        {/* --- GRID: mobile 2 cột, desktop 4 cột hoặc 5 cột tùy ý --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {products && products.length > 0 ? (
            products.map((product) => (
              // --- THAY THẾ CODE CŨ BẰNG COMPONENT MỚI TẠI ĐÂY ---
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="col-span-2 md:col-span-4 text-center py-10 text-gray-500 bg-white rounded-lg">
              <p>📭 Kho hàng đang trống hoặc chưa mở khóa RLS.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
