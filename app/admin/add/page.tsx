"use client";
import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link"; // Import Link để quay về Dashboard

// 1. Import dữ liệu để làm Menu chọn (Tránh gõ sai chính tả)
import { TPCN_DATA, DMP_DATA, CSCN_DATA, TBYT_DATA } from "@/components/data";

// Gộp dữ liệu lại để dùng cho Dropdown
const CATEGORY_OPTIONS: any = {
  "Thực phẩm chức năng": TPCN_DATA,
  "Dược mỹ phẩm": DMP_DATA,
  "Chăm sóc cá nhân": CSCN_DATA,
  "Thiết bị y tế": TBYT_DATA,
};

export default function AddProductPage() {
  const [loading, setLoading] = useState(false);
  
  // State lưu dữ liệu form
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    old_price: "",
    img: "", // Link ảnh
    category: "", // Cấp 1
    sub_category: "", // Cấp 3 (Quan trọng)
    brand: "",
    origin: "", // Xuất xứ
    unit: "", // Đơn vị (Hộp/Vỉ)
    description: "",
  });

  // Xử lý khi chọn Danh mục cha -> Tự động load danh mục con
  const [subOptions, setSubOptions] = useState<any[]>([]);

  const handleCategoryChange = (e: any) => {
    const selectedCat = e.target.value;
    setFormData({ ...formData, category: selectedCat, sub_category: "" });

    if (selectedCat && CATEGORY_OPTIONS[selectedCat]) {
      const groupData = CATEGORY_OPTIONS[selectedCat];
      let items: any[] = [];
      Object.values(groupData).forEach((group: any) => {
        if (group.items) items = [...items, ...group.items];
      });
      setSubOptions(items);
    } else {
      setSubOptions([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.title || !formData.price || !formData.category) {
      alert("Vui lòng điền tên, giá và danh mục!");
      setLoading(false);
      return;
    }

    const payload = {
      title: formData.title,
      price: formData.price,
      old_price: formData.old_price,
      img: formData.img,
      category: formData.category,
      sub_category: formData.sub_category,
      brand: formData.brand,
      origin: formData.origin,
      unit: formData.unit,
      description: formData.description,
    };

    const { error } = await supabase.from("products").insert([payload]);

    if (error) {
      alert("Lỗi đăng bài: " + error.message);
    } else {
      alert("✅ Đăng sản phẩm thành công!");
      setFormData({
        title: "", price: "", old_price: "", img: "",
        category: "", sub_category: "", brand: "", origin: "", unit: "", description: ""
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-8 border border-gray-200">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-blue-800">
            QUẢN LÝ: ĐĂNG SẢN PHẨM MỚI
            </h1>
            <Link href="/admin" className="text-sm text-gray-500 hover:text-blue-600 underline">
                ← Quay về Dashboard
            </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Hàng 1: Tên sản phẩm */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Tên sản phẩm (*)</label>
            <input
              type="text"
              className="w-full p-3 border rounded-lg focus:outline-blue-500"
              placeholder="VD: Viên uống Canxi Ostelin..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          {/* Hàng 2: Link Ảnh */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Link Ảnh (URL)</label>
            <input
              type="text"
              className="w-full p-3 border rounded-lg focus:outline-blue-500"
              placeholder="https://..."
              value={formData.img}
              onChange={(e) => setFormData({ ...formData, img: e.target.value })}
            />
            {formData.img && (
                <img src={formData.img} alt="Preview" className="h-20 w-20 object-contain mt-2 border rounded" />
            )}
          </div>

          {/* Hàng 3: Danh mục (QUAN TRỌNG NHẤT) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50 p-4 rounded-lg">
            <div>
              <label className="block text-sm font-bold text-blue-800 mb-1">1. Chọn Danh Mục Lớn</label>
              <select
                className="w-full p-3 border rounded-lg"
                value={formData.category}
                onChange={handleCategoryChange}
                required
              >
                <option value="">-- Chọn danh mục --</option>
                <option value="Thực phẩm chức năng">Thực phẩm chức năng</option>
                <option value="Dược mỹ phẩm">Dược mỹ phẩm</option>
                <option value="Chăm sóc cá nhân">Chăm sóc cá nhân</option>
                <option value="Thiết bị y tế">Thiết bị y tế</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-blue-800 mb-1">2. Chọn Loại Chi Tiết</label>
              <select
                className="w-full p-3 border rounded-lg disabled:bg-gray-200"
                value={formData.sub_category}
                onChange={(e) => setFormData({ ...formData, sub_category: e.target.value })}
                disabled={!formData.category}
                required
              >
                <option value="">-- Chọn loại --</option>
                {subOptions.map((item, idx) => (
                  <option key={idx} value={item.title}>
                    {item.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Hàng 4: Giá và Đơn vị */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Giá bán (VD: 350.000)</label>
              <input
                type="text"
                className="w-full p-3 border rounded-lg"
                placeholder="350.000đ"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Giá cũ (nếu có)</label>
              <input
                type="text"
                className="w-full p-3 border rounded-lg"
                placeholder="450.000đ"
                value={formData.old_price}
                onChange={(e) => setFormData({ ...formData, old_price: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Đơn vị (Hộp/Chai...)</label>
              <input
                type="text"
                className="w-full p-3 border rounded-lg"
                placeholder="Hộp"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              />
            </div>
          </div>

           {/* Hàng 5: Thương hiệu và Xuất xứ */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Thương hiệu</label>
              <input
                type="text"
                className="w-full p-3 border rounded-lg"
                placeholder="VD: Ostelin"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Xuất xứ</label>
              <input
                type="text"
                className="w-full p-3 border rounded-lg"
                placeholder="VD: Úc"
                value={formData.origin}
                onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
              />
            </div>
          </div>

          {/* Hàng 6: Mô tả */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Mô tả chi tiết</label>
            <textarea
              className="w-full p-3 border rounded-lg h-32"
              placeholder="Nhập thông tin chi tiết sản phẩm..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            ></textarea>
          </div>

          {/* Nút Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-lg font-bold text-white text-lg transition ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-lg"
            }`}
          >
            {loading ? "Đang xử lý..." : "🚀 ĐĂNG SẢN PHẨM NGAY"}
          </button>
        </form>
      </div>
    </div>
  );
}