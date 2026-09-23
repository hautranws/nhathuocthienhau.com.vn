import React from "react";
import { supabase } from "@/lib/supabaseClient";
import SearchClient from "@/components/SearchClient";
import {
  buildSearchOrFilter,
  sortSearchResults,
} from "@/lib/search-relevance";

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
    const buildQuery = () =>
      supabase
        .from("products")
        .select(
          "*",
        );

    const { data } = await buildQuery()
      .or(buildSearchOrFilter(query))
      .limit(500);
    initialProducts = sortSearchResults(data || [], query).slice(0, 100);
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
