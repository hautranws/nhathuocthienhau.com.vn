import React from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import ProductGallery from "@/components/ProductGallery";
import ProductSpecs from "@/components/ProductSpecs";

// TẠM THỜI ẨN CÁC FILE CHƯA CÓ ĐỂ TRÁNH LỖI WEB
// import Breadcrumb from "@/components/Breadcrumb";
// import AddToCartButton from "@/components/AddToCartButton";
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

  // --- MỚI: XỬ LÝ LOGIC ALBUM ẢNH (6 HÌNH) ---
  let productImages: string[] = [];
  try {
    // 1. Thử giải mã chuỗi JSON (ví dụ: '["url1", "url2"]')
    const parsed = JSON.parse(product.img);

    // 2. Kiểm tra xem có phải là mảng không
    if (Array.isArray(parsed)) {
      productImages = parsed;
    } else {
      // Nếu không phải mảng (hiếm), coi như là 1 ảnh
      productImages = [product.img];
    }
  } catch (e) {
    // 3. Nếu lỗi (do là dữ liệu cũ dạng link đơn), thì ép thành mảng 1 phần tử
    productImages = product.img ? [product.img] : [];
  }
  // ---------------------------------------------

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-10 pt-6">
      <div className="container mx-auto px-4">
        {/* Breadcrumb tạm thời viết cứng */}
        <div className="text-sm text-gray-500 mb-4">
          <Link href="/" className="hover:text-blue-600">
            Trang chủ
          </Link>{" "}
          / {product.category} /{" "}
          <span className="text-gray-800 font-medium">{product.title}</span>
        </div>

        {/* --- KHỐI THÔNG TIN CHÍNH --- */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row mt-4 p-6 gap-8">
          {/* CỘT TRÁI: ẢNH (ĐÃ ĐƯỢC NÂNG CẤP ALBUM) */}
          <div className="md:w-5/12">
            <ProductGallery
              // Ảnh chính là ảnh đầu tiên trong mảng (nếu có)
              mainImage={productImages.length > 0 ? productImages[0] : ""}
              // Truyền toàn bộ danh sách ảnh vào gallery
              gallery={productImages}
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

              {/* SỬA: Đổi product.name thành product.title */}
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
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="flex items-end gap-3">
                <span className="text-3xl md:text-4xl font-bold text-blue-700">
                  {product.price}
                </span>

                {/* SỬA: Đổi original_price thành old_price */}
                {product.old_price && (
                  <span className="text-gray-400 text-lg line-through mb-1">
                    {product.old_price}
                  </span>
                )}

                {product.discount && (
                  <span className="text-blue-600 bg-blue-100 px-2 py-0.5 rounded text-xs font-bold mb-2">
                    {product.discount}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Giá đã bao gồm thuế (nếu có){" "}
                {product.unit ? `/ ${product.unit}` : ""}
              </p>
            </div>

            <div className="mb-6 space-y-3">
              {product.specification && (
                <div className="flex">
                  <span className="w-32 text-gray-500 font-medium">
                    Quy cách:
                  </span>
                  <span className="text-gray-800 font-medium">
                    {product.specification}
                  </span>
                </div>
              )}
              {product.origin && (
                <div className="flex">
                  <span className="w-32 text-gray-500 font-medium">
                    Xuất xứ:
                  </span>
                  <span className="text-gray-800">{product.origin}</span>
                </div>
              )}
              <div className="flex">
                <span className="w-32 text-gray-500 font-medium">
                  Mô tả nhanh:
                </span>
                <span className="text-gray-600 flex-1">
                  Sản phẩm chính hãng, hỗ trợ điều trị hiệu quả, được dược sĩ
                  khuyên dùng.
                </span>
              </div>
            </div>

            <div className="mt-auto flex gap-4">
              {/* Thay AddToCartButton bằng nút HTML thường để không lỗi */}
              <button className="flex-1 border-2 border-blue-600 text-blue-600 font-bold py-3 rounded-lg hover:bg-blue-50">
                Thêm vào giỏ
              </button>
              <button className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 shadow-lg">
                Mua ngay
              </button>
            </div>

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

        {/* --- MÔ TẢ SẢN PHẨM --- */}
        {product.description && (
          <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-l-4 border-blue-600 pl-3">
              Mô tả sản phẩm
            </h2>
            <div
              className="text-gray-700 leading-relaxed prose max-w-none"
              dangerouslySetInnerHTML={{
                __html: product.description, // SỬA: Đổi từ description_html sang description
              }}
            />
            {/* Fallback nếu không có HTML */}
            {!product.description.includes("<") && (
              <p className="text-gray-600 whitespace-pre-line mt-2">
                {product.description}
              </p>
            )}
          </div>
        )}

        {/* Ẩn các phần chưa có component */}
        {/* <ProductReviews /> */}
        {/* <RelatedProducts category={product.category} currentId={product.id} /> */}
      </div>
    </div>
  );
}
