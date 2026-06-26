import React, { useState, useEffect } from "react";

export default function ZaloChat() {
  // Danh sách các câu gợi ý sẽ hiện luân phiên
  const messages = [
    "💊 Bạn không tìm thấy thuốc?",
    "👩‍⚕️ Dược sĩ tư vấn sức khỏe cụ thể",
    "💬 Chat Zalo với nhà thuốc ngay!",
  ];

  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [showBubble, setShowBubble] = useState(true);

  // Hiệu ứng chuyển đổi câu thoại mỗi 3 giây
  useEffect(() => {
    const interval = setInterval(() => {
      setShowBubble(false); // Ẩn tạm thời để tạo hiệu ứng nhấp nháy nhẹ
      setTimeout(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
        setShowBubble(true);
      }, 300); // Chờ 0.3s rồi hiện câu mới
    }, 4000); // Cứ 4 giây đổi câu 1 lần

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 group">
      {/* --- PHẦN BONG BÓNG CHAT (Tooltip) --- */}
      <div
        className={`bg-white text-blue-800 px-4 py-3 rounded-xl shadow-xl border border-blue-100 max-w-[200px] md:max-w-xs relative transition-all duration-500 ease-in-out transform ${
          showBubble ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        }`}
      >
        <p className="text-sm font-semibold leading-tight">
          {messages[currentMessageIndex]}
        </p>

        {/* Mũi tên tam giác trỏ xuống */}
        <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-b border-r border-blue-100 transform rotate-45"></div>

        {/* Nút tắt bong bóng nhỏ xíu (nếu khách thấy phiền) */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation(); // Chặn click lan ra ngoài
            // Logic ẩn bong bóng vĩnh viễn nếu muốn, ở đây tạm thời ẩn
            setShowBubble(false);
          }}
          className="absolute -top-2 -left-2 bg-gray-200 text-gray-500 rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-gray-300"
        >
          ×
        </button>
      </div>

      {/* --- PHẦN NÚT ZALO TRÒN --- */}
      {/* Thay LINK_ZALO_CUA_BAN bằng link Zalo OA của bạn */}
      <a
        href="https://zalo.me/YOUR_ZALO_ID_OR_PHONE"
        target="_blank"
        rel="noreferrer"
        className="relative flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-blue-600 rounded-full shadow-2xl hover:scale-110 transition-transform duration-300 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300"
      >
        {/* Hiệu ứng sóng lan tỏa (Ping animation) */}
        <span className="absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75 animate-ping"></span>

        {/* Icon Zalo (Image) */}
        <img
          src="https://img.icons8.com/color/48/zalo.png"
          alt="Zalo"
          className="w-10 h-10 md:w-12 md:h-12 relative z-10 object-contain"
        />
      </a>
    </div>
  );
}
