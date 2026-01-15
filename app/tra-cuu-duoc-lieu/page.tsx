"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

// Bảng chữ cái
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function TraCuuDuocLieuPage() {
  const [selectedChar, setSelectedChar] = useState("A");
  const [searchTerm, setSearchTerm] = useState("");
  const [herbs, setHerbs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // --- HÀM LẤY VÀ XỬ LÝ DỮ LIỆU TỪ SUPABASE ---
  useEffect(() => {
    const fetchHerbs = async () => {
      setLoading(true);
      try {
        // 1. Lấy cột ingredients từ bảng products
        const { data, error } = await supabase
          .from("products")
          .select("ingredients")
          .not("ingredients", "is", null);

        if (error) throw error;

        if (data) {
          // 2. Xử lý tách chuỗi và lọc trùng
          const allHerbs = new Set<string>();

          data.forEach((product: any) => {
            if (product.ingredients) {
              // Tách theo dấu phẩy
              const parts = product.ingredients.split(",");
              
              parts.forEach((part: string) => {
                const cleanName = part.trim();
                // Lọc cơ bản: Độ dài > 1
                if (cleanName.length > 1 && cleanName.length < 50) {
                   const formattedName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
                   allHerbs.add(formattedName);
                }
              });
            }
          });

          // 3. Sắp xếp A-Z
          const sortedList = Array.from(allHerbs).sort((a, b) => 
            a.localeCompare(b)
          );
          
          setHerbs(sortedList);
        }
      } catch (err) {
        console.error("Lỗi lấy dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHerbs();
  }, []);

  // --- LOGIC LỌC ---
  const filteredList = herbs.filter((item) => {
    if (searchTerm) {
      return item.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return item.toUpperCase().startsWith(selectedChar);
  });

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-10">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-3 text-sm text-gray-500">
        <Link href="/" className="hover:text-green-700">Trang chủ</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800 font-medium">Dược liệu</span>
      </div>

      <div className="container mx-auto px-4">
        
        {/* --- 1. BANNER TÌM KIẾM (MÀU XANH LÁ) --- */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
          {/* Background trang trí màu xanh lá */}
          <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-green-50 skew-x-12 translate-x-10 md:block hidden"></div>
          <div className="absolute right-10 bottom-0 md:block hidden opacity-20 text-9xl select-none">
            🌿
          </div>

          <div className="w-full md:w-2/3 z-10">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Tra cứu dược liệu</h1>
            <div className="relative">
              <input 
                type="text"
                placeholder="Nhập tên dược liệu (Ví dụ: Artiso, Gừng...)"
                className="w-full pl-5 pr-12 py-3 rounded-full border border-gray-300 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 shadow-sm text-gray-700"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center hover:bg-green-700 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* --- 2. BẢNG DỮ LIỆU --- */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-green-600">🌿</span> Dược liệu thông dụng
          </h2>
          
          {/* Bộ lọc A-Z */}
          <div className="flex flex-wrap gap-2 mb-8 border-b pb-6">
            {ALPHABET.map((char) => {
               const isActive = !searchTerm && selectedChar === char;
               return (
                <button
                  key={char}
                  onClick={() => {
                    setSelectedChar(char);
                    setSearchTerm("");
                  }}
                  className={`w-10 h-10 rounded-full text-sm font-semibold transition-all border flex items-center justify-center
                    ${isActive 
                      ? "bg-green-600 text-white border-green-600 shadow-md scale-110" 
                      : "bg-white text-gray-600 border-gray-200 hover:border-green-500 hover:text-green-600 hover:bg-green-50"
                    }`}
                >
                  {char}
                </button>
               )
            })}
          </div>

          {/* Danh sách dược liệu */}
          {loading ? (
             <div className="py-10 text-center text-gray-500 flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-2"></div>
                Đang tải dữ liệu dược liệu...
             </div>
          ) : (
            <>
              {filteredList.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-4 gap-x-8">
                  {filteredList.map((item, index) => (
                    <Link 
                      key={index} 
                      href={`/tra-cuu-thuoc?keyword=${encodeURIComponent(item)}`}
                      className="text-gray-700 hover:text-green-700 hover:font-bold text-sm md:text-base py-2 border-b border-gray-50 hover:bg-green-50 px-2 rounded transition group flex justify-between items-center"
                    >
                      <span>{item}</span>
                      <span className="text-gray-300 text-xs group-hover:text-green-500">➝</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-lg">
                  <p className="text-4xl mb-3">🍃</p>
                  <p>
                    {searchTerm 
                      ? `Không tìm thấy dược liệu nào chứa "${searchTerm}"`
                      : `Chưa có dược liệu bắt đầu bằng chữ "${selectedChar}"`
                    }
                  </p>
                </div>
              )}
            </>
          )}
          
          {/* Pagination giả lập */}
          {filteredList.length > 20 && (
             <div className="mt-8 flex justify-center gap-2">
                <button className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-sm">1</button>
                <button className="w-8 h-8 rounded-full bg-white border hover:bg-gray-100 flex items-center justify-center text-sm">2</button>
                <span className="flex items-end px-2 text-gray-400">...</span>
                <button className="w-8 h-8 rounded-full bg-white border hover:bg-gray-100 flex items-center justify-center text-sm">{">"}</button>
             </div>
          )}
        </div>

      </div>
    </div>
  );
}