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
    // Lấy tên, giá, ảnh và thời gian tạo của sản phẩm
    const { data, error } = await supabase
      .from("products")
      .select("id, title, price, img, created_at, category")
      .order("created_at", { ascending: false }); // Mới nhất lên đầu

    if (error) {
      console.error("Lỗi lấy dữ liệu:", error);
    } else if (data) {
      groupDataByDate(data);
    }
    setLoading(false);
  };

  // Hàm nhóm sản phẩm theo ngày (DD/MM/YYYY)
  const groupDataByDate = (data: any[]) => {
    const grouped: any = {};

    data.forEach((item) => {
      // Chuyển đổi thời gian sang ngày tháng Việt Nam
      const dateObj = new Date(item.created_at);
      const dateKey = dateObj.toLocaleDateString("vi-VN"); // VD: 15/01/2026

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
                        <th className="pb-2">Hình ảnh</th>
                        <th className="pb-2">Tên sản phẩm</th>
                        <th className="pb-2">Danh mục</th>
                        <th className="pb-2">Giá bán</th>
                        <th className="pb-2 text-right">Giờ đăng</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {logs[date].map((product: any) => {
                        // Xử lý ảnh (nếu là mảng JSON)
                        let imgUrl = "https://via.placeholder.com/50";
                        try {
                            if (product.img && product.img.startsWith("[")) {
                                imgUrl = JSON.parse(product.img)[0];
                            } else if (product.img) {
                                imgUrl = product.img;
                            }
                        } catch (e) {}

                        return (
                          <tr key={product.id} className="hover:bg-gray-50">
                            <td className="py-3">
                              <img
                                src={imgUrl}
                                alt="img"
                                className="w-10 h-10 object-cover rounded border"
                              />
                            </td>
                            <td className="py-3 font-medium text-gray-800 max-w-md truncate pr-4">
                                <Link href={`/admin/products/${product.id}`} className="hover:text-blue-600 hover:underline">
                                    {product.title}
                                </Link>
                            </td>
                            <td className="py-3 text-gray-500">
                                <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                                    {product.category || "Khác"}
                                </span>
                            </td>
                            <td className="py-3 font-bold text-red-600">
                              {Number(product.price).toLocaleString()}đ
                            </td>
                            <td className="py-3 text-right text-gray-400 font-mono text-xs">
                              {new Date(product.created_at).toLocaleTimeString("vi-VN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
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