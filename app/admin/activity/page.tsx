"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function ActivityLogPage() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<any>({}); // Lưu dữ liệu đã nhóm theo ngày

  useEffect(() => {
    fetchActivity();
  }, []);

  const fetchActivity = async () => {
    setLoading(true);
    
    // Lấy dữ liệu (Đảm bảo lấy category_id)
    const { data, error } = await supabase
      .from("products")
      .select("id, title, price, img, created_at, category_id") 
      .order("created_at", { ascending: false }); // Mới nhất lên đầu

    if (error) {
      console.error("Lỗi lấy dữ liệu:", error);
      alert("Không lấy được dữ liệu. Kiểm tra lại kết nối hoặc quyền truy cập!");
    } else if (data) {
      groupDataByDate(data);
    }
    setLoading(false);
  };

  // Hàm nhóm sản phẩm theo ngày (Đã thêm Fix múi giờ VN)
  const groupDataByDate = (data: any[]) => {
    const grouped: any = {};

    data.forEach((item) => {
      // Chuyển đổi thời gian sang ngày tháng Việt Nam
      const dateObj = new Date(item.created_at);
      
      // 👇 QUAN TRỌNG: Thêm timeZone Asia/Ho_Chi_Minh
      const dateKey = dateObj.toLocaleDateString("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh",
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      }); 

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(item);
    });

    setLogs(grouped);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-blue-900 uppercase flex items-center gap-2">
            📅 Nhật Ký Đăng Bài
          </h1>
          <Link
            href="/admin"
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm font-bold shadow-sm"
          >
            ← Quay lại Dashboard
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-500">Đang tải dữ liệu...</div>
        ) : Object.keys(logs).length === 0 ? (
          <div className="text-center py-10 bg-white rounded-lg shadow">
            Chưa có sản phẩm nào được đăng.
          </div>
        ) : (
          <div className="space-y-8">
            {/* Duyệt qua từng ngày */}
            {Object.keys(logs).map((date) => (
              <div key={date} className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden">
                {/* Header của Ngày */}
                <div className="bg-blue-50 p-4 border-b border-blue-100 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🗓️</span>
                    <span className="font-bold text-lg text-blue-900">Ngày {date}</span>
                  </div>
                  <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                    Đã đăng: {logs[date].length} sản phẩm
                  </div>
                </div>

                {/* Danh sách sản phẩm trong ngày đó */}
                <div className="p-4">
                  <table className="w-full text-sm text-left">
                    <thead className="text-gray-500 font-medium border-b">
                      <tr>
                        <th className="pb-2 pl-2">Hình ảnh</th>
                        <th className="pb-2">Tên sản phẩm</th>
                        {/* <th className="pb-2">Danh mục</th> */}
                        <th className="pb-2">Giá bán</th>
                        <th className="pb-2 text-right">Giờ đăng</th>
                        {/* 👇 Thêm cột Hành động */}
                        <th className="pb-2 text-right pr-2">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {logs[date].map((product: any) => {
                        // Xử lý ảnh
                        let imgUrl = "https://via.placeholder.com/50";
                        try {
                            if (product.img) {
                                if (product.img.startsWith("[")) {
                                    const parsed = JSON.parse(product.img);
                                    if (Array.isArray(parsed) && parsed.length > 0) imgUrl = parsed[0];
                                } else {
                                    imgUrl = product.img;
                                }
                            }
                        } catch (e) {}

                        return (
                          <tr key={product.id} className="hover:bg-blue-50 transition-colors group">
                            <td className="py-3 pl-2">
                              <img
                                src={imgUrl}
                                alt="img"
                                className="w-10 h-10 object-cover rounded border bg-white"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = "https://via.placeholder.com/50?text=No+Img";
                                }}
                              />
                            </td>
                            <td className="py-3 font-medium text-gray-800 max-w-md truncate pr-4">
                                {/* Link ở tên sản phẩm */}
                                <Link href={`/admin/products/${product.id}`} className="hover:text-blue-600 hover:underline block">
                                    {product.title}
                                </Link>
                            </td>
                            {/* <td className="py-3 text-gray-500">
                                <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                                    {product.category_id || "Khác"}
                                </span>
                            </td> */}
                            <td className="py-3 font-bold text-red-600">
                              {Number(product.price).toLocaleString("vi-VN")}đ
                            </td>
                            {/* 👇 QUAN TRỌNG: Hiển thị giờ chuẩn VN */}
                            <td className="py-3 text-right text-gray-400 font-mono text-xs">
                              {new Date(product.created_at).toLocaleTimeString("vi-VN", {
                                hour: "2-digit",
                                minute: "2-digit",
                                timeZone: "Asia/Ho_Chi_Minh"
                              })}
                            </td>
                            {/* 👇 Nút chỉnh sửa mới */}
                            <td className="py-3 text-right pr-2">
                                <Link 
                                    href={`/admin/products/${product.id}`}
                                    className="inline-block px-3 py-1 bg-white border border-blue-200 text-blue-600 rounded hover:bg-blue-600 hover:text-white text-xs font-bold transition shadow-sm"
                                >
                                    ✏️ Sửa
                                </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}