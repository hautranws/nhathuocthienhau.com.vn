"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import FilterSidebar from "./FilterSidebar";

interface Product {
  id: number;
  title: string;
  price: number;
  old_price?: number;
  img?: string;
  discount?: string;
  category: string;
  is_prescription?: boolean;
  unit?: string;
  specification?: string;
  conversion_units?: string | any;
}

const getThumbnail = (imgData: string) => {
  if (!imgData) return "https://via.placeholder.com/150";
  try {
    const parsed = JSON.parse(imgData);
    return Array.isArray(parsed) ? parsed[0] : imgData;
  } catch {
    return imgData;
  }
};

const ProductItem = ({ product }: { product: Product }) => {
  const isRx = product.category === "Thuốc" && product.is_prescription;

  // --- LOGIC QUY ĐỔI ĐƠN VỊ ---
  const [selectedUnit, setSelectedUnit] = React.useState<any>(null);

  const units = React.useMemo(() => {
    let result = [];
    result.push({
      unit_name: product.unit || "Đơn vị",
      price: product.price,
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
      } catch (e) {}
    }
    return result;
  }, [product]);

  React.useEffect(() => {
    if (units.length > 0 && !selectedUnit) {
      setSelectedUnit(units[units.length - 1]);
    }
  }, [units, selectedUnit]);

  const currentPrice = selectedUnit ? selectedUnit.price : product.price;
  const currentUnitName = selectedUnit ? selectedUnit.unit_name : product.unit;

  return (
    <div className="bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-lg transition overflow-hidden h-full flex flex-col p-3 relative group">
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative w-full aspect-square bg-white flex items-center justify-center overflow-hidden rounded-lg">
          {isRx && (
            <div className="absolute top-2 left-2 z-10">
              <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                Rx
              </span>
            </div>
          )}
          {product.discount && !isRx && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] px-2 py-1 rounded font-bold z-10">
              {product.discount}
            </span>
          )}
          {product.img ? (
            <img
              src={getThumbnail(product.img)}
              alt={product.title}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <span className="text-4xl">📦</span>
          )}
        </div>
      </Link>

      <div className="pt-3 flex flex-col flex-1">
        <Link href={`/product/${product.id}`} className="block mb-2">
          <h3 className="font-bold text-gray-800 text-sm line-clamp-2 min-h-[40px] group-hover:text-blue-700 transition-colors">
            {product.title}
          </h3>
        </Link>

        {/* Bộ chọn đơn vị */}
        {!isRx && units.length > 1 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {units.map((u: any, idx: number) => (
              <button
                key={idx}
                onClick={() => setSelectedUnit(u)}
                className={`px-2 py-0.5 text-[10px] font-bold rounded border transition-all ${
                  selectedUnit?.unit_name === u.unit_name
                    ? "border-blue-600 bg-blue-50 text-blue-600"
                    : "border-gray-100 bg-gray-50 text-gray-400"
                }`}
              >
                {u.unit_name}
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-1 mb-3">
          {isRx ? (
            <span className="text-gray-500 text-xs mt-auto">
              Cần tư vấn từ dược sĩ
            </span>
          ) : (
            <div className="flex items-baseline gap-2 mt-auto">
              <span className="text-blue-600 font-bold text-lg">
                {Number(currentPrice).toLocaleString("vi-VN")}đ
              </span>
              <span className="text-gray-400 text-[10px]">
                / {currentUnitName}
              </span>
            </div>
          )}
        </div>

        {product.specification && (
          <div className="mb-3">
            <span className="bg-gray-100 text-gray-500 text-[9px] px-1.5 py-0.5 rounded border border-gray-200">
              {product.specification}
            </span>
          </div>
        )}

        {isRx ? (
          <a
            href="https://zalo.me/0988991837"
            target="_blank"
            className="w-full bg-blue-50 text-blue-600 font-bold py-2 rounded-full text-xs text-center border border-blue-100 mt-auto"
          >
            Tư vấn ngay
          </a>
        ) : (
          <button
            className="w-full bg-blue-600 text-white font-bold py-2 rounded-full text-xs text-center mt-auto active:scale-95 transition-transform"
            onClick={() => {
              /* handle click */
            }}
          >
            Chọn mua
          </button>
        )}
      </div>
    </div>
  );
};

interface SearchClientProps {
  initialQuery: string;
  initialProducts: Product[];
  allCategories: string[];
}

const SearchClient: React.FC<SearchClientProps> = ({
  initialQuery,
  initialProducts,
  allCategories,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    category: "Tất cả",
    minPrice: "",
    maxPrice: "",
    usageType: "",
  });

  // Fetch products khi filter thay đổi
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.append("q", query);
      if (filters.category && filters.category !== "Tất cả") {
        params.append("category", filters.category);
      }
      if (filters.minPrice) params.append("minPrice", filters.minPrice);
      if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
      if (filters.usageType) params.append("usageType", filters.usageType);

      const response = await fetch(`/api/search?${params.toString()}`);
      const data = await response.json();

      if (data.products) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }, [query, filters]);

  useEffect(() => {
    // Debounce: chỉ fetch khi filter thay đổi
    const timer = setTimeout(() => {
      fetchProducts();
    }, 500);

    return () => clearTimeout(timer);
  }, [fetchProducts]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Results Header */}
      <div className="mb-6">
        <p className="text-gray-500 text-sm mb-1">Kết quả tìm kiếm cho:</p>
        <h1 className="text-3xl font-bold text-blue-800 uppercase">
          &quot;{query}&quot;
        </h1>
        <p className="text-gray-600 text-sm mt-2">
          Tìm thấy {products.length} sản phẩm
        </p>
      </div>

      {/* Main Layout: Filter Sidebar + Products Grid */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Filter */}
        <FilterSidebar categories={allCategories} onFilterChange={setFilters} />

        {/* Products Grid */}
        <div className="flex-1">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block animate-spin">⏳</div>
                <p className="text-gray-600 mt-2">Đang lọc sản phẩm...</p>
              </div>
            </div>
          )}

          {!loading && products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductItem key={product.id} product={product} />
              ))}
            </div>
          ) : (
            !loading && (
              <div className="text-center py-16 bg-white rounded-lg border border-dashed border-gray-300">
                <div className="text-6xl mb-4">🔍</div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  Không tìm thấy sản phẩm nào
                </h2>
                <p className="text-gray-500 mb-6">
                  Rất tiếc, chúng tôi không tìm thấy sản phẩm phù hợp với tiêu
                  chí tìm kiếm của bạn.
                </p>
                <Link
                  href="/"
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  ← Quay về trang chủ
                </Link>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchClient;
