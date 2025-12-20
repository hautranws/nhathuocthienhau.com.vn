import React from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

// Component này nhận vào Danh mục hiện tại và ID sản phẩm đang xem (để trừ nó ra)
export default async function RelatedProducts({
  category,
  currentId,
}: {
  category: string;
  currentId: number;
}) {
  // GỌI KHO: Lấy 4 sản phẩm cùng danh mục, nhưng KHÔNG LẤY sản phẩm đang xem (neq)
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("category", category) // Cùng loại
    .neq("id", currentId) // Khác bài đang xem
    .limit(4); // Chỉ lấy 4 bài

  // Nếu không có sản phẩm nào liên quan thì không hiện gì cả
  if (!products || products.length === 0) return null;

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 border-l-4 border-blue-600 pl-3">
        Sản phẩm cùng loại
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/product/${product.id}`}
            className="block group"
          >
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition h-full flex flex-col">
              {/* Ảnh */}
              <div
                className={`h-32 ${product.image_url} rounded-lg mb-3 flex items-center justify-center text-gray-400 bg-opacity-20`}
              >
                [Ảnh]
              </div>

              {/* Tên */}
              <h3 className="font-bold text-gray-800 text-sm line-clamp-2 mb-2 group-hover:text-blue-700 min-h-[40px]">
                {product.name}
              </h3>

              {/* Giá */}
              <div className="mt-auto">
                <p className="text-blue-600 font-bold">
                  {product.price?.toLocaleString("vi-VN")}đ
                  <span className="text-gray-400 text-xs font-normal ml-1">
                    / {product.unit}
                  </span>
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
