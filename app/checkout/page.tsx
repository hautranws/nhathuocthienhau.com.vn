"use client";
import React, { useState } from "react";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/lib/supabaseClient"; // Gọi kết nối kho
import Link from "next/link";

export default function CheckoutPage() {
  const { cart, removeFromCart, totalItems } = useCart();
  const [loading, setLoading] = useState(false); // Trạng thái đang gửi đơn

  // Tính tổng tiền
  const totalAmount = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Xử lý khi bấm "Đặt hàng"
  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault(); // Chặn web tải lại
    setLoading(true);

    if (cart.length === 0) {
      alert("Giỏ hàng đang trống trơn à!");
      setLoading(false);
      return;
    }

    // Lấy dữ liệu từ Form
    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get("fullName");
    const phone = formData.get("phone");
    const address = formData.get("address");

    try {
      // 1. GHI VÀO SỔ CÁI (Bảng orders)
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            customer_name: name,
            phone: phone,
            address: address,
            total_price: totalAmount,
          },
        ])
        .select()
        .single(); // Lấy ngay cái đơn vừa tạo để xin cái ID

      if (orderError) throw orderError;

      // 2. GHI CHI TIẾT MÓN HÀNG (Bảng order_items)
      // Chuẩn bị danh sách thuốc để ghi
      const orderItems = cart.map((item) => ({
        order_id: orderData.id, // Lấy ID của đơn hàng vừa tạo ở trên
        product_name: item.name,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // 3. THÀNH CÔNG
      alert("✅ Đặt hàng thành công! Cảm ơn bạn đã ủng hộ.");

      // Xóa sạch giỏ hàng (Giả lập bằng cách reload trang)
      localStorage.removeItem("pharmaCart");
      window.location.href = "/";
    } catch (error: any) {
      console.error("Lỗi đặt hàng:", error);
      alert("❌ Có lỗi xảy ra: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Giỏ hàng của bạn đang trống
        </h2>
        <Link
          href="/"
          className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700"
        >
          ← Quay lại mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 font-sans pt-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-800 mb-8 border-l-4 border-blue-600 pl-4">
          Xác nhận đơn hàng
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* CỘT TRÁI: DANH SÁCH HÀNG */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold text-gray-700 mb-4">
              1. Giỏ hàng ({totalItems} món)
            </h2>
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-4 border-b pb-4">
                  <div
                    className={`w-16 h-16 ${item.image_url} rounded flex items-center justify-center text-xs text-gray-400 font-bold bg-gray-100`}
                  >
                    [Ảnh]
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-sm line-clamp-2">
                      {item.name}
                    </h3>
                    <p className="text-blue-600 font-bold">
                      {item.price.toLocaleString("vi-VN")}đ
                    </p>
                    <p className="text-sm text-gray-500">
                      Số lượng: {item.quantity}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 text-sm hover:underline h-fit"
                  >
                    Xóa
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t flex justify-between items-center">
              <span className="font-bold text-gray-600">Tổng cộng:</span>
              <span className="text-2xl font-bold text-red-600">
                {totalAmount.toLocaleString("vi-VN")}đ
              </span>
            </div>
          </div>

          {/* CỘT PHẢI: FORM THÔNG TIN */}
          <div className="bg-white p-6 rounded-lg shadow h-fit">
            <h2 className="text-xl font-bold text-gray-700 mb-4">
              2. Thông tin giao hàng
            </h2>
            <form onSubmit={handleOrder} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ và tên
                </label>
                <input
                  required
                  name="fullName"
                  type="text"
                  placeholder="Ví dụ: Nguyễn Văn A"
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại
                </label>
                <input
                  required
                  name="phone"
                  type="tel"
                  placeholder="0912..."
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Địa chỉ nhận hàng
                </label>
                <textarea
                  required
                  name="address"
                  rows={3}
                  placeholder="Số nhà, đường, phường/xã..."
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full text-white font-bold py-3 rounded-lg transition shadow-lg mt-4 ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading ? "ĐANG XỬ LÝ..." : "XÁC NHẬN ĐẶT HÀNG"}
              </button>
              <p className="text-xs text-center text-gray-500 mt-2">
                Thanh toán khi nhận hàng (COD)
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
