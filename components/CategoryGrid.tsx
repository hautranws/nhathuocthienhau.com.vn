import React from 'react';
import Link from 'next/link';

// Danh sách danh mục (Giả lập icon bằng Emoji)
const categories = [
  { id: 1, name: "Thần kinh", icon: "🧠", color: "bg-purple-100" },
  { id: 2, name: "Tiêu hóa", icon: "🌭", color: "bg-orange-100" },
  { id: 3, name: "Tim mạch", icon: "❤️", color: "bg-red-100" },
  { id: 4, name: "Xương khớp", icon: "🦴", color: "bg-yellow-100" },
  { id: 5, name: "Da liễu", icon: "✨", color: "bg-pink-100" },
  { id: 6, name: "Mắt", icon: "👁️", color: "bg-blue-100" },
  { id: 7, name: "Hô hấp", icon: "🫁", color: "bg-green-100" },
  { id: 8, name: "Vitamin", icon: "💊", color: "bg-teal-100" },
  { id: 9, name: "Mẹ & Bé", icon: "👶", color: "bg-rose-100" },
  { id: 10, name: "Thiết bị", icon: "💉", color: "bg-gray-100" },
];

export default function CategoryGrid() {
  return (
    <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm mb-8">
      <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4 md:mb-6 border-l-4 border-blue-600 pl-3">
        Danh mục phổ biến
      </h2>
      
      {/* Grid: Mobile 4 cột, Desktop 10 cột */}
      <div className="grid grid-cols-4 md:grid-cols-10 gap-3 md:gap-4">
        {categories.map((cat) => (
          <Link href={`/category/${cat.name}`} key={cat.id} className="flex flex-col items-center group cursor-pointer">
            {/* Vòng tròn Icon */}
            <div className={`w-12 h-12 md:w-16 md:h-16 ${cat.color} rounded-full flex items-center justify-center text-2xl md:text-3xl mb-2 shadow-sm group-hover:scale-110 transition duration-300`}>
              {cat.icon}
            </div>
            {/* Tên danh mục */}
            <span className="text-[10px] md:text-xs font-semibold text-gray-700 text-center group-hover:text-blue-600">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}