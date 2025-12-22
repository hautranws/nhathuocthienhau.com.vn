"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Để chuyển trang sau khi sửa xong
import { TPCN_DATA, DMP_DATA, CSCN_DATA, TBYT_DATA } from "@/components/data";

const CATEGORY_OPTIONS: any = {
  "Thực phẩm chức năng": TPCN_DATA,
  "Dược mỹ phẩm": DMP_DATA,
  "Chăm sóc cá nhân": CSCN_DATA,
  "Thiết bị y tế": TBYT_DATA,
};

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
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
  });

  const [subOptions, setSubOptions] = useState<any[]>([]);

  // --- 1. Lấy dữ liệu cũ để điền vào form ---
  useEffect(() => {
    const fetchProduct = async () => {
      // Vì params là Promise trong Next.js 15+ (nếu bạn dùng bản mới), cần await
      // Nếu lỗi chỗ này, thử bỏ await ở params
      const { id } = await params; 
      
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        alert("Không tìm thấy sản phẩm!");
        router.push("/admin/products"); // Quay về danh sách
        return;
      }

      if (data) {
        // Xử lý sub_category từ chuỗi "A, B" thành mảng ["A", "B"]
        let subs = [];
        if (data.sub_category) {
            subs = data.sub_category.split(",").map((s: string) => s.trim());
        }

        setFormData({
            title: data.title || "",
            price: data.price || "",
            old_price: data.old_price || "",
            img: data.img || "",
            category: data.category || "",
            sub_category: subs,
            brand: data.brand || "",
            origin: data.origin || "",
            unit: data.unit || "",
            description: data.description || ""
        });

        // Load danh mục con tương ứng
        if (data.category && CATEGORY_OPTIONS[data.category]) {
            const groupData = CATEGORY_OPTIONS[data.category];
            let items: any[] = [];
            Object.values(groupData).forEach((group: any) => {
              if (group.items) items = [...items, ...group.items];
            });
            const uniqueItems = Array.from(new Set(items.map(i => i.title)))
                .map(title => items.find(i => i.title === title));
            setSubOptions(uniqueItems);
        }
      }
      setFetching(false);
    };

    fetchProduct();
  }, [params, router]);

  // --- Logic xử lý thay đổi danh mục (Giống trang Add) ---
  const handleCategoryChange = (e: any) => {
    const selectedCat = e.target.value;
    setFormData({ ...formData, category: selectedCat, sub_category: [] });

    if (selectedCat && CATEGORY_OPTIONS[selectedCat]) {
      const groupData = CATEGORY_OPTIONS[selectedCat];
      let items: any[] = [];
      Object.values(groupData).forEach((group: any) => {
        if (group.items) items = [...items, ...group.items];
      });
      const uniqueItems = Array.from(new Set(items.map(i => i.title)))
        .map(title => items.find(i => i.title === title));
      setSubOptions(uniqueItems);
    } else {
      setSubOptions([]);
    }
  };

  const handleSubCategoryChange = (subTitle: string) => {
    setFormData((prev) => {
      const currentSubs = prev.sub_category;
      if (currentSubs.includes(subTitle)) {
        return { ...prev, sub_category: currentSubs.filter((s) => s !== subTitle) };
      } else {
        return { ...prev, sub_category: [...currentSubs, subTitle] };
      }
    });
  };

  // --- 2. Hàm Cập Nhật (UPDATE) ---
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { id } = await params;

    const subCategoryString = formData.sub_category.join(", ");

    const payload = {
      ...formData,
      sub_category: subCategoryString,
    };

    const { error } = await supabase
      .from("products")
      .update(payload) // Dùng update thay vì insert
      .eq("id", id);   // Cập nhật đúng ID đang sửa

    if (error) {
      alert("Lỗi cập nhật: " + error.message);
    } else {
      alert("✅ Cập nhật thành công!");
      router.push("/admin/products"); // Chuyển về trang danh sách
    }
    setLoading(false);
  };

  if (fetching) return <div className="p-10 text-center">Đang tải dữ liệu...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-8 border border-gray-200">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-yellow-600">
               ✏️ CHỈNH SỬA SẢN PHẨM
            </h1>
            <Link href="/admin/products" className="text-sm text-gray-500 hover:text-blue-600 underline">
                ← Hủy bỏ
            </Link>
        </div>

        <form onSubmit={handleUpdate} className="space-y-6">
           {/* (Phần Form này GIỐNG HỆT trang Add, chỉ khác nút Submit) */}
           {/* Tên SP */}
           <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Tên sản phẩm</label>
            <input type="text" className="w-full p-3 border rounded-lg" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
           </div>

           {/* Link Ảnh */}
           <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Link Ảnh</label>
            <input type="text" className="w-full p-3 border rounded-lg" value={formData.img} onChange={(e) => setFormData({...formData, img: e.target.value})} />
            {formData.img && <img src={formData.img} className="h-20 w-20 object-contain mt-2 border rounded" />}
           </div>

           {/* Danh mục */}
           <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-100">
              <div className="mb-4">
                  <label className="block text-sm font-bold text-blue-800 mb-2">1. Danh Mục Lớn</label>
                  <select className="w-full p-3 border rounded-lg bg-white" value={formData.category} onChange={handleCategoryChange} required>
                      <option value="">-- Chọn danh mục --</option>
                      {Object.keys(CATEGORY_OPTIONS).map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
              </div>
              <div>
                  <label className="block text-sm font-bold text-blue-800 mb-2">2. Loại Chi Tiết ({formData.sub_category.length})</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto p-2 bg-white border rounded-lg">
                      {subOptions.length > 0 ? subOptions.map((item, idx) => (
                          <label key={idx} className="flex items-start space-x-2 cursor-pointer hover:bg-blue-50 p-1">
                              <input type="checkbox" className="w-4 h-4 mt-1" value={item.title} checked={formData.sub_category.includes(item.title)} onChange={() => handleSubCategoryChange(item.title)} />
                              <span className="text-sm">{item.title}</span>
                          </label>
                      )) : <div className="col-span-3 text-gray-500 text-sm">Vui lòng chọn danh mục lớn</div>}
                  </div>
              </div>
           </div>

           {/* Giá cả */}
           <div className="grid grid-cols-3 gap-4">
              <div><label className="block text-sm font-bold mb-1">Giá bán</label><input type="text" className="w-full p-3 border rounded-lg" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} required /></div>
              <div><label className="block text-sm font-bold mb-1">Giá cũ</label><input type="text" className="w-full p-3 border rounded-lg" value={formData.old_price} onChange={(e) => setFormData({...formData, old_price: e.target.value})} /></div>
              <div><label className="block text-sm font-bold mb-1">Đơn vị</label><input type="text" className="w-full p-3 border rounded-lg" value={formData.unit} onChange={(e) => setFormData({...formData, unit: e.target.value})} /></div>
           </div>

           {/* Thương hiệu & Xuất xứ */}
           <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-bold mb-1">Thương hiệu</label><input type="text" className="w-full p-3 border rounded-lg" value={formData.brand} onChange={(e) => setFormData({...formData, brand: e.target.value})} /></div>
              <div><label className="block text-sm font-bold mb-1">Xuất xứ</label><input type="text" className="w-full p-3 border rounded-lg" value={formData.origin} onChange={(e) => setFormData({...formData, origin: e.target.value})} /></div>
           </div>

           {/* Mô tả */}
           <div><label className="block text-sm font-bold mb-1">Mô tả</label><textarea className="w-full p-3 border rounded-lg h-32" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea></div>

           <button type="submit" disabled={loading} className={`w-full py-4 rounded-lg font-bold text-white text-lg transition ${loading ? "bg-gray-400" : "bg-yellow-500 hover:bg-yellow-600 shadow-lg"}`}>
              {loading ? "Đang lưu..." : "💾 LƯU THAY ĐỔI"}
           </button>
        </form>
      </div>
    </div>
  );
}