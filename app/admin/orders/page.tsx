"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setOrders(data);
    setLoading(false);
  };

  const fetchOrderItems = async (orderId: number) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null); // Đóng lại nếu đang mở
      return;
    }
    setExpandedOrderId(orderId);
    
    // Lấy chi tiết món hàng
    const { data } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", orderId);
    if (data) setOrderItems(data);
  };

  const updateStatus = async (id: number, status: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ payment_status: status })
      .eq("id", id);
    if (!error) {
        setOrders(orders.map(o => o.id === id ? {...o, payment_status: status} : o));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Link href="/admin" className="text-blue-600 hover:underline">
            ← Quay lại Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">🛒 Quản Lý Đơn Hàng</h1>
        </div>

        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
              {/* Header đơn hàng */}
              <div 
                className="p-4 flex flex-col md:flex-row justify-between items-center cursor-pointer hover:bg-gray-50 transition"
                onClick={() => fetchOrderItems(order.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 text-blue-800 font-bold p-3 rounded-full h-12 w-12 flex items-center justify-center">
                    #{order.id}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{order.customer_name}</h3>
                    <p className="text-sm text-gray-500">{order.phone} - {new Date(order.created_at).toLocaleString('vi-VN')}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 mt-4 md:mt-0">
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Tổng tiền</p>
                    <p className="text-red-600 font-bold text-lg">
                      {Number(order.total_price).toLocaleString("vi-VN")}đ
                    </p>
                  </div>
                  
                  <div>
                     <select 
                        onClick={(e) => e.stopPropagation()}
                        value={order.payment_status || 'pending'}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        className={`p-2 rounded text-sm font-bold border ${
                            order.payment_status === 'paid' ? 'bg-green-100 text-green-700 border-green-200' :
                            order.payment_status === 'failed' ? 'bg-red-100 text-red-700 border-red-200' :
                            'bg-yellow-100 text-yellow-700 border-yellow-200'
                        }`}
                     >
                        <option value="pending">Chờ thanh toán</option>
                        <option value="paid">Đã thanh toán</option>
                        <option value="failed">Hủy / Lỗi</option>
                     </select>
                  </div>
                </div>
              </div>

              {/* Chi tiết đơn hàng (Mở rộng) */}
              {expandedOrderId === order.id && (
                <div className="bg-gray-50 p-4 border-t border-gray-100">
                  <h4 className="font-bold text-gray-700 mb-2 text-sm uppercase">Chi tiết sản phẩm:</h4>
                  <table className="w-full text-sm">
                    <thead>
                        <tr className="text-gray-500 border-b">
                            <th className="text-left pb-2">Tên món</th>
                            <th className="text-center pb-2">SL</th>
                            <th className="text-right pb-2">Đơn giá</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orderItems.map((item, idx) => (
                            <tr key={idx} className="border-b border-gray-200 last:border-0">
                                <td className="py-2 text-gray-800">{item.product_name}</td>
                                <td className="py-2 text-center font-bold">x{item.quantity}</td>
                                <td className="py-2 text-right">{Number(item.price).toLocaleString('vi-VN')}đ</td>
                            </tr>
                        ))}
                    </tbody>
                  </table>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                     <p className="text-sm"><strong>Địa chỉ giao:</strong> {order.address}</p>
                     <p className="text-sm"><strong>Ghi chú:</strong> {order.note || "Không có"}</p>
                     <p className="text-sm"><strong>Thanh toán qua:</strong> {order.payment_method}</p>
                  </div>
                </div>
              )}
            </div>
          ))}

          {orders.length === 0 && (
             <div className="text-center py-10 text-gray-500">Chưa có đơn hàng nào.</div>
          )}
        </div>
      </div>
    </div>
  );
}