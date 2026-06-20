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

const ProductItem = ({ product }: { product: Product }) => (
  <Link
    href={`/product/${product.id}`}
    className="block group bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-lg transition overflow-hidden"
  >
    <div className="relative w-full aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
      {product.discount && (
        <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] px-2 py-1 rounded font-bold z-10">
          {product.discount}
        </span>
      )}
      {product.img ? (
        <img
          src={getThumbnail(product.img)}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      ) : (
        <span className="text-4xl">📦</span>
      )}
    </div>
    <div className="p-4">
      <h3 className="font-bold text-gray-800 text-sm line-clamp-2 mb-2 min-h-[40px] group-hover:text-blue-700 transition-colors">
        {product.title}
      </h3>
      <div className="flex items-baseline gap-2">
        <span className="text-blue-600 font-bold text-lg">
          {product.price?.toLocaleString("vi-VN")}đ
        </span>
        {product.old_price && (
          <span className="text-gray-400 text-xs line-through">
            {product.old_price.toLocaleString("vi-VN")}đ
          </span>
        )}
      </div>
    </div>
  </Link>
);

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
