import React from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import CategoryClient from "@/components/CategoryClient";

export const revalidate = 60;

// 1. Import dữ liệu để tra cứu tên hiển thị (Title) từ Mã (Key)
import {
  TPCN_DATA,
  DMP_DATA,
  CSCN_DATA,
  TBYT_DATA,
  THUOC_DATA,
} from "@/components/data";

// Gộp tất cả dữ liệu lại để dễ tìm kiếm
const ALL_DATA: any = {
  ...THUOC_DATA,
  ...TPCN_DATA,
  ...DMP_DATA,
  ...CSCN_DATA,
  ...TBYT_DATA,
};

// BẢN ĐỒ ÁNH XẠ TÊN DANH MỤC SANG DỮ LIỆU GỐC
const DATA_BY_CATEGORY: Record<string, any> = {
  Thuốc: THUOC_DATA,
  "Thực phẩm chức năng": TPCN_DATA,
  "Dược mỹ phẩm": DMP_DATA,
  "Chăm sóc cá nhân": CSCN_DATA,
  "Thiết bị y tế": TBYT_DATA,
};

export default async function CategoryPage(props: {
  params: Promise<{ name: string }>;
  searchParams: Promise<{ sub?: string; group?: string; child?: string }>;
}) {
  // 1. Lấy dữ liệu từ đường dẫn
  const params = await props.params;
  const searchParams = await props.searchParams;

  // Giải mã tên danh mục cấp 1
  const categoryName = decodeURIComponent(params.name);

  // Lấy key từ URL
  const groupKey = searchParams.group;
  const subKey = searchParams.sub;
  const childKey = searchParams.child;

  // --- LOGIC DỊCH MÃ THÀNH TÊN HIỂN THỊ ---
  let groupTitle = "";
  let subTitle = "";
  let childTitle = "";
  let subCategories: any[] = [];
  let childCategories: any[] = [];

  // Tìm tên nhóm (Cấp 2)
  if (groupKey && ALL_DATA[groupKey]) {
    groupTitle = ALL_DATA[groupKey].title;
    subCategories = ALL_DATA[groupKey].items || [];
  }

  // Tìm tên mục con (Cấp 3)
  if (groupKey && subKey && ALL_DATA[groupKey]) {
    const foundItem = ALL_DATA[groupKey].items.find(
      (item: any) => item.sub === subKey,
    );
    if (foundItem) {
      subTitle = foundItem.title;
      if (foundItem.children) {
        childCategories = foundItem.children;
      }
    } else {
      subTitle = decodeURIComponent(subKey);
    }
  }

  // Lấy Child (Cấp 4)
  if (childCategories.length > 0 && childKey) {
    const foundChild = childCategories.find((c: any) => c.sub === childKey);
    if (foundChild) {
      childTitle = foundChild.title;
    }
  }

  // --- LOGIC CHUẨN BỊ DỮ LIỆU GRID ---
  let gridItems: any[] = [];
  let gridTitle = "";
  let isSpecialGrid = false;
  let isChildGrid = false;

  if (!groupKey) {
    const currentData = DATA_BY_CATEGORY[categoryName];
    if (currentData) {
      const keys = Object.keys(currentData);
      gridTitle = `Danh mục ${categoryName}`;

      if (keys.length === 1 && currentData[keys[0]].items) {
        gridItems = currentData[keys[0]].items;
        isSpecialGrid = true;
      } else {
        gridItems = Object.entries(currentData).map(([key, value]: any) => ({
          key: key,
          title: value.title,
          sticker: value.icon || "📦",
          count: value.items ? value.items.length + " nhóm" : "Nhiều sản phẩm",
        }));
      }
    }
  } else if (subKey && childCategories.length > 0 && !childKey) {
    gridItems = childCategories;
    gridTitle = subTitle;
    isChildGrid = true;
  }

  // --- LẤY DỮ LIỆU TỪ SUPABASE ---
  let supabaseQuery = supabase
    .from("products")
    .select(
      "id, title, price, img, unit, discount, old_price, category, sub_category, is_prescription",
    )
    .eq("category", categoryName); // Dùng .eq thay vì .ilike %...% để tránh timeout

  // Nếu có childTitle (ưu tiên cao nhất)
  if (childTitle) {
    supabaseQuery = supabaseQuery.ilike("sub_category", `%${childTitle}%`);
  }
  // Nếu có subTitle
  else if (subTitle) {
    supabaseQuery = supabaseQuery.ilike("sub_category", `%${subTitle}%`);
  }
  // Nếu chỉ có group (ví dụ "Hỗ trợ tiêu hóa")
  else if (subCategories.length > 0) {
    // Tạo chuỗi OR filter cho các sub_category trong nhóm
    const orFilter = subCategories
      .map((item) => `sub_category.ilike.%${item.title}%`)
      .join(",");
    supabaseQuery = supabaseQuery.or(orFilter);
  }

  const { data: allProducts, error } = await supabaseQuery.limit(500);

  if (error) {
    console.error("Lỗi Supabase:", error.message);
  }

  let finalProducts = allProducts || [];

  // --- [QUAN TRỌNG] XỬ LÝ ẢNH TRƯỚC KHI LỌC ---
  // Chuyển đổi chuỗi JSON ảnh thành link ảnh đơn giản
  finalProducts = finalProducts.map((p) => {
    let displayImage = p.img;
    try {
      // Nếu ảnh là chuỗi JSON mảng ["link1", "link2"] -> Lấy link1
      if (p.img && p.img.startsWith("[")) {
        const parsed = JSON.parse(p.img);
        displayImage = parsed[0];
      }
    } catch (e) {
      // Nếu lỗi parse (do là link thường) thì giữ nguyên
    }
    return {
      ...p,
      img: displayImage, // Cập nhật lại cột img
    };
  });
  // ---------------------------------------------

  // BỘ LỌC DỮ LIỆU
  if (childTitle) {
    finalProducts = finalProducts.filter(
      (p) =>
        p.sub_category &&
        p.sub_category.toLowerCase().includes(childTitle.toLowerCase()),
    );
  } else if (subTitle) {
    if (childCategories.length > 0) {
      const validChildNames = childCategories.map((c: any) =>
        c.title.toLowerCase(),
      );
      validChildNames.push(subTitle.toLowerCase());

      finalProducts = finalProducts.filter((p) => {
        if (!p.sub_category) return false;
        return validChildNames.some((name) =>
          p.sub_category.toLowerCase().includes(name),
        );
      });
    } else {
      finalProducts = finalProducts.filter(
        (p) =>
          p.sub_category &&
          p.sub_category.toLowerCase().includes(subTitle.toLowerCase()),
      );
    }
  } else if (subCategories.length > 0) {
    const validSubNames = subCategories.map((item: any) =>
      item.title.toLowerCase(),
    );
    finalProducts = finalProducts.filter((p) => {
      if (!p.sub_category) return false;
      return validSubNames.some((validName) =>
        p.sub_category.toLowerCase().includes(validName),
      );
    });
  }

  const pageTitle = childTitle || subTitle || groupTitle || categoryName;

  return (
    <div className="min-h-screen bg-gray-100 font-sans pb-10">
      {/* BREADCRUMB */}
      <div className="bg-white py-3 px-4 shadow-sm mb-4">
        <div className="container mx-auto text-sm text-gray-500 flex items-center gap-2 flex-wrap">
          <Link href="/" className="hover:text-blue-600">
            Trang chủ
          </Link>
          <span>/</span>
          <Link
            href={`/category/${params.name}`}
            className={`hover:text-blue-600 ${
              !groupKey && !subKey ? "text-blue-700 font-bold" : ""
            }`}
          >
            {categoryName}
          </Link>
          {groupTitle && (
            <>
              <span>/</span>
              <Link
                href={`/category/${params.name}?group=${groupKey}`}
                className={`hover:text-blue-600 ${
                  !subKey ? "text-blue-700 font-bold" : ""
                }`}
              >
                {groupTitle}
              </Link>
            </>
          )}
          {subTitle && (
            <>
              <span>/</span>
              <Link
                href={
                  childCategories.length > 0
                    ? `/category/${params.name}?group=${groupKey}&sub=${subKey}`
                    : "#"
                }
                className={`hover:text-blue-600 ${
                  !childKey ? "text-blue-700 font-bold" : ""
                }`}
              >
                {subTitle}
              </Link>
            </>
          )}
          {childTitle && (
            <>
              <span>/</span>
              <span className="text-blue-700 font-bold">{childTitle}</span>
            </>
          )}
        </div>
      </div>

      {/* GRID DANH MỤC */}
      {gridItems.length > 0 && (
        <div className="container mx-auto px-4 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-l-4 border-blue-600 pl-3">
            {gridTitle}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {gridItems.map((item: any, index: number) => {
              let href = "";
              if (isChildGrid) {
                href = `/category/${params.name}?group=${groupKey}&sub=${subKey}&child=${item.sub}`;
              } else if (isSpecialGrid) {
                const parentKey = Object.keys(
                  DATA_BY_CATEGORY[categoryName] || {},
                )[0];
                href = `/category/${params.name}?group=${parentKey}&sub=${item.sub}`;
              } else {
                href = `/category/${params.name}?group=${item.key}`;
              }

              return (
                <Link
                  href={href}
                  key={index}
                  className="flex items-center p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer h-full group"
                >
                  <div className="w-12 h-12 flex items-center justify-center bg-blue-50 text-blue-600 rounded-full text-2xl mr-4 flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                    {item.sticker || "💊"}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-sm md:text-base group-hover:text-blue-700">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {item.count || "Xem ngay"}
                    </p>
                  </div>
                  <div className="text-gray-300 group-hover:text-blue-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.25 4.5l7.5 7.5-7.5 7.5"
                      />
                    </svg>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* DANH SÁCH DANH MỤC CON (Nút bấm) */}
      {subCategories.length > 0 && (
        <div className="container mx-auto px-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h2 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide">
              Danh mục {groupTitle}
            </h2>
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/category/${params.name}?group=${groupKey}`}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                  !subKey
                    ? "bg-blue-600 text-white border-blue-600 shadow-md"
                    : "bg-gray-50 text-gray-700 border-gray-200 hover:border-blue-500 hover:text-blue-600"
                }`}
              >
                Tất cả
              </Link>
              {subCategories.map((item: any, idx: number) => {
                const isActive = item.sub === subKey;
                return (
                  <Link
                    key={idx}
                    href={`/category/${params.name}?group=${groupKey}&sub=${item.sub}`}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                      isActive
                        ? "bg-blue-600 text-white border-blue-600 shadow-md"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:border-blue-500 hover:text-blue-600"
                    }`}
                  >
                    {item.title}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* KHU VỰC HIỂN THỊ SẢN PHẨM */}
      <div className="container mx-auto px-4">
        {(!gridItems.length || childKey) && (
          <div className="container mx-auto px-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-l-4 border-green-500 pl-3">
              {childTitle ? `Sản phẩm: ${childTitle}` : "Danh sách sản phẩm"}
            </h2>
            {/* Truyền finalProducts đã xử lý ảnh xuống Client */}
            <CategoryClient
              initialProducts={finalProducts}
              categoryName={pageTitle}
            />
          </div>
        )}
      </div>
    </div>
  );
}
