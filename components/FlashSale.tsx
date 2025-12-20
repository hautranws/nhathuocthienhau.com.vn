"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";

// Dữ liệu giả lập
const flashSaleProducts = [
  {
    id: 1,
    name: "Viên uống Immuvita Easylife",
    price: 390000,
    original_price: 550000,
    discount: "-29%",
    image:
      "https://cdn.nhathuoclongchau.com.vn/unsafe/375x0/filters:quality(90)/https://cms-prod.s3-sgn09.fptcloud.com/DSC_0427_6d03d3667b.jpg",
    sold: 92,
  },
  {
    id: 2,
    name: "Bao cao su Okamoto Crown",
    price: 164000,
    original_price: 205000,
    discount: "-20%",
    image:
      "https://cdn.nhathuoclongchau.com.vn/unsafe/375x0/filters:quality(90)/https://cms-prod.s3-sgn09.fptcloud.com/00016336_bao-cao-su-okamoto-crown-kich-co-nho-sieu-mem-muot-3s_5062_60c6_large_52e0075e07.jpg",
    sold: 45,
  },
  {
    id: 3,
    name: "Gel rửa mặt Decumar",
    price: 65000,
    original_price: 85000,
    discount: "-25%",
    image:
      "https://cdn.nhathuoclongchau.com.vn/unsafe/375x0/filters:quality(90)/https://cms-prod.s3-sgn09.fptcloud.com/00029380_gel-rua-mat-giam-mun-decumar-advanced-100g_5990_62ad_large_f27702220e.jpg",
    sold: 78,
  },
  {
    id: 4,
    name: "Sữa rửa mặt Sắc Ngọc Khang",
    price: 69000,
    original_price: 89000,
    discount: "-22%",
    image:
      "https://cdn.nhathuoclongchau.com.vn/unsafe/375x0/filters:quality(90)/https://cms-prod.s3-sgn09.fptcloud.com/00021396_sua-rua-mat-sac-ngoc-khang-100g-sang-da-ngua-mun-nam-tan-nhang-3932-5d54_large_3743ec34aa.jpg",
    sold: 15,
  },
];

export default function FlashSale() {
  const [time, setTime] = useState({ hours: 2, minutes: 59, seconds: 59 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0)
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0)
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 2, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (num: number) => num.toString().padStart(2, "0");

  return (
    <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-xl p-4 md:p-6 mb-8 text-white shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter">
            ⚡ F<span className="text-yellow-300">lash</span> Sale
          </h2>
          <div className="flex items-center gap-1 text-black font-bold text-xs md:text-base">
            <span className="bg-white px-2 py-1 rounded">
              {formatTime(time.hours)}
            </span>
            <span className="text-white">:</span>
            <span className="bg-white px-2 py-1 rounded">
              {formatTime(time.minutes)}
            </span>
            <span className="text-white">:</span>
            <span className="bg-white px-2 py-1 rounded">
              {formatTime(time.seconds)}
            </span>
          </div>
        </div>
        <Link
          href="#"
          className="text-white text-sm hover:underline font-bold hidden md:block"
        >
          Xem tất cả &gt;
        </Link>
      </div>

      {/* --- SỬA GRID Ở ĐÂY: mobile 2 cột, desktop 4 cột --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {flashSaleProducts.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-lg p-3 text-gray-800 shadow-sm hover:shadow-lg transition cursor-pointer relative group"
          >
            <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] md:text-xs font-bold px-2 py-1 rounded-br-lg z-10">
              {item.discount}
            </div>
            <div className="h-32 md:h-40 flex items-center justify-center mb-2 overflow-hidden rounded-lg">
              <img
                src={item.image}
                alt={item.name}
                className="h-full object-contain group-hover:scale-110 transition duration-500"
              />
            </div>
            <h3 className="text-xs md:text-sm font-semibold line-clamp-2 h-8 md:h-10 mb-1">
              {item.name}
            </h3>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-blue-700 font-bold text-sm md:text-lg">
                {item.price.toLocaleString("vi-VN")}đ
              </span>
              <span className="text-gray-400 text-[10px] md:text-xs line-through">
                {item.original_price.toLocaleString("vi-VN")}đ
              </span>
            </div>
            <div className="relative w-full h-3 md:h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-400 to-red-500"
                style={{ width: `${item.sold}%` }}
              ></div>
              <span className="absolute top-0 left-0 w-full text-[8px] md:text-[10px] text-center text-white font-bold leading-3 md:leading-4 shadow-sm">
                Đã bán {item.sold}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
