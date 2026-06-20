"use client";
import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Paperclip, X } from "lucide-react";

export default function LiveChat() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [uploading, setUploading] = useState(false);

  // --- MỚI: STATE CHO BONG BÓNG CHAT ---
  const [currentBubbleMsg, setCurrentBubbleMsg] = useState(0);
  const [isBubbleVisible, setIsBubbleVisible] = useState(true);

  const bubbleMessages = [
    "💊 Tư vấn thuốc cắt liều: Ho, sổ mũi, đau cơ...",
    "🏥 Cần tư vấn sức khỏe miễn phí?",
    "🔎 Tìm thuốc đặc biệt không thấy trên web?",
    "⚡ Giao hàng hỏa tốc trong 2h",
  ];

  // --- 1. KIỂM TRA ĐĂNG NHẬP (GIỮ NGUYÊN) ---
  useEffect(() => {
    const checkUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setCurrentUser(user);
      } catch (error) {
        console.warn("Supabase getUser failed in LiveChat:", error);
        setCurrentUser(null);
      }
    };
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setCurrentUser(session?.user || null);
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // --- MỚI: HIỆU ỨNG CHẠY CHỮ BONG BÓNG ---
  useEffect(() => {
    // Chỉ chạy khi chat đang đóng
    if (!isOpen) {
      let timeout: NodeJS.Timeout;

      const interval = setInterval(() => {
        setIsBubbleVisible(false); // Ẩn câu cũ
        timeout = setTimeout(() => {
          setCurrentBubbleMsg((prev) => (prev + 1) % bubbleMessages.length);
          setIsBubbleVisible(true); // Hiện câu mới
        }, 500);
      }, 4000); // Đổi câu mỗi 4 giây

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [isOpen]);

  // --- 2. HÀM MỞ CHAT (GIỮ NGUYÊN) ---
  const handleOpenChat = () => {
    if (!currentUser) {
      router.push("/login");
    } else {
      setIsOpen(true);
    }
  };

  // --- 3. TẢI TIN NHẮN & REALTIME (GIỮ NGUYÊN) ---
  useEffect(() => {
    if (isOpen && currentUser) {
      const identifier = currentUser.phone || currentUser.email;

      const fetchHistory = async () => {
        const { data, error } = await supabase
          .from("messages")
          .select("*")
          .eq("phone", identifier)
          .order("created_at", { ascending: true });

        if (error) console.error("Lỗi tải chat:", error);
        if (data) {
          setChatHistory(data);
          scrollToBottom();
        }
      };

      fetchHistory();

      const channel = supabase
        .channel(`chat-room-${identifier}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `phone=eq.${identifier}`,
          },
          (payload) => {
            setChatHistory((prev) => {
              const exists = prev.find((m) => m.id === payload.new.id);
              if (exists) return prev;
              return [...prev, payload.new];
            });
            scrollToBottom();
          },
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isOpen, currentUser]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // --- 4. XỬ LÝ UPLOAD ẢNH (GIỮ NGUYÊN) ---
  const handleUploadImage = async (file: File) => {
    if (!currentUser) return;
    setUploading(true);

    try {
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const { error: uploadError } = await supabase.storage
        .from("chat-uploads")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("chat-uploads")
        .getPublicUrl(fileName);

      await sendMessage("", urlData.publicUrl);
    } catch (error) {
      console.error("Upload lỗi:", error);
      alert("Lỗi tải ảnh lên!");
    } finally {
      setUploading(false);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.type.indexOf("image") !== -1) {
        const file = item.getAsFile();
        if (file) handleUploadImage(file);
      }
    }
  };

  // --- 5. HÀM GỬI TIN NHẮN CHUNG (GIỮ NGUYÊN) ---
  const sendMessage = async (
    textContent: string = "",
    imageUrl: string | null = null,
  ) => {
    if ((!textContent.trim() && !imageUrl) || !currentUser) return;

    const identifier = currentUser.phone || currentUser.email;
    const displayName =
      currentUser.user_metadata?.full_name ||
      currentUser.email?.split("@")[0] ||
      "Khách hàng";

    const tempMessage = {
      id: Date.now(),
      content: textContent,
      img: imageUrl,
      is_admin: false,
      created_at: new Date().toISOString(),
      phone: identifier,
    };
    setChatHistory((prev) => [...prev, tempMessage]);
    scrollToBottom();

    try {
      const { error } = await supabase.from("messages").insert([
        {
          content: textContent,
          img: imageUrl,
          is_admin: false,
          phone: identifier,
          user_name: displayName,
        },
      ]);
      if (error) console.error("Lỗi gửi tin:", error);
    } catch (err) {
      console.error("Lỗi:", err);
    }
  };

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(message);
    setMessage("");
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3 font-sans">
      {/* --- PHẦN CỬA SỔ CHAT (GIỮ NGUYÊN) --- */}
      {isOpen && currentUser && (
        <div
          className="w-[350px] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col animate-fade-in-up"
          style={{ height: "450px" }}
        >
          {/* Header */}
          <div className="bg-blue-600 p-4 flex items-center justify-between text-white shadow">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white p-0.5 overflow-hidden">
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/3304/3304567.png"
                    className="w-full h-full object-cover"
                    alt="Dược sĩ"
                  />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-blue-600 rounded-full"></span>
              </div>
              <div>
                <h3 className="font-bold text-sm">Dược sĩ Thiên Hậu</h3>
                <p className="text-xs text-blue-100">● Đang trực tuyến</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-blue-700 w-8 h-8 rounded-full transition"
            >
              ✕
            </button>
          </div>

          {/* Nội dung Chat */}
          <div className="flex-1 bg-gray-50 p-4 overflow-y-auto space-y-3">
            <div className="flex justify-start">
              <img
                src="https://cdn-icons-png.flaticon.com/512/3304/3304567.png"
                className="w-8 h-8 rounded-full mr-2 self-end mb-1"
              />
              <div className="bg-white text-gray-800 p-3 rounded-2xl rounded-bl-none shadow-sm border border-gray-200 text-sm max-w-[85%]">
                Chào bạn! Dược sĩ có thể giúp gì cho sức khỏe của bạn hôm nay?
              </div>
            </div>

            {chatHistory.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.is_admin ? "justify-start" : "justify-end"}`}
              >
                {msg.is_admin && (
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/3304/3304567.png"
                    className="w-8 h-8 rounded-full mr-2 self-end mb-1"
                  />
                )}
                <div
                  className={`max-w-[85%] flex flex-col gap-1 ${msg.is_admin ? "items-start" : "items-end"}`}
                >
                  {/* Ảnh */}
                  {msg.img && (
                    <img
                      src={msg.img}
                      alt="Gửi ảnh"
                      className="max-w-[200px] rounded-lg border border-gray-200 cursor-pointer hover:opacity-90"
                      onClick={() => window.open(msg.img, "_blank")}
                    />
                  )}

                  {/* Sản phẩm */}
                  {msg.product_data && (
                    <div
                      className="bg-white border border-blue-200 rounded-lg p-2 flex gap-2 items-center w-full shadow-sm cursor-pointer hover:bg-blue-50 transition"
                      onClick={() =>
                        router.push(`/product/${msg.product_data.id}`)
                      }
                    >
                      <img
                        src={
                          msg.product_data.img &&
                          msg.product_data.img.startsWith("[")
                            ? JSON.parse(msg.product_data.img)[0]
                            : msg.product_data.img
                        }
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate text-gray-800">
                          {msg.product_data.title}
                        </p>
                        <p className="text-sm font-bold text-red-600">
                          {Number(msg.product_data.price).toLocaleString()}đ
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Text */}
                  {msg.content && (
                    <div
                      className={`p-3 text-sm rounded-2xl shadow-sm ${msg.is_admin ? "bg-white text-gray-800 rounded-bl-none border border-gray-200" : "bg-blue-600 text-white rounded-br-none"}`}
                    >
                      {msg.content}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {uploading && (
              <div className="text-right text-xs text-gray-400 italic">
                Đang gửi ảnh...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Ô nhập liệu */}
          <form
            onSubmit={handleSendText}
            className="p-3 bg-white border-t border-gray-100 flex gap-2 items-center"
          >
            <label className="cursor-pointer text-gray-400 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100 transition">
              <Paperclip size={20} />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  e.target.files && handleUploadImage(e.target.files[0])
                }
              />
            </label>

            <input
              type="text"
              placeholder="Nhập tin nhắn..."
              className="flex-1 px-4 py-2 bg-gray-100 rounded-full text-sm outline-none focus:ring-1 focus:ring-blue-500 text-black transition"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onPaste={handlePaste}
            />
            <button
              type="submit"
              className="bg-blue-600 text-white w-10 h-10 rounded-full hover:bg-blue-700 flex items-center justify-center shadow-sm"
            >
              ➤
            </button>
          </form>
        </div>
      )}

      {/* --- PHẦN NÚT CHAT THU NHỎ (CÓ BONG BÓNG MỚI) --- */}
      {!isOpen && (
        <div className="relative flex flex-col items-end gap-2">
          {/* 🔥 BONG BÓNG CHAT CHẠY CHỮ (MỚI THÊM) */}
          <div
            className={`bg-white text-gray-800 px-4 py-2 rounded-lg shadow-lg border border-blue-100 max-w-[250px] text-sm font-medium transition-all duration-500 transform origin-bottom-right relative mb-1 mr-1
                ${isBubbleVisible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-90 translate-y-2"}
                `}
          >
            {bubbleMessages[currentBubbleMsg]}
            {/* Mũi tên trỏ xuống */}
            <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-white transform rotate-45 border-r border-b border-blue-100"></div>
            {/* Nút tắt bong bóng */}
            <button
              onClick={(e) => {
                e.currentTarget.parentElement?.remove();
              }}
              className="absolute -top-2 -left-2 bg-gray-200 text-gray-500 rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-500 hover:text-white shadow-sm"
            >
              ✕
            </button>
          </div>

          {/* Nút tròn Zalo OA */}
          <a
            href="https://zalo.me/3788256104237241918"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-center w-16 h-16 bg-[#0068FF] rounded-full shadow-lg hover:scale-105 transition-all duration-300 hover:bg-[#0054cc] relative z-50 ring-4 ring-white animate-bounce-slow"
          >
            {/* Tooltip khi hover */}
            <div className="absolute right-full mr-4 bg-white text-gray-800 px-4 py-2 rounded-xl shadow-lg border border-gray-100 whitespace-nowrap hidden group-hover:block transition-all animate-fade-in">
              <p className="text-sm font-bold text-blue-600">
                Chat Zalo với Dược sĩ
              </p>
              <div className="absolute top-1/2 -right-2 w-4 h-4 bg-white transform -translate-y-1/2 rotate-45 border-r border-t border-gray-100"></div>
            </div>

            {/* Icon Zalo SVG */}
            <svg
              className="w-9 h-9 text-white fill-current relative z-10"
              viewBox="0 0 48 48"
            >
              <path
                d="M24 4C14 4 5 11 5 20c0 4.3 2 8 6 11l-2 8 9-4c2 1 4 1 6 1 10 0 19-7 19-16S34 4 24 4z"
                fill="none"
              />
              <path d="M37.8 21.6c0-6.8-6.1-12.3-13.6-12.3C16.6 9.3 10.5 14.8 10.5 21.6c0 3.8 1.9 7.2 4.9 9.5-.2 1.8-1.2 4.2-1.3 4.3 2.9-2 5.6-2.5 7.1-2.5 6.6-.5 11.9-5.6 11.9-11.9zm-22.3 0c0-4.6 4.3-8.3 9.6-8.3s9.6 3.7 9.6 8.3-4.3 8.3-9.6 8.3c-1.1 0-3.1 0-5.6 1.8.6-1.5 1-3.2 1-3.5-.8-1.8-1.3-3.8-1.3-6.6h-3.7z" />
            </svg>
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
          </a>
        </div>
      )}
    </div>
  );
}
