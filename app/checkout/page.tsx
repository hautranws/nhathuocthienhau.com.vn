"use client";
import React, { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient"; // Thêm dòng này

export default function CheckoutPage() {
  const { cart, removeFromCart, updateQuantity } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // --- STATE QUẢN LÝ ---
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("COD");

  // --- [MỚI] STATE COUPON ---
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null); // Lưu object coupon nếu áp dụng thành công
  const [couponMessage, setCouponMessage] = useState({ type: "", text: "" }); // Thông báo lỗi/thành công
  const [discountAmount, setDiscountAmount] = useState(0);

  // Tự động chọn tất cả khi mới vào
  useEffect(() => {
    if (cart.length > 0 && selectedItems.length === 0) {
      setSelectedItems(cart.map((item) => item.id));
    }
  }, [cart]);

  // --- CÁC HÀM XỬ LÝ GIỎ HÀNG (GIỮ NGUYÊN) ---
  const handleToggleItem = (id: number) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((itemId) => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedItems.length === cart.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cart.map((item) => item.id));
    }
  };

  // Tính tổng tiền GỐC các món được chọn
  const subTotal = cart
    .filter((item) => selectedItems.includes(item.id))
    .reduce((sum, item) => sum + item.price * item.quantity, 0);

  // --- [MỚI] HÀM KIỂM TRA MÃ GIẢM GIÁ ---
  const checkCoupon = async () => {
    setCouponMessage({ type: "", text: "" });
    setDiscountAmount(0);
    setAppliedCoupon(null);

    if (!couponCode.trim()) return;

    // 1. Tìm mã trong DB
    const { data: coupon, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", couponCode.toUpperCase().trim())
      .eq("is_active", true)
      .single();

    if (error || !coupon) {
      setCouponMessage({ type: "error", text: "❌ Mã giảm giá không tồn tại hoặc đã bị khóa!" });
      return;
    }

    // 2. Kiểm tra hạn sử dụng
    if (coupon.expiry_date && new Date() > new Date(coupon.expiry_date)) {
      setCouponMessage({ type: "error", text: "❌ Mã này đã hết hạn sử dụng!" });
      return;
    }

    // 3. Kiểm tra số lượt dùng
    if (coupon.usage_limit > 0 && coupon.used_count >= coupon.usage_limit) {
      setCouponMessage({ type: "error", text: "❌ Mã này đã hết lượt sử dụng!" });
      return;
    }

    // 4. Kiểm tra đơn hàng tối thiểu
    if (subTotal < coupon.min_order_value) {
      setCouponMessage({ 
        type: "error", 
        text: `❌ Đơn hàng phải từ ${Number(coupon.min_order_value).toLocaleString()}đ mới được dùng mã này!` 
      });
      return;
    }

    // 5. Tính toán giảm giá
    let discount = 0;
    if (coupon.discount_type === "percent") {
      discount = (subTotal * coupon.discount_value) / 100;
    } else {
      discount = coupon.discount_value;
    }

    // Không giảm quá số tiền đơn hàng
    if (discount > subTotal) discount = subTotal;

    setDiscountAmount(discount);
    setAppliedCoupon(coupon);
    setCouponMessage({ type: "success", text: `✅ Áp dụng mã thành công! Giảm ${discount.toLocaleString()}đ` });
  };

  // Tính tổng tiền cuôi cùng (Sau khi trừ giảm giá)
  const finalAmount = subTotal - discountAmount;

  // --- DANH SÁCH PHƯƠNG THỨC THANH TOÁN ---
  const paymentMethods = [
    { id: "COD", name: "Tiền mặt khi nhận hàng", icon: "💵" },
    { id: "BANK", name: "Chuyển khoản (VietQR)", icon: "🏦" },
    { id: "MOMO", name: "Ví MoMo", icon: "🟪" },
    { id: "ZALOPAY", name: "Ví ZaloPay", icon: "🟦" },
    { id: "VNPAY", name: "Thẻ ATM / Visa / VNPay", icon: "🇻🇳" },
  ];

  // --- XỬ LÝ ĐẶT HÀNG (GỌI API) ---
  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (selectedItems.length === 0) {
      alert("Bạn chưa chọn sản phẩm nào!");
      setLoading(false);
      return;
    }

    const formData = new FormData(e.target as HTMLFormElement);
    const fullName = formData.get("fullName") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;
    const note = formData.get("note") as string;

    // --- KIỂM TRA SỐ ĐIỆN THOẠI ---
    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    if (!phoneRegex.test(phone)) {
      alert("❌ Số điện thoại không hợp lệ! Vui lòng kiểm tra lại.");
      setLoading(false);
      return;
    }

    const orderInfo = {
      name: fullName,
      phone: phone,
      address: address,
      note: note,
    };

    const itemsToOrder = cart.filter((item) => selectedItems.includes(item.id));

    try {
      // GỌI API BACKEND
      const response = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: itemsToOrder,
          totalAmount: finalAmount, // Gửi giá cuối cùng (API sẽ check lại)
          couponCode: appliedCoupon ? appliedCoupon.code : null, // [MỚI] Gửi mã coupon lên
          customer: orderInfo,
          paymentMethod: paymentMethod,
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Lỗi tạo đơn hàng");

      if (data.url) {
        window.location.href = data.url;
      } else {
        if (data.isNewUser) {
          alert(`✅ Đặt hàng thành công!\nHệ thống đã tạo tài khoản cho SĐT: ${phone}.`);
        } else {
          alert("✅ Đặt hàng thành công! Mã đơn: " + data.orderId);
        }
        router.push("/");
      }

      itemsToOrder.forEach((item) => removeFromCart(item.id));
    } catch (error: any) {
      console.error("Lỗi:", error);
      alert("❌ " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- GIAO DIỆN KHI GIỎ TRỐNG ---
  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Giỏ hàng trống</h2>
        <Link href="/" className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700">← Quay lại mua sắm</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 font-sans pt-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-800 mb-8 border-l-4 border-blue-600 pl-4">Thanh toán</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* CỘT TRÁI: DANH SÁCH HÀNG (7 phần) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4 pb-4 border-b">
                <h2 className="text-xl font-bold text-gray-700">1. Giỏ hàng</h2>
                <label className="flex items-center space-x-2 text-sm text-blue-600 cursor-pointer select-none">
                  <input type="checkbox" checked={selectedItems.length === cart.length} onChange={handleSelectAll} className="w-4 h-4" />
                  <span>Chọn tất cả ({cart.length})</span>
                </label>
              </div>

              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-4 border-b pb-4 items-start">
                    <div className="pt-8">
                      <input type="checkbox" checked={selectedItems.includes(item.id)} onChange={() => handleToggleItem(item.id)} className="w-5 h-5 cursor-pointer accent-blue-600" />
                    </div>
                    <div className="w-20 h-20 border rounded overflow-hidden flex-shrink-0 bg-white">
                      <img src={item.img || item.image_url || "https://via.placeholder.com/150"} alt={item.title} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-sm md:text-base line-clamp-2 mb-1 text-gray-800">{item.title || item.name}</h3>
                      <p className="text-blue-600 font-bold mb-2">{item.price.toLocaleString("vi-VN")}đ</p>
                      <div className="flex items-center">
                        <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1} className="w-8 h-8 flex items-center justify-center border rounded-l bg-gray-100 hover:bg-gray-200">-</button>
                        <span className="w-10 h-8 flex items-center justify-center border-t border-b font-bold text-sm">{item.quantity}</span>
                        <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center border rounded-r bg-gray-100 hover:bg-gray-200">+</button>
                        <button onClick={() => removeFromCart(item.id)} className="text-red-500 text-xs hover:underline ml-auto">Xóa</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: FORM & THANH TOÁN (5 phần) */}
          <div className="lg:col-span-5">
            <div className="bg-white p-6 rounded-lg shadow sticky top-4">
              <h2 className="text-xl font-bold text-gray-700 mb-4 border-b pb-2">2. Thông tin & Thanh toán</h2>

              <form onSubmit={handleOrder} className="space-y-4">
                {/* --- Form Nhập liệu --- */}
                <div className="grid grid-cols-1 gap-4">
                  <input required name="fullName" type="text" placeholder="Họ và tên" className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50" />
                  <input required name="phone" type="tel" placeholder="Số điện thoại" className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50" />
                  <textarea required name="address" rows={2} placeholder="Địa chỉ nhận hàng cụ thể" className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"></textarea>
                  <textarea name="note" rows={1} placeholder="Ghi chú (nếu có)" className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"></textarea>
                </div>

                {/* --- [MỚI] KHU VỰC NHẬP MÃ GIẢM GIÁ --- */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-dashed border-blue-300">
                  <h3 className="font-bold text-gray-700 mb-2 text-sm">🎫 Mã khuyến mãi:</h3>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Nhập mã giảm giá" 
                      className="flex-1 p-2 border rounded text-sm uppercase font-bold"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                    />
                    <button 
                      type="button" 
                      onClick={checkCoupon}
                      className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-blue-700"
                    >
                      Áp dụng
                    </button>
                  </div>
                  {couponMessage.text && (
                    <p className={`text-xs mt-2 font-bold ${couponMessage.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                      {couponMessage.text}
                    </p>
                  )}
                </div>

                {/* --- Chọn Phương thức thanh toán --- */}
                <div className="mt-6">
                  <h3 className="font-bold text-gray-700 mb-3">Phương thức thanh toán:</h3>
                  <div className="space-y-3">
                    {paymentMethods.map((method) => (
                      <label key={method.id} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition ${paymentMethod === method.id ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600" : "hover:bg-gray-50"}`}>
                        <input type="radio" name="paymentMethod" value={method.id} checked={paymentMethod === method.id} onChange={(e) => setPaymentMethod(e.target.value)} className="w-4 h-4 text-blue-600 accent-blue-600" />
                        <span className="text-xl">{method.icon}</span>
                        <span className="text-sm font-medium text-gray-700">{method.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* --- [SỬA] TỔNG TIỀN HIỂN THỊ --- */}
                <div className="mt-6 pt-4 border-t space-y-2">
                   <div className="flex justify-between items-center text-sm text-gray-500">
                     <span>Tạm tính:</span>
                     <span>{subTotal.toLocaleString("vi-VN")}đ</span>
                   </div>
                   
                   {discountAmount > 0 && (
                     <div className="flex justify-between items-center text-sm text-green-600 font-bold">
                       <span>Giảm giá ({appliedCoupon?.code}):</span>
                       <span>-{discountAmount.toLocaleString("vi-VN")}đ</span>
                     </div>
                   )}

                   <div className="flex justify-between items-center pt-2 border-t border-dashed">
                    <span className="font-bold text-gray-600">Tổng thanh toán:</span>
                    <span className="text-2xl font-bold text-red-600">{finalAmount.toLocaleString("vi-VN")}đ</span>
                  </div>
                </div>

                {/* Nút Đặt hàng */}
                <button type="submit" disabled={loading || selectedItems.length === 0} className={`w-full text-white font-bold py-4 rounded-lg transition shadow-lg mt-4 ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"}`}>
                  {loading ? "ĐANG XỬ LÝ..." : `THANH TOÁN NGAY`}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}