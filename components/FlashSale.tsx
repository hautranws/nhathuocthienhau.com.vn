"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

interface Product {
  id: string | number; // Chấp nhận cả số và chữ
  title: string;
  name?: string; // Đề phòng trường hợp tên cột là name
  price: number;
  flash_sale_price: number;
  img: string;
  unit?: string;
}

export default function FlashSale() {
  const [products, setProducts] = useState<Product[]>([]);
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(true);

  // --- 1. LOGIC TÍNH KHUNG GIỜ ---
  const calculateTimeSlot = () => {
    const now = new Date();
    const vnTime = new Date(
      now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
    );
    const h = vnTime.getHours();

    let endTime = new Date(vnTime);
    let active = false;

    // Khung 1: 08:00 - 22:00
    if (h >= 8 && h < 22) {
      active = true;
      endTime.setHours(22, 0, 0, 0);
    }
    // Khung 2: 22:00 - 24:00
    else if (h >= 22) {
      active = true;
      endTime.setDate(endTime.getDate() + 1);
      endTime.setHours(0, 0, 0, 0);
    }
    // Khung 3: 00:00 - 01:00
    else if (h >= 0 && h < 1) {
      active = true;
      endTime.setHours(1, 0, 0, 0);
    }
    // Còn lại (01:00 - 08:00) là nghỉ -> Ẩn
    else {
      active = false;
    }

    // [DEBUG] Bỏ comment dòng dưới nếu muốn hiện FlashSale bất kể giờ giấc để test
    // active = true; endTime.setHours(h + 2, 0, 0, 0);

    setIsActive(active);

    if (active) {
      const diff = endTime.getTime() - vnTime.getTime();
      if (diff > 0) {
        const _h = Math.floor(diff / (1000 * 60 * 60));
        const _m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const _s = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ hours: _h, minutes: _m, seconds: _s });
      }
    }
  };

  // --- 2. LẤY DỮ LIỆU TỪ SUPABASE ---
  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_flash_sale", true)
        .limit(8);

      if (!error && data) {
        setProducts(data);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  // --- 3. ĐỒNG HỒ ---
  useEffect(() => {
    calculateTimeSlot();
    const timer = setInterval(calculateTimeSlot, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (num: number) => num.toString().padStart(2, "0");

  if (!isActive && !loading) return null;
  if (products.length === 0 && !loading) return null;

  return (
    <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-xl p-4 md:p-6 mb-8 text-white shadow-xl font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter">
            ⚡ F<span className="text-yellow-300">lash</span> Sale
          </h2>
          <div className="flex items-center gap-1 text-black font-bold text-xs md:text-base">
            <span className="bg-white px-2 py-1 rounded">
              {formatTime(timeLeft.hours)}
            </span>
            <span className="text-white">:</span>
            <span className="bg-white px-2 py-1 rounded">
              {formatTime(timeLeft.minutes)}
            </span>
            <span className="text-white">:</span>
            <span className="bg-white px-2 py-1 rounded">
              {formatTime(timeLeft.seconds)}
            </span>
          </div>
        </div>
        <Link
          href="/flash-sale"
          className="text-white text-sm hover:underline font-bold hidden md:block"
        >
          Xem tất cả &gt;
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {products.map((item) => {
          const discountPercent =
            item.price > 0
              ? Math.round(
                  ((item.price - item.flash_sale_price) / item.price) * 100
                )
              : 0;

          let displayImage = item.img;
          try {
            if (item.img && item.img.startsWith("[")) {
              const parsed = JSON.parse(item.img);
              displayImage = parsed[0];
            }
          } catch (e) {}

          // --- [SỬA LỖI QUAN TRỌNG Ở ĐÂY] ---
          // Ép kiểu ID thành String trước khi gọi charCodeAt
          const idString = String(item.id);
          const randomSold = (idString.charCodeAt(0) % 50) + 40;

          return (
            <Link
              href={`/san-pham/${item.id}`}
              key={item.id}
              className="bg-white rounded-lg p-3 text-gray-800 shadow-sm hover:shadow-lg transition cursor-pointer relative group block"
            >
              {discountPercent > 0 && (
                <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] md:text-xs font-bold px-2 py-1 rounded-br-lg z-10">
                  -{discountPercent}%
                </div>
              )}
              <div className="h-32 md:h-40 flex items-center justify-center mb-2 overflow-hidden rounded-lg">
                <img
                  src={displayImage}
                  alt={item.title || item.name}
                  className="h-full object-contain group-hover:scale-110 transition duration-500"
                />
              </div>
              <h3 className="text-xs md:text-sm font-semibold line-clamp-2 h-8 md:h-10 mb-1 group-hover:text-red-600 transition-colors">
                {item.title || item.name}
              </h3>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-blue-700 font-bold text-sm md:text-lg">
                  {Number(item.flash_sale_price).toLocaleString("vi-VN")}đ
                </span>
                <span className="text-gray-400 text-[10px] md:text-xs line-through">
                  {Number(item.price).toLocaleString("vi-VN")}đ
                </span>
              </div>
              <div className="relative w-full h-3 md:h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-400 to-red-500"
                  style={{ width: `${randomSold}%` }}
                ></div>
                <span className="absolute top-0 left-0 w-full text-[8px] md:text-[10px] text-center text-white font-bold leading-3 md:leading-4 shadow-sm">
                  Đã bán {randomSold}%
                </span>
                <span className="absolute top-0 left-1 text-[10px] animate-pulse">
                  🔥
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
