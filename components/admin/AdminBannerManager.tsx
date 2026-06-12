"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Banner {
  id: number;
  image_url: string;
  active: boolean;
}

export default function AdminBannerManager() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false); // Trạng thái đang upload ảnh

  // Lấy danh sách banner
  const fetchBanners = async () => {
    const { data } = await supabase
      .from("banners")
      .select("*")
      .order("id", { ascending: false });
    if (data) setBanners(data);
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // --- HÀM UPLOAD VÀ THÊM BANNER ---
  const handleUploadBanner = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Kiểm tra dung lượng (Ví dụ giới hạn 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("❌ Ảnh quá nặng! Vui lòng chọn ảnh dưới 2MB.");
      return;
    }

    setUploading(true);
    try {
      // 1. Tạo tên file duy nhất (tránh trùng tên)
      const fileName = `banner-${Date.now()}-${file.name.replace(
        /[^a-zA-Z0-9.]/g,
        "_",
      )}`;

      // 2. Upload lên Supabase Storage (Bucket tên là "bannerthienhau")
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("bannerthienhau") // <--- Đảm bảo bạn đã tạo bucket này trên Supabase
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // 3. Lấy link ảnh công khai (Public URL)
      const { data: publicUrlData } = supabase.storage
        .from("bannerthienhau")
        .getPublicUrl(fileName);

      const finalUrl = publicUrlData.publicUrl;

      // 4. Lưu link vào Database
      const { error: dbError } = await supabase
        .from("banners")
        .insert([{ image_url: finalUrl, active: true }]);

      if (dbError) throw dbError;

      alert("✅ Upload banner thành công!");
      fetchBanners(); // Load lại danh sách
    } catch (error: any) {
      console.error(error);
      alert(
        "❌ Lỗi upload: " + (error.message || "Vui lòng kiểm tra lại Storage"),
      );
    } finally {
      setUploading(false);
      // Reset input file (để chọn lại file khác nếu muốn)
      e.target.value = "";
    }
  };

  // Xóa banner (Xóa cả trong DB và Storage nếu cần - ở đây xóa DB trước)
  const handleDeleteBanner = async (id: number) => {
    if (!confirm("Bạn chắc chắn muốn xóa banner này?")) return;
    const { error } = await supabase.from("banners").delete().eq("id", id);
    if (!error) fetchBanners();
  };

  // Bật/Tắt banner
  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    await supabase
      .from("banners")
      .update({ active: !currentStatus })
      .eq("id", id);
    fetchBanners();
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-blue-100 mb-8">
      <h2 className="text-xl font-bold text-blue-800 mb-4 flex items-center gap-2">
        🖼️ QUẢN LÝ BANNER TRANG CHỦ
      </h2>

      {/* --- CHÚ THÍCH KÍCH THƯỚC --- */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 text-sm text-yellow-800">
        <p className="font-bold">⚠️ Lưu ý cho nhân viên thiết kế:</p>
        <ul className="list-disc pl-5 mt-1 space-y-1">
          <li>
            Kích thước chuẩn: <strong>1610 x 492 pixel</strong> (Tỷ lệ 3.2:1).
          </li>
          <li>Định dạng: JPG, PNG, WEBP.</li>
          <li>
            Dung lượng: Tự động từ chối nếu trên <strong>2MB</strong>.
          </li>
        </ul>
      </div>

      {/* --- KHU VỰC UPLOAD TRUYỀN THỐNG --- */}
      <div className="mb-8 p-6 border border-blue-200 rounded-xl bg-blue-50 shadow-sm">
        <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">
          ➕ Thêm Banner mới
        </h3>
        <div className="flex flex-col md:flex-row items-center gap-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleUploadBanner}
            disabled={uploading}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-3 file:px-6
              file:rounded-full file:border-0
              file:text-sm file:font-bold
              file:bg-blue-600 file:text-white
              hover:file:bg-blue-700 cursor-pointer transition"
          />
        </div>
        {uploading && (
          <div className="mt-4 flex items-center gap-2 text-blue-600 font-bold text-sm bg-white p-3 rounded-lg border border-blue-100 inline-flex">
            <span className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></span>
            Đang xử lý và tải ảnh lên Supabase...
          </div>
        )}
      </div>

      {/* Danh sách banner */}
      <div className="space-y-4">
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50 transition"
          >
            {/* Ảnh Preview */}
            <div className="w-32 h-16 bg-gray-200 rounded overflow-hidden flex-shrink-0 relative">
              <img
                src={banner.image_url}
                alt="Banner"
                className={`w-full h-full object-cover ${
                  !banner.active ? "grayscale opacity-50" : ""
                }`}
              />
              {!banner.active && (
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white bg-black/50">
                  ĐÃ TẮT
                </span>
              )}
            </div>

            {/* Link ảnh */}
            <div className="flex-1 overflow-hidden">
              <p
                className="text-xs text-gray-500 truncate"
                title={banner.image_url}
              >
                {banner.image_url}
              </p>
            </div>

            {/* Nút thao tác */}
            <div className="flex gap-2">
              <button
                onClick={() => handleToggleActive(banner.id, banner.active)}
                className={`px-3 py-1 rounded text-xs font-bold ${
                  banner.active
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {banner.active ? "Đang hiện" : "Đang ẩn"}
              </button>
              <button
                onClick={() => handleDeleteBanner(banner.id)}
                className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs font-bold hover:bg-red-200"
              >
                Xóa
              </button>
            </div>
          </div>
        ))}
        {banners.length === 0 && (
          <p className="text-center text-gray-400">Chưa có banner nào.</p>
        )}
      </div>
    </div>
  );
}
