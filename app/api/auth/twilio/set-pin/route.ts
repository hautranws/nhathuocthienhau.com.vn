import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import {
  encodeTwilioSession,
  normalizeVietnamPhone,
  TWILIO_SESSION_COOKIE,
} from "@/lib/twilio-auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { hashPin, isValidPin } from "@/lib/twilio-pin";

export const runtime = "nodejs";
const pinSetupCookie = "th_pin_setup_phone";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const setupPhone = (await cookies()).get(pinSetupCookie)?.value;
    const phone = normalizeVietnamPhone(String(setupPhone ?? ""));
    const pin = String(body?.pin ?? "").trim();

    if (!phone || !isValidPin(pin)) {
      return NextResponse.json(
        { success: false, error: "Mã PIN phải gồm đúng 6 chữ số." },
        { status: 400 },
      );
    }

    const { data, error } = await supabaseAdmin
      .from("twilio_phone_users")
      .select("auth_user_id, display_name")
      .eq("phone", phone)
      .maybeSingle();

    if (error) throw error;
    if (!data?.auth_user_id) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy tài khoản sau khi xác minh OTP." },
        { status: 404 },
      );
    }

    const { error: updateError } = await supabaseAdmin
      .from("twilio_phone_users")
      .update({ pin_hash: hashPin(pin), updated_at: new Date().toISOString() })
      .eq("phone", phone);

    if (updateError) throw updateError;

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
    response.cookies.set({
      name: pinSetupCookie,
      value: "",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Không thể lưu mã PIN.",
      },
      { status: 500 },
    );
  }
}
