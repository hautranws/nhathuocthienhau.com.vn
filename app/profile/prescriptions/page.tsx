"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { FileText, Plus, Upload, X, Clock, CheckCircle, XCircle, MessageSquare } from "lucide-react";

// Các tab trạng thái giống Long Châu
const TABS = [
  { id: "all", label: "Tất cả" },
  { id: "pending", label: "Chờ tư vấn" },
  { id: "consulted", label: "Đã tư vấn" },
  { id: "unreachable", label: "Chưa thể liên lạc" },
  { id: "cancelled", label: "Đã hủy" },
];

export default function MyPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  // State cho Modal Gửi yêu cầu
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [userNote, setUserNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- 1. LẤY DỮ LIỆU ---
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("user_prescriptions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    
    if (data) setPrescriptions(data);
    setLoading(false);
  };

  // --- 2. XỬ LÝ GỬI YÊU CẦU MỚI ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return alert("Vui lòng chọn ảnh đơn thuốc");
    
    setIsSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
        // A. Upload ảnh
        const fileName = `${user.id}_${Date.now()}`;
        const { error: uploadError } = await supabase.storage
            .from("prescriptions")
            .upload(fileName, uploadFile);
        
        if (uploadError) throw uploadError;

        // B. Lấy link ảnh
        const { data: urlData } = supabase.storage
            .from("prescriptions")
            .getPublicUrl(fileName);

        // C. Lưu vào Database
        const title = `Đơn thuốc ${new Date().toLocaleDateString('vi-VN')}`;
        const { error: dbError } = await supabase
            .from("user_prescriptions")
            .insert([{
                user_id: user.id,
                title: title,
                image_url: urlData.publicUrl,
                note: userNote,
                status: 'pending'
            }]);

        if (dbError) throw dbError;

        alert("Gửi yêu cầu thành công! Dược sĩ sẽ liên hệ sớm.");
        setIsModalOpen(false);
        setUploadFile(null);
        setUserNote("");
        fetchData(); // Tải lại danh sách

    } catch (error: any) {
        alert("Lỗi: " + error.message);
    } finally {
        setIsSubmitting(false);
    }
  };

  // --- 3. LỌC DANH SÁCH ---
  const filteredList = prescriptions.filter(p => activeTab === 'all' || p.status === activeTab);

  // Hàm hiển thị Badge trạng thái
  const renderStatus = (status: string) => {
      switch(status) {
          case 'pending': return <span className="text-orange-500 font-bold text-sm flex items-center gap-1">• Chờ tư vấn</span>;
          case 'consulted': return <span className="text-green-600 font-bold text-sm flex items-center gap-1">• Đã tư vấn</span>;
          case 'cancelled': return <span className="text-red-500 font-bold text-sm flex items-center gap-1">• Đã hủy</span>;
          default: return <span className="text-gray-500 text-sm flex items-center gap-1">• Đang xử lý</span>;
      }
  };

  if (loading) return <div className="p-10 text-center">Đang tải...</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm min-h-[500px] flex flex-col p-6">
       
       {/* HEADER */}
       <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Đơn thuốc của tôi</h2>
          <button 
             onClick={() => setIsModalOpen(true)}
             className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full flex items-center gap-2 text-sm shadow-md transition"
          >
             <Plus size={18} />
             Gửi yêu cầu mới
          </button>
       </div>

       {/* TABS */}
       <div className="flex overflow-x-auto border-b hide-scrollbar mb-6">
         {TABS.map((tab) => (
            <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={`whitespace-nowrap px-6 py-3 text-sm font-medium transition-all relative ${
                  activeTab === tab.id 
                  ? "text-blue-700 font-bold after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-blue-600" 
                  : "text-gray-500 hover:text-blue-600"
               }`}
            >
               {tab.label}
            </button>
         ))}
      </div>

      {/* CONTENT */}
      <div className="space-y-4">
         {filteredList.length === 0 ? (
             <div className="text-center py-12 flex flex-col items-center text-gray-400">
                 <FileText size={60} className="mb-4 opacity-20" />
                 <p>Bạn chưa có đơn thuốc nào ở trạng thái này.</p>
             </div>
         ) : (
             filteredList.map((item) => (
                 <div key={item.id} className="border border-gray-100 rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition">
                     {/* Dòng 1: Tiêu đề & Trạng thái */}
                     <div className="flex justify-between items-start mb-3 border-b border-dashed pb-3">
                         <div>
                             <div className="flex items-center gap-2">
                                 <h3 className="font-bold text-gray-800">{item.title}</h3>
                                 <button className="text-gray-400 hover:text-blue-600"><FileText size={14}/></button>
                             </div>
                             <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                <Clock size={12}/> {new Date(item.created_at).toLocaleString('vi-VN')}
                             </p>
                         </div>
                         <div>{renderStatus(item.status)}</div>
                     </div>

                     {/* Dòng 2: Nội dung đơn (Giống hình Long Châu) */}
                     <div className="flex gap-4">
                         {/* Ảnh Đơn Thuốc (User gửi) */}
                         <div className="w-16 h-16 rounded border bg-gray-50 flex-shrink-0 overflow-hidden cursor-pointer" onClick={() => window.open(item.image_url, '_blank')}>
                             <img src={item.image_url} alt="Đơn thuốc" className="w-full h-full object-cover" />
                         </div>

                         {/* Danh sách thuốc (Dược sĩ kê - Mock hiển thị nếu có) */}
                         <div className="flex-1">
                             {item.products_suggested ? (
                                 <div className="space-y-2">
                                     {(item.products_suggested as any[]).map((prod: any, idx: number) => (
                                         <div key={idx} className="flex gap-2 items-center text-sm text-gray-800">
                                              <img src={prod.img} className="w-8 h-8 rounded object-cover border" />
                                              <span className="font-medium line-clamp-1">{prod.title}</span>
                                         </div>
                                     ))}
                                 </div>
                             ) : (
                                 <p className="text-sm text-gray-500 italic">
                                     {item.status === 'pending' ? "Dược sĩ đang xem xét đơn thuốc của bạn..." : "Chưa có danh sách thuốc chi tiết."}
                                 </p>
                             )}
                             <button className="text-blue-600 text-xs mt-2 hover:underline">Xem chi tiết ›</button>
                         </div>
                     </div>

                     {/* Footer: Lời cảm ơn & Nút hành động */}
                     <div className="mt-4 pt-3 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-3">
                         <p className="text-xs text-gray-500">Cảm ơn bạn đã tin tưởng Nhà thuốc Thiên Hậu.</p>
                         <button className="bg-blue-600 text-white text-xs font-bold py-2 px-4 rounded-full hover:bg-blue-700 transition">
                            Tư vấn lại cho tôi
                         </button>
                     </div>
                 </div>
             ))
         )}
      </div>

      {/* --- MODAL GỬI YÊU CẦU --- */}
      {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl relative animate-fade-in-up">
                  <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={24}/></button>
                  <h3 className="font-bold text-lg mb-4 text-center">Gửi đơn thuốc mới</h3>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Khu vực upload */}
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition relative">
                          <input 
                              type="file" 
                              accept="image/*" 
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)}
                          />
                          {uploadFile ? (
                              <div className="text-center">
                                  <span className="text-green-600 font-bold block mb-1">Đã chọn ảnh</span>
                                  <span className="text-sm text-gray-500">{uploadFile.name}</span>
                              </div>
                          ) : (
                              <>
                                  <Upload size={32} className="text-blue-500 mb-2"/>
                                  <span className="text-sm font-bold text-gray-600">Bấm để tải ảnh đơn thuốc</span>
                              </>
                          )}
                      </div>

                      <textarea 
                          className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                          rows={3}
                          placeholder="Ghi chú cho dược sĩ (VD: Tôi bị dị ứng với...)"
                          value={userNote}
                          onChange={(e) => setUserNote(e.target.value)}
                      ></textarea>

                      <button 
                          disabled={isSubmitting}
                          type="submit" 
                          className={`w-full py-3 rounded-full font-bold text-white transition ${isSubmitting ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
                      >
                          {isSubmitting ? "Đang gửi..." : "Gửi yêu cầu"}
                      </button>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
}