import React from "react";
import { INFO_MENU } from "@/components/data/infoData";
import { notFound } from "next/navigation";

// Hàm này để Next.js biết trước có những trang nào (Tốt cho SEO)
export async function generateStaticParams() {
  return INFO_MENU.map((item) => ({
    slug: item.id,
  }));
}

export default async function InfoPage({
  params,
}: {
  params: { slug: string };
}) {
  // Lấy slug từ URL (Next.js 15 cần await params)
  const { slug } = await params;

  // Tìm bài viết khớp với slug
  const pageData = INFO_MENU.find((item) => item.id === slug);

  // Nếu gõ linh tinh không tìm thấy thì báo lỗi 404
  if (!pageData) {
    return notFound();
  }

  return (
    <article className="prose max-w-none text-gray-800">
      {/* Tiêu đề bài viết */}
      <h1 className="text-2xl md:text-3xl font-bold text-blue-900 mb-6 border-b pb-4">
        {pageData.title}
      </h1>

      {/* Hiển thị nội dung HTML từ file data. 
         Lưu ý: Chỉ dùng dangerouslySetInnerHTML với dữ liệu do chính mình tạo ra.
      */}
      <div 
        dangerouslySetInnerHTML={{ __html: pageData.content }} 
        className="leading-relaxed space-y-4"
      />
    </article>
  );
}