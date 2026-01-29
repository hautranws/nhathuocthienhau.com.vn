"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Plus, MapPin, Edit2, Trash2, X } from "lucide-react";

export default function AddressPage() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // State cho Modal (Thêm/Sửa)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    city: "",
    district: "",
    ward: "",
    specific: "" // Số nhà, tên đường
  });

  // --- 1. LẤY DANH SÁCH ĐỊA CHỈ ---
  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("user_addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false }) // Mặc định lên đầu
      .order("created_at", { ascending: false });

    if (!error && data) setAddresses(data);
    setLoading(false);
  };

  // --- 2. XỬ LÝ FORM ---
  const handleOpenModal = (address: any = null) => {
    if (address) {
      // Chế độ Sửa: Tách chuỗi địa chỉ ra (Giả lập đơn giản)
      // Lưu ý: Thực tế nên lưu tách riêng cột City, District... trong DB thì tốt hơn
      // Ở đây mình gộp chung cho nhanh, khi sửa thì user nhập lại
      setEditingId(address.id);
      setFormData({
        name: address.name,
        phone: address.phone,
        city: "", // Để trống bắt nhập lại hoặc xử lý tách chuỗi nếu muốn xịn
        district: "",
        ward: "",
        specific: address.full_address
      });
    } else {
      // Chế độ Thêm mới
      setEditingId(null);
      setFormData({ name: "", phone: "", city: "", district: "", ward: "", specific: "" });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Ghép địa chỉ lại thành 1 chuỗi hiển thị
    const fullAddressString = `${formData.specific}, ${formData.ward}, ${formData.district}, ${formData.city}`
        .replace(/, ,/g, ",") // Xóa dấu phẩy thừa nếu user bỏ trống
        .replace(/^, /, ""); 

    if (editingId) {
      // UPDATE
      await supabase.from("user_addresses").update({
        name: formData.name,
        phone: formData.phone,
        full_address: fullAddressString
      }).eq("id", editingId);
    } else {
      // INSERT
      await supabase.from("user_addresses").insert([{
        user_id: user.id,
        name: formData.name,
        phone: formData.phone,
        full_address: fullAddressString,
        is_default: addresses.length === 0 // Nếu là địa chỉ đầu tiên thì set mặc định luôn
      }]);
    }

    setIsModalOpen(false);
    fetchAddresses(); // Tải lại danh sách
  };

  const handleDelete = async (id: string) => {
    if(confirm("Bạn có chắc muốn xóa địa chỉ này?")) {
        await supabase.from("user_addresses").delete().eq("id", id);
        fetchAddresses();
    }
  };

  if (loading) return <div className="p-10 text-center">Đang tải...</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm min-h-[500px] flex flex-col p-6">
      
      {/* HEADER: Tiêu đề & Nút thêm */}
      <div className="flex justify-between items-center mb-6">
         <h2 className="text-xl font-bold text-gray-800">Quản lý sổ địa chỉ</h2>
         <button 
            onClick={() => handleOpenModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full flex items-center gap-2 text-sm shadow-md transition"
         >
            <Plus size={18} />
            Thêm địa chỉ mới
         </button>
      </div>

      {/* DANH SÁCH ĐỊA CHỈ */}
      <div className="space-y-4">
         {addresses.length === 0 ? (
            <div className="text-center text-gray-400 py-10 flex flex-col items-center">
                <MapPin size={48} className="mb-3 opacity-20" />
                <p>Bạn chưa lưu địa chỉ nào.</p>
            </div>
         ) : (
            addresses.map((addr) => (
                <div key={addr.id} className="border border-gray-100 rounded-xl p-5 hover:shadow-md transition bg-gray-50 relative group">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                        {/* Cột trái: Thông tin */}
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <span className="font-bold text-gray-800 uppercase">{addr.name}</span>
                                <span className="text-gray-400">|</span>
                                <span className="text-gray-600">{addr.phone}</span>
                                {addr.is_default && (
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded border border-green-200 ml-2">
                                        Mặc định
                                    </span>
                                )}
                            </div>
                            <p className="text-gray-600 text-sm">
                                {addr.full_address}
                            </p>
                        </div>

                        {/* Cột phải: Hành động */}
                        <div className="flex items-center gap-4 mt-3 md:mt-0">
                            <button 
                                onClick={() => handleOpenModal(addr)}
                                className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1"
                            >
                                <Edit2 size={14} /> Sửa
                            </button>
                            {!addr.is_default && (
                                <button 
                                    onClick={() => handleDelete(addr.id)}
                                    className="text-red-500 text-sm font-medium hover:underline flex items-center gap-1 opacity-0 group-hover:opacity-100 transition"
                                >
                                    <Trash2 size={14} /> Xóa
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            ))
         )}
      </div>

      {/* --- MODAL THÊM / SỬA ĐỊA CHỈ --- */}
      {isModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl relative animate-fade-in-up flex flex-col max-h-[90vh]">
               {/* Modal Header */}
               <div className="p-4 border-b flex justify-between items-center">
                  <h3 className="font-bold text-lg text-gray-800">
                      {editingId ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}
                  </h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                     <X size={24} />
                  </button>
               </div>

               {/* Modal Body */}
               <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <label className="text-sm font-medium text-gray-700 block mb-1">Họ và tên</label>
                          <input 
                             required
                             type="text" 
                             className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                             placeholder="VD: Nguyễn Văn A"
                             value={formData.name}
                             onChange={e => setFormData({...formData, name: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="text-sm font-medium text-gray-700 block mb-1">Số điện thoại</label>
                          <input 
                             required
                             type="tel" 
                             className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                             placeholder="VD: 0989..."
                             value={formData.phone}
                             onChange={e => setFormData({...formData, phone: e.target.value})}
                          />
                      </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <label className="text-sm font-medium text-gray-700 block mb-1">Tỉnh / Thành phố</label>
                          <input 
                             type="text" 
                             className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                             placeholder="VD: Hồ Chí Minh"
                             value={formData.city}
                             onChange={e => setFormData({...formData, city: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="text-sm font-medium text-gray-700 block mb-1">Quận / Huyện</label>
                          <input 
                             type="text" 
                             className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                             placeholder="VD: Quận 9"
                             value={formData.district}
                             onChange={e => setFormData({...formData, district: e.target.value})}
                          />
                      </div>
                  </div>

                  <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">Phường / Xã</label>
                      <input 
                          type="text" 
                          className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                          placeholder="VD: Phường Phước Long A"
                          value={formData.ward}
                          onChange={e => setFormData({...formData, ward: e.target.value})}
                      />
                  </div>

                  <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">Địa chỉ cụ thể</label>
                      <textarea 
                          required
                          rows={2}
                          className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                          placeholder="VD: Số 2 đường 128"
                          value={formData.specific}
                          onChange={e => setFormData({...formData, specific: e.target.value})}
                      ></textarea>
                  </div>

                  <div className="pt-2">
                     <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-md transition">
                        {editingId ? "Lưu thay đổi" : "Hoàn tất"}
                     </button>
                  </div>
               </form>
            </div>
         </div>
      )}
    </div>
  );
}