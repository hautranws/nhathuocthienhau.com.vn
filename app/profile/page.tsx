"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { User, Calendar, Phone, Edit3, X } from "lucide-react";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // State cho Modal chỉnh sửa
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    gender: "Nam",
    dob: "",
  });

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      setFormData({
        fullName: user.user_metadata?.full_name || "",
        gender: user.user_metadata?.gender || "Nam",
        dob: user.user_metadata?.dob || "",
      });
    }
    setLoading(false);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: formData.fullName,
        gender: formData.gender,
        dob: formData.dob,
      }
    });

    if (error) {
      alert("Lỗi cập nhật: " + error.message);
    } else {
      alert("Cập nhật thành công!");
      setIsEditModalOpen(false);
      window.location.reload(); // Tải lại để cập nhật Sidebar
    }
  };

  if (loading) return <div className="p-10 text-center">Đang tải...</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 min-h-[500px]">
      <h2 className="text-xl font-bold text-gray-800 border-b pb-4 mb-6">Thông tin cá nhân</h2>

      <div className="flex flex-col items-center mb-8">
        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-4xl font-bold mb-4 border-4 border-white shadow-md">
          {formData.fullName ? formData.fullName.charAt(0).toUpperCase() : "U"}
        </div>
        
        {/* Hiển thị thông tin dạng dòng (Giống Long Châu) */}
        <div className="w-full max-w-lg space-y-6">
           <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <span className="text-gray-500 text-sm">Họ và tên</span>
              <span className="font-bold text-gray-800 uppercase">{formData.fullName || "Chưa cập nhật"}</span>
           </div>

           <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <span className="text-gray-500 text-sm">Số điện thoại</span>
              <span className="font-bold text-gray-800">{user?.phone || user?.email}</span>
           </div>

           <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <span className="text-gray-500 text-sm">Giới tính</span>
              <span className="font-bold text-gray-800">{formData.gender}</span>
           </div>

           <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <span className="text-gray-500 text-sm">Ngày sinh</span>
              <span className={`font-bold ${formData.dob ? "text-gray-800" : "text-blue-600 cursor-pointer"}`}>
                 {formData.dob || "Thêm thông tin"}
              </span>
           </div>
        </div>

        <button 
          onClick={() => setIsEditModalOpen(true)}
          className="mt-8 bg-blue-100 text-blue-700 font-bold py-3 px-8 rounded-full hover:bg-blue-200 transition flex items-center gap-2"
        >
           <Edit3 size={18} />
           Chỉnh sửa thông tin
        </button>
      </div>

      {/* --- MODAL CHỈNH SỬA --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
           <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl relative animate-fade-in-up">
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                 <X size={24} />
              </button>

              <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">Cập nhật thông tin</h3>
              
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                    <input 
                       type="text" 
                       className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                       value={formData.fullName}
                       onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                       placeholder="Nhập họ tên của bạn"
                    />
                 </div>

                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
                    <div className="flex gap-4">
                       <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                             type="radio" 
                             name="gender" 
                             value="Nam" 
                             checked={formData.gender === "Nam"}
                             onChange={(e) => setFormData({...formData, gender: e.target.value})}
                          />
                          <span>Nam</span>
                       </label>
                       <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                             type="radio" 
                             name="gender" 
                             value="Nữ" 
                             checked={formData.gender === "Nữ"}
                             onChange={(e) => setFormData({...formData, gender: e.target.value})}
                          />
                          <span>Nữ</span>
                       </label>
                    </div>
                 </div>

                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
                    <input 
                       type="date" 
                       className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                       value={formData.dob}
                       onChange={(e) => setFormData({...formData, dob: e.target.value})}
                    />
                 </div>

                 <button 
                    type="submit" 
                    className="w-full bg-blue-600 text-white font-bold py-3 rounded-full hover:bg-blue-700 transition mt-4"
                 >
                    Lưu thay đổi
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}