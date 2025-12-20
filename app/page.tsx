import React from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import Banner from "@/components/Banner";
import FlashSale from "@/components/FlashSale";
import CategoryGrid from "@/components/CategoryGrid";

export default async function Home() {
  const { data: products, error } = await supabase.from("products").select("*");

  if (error) console.error("Lỗi lấy hàng:", error);

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <main className="container mx-auto p-4 pt-6">
        <div className="mb-8"><Banner /></div>
        <div className="mb-8"><FlashSale /></div>
        <CategoryGrid />

        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6 border-l-4 border-blue-600 pl-4">
          Sản phẩm từ kho hàng (Realtime)
        </h2>

        {/* --- SỬA GRID Ở ĐÂY: mobile 2 cột, desktop 4 cột --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products && products.length > 0 ? (
            products.map((product) => (
              <Link key={product.id} href={`/product/${product.id}`} className="block group">
                <div className="bg-white p-3 md:p-4 rounded-lg shadow hover:shadow-lg transition cursor-pointer relative border border-gray-100 flex flex-col justify-between h-full">
                  {product.discount && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] px-2 py-1 rounded font-bold">
                      {product.discount}
                    </span>
                  )}
                  <div className={`h-32 md:h-40 ${product.image_url} rounded-lg mb-2 md:mb-4 flex items-center justify-center text-gray-400 font-medium`}>
                    [Ảnh]
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-xs md:text-sm line-clamp-2 mb-1 md:mb-2 min-h-[32px] md:min-h-[40px] group-hover:text-blue-700">
                      {product.name}
                    </h3>
                    <p className="text-blue-600 font-bold text-sm md:text-lg">
                      {product.price?.toLocaleString("vi-VN")}đ
                      <span className="text-gray-400 font-normal text-[10px] md:text-xs ml-1">/ {product.unit}</span>
                    </p>
                  </div>
                  <button className="mt-2 md:mt-3 w-full bg-blue-100 text-blue-700 font-bold py-1.5 md:py-2 rounded text-xs md:text-sm group-hover:bg-blue-600 group-hover:text-white transition">
                    Xem chi tiết
                  </button>
                </div>
              </Link>
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