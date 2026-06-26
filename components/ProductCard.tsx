"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image"; // Thêm thư viện Image tối ưu của Next.js
import { useCart } from "@/context/CartContext";

interface ProductProps {
  product: {
    id: number;
    title: string;
    price: number | string;
    img: string;
    unit?: string;
    specification?: string;
    category?: string;
    is_prescription?: boolean;
    conversion_units?: any;
    sku?: string;
  };
}

const ProductCard: React.FC<ProductProps> = ({ product }) => {
  const { addToCart } = useCart();
  const isRx = product.category === "Thuốc" && product.is_prescription;

  // --- LOGIC QUY ĐỔI ĐƠN VỊ ---
  const [selectedUnit, setSelectedUnit] = React.useState<any>(null);

  const units = React.useMemo(() => {
    let result = [];
    // Thêm đơn vị gốc
    result.push({
      unit_name: product.unit || "Đơn vị",
      price: product.price,
      quantity: 1,
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

  // Khởi tạo unit mặc định (thường là đơn vị nhỏ nhất hoặc đơn vị đầu tiên)
  React.useEffect(() => {
    if (units.length > 0 && !selectedUnit) {
      // Ưu tiên chọn đơn vị có giá thấp nhất (thường là 'Viên') hoặc đơn vị cuối cùng trong mảng nếu được sắp xếp
      setSelectedUnit(units[units.length - 1]);
    }
  }, [units, selectedUnit]);

  const currentPrice = selectedUnit ? selectedUnit.price : product.price;
  const currentUnitName = selectedUnit ? selectedUnit.unit_name : product.unit;

  const getThumbnail = (imgData: string) => {
    if (!imgData) return "https://via.placeholder.com/150";
    try {
      const parsed = JSON.parse(imgData);
      return Array.isArray(parsed) ? parsed[0] : imgData;
    } catch {
      return imgData;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-shadow duration-300 p-4 flex flex-col h-full relative group">
      <Link href={`/product/${product.id}`} className="block mb-3">
        <div className="w-full aspect-square relative flex items-center justify-center overflow-hidden rounded-lg cursor-pointer bg-white">
          {isRx && (
            <div className="absolute top-2 left-2 z-10">
              <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm flex items-center gap-1">
                Rx
              </span>
            </div>
          )}
          <Image
            src={getThumbnail(product.img)}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="object-contain group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </Link>

      <Link href={`/product/${product.id}`} className="block mb-2">
        <h3
          className="text-gray-900 font-semibold text-sm leading-tight line-clamp-2 min-h-[40px] hover:text-blue-600 transition-colors cursor-pointer"
          title={product.title}
        >
          {product.title}
        </h3>
      </Link>

      <div className="flex flex-col gap-1 mb-3">
        {isRx ? (
          <span className="text-gray-500 text-sm">Cần tư vấn từ dược sĩ</span>
        ) : (
          <>
            {/* Bộ chọn đơn vị (nếu có multiple units) */}
            {units.length > 1 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {units.map((u: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedUnit(u);
                    }}
                    className={`px-3 py-1 text-[11px] font-medium rounded-md border transition-all ${
                      selectedUnit?.unit_name === u.unit_name
                        ? "border-blue-600 bg-blue-50 text-blue-600 shadow-sm"
                        : "border-gray-200 bg-gray-50 text-gray-500 hover:border-blue-300"
                    }`}
                  >
                    {u.unit_name}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-end gap-1">
              <span className="text-blue-600 font-bold text-lg">
                {Number(currentPrice).toLocaleString("vi-VN")}đ
              </span>
              {currentUnitName && (
                <span className="text-gray-500 text-xs mb-[2px]">
                  / {currentUnitName}
                </span>
              )}
            </div>
          </>
        )}
      </div>

      <div className="mb-4">
        {product.specification ? (
          <div className="bg-gray-100 text-gray-500 text-[10px] px-2 py-0.5 rounded border border-gray-200 inline-block font-medium">
            {product.specification}
          </div>
        ) : (
          <div className="h-[20px]"></div>
        )}
      </div>

      {isRx ? (
        <a
          href="https://zalo.me/0988991837"
          target="_blank"
          rel="noreferrer"
          className="mt-auto w-full bg-blue-50 text-blue-600 font-bold py-2 rounded-full hover:bg-blue-100 transition-colors text-xs text-center border border-blue-100"
        >
          Tư vấn ngay
        </a>
      ) : (
        <button
          className="mt-auto w-full bg-blue-600 text-white font-bold py-2 rounded-full hover:bg-blue-700 transition-colors text-xs shadow-md shadow-blue-100 active:scale-95 transition-transform"
          onClick={() =>
            addToCart({
              ...product,
              price: currentPrice,
              unit: currentUnitName,
              sku: selectedUnit?.sku || product.sku,
            })
          }
        >
          Chọn mua
        </button>
      )}
    </div>
  );
};

export default ProductCard;
