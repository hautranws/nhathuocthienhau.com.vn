"use client";
import React, { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function CheckoutPage() {
  // Lấy thêm hàm updateQuantity từ Context
  const { cart, removeFromCart, updateQuantity, totalItems } = useCart();
  const [loading, setLoading] = useState(false);

  // --- MỚI: State quản lý các món được tick chọn ---
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  // Tự động chọn tất cả khi mới vào trang (để khách đỡ phải tick từng cái)
  useEffect(() => {
    if (cart.length > 0 && selectedItems.length === 0) {
      setSelectedItems(cart.map((item) => item.id));
    }
  }, [cart]);

  // Hàm xử lý tick chọn từng món
  const handleToggleItem = (id: number) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((itemId) => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  // Hàm chọn tất cả / bỏ chọn tất cả
  const handleSelectAll = () => {
    if (selectedItems.length === cart.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cart.map((item) => item.id));
    }
  };

  // --- SỬA: Tính tổng tiền CHỈ CÁC MÓN ĐƯỢC CHỌN ---
  const totalAmount = cart
    .filter((item) => selectedItems.includes(item.id))
    .reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Xử lý khi bấm "Đặt hàng"
  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Kiểm tra xem có chọn món nào không
    if (selectedItems.length === 0) {
      alert("Bạn chưa chọn sản phẩm nào để thanh toán!");
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
            total_price: totalAmount, // Lưu tổng tiền của các món đã chọn
          },
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. GHI CHI TIẾT MÓN HÀNG (Bảng order_items)
      // --- SỬA: Chỉ ghi những món nằm trong danh sách selectedItems ---
      const itemsToOrder = cart.filter((item) =>
        selectedItems.includes(item.id)
      );

      const orderItems = itemsToOrder.map((item) => ({
        order_id: orderData.id,
        product_name: item.title || item.name, // Ưu tiên lấy title
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // 3. THÀNH CÔNG
      alert("✅ Đặt hàng thành công! Cảm ơn bạn đã ủng hộ.");

      // Xóa các món đã mua khỏi giỏ (giữ lại món chưa mua/bỏ tick)
      // Lưu ý: Logic đơn giản nhất là xóa hết hoặc chỉ xóa món đã mua.
      // Ở đây tạm thời xóa localStorage để reset cho sạch.
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
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-800 mb-8 border-l-4 border-blue-600 pl-4">
          Giỏ hàng & Thanh toán
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* CỘT TRÁI: DANH SÁCH HÀNG */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4 pb-4 border-b">
              <h2 className="text-xl font-bold text-gray-700">1. Giỏ hàng</h2>
              {/* Checkbox chọn tất cả */}
              <label className="flex items-center space-x-2 text-sm text-blue-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={selectedItems.length === cart.length}
                  onChange={handleSelectAll}
                  className="w-4 h-4"
                />
                <span>Chọn tất cả</span>
              </label>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 border-b pb-4 items-start"
                >
                  {/* --- MỚI: Checkbox chọn món --- */}
                  <div className="pt-8">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => handleToggleItem(item.id)}
                      className="w-5 h-5 cursor-pointer accent-blue-600"
                    />
                  </div>

                  {/* --- SỬA: Hiển thị ảnh đúng bằng thẻ img --- */}
                  <div className="w-20 h-20 border rounded overflow-hidden flex-shrink-0 bg-white">
                    <img
                      src={
                        item.img ||
                        item.image_url ||
                        "https://via.placeholder.com/150"
                      }
                      alt={item.title || item.name}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="flex-1">
                    {/* --- SỬA: Hiển thị tên đúng (title) --- */}
                    <h3 className="font-bold text-sm md:text-base line-clamp-2 mb-1 text-gray-800">
                      {item.title || item.name}
                    </h3>
                    <p className="text-blue-600 font-bold mb-2">
                      {item.price.toLocaleString("vi-VN")}đ
                    </p>

                    {/* --- MỚI: Nút tăng giảm số lượng --- */}
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                        className="w-8 h-8 flex items-center justify-center border rounded-l bg-gray-100 hover:bg-gray-200 text-gray-600 disabled:opacity-50"
                      >
                        -
                      </button>
                      <span className="w-10 h-8 flex items-center justify-center border-t border-b font-bold text-sm text-gray-800">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="w-8 h-8 flex items-center justify-center border rounded-r bg-gray-100 hover:bg-gray-200 text-gray-600"
                      >
                        +
                      </button>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 text-xs hover:underline ml-auto"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t flex justify-between items-center bg-blue-50 p-4 rounded-lg">
              <span className="font-bold text-gray-600">
                Tạm tính ({selectedItems.length} món):
              </span>
              <span className="text-2xl font-bold text-red-600">
                {totalAmount.toLocaleString("vi-VN")}đ
              </span>
            </div>
          </div>

          {/* CỘT PHẢI: FORM THÔNG TIN (Giữ nguyên logic của bạn) */}
          <div className="bg-white p-6 rounded-lg shadow h-fit sticky top-4">
            <h2 className="text-xl font-bold text-gray-700 mb-4 border-b pb-2">
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
                  className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
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
                  className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
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
                  className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
                ></textarea>
              </div>

              {/* Hiển thị lại tổng tiền lần nữa cho khách chắc chắn */}
              <div className="py-2 flex justify-between items-center">
                <span className="text-sm font-semibold">Thanh toán:</span>
                <span className="text-xl font-bold text-blue-800">
                  {totalAmount.toLocaleString("vi-VN")}đ
                </span>
              </div>

              <button
                type="submit"
                disabled={loading || selectedItems.length === 0}
                className={`w-full text-white font-bold py-4 rounded-lg transition shadow-lg mt-2 ${
                  loading || selectedItems.length === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 transform hover:-translate-y-1"
                }`}
              >
                {loading
                  ? "ĐANG XỬ LÝ..."
                  : `ĐẶT HÀNG (${selectedItems.length})`}
              </button>

              <p className="text-xs text-center text-gray-500 mt-2 italic">
                * Vui lòng kiểm tra kỹ số lượng và địa chỉ trước khi đặt.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
