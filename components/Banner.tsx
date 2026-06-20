"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Banner() {
  // Ảnh mặc định (dùng khi chưa load được data hoặc DB trống)
  const defaultSlides = [
    {
      id: 1,
      image_url:
        "https://cdn.nhathuoclongchau.com.vn/unsafe/828x0/filters:quality(90)/https://cms-prod.s3-sgn09.fptcloud.com/Banner_Web_PC_1610x492_6_28c0397556.png",
    },
    {
      id: 2,
      image_url:
        "https://cdn.nhathuoclongchau.com.vn/unsafe/828x0/filters:quality(90)/https://cms-prod.s3-sgn09.fptcloud.com/Banner_Web_PC_1610x492_5_e890397556.png",
    },
    {
      id: 3,
      image_url:
        "https://cdn.nhathuoclongchau.com.vn/unsafe/828x0/filters:quality(90)/https://cms-prod.s3-sgn09.fptcloud.com/Banner_Web_PC_1610x492_4_d890397556.png",
    },
  ];

  const [slides, setSlides] = useState<any[]>(defaultSlides);
  const [currentIndex, setCurrentIndex] = useState(0);

  // --- 1. LẤY DỮ LIỆU TỪ SUPABASE ---
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const { data, error } = await supabase
          .from("banners_thienhau")
          .select("*")
          .eq("active", true)
          .order("id", { ascending: false });

        if (!error && data && data.length > 0) {
          setSlides(data);
        } else if (error) {
          console.warn("Lỗi lấy danh sách banner:", error);
        }
      } catch (err) {
        console.warn("Banner fetch error:", err);
      }
    };

    fetchBanners();
  }, []);

  // --- 2. TỰ ĐỘNG CHUYỂN SLIDE ---
  useEffect(() => {
    if (slides.length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === slides.length - 1 ? 0 : prevIndex + 1,
      );
    }, 4000); // 4 giây chuyển 1 lần

    return () => clearInterval(timer);
  }, [slides.length]); // Chạy lại khi danh sách slide thay đổi

  if (slides.length === 0) return null;

  return (
    <div className="w-full aspect-[1610/492] relative overflow-hidden rounded-xl shadow-lg group">
      {/* Hiển thị ảnh */}
      <div
        // Sử dụng aspect-ratio tỷ lệ chuẩn của ảnh, nên dùng bg-cover sẽ khít hoàn toàn
        className="w-full h-full bg-center bg-cover bg-no-repeat duration-700 transition-all ease-in-out"
        style={{ backgroundImage: `url(${slides[currentIndex].image_url})` }}
      ></div>

      {/* Nút lùi (Mũi tên trái) */}
      <div className="hidden group-hover:block absolute top-[50%] -translate-y-1/2 left-5 text-2xl rounded-full p-2 bg-black/20 text-white cursor-pointer hover:bg-black/50 transition">
        <button
          onClick={() =>
            setCurrentIndex(
              currentIndex === 0 ? slides.length - 1 : currentIndex - 1,
            )
          }
        >
          ❮
        </button>
      </div>

      {/* Nút tiến (Mũi tên phải) */}
      <div className="hidden group-hover:block absolute top-[50%] -translate-y-1/2 right-5 text-2xl rounded-full p-2 bg-black/20 text-white cursor-pointer hover:bg-black/50 transition">
        <button
          onClick={() =>
            setCurrentIndex(
              currentIndex === slides.length - 1 ? 0 : currentIndex + 1,
            )
          }
        >
          ❯
        </button>
      </div>

      {/* Chấm tròn nhỏ bên dưới */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
        {slides.map((slide, index) => (
          <div
            key={slide.id || index}
            onClick={() => setCurrentIndex(index)}
            className={`transition-all w-2 h-2 md:w-3 md:h-3 rounded-full cursor-pointer shadow-sm ${
              currentIndex === index
                ? "bg-white scale-125"
                : "bg-white/50 hover:bg-white/80"
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
}
