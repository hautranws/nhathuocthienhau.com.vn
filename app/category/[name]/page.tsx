import React from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import CategoryClient from "@/components/CategoryClient";

// 1. Import dữ liệu để tra cứu tên hiển thị (Title) từ Mã (Key)
import { TPCN_DATA, DMP_DATA, CSCN_DATA, TBYT_DATA } from "@/components/data";

// Gộp tất cả dữ liệu lại để dễ tìm kiếm
const ALL_DATA: any = {
  ...TPCN_DATA,
  ...DMP_DATA,
  ...CSCN_DATA,
  ...TBYT_DATA,
};

export default async function CategoryPage(props: {
  params: Promise<{ name: string }>;
  searchParams: Promise<{ sub?: string; group?: string }>;
}) {
  // 1. Lấy dữ liệu từ đường dẫn
  const params = await props.params;
  const searchParams = await props.searchParams;

  // Giải mã tên danh mục cấp 1 (Ví dụ: "Thực phẩm chức năng")
  const categoryName = decodeURIComponent(params.name);

  // Lấy key từ URL
  const groupKey = searchParams.group;
  const subKey = searchParams.sub;

  // --- LOGIC DỊCH MÃ THÀNH TÊN HIỂN THỊ ---
  let groupTitle = ""; // Tên hiển thị Cấp 2
  let subTitle = ""; // Tên hiển thị Cấp 3
  let subCategories: any[] = []; // Danh sách các mục con để so sánh

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
    } else {
      subTitle = decodeURIComponent(subKey);
    }
  }

  // ---------------------------------------------------------
  // 2. LOGIC LẤY DỮ LIỆU MỚI (AN TOÀN HƠN)
  // ---------------------------------------------------------

  // Bước 1: Lấy TOÀN BỘ sản phẩm thuộc danh mục lớn (VD: Thực phẩm chức năng)
  // Cách này tránh lỗi cú pháp khi query phức tạp với tiếng Việt
  const { data: allProducts, error } = await supabase
    .from("products")
    .select("*")
    .ilike("category", `%${categoryName}%`);

  if (error) {
    console.error("Lỗi Supabase:", error);
  }

  let finalProducts = allProducts || [];

  // Bước 2: Lọc dữ liệu bằng Javascript (Chính xác và không bị lỗi cú pháp)
  if (subTitle) {
    // TRƯỜNG HỢP 1: Khách chọn cụ thể 1 mục con (VD: Vitamin C)
    // Giữ lại sản phẩm có sub_category chứa chữ "Vitamin C"
    finalProducts = finalProducts.filter(
      (p) =>
        p.sub_category &&
        p.sub_category.toLowerCase().includes(subTitle.toLowerCase())
    );
  } else if (subCategories.length > 0) {
    // TRƯỜNG HỢP 2: Khách chọn "Tất cả" (Có Group nhưng không có Sub)
    // Giữ lại sản phẩm nếu sub_category của nó nằm trong danh sách các mục con của Group này
    // Ví dụ: Group Vitamin có con là [Vitamin C, Canxi, Sắt...]
    // -> Sản phẩm nào là Vitamin C, hoặc Canxi... đều được giữ lại.

    // Tạo danh sách tên các mục con (chữ thường để so sánh)
    const validSubNames = subCategories.map((item: any) =>
      item.title.toLowerCase()
    );

    finalProducts = finalProducts.filter((p) => {
      if (!p.sub_category) return false;
      const productSub = p.sub_category.toLowerCase();
      // Kiểm tra xem sub_category của sản phẩm có chứa từ khóa nào trong nhóm không
      return validSubNames.some((validName) => productSub.includes(validName));
    });
  }

  // LOG KIỂM TRA
  console.log("--- DEBUG FILTER ---");
  console.log("Category:", categoryName);
  console.log(
    "Filter Mode:",
    subTitle
      ? "Theo Sub"
      : subCategories.length > 0
      ? "Theo Group (Tất cả)"
      : "Lấy hết Category"
  );
  console.log("Tìm thấy:", finalProducts.length, "sản phẩm");

  // 3. Xác định tiêu đề trang
  const pageTitle = subTitle || groupTitle || categoryName;

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
              <span className="text-blue-700 font-bold">{subTitle}</span>
            </>
          )}
        </div>
      </div>

      {/* --- DANH SÁCH DANH MỤC CON (Nút bấm) --- */}
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
        <CategoryClient
          initialProducts={finalProducts} // Truyền danh sách đã lọc
          categoryName={pageTitle}
        />
      </div>
    </div>
  );
}
