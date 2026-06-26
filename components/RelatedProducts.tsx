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
        {products.map((product) => {
          const isRx = product.category === "Thuốc" && product.is_prescription;
          let finalImg = "https://via.placeholder.com/150";
          if (product.img) {
            try {
              finalImg = product.img.startsWith("[")
                ? JSON.parse(product.img)[0]
                : product.img;
            } catch (e) {
              finalImg = product.img;
            }
          }

          return (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              className="block group"
            >
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition h-full flex flex-col relative">
                {isRx && (
                  <div className="absolute top-2 left-2 z-10">
                    <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                      Rx
                    </span>
                  </div>
                )}
                {/* Ảnh */}
                <div className="w-full aspect-square bg-white rounded-lg mb-3 flex items-center justify-center overflow-hidden relative">
                  <img
                    src={finalImg}
                    alt={product.title}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                  />
                </div>

                {/* Tên */}
                <h3 className="font-bold text-gray-800 text-sm line-clamp-2 mb-2 group-hover:text-blue-700 min-h-[40px]">
                  {product.title || product.name}
                </h3>

                {/* Giá hoặc Tư vấn */}
                <div className="mt-auto">
                  {isRx ? (
                    <div className="w-full bg-blue-50 text-blue-600 font-bold py-1.5 rounded-full text-[10px] text-center border border-blue-100 uppercase">
                      Tư vấn ngay
                    </div>
                  ) : (
                    <p className="text-blue-700 font-bold text-sm">
                      {product.price?.toLocaleString("vi-VN")}đ
                      {product.unit && (
                        <span className="text-gray-400 text-[10px] font-normal ml-1">
                          / {product.unit}
                        </span>
                      )}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
