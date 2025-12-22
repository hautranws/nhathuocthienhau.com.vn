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
    category: "", // Cấp 1 (Chỉ chọn 1)
    sub_category: [] as string[], // Cấp 3 (Chọn nhiều - Mảng)
    brand: "",
    origin: "", // Xuất xứ
    unit: "", // Đơn vị (Hộp/Vỉ)
    description: "",
  });

  // Xử lý khi chọn Danh mục cha -> Tự động load danh mục con
  const [subOptions, setSubOptions] = useState<any[]>([]);

  const handleCategoryChange = (e: any) => {
    const selectedCat = e.target.value;
    // Khi đổi danh mục cha, reset danh mục con đã chọn
    setFormData({ ...formData, category: selectedCat, sub_category: [] });

    if (selectedCat && CATEGORY_OPTIONS[selectedCat]) {
      const groupData = CATEGORY_OPTIONS[selectedCat];
      let items: any[] = [];
      Object.values(groupData).forEach((group: any) => {
        if (group.items) items = [...items, ...group.items];
      });
      // Loại bỏ trùng lặp (nếu có) và sắp xếp
      const uniqueItems = Array.from(new Set(items.map((i) => i.title))).map(
        (title) => items.find((i) => i.title === title)
      );
      setSubOptions(uniqueItems);
    } else {
      setSubOptions([]);
    }
  };

  // Xử lý chọn nhiều danh mục con (Checkbox)
  const handleSubCategoryChange = (subTitle: string) => {
    setFormData((prev) => {
      const currentSubs = prev.sub_category;
      if (currentSubs.includes(subTitle)) {
        // Nếu đã có -> Bỏ chọn (Xóa khỏi mảng)
        return {
          ...prev,
          sub_category: currentSubs.filter((s) => s !== subTitle),
        };
      } else {
        // Chưa có -> Thêm vào mảng
        return { ...prev, sub_category: [...currentSubs, subTitle] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.title || !formData.price || !formData.category) {
      alert("Vui lòng điền tên, giá và danh mục!");
      setLoading(false);
      return;
    }

    // Chuyển mảng thành chuỗi để lưu vào DB
    const subCategoryString = formData.sub_category.join(", ");

    const payload = {
      title: formData.title,
      price: formData.price,
      old_price: formData.old_price,
      img: formData.img,
      category: formData.category,
      sub_category: subCategoryString,
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
      // Reset form
      setFormData({
        title: "",
        price: "",
        old_price: "",
        img: "",
        category: "",
        sub_category: [],
        brand: "",
        origin: "",
        unit: "",
        description: "",
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-8 border border-gray-200">
        {/* --- PHẦN HEADER CÓ NÚT LINK SANG TRANG QUẢN LÝ --- */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-blue-800">
            QUẢN LÝ: ĐĂNG SẢN PHẨM MỚI
          </h1>
          <div className="flex items-center gap-3">
            {/* Nút này sẽ dẫn sang trang Danh sách/Sửa/Xóa mà bạn đã tạo */}
            <Link
              href="/admin/products"
              className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg text-sm font-bold hover:bg-yellow-200 transition flex items-center gap-1"
            >
              📋 Danh sách & Sửa/Xóa
            </Link>

            <Link
              href="/admin"
              className="text-sm text-gray-500 hover:text-blue-600 underline whitespace-nowrap"
            >
              ← Quay về Dashboard
            </Link>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Hàng 1: Tên sản phẩm */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Tên sản phẩm (*)
            </label>
            <input
              type="text"
              className="w-full p-3 border rounded-lg focus:outline-blue-500"
              placeholder="VD: Viên uống Canxi Ostelin..."
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>

          {/* Hàng 2: Link Ảnh */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Link Ảnh (URL)
            </label>
            <input
              type="text"
              className="w-full p-3 border rounded-lg focus:outline-blue-500"
              placeholder="https://..."
              value={formData.img}
              onChange={(e) =>
                setFormData({ ...formData, img: e.target.value })
              }
            />
            {formData.img && (
              <img
                src={formData.img}
                alt="Preview"
                className="h-20 w-20 object-contain mt-2 border rounded"
              />
            )}
          </div>

          {/* Hàng 3: Danh mục (QUAN TRỌNG NHẤT) */}
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
            <div className="mb-4">
              <label className="block text-sm font-bold text-blue-800 mb-2">
                1. Chọn Danh Mục Lớn (*)
              </label>
              <select
                className="w-full p-3 border rounded-lg bg-white"
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

            {/* Chọn nhiều loại chi tiết (Checkbox Grid) */}
            <div>
              <label className="block text-sm font-bold text-blue-800 mb-2">
                2. Chọn Loại Chi Tiết (Có thể chọn nhiều)
                {formData.sub_category.length > 0 && (
                  <span className="ml-2 text-green-600">
                    ({formData.sub_category.length} đã chọn)
                  </span>
                )}
              </label>

              {!formData.category ? (
                <div className="text-gray-400 text-sm italic p-2 bg-gray-100 rounded">
                  Vui lòng chọn Danh mục lớn trước...
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto p-2 bg-white border rounded-lg">
                  {subOptions.length > 0 ? (
                    subOptions.map((item, idx) => (
                      <label
                        key={idx}
                        className="flex items-start space-x-2 cursor-pointer hover:bg-blue-50 p-1 rounded"
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 mt-1 text-blue-600 rounded focus:ring-blue-500"
                          value={item.title}
                          checked={formData.sub_category.includes(item.title)}
                          onChange={() => handleSubCategoryChange(item.title)}
                        />
                        <span className="text-sm text-gray-700 leading-snug">
                          {item.title}
                        </span>
                      </label>
                    ))
                  ) : (
                    <div className="col-span-3 text-gray-500 text-sm">
                      Chưa có dữ liệu cho mục này.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Hàng 4: Giá và Đơn vị */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Giá bán (*)
              </label>
              <input
                type="text"
                className="w-full p-3 border rounded-lg"
                placeholder="350000"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Giá cũ (nếu có)
              </label>
              <input
                type="text"
                className="w-full p-3 border rounded-lg"
                placeholder="450000"
                value={formData.old_price}
                onChange={(e) =>
                  setFormData({ ...formData, old_price: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Đơn vị
              </label>
              <input
                type="text"
                className="w-full p-3 border rounded-lg"
                placeholder="Hộp/Chai..."
                value={formData.unit}
                onChange={(e) =>
                  setFormData({ ...formData, unit: e.target.value })
                }
              />
            </div>
          </div>

          {/* Hàng 5: Thương hiệu và Xuất xứ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Thương hiệu
              </label>
              <input
                type="text"
                className="w-full p-3 border rounded-lg"
                placeholder="VD: Ostelin"
                value={formData.brand}
                onChange={(e) =>
                  setFormData({ ...formData, brand: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Xuất xứ
              </label>
              <input
                type="text"
                className="w-full p-3 border rounded-lg"
                placeholder="VD: Úc"
                value={formData.origin}
                onChange={(e) =>
                  setFormData({ ...formData, origin: e.target.value })
                }
              />
            </div>
          </div>

          {/* Hàng 6: Mô tả */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Mô tả chi tiết
            </label>
            <textarea
              className="w-full p-3 border rounded-lg h-32"
              placeholder="Nhập thông tin chi tiết sản phẩm..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            ></textarea>
          </div>

          {/* Nút Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-lg font-bold text-white text-lg transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 shadow-lg"
            }`}
          >
            {loading ? "Đang xử lý..." : "🚀 ĐĂNG SẢN PHẨM NGAY"}
          </button>
        </form>
      </div>
    </div>
  );
}
