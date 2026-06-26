import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { productId, isVisible } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: "productId is required" },
        { status: 400 },
      );
    }

    console.log(
      `🔄 Updating product ${productId}: is_homepage_visible = ${isVisible}`,
    );

    const { data, error } = await supabaseAdmin
      .from("products")
      .update({ is_homepage_visible: isVisible })
      .eq("id", productId)
      .select();

    if (error) {
      console.error("❌ Update error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("✅ Update success:", data);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (err: any) {
    console.error("❌ Exception:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
