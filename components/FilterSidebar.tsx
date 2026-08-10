"use client";

import React, { useState } from "react";

interface FilterSidebarProps {
  onFilterChange: (filters: {
    category: string;
    minPrice: string;
    maxPrice: string;
    usageType: string;
  }) => void;
  categories: string[];
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  onFilterChange,
  categories,
}) => {
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [usageType, setUsageType] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterChange = () => {
    onFilterChange({
      category: selectedCategory,
      minPrice,
      maxPrice,
      usageType,
    });
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    onFilterChange({
      category,
      minPrice,
      maxPrice,
      usageType,
    });
  };

  const handlePriceChange = () => {
    handleFilterChange();
  };

  const handleClearFilters = () => {
    setSelectedCategory("Tất cả");
    setMinPrice("");
    setMaxPrice("");
    setUsageType("");
    onFilterChange({
      category: "Tất cả",
      minPrice: "",
      maxPrice: "",
      usageType: "",
    });
  };

  return (
    <aside className="w-full lg:w-64 bg-white rounded-xl border border-gray-200 p-3 lg:p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 lg:mb-6">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full lg:w-auto flex items-center justify-between gap-2 text-blue-700 font-bold px-3 py-2.5 rounded-xl bg-blue-50 border border-blue-100 lg:bg-transparent lg:border-0 lg:px-0 lg:py-0"
        >
          <span className="flex items-center gap-2">
            <span>☰</span>
            <span>Bộ lọc nâng cao</span>
          </span>
          <span className="lg:hidden text-blue-500 text-sm">
            {isOpen ? "▲" : "▼"}
          </span>
        </button>
        <h2 className="hidden lg:block font-bold text-lg text-gray-800">
          Bộ lọc nâng cao
        </h2>
      </div>

      {/* Filters Container */}
      <div className={`space-y-5 lg:space-y-6 ${isOpen ? "block" : "hidden"} lg:block`}>
        {/* Danh mục sản phẩm */}
        <div>
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span>📁</span> Danh mục sản phẩm
          </h3>
          <div className="space-y-2">
            {["Tất cả", ...categories].map((category) => (
              <label
                key={category}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg border border-transparent hover:border-gray-100"
              >
                <input
                  type="radio"
                  name="category"
                  value={category}
                  checked={selectedCategory === category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-gray-700">{category}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Giá bán */}
        <div className="border-t pt-4">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span>💰</span> Giá bán
          </h3>
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Từ (đ)"
                value={minPrice}
                onChange={(e) => {
                  setMinPrice(e.target.value);
                  handlePriceChange();
                }}
                className="flex-1 px-3 py-2 border border-gray-200 rounded text-sm"
              />
              <span className="text-gray-400">—</span>
              <input
                type="number"
                placeholder="Đến (đ)"
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(e.target.value);
                  handlePriceChange();
                }}
                className="flex-1 px-3 py-2 border border-gray-200 rounded text-sm"
              />
            </div>
          </div>

          {/* Price Range Presets */}
          <div className="mt-3 space-y-2">
            {[
              { label: "Dưới 100.000đ", min: "", max: "100000" },
              { label: "100.000đ - 300.000đ", min: "100000", max: "300000" },
              { label: "300.000đ - 500.000đ", min: "300000", max: "500000" },
              { label: "Trên 500.000đ", min: "500000", max: "" },
            ].map((range) => (
              <button
                key={range.label}
                onClick={() => {
                  setMinPrice(range.min);
                  setMaxPrice(range.max);
                  onFilterChange({
                    category: selectedCategory,
                    minPrice: range.min,
                    maxPrice: range.max,
                    usageType,
                  });
                }}
                className="block w-full text-left px-3 py-2.5 text-sm border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition"
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Đối tượng sử dụng */}
        <div className="border-t pt-4">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span>👥</span> Đối tượng sử dụng
          </h3>
          <div className="space-y-2">
            {[
              { label: "Trẻ em", value: "child" },
              { label: "Người cao tuổi", value: "elderly" },
              { label: "Người lớn", value: "adult" },
              { label: "Phụ nữ có thai", value: "pregnant" },
            ].map((usage) => (
              <label
                key={usage.value}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg border border-transparent hover:border-gray-100"
              >
                <input
                  type="radio"
                  name="usageType"
                  value={usage.value}
                  checked={usageType === usage.value}
                  onChange={(e) => {
                    setUsageType(e.target.value);
                    onFilterChange({
                      category: selectedCategory,
                      minPrice,
                      maxPrice,
                      usageType: e.target.value,
                    });
                  }}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-gray-700">{usage.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Clear Filters */}
        <button
          onClick={handleClearFilters}
          className="w-full px-4 py-2.5 bg-gray-100 text-gray-800 rounded-xl font-medium hover:bg-gray-200 transition border-t"
        >
          🔄 Xóa bộ lọc
        </button>
      </div>
    </aside>
  );
};

export default FilterSidebar;
