import React from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import Banner from "@/components/Banner";
import FlashSale from "@/components/FlashSale";
import CategoryGrid from "@/components/CategoryGrid";
import ProductCard from "@/components/ProductCard"; // Đảm bảo đã import

export default async function Home() {
  const { data: products, error } = await supabase.from("products").select("*");

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
