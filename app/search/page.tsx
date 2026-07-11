import React from "react";
import { supabase } from "@/lib/supabaseClient";
import SearchClient from "@/components/SearchClient";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const query = (resolvedSearchParams.q || "").toString().trim();

  // 1. Lấy sản phẩm ban đầu - logic đa từ: AND trước, fallback OR
  let initialProducts: any[] = [];
  if (query) {
    const words = query.split(/\s+/).filter((w) => w.length > 0);

    const buildQuery = () =>
      supabase
        .from("products")
        .select(
          "id, title, price, old_price, img, discount, category, is_prescription, unit, specification, conversion_units",
        );

    if (words.length <= 1) {
      // 1 từ: tìm thông thường
      const { data } = await buildQuery()
        .ilike("title", `%${query}%`)
        .limit(100);
      initialProducts = data || [];
    } else {
      // Nhiều từ: AND - tất cả từ phải có trong tên
      let andQuery = buildQuery();
      for (const word of words) {
        andQuery = andQuery.ilike("title", `%${word}%`);
      }
      const { data: andData } = await andQuery.limit(100);

      if (andData && andData.length > 0) {
        initialProducts = andData;
      } else {
        // Fallback OR - bất kỳ từ nào khớp
        const orFilter = words.map((w) => `title.ilike.%${w}%`).join(",");
        const { data: orData } = await buildQuery().or(orFilter).limit(100);
        initialProducts = orData || [];
      }
    }
  }

  // 2. Lấy danh sách danh mục (unique categories)
  const { data: allProducts } = await supabase
    .from("products")
    .select("category");

  const categoriesSet = new Set<string>();
  if (allProducts) {
    allProducts.forEach((p: any) => {
      if (p.category) categoriesSet.add(p.category);
    });
  }
  const allCategories = Array.from(categoriesSet).sort();

  return (
    <SearchClient
      initialQuery={query}
      initialProducts={initialProducts}
      allCategories={allCategories}
    />
  );
}
