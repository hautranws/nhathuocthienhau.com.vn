"use client";
import React, { useState, useEffect } from "react";

export default function ProductGallery({
  mainImage,
  gallery = [],
}: {
  mainImage: string;
  gallery?: string[] | null;
}) {
  // Gộp ảnh chính và ảnh phụ vào một danh sách duy nhất
  // .filter(Boolean) giúp loại bỏ các giá trị rỗng/null nếu có
  const images = [mainImage, ...(gallery || [])].filter(Boolean);

  // Biến lưu ảnh đang được chọn để hiển thị to
  const [activeImage, setActiveImage] = useState(mainImage);

  // Cập nhật lại activeImage khi mainImage tải xong từ Database
  useEffect(() => {
    if (mainImage) {
      setActiveImage(mainImage);
    }
  }, [mainImage]);

  return (
    <div className="flex flex-col gap-4">
      {/* --- 1. ẢNH TO CHÍNH GIỮA --- */}
      <div className="w-full h-[400px] border border-gray-200 rounded-xl overflow-hidden flex items-center justify-center bg-white relative group">
        {/* LOGIC MỚI: Nếu có link ảnh thật thì dùng thẻ <img> */}
        {activeImage && activeImage.startsWith("http") ? (
          <img
            src={activeImage}
            alt="Sản phẩm chính"
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          // Nếu chưa có ảnh thì hiện icon cái hộp
          <div className="flex flex-col items-center justify-center text-gray-300">
            <span className="text-6xl mb-2">📦</span>
            <span className="text-sm">Đang tải ảnh...</span>
          </div>
        )}

        {/* Icon kính lúp (trang trí) */}
        <div className="absolute top-4 right-4 bg-white p-2 rounded-full shadow cursor-pointer opacity-0 group-hover:opacity-100 transition">
          🔍
        </div>
      </div>

      {/* --- 2. HÀNG ẢNH NHỎ BÊN DƯỚI (THUMBNAILS) --- */}
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
              {img && img.startsWith("http") ? (
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
