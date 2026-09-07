"use client";
import React, { useState, useEffect } from "react";

export default function ProductGallery({
  mainImage,
  gallery = [],
  isOutOfStock = false,
}: {
  mainImage: string;
  gallery?: string[] | null;
  isOutOfStock?: boolean;
}) {
  const images = [mainImage, ...(gallery || [])].filter(Boolean);
  const [activeImage, setActiveImage] = useState(mainImage);

  useEffect(() => {
    if (mainImage) {
      setActiveImage(mainImage);
    }
  }, [mainImage]);

  return (
    <div className="flex flex-col gap-4">
      {/* --- 1. ẢNH TO CHÍNH GIỮA --- */}
      <div className="w-full h-[400px] border border-gray-200 rounded-xl overflow-hidden flex items-center justify-center bg-white relative group">
        {/* [ĐÃ SỬA] Chấp nhận cả link http và mã data:image */}
        {activeImage &&
        (activeImage.startsWith("http") || activeImage.startsWith("data:")) ? (
          <img
            src={activeImage}
            alt="Sản phẩm chính"
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-300">
            <span className="text-6xl mb-2">📦</span>
            <span className="text-sm">Đang tải ảnh...</span>
          </div>
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-700/60">
            <span className="rounded-full bg-gray-900/90 px-5 py-2 text-base font-bold text-white shadow-lg">
              Hết hàng
            </span>
          </div>
        )}

        <div className="absolute top-4 right-4 bg-white p-2 rounded-full shadow cursor-pointer opacity-0 group-hover:opacity-100 transition">
          🔍
        </div>
      </div>

      {/* --- 2. HÀNG ẢNH NHỎ BÊN DƯỚI --- */}
      {images.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => setActiveImage(img)}
              className={`w-20 h-20 flex-shrink-0 border-2 rounded-lg cursor-pointer overflow-hidden bg-white ${
                activeImage === img
                  ? "border-blue-600 ring-1 ring-blue-600"
                  : "border-gray-200 hover:border-blue-400"
              }`}
            >
              {/* [ĐÃ SỬA] Chấp nhận cả link http và mã data:image */}
              {img && (img.startsWith("http") || img.startsWith("data:")) ? (
                <img
                  src={img}
                  alt={`Ảnh nhỏ ${index + 1}`}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-50 text-xs text-gray-400">
                  Ảnh {index + 1}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
