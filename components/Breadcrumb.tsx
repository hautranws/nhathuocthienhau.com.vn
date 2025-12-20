import React from "react";
import Link from "next/link";

// Component này nhận vào tên danh mục và tên sản phẩm để hiển thị
export default function Breadcrumb({
  category,
  productName,
}: {
  category: string;
  productName: string;
}) {
  return (
    <nav className="text-sm text-gray-500 mb-4 font-medium">
      <ul className="flex flex-wrap items-center gap-2">
        {/* Nút về Trang chủ */}
        <li>
          <Link
            href="/"
            className="hover:text-blue-600 transition flex items-center gap-1"
          >
            <span className="text-lg">🏠</span> Trang chủ
          </Link>
        </li>

        <li>/</li>

        {/* Nút về Danh mục (Tạm thời dẫn về trang chủ, sau này làm trang danh mục sau) */}
        <li>
          <Link href="#" className="hover:text-blue-600 transition">
            {category || "Sản phẩm"}
          </Link>
        </li>

        <li>/</li>

        {/* Tên sản phẩm hiện tại (Màu đậm hơn, không bấm được) */}
        <li className="text-blue-700 font-bold truncate max-w-[200px] md:max-w-md">
          {productName}
        </li>
      </ul>
    </nav>
  );
}
