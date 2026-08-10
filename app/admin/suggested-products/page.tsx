"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function SuggestedProductsAdminPage() {
  const [suggested, setSuggested] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuggested();
  }, []);

  const fetchSuggested = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("products")
      .select("id, title, price, img, sku")
      .eq("is_suggested", true)
      .order("id", { ascending: false });
    setSuggested(data || []);
    setLoading(false);
  };

  const handleSearch = async () => {
    if (!searchInput.trim()) return;
    setSearching(true);
    const { data } = await supabase
      .from("products")
      .select("id, title, price, img, sku, is_suggested")
      .ilike("title", `%${searchInput.trim()}%`)
      .limit(20);
    setSearchResults(data || []);
    setSearching(false);
  };

  const toggle = async (id: number, current: boolean) => {
    await supabase.from("products").update({ is_suggested: !current }).eq("id", id);
    setSearchResults((prev) =>
      prev.map((p) => (p.id === id ? { ...p, is_suggested: !current } : p))
    );
    fetchSuggested();
  };

  const remove = async (id: number) => {
    if (!confirm("Bỏ sản phẩm này khỏi danh sách gợi ý?")) return;
    await supabase.from("products").update({ is_suggested: false }).eq("id", id);
    fetchSuggested();
  };

  const getThumbnail = (img: any) => {
    if (!img) return null;
    try {
      if (img.startsWith("[")) {
        const parsed = JSON.parse(img);
        return Array.isArray(parsed) ? parsed[0] : img;
      }
      return img;
    } catch { return img; }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <Link href="/admin" className="text-sm text-blue-600 hover:underline">
            ← Quay lại Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-orange-600 mt-1 flex items-center gap-2">
            🛍️ Quản lý Sản Phẩm Gợi Ý (Giỏ Hàng)
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Hiển thị tại trang thanh toán — Đang có <strong>{suggested.length}</strong> sản phẩm (tối đa 10)
          </p>
        </div>

        {/* Tìm & thêm */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
          <h2 className="font-bold text-gray-700">➕ Thêm sản phẩm gợi ý</h2>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="🔍 Tìm tên sản phẩm..."
              className="flex-1 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-400 outline-none text-sm"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button
              onClick={handleSearch}
              disabled={searching}
              className="bg-orange-500 text-white px-5 py-2 rounded-lg font-bold hover:bg-orange-600 transition text-sm"
            >
              {searching ? "Đang tìm..." : "Tìm kiếm"}
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="border border-gray-100 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 font-bold text-xs uppercase">
                  <tr>
                    <th className="p-3 text-left">Ảnh</th>
                    <th className="p-3 text-left">Tên sản phẩm</th>
                    <th className="p-3 text-right">Giá</th>
                    <th className="p-3 text-center">Trạng thái</th>
                    <th className="p-3 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {searchResults.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="p-3">
                        {getThumbnail(p.img) ? (
                          <img src={getThumbnail(p.img)} className="w-10 h-10 object-contain border rounded bg-white" loading="lazy" alt="" />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 rounded" />
                        )}
                      </td>
                      <td className="p-3 font-medium text-gray-800 max-w-xs">
                        <div className="line-clamp-2">{p.title}</div>
                      </td>
                      <td className="p-3 text-right text-blue-600 font-bold">
                        {Number(p.price).toLocaleString("vi-VN")}đ
                      </td>
                      <td className="p-3 text-center">
                        {p.is_suggested ? (
                          <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-1 rounded-full">🛍️ Đang gợi ý</span>
                        ) : (
                          <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full">Chưa có</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => toggle(p.id, p.is_suggested)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                            p.is_suggested
                              ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                              : "bg-orange-500 text-white hover:bg-orange-600"
                          }`}
                        >
                          {p.is_suggested ? "✕ Bỏ gợi ý" : "🛍️ Thêm gợi ý"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Danh sách hiện tại */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-bold text-gray-700">🛍️ Đang gợi ý tại giỏ hàng ({suggested.length}/10 sản phẩm)</h2>
          </div>
          {loading ? (
            <div className="p-10 text-center text-gray-500">⏳ Đang tải...</div>
          ) : suggested.length === 0 ? (
            <div className="p-10 text-center text-gray-400">Chưa có sản phẩm gợi ý nào. Hãy tìm và thêm ở trên.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-orange-50 text-orange-800 font-bold text-xs uppercase">
                <tr>
                  <th className="p-4 text-center w-12">STT</th>
                  <th className="p-4 text-left w-14">Ảnh</th>
                  <th className="p-4 text-left">Tên sản phẩm</th>
                  <th className="p-4 text-right w-32">Giá</th>
                  <th className="p-4 text-center w-24">Xóa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {suggested.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-orange-50 transition">
                    <td className="p-4 text-gray-400 text-center font-mono text-xs">{idx + 1}</td>
                    <td className="p-4">
                      {getThumbnail(p.img) ? (
                        <img src={getThumbnail(p.img)} className="w-10 h-10 object-contain border rounded bg-white" loading="lazy" alt="" />
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded" />
                      )}
                    </td>
                    <td className="p-4 font-medium text-gray-800">
                      <div className="line-clamp-2">{p.title}</div>
                    </td>
                    <td className="p-4 text-right text-blue-600 font-bold">
                      {Number(p.price).toLocaleString("vi-VN")}đ
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => remove(p.id)}
                        className="bg-red-100 text-red-600 hover:bg-red-200 px-3 py-1.5 rounded-lg text-xs font-bold transition"
                      >
                        ✕ Bỏ
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
