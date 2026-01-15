"use client";
import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AddCouponPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form State
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState("fixed"); // 'fixed' | 'percent'
  const [discountValue, setDiscountValue] = useState(0);
  const [minOrder, setMinOrder] = useState(0);
  
  // --- [MỚI] THÊM STATE LIMIT PER USER ---
  const [limitPerUser, setLimitPerUser] = useState(1); // Mặc định 1 người dùng 1 lần
  const [usageLimit, setUsageLimit] = useState(100);   // Tổng số lượt toàn hệ thống
  const [expiryDate, setExpiryDate] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!code) {
        alert("Vui lòng nhập mã Code!");
        setLoading(false);
        return;
    }

    if (discountType === "percent" && discountValue > 100) {
        alert("Giảm giá phần trăm không được quá 100%!");
        setLoading(false);
        return;
    }

    const newCoupon = {
        code: code.toUpperCase().trim(),
        discount_type: discountType,
        discount_value: discountValue,
        min_order_value: minOrder,
        usage_limit: usageLimit,
        limit_per_user: limitPerUser, // [MỚI] Gửi thêm trường này
        expiry_date: expiryDate ? new Date(expiryDate).toISOString() : null,
        is_active: true,
        used_count: 0
    };

    const { error } = await supabase.from("coupons").insert([newCoupon]);

    if (error) {
        if(error.code === '23505') alert("❌ Mã này đã tồn tại! Vui lòng chọn mã khác.");
        else alert("Lỗi tạo mã: " + error.message);
    } else {
        alert("✅ Tạo mã giảm giá thành công!");
        router.push("/admin/coupons");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="max-w-3xl mx-auto">
        <Link href="/admin/coupons" className="text-gray-500 hover:text-blue-600 mb-6 inline-block">
          ← Quay lại danh sách
        </Link>
        
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-blue-600 p-6">
                <h1 className="text-2xl font-bold text-white">🎁 Tạo Chương Trình Khuyến Mãi</h1>
                <p className="text-blue-100 text-sm mt-1">Thiết lập mã giảm giá cho khách hàng</p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                
                {/* 1. Mã Code */}
                <div>
                    <label className="block text-gray-700 font-bold mb-2">Mã Coupon (Code)</label>
                    <input 
                        type="text" 
                        required
                        className="w-full p-4 border border-gray-300 rounded-lg text-lg font-bold uppercase tracking-widest text-blue-800 focus:ring-2 focus:ring-blue-500 outline-none placeholder:font-normal placeholder:normal-case placeholder:tracking-normal"
                        placeholder="Ví dụ: TET2025, SALE50..."
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1">Khách hàng sẽ nhập mã này khi thanh toán.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 2. Loại giảm giá */}
                    <div>
                        <label className="block text-gray-700 font-bold mb-2">Loại giảm giá</label>
                        <select 
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            value={discountType}
                            onChange={(e) => setDiscountType(e.target.value)}
                        >
                            <option value="fixed">💲 Giảm theo số tiền (VNĐ)</option>
                            <option value="percent">% Giảm theo phần trăm</option>
                        </select>
                    </div>

                    {/* 3. Giá trị giảm */}
                    <div>
                        <label className="block text-gray-700 font-bold mb-2">Giá trị giảm</label>
                        <div className="relative">
                            <input 
                                type="number" 
                                required
                                min="0"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none pl-4"
                                value={discountValue}
                                onChange={(e) => setDiscountValue(Number(e.target.value))}
                            />
                            <span className="absolute right-4 top-3 text-gray-500 font-bold">
                                {discountType === 'percent' ? '%' : 'đ'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 4. Điều kiện đơn tối thiểu */}
                <div>
                    <label className="block text-gray-700 font-bold mb-2">Đơn hàng tối thiểu để áp dụng (VNĐ)</label>
                    <input 
                        type="number" 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={minOrder}
                        onChange={(e) => setMinOrder(Number(e.target.value))}
                    />
                    <p className="text-xs text-gray-500 mt-1">Nhập 0 nếu muốn áp dụng cho mọi đơn hàng.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 5. Giới hạn Tổng lượt dùng (Toàn hệ thống) */}
                    <div>
                        <label className="block text-gray-700 font-bold mb-2">Tổng số lượng mã phát ra</label>
                        <input 
                            type="number" 
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={usageLimit}
                            onChange={(e) => setUsageLimit(Number(e.target.value))}
                        />
                         <p className="text-xs text-gray-500 mt-1">Ví dụ: Chỉ cho 100 người nhanh tay nhất.</p>
                    </div>

                    {/* --- [MỚI] 6. Giới hạn lượt dùng mỗi khách --- */}
                    <div>
                        <label className="block text-blue-800 font-bold mb-2">Giới hạn mỗi khách (Lần)</label>
                        <input 
                            type="number" 
                            min="1"
                            className="w-full p-3 border-2 border-blue-100 bg-blue-50 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold text-blue-900"
                            value={limitPerUser}
                            onChange={(e) => setLimitPerUser(Number(e.target.value))}
                        />
                        <p className="text-xs text-gray-500 mt-1">Một tài khoản/SĐT được dùng mã này mấy lần?</p>
                    </div>
                </div>

                {/* 7. Hạn sử dụng */}
                <div>
                    <label className="block text-gray-700 font-bold mb-2">Hạn sử dụng (Ngày hết hạn)</label>
                    <input 
                        type="datetime-local" 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-600"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                    />
                     <p className="text-xs text-gray-500 mt-1">Bỏ trống nếu muốn mã vĩnh viễn.</p>
                </div>

                <hr className="my-4"/>

                <div className="flex justify-end gap-4">
                    <Link 
                        href="/admin/coupons"
                        className="px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300"
                    >
                        Hủy bỏ
                    </Link>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="px-8 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 shadow-md transition transform active:scale-95"
                    >
                        {loading ? "Đang tạo..." : "✅ Xác Nhận Tạo Mã"}
                    </button>
                </div>

            </form>
        </div>
      </div>
    </div>
  );
}