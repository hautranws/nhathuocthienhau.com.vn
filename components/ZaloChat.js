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
        
        {/* Icon Zalo (SVG) */}
        <svg
          className="w-8 h-8 md:w-10 md:h-10 text-white relative z-10 fill-current"
          viewBox="0 0 48 48"
          xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M0 0h48v48H0z" fill="none"/>
            <path d="M24 4C14 4 5 11 5 20c0 4.3 2 8 6 11l-2 8 9-4c2 1 4 1 6 1 10 0 19-7 19-16S34 4 24 4zm0 28c-1.6 0-3.1-.2-4.6-.7l-.8-.3-4.4 2.2 1.1-4-.3-.7C12.6 26.6 11 23.4 11 20c0-6.6 5.8-12 13-12s13 5.4 13 12-5.8 12-13 12zm-8-12h16v2H16zm0 5h10v2H16z"/>
            {/* Logo Zalo chữ Z cách điệu đơn giản hoặc dùng icon chat bubble */}
            <path d="M37.8 21.6c0-6.8-6.1-12.3-13.6-12.3C16.6 9.3 10.5 14.8 10.5 21.6c0 3.8 1.9 7.2 4.9 9.5-.2 1.8-1.2 4.2-1.3 4.3-.1.3 0 .5.3.7.1.1.2.1.3.1.2 0 .4-.1.5-.2 2.9-2 5.6-2.5 7.1-2.5 0 0 .1 0 .2 0 6.6-.5 11.9-5.6 11.9-11.9zm-22.3 0c0-4.6 4.3-8.3 9.6-8.3s9.6 3.7 9.6 8.3-4.3 8.3-9.6 8.3c-1.1 0-3.1 0-5.6 1.8.6-1.5 1-3.2 1-3.5-.8-1.8-1.3-3.8-1.3-6.6h-3.7z" fill="white" opacity="0"/> 
            {/* Vẽ chữ Zalo đơn giản */}
            <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">Zalo</text>
        </svg>
      </a>
    </div>
  );
}