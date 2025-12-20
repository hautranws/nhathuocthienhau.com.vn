import React from "react";
import Link from "next/link";

// --- GIỮ NGUYÊN: Component hiển thị Item lớn (Icon + Title + Count) ---
export const GridItem = ({ href, sticker, title, count }: any) => (
  <Link
    href={href}
    className="flex items-center gap-4 p-4 border rounded-xl hover:shadow-lg bg-white group/item transition hover:border-blue-500"
  >
    <div className="h-16 w-16 flex items-center justify-center bg-gray-50 rounded-lg">
      <span className="text-3xl">{sticker}</span>
    </div>
    <div>
      <h4 className="font-bold text-gray-800 text-base group-hover/item:text-blue-700">
        {title}
      </h4>
      {count && <p className="text-sm text-gray-500">{count}</p>}
    </div>
  </Link>
);

// --- GIỮ NGUYÊN: Component hiển thị Item nhỏ (Icon tròn màu + Title) ---
export const SmallItem = ({ href, sticker, title, bg }: any) => (
  <Link
    href={href}
    className="flex items-center gap-3 p-4 border rounded-lg hover:border-blue-500 hover:shadow-md bg-white transition"
  >
    <div
      className={`w-10 h-10 ${
        bg || "bg-blue-100"
      } rounded-full flex items-center justify-center text-xl`}
    >
      {sticker}
    </div>
    <span className="font-medium text-sm group-hover/item:text-blue-700">
      {title}
    </span>
  </Link>
);

// --- ĐÃ SỬA: Component hiển thị Sản phẩm (Ghép giá và đơn vị) ---
export const ProductCard = ({
  img,
  title,
  price,
  oldPrice,
  discount,
  unit, // Biến này lấy từ Database (ví dụ: "Hộp", "Vỉ")
}: any) => (
  <div className="border rounded-lg p-3 hover:shadow-xl transition cursor-pointer bg-white flex flex-col justify-between h-full group/prod relative">
    {/* Huy hiệu giảm giá */}
    {discount && (
      <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] px-1 rounded">
        {discount}
      </span>
    )}

    {/* Phần Hình ảnh và Tên */}
    <div>
      <div className="h-28 bg-gray-50 rounded mb-2 flex items-center justify-center text-xs text-gray-400 group-hover/prod:scale-105 transition overflow-hidden">
        {img && img.startsWith("http") ? (
          <img src={img} className="h-full object-contain" alt={title} />
        ) : (
          <span className="text-3xl">💊</span> // Icon mặc định nếu không có ảnh
        )}
      </div>
      <p className="text-xs font-bold line-clamp-2 mb-1 text-gray-700 group-hover/prod:text-blue-700">
        {title}
      </p>
    </div>

    {/* --- PHẦN GIÁ ĐÃ SỬA --- */}
    <div className="flex flex-wrap items-baseline gap-1 mt-1">
      {/* 1. Giá hiện tại */}
      <span className="text-blue-600 font-bold text-sm">{price}</span>

      {/* 2. Đơn vị tính (Tự động thêm dấu gạch chéo /) */}
      {unit && (
        <span className="text-gray-500 text-xs font-medium">
          / {unit.replace("/", "").trim()}{" "}
          {/* Xử lý để tránh bị 2 dấu gạch chéo */}
        </span>
      )}

      {/* 3. Giá cũ (Gạch ngang) - Luôn hiện nếu có */}
      {oldPrice && (
        <span className="text-gray-400 text-xs font-normal line-through ml-1">
          {oldPrice}
        </span>
      )}
    </div>
  </div>
);
