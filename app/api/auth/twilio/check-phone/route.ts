import { NextResponse } from "next/server";

import { normalizeVietnamPhone } from "@/lib/twilio-auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const phone = normalizeVietnamPhone(String(body?.phone ?? ""));

    if (!phone) {
      return NextResponse.json(
        { success: false, error: "Vui lòng nhập số điện thoại." },
        { status: 400 },
      );
    }

    const { data, error } = await supabaseAdmin
      .from("twilio_phone_users")
      .select("pin_hash")
      .eq("phone", phone)
      .maybeSingle();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      hasPin: Boolean(data?.pin_hash),
    });
  } catch (error: unknown) {
    const isMissingAuthTables =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "PGRST205";

    return NextResponse.json(
      {
        success: false,
        error: isMissingAuthTables
          ? "Hệ thống đăng nhập chưa được cài đặt trong Supabase. Hãy chạy file SQL_ZALO_OTP_SETUP.sql."
          : error instanceof Error
            ? error.message
            : "Không thể kiểm tra tài khoản.",
      },
      { status: 500 },
    );
  }
}
