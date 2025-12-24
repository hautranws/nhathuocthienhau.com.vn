import React from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import CategoryClient from "@/components/CategoryClient";

// 1. Import dữ liệu để tra cứu tên hiển thị (Title) từ Mã (Key)
// --- [MỚI] THÊM THUOC_DATA VÀO IMPORT ---
import {
  TPCN_DATA,
  DMP_DATA,
  CSCN_DATA,
  TBYT_DATA,
  THUOC_DATA,
} from "@/components/data";

// Gộp tất cả dữ liệu lại để dễ tìm kiếm
const ALL_DATA: any = {
  ...THUOC_DATA, // [MỚI]
  ...TPCN_DATA,
  ...DMP_DATA,
  ...CSCN_DATA,
  ...TBYT_DATA,
};

// --- [MỚI] BẢN ĐỒ ÁNH XẠ TÊN DANH MỤC SANG DỮ LIỆU GỐC ---
const DATA_BY_CATEGORY: Record<string, any> = {
  Thuốc: THUOC_DATA,
  "Thực phẩm chức năng": TPCN_DATA,
  "Dược mỹ phẩm": DMP_DATA,
  "Chăm sóc cá nhân": CSCN_DATA,
  "Thiết bị y tế": TBYT_DATA,
};

export default async function CategoryPage(props: {
  params: Promise<{ name: string }>;
  searchParams: Promise<{ sub?: string; group?: string; child?: string }>; // Thêm child
}) {
  // 1. Lấy dữ liệu từ đường dẫn
  const params = await props.params;
  const searchParams = await props.searchParams;

  // Giải mã tên danh mục cấp 1 (Ví dụ: "Thực phẩm chức năng")
  const categoryName = decodeURIComponent(params.name);

  // Lấy key từ URL
  const groupKey = searchParams.group;
  const subKey = searchParams.sub;
  const childKey = searchParams.child; // Lấy key cấp 4 (nếu có)

  // --- LOGIC DỊCH MÃ THÀNH TÊN HIỂN THỊ ---
  let groupTitle = ""; // Tên hiển thị Cấp 2
  let subTitle = ""; // Tên hiển thị Cấp 3
  let childTitle = ""; // Tên hiển thị Cấp 4
  let subCategories: any[] = []; // Danh sách các mục con để so sánh
  let childCategories: any[] = []; // Danh sách con cấp 4 (ví dụ: thuốc kháng nấm, siro...)

  // Tìm tên nhóm (Cấp 2) và lấy danh sách con
  if (groupKey && ALL_DATA[groupKey]) {
    groupTitle = ALL_DATA[groupKey].title;
    subCategories = ALL_DATA[groupKey].items || [];
  }

  // Tìm tên mục con (Cấp 3)
  if (groupKey && subKey && ALL_DATA[groupKey]) {
    const foundItem = ALL_DATA[groupKey].items.find(
      (item: any) => item.sub === subKey
    );
    if (foundItem) {
      subTitle = foundItem.title;
      // [MỚI] Nếu mục này có con (children), lấy ra để hiển thị
      if (foundItem.children) {
        childCategories = foundItem.children;
      }
    } else {
      subTitle = decodeURIComponent(subKey);
    }
  }

  // 3. Lấy Child (Cấp 4) - Nếu khách đã bấm vào mục con sâu nhất
  if (childCategories.length > 0 && childKey) {
    const foundChild = childCategories.find((c: any) => c.sub === childKey);
    if (foundChild) {
      childTitle = foundChild.title;
    }
  }

  // ---------------------------------------------------------
  // [MỚI] LOGIC CHUẨN BỊ DỮ LIỆU ĐỂ HIỂN THỊ LƯỚI DANH MỤC (GRID)
  // ---------------------------------------------------------
  let gridItems: any[] = [];
  let gridTitle = "";
  let isSpecialGrid = false; // Cờ đánh dấu để xử lý link cho "Thuốc"
  let isChildGrid = false; // Cờ báo hiệu đây là lưới cấp 4

  // Chỉ hiện lưới khi người dùng ĐANG Ở TRANG CHỦ CỦA DANH MỤC (chưa chọn group)
  if (!groupKey) {
    const currentData = DATA_BY_CATEGORY[categoryName];
    if (currentData) {
      const keys = Object.keys(currentData);
      gridTitle = `Danh mục ${categoryName}`;

      // TRƯỜNG HỢP ĐẶC BIỆT: THUỐC (Chỉ có 1 nhóm lớn là NhomTriLieu, nên ta lấy ruột của nó ra)
      if (keys.length === 1 && currentData[keys[0]].items) {
        gridItems = currentData[keys[0]].items; // Lấy danh sách con (Dị ứng, Da liễu...)
        isSpecialGrid = true; // Đánh dấu để lát tạo link kiểu khác (?group=...&sub=...)
      } else {
        // TRƯỜNG HỢP THƯỜNG: TPCN, Dược mỹ phẩm (Lấy danh sách nhóm cha: Vitamin, Sinh lý...)
        gridItems = Object.entries(currentData).map(([key, value]: any) => ({
          key: key, // Giữ lại key để làm link
          title: value.title,
          sticker: value.icon || "📦", // Nếu không có icon thì dùng tạm hộp
          count: value.items ? value.items.length + " nhóm" : "Nhiều sản phẩm",
        }));
      }
    }
  }
  // TRƯỜNG HỢP B: [MỚI] Đã chọn Sub (VD: Kháng sinh) và nó có con -> Hiện lưới con
  else if (subKey && childCategories.length > 0 && !childKey) {
    gridItems = childCategories;
    gridTitle = subTitle; // Tiêu đề là "Thuốc kháng sinh, kháng nấm"
    isChildGrid = true; // Đánh dấu để lát tạo link cấp 4
  }

  // ---------------------------------------------------------
  // 2. LOGIC LẤY DỮ LIỆU MỚI (AN TOÀN HƠN)
  // ---------------------------------------------------------

  // Bước 1: Lấy TOÀN BỘ sản phẩm thuộc danh mục lớn (VD: Thực phẩm chức năng)
  const { data: allProducts, error } = await supabase
    .from("products")
    .select("*")
    .ilike("category", `%${categoryName}%`);

  if (error) {
    console.error("Lỗi Supabase:", error);
  }

  let finalProducts = allProducts || [];

  // BỘ LỌC
  if (childTitle) {
    // 1. Lọc theo cấp 4 (Cụ thể nhất: VD Siro kháng sinh)
    finalProducts = finalProducts.filter(
      (p) =>
        p.sub_category &&
        p.sub_category.toLowerCase().includes(childTitle.toLowerCase())
    );
  } else if (subTitle) {
    // 2. Lọc theo cấp 3 (VD: Kháng sinh nói chung)
    if (childCategories.length > 0) {
      // Nếu mục này có con, lấy tất cả sp thuộc các con đó
      const validChildNames = childCategories.map((c: any) =>
        c.title.toLowerCase()
      );
      // Cũng giữ lại chính nó nữa (đề phòng sp chỉ ghi tag cha)
      validChildNames.push(subTitle.toLowerCase());

      finalProducts = finalProducts.filter((p) => {
        if (!p.sub_category) return false;
        return validChildNames.some((name) =>
          p.sub_category.toLowerCase().includes(name)
        );
      });
    } else {
      // Lọc bình thường
      finalProducts = finalProducts.filter(
        (p) =>
          p.sub_category &&
          p.sub_category.toLowerCase().includes(subTitle.toLowerCase())
      );
    }
  } else if (subCategories.length > 0) {
    // 3. Lọc theo cấp 2 (Group)
    const validSubNames = subCategories.map((item: any) =>
      item.title.toLowerCase()
    );
    finalProducts = finalProducts.filter((p) => {
      if (!p.sub_category) return false;
      return validSubNames.some((validName) =>
        p.sub_category.toLowerCase().includes(validName)
      );
    });
  }

  // 3. Xác định tiêu đề trang
  const pageTitle = childTitle || subTitle || groupTitle || categoryName;

  return (
    <div className="min-h-screen bg-gray-100 font-sans pb-10">
      {/* --- BREADCRUMB --- */}
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

      {/* --- [MỚI] KHU VỰC HIỂN THỊ LƯỚI DANH MỤC (GRID) --- */}
      {/* Chỉ hiện khi chưa chọn nhóm nào và có dữ liệu gridItems */}
      {gridItems.length > 0 && (
        <div className="container mx-auto px-4 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-l-4 border-blue-600 pl-3">
            {gridTitle}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {gridItems.map((item: any, index: number) => {
              // Xử lý Link:
              // Nếu là "Thuốc" (Special) -> Link trỏ thẳng vào ?group=NhomTriLieu&sub=xxx
              // Nếu là "TPCN" (Thường) -> Link trỏ vào ?group=xxx
              let href = "";
              if (isChildGrid) {
                // Link vào cấp 4: ?group=...&sub=...&child=...
                href = `/category/${params.name}?group=${groupKey}&sub=${subKey}&child=${item.sub}`;
              } else if (isSpecialGrid) {
                // Item lúc này là { sub: 'ThuocDiUng', title: '...', ... }
                // Chúng ta cần lấy key cha (NhomTriLieu) nhưng ở đây hardcode lấy key đầu tiên của data Thuốc
                const parentKey = Object.keys(
                  DATA_BY_CATEGORY[categoryName] || {}
                )[0];
                href = `/category/${params.name}?group=${parentKey}&sub=${item.sub}`;
              } else {
                // Item lúc này là { key: 'Vitamin', title: 'Vitamin...', ... }
                href = `/category/${params.name}?group=${item.key}`;
              }

              return (
                <Link
                  href={href}
                  key={index}
                  className="flex items-center p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer h-full group"
                >
                  {/* Icon */}
                  <div className="w-12 h-12 flex items-center justify-center bg-blue-50 text-blue-600 rounded-full text-2xl mr-4 flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                    {item.sticker || "💊"}
                  </div>

                  {/* Text */}
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-sm md:text-base group-hover:text-blue-700">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {item.count || "Xem ngay"}
                    </p>
                  </div>

                  {/* Mũi tên */}
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
      {/* -------------------------------------------------- */}

      {/* --- DANH SÁCH DANH MỤC CON (Nút bấm - Giữ nguyên logic cũ) --- */}
      {subCategories.length > 0 && (
        <div className="container mx-auto px-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h2 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide">
              Danh mục {groupTitle}
            </h2>
            <div className="flex flex-wrap gap-3">
              {/* Nút "Tất cả" */}
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

              {/* Các nút danh mục con */}
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

      {/* --- KHU VỰC HIỂN THỊ SẢN PHẨM --- */}
      <div className="container mx-auto px-4">
        {/* Tiêu đề danh sách sản phẩm */}
        {(!gridItems.length || childKey) && (
          <div className="container mx-auto px-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-l-4 border-green-500 pl-3">
              {childTitle ? `Sản phẩm: ${childTitle}` : "Danh sách sản phẩm"}
            </h2>
            <CategoryClient
              initialProducts={finalProducts} // Truyền danh sách đã lọc
              categoryName={pageTitle}
            />
          </div>
        )}
      </div>
    </div>
  );
}
