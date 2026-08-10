"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function StoresManagementPage() {
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editLat, setEditLat] = useState("");
  const [editLng, setEditLng] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    const { data, error } = await supabase.from("stores").select("*").order("id", { ascending: true });
    if (data) setStores(data);
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa nhà thuốc này?")) return;
    const { error } = await supabase.from("stores").delete().eq("id", id);
    if (!error) {
      alert("Đã xóa thành công!");
      fetchStores();
    } else {
      alert("Lỗi xóa: " + error.message);
    }
  };

  const startEdit = (store: any) => {
    setEditingId(store.id);
    setEditLat(store.lat ?? "");
    setEditLng(store.lng ?? "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditLat("");
    setEditLng("");
  };

  const saveCoordinates = async (id: number) => {
    if (editLat === "" || editLng === "") {
      alert("Vui lòng nhập cả vĩ độ và kinh độ.");
      return;
    }

    setSavingId(id);
    const { error } = await supabase
      .from("stores")
      .update({ lat: Number(editLat), lng: Number(editLng) })
      .eq("id", id);

    setSavingId(null);

    if (!error) {
      alert("Đã lưu tọa độ thành công!");
      setEditingId(null);
      setEditLat("");
      setEditLng("");
      fetchStores();
    } else {
      const missingColumn = error.message.includes("Could not find the 'lat' column") || error.message.includes("Could not find the 'lng' column");
      alert(
        missingColumn
          ? "Lỗi lưu tọa độ: bảng stores chưa có cột lat/lng. Hãy chạy SQL trong SQL_ADMIN_SETUP.sql để thêm cột rồi tải lại trang."
          : "Lỗi lưu tọa độ: " + error.message
      );
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-800">🏥 QUẢN LÝ HỆ THỐNG NHÀ THUỐC</h1>
        <Link href="/admin/stores/add" className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 shadow">
          + Thêm Nhà Thuốc Mới
        </Link>
      </div>

      <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
        Nếu chưa lưu được tọa độ, hãy chạy phần <span className="font-bold">STORES COORDINATES</span> trong <span className="font-bold">SQL_ADMIN_SETUP.sql</span> để tạo cột <span className="font-bold">lat</span> và <span className="font-bold">lng</span> cho bảng stores.
      </div>

      <div className="bg-white rounded-xl shadow border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-blue-50 text-blue-800 uppercase text-xs font-bold">
            <tr>
              <th className="p-4 border-b">ID</th>
              <th className="p-4 border-b">Hình ảnh</th>
              <th className="p-4 border-b">Tên & Địa chỉ</th>
              <th className="p-4 border-b">Khu vực (City Code)</th>
              <th className="p-4 border-b">Tọa độ</th>
              <th className="p-4 border-b">Google Map</th>
              <th className="p-4 border-b text-right">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="p-6 text-center">Đang tải...</td></tr>
            ) : stores.length === 0 ? (
              <tr><td colSpan={7} className="p-6 text-center text-gray-500">Chưa có nhà thuốc nào.</td></tr>
            ) : (
              stores.map((store) => (
                <tr key={store.id} className="hover:bg-gray-50 border-b last:border-0">
                  <td className="p-4 font-bold text-gray-500">#{store.id}</td>
                  <td className="p-4">
                    <img src={store.image_url || "https://via.placeholder.com/100"} className="w-16 h-16 object-cover rounded border" alt="" />
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-blue-900">{store.name}</div>
                    <div className="text-sm text-gray-600">{store.address}</div>
                    <div className="text-xs text-gray-500">SĐT: {store.phone}</div>
                  </td>
                  <td className="p-4">
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs font-bold">{store.city_code}</span>
                  </td>
                  <td className="p-4 text-xs text-gray-600">
                    {editingId === store.id ? (
                      <div className="space-y-2">
                        <input type="number" step="any" value={editLat} onChange={(e) => setEditLat(e.target.value)} className="w-full border rounded px-2 py-1" placeholder="Lat" />
                        <input type="number" step="any" value={editLng} onChange={(e) => setEditLng(e.target.value)} className="w-full border rounded px-2 py-1" placeholder="Lng" />
                        <div className="flex gap-2">
                          <button onClick={() => saveCoordinates(store.id)} disabled={savingId === store.id} className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">
                            {savingId === store.id ? "Đang lưu..." : "Lưu"}
                          </button>
                          <button onClick={cancelEdit} className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-bold">Hủy</button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div>{store.lat && store.lng ? `${store.lat}, ${store.lng}` : "Chưa có"}</div>
                        <button onClick={() => startEdit(store)} className="text-blue-600 underline mt-1">Nhập tọa độ</button>
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-xs max-w-xs truncate text-blue-500">
                    <a href={store.map_url} target="_blank" rel="noreferrer" className="underline">Xem Map</a>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleDelete(store.id)} className="text-red-600 hover:text-red-800 font-bold text-sm">Xóa</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}