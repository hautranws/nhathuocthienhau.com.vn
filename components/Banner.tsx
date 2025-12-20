"use client";
import React, { useState, useEffect } from "react";

export default function Banner() {
  // Danh sách ảnh quảng cáo (Tạm thời dùng ảnh mẫu, sau này bạn thay link ảnh thật vào)
  const slides = [
    {
      id: 1,
      url: "https://img.freepik.com/free-vector/flat-medical-facebook-cover-template_23-2149098492.jpg?w=1380&t=st=1701915000~exp=1701915600~hmac=fake",
      alt: "Khuyến mãi 1",
    },
    {
      id: 2,
      url: "https://img.freepik.com/free-vector/flat-medical-webinar-template_23-2149630335.jpg?w=1380",
      alt: "Khuyến mãi 2",
    },
    {
      id: 3,
      url: "https://img.freepik.com/free-vector/pharmacy-online-banner-template_23-2148564070.jpg?w=1380",
      alt: "Khuyến mãi 3",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  // Tự động chuyển ảnh sau mỗi 3 giây
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === slides.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000); // 3000ms = 3 giây

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full h-64 md:h-96 relative overflow-hidden rounded-xl shadow-lg group">
      {/* Hiển thị ảnh */}
      <div
        className="w-full h-full bg-center bg-cover duration-500 transition-all ease-in-out"
        style={{ backgroundImage: `url(${slides[currentIndex].url})` }}
      ></div>

      {/* Nút lùi (Mũi tên trái) - Chỉ hiện khi di chuột vào */}
      <div className="hidden group-hover:block absolute top-[50%] -translate-x-0 translate-y-[-50%] left-5 text-2xl rounded-full p-2 bg-black/20 text-white cursor-pointer hover:bg-black/50">
        <button
          onClick={() =>
            setCurrentIndex(
              currentIndex === 0 ? slides.length - 1 : currentIndex - 1
            )
          }
        >
          ❮
        </button>
      </div>

      {/* Nút tiến (Mũi tên phải) */}
      <div className="hidden group-hover:block absolute top-[50%] -translate-x-0 translate-y-[-50%] right-5 text-2xl rounded-full p-2 bg-black/20 text-white cursor-pointer hover:bg-black/50">
        <button
          onClick={() =>
            setCurrentIndex(
              currentIndex === slides.length - 1 ? 0 : currentIndex + 1
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
            key={slide.id}
            onClick={() => setCurrentIndex(index)}
            className={`transition-all w-3 h-3 rounded-full cursor-pointer ${
              currentIndex === index ? "bg-white scale-125" : "bg-white/50"
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
}
