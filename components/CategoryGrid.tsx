import React from "react";
import Link from "next/link";

// Danh sách danh mục nổi bật (Cập nhật theo hình ảnh yêu cầu)
const categories = [
  {
    id: 1,
    name: "Thần kinh",
    icon: "🧠",
    color: "bg-blue-50", // Màu nền icon xanh nhạt
    href: "/category/Thực phẩm chức năng?group=ThanKinh",
  },
  {
    id: 2,
    name: "Vitamin & Khoáng chất",
    icon: "💊",
    color: "bg-blue-50",
    href: "/category/Thực phẩm chức năng?group=Vitamin",
  },
  {
    id: 3,
    name: "Sức khoẻ tim mạch",
    icon: "❤️",
    color: "bg-blue-50",
    href: "/category/Thực phẩm chức năng?group=TimMach",
  },
  {
    id: 4,
    name: "Tăng sức đề kháng",
    icon: "🛡️",
    color: "bg-blue-50",
    href: "/category/Thực phẩm chức năng?group=TangCuong&sub=TangSucDeKhang",
  },
  {
    id: 5,
    name: "Hỗ trợ tiêu hóa",
    icon: "🥦",
    color: "bg-blue-50",
    href: "/category/Thực phẩm chức năng?group=TieuHoa",
  },
  {
    id: 6,
    name: "Sinh lý - Nội tiết tố",
    icon: "⚖️",
    color: "bg-blue-50",
    href: "/category/Thực phẩm chức năng?group=SinhLy",
  },
  {
    id: 7,
    name: "Dinh dưỡng",
    icon: "🥗",
    color: "bg-blue-50",
    href: "/category/Thực phẩm chức năng?group=DinhDuong",
  },
  {
    id: 8,
    name: "Hỗ trợ điều trị",
    icon: "🩺",
    color: "bg-blue-50",
    href: "/category/Thực phẩm chức năng?group=HoTro",
  },
  {
    id: 9,
    name: "Giải pháp làn da",
    icon: "✨",
    color: "bg-blue-50",
    href: "/category/Dược mỹ phẩm?group=GiaiPhapLanDa",
  },
  {
    id: 10,
    name: "Chăm sóc da mặt",
    icon: "🧖‍♀️",
    color: "bg-blue-50",
    href: "/category/Dược mỹ phẩm?group=ChamSocDaMat",
  },
  {
    id: 11,
    name: "Hỗ trợ làm đẹp",
    icon: "💄",
    color: "bg-blue-50",
    href: "/category/Thực phẩm chức năng?group=LamDep",
  },
  {
    id: 12,
    name: "Hỗ trợ tình dục",
    icon: "👩‍❤️‍👨",
    color: "bg-blue-50",
    href: "/category/Thực phẩm chức năng?group=HoTroTinhDuc",
  },
];

export default function CategoryGrid() {
  return (
    <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm mb-8">
      <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4 md:mb-6 border-l-4 border-blue-600 pl-3 flex items-center gap-2">
        🏆 Danh mục nổi bật
      </h2>

      {/* Grid: Mobile 2 cột, Tablet 3 cột, Desktop 6 cột (để hiển thị đẹp 12 mục) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        {categories.map((cat) => (
          <Link
            href={cat.href}
            key={cat.id}
            className="flex flex-col items-center group cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-all border border-transparent hover:border-blue-100"
          >
            {/* Vòng tròn Icon - Vuông bo tròn nhẹ cho giống thẻ bài */}
            <div
              className={`w-14 h-14 md:w-16 md:h-16 ${cat.color} rounded-2xl flex items-center justify-center text-2xl md:text-3xl mb-3 shadow-sm group-hover:scale-110 transition duration-300 text-blue-600`}
            >
              {cat.icon}
            </div>
            {/* Tên danh mục */}
            <span className="text-xs md:text-sm font-semibold text-gray-700 text-center group-hover:text-blue-600 line-clamp-2 min-h-[32px] flex items-center">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
