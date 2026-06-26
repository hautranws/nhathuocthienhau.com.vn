"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminHomepageManager() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchHomepageProducts();
  }, []);

  const fetchHomepageProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("id, title, img, price, is_homepage_visible")
        .eq("is_homepage_visible", true)
        .order("id", { ascending: false });

      if (error) {
        console.error("Fetch homepage error detail:", error.message || error);
      } else if (data) {
        setSelectedProducts(data);
      }
    } catch (err) {
      console.error("Fetch homepage exception:", err);
    }
    setLoading(false);
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    try {
      // Thêm is_homepage_visible vào để nút bấm biết trạng thái hiện tại
      const { data, error } = await supabase
        .from("products")
        .select("id, title, img, price, is_homepage_visible")
        .ilike("title", `%${searchTerm}%`)
        .limit(30);

      if (error) {
        console.error("Search error detail:", error.message || error);
        alert("Lỗi tìm kiếm: " + (error.message || JSON.stringify(error)));
      } else {
        setProducts(data || []);
        if (data?.length === 0) {
          alert("Không tìm thấy sản phẩm nào với tên: " + searchTerm);
        }
      }
    } catch (err) {
      console.error("Search exception:", err);
    }
    setLoading(false);
  };

  const toggleHomepageVisibility = async (product: any) => {
    const newValue = !product.is_homepage_visible;
    setSaving(true);

    try {
      const response = await fetch("/api/admin/update-homepage-visibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          isVisible: newValue,
        }),
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        console.error("Update error detail:", result.error);
        alert("Lỗi cập nhật: " + (result.error || "Không rõ"));
      } else {
        console.log("✅ Cập nhật thành công:", result);

        // Cập nhật local state
        setProducts(
          products.map((p) =>
            p.id === product.id ? { ...p, is_homepage_visible: newValue } : p,
          ),
        );

        if (newValue) {
          if (!selectedProducts.find((p) => p.id === product.id)) {
            setSelectedProducts([
              { ...product, is_homepage_visible: true },
              ...selectedProducts,
            ]);
          }
        } else {
          setSelectedProducts(
            selectedProducts.filter((p) => p.id !== product.id),
          );
        }
        alert("Đã cập nhật trạng thái hiển thị: " + (newValue ? "HIỆN" : "ẨN"));
      }
    } catch (err: any) {
      console.error("Update exception:", err.message);
      alert("Lỗi cập nhật: " + (err.message || "Không rõ"));
    }

    setSaving(false);
  };

  const getThumbnail = (imgData: string) => {
    if (!imgData) return "/placeholder-product.png";
    try {
      const parsed = JSON.parse(imgData);
      return Array.isArray(parsed) ? parsed[0] : imgData;
    } catch {
      return imgData;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 mt-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        🏠 Quản lý sản phẩm Trang chủ
      </h2>

      <p className="text-gray-500 text-sm mb-6">
        Chọn các sản phẩm bạn muốn hiển thị ưu tiên trên trang chủ thay vì hiển
        thị tự động các sản phẩm mới nhất.
      </p>

      {/* Thanh tìm kiếm sản phẩm */}
      <div className="flex gap-2 mb-8">
        <input
          type="text"
          placeholder="Tìm sản phẩm để thêm vào trang chủ..."
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
        />
        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition"
        >
          Tìm kiếm
        </button>
        <button
          onClick={async () => {
            const { data, error } = await supabase
              .from("products")
              .select("count");
            alert(
              "Kết quả test: " +
                (error ? error.message : "Có " + data[0].count + " sản phẩm"),
            );
          }}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-bold hover:bg-gray-300 transition"
        >
          Test Connect
        </button>
      </div>

      {/* Kết quả tìm kiếm */}
      {products.length > 0 && (
        <div className="mb-8">
          <h3 className="font-bold text-gray-700 mb-3 border-b pb-2">
            Kết quả tìm kiếm
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50"
              >
                <img
                  src={getThumbnail(p.img)}
                  className="w-12 h-12 object-contain rounded border bg-white"
                  alt=""
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{p.title}</p>
                  <p className="text-blue-600 font-bold text-xs">
                    {p.price.toLocaleString()}đ
                  </p>
                </div>
                <button
                  onClick={() => toggleHomepageVisibility(p)}
                  className={`px-4 py-1 rounded-full text-xs font-bold transition ${
                    p.is_homepage_visible
                      ? "bg-red-50 text-red-600 border border-red-200"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {p.is_homepage_visible
                    ? "Gỡ khỏi trang chủ"
                    : "Hiện ở trang chủ"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Danh sách sản phẩm đang hiện ở trang chủ */}
      <div>
        <h3 className="font-bold text-gray-700 mb-3 border-b pb-2">
          Sản phẩm đang hiển thị ({selectedProducts.length})
        </h3>
        {loading ? (
          <p className="text-center py-10 text-gray-400">Đang tải...</p>
        ) : selectedProducts.length === 0 ? (
          <p className="text-center py-10 text-gray-400 bg-gray-50 rounded-lg">
            Chưa có sản phẩm nào được chọn.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedProducts.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-4 p-3 border border-blue-100 bg-blue-50/30 rounded-lg"
              >
                <img
                  src={getThumbnail(p.img)}
                  className="w-12 h-12 object-contain rounded border bg-white"
                  alt=""
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{p.title}</p>
                  <p className="text-blue-600 font-bold text-xs">
                    {p.price.toLocaleString()}đ
                  </p>
                </div>
                <button
                  onClick={() => toggleHomepageVisibility(p)}
                  className="px-4 py-1 rounded-full text-xs font-bold bg-white text-red-600 border border-red-200 hover:bg-red-50 transition"
                >
                  Gỡ bỏ
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
