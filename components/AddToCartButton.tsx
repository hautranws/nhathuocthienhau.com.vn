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
    <div className="mt-8 flex gap-4">
      {/* Nút Thêm vào giỏ */}
      <button
        onClick={handleAddToCart}
        className="flex-1 bg-white border-2 border-blue-600 text-blue-600 font-bold py-3 rounded-full hover:bg-blue-50 transition transform active:scale-95"
      >
        Thêm vào giỏ
      </button>

      {/* Nút Mua ngay (Bấm phát thêm luôn rồi chuyển trang sau này) */}
      <button
        onClick={handleAddToCart}
        className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-full hover:bg-blue-700 shadow-lg shadow-blue-200 transition transform active:scale-95"
      >
        Mua ngay
      </button>
    </div>
  );
}
