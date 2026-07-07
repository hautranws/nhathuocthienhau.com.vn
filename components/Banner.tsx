"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";

export default function Banner() {
  const [slides, setSlides] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // --- 1. LẤY DỮ LIỆU TỪ SUPABASE ---
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const { data, error } = await supabase
          .from("banners_thienhau")
          .select("*")
          .eq("active", true)
          .order("id", { ascending: false })
          .limit(5);

        if (!error && data && data.length > 0) {
          setSlides(data);
        } else if (error) {
          console.warn("Lỗi lấy danh sách banner:", error);
          setSlides([]); // Fallback trống
        }
      } catch (err) {
        console.warn("Banner fetch error:", err);
        setSlides([]);
      } finally {
        setLoading(false);
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
  }, [slides.length]);

  if (loading || slides.length === 0) return null;

  const currentSlide = slides[currentIndex];

  return (
    <div className="w-full aspect-[1610/492] relative overflow-hidden rounded-xl shadow-lg group">
      {/* Hiển thị ảnh với Next.js Image (Optimized) */}
      <Image
        src={currentSlide.image_url}
        alt={`Banner ${currentIndex + 1}`}
        fill
        priority={currentIndex === 0} // First slide priority
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
        className="object-cover duration-700 transition-opacity ease-in-out"
        quality={85}
      />

      {/* Nút lùi (Mũi tên trái) */}
      <div className="hidden group-hover:block absolute top-[50%] -translate-y-1/2 left-5 text-2xl rounded-full p-2 bg-black/20 text-white cursor-pointer hover:bg-black/50 transition z-10">
        <button
          onClick={() =>
            setCurrentIndex(
              currentIndex === 0 ? slides.length - 1 : currentIndex - 1,
            )
          }
          aria-label="Previous slide"
        >
          ❮
        </button>
      </div>

      {/* Nút tiến (Mũi tên phải) */}
      <div className="hidden group-hover:block absolute top-[50%] -translate-y-1/2 right-5 text-2xl rounded-full p-2 bg-black/20 text-white cursor-pointer hover:bg-black/50 transition z-10">
        <button
          onClick={() =>
            setCurrentIndex(
              currentIndex === slides.length - 1 ? 0 : currentIndex + 1,
            )
          }
          aria-label="Next slide"
        >
          ❯
        </button>
      </div>

      {/* Chấm tròn nhỏ bên dưới */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
        {slides.map((slide, index) => (
          <button
            key={slide.id || index}
            onClick={() => setCurrentIndex(index)}
            className={`transition-all w-2 h-2 md:w-3 md:h-3 rounded-full cursor-pointer shadow-sm ${
              currentIndex === index
                ? "bg-white scale-125"
                : "bg-white/50 hover:bg-white/80"
            }`}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={currentIndex === index}
          />
        ))}
      </div>
    </div>
  );
}
