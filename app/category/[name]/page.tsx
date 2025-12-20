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

  searchParams: Promise<{ sub?: string; group?: string }>; // Thêm group

}) {

  // 1. Lấy dữ liệu từ đường dẫn

  const params = await props.params;

  const searchParams = await props.searchParams;



  // Giải mã tên danh mục cấp 1 (Ví dụ: "Thực phẩm chức năng")

  const categoryName = decodeURIComponent(params.name);



  // Lấy key từ URL (Ví dụ: group="Vitamin", sub="CanxiVaVitaminD")

  const groupKey = searchParams.group;

  const subKey = searchParams.sub;



  // --- LOGIC DỊCH MÃ THÀNH TÊN HIỂN THỊ ---

  let groupTitle = ""; // Tên hiển thị Cấp 2

  let subTitle = "";   // Tên hiển thị Cấp 3



  // Tìm tên nhóm (Cấp 2)

  if (groupKey && ALL_DATA[groupKey]) {

    groupTitle = ALL_DATA[groupKey].title; // Vd: "Vitamin và Khoáng chất"

  }



  // Tìm tên mục con (Cấp 3)

  if (groupKey && subKey && ALL_DATA[groupKey]) {

    const foundItem = ALL_DATA[groupKey].items.find(

      (item: any) => item.sub === subKey

    );

    if (foundItem) {

      subTitle = foundItem.title; // Vd: "Bổ sung Canxi và Vitamin D"

    } else {

      subTitle = decodeURIComponent(subKey); // Nếu không tìm thấy thì hiển thị tạm mã

    }

  }



  // 2. Xây dựng câu lệnh hỏi kho Supabase

  let query = supabase

    .from("products")

    .select("*")

    .ilike("category", categoryName); // Lọc theo danh mục lớn trước



  // Lọc theo sub-category (Lưu ý: Trong DB bạn lưu tên hay lưu mã? Code này giả định lưu Tên)

  if (subTitle) {

    // Tìm kiếm tương đối theo tên hiển thị

    query = query.ilike("sub_category", `%${subTitle}%`);

  } else if (subKey) {

     // Fallback: tìm theo mã nếu không ra tên

    query = query.ilike("sub_category", `%${subKey}%`);

  }



  // Thực hiện lấy dữ liệu

  const { data: products, error } = await query;
  



  if (error) {

    console.error("Lỗi lấy danh mục:", error);

  }
// THÊM ĐOẠN NÀY ĐỂ SOI LỖI
  console.log("---------------- KIỂM TRA ----------------");
  console.log("1. Code đang tìm Category:", categoryName);
  console.log("2. Code đang tìm Sub-Category:", subTitle);
  console.log("3. Kết quả tìm thấy:", products?.length, "sản phẩm");
  
  if (products?.length === 0) {
      console.log("⚠️ GỢI Ý: Vào Supabase copy dòng '2' ở trên dán vào cột sub_category là được!");
  }


  // 3. Xác định tiêu đề trang

  // Ưu tiên: Sub Title > Group Title > Category Name

  const pageTitle = subTitle || groupTitle || categoryName;



  return (

    <div className="min-h-screen bg-gray-100 font-sans pb-10">

      {/* --- BREADCRUMB (THANH ĐIỀU HƯỚNG 3 CẤP) --- */}

      <div className="bg-white py-3 px-4 shadow-sm mb-6">

        <div className="container mx-auto text-sm text-gray-500 flex items-center gap-2 flex-wrap">

          <Link href="/" className="hover:text-blue-600">

            Trang chủ

          </Link>

          <span>/</span>

         

          {/* Cấp 1: Category Name */}

          <Link

            href={`/category/${params.name}`}

            className={`hover:text-blue-600 ${

              !groupKey && !subKey ? "text-blue-700 font-bold" : ""

            }`}

          >

            {categoryName}

          </Link>



          {/* Cấp 2: Group Title (Nếu có) */}

          {groupTitle && (

            <>

              <span>/</span>

              <Link

                // Bấm vào đây thì quay lại cấp 2 (bỏ chọn sub)

                href={`/category/${params.name}?group=${groupKey}`}

                className={`hover:text-blue-600 ${

                  !subKey ? "text-blue-700 font-bold" : ""

                }`}

              >

                {groupTitle}

              </Link>

            </>

          )}



          {/* Cấp 3: Sub Title (Nếu có) */}

          {subTitle && (

            <>

              <span>/</span>

              <span className="text-blue-700 font-bold">{subTitle}</span>

            </>

          )}

        </div>

      </div>



      <div className="container mx-auto px-4">

        {/* Truyền dữ liệu và Tiêu đề xuống cho Component hiển thị */}

        <CategoryClient

          initialProducts={products || []}

          categoryName={pageTitle}

        />

      </div>

    </div>

  );

}
