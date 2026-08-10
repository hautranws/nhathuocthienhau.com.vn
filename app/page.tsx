import React from "react";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import Image from "next/image";
import Banner from "@/components/Banner";
import FlashSale from "@/components/FlashSale";
import CategoryGrid from "@/components/CategoryGrid";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic"; // Render on-demand, không pre-render lúc build

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
    <div className="min-h-screen bg-linear-to-b from-white via-slate-50 to-white font-sans">
      <main className="container mx-auto px-3 md:px-4 pt-4 md:pt-6">
        <div className="mb-8">
          <Banner />
        </div>

        <div className="mb-8">
          <FlashSale />
        </div>

        {/* --- GIAO DIỆN BÁN CHẠY --- */}
        <section className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between p-3 md:p-4 border-b border-gray-100 bg-linear-to-r from-red-600 to-orange-500 text-white">
              <div className="flex items-center gap-2">
                <span className="text-xl md:text-2xl">🔥</span>
                <h2 className="text-base md:text-xl font-bold uppercase">
                  Sản phẩm bán chạy
                </h2>
              </div>
              <Link
                href="/"
                className="text-xs md:text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition"
              >
                Xem tất cả →
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-0 divide-x divide-y divide-gray-100">
              {bestSellersList && bestSellersList.length > 0 ? (
                bestSellersList.map((product) => (
                  <div key={product.id} className="p-3 md:p-4 bg-white">
                    <ProductCard product={product} />
                  </div>
                ))
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
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between p-3 md:p-4 border-b border-gray-100 bg-linear-to-r from-blue-600 to-blue-500 text-white">
              <div className="flex items-center gap-2">
                <span className="text-xl md:text-2xl">✨</span>
                <h2 className="text-base md:text-xl font-bold uppercase">
                  Sản phẩm chọn lọc
                </h2>
              </div>
              <Link
                href="/"
                className="text-xs md:text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition"
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
