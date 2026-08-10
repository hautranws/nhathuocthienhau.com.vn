"use client"; // Bắt buộc: Để nút này bấm được

import React from "react";
import { useCart } from "../context/CartContext"; // Kết nối với kho giỏ hàng

export default function AddToCartButton({ product }: { product: any }) {
  const { addToCart } = useCart(); // Lấy hàm thêm hàng

  // Hàm xử lý khi bấm nút
  const handleAddToCart = () => {
    addToCart(product);
  };

  return (
    <div className="mt-6 flex gap-3">
      {/* Nút Thêm vào giỏ */}
      <button
        onClick={handleAddToCart}
        className="flex-1 bg-white border border-blue-200 text-blue-700 font-bold py-3.5 rounded-2xl hover:bg-blue-50 transition transform active:scale-95 shadow-sm"
      >
        Thêm vào giỏ
      </button>

      {/* Nút Mua ngay (Bấm phát thêm luôn rồi chuyển trang sau này) */}
      <button
        onClick={handleAddToCart}
        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-3.5 rounded-2xl hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-200 transition transform active:scale-95"
      >
        Mua ngay
      </button>
    </div>
  );
}
