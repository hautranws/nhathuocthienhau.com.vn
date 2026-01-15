"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (data) setCoupons(data);
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa mã giảm giá này không?")) return;

    const { error } = await supabase.from("coupons").delete().eq("id", id);
    if (error) {
      alert("Lỗi xóa: " + error.message);
    } else {
      fetchCoupons(); // Tải lại danh sách
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Link href="/admin" className="text-blue-600 hover:underline flex items-center gap-2">
            <span>🔙</span> Quay lại Dashboard
          </Link>
          <div className="flex gap-4">
             <Link 
                href="/admin/coupons/add" 
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 shadow-lg flex items-center gap-2"
             >
                + Tạo Mã Mới
             </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">🎫 Danh Sách Mã Giảm Giá</h2>
                <span className="text-gray-500 text-sm">Tổng: {coupons.length} mã</span>
            </div>

            <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 text-gray-700 uppercase text-xs font-bold">
              <tr>
                <th className="p-4 border-b">Mã Code</th>
                <th className="p-4 border-b">Loại giảm</th>
                <th className="p-4 border-b text-center">Giá trị</th>
                <th className="p-4 border-b">Điều kiện</th>
                <th className="p-4 border-b text-center">Đã dùng</th>
                <th className="p-4 border-b">Hạn sử dụng</th>
                <th className="p-4 border-b text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr><td colSpan={7} className="p-8 text-center">Đang tải...</td></tr>
              ) : coupons.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-gray-500">Chưa có mã giảm giá nào.</td></tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-blue-50 transition">
                    <td className="p-4 font-bold text-blue-700 text-base">{c.code}</td>
                    <td className="p-4">
                        {c.discount_type === 'percent' ? 
                            <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-bold">Theo %</span> : 
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">Số tiền</span>
                        }
                    </td>
                    <td className="p-4 text-center font-bold text-red-600">
                        {c.discount_type === 'percent' ? `${c.discount_value}%` : `${Number(c.discount_value).toLocaleString()}đ`}
                    </td>
                    <td className="p-4 text-gray-600">
                        Đơn tối thiểu: {Number(c.min_order_value).toLocaleString()}đ
                    </td>
                    <td className="p-4 text-center">
                        <span className="font-bold">{c.used_count}</span>
                        <span className="text-gray-400"> / {c.usage_limit}</span>
                        {c.usage_limit > 0 && c.used_count >= c.usage_limit && (
                            <span className="block text-xs text-red-500 font-bold">(Hết lượt)</span>
                        )}
                    </td>
                    <td className="p-4">
                        {c.expiry_date ? (
                            new Date(c.expiry_date) < new Date() ? 
                            <span className="text-red-500 font-bold">Đã hết hạn</span> :
                            new Date(c.expiry_date).toLocaleDateString('vi-VN')
                        ) : "Vĩnh viễn"}
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => handleDelete(c.id)}
                        className="text-red-500 hover:text-red-700 font-bold hover:bg-red-50 px-3 py-1 rounded"
                      >
                        🗑 Xóa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}