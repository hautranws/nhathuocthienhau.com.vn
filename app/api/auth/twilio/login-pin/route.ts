import { NextResponse } from "next/server";

import {
  encodeTwilioSession,
  normalizeVietnamPhone,
  TWILIO_SESSION_COOKIE,
} from "@/lib/twilio-auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isValidPin, verifyPin } from "@/lib/twilio-pin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const phone = normalizeVietnamPhone(String(body?.phone ?? ""));
    const pin = String(body?.pin ?? "").trim();

    if (!phone || !isValidPin(pin)) {
      return NextResponse.json(
        { success: false, error: "Số điện thoại hoặc mã PIN không hợp lệ." },
        { status: 400 },
      );
    }

    const { data, error } = await supabaseAdmin
      .from("twilio_phone_users")
      .select("auth_user_id, display_name, pin_hash")
      .eq("phone", phone)
      .maybeSingle();

    if (error) throw error;

    if (!data?.pin_hash || !verifyPin(pin, data.pin_hash)) {
      return NextResponse.json(
        { success: false, error: "Mã PIN không đúng." },
        { status: 401 },
      );
    }

    const session = {
      phone,
      userId: data.auth_user_id,
      createdAt: new Date().toISOString(),
      displayName: data.display_name ?? phone,
      provider: "twilio-sms" as const,
    };

    const response = NextResponse.json({
      success: true,
      redirectTo: "/",
    });

    response.cookies.set({
      name: TWILIO_SESSION_COOKIE,
      value: encodeTwilioSession(session),
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Không thể đăng nhập bằng mã PIN.",
      },
      { status: 500 },
    );
  }
}
