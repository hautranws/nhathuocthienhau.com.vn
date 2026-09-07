import { NextResponse } from "next/server";

import {
  encodeTwilioSession,
  normalizeVietnamPhone,
  TWILIO_SESSION_COOKIE,
} from "@/lib/twilio-auth";
import { verifyOtpRecord, verifyTwilioVerifyOtp } from "@/lib/twilio-login";

export const runtime = "nodejs";
const pinSetupCookie = "th_pin_setup_phone";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const phone = normalizeVietnamPhone(String(body?.phone ?? ""));
    const otp = String(body?.otp ?? "").trim();
    const resetPin = body?.resetPin === true;

    if (!phone || !otp) {
      return NextResponse.json(
        { success: false, error: "Thiếu số điện thoại hoặc mã OTP." },
        { status: 400 },
      );
    }

    let result;
    if (process.env.TWILIO_VERIFY_SERVICE_SID) {
      const verification = await verifyTwilioVerifyOtp(phone, otp);
      if (!verification.success) {
        return NextResponse.json(
          { success: false, error: verification.error },
          { status: 400 },
        );
      }
      result = await verifyOtpRecord(phone, otp, true);
    } else {
      result = await verifyOtpRecord(phone, otp);
    }

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.message },
        { status: 400 },
      );
    }

    if (!result.session) {
      return NextResponse.json(
        { success: false, error: "Không tạo được phiên đăng nhập sau khi xác minh OTP." },
        { status: 500 },
      );
    }

    const verifiedSession = result.session;

    const response = NextResponse.json({
      success: true,
      phone: verifiedSession.phone,
      isAdmin: result.isAdmin,
      requiresPin: resetPin || !result.hasPin,
      redirectTo: "/",
    });

    if (result.hasPin && !resetPin) {
      response.cookies.set({
        name: TWILIO_SESSION_COOKIE,
        value: encodeTwilioSession(verifiedSession),
        httpOnly: false,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
    } else {
      response.cookies.set({
        name: pinSetupCookie,
        value: verifiedSession.phone,
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 10 * 60,
      });
    }

    return response;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Lỗi xác thực OTP.";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 },
    );
  }
}
