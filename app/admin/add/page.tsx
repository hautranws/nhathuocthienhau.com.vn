"use client";
import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

// 1. Import dữ liệu để làm Menu chọn
import {
  TPCN_DATA,
  DMP_DATA,
  CSCN_DATA,
  TBYT_DATA,
  THUOC_DATA,
} from "@/components/data";

// Gộp dữ liệu lại để dùng cho Dropdown
const CATEGORY_OPTIONS: any = {
  Thuốc: THUOC_DATA,
  "Thực phẩm chức năng": TPCN_DATA,
  "Dược mỹ phẩm": DMP_DATA,
  "Chăm sóc cá nhân": CSCN_DATA,
  "Thiết bị y tế": TBYT_DATA,
};

export default function AddProductPage() {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false); // Trạng thái đang upload ảnh

  // --- MỚI: State quản lý MẢNG file ảnh (Thay vì 1 file như trước) ---
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  // State lưu dữ liệu form
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    old_price: "",
    img: "", // Trường này sẽ lưu chuỗi JSON của mảng ảnh (VD: '["link1", "link2"]')
    category: "",
    sub_category: [] as string[],
    brand: "",
    origin: "",
    unit: "",
    description: "",
  });

  // Xử lý khi chọn Danh mục cha -> Tự động load danh mục con
  const [subOptions, setSubOptions] = useState<any[]>([]);

  // --- MỚI: Hàm xử lý khi chọn NHIỀU file từ máy tính ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Chuyển FileList thành Array để dễ xử lý
      const fileArray = Array.from(files);

      // Kiểm tra giới hạn 6 ảnh
      if (fileArray.length > 6) {
        alert("⚠️ Bạn chỉ được chọn tối đa 6 ảnh!");
        // Chỉ lấy 6 ảnh đầu tiên nếu chọn quá
        const limitedFiles = fileArray.slice(0, 6);
        setSelectedFiles(limitedFiles);
        const urls = limitedFiles.map((file) => URL.createObjectURL(file));
        setPreviewUrls(urls);
      } else {
        setSelectedFiles(fileArray);
        // Tạo link xem trước cho tất cả ảnh
        const urls = fileArray.map((file) => URL.createObjectURL(file));
        setPreviewUrls(urls);
      }
    }
  };

  // --- [ĐÃ SỬA] LOGIC LẤY DANH MỤC CON THÔNG MINH HƠN ---
  const handleCategoryChange = (e: any) => {
    const selectedCat = e.target.value;
    setFormData({ ...formData, category: selectedCat, sub_category: [] });

    if (selectedCat && CATEGORY_OPTIONS[selectedCat]) {
      const groupData = CATEGORY_OPTIONS[selectedCat];
      let items: any[] = [];

      // Duyệt qua các nhóm lớn (VD: NhomTriLieu, Vitamin...)
      Object.values(groupData).forEach((group: any) => {
        if (group.items) {
          // Duyệt qua từng mục trong nhóm
          group.items.forEach((item: any) => {
            // KIỂM TRA: Nếu item có children (dạng Thuốc), lấy children ra
            if (item.children && item.children.length > 0) {
              items = [...items, ...item.children];
            } else {
              // Nếu không có children (dạng TPCN), lấy chính item đó
              items.push(item);
            }
          });
        }
      });

      // Lọc trùng lặp (nếu có)
      const uniqueItems = Array.from(new Set(items.map((i) => i.title))).map(
        (title) => items.find((i) => i.title === title)
      );
      setSubOptions(uniqueItems);
    } else {
      setSubOptions([]);
    }
  };
  // -------------------------------------------------------

  const handleSubCategoryChange = (subTitle: string) => {
    setFormData((prev) => {
      const currentSubs = prev.sub_category;
      if (currentSubs.includes(subTitle)) {
        return {
          ...prev,
          sub_category: currentSubs.filter((s) => s !== subTitle),
        };
      } else {
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

    try {
      let finalImageString = ""; // Chuỗi JSON để lưu vào DB

      // --- LOGIC UPLOAD NHIỀU ẢNH VÀO BUCKET 'product' ---
      if (selectedFiles.length > 0) {
        setUploading(true);
        const uploadedUrls: string[] = [];

        // Duyệt qua từng file và upload
        for (const file of selectedFiles) {
          // Tạo tên file ngẫu nhiên để không bị trùng
          const fileName = `${Date.now()}_${Math.random()
            .toString(36)
            .substring(7)}_${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;

          // Upload vào bucket 'product'
          const { error: uploadError } = await supabase.storage
            .from("product")
            .upload(fileName, file);

          if (uploadError)
            throw new Error("Lỗi upload: " + uploadError.message);

          // Lấy link công khai
          const { data: urlData } = supabase.storage
            .from("product")
            .getPublicUrl(fileName);

          uploadedUrls.push(urlData.publicUrl);
        }

        // Chuyển mảng link thành chuỗi JSON (Ví dụ: '["url1", "url2"]')
        finalImageString = JSON.stringify(uploadedUrls);
        setUploading(false);
      } else if (formData.img) {
        // Nếu người dùng nhập link thủ công (không upload file)
        // Ta cũng đóng gói nó thành mảng JSON chứa 1 phần tử để đồng bộ
        // Kiểm tra xem nó đã là JSON chưa, nếu chưa thì bọc lại
        if (formData.img.startsWith("[")) {
          finalImageString = formData.img;
        } else {
          finalImageString = JSON.stringify([formData.img]);
        }
      }
      // ---------------------------------------------------

      // Chuyển mảng sub_category thành chuỗi
      const subCategoryString = formData.sub_category.join(", ");

      const payload = {
        title: formData.title,
        price: formData.price,
        old_price: formData.old_price,
        img: finalImageString, // Lưu chuỗi JSON ảnh
        category: formData.category,
        sub_category: subCategoryString,
        brand: formData.brand,
        origin: formData.origin,
        unit: formData.unit,
        description: formData.description,
      };

      const { error } = await supabase.from("products").insert([payload]);

      if (error) throw error;

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
      setSelectedFiles([]);
      setPreviewUrls([]);
    } catch (error: any) {
      alert("❌ Lỗi: " + error.message);
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-8 border border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-blue-800">
            QUẢN LÝ: ĐĂNG SẢN PHẨM (ALBUM ẢNH)
          </h1>
          <div className="flex items-center gap-3">
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

          {/* --- KHU VỰC UPLOAD NHIỀU ẢNH (MAX 6) --- */}
          <div className="bg-gray-50 p-4 rounded-lg border border-dashed border-gray-400">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              📸 Bộ sưu tập ảnh (Tối đa 6 ảnh)
            </label>

            <input
              type="file"
              accept="image/*"
              multiple // Cho phép chọn nhiều file cùng lúc
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
            <p className="text-xs text-gray-400 mt-1 italic">
              Nhấn giữ phím <strong>Ctrl</strong> (hoặc Command) để chọn nhiều
              ảnh.
            </p>

            {/* Grid hiển thị các ảnh xem trước */}
            {previewUrls.length > 0 ? (
              <div className="mt-4 grid grid-cols-3 md:grid-cols-6 gap-2">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Preview ${index}`}
                      className="h-20 w-20 object-cover border rounded bg-white shadow-sm"
                    />
                    <span className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] px-1 rounded-bl opacity-80">
                      {index + 1}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              // Backup nhập link tay
              <div className="mt-4">
                <p className="text-xs text-gray-400 mb-1">
                  Hoặc dán 1 link ảnh (nếu không upload):
                </p>
                <input
                  type="text"
                  className="w-full p-2 border rounded text-sm"
                  placeholder="https://..."
                  value={formData.img}
                  onChange={(e) =>
                    setFormData({ ...formData, img: e.target.value })
                  }
                />
              </div>
            )}
          </div>
          {/* ------------------------------------------- */}

          {/* Hàng 3: Danh mục */}
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
                <option value="Thuốc">Thuốc</option>
                <option value="Thực phẩm chức năng">Thực phẩm chức năng</option>
                <option value="Dược mỹ phẩm">Dược mỹ phẩm</option>
                <option value="Chăm sóc cá nhân">Chăm sóc cá nhân</option>
                <option value="Thiết bị y tế">Thiết bị y tế</option>
              </select>
            </div>

            {/* Chọn nhiều loại chi tiết */}
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
            disabled={loading || uploading}
            className={`w-full py-4 rounded-lg font-bold text-white text-lg transition ${
              loading || uploading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 shadow-lg"
            }`}
          >
            {loading || uploading
              ? "Đang Upload ảnh & Lưu..."
              : "🚀 ĐĂNG SẢN PHẨM NGAY"}
          </button>
        </form>
      </div>
    </div>
  );
}
