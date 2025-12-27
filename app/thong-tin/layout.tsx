"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { INFO_MENU } from "@/components/data/infoData"; // Import dữ liệu bước 1

export default function InfoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname(); // Lấy đường dẫn hiện tại để tô màu menu

  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-6">
          
          {/* --- CỘT TRÁI: MENU DANH MỤC --- */}
          <div className="w-full md:w-1/4">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden sticky top-4">
              <div className="p-4 bg-gray-50 border-b font-bold text-gray-700 uppercase text-sm">
                📚 Bài viết trong danh mục
              </div>
              <ul className="flex flex-col text-sm">
                {INFO_MENU.map((item) => {
                  const isActive = pathname.includes(item.id);
                  return (
                    <li key={item.id}>
                      <Link
                        href={`/thong-tin/${item.id}`}
                        className={`block px-4 py-3 border-b border-gray-100 transition-colors ${
                          isActive
                            ? "bg-blue-50 text-blue-700 font-bold border-l-4 border-l-blue-600"
                            : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
                        }`}
                      >
                        {item.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* --- CỘT PHẢI: NỘI DUNG (Thay đổi theo link) --- */}
          <div className="w-full md:w-3/4">
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm min-h-[500px]">
              {children}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}