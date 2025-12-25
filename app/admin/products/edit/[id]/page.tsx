"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { useRouter } from "next/navigation"; 
// 1. Thêm THUOC_DATA vào import
import { TPCN_DATA, DMP_DATA, CSCN_DATA, TBYT_DATA, THUOC_DATA } from "@/components/data";

const CATEGORY_OPTIONS: any = {
  "Thuốc": THUOC_DATA, // 2. Thêm mục Thuốc vào đây
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
    // --- [MỚI] THÊM CÁC TRƯỜNG CHI TIẾT ---
    registration_no: "", // Số đăng ký
    dosage_form: "",     // Dạng bào chế
    specification: "",   // Quy cách đóng gói
    manufacturer: "",    // Nhà sản xuất
    ingredients: "",     // Thành phần
    expiry: "",          // Hạn sử dụng
  });

  const [subOptions, setSubOptions] = useState<any[]>([]);

  // --- 1. Lấy dữ liệu cũ để điền vào form ---
  useEffect(() => {
    const fetchProduct = async () => {
      const { id } = await params; 
      
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        alert("Không tìm thấy sản phẩm!");
        router.push("/admin/products"); 
        return;
      }

      if (data) {
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
            description: data.description || "",
            // --- [MỚI] Đổ dữ liệu chi tiết cũ vào form ---
            registration_no: data.registration_no || "",
            dosage_form: data.dosage_form || "",
            specification: data.specification || "",
            manufacturer: data.manufacturer || "",
            ingredients: data.ingredients || "",
            expiry: data.expiry || "",
        });

        // Load danh mục con tương ứng (Cập nhật logic thông minh để lấy cả con của Thuốc)
        if (data.category && CATEGORY_OPTIONS[data.category]) {
            const groupData = CATEGORY_OPTIONS[data.category];
            let items: any[] = [];
            Object.values(groupData).forEach((group: any) => {
              if (group.items) {
                 // Logic lấy cả danh mục con cấp 4 (dành cho Thuốc)
                 group.items.forEach((item: any) => {
                    if (item.children && item.children.length > 0) {
                        items = [...items, ...item.children];
                    } else {
                        items.push(item);
                    }
                 });
              }
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

  // --- Logic xử lý thay đổi danh mục ---
  const handleCategoryChange = (e: any) => {
    const selectedCat = e.target.value;
    setFormData({ ...formData, category: selectedCat, sub_category: [] });

    if (selectedCat && CATEGORY_OPTIONS[selectedCat]) {
      const groupData = CATEGORY_OPTIONS[selectedCat];
      let items: any[] = [];
      Object.values(groupData).forEach((group: any) => {
        if (group.items) {
            // Logic lấy cả danh mục con cấp 4 (dành cho Thuốc)
            group.items.forEach((item: any) => {
               if (item.children && item.children.length > 0) {
                   items = [...items, ...item.children];
               } else {
                   items.push(item);
               }
            });
         }
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
      ...formData, // spread operator đã bao gồm tất cả trường mới trong formData
      sub_category: subCategoryString,
    };

    const { error } = await supabase
      .from("products")
      .update(payload) 
      .eq("id", id);   

    if (error) {
      alert("Lỗi cập nhật: " + error.message);
    } else {
      alert("✅ Cập nhật thành công!");
      router.push("/admin/products"); 
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

           {/* --- [MỚI] KHU VỰC THÔNG TIN CHI TIẾT (CHUẨN LONG CHÂU) --- */}
           <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200 mt-6">
            <h3 className="text-lg font-bold text-yellow-800 mb-4 border-b border-yellow-200 pb-2">📋 Thông tin dược phẩm chi tiết</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Số đăng ký</label>
                <input type="text" className="w-full p-3 border rounded-lg" value={formData.registration_no} onChange={(e) => setFormData({ ...formData, registration_no: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Dạng bào chế</label>
                <input type="text" className="w-full p-3 border rounded-lg" value={formData.dosage_form} onChange={(e) => setFormData({ ...formData, dosage_form: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Quy cách</label>
                <input type="text" className="w-full p-3 border rounded-lg" value={formData.specification} onChange={(e) => setFormData({ ...formData, specification: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Hạn sử dụng</label>
                <input type="text" className="w-full p-3 border rounded-lg" value={formData.expiry} onChange={(e) => setFormData({ ...formData, expiry: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-1">Nhà sản xuất</label>
                <input type="text" className="w-full p-3 border rounded-lg" value={formData.manufacturer} onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-1">Thành phần</label>
                <textarea className="w-full p-3 border rounded-lg h-24" value={formData.ingredients} onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}></textarea>
              </div>
            </div>
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