"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useCart } from "@/context/CartContext";

interface ProductInfoActionProps {
  product: any;
  isRx: boolean;
  isFlashSaleActive: boolean;
}

export default function ProductInfoAction({
  product,
  isRx,
  isFlashSaleActive,
}: ProductInfoActionProps) {
  const { addToCart } = useCart();
  const [selectedUnit, setSelectedUnit] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);

  const units = useMemo(() => {
    let result = [];
    // Base unit
    result.push({
      unit_name: product.unit || "Đơn vị",
      price: product.price,
      old_price: product.old_price,
      sku: product.sku,
      is_base: true,
    });

    if (product.conversion_units) {
      try {
        const parsed =
          typeof product.conversion_units === "string"
            ? JSON.parse(product.conversion_units)
            : product.conversion_units;
        if (Array.isArray(parsed)) {
          result = [...result, ...parsed];
        }
      } catch (e) {
        console.error("Lỗi parse conversion_units:", e);
      }
    }
    return result;
  }, [product]);

  useEffect(() => {
    if (units.length > 0 && !selectedUnit) {
      // Default to the last unit (usually smallest unit like 'Viên') if multiple exist,
      // otherwise first unit. In Long Chau it defaults to largest unit usually?
      // Let's default to the base unit (first one) or smallest.
      // Looking at the image, 'Viên' is selected, which is often the last added or smallest.
      setSelectedUnit(units[units.length - 1]);
    }
  }, [units, selectedUnit]);

  const currentPrice = selectedUnit ? selectedUnit.price : product.price;
  const currentOldPrice = selectedUnit
    ? selectedUnit.old_price
    : product.old_price;
  const currentUnitName = selectedUnit ? selectedUnit.unit_name : product.unit;

  const handleAddToCart = () => {
    addToCart({
      ...product,
      price: currentPrice,
      unit: currentUnitName,
      sku: selectedUnit?.sku || product.sku,
      quantity: quantity,
    });
  };

  if (isRx) {
    return (
      <div className="bg-blue-50 p-6 rounded-xl mb-6 border border-blue-100 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center gap-3 text-blue-800">
          <span className="text-3xl">👨‍⚕️</span>
          <span className="text-xl font-bold uppercase tracking-tight">
            Cần dược sĩ tư vấn
          </span>
        </div>
        <p className="text-sm text-blue-600 mt-2 font-medium">
          Sản phẩm này là thuốc kê đơn. Quý khách vui lòng liên hệ dược sĩ qua
          Zalo hoặc Hotline để được tư vấn kĩ hơn.
        </p>
        <div className="mt-4 flex gap-3">
          <a
            href="https://zalo.me/0988991837"
            target="_blank"
            className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-full text-center hover:bg-blue-700 shadow-lg shadow-blue-200"
          >
            Nhắn Zalo tư vấn
          </a>
          <a
            href="tel:0988991837"
            className="flex-1 bg-white border-2 border-blue-600 text-blue-600 font-bold py-3 rounded-full text-center hover:bg-blue-50"
          >
            Gọi Tổng đài
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Unit Selector */}
      {units.length > 1 && (
        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
            Chọn đơn vị tính:
          </label>
          <div className="flex flex-wrap gap-2">
            {units.map((u: any, idx: number) => (
              <button
                key={idx}
                onClick={() => setSelectedUnit(u)}
                className={`px-5 py-2.5 rounded-xl border-2 transition-all font-bold text-sm ${
                  selectedUnit?.unit_name === u.unit_name
                    ? "border-blue-600 bg-blue-50 text-blue-600 shadow-md ring-2 ring-blue-100"
                    : "border-gray-100 bg-gray-50 text-gray-500 hover:border-blue-300"
                }`}
              >
                {u.unit_name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Price Display */}
      {isFlashSaleActive ? (
        <div className="mb-6 bg-gradient-to-br from-red-600 to-orange-500 rounded-2xl p-5 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-[-10px] right-[-10px] opacity-20 text-7xl pointer-events-none select-none">
            ⚡
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-black text-yellow-300 uppercase tracking-widest text-xs">
              ⚡ FLASH SALE ĐANG DIỄN RA
            </span>
          </div>
          <div className="flex items-end gap-3 flex-wrap">
            <span className="text-4xl md:text-5xl font-black text-white drop-shadow-sm">
              {Number(product.flash_sale_price).toLocaleString("vi-VN")}đ
            </span>
            <span className="text-white/70 text-lg line-through mb-1.5 decoration-white/50">
              {Number(currentPrice).toLocaleString("vi-VN")}đ
            </span>
          </div>
          <div className="mt-2 text-white/90 text-xs font-semibold">
            Đơn vị: {currentUnitName}
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 p-6 rounded-2xl mb-6 border border-gray-100 shadow-inner">
          <div className="flex items-end gap-3 flex-wrap">
            <span className="text-4xl md:text-5xl font-extrabold text-blue-800">
              {Number(currentPrice).toLocaleString("vi-VN")}đ
            </span>
            {currentOldPrice &&
              Number(currentOldPrice) > Number(currentPrice) && (
                <span className="text-gray-400 text-xl line-through mb-1.5 font-medium">
                  {Number(currentOldPrice).toLocaleString("vi-VN")}đ
                </span>
              )}
            <span className="text-blue-500 font-bold mb-2 ml-1 text-lg">
              / {currentUnitName}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-2 italic">
            * Giá đã bao gồm thuế (nếu có). Giá có thể thay đổi theo từng thời
            điểm.
          </p>
        </div>
      )}

      {/* Quantity & Add to Cart */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        {/* Quantity Selector */}
        <div className="flex items-center border-2 border-gray-200 rounded-full h-[54px] w-full md:w-32 justify-between px-2 bg-white shadow-sm overflow-hidden">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-full transition font-bold"
          >
            -
          </button>
          <span className="font-bold text-lg text-gray-800">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-full transition font-bold"
          >
            +
          </button>
        </div>

        <div className="flex-1 w-full flex gap-3">
          <button
            onClick={handleAddToCart}
            className="flex-1 bg-white border-2 border-blue-600 text-blue-600 font-bold py-3.5 rounded-full hover:bg-blue-50 transition shadow-md shadow-blue-50 active:scale-95"
          >
            Thêm vào giỏ
          </button>
          <button
            onClick={handleAddToCart}
            className="flex-1 bg-blue-600 text-white font-bold py-3.5 rounded-full hover:bg-blue-700 shadow-xl shadow-blue-200 transition active:scale-95"
          >
            Chọn mua
          </button>
        </div>
      </div>
    </div>
  );
}
