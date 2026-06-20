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

  // 1. Lấy sản phẩm ban đầu
  let initialProducts: any[] = [];
  if (query) {
    const { data } = await supabase
      .from("products")
      .select("id, title, price, old_price, img, discount, category")
      .ilike("title", `%${query}%`)
      .limit(100);

    initialProducts = data || [];
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
