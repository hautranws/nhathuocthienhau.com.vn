"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

// Bảng chữ cái
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function TraCuuDuocChatPage() {
  const [selectedChar, setSelectedChar] = useState("A");
  const [searchTerm, setSearchTerm] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // --- HÀM LẤY VÀ XỬ LÝ DƯỢC CHẤT ---
  useEffect(() => {
    const fetchIngredients = async () => {
      setLoading(true);
      try {
        // 1. Chỉ lấy cột ingredients từ bảng products
        const { data, error } = await supabase
          .from("products")
          .select("ingredients")
          .not("ingredients", "is", null); // Bỏ qua dòng ko có dược chất

        if (error) throw error;

        if (data) {
          // 2. Xử lý dữ liệu thô
          const allIngredients = new Set<string>();

          data.forEach((product: any) => {
            if (product.ingredients) {
              // Giả sử dược chất ngăn cách nhau bằng dấu phẩy
              // Ví dụ: "Paracetamol, Cafein, Vitamin C"
              const parts = product.ingredients.split(","); 
              
              parts.forEach((part: string) => {
                const cleanName = part.trim(); // Xóa khoảng trắng thừa
                // Chỉ lấy tên có độ dài hợp lý (tránh rác)
                if (cleanName.length > 1 && cleanName.length < 50) {
                   // Viết hoa chữ cái đầu để đẹp đội hình
                   const formattedName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
                   allIngredients.add(formattedName);
                }
              });
            }
          });

          // 3. Chuyển về mảng và sắp xếp A-Z
          const sortedList = Array.from(allIngredients).sort((a, b) => 
            a.localeCompare(b)
          );
          
          setIngredients(sortedList);
        }
      } catch (err) {
        console.error("Lỗi lấy dược chất:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchIngredients();
  }, []);

  // --- LOGIC LỌC HIỂN THỊ ---
  const filteredList = ingredients.filter((item) => {
    // Nếu đang tìm kiếm -> Tìm theo từ khóa (bất kể vị trí)
    if (searchTerm) {
      return item.toLowerCase().includes(searchTerm.toLowerCase());
    }
    // Nếu không tìm kiếm -> Tìm theo chữ cái đầu
    return item.toUpperCase().startsWith(selectedChar);
  });

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-10">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-3 text-sm text-gray-500">
        <Link href="/" className="hover:text-blue-600">Trang chủ</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800 font-medium">Dược chất</span>
      </div>

      <div className="container mx-auto px-4">
        
        {/* --- 1. SEARCH BAR (Banner trắng) --- */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
          {/* Background trang trí */}
          <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-blue-50 skew-x-12 translate-x-10 md:block hidden"></div>
          <div className="absolute right-10 bottom-0 md:block hidden opacity-20 text-9xl select-none">
            🧪
          </div>

          <div className="w-full md:w-2/3 z-10">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Tra cứu dược chất</h1>
            <div className="relative">
              <input 
                type="text"
                placeholder="Nhập tên dược chất cần tìm..."
                className="w-full pl-5 pr-12 py-3 rounded-full border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm text-gray-700"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* --- 2. BẢNG DỮ LIỆU --- */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Dược chất thông dụng</h2>
          
          {/* Bộ lọc A-Z */}
          <div className="flex flex-wrap gap-2 mb-8 border-b pb-6">
            {ALPHABET.map((char) => {
               // Nếu đang search thì không active chữ cái nào để đỡ rối
               const isActive = !searchTerm && selectedChar === char;
               return (
                <button
                  key={char}
                  onClick={() => {
                    setSelectedChar(char);
                    setSearchTerm(""); // Reset search khi bấm chữ
                  }}
                  className={`w-10 h-10 rounded-full text-sm font-semibold transition-all border flex items-center justify-center
                    ${isActive 
                      ? "bg-blue-600 text-white border-blue-600 shadow-md scale-110" 
                      : "bg-white text-gray-600 border-gray-200 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50"
                    }`}
                >
                  {char}
                </button>
               )
            })}
          </div>

          {/* Danh sách dược chất */}
          {loading ? (
             <div className="py-10 text-center text-gray-500">Đang tải dữ liệu dược chất...</div>
          ) : (
            <>
              {filteredList.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-4 gap-x-8">
                  {filteredList.map((item, index) => (
                    <Link 
                      key={index} 
                      // Khi bấm vào dược chất -> Chuyển sang trang tìm thuốc với từ khóa là tên dược chất
                      href={`/tra-cuu-thuoc?keyword=${encodeURIComponent(item)}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline text-sm md:text-base py-2 border-b border-gray-50 hover:bg-gray-50 px-2 rounded transition"
                    >
                      {item}
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-lg">
                  <p className="text-4xl mb-3">⚗️</p>
                  <p>
                    {searchTerm 
                      ? `Không tìm thấy dược chất nào chứa "${searchTerm}"`
                      : `Chưa có dược chất bắt đầu bằng chữ "${selectedChar}"`
                    }
                  </p>
                </div>
              )}
            </>
          )}

          {/* Pagination (Giả lập - Vì danh sách A-Z thường không quá dài để cần phân trang phức tạp) */}
          {filteredList.length > 20 && (
             <div className="mt-8 flex justify-center gap-2">
                <button className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm">1</button>
                <button className="w-8 h-8 rounded-full bg-white border hover:bg-gray-100 flex items-center justify-center text-sm">2</button>
                <span className="flex items-end px-2">...</span>
                <button className="w-8 h-8 rounded-full bg-white border hover:bg-gray-100 flex items-center justify-center text-sm">{">"}</button>
             </div>
          )}
        </div>

      </div>
    </div>
  );
}