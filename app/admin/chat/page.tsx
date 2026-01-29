"use client";
import React, { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { Image as ImageIcon, ShoppingBag, X, Search } from "lucide-react"; // Import icon

export default function AdminChatPage() {
  const [conversations, setConversations] = useState<string[]>([]);
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [reply, setReply] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const [uploading, setUploading] = useState(false);

  // State cho Modal chọn sản phẩm
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // --- 1. TẢI DANH SÁCH KHÁCH HÀNG ---
  useEffect(() => {
    fetchConversations();
    const channel = supabase
      .channel("admin-list")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const newPhone = payload.new.phone;
        if (newPhone) {
             setConversations(prev => {
                if(!prev.includes(newPhone)) return [newPhone, ...prev];
                return prev;
             });
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchConversations = async () => {
    const { data } = await supabase
      .from("messages")
      .select("phone")
      .not("phone", "is", null)
      .order("created_at", { ascending: false });

    if (data) {
      const uniquePhones = Array.from(new Set(data.map((item: any) => item.phone)));
      setConversations(uniquePhones);
    }
  };

  // --- 2. TẢI TIN NHẮN ---
  useEffect(() => {
    if (!selectedPhone) return;
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("phone", selectedPhone)
        .order("created_at", { ascending: true });
      if (data) {
        setMessages(data);
        scrollToBottom();
      }
    };
    fetchMessages();

    const channel = supabase
      .channel(`admin-chat-${selectedPhone}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `phone=eq.${selectedPhone}` }, (payload) => {
        setMessages((prev) => [...prev, payload.new]);
        scrollToBottom();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedPhone]);

  const scrollToBottom = () => {
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // --- 3. GỬI TIN NHẮN / ẢNH / SẢN PHẨM ---
  const handleSendMessage = async (text: string = "", img: string | null = null, productData: any = null) => {
    if ((!text && !img && !productData) || !selectedPhone) return;

    try {
        const { error } = await supabase.from("messages").insert([{
            content: text,
            img: img,
            product_data: productData, // Lưu JSON sản phẩm
            is_admin: true,
            phone: selectedPhone
        }]);
        if (error) throw error;
        setReply("");
        setIsProductModalOpen(false); // Đóng modal nếu gửi SP
    } catch (err) {
        alert("Lỗi gửi tin nhắn");
    }
  };

  // Upload ảnh Admin
  const handleUploadImage = async (file: File) => {
    if (!selectedPhone) return;
    setUploading(true);
    try {
      const fileName = `admin_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const { error } = await supabase.storage.from("chat-uploads").upload(fileName, file);
      if (error) throw error;
      const { data } = supabase.storage.from("chat-uploads").getPublicUrl(fileName);
      await handleSendMessage("", data.publicUrl);
    } catch (e) {
        alert("Lỗi upload ảnh");
    } finally {
        setUploading(false);
    }
  };

  // Tìm kiếm sản phẩm để gửi
  const handleSearchProduct = async () => {
      const { data } = await supabase.from('products').select('id, title, price, img').ilike('title', `%${searchTerm}%`).limit(10);
      if(data) setProducts(data);
  };

  useEffect(() => {
      if(isProductModalOpen) handleSearchProduct();
  }, [isProductModalOpen, searchTerm]);


  return (
    <div className="h-screen bg-gray-100 flex flex-col font-sans">
      {/* HEADER */}
      <div className="bg-white border-b px-6 py-3 flex justify-between items-center shadow-sm z-10">
        <h1 className="text-xl font-bold text-blue-800 flex items-center gap-2">💬 Trung Tâm Tin Nhắn</h1>
        <Link href="/admin" className="text-sm text-gray-500 hover:text-blue-600">← Dashboard</Link>
      </div>

      <div className="flex flex-1 overflow-hidden">
        
        {/* CỘT TRÁI: LIST KHÁCH */}
        <div className="w-1/4 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b">
             <input placeholder="Tìm kiếm SĐT..." className="w-full bg-gray-100 p-2 rounded-lg text-sm outline-none" />
          </div>
          <div className="flex-1 overflow-y-auto">
             {conversations.length === 0 ? (
                <p className="text-center text-gray-400 mt-10 text-sm">Chưa có tin nhắn</p>
             ) : (
                conversations.map((phone) => (
                    <div key={phone} onClick={() => setSelectedPhone(phone)} className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-blue-50 transition border-b border-gray-50 ${selectedPhone === phone ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''}`}>
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">{phone.slice(-2)}</div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-800 truncate">{phone}</h4>
                            <p className="text-xs text-gray-500 truncate">Bấm để xem tin nhắn</p>
                        </div>
                    </div>
                ))
             )}
          </div>
        </div>

        {/* CỘT PHẢI: KHUNG CHAT */}
        <div className="flex-1 flex flex-col bg-gray-50 relative">
           {!selectedPhone ? (
               <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                   <div className="text-6xl mb-4">💬</div>
                   <p>Chọn một khách hàng để bắt đầu chat</p>
               </div>
           ) : (
               <>
                 <div className="bg-white p-4 border-b flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">{selectedPhone.slice(-2)}</div>
                        <div>
                            <h3 className="font-bold text-gray-800">{selectedPhone}</h3>
                            <p className="text-xs text-green-600">● Khách hàng</p>
                        </div>
                    </div>
                    <button onClick={async () => { if(confirm("Xóa tin nhắn?")) { await supabase.from('messages').delete().eq('phone', selectedPhone); window.location.reload(); }}} className="text-red-500 text-xs hover:underline">Xóa lịch sử</button>
                 </div>

                 <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex w-full ${msg.is_admin ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[70%] flex flex-col gap-1 ${msg.is_admin ? "items-end" : "items-start"}`}>
                                
                                {/* ẢNH */}
                                {msg.img && (
                                    <img src={msg.img} className="max-w-[250px] rounded-lg border border-gray-200 cursor-pointer" onClick={() => window.open(msg.img, "_blank")} />
                                )}

                                {/* SẢN PHẨM */}
                                {msg.product_data && (
                                    <div className="bg-white border border-blue-200 rounded-lg p-3 flex gap-3 items-center w-64 shadow-md">
                                        <img src={msg.product_data.img && msg.product_data.img.startsWith('[') ? JSON.parse(msg.product_data.img)[0] : msg.product_data.img} className="w-16 h-16 object-cover rounded" />
                                        <div>
                                            <p className="text-sm font-bold line-clamp-2">{msg.product_data.title}</p>
                                            <p className="text-red-600 font-bold">{Number(msg.product_data.price).toLocaleString()}đ</p>
                                        </div>
                                    </div>
                                )}

                                {/* TEXT */}
                                {msg.content && (
                                    <div className={`px-4 py-2 rounded-2xl text-sm shadow-sm ${msg.is_admin ? "bg-blue-600 text-white rounded-tr-none" : "bg-white text-gray-800 border border-gray-200 rounded-tl-none"}`}>
                                        {msg.content}
                                    </div>
                                )}
                                
                                <span className="text-[10px] text-gray-400 mt-1">{new Date(msg.created_at).toLocaleTimeString("vi-VN", {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                        </div>
                    ))}
                    <div ref={bottomRef} />
                 </div>

                 {/* TOOLBAR */}
                 <div className="p-4 bg-white border-t">
                    <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(reply); }} className="flex gap-3 items-center">
                        {/* Nút gửi ảnh */}
                        <label className="cursor-pointer text-gray-500 hover:text-blue-600 hover:bg-gray-100 p-2 rounded-full">
                            <ImageIcon size={20} />
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && handleUploadImage(e.target.files[0])} />
                        </label>

                        {/* Nút gửi sản phẩm */}
                        <button type="button" onClick={() => setIsProductModalOpen(true)} className="text-gray-500 hover:text-orange-600 hover:bg-gray-100 p-2 rounded-full" title="Gửi sản phẩm">
                            <ShoppingBag size={20} />
                        </button>

                        <input type="text" className="flex-1 border border-gray-300 rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" placeholder="Nhập câu trả lời..." value={reply} onChange={(e) => setReply(e.target.value)} />
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-md">➤</button>
                    </form>
                 </div>
               </>
           )}

           {/* --- MODAL CHỌN SẢN PHẨM --- */}
           {isProductModalOpen && (
               <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                   <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl flex flex-col max-h-[80%]">
                       <div className="p-4 border-b flex justify-between items-center">
                           <h3 className="font-bold text-lg">Chọn sản phẩm tư vấn</h3>
                           <button onClick={() => setIsProductModalOpen(false)}><X size={20} /></button>
                       </div>
                       <div className="p-4 border-b bg-gray-50">
                           <div className="flex items-center bg-white border rounded-lg px-3 py-2">
                               <Search size={18} className="text-gray-400 mr-2" />
                               <input className="flex-1 outline-none text-sm" placeholder="Tìm tên thuốc..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} autoFocus />
                           </div>
                       </div>
                       <div className="flex-1 overflow-y-auto p-2">
                           {products.map(p => (
                               <div key={p.id} onClick={() => handleSendMessage("", null, p)} className="flex items-center gap-3 p-3 hover:bg-blue-50 cursor-pointer rounded-lg border-b border-gray-50 last:border-0 transition">
                                   <img src={p.img && p.img.startsWith('[') ? JSON.parse(p.img)[0] : p.img} className="w-12 h-12 object-cover rounded border" />
                                   <div>
                                       <p className="font-bold text-sm text-gray-800">{p.title}</p>
                                       <p className="text-red-600 text-sm font-bold">{Number(p.price).toLocaleString()}đ</p>
                                   </div>
                                   <button className="ml-auto text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Gửi</button>
                               </div>
                           ))}
                       </div>
                   </div>
               </div>
           )}
        </div>
      </div>
    </div>
  );
}