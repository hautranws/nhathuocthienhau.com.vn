"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function SuggestedProductsCart() {
  const [products, setProducts] = useState<any[]>([]);
  const { addToCart } = useCart();
  const [addedIds, setAddedIds] = useState<number[]>([]);

  useEffect(() => {
    supabase
      .from("products")
      .select("id, title, price, old_price, img, unit, is_prescription, category, conversion_units, sku")
      .eq("is_suggested", true)
      .limit(10)
      .then(({ data }) => setProducts(data || []));
  }, []);

  if (products.length === 0) return null;

  const getThumbnail = (img: any) => {
    if (!img) return "https://via.placeholder.com/150";
    try {
      if (img.startsWith("[")) {
        const parsed = JSON.parse(img);
        return Array.isArray(parsed) ? parsed[0] : img;
      }
      return img;
    } catch { return img; }
  };

  const handleAdd = (product: any) => {
    addToCart({ ...product, quantity: 1 });
    setAddedIds((prev) => [...prev, product.id]);
    setTimeout(() => setAddedIds((prev) => prev.filter((id) => id !== product.id)), 2000);
  };

  return (
    <div className="mt-8 bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden">
      <div className="bg-linear-to-r from-orange-500 to-red-500 px-6 py-3 flex items-center gap-2">
        <span className="text-white text-lg">🛍️</span>
        <h2 className="text-white font-bold text-base">Sản phẩm thường mua kèm</h2>
      </div>
      <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {products.map((p) => {
          const isAdded = addedIds.includes(p.id);
          return (
            <div key={p.id} className="flex flex-col bg-gray-50 rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition group">
              <Link href={`/product/${p.id}`} className="block">
                <div className="w-full aspect-square overflow-hidden bg-white flex items-center justify-center">
                  <img
                    src={getThumbnail(p.img)}
                    alt={p.title}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
              </Link>
              <div className="p-2 flex flex-col flex-1">
                <Link href={`/product/${p.id}`}>
                  <p className="text-xs text-gray-700 font-medium line-clamp-2 min-h-8 hover:text-blue-600 transition-colors">
                    {p.title}
                  </p>
                </Link>
                <div className="mt-auto pt-2">
                  <p className="text-red-600 font-bold text-sm">
                    {Number(p.price).toLocaleString("vi-VN")}đ
                  </p>
                  {p.old_price && Number(p.old_price) > 0 && (
                    <p className="text-gray-400 line-through text-xs">
                      {Number(p.old_price).toLocaleString("vi-VN")}đ
                    </p>
                  )}
                  <button
                    onClick={() => handleAdd(p)}
                    className={`mt-1.5 w-full py-1.5 rounded-lg text-xs font-bold transition ${
                      isAdded
                        ? "bg-green-500 text-white"
                        : "bg-orange-500 hover:bg-orange-600 text-white"
                    }`}
                  >
                    {isAdded ? "✓ Đã thêm" : "+ Thêm vào giỏ"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
