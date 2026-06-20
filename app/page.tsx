import React, { cache } from "react"; // Thêm 'cache' từ react
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import Image from "next/image"; // Đã thêm Image cho phần Sản phẩm bán chạy
import Banner from "@/components/Banner";
import FlashSale from "@/components/FlashSale";
import CategoryGrid from "@/components/CategoryGrid";
import ProductCard from "@/components/ProductCard";

// Khai báo thời gian cache là 60 giây. Cứ sau 1 phút, người đầu tiên vào web sẽ
// kích hoạt máy chủ lấy dữ liệu mới 1 lần duy nhất, những người sau dùng lại đồ cũ.
export const revalidate = 60;

// BỌC HÀM GỌI DATABASE BẰNG 'cache()' ĐỂ NEXT.JS LƯU LẠI KẾT QUẢ
const getProducts = cache(async () => {
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, title, price, old_price, img, unit, is_best_seller, is_flash_sale, flash_sale_price",
    )
    .order("id", { ascending: false })
    .limit(20);
  return { data, error };
});

const getBestSellers = cache(async () => {
  const { data, error } = await supabase
    .from("products")
    .select("id, title, price, old_price, img")
    .eq("is_best_seller", true)
    .limit(10);
  return { data, error };
});

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

                  return (
                    <Link
                      href={`/product/${product.id}`}
                      key={product.id}
                      className="group block p-4 hover:shadow-lg transition relative bg-white"
                    >
                      <div className="aspect-square relative mb-3 overflow-hidden rounded-lg bg-gray-50">
                        {/* Đã sửa thẻ <img> thành <Image /> để giảm băng thông */}
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
                        <div className="flex items-end gap-2">
                          <span className="text-red-600 font-bold text-lg">
                            {Number(product.price).toLocaleString("vi-VN")}đ
                          </span>
                          {product.old_price && (
                            <span className="text-gray-400 text-xs line-through mb-1">
                              {Number(product.old_price).toLocaleString(
                                "vi-VN",
                              )}
                              đ
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 w-full bg-blue-600 text-white text-center py-2 rounded-full font-bold text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                        Chọn mua
                      </div>
                    </Link>
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

        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6 border-l-4 border-blue-600 pl-4">
          Sản phẩm từ kho hàng (Realtime)
        </h2>

        {homepageError ? (
          <div className="col-span-2 md:col-span-4 text-center py-10 text-red-700 bg-red-50 rounded-lg border border-red-200">
            <p className="font-semibold mb-2">
              Không thể kết nối đến Supabase.
            </p>
            <p className="text-sm text-gray-600">{homepageError}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {productsList.length > 0 ? (
              productsList.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-2 md:col-span-4 text-center py-10 text-gray-500 bg-white rounded-lg">
                <p>📭 Kho hàng đang trống hoặc chưa mở khóa RLS.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
