"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Product {
  id: string;
  title: string;
  price: number;
  img: string;
  flash_sale_price: number;
}

export default function AdminFlashSaleManager() {
  const [flashItems, setFlashItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State cho Modal thêm sản phẩm
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [salePriceInput, setSalePriceInput] = useState("");

  // --- 1. LẤY DANH SÁCH ĐANG FLASH SALE ---
  const fetchFlashItems = async () => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("is_flash_sale", true)
      .order("created_at", { ascending: false });
    
    if (data) setFlashItems(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchFlashItems();
  }, []);

  // --- 2. XỬ LÝ GỠ BỎ FLASH SALE ---
  const handleRemove = async (id: string) => {
    if (!confirm("Bạn chắc chắn muốn gỡ sản phẩm này khỏi Flash Sale?")) return;

    const { error } = await supabase
      .from("products")
      .update({ is_flash_sale: false, flash_sale_price: 0 }) // Reset về 0
      .eq("id", id);

    if (!error) {
      // Cập nhật lại list mà không cần reload trang
      setFlashItems((prev) => prev.filter((item) => item.id !== id));
    } else {
      alert("Lỗi: " + error.message);
    }
  };

  // --- 3. TÌM KIẾM SẢN PHẨM ĐỂ THÊM ---
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    const { data } = await supabase
      .from("products")
      .select("*")
      .ilike("title", `%${searchTerm}%`) // Tìm gần đúng theo tên
      .limit(5);

    if (data) setSearchResults(data);
  };

  // --- 4. LƯU SẢN PHẨM VÀO FLASH SALE ---
  const handleAddFlashSale = async () => {
    if (!selectedProduct || !salePriceInput) return;

    const price = parseInt(salePriceInput);
    if (price <= 0) {
      alert("Giá Flash Sale phải lớn hơn 0");
      return;
    }

    const { error } = await supabase
      .from("products")
      .update({
        is_flash_sale: true,
        flash_sale_price: price,
      })
      .eq("id", selectedProduct.id);

    if (!error) {
      alert("✅ Đã thêm vào Flash Sale!");
      fetchFlashItems(); // Load lại danh sách chính
      closeModal();
    } else {
      alert("Lỗi: " + error.message);
    }
  };

  // Reset modal khi đóng
  const closeModal = () => {
    setIsModalOpen(false);
    setSearchTerm("");
    setSearchResults([]);
    setSelectedProduct(null);
    setSalePriceInput("");
  };

  return (
    <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-xl p-6 shadow-lg text-white mb-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold uppercase flex items-center gap-2">
            ⚡ Quản lý Flash Sale
          </h2>
          <p className="text-sm opacity-90">
            Đang hiển thị trên trang chủ (3 khung giờ tự động)
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-white text-red-600 px-4 py-2 rounded-lg font-bold hover:bg-gray-100 transition shadow-md flex items-center gap-1"
        >
          <span>+</span> Thêm sản phẩm
        </button>
      </div>

      {/* --- DANH SÁCH SẢN PHẨM ĐANG CHẠY --- */}
      {loading ? (
        <p>Đang tải...</p>
      ) : flashItems.length === 0 ? (
        <div className="text-center py-8 bg-white/10 rounded-lg border border-white/20">
          <p className="opacity-80">Chưa có sản phẩm nào trong Flash Sale.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {flashItems.map((item) => {
            // Xử lý ảnh
            let displayImage = item.img;
            try {
               if (item.img.startsWith("[")) displayImage = JSON.parse(item.img)[0];
            } catch (e) {}

            return (
              <div key={item.id} className="bg-white text-gray-800 rounded-lg p-3 relative group">
                {/* Nút Xóa */}
                <button
                  onClick={() => handleRemove(item.id)}
                  className="absolute -top-2 -right-2 bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold shadow-md hover:scale-110 transition z-10"
                  title="Gỡ khỏi Flash Sale"
                >
                  ✕
                </button>

                <div className="aspect-square mb-2 overflow-hidden rounded">
                  <img src={displayImage} alt={item.title} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-xs font-bold line-clamp-2 h-8 mb-1">{item.title}</h3>
                <div className="flex justify-between items-end">
                   <div>
                      <p className="text-xs text-gray-400 line-through">
                        {item.price.toLocaleString("vi-VN")}đ
                      </p>
                      <p className="text-red-600 font-bold text-sm">
                        {item.flash_sale_price?.toLocaleString("vi-VN")}đ
                      </p>
                   </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- MODAL THÊM SẢN PHẨM (POPUP) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white text-gray-800 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden animate-fadeIn">
            <div className="bg-gray-100 p-4 flex justify-between items-center border-b">
              <h3 className="font-bold text-lg">Thêm vào Flash Sale</h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-black font-bold text-xl">✕</button>
            </div>
            
            <div className="p-6">
              {/* Bước 1: Tìm kiếm */}
              {!selectedProduct ? (
                <div>
                  <form onSubmit={handleSearch} className="flex gap-2 mb-4">
                    <input
                      type="text"
                      className="flex-1 border p-2 rounded outline-none focus:border-blue-500"
                      placeholder="Gõ tên sản phẩm cần tìm..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-bold">Tìm</button>
                  </form>

                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {searchResults.map((prod) => (
                      <div 
                        key={prod.id} 
                        className="flex items-center gap-3 p-2 border rounded hover:bg-blue-50 cursor-pointer transition"
                        onClick={() => setSelectedProduct(prod)}
                      >
                         <img 
                           src={prod.img && prod.img.startsWith('[') ? JSON.parse(prod.img)[0] : prod.img} 
                           className="w-10 h-10 object-cover rounded" 
                         />
                         <div className="flex-1">
                           <p className="text-sm font-bold line-clamp-1">{prod.title}</p>
                           <p className="text-xs text-gray-500">Giá gốc: {prod.price.toLocaleString()}đ</p>
                         </div>
                         <button className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Chọn</button>
                      </div>
                    ))}
                    {searchResults.length === 0 && searchTerm && (
                      <p className="text-center text-gray-500 text-sm">Không tìm thấy sản phẩm nào.</p>
                    )}
                  </div>
                </div>
              ) : (
                /* Bước 2: Nhập giá Sale */
                <div className="text-center">
                  <div className="mb-4">
                     <p className="text-gray-500 text-sm mb-1">Đang chọn sản phẩm:</p>
                     <p className="font-bold text-lg text-blue-800">{selectedProduct.title}</p>
                     <p className="text-gray-400 text-sm">Giá gốc: {selectedProduct.price.toLocaleString()}đ</p>
                  </div>
                  
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-4">
                    <label className="block text-sm font-bold text-red-600 mb-2">NHẬP GIÁ FLASH SALE</label>
                    <input 
                      type="number" 
                      autoFocus
                      className="w-full text-center p-3 text-xl font-bold border-2 border-red-200 rounded focus:border-red-500 outline-none"
                      placeholder="VD: 99000"
                      value={salePriceInput}
                      onChange={(e) => setSalePriceInput(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button 
                      onClick={() => setSelectedProduct(null)} 
                      className="flex-1 py-3 bg-gray-200 rounded-lg font-bold text-gray-600 hover:bg-gray-300"
                    >
                      ← Chọn lại
                    </button>
                    <button 
                      onClick={handleAddFlashSale}
                      className="flex-1 py-3 bg-red-600 rounded-lg font-bold text-white hover:bg-red-700 shadow-lg"
                    >
                      LƯU NGAY
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}