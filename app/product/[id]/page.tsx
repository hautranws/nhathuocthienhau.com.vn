import React from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import ProductGallery from "@/components/ProductGallery";
import ProductSpecs from "@/components/ProductSpecs";
import AddToCartButton from "@/components/AddToCartButton"; // Nếu bạn đã có file này thì bỏ comment

// TẠM THỜI ẨN CÁC FILE CHƯA CÓ ĐỂ TRÁNH LỖI WEB
// import RelatedProducts from "@/components/RelatedProducts";
// import ProductReviews from "@/components/ProductReviews";

export default async function ProductDetail(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const id = params.id;

  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

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

  // --- XỬ LÝ LOGIC ALBUM ẢNH (QUAN TRỌNG) ---
  let productImages: string[] = [];

  if (product.img) {
    try {
      // Kiểm tra xem có phải định dạng JSON mảng không (bắt đầu bằng [ )
      if (product.img.trim().startsWith("[")) {
        const parsed = JSON.parse(product.img);
        if (Array.isArray(parsed) && parsed.length > 0) {
          productImages = parsed;
        } else {
          productImages = [product.img];
        }
      } else {
        // Nếu là link thường (dữ liệu cũ)
        productImages = [product.img];
      }
    } catch (e) {
      // Nếu lỗi parse, coi như là link thường
      productImages = [product.img];
    }
  } else {
    // Nếu không có ảnh, dùng ảnh placeholder
    productImages = ["https://via.placeholder.com/500?text=No+Image"];
  }
  // ---------------------------------------------

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-10 pt-6">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-4">
          <Link href="/" className="hover:text-blue-600">
            Trang chủ
          </Link>{" "}
          / <span className="text-gray-600">{product.category}</span> /{" "}
          <span className="text-gray-800 font-medium truncate">
            {product.title}
          </span>
        </div>

        {/* --- KHỐI THÔNG TIN CHÍNH --- */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row mt-4 p-6 gap-8">
          {/* CỘT TRÁI: ẢNH (ĐÃ FIX LOGIC) */}
          <div className="md:w-5/12">
            <ProductGallery
              mainImage={productImages[0]} // Ảnh đầu tiên
              gallery={productImages.slice(1)}
            />
          </div>

          {/* CỘT PHẢI: THÔNG TIN */}
          <div className="md:w-7/12 flex flex-col">
            <div className="border-b pb-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded uppercase">
                  {product.brand || "Chính hãng"}
                </span>
                <span className="text-gray-500 text-xs">
                  Mã SP: {product.id}
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 leading-tight">
                {product.title || product.name}
              </h1>

              <div className="flex items-center gap-4 mt-3 text-sm">
                <div className="flex items-center text-yellow-400">
                  ★★★★★ <span className="text-gray-500 ml-1">(5.0)</span>
                </div>
                <div className="text-gray-400">|</div>
                <div className="text-gray-600">
                  Đã bán <span className="font-bold text-black">100+</span>
                </div>
                {product.expiry && (
                  <>
                    <div className="text-gray-400">|</div>
                    <div className="text-green-600 font-medium">
                      HSD: {product.expiry}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="flex items-end gap-3">
                <span className="text-3xl md:text-4xl font-bold text-blue-700">
                  {Number(product.price).toLocaleString("vi-VN")}đ
                </span>

                {product.old_price && (
                  <span className="text-gray-400 text-lg line-through mb-1">
                    {Number(product.old_price).toLocaleString("vi-VN")}đ
                  </span>
                )}

                {product.discount && (
                  <span className="text-blue-600 bg-blue-100 px-2 py-0.5 rounded text-xs font-bold mb-2">
                    {product.discount}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Giá đã bao gồm thuế (nếu có)
                {product.unit ? ` / ${product.unit}` : ""}
              </p>
            </div>

            {/* Thông tin tóm tắt */}
            <div className="mb-6 space-y-3 text-sm">
              {product.specification && (
                <div className="flex">
                  <span className="w-32 text-gray-500 font-medium flex-shrink-0">
                    Quy cách:
                  </span>
                  <span className="text-gray-800 font-medium">
                    {product.specification}
                  </span>
                </div>
              )}
              {product.origin && (
                <div className="flex">
                  <span className="w-32 text-gray-500 font-medium flex-shrink-0">
                    Xuất xứ:
                  </span>
                  <span className="text-gray-800">{product.origin}</span>
                </div>
              )}
              {product.manufacturer && (
                <div className="flex">
                  <span className="w-32 text-gray-500 font-medium flex-shrink-0">
                    Nhà sản xuất:
                  </span>
                  <span className="text-gray-800">{product.manufacturer}</span>
                </div>
              )}
            </div>

            {/* Nút mua hàng */}
            {/* Sử dụng component Client nếu có để xử lý logic thêm vào giỏ */}
            <div className="mt-auto">
              <AddToCartButton product={product} />
            </div>

            {/* Cam kết */}
            <div className="grid grid-cols-3 gap-2 mt-6 border-t pt-4 text-xs text-gray-500 text-center">
              <div className="flex flex-col items-center gap-1">
                <span className="text-xl">✅</span> 100% Chính hãng
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-xl">💊</span> Dược sĩ tư vấn
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-xl">🚚</span> Giao hàng 2h
              </div>
            </div>
          </div>
        </div>

        {/* --- [MỚI] BẢNG THÔNG SỐ KỸ THUẬT & THÀNH PHẦN --- */}
        {/* Component này giúp hiển thị các thông tin bạn vừa nhập trong admin */}
        <div className="mt-6">
          <ProductSpecs product={product} />
        </div>

        {/* --- MÔ TẢ CHI TIẾT SẢN PHẨM --- */}
        {product.description && (
          <div className="mt-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-l-4 border-blue-600 pl-3">
              Mô tả sản phẩm
            </h2>
            <div
              className="text-gray-700 leading-relaxed prose max-w-none"
              dangerouslySetInnerHTML={{
                __html: product.description,
              }}
            />
            {/* Fallback nếu không có HTML (text thường) */}
            {!product.description.includes("<") && (
              <p className="text-gray-600 whitespace-pre-line mt-2">
                {product.description}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
