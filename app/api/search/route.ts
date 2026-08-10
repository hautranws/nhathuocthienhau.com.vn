import { supabase } from "@/lib/supabaseClient";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";
    const category = searchParams.get("category");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const usageType = searchParams.get("usageType");

    let supabaseQuery = supabase.from("products").select("*");

    // Tìm kiếm theo tên - logic đa từ: tách từng từ và yêu cầu tất cả đều có trong tên (AND)
    if (query) {
      const words = query
        .trim()
        .split(/\s+/)
        .filter((w) => w.length > 0);
      if (words.length <= 1) {
        // Tìm kiếm 1 từ: khớp nhiều cột để không bỏ sót gợi ý phổ biến
        supabaseQuery = supabaseQuery.or(
          [
            `title.ilike.%${query}%`,
            `category.ilike.%${query}%`,
            `specification.ilike.%${query}%`,
          ].join(","),
        );
      } else {
        // Nhiều từ: ưu tiên OR theo nhiều cột để bắt được các từ viết rời
        const orFilter = words
          .map(
            (word) =>
              `title.ilike.%${word}%,category.ilike.%${word}%,specification.ilike.%${word}%`,
          )
          .join(",");
        supabaseQuery = supabaseQuery.or(orFilter);
      }
    }

    // Lọc theo danh mục
    if (category && category !== "Tất cả") {
      supabaseQuery = supabaseQuery.eq("category", category);
    }

    // Lọc theo giá
    if (minPrice) {
      supabaseQuery = supabaseQuery.gte("price", parseInt(minPrice));
    }
    if (maxPrice) {
      supabaseQuery = supabaseQuery.lte("price", parseInt(maxPrice));
    }

    // Lọc theo loại sử dụng (nếu có field này trong database)
    // if (usageType) {
    //   supabaseQuery = supabaseQuery.eq("usage_type", usageType);
    // }

    const { data, error } = await supabaseQuery.limit(100);

    if (error) {
      console.error("Search API error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ products: data || [] });
  } catch (err: any) {
    console.error("Search API exception:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
