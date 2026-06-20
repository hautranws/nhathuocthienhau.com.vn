import React from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import ProductGallery from "@/components/ProductGallery";
import ProductSpecs from "@/components/ProductSpecs";
import AddToCartButton from "@/components/AddToCartButton";

export const revalidate = 60;

export default async function ProductDetail(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const id = params.id;

  // 1. Lấy dữ liệu sản phẩm
  let product = null;
  let error = null;

  try {
    const { data, error: queryError } = await supabase
      .from("products")
      .select(
        "id, title, category, sub_category, brand, flash_sale_start, flash_sale_end, is_flash_sale, is_prescription, price, old_price, flash_sale_price, discount, unit, specification, origin, manufacturer, expiry, indications, contraindications, description, img, ingredients, registration_no, dosage_form",
      )
      .eq("id", id)
      .single();

    product = data;
    error = queryError;

    if (queryError) {
      console.warn(`Lỗi lấy sản phẩm ${id}:`, queryError);
    }
  } catch (err: any) {
    console.warn(`Exception lấy sản phẩm ${id}:`, err);
    error = err;
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Sản phẩm không tồn tại!
        </h1>
        <p className="text-gray-600 text-sm mb-6">ID: {id}</p>
        <Link
          href="/"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          ← Quay về trang chủ
        </Link>
      </div>
    );
  }

  // --- LOGIC KIỂM TRA FLASH SALE ---
  const now = new Date().getTime();
  const start = product.flash_sale_start
    ? new Date(product.flash_sale_start).getTime()
    : 0;
  const end = product.flash_sale_end
    ? new Date(product.flash_sale_end).getTime()
    : 0;
  const isFlashSaleActive = product.is_flash_sale && now >= start && now <= end;

  // --- XỬ LÝ LOGIC ALBUM ẢNH ---
  let productImages: string[] = [];
  if (product.img) {
    try {
      if (product.img.trim().startsWith("[")) {
        const parsed = JSON.parse(product.img);
        productImages =
          Array.isArray(parsed) && parsed.length > 0 ? parsed : [product.img];
      } else {
        productImages = [product.img];
      }
    } catch (e) {
      productImages = [product.img];
    }
  } else {
    productImages = ["https://via.placeholder.com/500?text=No+Image"];
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-10 pt-6">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-4">
          <Link href="/" className="hover:text-blue-600">
            Trang chủ
          </Link>
          {" / "}
          <span className="text-gray-600">{product.category}</span>
          {" / "}
          <span className="text-gray-800 font-medium truncate">
            {product.title}
          </span>
        </div>

        {/* --- KHỐI THÔNG TIN CHÍNH --- */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row mt-4 p-6 gap-8">
          {/* CỘT TRÁI: ẢNH */}
          <div className="md:w-5/12">
            <ProductGallery
              mainImage={productImages[0]}
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

              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 leading-tight flex flex-wrap items-center gap-2">
                {/* --- [SỬA] CHỈ HIỆN RX NẾU LÀ THUỐC --- */}
                {product.category === "Thuốc" && product.is_prescription && (
                  <span
                    className="bg-red-600 text-white text-xs px-2 py-1 rounded border border-red-700 shadow-sm"
                    title="Thuốc bán theo đơn"
                  >
                    Rx - Thuốc kê đơn
                  </span>
                )}
                {product.title }
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

            {/* --- KHU VỰC HIỂN THỊ GIÁ --- */}
            {isFlashSaleActive ? (
              <div className="mb-6 bg-gradient-to-r from-red-600 to-orange-500 rounded-lg p-4 text-white shadow-md relative overflow-hidden">
                <div className="absolute top-[-10px] right-[-10px] opacity-20 text-6xl pointer-events-none select-none">
                  ⚡
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-black text-yellow-300 uppercase tracking-wider text-sm animate-pulse">
                    ⚡ Flash Sale
                  </span>
                  <span className="bg-white text-red-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                    Đang diễn ra
                  </span>
                </div>
                <div className="flex items-end gap-3">
                  <span className="text-3xl md:text-5xl font-extrabold text-white">
                    {Number(product.flash_sale_price).toLocaleString("vi-VN")}đ
                  </span>
                  <span className="text-white/80 text-lg line-through mb-1.5">
                    {Number(product.price).toLocaleString("vi-VN")}đ
                  </span>
                  <span className="bg-yellow-400 text-red-700 text-xs font-black px-2 py-1 rounded mb-2 shadow-sm">
                    -
                    {Math.round(
                      ((product.price - product.flash_sale_price) /
                        product.price) *
                        100,
                    )}
                    %
                  </span>
                </div>
                <p className="text-xs text-white/90 mt-2 font-medium">
                  🔥 Giá sốc chỉ áp dụng trong khung giờ vàng.
                </p>
              </div>
            ) : (
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
                  Giá đã bao gồm thuế (nếu có){" "}
                  {product.unit ? ` / ${product.unit}` : ""}
                </p>
              </div>
            )}

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
            <div className="mt-auto">
              <AddToCartButton
                product={{
                  ...product,
                  price: isFlashSaleActive
                    ? product.flash_sale_price
                    : product.price,
                }}
              />
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

        {/* --- [SỬA] KHU VỰC THÔNG TIN CHUYÊN SÂU CHO THUỐC --- */}
        {/* Chỉ hiện nếu danh mục là "Thuốc" và có dữ liệu */}
        {product.category === "Thuốc" &&
          (product.indications || product.contraindications) && (
            <div className="mt-6 bg-white p-6 rounded-xl shadow-sm border border-blue-100">
              <h2 className="text-xl font-bold text-blue-800 mb-4 border-b pb-2 flex items-center gap-2">
                <span>🩺</span> Thông tin chỉ định
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {product.indications && (
                  <div>
                    <h3 className="font-bold text-gray-800 mb-2">
                      ✅ Chỉ định (Công dụng):
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                      {product.indications}
                    </p>
                  </div>
                )}

                {product.contraindications && (
                  <div>
                    <h3 className="font-bold text-red-600 mb-2">
                      ⛔ Chống chỉ định:
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                      {product.contraindications}
                    </p>
                  </div>
                )}
                {/* Đã xóa hiển thị Liều dùng (Dosage) tại đây */}
              </div>
            </div>
          )}

        {/* --- BẢNG THÔNG SỐ KỸ THUẬT & THÀNH PHẦN --- */}
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
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
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
