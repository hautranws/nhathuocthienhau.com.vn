import { NextResponse } from "next/server";

import {
  generateOtpCode,
  sendTwilioLoginOtp,
  sendTwilioVerifyOtp,
  upsertOtpRecord,
} from "@/lib/twilio-login";
import { normalizeVietnamPhone } from "@/lib/twilio-auth";

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

    const delivery = process.env.TWILIO_VERIFY_SERVICE_SID
      ? await sendTwilioVerifyOtp(phone)
      : await (async () => {
          const otp = generateOtpCode();
          await upsertOtpRecord(phone, otp);
          return sendTwilioLoginOtp(phone, otp);
        })();

    if (!delivery.success) {
      return NextResponse.json(
        {
          success: false,
          error: delivery.error || "Không gửi được mã OTP qua Twilio.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Đã gửi mã OTP qua Twilio.",
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Lỗi không xác định khi gửi OTP.";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 },
    );
  }
}
