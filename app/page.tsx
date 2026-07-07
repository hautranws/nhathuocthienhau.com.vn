import React from "react";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import Image from "next/image";
import Banner from "@/components/Banner";
import FlashSale from "@/components/FlashSale";
import CategoryGrid from "@/components/CategoryGrid";
import ProductCard from "@/components/ProductCard";

export const revalidate = 3; // ISR: Revalidate mỗi 3 giây khi có request

async function getProducts() {
  // Dùng supabaseAdmin để bypass RLS
  const { data, error } = await supabaseAdmin
    .from("products")
    .select(
      "id, title, price, old_price, img, unit, is_best_seller, is_flash_sale, flash_sale_price, category, is_prescription, is_homepage_visible, specification, conversion_units",
    )
    .eq("is_homepage_visible", true)
    .order("id", { ascending: false });

  if (error) {
    console.error("❌ Lỗi lấy hàng chọn lọc:", error.message);
  }

  console.log("✅ Tìm thấy", data?.length || 0, "sản phẩm chọn lọc");

  // Nếu có sản phẩm được chọn, trả về
  if (data && data.length > 0) {
    return { data, error };
  }

  // Nếu không có sản phẩm được chọn, fallback lấy 20 sản phẩm mới nhất
  console.log(
    "⚠️ Không có sản phẩm được chọn, fallback lấy sản phẩm mới nhất...",
  );
  const { data: defaultData, error: defaultError } = await supabaseAdmin
    .from("products")
    .select(
      "id, title, price, old_price, img, unit, is_best_seller, is_flash_sale, flash_sale_price, category, is_prescription, is_homepage_visible",
    )
    .order("id", { ascending: false })
    .limit(20);

  if (defaultError) {
    console.error("❌ Lỗi lấy sản phẩm fallback:", defaultError.message);
  }

  console.log("✅ Fallback: Lấy được", defaultData?.length || 0, "sản phẩm");

  return { data: defaultData || [], error: defaultError };
}

async function getBestSellers() {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("id, title, price, old_price, img, category, is_prescription")
    .eq("is_best_seller", true)
    .limit(10);
  return { data, error };
}

export default async function Home() {
  let products: any[] | null = null;
  let bestSellers: any[] | null = null;
  let productsError: any = null;
  let bestSellersError: any = null;

  // 1. Lấy tất cả sản phẩm (Có Cache)
  try {
    const { data, error } = await getProducts();
    products = data;
    if (error) {
      console.warn("Lỗi lấy hàng:", error);
      productsError = error;
    }
  } catch (err: any) {
    console.warn("Lỗi lấy hàng (exception):", err?.message);
    productsError = err;
  }

  // 2. Lấy sản phẩm bán chạy (Có Cache)
  try {
    const { data, error } = await getBestSellers();
    bestSellers = data;
    if (error) {
      console.warn("Lỗi lấy best sellers:", error);
      bestSellersError = error;
    }
  } catch (err: any) {
    console.warn("Lỗi lấy best sellers (exception):", err?.message);
    bestSellersError = err;
  }

  const productsList = products ?? [];
  const bestSellersList = bestSellers ?? [];
  const homepageError =
    productsError?.message || bestSellersError?.message || null;

  return (
    <div className="min-h-screen bg-white font-sans">
      <main className="container mx-auto p-4 pt-6">
        <div className="mb-8">
          <Banner />
        </div>

        <div className="mb-8">
          <FlashSale />
        </div>

        {/* --- GIAO DIỆN BÁN CHẠY --- */}
        <section className="mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-linear-to-r from-red-600 to-orange-500 text-white">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔥</span>
                <h2 className="text-xl font-bold uppercase">
                  Sản phẩm bán chạy
                </h2>
              </div>
              <Link
                href="/"
                className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition"
              >
                Xem tất cả →
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-0 divide-x divide-y divide-gray-100">
              {bestSellersList && bestSellersList.length > 0 ? (
                bestSellersList.map((product) => {
                  // Xử lý ảnh cho thẻ Image
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

                  const isRx =
                    product.category === "Thuốc" && product.is_prescription;

                  return (
                    <div
                      key={product.id}
                      className="group block p-4 hover:shadow-lg transition relative bg-white"
                    >
                      <Link href={`/product/${product.id}`} className="block">
                        <div className="aspect-square relative mb-3 overflow-hidden rounded-lg bg-white">
                          {isRx && (
                            <div className="absolute top-2 left-2 z-10">
                              <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                                Rx
                              </span>
                            </div>
                          )}
                          <Image
                            src={finalImg}
                            alt={product.title}
                            fill
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                            className="object-contain group-hover:scale-105 transition duration-300"
                          />
                        </div>
                        <h3 className="text-sm font-medium text-gray-800 line-clamp-2 min-h-10 group-hover:text-blue-600">
                          {product.title}
                        </h3>
                        <div className="mt-2">
                          {isRx ? (
                            <p className="text-gray-500 text-sm">
                              Cần tư vấn từ dược sĩ
                            </p>
                          ) : (
                            <div className="flex items-end gap-1">
                              <span className="text-blue-600 font-bold text-lg">
                                {Number(product.price).toLocaleString("vi-VN")}đ
                              </span>
                              {product.old_price && (
                                <span className="text-gray-400 text-xs line-through mb-1 font-normal">
                                  {Number(product.old_price).toLocaleString(
                                    "vi-VN",
                                  )}
                                  đ
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </Link>
                      {isRx ? (
                        <a
                          href="https://zalo.me/0988991837"
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 block w-full bg-blue-50 text-blue-600 font-bold py-2 rounded-full hover:bg-blue-100 transition-colors text-xs text-center border border-blue-100"
                        >
                          Tư vấn ngay
                        </a>
                      ) : (
                        <div className="mt-3 w-full bg-blue-600 text-white text-center py-2 rounded-full font-bold text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                          Chọn mua
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-gray-500 col-span-full">
                  Chưa có sản phẩm bán chạy nào được chọn.
                </div>
              )}
            </div>
          </div>
        </section>

        <CategoryGrid />

        {/* --- GIAO DIỆN SẢN PHẨM CHỌN LỌC --- */}
        <section className="mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-blue-500 text-white">
              <div className="flex items-center gap-2">
                <span className="text-2xl">✨</span>
                <h2 className="text-xl font-bold uppercase">
                  Sản phẩm chọn lọc
                </h2>
              </div>
              <Link
                href="/"
                className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition"
              >
                Xem tất cả →
              </Link>
            </div>

            {homepageError ? (
              <div className="p-8 text-center text-red-700 bg-red-50 border-t border-red-200">
                <p className="font-semibold mb-2">
                  Không thể kết nối đến Supabase.
                </p>
                <p className="text-sm text-gray-600">{homepageError}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-0 divide-x divide-y divide-gray-100">
                {productsList && productsList.length > 0 ? (
                  productsList.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500 col-span-full">
                    Chưa có sản phẩm chọn lọc nào được chọn.
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
