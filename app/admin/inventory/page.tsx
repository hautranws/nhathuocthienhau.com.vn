"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    // Lấy dữ liệu từ Supabase
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: false });

    if (data) {
      setProducts(data);
    } else if (error) {
      console.error("Lỗi tải kho:", error);
    }
    setLoading(false);
  };

  // Hàm cập nhật nhanh (Optimistic UI)
  const handleUpdate = async (id: number, field: string, value: any) => {
    // 1. Cập nhật giao diện ngay lập tức để người dùng thấy mượt
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );

    // 2. Gửi dữ liệu lên Server ngầm
    const { error } = await supabase
      .from("products")
      .update({ [field]: value })
      .eq("id", id);

    // 3. Nếu lỗi thì báo và tải lại dữ liệu cũ
    if (error) {
      alert("❌ Lỗi cập nhật: " + error.message);
      fetchProducts();
    }
  };

  // --- [ĐÃ SỬA] HÀM XỬ LÝ ẢNH AN TOÀN ---
  // Xử lý mọi trường hợp: Null, Chuỗi thường, Chuỗi JSON, hoặc Mảng
  const getProductImage = (imgData: any) => {
    if (!imgData) return "https://via.placeholder.com/150";

    // Trường hợp 1: Dữ liệu đã là Mảng (Supabase tự parse JSONB)
    if (Array.isArray(imgData)) {
      return imgData[0] || "https://via.placeholder.com/150";
    }

    // Trường hợp 2: Dữ liệu là Chuỗi (String)
    if (typeof imgData === "string") {
      // Nếu là chuỗi JSON mảng vd: "['link1', 'link2']"
      if (imgData.startsWith("[")) {
        try {
          const parsed = JSON.parse(imgData);
          return Array.isArray(parsed) ? parsed[0] : imgData;
        } catch (e) {
          return "https://via.placeholder.com/150"; // Parse lỗi thì trả về ảnh rỗng
        }
      }
      // Nếu là link bình thường
      return imgData;
    }

    return "https://via.placeholder.com/150";
  };

  // Lọc sản phẩm theo tên
  const filteredProducts = products.filter((p) =>
    (p.title || p.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <Link href="/admin" className="text-blue-600 hover:underline flex items-center gap-2">
            <span>🔙</span> Quay lại Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">📦 Quản Lý Kho Hàng</h1>
        </div>

        {/* Thanh tìm kiếm */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <input
            type="text"
            placeholder="🔍 Nhập tên sản phẩm để tìm nhanh..."
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Bảng dữ liệu */}
        <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-100 text-gray-700 uppercase text-xs font-bold">
                <tr>
                  <th className="p-4 border-b w-16">ID</th>
                  <th className="p-4 border-b w-24">Hình ảnh</th>
                  <th className="p-4 border-b">Tên sản phẩm</th>
                  <th className="p-4 border-b text-center w-32">Giá bán (VNĐ)</th>
                  <th className="p-4 border-b text-center w-24">Tồn kho</th>
                  <th className="p-4 border-b text-right w-24">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-10 text-center text-gray-500">
                      ⏳ Đang tải dữ liệu từ kho...
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-10 text-center text-gray-500">
                      📭 Không tìm thấy sản phẩm nào.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-blue-50 transition duration-150">
                      <td className="p-4 text-gray-500 font-mono text-xs">
                        #{product.id}
                      </td>
                      <td className="p-4">
                        <div className="w-12 h-12 border rounded bg-white flex items-center justify-center overflow-hidden relative">
                          <img
                            src={getProductImage(product.img || product.image_url)}
                            className="w-full h-full object-contain"
                            alt="sp"
                            loading="lazy"
                          />
                        </div>
                      </td>
                      <td className="p-4 font-medium text-gray-800">
                        <div
                          className="truncate max-w-[200px] md:max-w-xs"
                          title={product.title || product.name}
                        >
                          {product.title || product.name}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <input
                          type="number"
                          className="w-full p-2 border rounded text-right focus:border-blue-500 outline-none focus:ring-1 focus:ring-blue-200 font-semibold text-gray-700"
                          value={product.price}
                          onChange={(e) =>
                            handleUpdate(product.id, "price", Number(e.target.value))
                          }
                        />
                      </td>
                      <td className="p-4 text-center">
                        <input
                          type="number"
                          className={`w-full p-2 border rounded text-center focus:border-blue-500 outline-none focus:ring-1 focus:ring-blue-200 font-bold ${
                            (product.quantity || 0) < 10 ? "text-red-600 bg-red-50" : "text-gray-700"
                          }`}
                          value={product.quantity || 0}
                          onChange={(e) =>
                            handleUpdate(product.id, "quantity", Number(e.target.value))
                          }
                        />
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="inline-block text-blue-600 hover:text-blue-800 text-xs font-bold bg-blue-100 px-3 py-2 rounded hover:bg-blue-200 transition"
                        >
                          Chi tiết
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}