import React from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

// Component hiển thị từng sản phẩm (Giữ nguyên)
const ProductItem = ({ product }: { product: any }) => (
  <Link
    href={`/product/${product.id}`}
    className="block group bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-lg transition overflow-hidden"
  >
    <div className="relative h-48 w-full bg-gray-50 flex items-center justify-center p-4">
      {product.discount && (
        <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] px-2 py-1 rounded font-bold z-10">
          {product.discount}
        </span>
      )}
      <div className="h-40 w-full flex items-center justify-center overflow-hidden">
        {product.img ? (
          <img
            src={product.img}
            alt={product.title}
            className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <span className="text-4xl">📦</span>
        )}
      </div>
    </div>
    <div className="p-4">
      <h3 className="font-bold text-gray-800 text-sm line-clamp-2 mb-2 min-h-[40px] group-hover:text-blue-700 transition-colors">
        {product.title}
      </h3>
      <div className="flex items-baseline gap-2">
        <span className="text-blue-600 font-bold text-lg">
          {product.price?.toLocaleString("vi-VN")}đ
        </span>
        {product.old_price && (
          <span className="text-gray-400 text-xs line-through">
            {product.old_price.toLocaleString("vi-VN")}đ
          </span>
        )}
      </div>
    </div>
  </Link>
);

// --- PHẦN CHÍNH (ĐÃ SỬA LỖI) ---
export default async function SearchPage({
  searchParams,
}: {
  // Khai báo kiểu dữ liệu là Promise (Quan trọng cho Next.js mới)
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // 1. Dùng await để lấy dữ liệu từ URL
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q || ""; // Lấy từ khóa 'q'

  // 2. Tìm trong Supabase
  let products = [];
  if (query) {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .ilike("title", `%${query}%`); // Tìm kiếm gần đúng

    if (!error && data) {
      products = data;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Tiêu đề kết quả */}
        <div className="mb-6 border-b pb-4">
          <p className="text-gray-500 text-sm mb-1">Kết quả tìm kiếm cho:</p>
          <h1 className="text-3xl font-bold text-blue-800 uppercase">
            &quot;{query}&quot;
          </h1>
        </div>

        {/* Danh sách sản phẩm tìm thấy */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductItem key={product.id} product={product} />
            ))}
          </div>
        ) : (
          /* Trường hợp không tìm thấy */
          <div className="text-center py-16 bg-white rounded-lg border border-dashed border-gray-300">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Không tìm thấy sản phẩm nào
            </h2>
            <p className="text-gray-500 mb-6">
              Rất tiếc, chúng tôi không tìm thấy sản phẩm phù hợp với từ khóa
              &quot;{query}&quot;.
            </p>
            <Link
              href="/"
              className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
            >
              Về trang chủ
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
