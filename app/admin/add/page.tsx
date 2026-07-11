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

// --- HÀM NÉN ẢNH ĐỂ TIẾT KIỆM DUNG LƯỢNG (DÙNG CANVAS) ---
const compressImage = (file: File): Promise<File> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 1000; // Giới hạn chiều rộng ảnh là 1000px
        const scaleSize = MAX_WIDTH / img.width;

        if (img.width > MAX_WIDTH) {
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
        } else {
          canvas.width = img.width;
          canvas.height = img.height;
        }

        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File(
                [blob],
                file.name.replace(/\.[^/.]+$/, "") + ".jpg",
                {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                },
              );
              resolve(compressedFile);
            }
          },
          "image/jpeg",
          0.7, // Chất lượng 70% (tối ưu dung lượng/độ nét)
        );
      };
    };
  });
};

export default function AddProductPage() {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false); // Trạng thái đang upload ảnh

  // --- MỚI: State quản lý MẢNG file ảnh ---
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  // State lưu dữ liệu form
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    old_price: "",
    img: "",
    category: "",
    sub_category: [] as string[],
    brand: "",
    origin: "",
    unit: "",
    description: "",
    sku: "",
    // --- CÁC TRƯỜNG CHI TIẾT CŨ ---
    registration_no: "",
    dosage_form: "",
    specification: "",
    manufacturer: "",
    ingredients: "",
    expiry: "",
    // --- [MỚI] THÊM CÁC TRƯỜNG CHUYÊN SÂU CHO THUỐC ---
    is_prescription: false, // Thuốc kê đơn (Rx)
    indications: "", // Chỉ định
    contraindications: "", // Chống chỉ định
  });

  // --- MỚI: State và logic QUY ĐỔI ĐƠN VỊ ---
  const [hasConversion, setHasConversion] = useState(false);
  const [conversionUnits, setConversionUnits] = useState<any[]>([]);

  const addConversionUnit = () => {
    setConversionUnits([
      ...conversionUnits,
      { unit_name: "", quantity: "", price: "", old_price: "", sku: "" },
    ]);
  };

  const removeConversionUnit = (index: number) => {
    setConversionUnits(conversionUnits.filter((_, i) => i !== index));
  };

  const updateConversionUnit = (index: number, field: string, value: any) => {
    const updated = [...conversionUnits];
    updated[index][field] = value;
    setConversionUnits(updated);
  };

  // Xử lý khi chọn Danh mục cha -> Tự động load danh mục con
  const [subOptions, setSubOptions] = useState<any[]>([]);

  // --- FORMAT GIÁ: tự thêm dấu chấm mỗi 3 số ---
  const formatPrice = (val: string) => {
    const digits = val.replace(/\D/g, '');
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // --- HÀM XỬ LÝ CHỌN FILE TỪ MÁY TÍNH ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      if (fileArray.length > 6) {
        alert("⚠️ Bạn chỉ được chọn tối đa 6 ảnh!");
        const limitedFiles = fileArray.slice(0, 6);
        setSelectedFiles(limitedFiles);
        const urls = limitedFiles.map((file) => URL.createObjectURL(file));
        setPreviewUrls(urls);
      } else {
        setSelectedFiles(fileArray);
        const urls = fileArray.map((file) => URL.createObjectURL(file));
        setPreviewUrls(urls);
      }
    }
  };

  // --- LOGIC LẤY DANH MỤC CON THÔNG MINH HƠN ---
  const handleCategoryChange = (e: any) => {
    const selectedCat = e.target.value;
    setFormData({ ...formData, category: selectedCat, sub_category: [] });

    if (selectedCat && CATEGORY_OPTIONS[selectedCat]) {
      const groupData = CATEGORY_OPTIONS[selectedCat];
      let items: any[] = [];

      Object.values(groupData).forEach((group: any) => {
        if (group.items) {
          group.items.forEach((item: any) => {
            if (item.children && item.children.length > 0) {
              items = [...items, ...item.children];
            } else {
              items.push(item);
            }
          });
        }
      });

      const uniqueItems = Array.from(new Set(items.map((i) => i.title))).map(
        (title) => items.find((i) => i.title === title),
      );
      setSubOptions(uniqueItems);
    } else {
      setSubOptions([]);
    }
  };

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
      let finalImageString = "";

      if (selectedFiles.length > 0) {
        setUploading(true);
        const uploadedUrls: string[] = [];

        for (const file of selectedFiles) {
          // --- THÊM LOGIC NÉN ẢNH TRƯỚC KHI UPLOAD ---
          const compressedFile = await compressImage(file);

          // Tạo tên file duy nhất để tránh trùng
          const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}_${compressedFile.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;

          // Upload lên Storage
          const { error: uploadError } = await supabase.storage
            .from("products")
            .upload(fileName, compressedFile);

          if (uploadError) {
            console.error("Lỗi upload:", uploadError);
            throw new Error(
              "Lỗi upload ảnh (Hãy chắc chắn bạn đã tạo bucket 'products' và đặt Public): " +
                uploadError.message,
            );
          }

          // Lấy Public URL
          const { data: urlData } = supabase.storage
            .from("products")
            .getPublicUrl(fileName);

          uploadedUrls.push(urlData.publicUrl);
        }

        finalImageString = JSON.stringify(uploadedUrls);
        setUploading(false);
      } else if (formData.img) {
        // Nếu người dùng dán link ảnh trực tiếp
        if (formData.img.startsWith("[")) {
          finalImageString = formData.img;
        } else {
          finalImageString = JSON.stringify([formData.img]);
        }
      }

      const subCategoryString = formData.sub_category.join(", ");

      const payload = {
        title: formData.title,
        price: formData.price.replace(/\./g, ''),
        old_price: formData.old_price.replace(/\./g, ''),

        img: finalImageString, // Giờ đây là chuỗi JSON chứa các đường link ngắn gọn
        category: formData.category,
        sub_category: subCategoryString,
        brand: formData.brand,
        origin: formData.origin,
        unit: formData.unit,
        description: formData.description,
        sku: formData.sku,
        // --- QUY ĐỔI ĐƠN VỊ (MỚI) ---
        conversion_units: hasConversion
          ? JSON.stringify(conversionUnits.filter((u) => u.unit_name))
          : null,
        // --- CÁC TRƯỜNG CŨ ---
        registration_no: formData.registration_no,
        dosage_form: formData.dosage_form,
        specification: formData.specification,
        manufacturer: formData.manufacturer,
        ingredients: formData.ingredients,
        expiry: formData.expiry,
        // --- [SỬA] CHỈ GỬI DỮ LIỆU THUỐC NẾU LÀ THUỐC ---
        is_prescription:
          formData.category === "Thuốc" ? formData.is_prescription : false,
        indications:
          formData.category === "Thuốc" ? formData.indications : null,
        contraindications:
          formData.category === "Thuốc" ? formData.contraindications : null,
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
        sku: "",
        registration_no: "",
        dosage_form: "",
        specification: "",
        manufacturer: "",
        ingredients: "",
        expiry: "",
        is_prescription: false,
        indications: "",
        contraindications: "",
      });
      setHasConversion(false);
      setConversionUnits([]);
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

          {/* Hàng: SKU */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Mã SKU (Mã sản phẩm)
            </label>
            <input
              type="text"
              className="w-full p-3 border rounded-lg focus:outline-blue-500"
              placeholder="VD: SKU123456"
              value={formData.sku}
              onChange={(e) =>
                setFormData({ ...formData, sku: e.target.value })
              }
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
              multiple
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
                placeholder="350.000"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: formatPrice(e.target.value) })
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
                placeholder="450.000"
                value={formData.old_price}
                onChange={(e) =>
                  setFormData({ ...formData, old_price: formatPrice(e.target.value) })
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

          {/* --- CHỨC NĂNG QUY ĐỔI ĐƠN VỊ (MỚI) --- */}
          <div className="bg-white p-6 border rounded-xl shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  Thêm đơn vị quy đổi
                  <span
                    className="text-blue-500 cursor-help"
                    title="Dùng khi sản phẩm có nhiều cách đóng gói: Viên, Vỉ, Hộp..."
                  >
                    ⓘ
                  </span>
                </h3>
                <p className="text-sm text-gray-500">
                  Tạo và quy đổi các đơn vị tính khác nhau
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!hasConversion && conversionUnits.length === 0) {
                    addConversionUnit();
                  }
                  setHasConversion(!hasConversion);
                }}
                className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none ${hasConversion ? "bg-blue-600" : "bg-gray-300"}`}
              >
                <div
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${hasConversion ? "translate-x-6" : ""}`}
                />
              </button>
            </div>

            {hasConversion && (
              <div className="space-y-4 mt-4">
                <div className="hidden md:grid grid-cols-12 gap-4 text-xs font-bold text-gray-500 uppercase px-2">
                  <div className="col-span-3">Đơn vị quy đổi</div>
                  <div className="col-span-2">Số lượng (quy từ đ.vị gốc)</div>
                  <div className="col-span-3">Giá bán</div>
                  <div className="col-span-3">SKU đơn vị</div>
                  <div className="col-span-1"></div>
                </div>

                {conversionUnits.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-gray-50 p-3 rounded-lg border border-gray-100 relative"
                  >
                    <div className="col-span-3">
                      <label className="md:hidden text-xs font-bold text-gray-500 mb-1 block">
                        Đơn vị quy đổi
                      </label>
                      <input
                        type="text"
                        placeholder="VD: Vỉ / Hộp"
                        className="w-full p-2 border rounded text-sm focus:outline-blue-500"
                        value={item.unit_name}
                        onChange={(e) =>
                          updateConversionUnit(
                            index,
                            "unit_name",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="md:hidden text-xs font-bold text-gray-500 mb-1 block">
                        Số lượng
                      </label>
                      <input
                        type="number"
                        placeholder="12"
                        className="w-full p-2 border rounded text-sm focus:outline-blue-500"
                        value={item.quantity}
                        onChange={(e) =>
                          updateConversionUnit(
                            index,
                            "quantity",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                    <div className="col-span-3">
                      <label className="md:hidden text-xs font-bold text-gray-500 mb-1 block">
                        Giá bán
                      </label>
                      <input
                        type="text"
                        placeholder="Giá cho đơn vị này"
                        className="w-full p-2 border rounded text-sm focus:outline-blue-500"
                        value={item.price}
                        onChange={(e) =>
                          updateConversionUnit(index, "price", e.target.value)
                        }
                      />
                    </div>
                    <div className="col-span-3">
                      <label className="md:hidden text-xs font-bold text-gray-500 mb-1 block">
                        SKU đơn vị
                      </label>
                      <input
                        type="text"
                        placeholder="SKU-VI / SKU-HOP"
                        className="w-full p-2 border rounded text-sm focus:outline-blue-500"
                        value={item.sku}
                        onChange={(e) =>
                          updateConversionUnit(index, "sku", e.target.value)
                        }
                      />
                    </div>
                    <div className="col-span-1 text-right">
                      <button
                        type="button"
                        onClick={() => removeConversionUnit(index)}
                        className="text-red-500 hover:text-red-700 font-bold p-1"
                        title="Xóa đơn vị này"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addConversionUnit}
                  className="flex items-center gap-2 text-blue-600 font-bold text-sm hover:underline mt-2 bg-blue-50 px-3 py-2 rounded-lg"
                >
                  <span className="flex items-center justify-center w-5 h-5 bg-blue-600 text-white rounded-full text-xs">
                    +
                  </span>
                  Thêm đơn vị khác
                </button>
              </div>
            )}
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

          {/* --- KHU VỰC THÔNG TIN CHI TIẾT --- */}
          <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200 mt-6">
            <h3 className="text-lg font-bold text-yellow-800 mb-4 border-b border-yellow-200 pb-2">
              📋 Thông tin dược phẩm chi tiết
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Số đăng ký */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Số đăng ký
                </label>
                <input
                  type="text"
                  className="w-full p-3 border rounded-lg"
                  placeholder="VD: 638/2023/ĐKSP"
                  value={formData.registration_no}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      registration_no: e.target.value,
                    })
                  }
                />
              </div>

              {/* Dạng bào chế */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Dạng bào chế
                </label>
                <input
                  type="text"
                  className="w-full p-3 border rounded-lg"
                  placeholder="VD: Viên nén, Siro..."
                  value={formData.dosage_form}
                  onChange={(e) =>
                    setFormData({ ...formData, dosage_form: e.target.value })
                  }
                />
              </div>

              {/* Quy cách */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Quy cách đóng gói
                </label>
                <input
                  type="text"
                  className="w-full p-3 border rounded-lg"
                  placeholder="VD: Hộp 100 viên"
                  value={formData.specification}
                  onChange={(e) =>
                    setFormData({ ...formData, specification: e.target.value })
                  }
                />
              </div>

              {/* Hạn sử dụng */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Hạn sử dụng
                </label>
                <input
                  type="text"
                  className="w-full p-3 border rounded-lg"
                  placeholder="VD: 36 tháng"
                  value={formData.expiry}
                  onChange={(e) =>
                    setFormData({ ...formData, expiry: e.target.value })
                  }
                />
              </div>

              {/* Nhà sản xuất */}
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Nhà sản xuất
                </label>
                <input
                  type="text"
                  className="w-full p-3 border rounded-lg"
                  placeholder="VD: C. HEDENKAMP GMBH & CO. KG"
                  value={formData.manufacturer}
                  onChange={(e) =>
                    setFormData({ ...formData, manufacturer: e.target.value })
                  }
                />
              </div>

              {/* Thành phần */}
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Thành phần (Ingredients)
                </label>
                <textarea
                  className="w-full p-3 border rounded-lg h-24"
                  placeholder="VD: Canxi hydrogen phosphat, Magie oxide, Vitamin C..."
                  value={formData.ingredients}
                  onChange={(e) =>
                    setFormData({ ...formData, ingredients: e.target.value })
                  }
                ></textarea>
              </div>
            </div>
          </div>

          {/* --- KHU VỰC THÔNG TIN CHUYÊN SÂU (CHỈ HIỆN KHI LÀ "THUỐC") --- */}
          {formData.category === "Thuốc" && (
            <div className="bg-red-50 p-6 rounded-lg border border-red-200 mt-6 animate-fade-in">
              <h3 className="text-lg font-bold text-red-800 mb-4 border-b border-red-200 pb-2 flex items-center justify-between">
                <span>🩺 Thông tin chỉ định (Dành riêng cho Thuốc)</span>
                {/* Checkbox Thuốc kê đơn */}
                <label className="flex items-center space-x-2 cursor-pointer bg-white px-3 py-1 rounded shadow-sm border border-red-100">
                  <input
                    type="checkbox"
                    className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
                    checked={formData.is_prescription}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        is_prescription: e.target.checked,
                      })
                    }
                  />
                  <span className="text-sm font-bold text-red-600 uppercase">
                    ⚠️ Thuốc kê đơn (Rx)
                  </span>
                </label>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Công dụng / Chỉ định
                  </label>
                  <textarea
                    className="w-full p-3 border rounded-lg h-24"
                    placeholder="Thuốc dùng để điều trị bệnh gì?"
                    value={formData.indications}
                    onChange={(e) =>
                      setFormData({ ...formData, indications: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Chống chỉ định
                  </label>
                  <textarea
                    className="w-full p-3 border rounded-lg h-24"
                    placeholder="Không dùng cho trường hợp nào?"
                    value={formData.contraindications}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contraindications: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* Hàng 6: Mô tả */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Mô tả chi tiết (Marketing)
            </label>
            <textarea
              className="w-full p-3 border rounded-lg h-32"
              placeholder="Nhập thông tin giới thiệu, quảng cáo sản phẩm..."
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
