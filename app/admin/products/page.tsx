"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
// import Image from "next/image"; // Bật dòng này nếu muốn dùng Image tối ưu

interface InventoryProduct {
  id: number;
  sku?: string;
  title: string;
  img?: string;
  price: number | string;
}

export default function ProductManagementPage() {
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sortOrder, setSortOrder] = useState("default");
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // --- State cho phân trang ---
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // Gọi hàm fetch mỗi khi đổi trang hoặc từ khóa tìm kiếm
  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchTerm, sortOrder, itemsPerPage]);

  const fetchProducts = async () => {
    setLoading(true);
    setDebugInfo("Đang kết nối...");

    try {
      const normalizedSearch = searchTerm.trim();
      const searchPattern = `%${normalizedSearch}%`;

      // Tính toán phân đoạn
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      // Lấy dữ liệu và tổng số trên cùng một truy vấn để count không bị lệch.
      let query = supabase
        .from("products")
          .select("*", { count: "exact" })
        .order(sortOrder === "name-asc" ? "title" : "id", {
          ascending: sortOrder === "name-asc" ? true : false,
        })
        .range(from, to);

      if (normalizedSearch) {
        query = query.or(
          `title.ilike.${searchPattern},sku.ilike.${searchPattern}`,
        );
      }

          const { data, error, count } = await query;

      if (error) {
        setDebugInfo(`❌ Lỗi: ${error.message}`);
      } else {
        setTotalProducts(count ?? data?.length ?? 0);
        if (!data || data.length === 0) {
          setDebugInfo(
            "✅ Kết nối tốt, nhưng chưa có sản phẩm nào ở trang này.",
          );
          setProducts([]);
        } else {
          setDebugInfo(
            `✅ Đang hiển thị ${data.length} sản phẩm (Trang ${currentPage}).`,
          );
          setProducts(data);
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Lỗi không xác định";
      setDebugInfo(`❌ Lỗi nghiêm trọng: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc muốn xóa không?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) alert("Lỗi xóa: " + error.message);
    else {
      setProducts((currentProducts) =>
        currentProducts.filter((product) => product.id !== id),
      );
      setTotalProducts((currentTotal) => Math.max(0, currentTotal - 1));
      setDebugInfo(
        `✅ Đã xóa sản phẩm. Đang ở trang ${currentPage}, không tải lại danh sách.`,
      );
    }
  };

  // --- Hàm xử lý hiển thị ảnh đại diện (GIỮ NGUYÊN) ---
  const getThumbnail = (imgData: string) => {
    if (!imgData) return null;
    try {
      const parsed = JSON.parse(imgData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed[0];
      }
      return imgData;
    } catch {
      return imgData;
    }
  };
  // ---------------------------------------------

  // Tính tổng số trang
  const totalPages = Math.max(1, Math.ceil(totalProducts / itemsPerPage));

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-900">
            📦 QUẢN LÝ KHO (Trang {currentPage})
          </h1>
          <Link
            href="/admin/products/add" // Lưu ý: Code cũ của bạn link là /admin/products/add
            // Nếu bạn dùng /admin/add như ở Dashboard thì sửa lại cho khớp nhé
            className="bg-green-600 text-white px-4 py-2 rounded font-bold hover:bg-green-700"
          >
            + Đăng sản phẩm mới
          </Link>
        </div>

        {/* Debug Info */}
        <div className="bg-black text-green-400 p-4 rounded mb-4 font-mono text-sm">
          Status: {debugInfo} | Tổng cộng: {totalProducts} sản phẩm
        </div>

        {/* Thanh tìm kiếm */}
        <div className="bg-white p-3 rounded-xl shadow mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="text"
            placeholder="🔍 Tìm theo tên sản phẩm hoặc SKU..."
            className="flex-1 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none text-sm"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setCurrentPage(1);
                setSearchTerm(searchInput);
              }
            }}
          />
          <button
            onClick={() => {
              setCurrentPage(1);
              setSearchTerm(searchInput);
            }}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-blue-700 transition text-sm"
          >
            Tìm
          </button>
          {searchTerm && (
            <button
              onClick={() => {
                setSearchInput("");
                setSearchTerm("");
                setCurrentPage(1);
              }}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-bold hover:bg-gray-300 transition text-sm"
            >
              ✕ Xóa
            </button>
          )}
          <label className="flex items-center gap-2 text-sm text-gray-600 sm:ml-auto">
            <span className="whitespace-nowrap">Sắp xếp:</span>
            <select
              value={sortOrder}
              onChange={(event) => {
                setSortOrder(event.target.value);
                setCurrentPage(1);
              }}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              aria-label="Sắp xếp sản phẩm"
            >
              <option value="default">Mới cập nhật</option>
              <option value="name-asc">Tên A → Z</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <span className="whitespace-nowrap">Hiển thị:</span>
            <select
              value={itemsPerPage}
              onChange={(event) => {
                setItemsPerPage(Number(event.target.value));
                setCurrentPage(1);
              }}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              aria-label="Số sản phẩm mỗi trang"
            >
              <option value={10}>10 sản phẩm</option>
              <option value={50}>50 sản phẩm</option>
              <option value={100}>100 sản phẩm</option>
            </select>
          </label>
        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-blue-50 text-blue-800 font-bold">
              <tr>
                <th className="p-4">SKU</th>
                <th className="p-4">Ảnh</th>
                <th className="p-4">Tên sản phẩm</th>
                <th className="p-4">Giá</th>
                <th className="p-4 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    ⏳ Đang tải dữ liệu...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    Danh sách trống.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="p-4 text-gray-700 font-mono text-sm">
                      {p.sku || "N/A"}
                    </td>
                    <td className="p-4">
                      {p.img ? (
                        <img
                          src={getThumbnail(p.img)}
                          alt=""
                          className="w-14 h-14 object-contain border rounded bg-white"
                          loading="lazy"
                        />
                      ) : (
                        "No Img"
                      )}
                    </td>
                    <td
                      className="p-4 font-medium max-w-xs truncate"
                      title={p.title}
                    >
                      {p.title}
                    </td>
                    <td className="p-4 text-blue-600 font-bold">
                      {Number(p.price).toLocaleString()}đ
                    </td>
                    <td className="p-4 text-center flex justify-center gap-2">
                      <Link
                        href={`/admin/products/${p.id}`} // Đã sửa lại cho khớp logic edit page
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

          {/* --- [CODE MỚI] THANH PHÂN TRANG --- */}
          {!loading && (totalProducts > 0 || products.length > 0) && (
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 sm:px-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-center sm:text-left">
                  <p className="text-sm text-gray-700">
                    Hiển thị{" "}
                    <span className="font-medium">
                      {(currentPage - 1) * itemsPerPage + 1}
                    </span>{" "}
                    đến{" "}
                    <span className="font-medium">
                      {Math.min(currentPage * itemsPerPage, totalProducts)}
                    </span>{" "}
                    trong <span className="font-medium">{totalProducts}</span>{" "}
                    kết quả
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    aria-label="Quay lại trang trước"
                    title="Quay lại trang trước"
                    className={`px-3 py-1 border rounded ${currentPage === 1 ? "bg-gray-200 text-gray-400" : "bg-white hover:bg-gray-100"}`}
                  >
                    ← Quay lại
                  </button>
                  {/* Hiển thị số trang đơn giản */}
                  <span className="px-3 py-1 border bg-blue-50 text-blue-600 font-bold rounded">
                    Trang {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    aria-label="Sang trang tiếp theo"
                    title="Sang trang tiếp theo"
                    className={`px-3 py-1 border rounded ${currentPage === totalPages ? "bg-gray-200 text-gray-400" : "bg-white hover:bg-gray-100"}`}
                  >
                    Tiếp theo →
                  </button>
                </div>
              </div>
            </div>
          )}
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
