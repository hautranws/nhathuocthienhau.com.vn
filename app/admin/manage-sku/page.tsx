"use client";
import React, { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

// --- TYPE MỚI ---
interface ProductMissingSKU {
  id: number;
  title: string;
  category: string;
  price: number;
  sku: string | null;
  tempSku?: string; // Lưu tạm giá trị đang nhập
}

export default function ManageSkuPage() {
  const [products, setProducts] = useState<ProductMissingSKU[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<number | null>(null);

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const ITEMS_PER_PAGE = 50;

  useEffect(() => {
    fetchProducts();
  }, [currentPage]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      // Gộp lệnh đếm và lấy dữ liệu thành 1, đổi count sang "estimated" để tránh lỗi sập DB/Timeout
      const { data, count, error } = await supabase
        .from("products")
        .select("id, title, category, price, sku", { count: "estimated" })
        .or("sku.is.null,sku.eq.") // Lấy cả những sản phẩm có SKU là chuỗi rỗng
        .order("id", { ascending: false })
        .range(from, to);

      if (error) throw error;

      setTotalProducts(count || 0);

      // Thêm tempSku để quản lý ô nhập liệu
      const processedData = (data || []).map((p) => ({ ...p, tempSku: "" }));
      setProducts(processedData);
    } catch (error: any) {
      console.error("Lỗi lấy dữ liệu:", error);
      alert("Lỗi tải danh sách: " + (error?.message || JSON.stringify(error)));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (id: number, value: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, tempSku: value } : p)),
    );
  };

  const handleSave = async (id: number, skuValue: string | undefined) => {
    if (!skuValue || !skuValue.trim()) {
      alert("Vui lòng nhập mã SKU hợp lệ!");
      return;
    }

    setSavingId(id);
    try {
      const { error } = await supabase
        .from("products")
        .update({ sku: skuValue.trim() })
        .eq("id", id);

      if (error) throw error;

      // Cập nhật thành công -> Xóa dòng này khỏi danh sách
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setTotalProducts((prev) => prev - 1);
    } catch (error: any) {
      alert("Lỗi cập nhật: " + error.message);
    } finally {
      setSavingId(null);
    }
  };

  const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans text-gray-800">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100 gap-4">
          <div>
            <Link
              href="/admin"
              className="text-sm text-blue-600 hover:underline mb-2 inline-block font-medium"
            >
              ← Quay lại Quản trị
            </Link>
            <h1 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
              🏷️ Cập Nhật SKU Trực Tiếp
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Danh sách các sản phẩm đang bị <strong>trống mã SKU</strong>. Nhập
              mã và bấm Lưu để cập nhật ngay.
            </p>
          </div>
          <div className="bg-orange-50 px-5 py-3 rounded-xl border border-orange-100 flex items-center gap-3">
            <span className="text-2xl animate-pulse">⚠️</span>
            <div>
              <p className="text-xs text-orange-600 font-bold uppercase">
                Cần cập nhật
              </p>
              <p className="text-lg font-black text-orange-700">
                {totalProducts} Sản phẩm
              </p>
            </div>
          </div>
        </div>

        {/* BẢNG DỮ LIỆU */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-blue-50 text-blue-800 uppercase font-bold text-xs">
                <tr>
                  <th className="p-4 border-b w-20 text-center">ID</th>
                  <th className="p-4 border-b">Tên sản phẩm</th>
                  <th className="p-4 border-b w-40">Danh mục</th>
                  <th className="p-4 border-b w-32 text-right">Giá bán</th>
                  <th className="p-4 border-b w-64 text-center">Mã SKU Mới</th>
                  <th className="p-4 border-b w-32 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-10 text-center text-gray-500 font-medium"
                    >
                      <span className="animate-spin inline-block mr-2 w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"></span>
                      Đang tải danh sách...
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-10 text-center text-green-600 font-bold"
                    >
                      🎉 Tuyệt vời! Tất cả sản phẩm đều đã có mã SKU.
                    </td>
                  </tr>
                ) : (
                  products.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition">
                      <td className="p-4 font-mono text-gray-500 text-sm text-center">
                        #{p.id}
                      </td>
                      <td className="p-4 font-semibold text-gray-800">
                        <div className="line-clamp-2" title={p.title}>
                          {p.title}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {p.category || "---"}
                      </td>
                      <td className="p-4 text-right font-bold text-blue-600">
                        {p.price
                          ? p.price.toLocaleString("vi-VN") + "đ"
                          : "---"}
                      </td>
                      <td className="p-4">
                        <input
                          type="text"
                          placeholder="Nhập SKU..."
                          className="w-full p-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-center font-mono font-bold text-blue-800 transition"
                          value={p.tempSku || ""}
                          onChange={(e) =>
                            handleInputChange(p.id, e.target.value)
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSave(p.id, p.tempSku);
                          }}
                        />
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleSave(p.id, p.tempSku)}
                          disabled={
                            savingId === p.id ||
                            !(p.tempSku && p.tempSku.trim())
                          }
                          className={`w-full py-2 rounded-lg font-bold text-sm transition shadow-sm ${
                            savingId === p.id
                              ? "bg-gray-400 text-white cursor-not-allowed"
                              : p.tempSku && p.tempSku.trim()
                                ? "bg-blue-600 text-white hover:bg-blue-700 hover:shadow"
                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          {savingId === p.id ? "Đang lưu..." : "💾 Lưu"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PHÂN TRANG */}
          {!loading && totalProducts > 0 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Hiển thị{" "}
                <span className="font-bold text-gray-800">
                  {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                </span>{" "}
                -{" "}
                <span className="font-bold text-gray-800">
                  {Math.min(currentPage * ITEMS_PER_PAGE, totalProducts)}
                </span>
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className={`px-4 py-2 border rounded-lg text-sm font-bold ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                      : "bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition"
                  }`}
                >
                  ← Trước
                </button>
                <span className="px-4 py-2 bg-blue-100 text-blue-800 font-bold rounded-lg text-sm border border-blue-200">
                  Trang {currentPage} / {totalPages || 1}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev - 1, totalPages))
                  }
                  disabled={currentPage === totalPages || totalPages === 0}
                  className={`px-4 py-2 border rounded-lg text-sm font-bold ${
                    currentPage === totalPages || totalPages === 0
                      ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                      : "bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition"
                  }`}
                >
                  Sau →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
