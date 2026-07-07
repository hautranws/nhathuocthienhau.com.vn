"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useCachedData } from "@/lib/useCachedData";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";

export default function BestSellerSection() {
  const [products, setProducts] = useState<any[]>([]);

  // Cache best sellers cho 10 phút - không thay đổi thường xuyên
  const { data: cachedProducts, loading } = useCachedData(
    async () => {
      const { data, error } = await supabase
        .from("products")
        .select(
          "id, title, price, old_price, img, category, is_prescription, unit, specification, conversion_units, sku",
        )
        .eq("is_best_seller", true)
        .limit(10);

      if (error) throw error;
      return data || [];
    },
    "best-sellers",
    10 * 60 * 1000, // 10 phút cache
  );

  useEffect(() => {
    if (cachedProducts) {
      setProducts(cachedProducts);
    }
  }, [cachedProducts]);

  if (loading)
    return (
      <div className="h-40 bg-gray-100 animate-pulse rounded-xl my-8"></div>
    );
  if (products.length === 0) return null; // Không có sản phẩm thì ẩn luôn

  return (
    <div className="container mx-auto px-4 my-8">
      {/* Khung màu xanh giống Long Châu */}
      <div className="bg-blue-600 rounded-2xl p-6 shadow-lg relative overflow-hidden">
        {/* Tiêu đề */}
        <div className="flex justify-center mb-6 relative z-10">
          <div className="bg-red-600 text-white font-bold px-8 py-2 rounded-full text-lg shadow-md uppercase tracking-wide">
            Sản phẩm bán chạy
          </div>
        </div>

        {/* Danh sách sản phẩm dạng lướt ngang (Scroll) */}
        <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide -mx-2 px-2">
          {products.map((product) => (
            <div
              key={product.id}
              className="min-w-[200px] md:min-w-[220px] max-w-[220px]"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* Nút xem thêm (Tùy chọn) */}
        <div className="flex justify-center mt-4">
          {/* --- [ĐÃ SỬA] Đổi link tạm về trang chủ (hoặc bạn có thể đổi thành trang danh mục) để không bị 404 --- */}
          <Link
            href="/"
            className="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-full text-sm backdrop-blur-sm transition"
          >
            Xem tất cả &rarr;
          </Link>
        </div>

        {/* Hình nền trang trí (nếu thích) */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-10 -mt-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white opacity-5 rounded-full -ml-10 -mb-10 pointer-events-none"></div>
      </div>
    </div>
  );
}
