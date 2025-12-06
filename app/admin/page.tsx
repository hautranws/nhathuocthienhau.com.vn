import React from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

// Giúp trang này không bị cache (luôn cập nhật đơn mới nhất khi F5)
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  // 1. LẤY DỮ LIỆU ĐƠN HÀNG TỪ KHO
  // .select('*, order_items(*)') nghĩa là: Lấy đơn hàng VÀ lấy luôn chi tiết các món trong đơn đó
  const { data: orders, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false }); // Đơn mới nhất lên đầu

  if (error) return <div>Lỗi tải đơn hàng: {error.message}</div>;

  return (
    <div className="min-h-screen bg-gray-100 font-sans p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Admin */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900">
            🛡️ Trang Quản Lý Đơn Hàng
          </h1>
          <Link
            href="/"
            className="bg-white border border-blue-600 text-blue-600 px-4 py-2 rounded hover:bg-blue-50"
          >
            ← Về trang bán hàng
          </Link>
        </div>

        {/* Thống kê nhanh */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-600 text-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg opacity-80">Tổng số đơn hàng</h3>
            <p className="text-4xl font-bold">{orders?.length || 0}</p>
          </div>
          <div className="bg-green-600 text-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg opacity-80">Doanh thu tạm tính</h3>
            <p className="text-4xl font-bold">
              {orders
                ?.reduce((sum, order) => sum + (order.total_price || 0), 0)
                .toLocaleString("vi-VN")}
              đ
            </p>
          </div>
          <div className="bg-purple-600 text-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg opacity-80">Khách hàng mới</h3>
            <p className="text-4xl font-bold">{orders?.length || 0}</p>
          </div>
        </div>

        {/* Danh sách đơn hàng */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 text-gray-700 uppercase text-sm">
              <tr>
                <th className="p-4 border-b">Mã đơn</th>
                <th className="p-4 border-b">Ngày đặt</th>
                <th className="p-4 border-b">Khách hàng</th>
                <th className="p-4 border-b">Sản phẩm mua</th>
                <th className="p-4 border-b text-right">Tổng tiền</th>
                <th className="p-4 border-b text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700">
              {orders && orders.length > 0 ? (
                orders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 border-b last:border-0"
                  >
                    <td className="p-4 font-mono font-bold text-blue-600">
                      #{order.id}
                    </td>
                    <td className="p-4">
                      {new Date(order.created_at).toLocaleString("vi-VN")}
                    </td>
                    <td className="p-4">
                      <p className="font-bold">{order.customer_name}</p>
                      <p className="text-xs text-gray-500">{order.phone}</p>
                      <p className="text-xs text-gray-500 italic max-w-xs truncate">
                        {order.address}
                      </p>
                    </td>
                    <td className="p-4">
                      <ul className="list-disc list-inside space-y-1">
                        {/* Liệt kê các món trong đơn */}
                        {order.order_items.map((item: any) => (
                          <li key={item.id} className="text-xs">
                            <span className="font-bold">
                              {item.product_name}
                            </span>
                            <span className="text-gray-500">
                              {" "}
                              x{item.quantity}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="p-4 text-right font-bold text-red-600 text-base">
                      {order.total_price?.toLocaleString("vi-VN")}đ
                    </td>
                    <td className="p-4 text-center">
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-bold">
                        Mới
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    Chưa có đơn hàng nào. Hãy tự đặt thử xem!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
