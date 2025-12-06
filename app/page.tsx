import React from "react";
import { supabase } from "@/lib/supabaseClient"; // Kết nối kho hàng
import Link from "next/link"; // Công cụ để chuyển trang

export default async function Home() {
  // Lấy dữ liệu từ kho Supabase
  const { data: products, error } = await supabase.from("products").select("*");

  if (error) {
    console.error("Lỗi lấy hàng:", error);
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* ⛔️ ĐÃ XÓA HEADER Ở ĐÂY 
         (Vì Header giờ đã nằm bên file layout.tsx rồi) 
      */}

      {/* --- BODY (CHỈ GIỮ LẠI PHẦN NÀY) --- */}
      <main className="container mx-auto p-4 pt-6">
        {" "}
        {/* Thêm padding top để không bị dính sát header */}
        <div className="w-full h-64 bg-blue-200 rounded-xl flex items-center justify-center mb-8 shadow-sm">
          <h2 className="text-3xl text-blue-800 font-bold opacity-50">
            [Banner Quảng Cáo]
          </h2>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-l-4 border-blue-600 pl-4">
          Sản phẩm từ kho hàng (Realtime)
        </h2>
        {/* --- GRID SẢN PHẨM --- */}
        <div className="grid grid-cols-4 gap-6">
          {products && products.length > 0 ? (
            products.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="block group"
              >
                <div className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition cursor-pointer relative border border-gray-100 flex flex-col justify-between h-full">
                  {product.discount && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] px-2 py-1 rounded font-bold">
                      {product.discount}
                    </span>
                  )}

                  <div
                    className={`h-40 ${product.image_url} rounded-lg mb-4 flex items-center justify-center text-gray-400 font-medium`}
                  >
                    [Ảnh]
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-800 text-sm line-clamp-2 mb-2 min-h-[40px] group-hover:text-blue-700">
                      {product.name}
                    </h3>

                    <p className="text-blue-600 font-bold text-lg">
                      {product.price?.toLocaleString("vi-VN")}đ
                      <span className="text-gray-400 font-normal text-xs ml-1">
                        / {product.unit}
                      </span>
                    </p>
                  </div>

                  <button className="mt-3 w-full bg-blue-100 text-blue-700 font-bold py-2 rounded group-hover:bg-blue-600 group-hover:text-white transition text-sm">
                    Xem chi tiết
                  </button>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-4 text-center py-10 text-gray-500 bg-white rounded-lg">
              <p className="text-xl">
                📭 Kho hàng đang trống hoặc chưa mở khóa RLS.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
