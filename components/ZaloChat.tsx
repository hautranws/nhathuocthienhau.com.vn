"use client";

import React, { useState, useEffect } from "react";

// 👇 BẠN CÓ THỂ THAY ĐỔI LINK ẢNH DƯỢC SĨ Ở ĐÂY
// Sau khi có ảnh thật, hãy đổi dòng này thành: const avatarUrl = "/images/duoc-si-avatar.png";
const avatarUrl = "https://cdn-icons-png.flaticon.com/512/3304/3304567.png";

export default function ZaloChat() {
  // Danh sách câu thoại
  const messages = [
    "💊 Bạn chưa tìm thấy thuốc?",
    "👩‍⚕️ Dược sĩ chuyên môn đang online",
    "💬 Bấm vào đây để được tư vấn ngay!",
  ];

  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [showBubble, setShowBubble] = useState(true);
  const [isHovered, setIsHovered] = useState(false); // Thêm trạng thái hover

  // Hiệu ứng đổi câu thoại
  useEffect(() => {
    // Nếu đang di chuột vào thì không đổi câu
    if (isHovered || !showBubble) return;

    let hideTimer: NodeJS.Timeout;
    let showTimer: NodeJS.Timeout;

    const interval = setInterval(() => {
      // Ẩn đi một chút trước khi đổi câu
      hideTimer = setTimeout(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
      }, 300); // Đợi hiệu ứng mờ dần

      // Hiện lại sau khi đã đổi text
      showTimer = setTimeout(() => {
        // Chỉ là trigger để React render lại, hiệu ứng CSS sẽ lo phần chuyển đổi
      }, 300 + 100);
    }, 4000); // 4 giây đổi câu 1 lần

    return () => {
      clearInterval(interval);
      clearTimeout(hideTimer);
      clearTimeout(showTimer);
    };
  }, [isHovered, showBubble]);

  return (
    // Container chính, đặt cố định ở góc phải dưới
    <div
      className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* --- PHẦN TỔ HỢP: AVATAR DƯỢC SĨ + BONG BÓNG CHAT --- */}
      {/* Chỉ hiện khi showBubble = true */}
      <div
        className={`flex items-end gap-2 transition-all duration-500 ease-in-out transform origin-bottom-right ${
          showBubble
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-4 scale-95 pointer-events-none"
        }`}
        style={{ maxWidth: "280px" }}
      >
        {/* 1. Ảnh Avatar Dược sĩ (Bên trái) */}
        <div className="flex-shrink-0 relative z-10">
          <div className="w-12 h-12 rounded-full border-2 border-white shadow-[0_2px_8px_rgba(0,0,0,0.15)] overflow-hidden bg-blue-50">
            {/* Dùng thẻ img thường cho đơn giản, có thể thay bằng next/image */}
            <img
              src={avatarUrl}
              alt="Dược sĩ tư vấn"
              className="w-full h-full object-cover"
            />
          </div>
          {/* Chấm xanh online */}
          <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white bg-green-500"></span>
        </div>

        {/* 2. Bong bóng chứa chữ (Bên phải) */}
        <div className="bg-white text-blue-800 p-3 rounded-2xl rounded-bl-none shadow-[0_2px_10px_rgba(0,0,0,0.1)] border border-blue-50 relative flex-grow">
          {/* Nội dung chữ (có hiệu ứng chuyển đổi nhẹ) */}
          <p
            key={currentMessageIndex} // Key thay đổi để trigger animation
            className="text-[13px] font-medium leading-tight animate-[fadeIn_0.5s_ease-in-out]"
          >
            {messages[currentMessageIndex]}
          </p>

          {/* Nút tắt X nhỏ */}
          <button
            onClick={(e) => {
              e.stopPropagation(); // Chặn click lan xuống nút Zalo
              setShowBubble(false); // Ẩn bong bóng
            }}
            className="absolute -top-2 -right-2 bg-gray-100 hover:bg-gray-200 text-gray-400 hover:text-gray-600 rounded-full w-5 h-5 flex items-center justify-center text-xs transition-colors shadow-sm"
            title="Đóng gợi ý"
          >
            ✕
          </button>
        </div>
      </div>

      {/* --- NÚT ZALO TRÒN Ở DƯỚI CÙNG --- */}
      {/* 👇 THAY SỐ ĐIỆN THOẠI CỦA BẠN */}
      <a
        href="https://zalo.me/0988991837"
        target="_blank"
        rel="noreferrer"
        // Khi click vào nút Zalo thì ẩn luôn bong bóng cho gọn
        onClick={() => setShowBubble(false)}
        className="relative flex items-center justify-center w-14 h-14 bg-[#0068FF] rounded-full shadow-[0_4px_12px_rgba(0,104,255,0.4)] hover:scale-110 transition-transform duration-300 hover:bg-[#0054cc] ring-2 ring-white"
      >
        {/* Hiệu ứng sóng lan tỏa nhẹ */}
        <span className="absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-30 animate-ping"></span>

        {/* Icon Zalo SVG chuẩn màu trắng */}
        <svg
          className="w-8 h-8 text-white relative z-10 fill-current"
          viewBox="0 0 48 48"
        >
          <path
            d="M24 4C14 4 5 11 5 20c0 4.3 2 8 6 11l-2 8 9-4c2 1 4 1 6 1 10 0 19-7 19-16S34 4 24 4z"
            fill="none"
          />
          <path d="M37.8 21.6c0-6.8-6.1-12.3-13.6-12.3C16.6 9.3 10.5 14.8 10.5 21.6c0 3.8 1.9 7.2 4.9 9.5-.2 1.8-1.2 4.2-1.3 4.3 2.9-2 5.6-2.5 7.1-2.5 6.6-.5 11.9-5.6 11.9-11.9zm-22.3 0c0-4.6 4.3-8.3 9.6-8.3s9.6 3.7 9.6 8.3-4.3 8.3-9.6 8.3c-1.1 0-3.1 0-5.6 1.8.6-1.5 1-3.2 1-3.5-.8-1.8-1.3-3.8-1.3-6.6h-3.7z" />
        </svg>
      </a>
    </div>
  );
}
