"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image"; // Thêm thư viện Image tối ưu của Next.js
import { useCart } from "@/context/CartContext";

interface ProductProps {
  product: {
    id: number;
    title: string;
    price: number;
    img: string;
    unit?: string;
    specification?: string;
  };
}

const ProductCard: React.FC<ProductProps> = ({ product }) => {
  const { addToCart } = useCart();

  const getThumbnail = (imgData: string) => {
    if (!imgData) return "https://via.placeholder.com/150";
    try {
      const parsed = JSON.parse(imgData);
      return Array.isArray(parsed) ? parsed[0] : imgData;
    } catch {
      return imgData;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-shadow duration-300 p-4 flex flex-col h-full relative group">
      {/* Link đã chốt chuẩn là /product/ */}
      <Link href={`/product/${product.id}`} className="block mb-3">
        {/* Thêm class 'relative' vào div bao ngoài để dùng được thuộc tính 'fill' của Next Image */}
        <div className="w-full aspect-square relative flex items-center justify-center overflow-hidden rounded-lg cursor-pointer">
          <Image
            src={getThumbnail(product.img)}
            alt={product.title}
            fill // Thuộc tính giúp ảnh lấp đầy div cha mà không làm vỡ khung
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw" // Phân bổ size thông minh để tiết kiệm data
            className="object-contain group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </Link>

      <Link href={`/product/${product.id}`} className="block mb-2">
        <h3
          className="text-gray-900 font-semibold text-sm leading-tight line-clamp-2 min-h-[40px] hover:text-blue-600 transition-colors cursor-pointer"
          title={product.title}
        >
          {product.title}
        </h3>
      </Link>

      <div className="flex items-end gap-1 mb-2">
        <span className="text-blue-600 font-bold text-lg">
          {Number(product.price).toLocaleString("vi-VN")}đ
        </span>
        {product.unit && (
          <span className="text-gray-500 text-sm mb-[2px]">
            / {product.unit}
          </span>
        )}
      </div>

      <div className="mb-4">
        {product.specification ? (
          <div className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded inline-block">
            {product.specification}
          </div>
        ) : (
          <div className="h-[24px]"></div>
        )}
      </div>

      <button
        className="mt-auto w-full bg-blue-600 text-white font-bold py-2.5 rounded-full hover:bg-blue-700 transition-colors text-sm"
        onClick={() => addToCart(product)}
      >
        Chọn mua
      </button>
    </div>
  );
};

export default ProductCard;