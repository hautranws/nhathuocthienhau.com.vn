"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function ProductManagementPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string>("");

  const fetchProducts = async () => {
    setLoading(true);
    setDebugInfo("Đang kết nối...");

    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("id", { ascending: false });

      if (error) {
        setDebugInfo(`❌ Lỗi: ${error.message}`);
      } else {
        if (!data || data.length === 0) {
          setDebugInfo("✅ Kết nối tốt, nhưng chưa có sản phẩm nào (0).");
          setProducts([]);
        } else {
          setDebugInfo(`✅ Đã tìm thấy ${data.length} sản phẩm.`);
          setProducts(data);
        }
      }
    } catch (err: any) {
      setDebugInfo(`❌ Lỗi nghiêm trọng: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc muốn xóa không?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) alert("Lỗi xóa: " + error.message);
    else {
      alert("Đã xóa!");
      fetchProducts();
    }
  };

  // --- MỚI: Hàm xử lý hiển thị ảnh đại diện ---
  // Giúp code không bị lỗi khi chuyển từ 1 ảnh sang nhiều ảnh
  const getThumbnail = (imgData: string) => {
    if (!imgData) return null;
    try {
      // Thử xem dữ liệu có phải là danh sách nhiều ảnh không
      const parsed = JSON.parse(imgData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed[0]; // Lấy ảnh đầu tiên
      }
      return imgData; // Nếu không phải mảng, trả về như cũ
    } catch (e) {
      return imgData; // Nếu là link ảnh cũ (không phải JSON)
    }
  };
  // ---------------------------------------------

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-900">📦 QUẢN LÝ KHO</h1>
          <Link
            href="/admin/products/add"
            className="bg-green-600 text-white px-4 py-2 rounded font-bold hover:bg-green-700"
          >
            + Đăng sản phẩm mới
          </Link>
        </div>

        {/* Debug Info */}
        <div className="bg-black text-green-400 p-4 rounded mb-6 font-mono text-sm">
          Status: {debugInfo}
        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-blue-50 text-blue-800 font-bold">
              <tr>
                <th className="p-4">ID</th>
                <th className="p-4">Ảnh</th>
                <th className="p-4">Tên sản phẩm</th>
                <th className="p-4">Giá</th>
                <th className="p-4 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    Danh sách trống.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="p-4 text-gray-500">#{p.id}</td>
                    <td className="p-4">
                      {p.img ? (
                        <img
                          src={getThumbnail(p.img)} // <-- SỬ DỤNG HÀM MỚI TẠI ĐÂY
                          alt=""
                          className="w-10 h-10 object-contain border rounded bg-white"
                        />
                      ) : (
                        "No Img"
                      )}
                    </td>
                    <td className="p-4 font-medium">{p.title}</td>
                    <td className="p-4 text-blue-600 font-bold">
                      {Number(p.price).toLocaleString()}đ
                    </td>
                    <td className="p-4 text-center flex justify-center gap-2">
                      <Link
                        href={`/admin/products/edit/${p.id}`}
                        className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500"
                      >
                        Sửa
                      </Link>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6">
          <Link href="/admin" className="text-gray-500 hover:underline">
            ← Quay về Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
