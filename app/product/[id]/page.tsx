import React from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
// Gọi cái nút thông minh vào (Dùng đường dẫn tương đối cho chắc ăn)
import AddToCartButton from "../../../components/AddToCartButton";

export default async function ProductDetail(props: {
  params: Promise<{ id: string }>;
}) {
  // 1. Lấy ID sản phẩm
  const params = await props.params;
  const id = params.id;

  // 2. Lấy thông tin từ kho
  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  // 3. Xử lý lỗi nếu không tìm thấy
  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Sản phẩm không tồn tại!
        </h1>
        <Link
          href="/"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          ← Quay về trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-10">
      {/* Nút quay lại */}
      <div className="bg-white shadow-sm py-4 px-6 mb-6">
        <Link
          href="/"
          className="text-blue-600 hover:underline font-medium flex items-center gap-2"
        >
          <span>←</span> Quay lại trang chủ
        </Link>
      </div>

      <div className="container mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row">
          {/* ẢNH SẢN PHẨM */}
          <div
            className={`md:w-1/2 h-96 ${product.image_url} flex items-center justify-center text-gray-500 text-2xl font-bold bg-opacity-20`}
          >
            <div className="flex flex-col items-center">
              <span className="text-6xl mb-4">📦</span>
              <span>[Ảnh: {product.name}]</span>
            </div>
          </div>

          {/* THÔNG TIN CHI TIẾT */}
          <div className="md:w-1/2 p-8 flex flex-col justify-between">
            <div>
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold uppercase mb-4">
                {product.category}
              </span>

              <h1 className="text-3xl font-bold text-gray-800 mb-2 leading-tight">
                {product.name}
              </h1>

              <div className="flex items-end gap-3 mb-8 border-b pb-6 border-gray-100">
                <span className="text-4xl font-bold text-blue-700">
                  {product.price?.toLocaleString("vi-VN")}đ
                </span>
                <span className="text-gray-500 mb-2 text-lg">
                  / {product.unit}
                </span>

                {product.discount && (
                  <span className="mb-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                    {product.discount}
                  </span>
                )}
              </div>

              <div className="bg-gray-50 p-5 rounded-xl text-sm text-gray-700 space-y-3 border border-gray-100">
                <p className="flex gap-2">
                  <span className="font-bold min-w-[80px]">Công dụng:</span>{" "}
                  <span>Hỗ trợ điều trị, giảm đau, tăng cường sức khỏe.</span>
                </p>
                <p className="flex gap-2">
                  <span className="font-bold min-w-[80px]">Liều dùng:</span>{" "}
                  <span>
                    Đọc kỹ hướng dẫn sử dụng trước khi dùng hoặc theo chỉ định
                    bác sĩ.
                  </span>
                </p>
                <p className="flex gap-2">
                  <span className="font-bold min-w-[80px]">Xuất xứ:</span>{" "}
                  <span>Chính hãng - Nhà thuốc Thiên Hậu phân phối.</span>
                </p>
              </div>
            </div>

            {/* --- ĐÂY LÀ CHỖ GẮN NÚT BẤM THÔNG MINH --- */}
            <AddToCartButton product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}
