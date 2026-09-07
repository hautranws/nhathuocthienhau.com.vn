import crypto from "crypto";

import { supabaseAdmin } from "./supabaseAdmin";
import {
  encodeTwilioSession,
  normalizeVietnamPhone,
  type TwilioLoginSession,
} from "./twilio-auth";

const TWILIO_CONFIG = {
  accountSid: process.env.TWILIO_ACCOUNT_SID ?? "",
  authToken: process.env.TWILIO_AUTH_TOKEN ?? "",
  fromNumber: process.env.TWILIO_FROM_NUMBER ?? "",
  verifyServiceSid: process.env.TWILIO_VERIFY_SERVICE_SID ?? "",
};

export type TwilioOtpDeliveryResult = {
  success: boolean;
  error?: string;
};

type VerifyOtpResult =
  | { success: false; message: string }
  | {
      success: true;
      session: TwilioLoginSession;
      isAdmin: boolean;
      hasPin: boolean;
      sessionCookie: string;
    };

function otpHash(phone: string, otp: string) {
  const secret = process.env.TWILIO_OTP_SECRET ?? TWILIO_CONFIG.authToken;
  return crypto
    .createHash("sha256")
    .update(`${phone}:${otp}:${secret}`)
    .digest("hex");
}

export function generateOtpCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function hashOtpCode(phone: string, otp: string) {
  return otpHash(phone, otp);
}

export async function sendTwilioLoginOtp(
  phone: string,
  otp: string,
): Promise<TwilioOtpDeliveryResult> {
  const normalizedPhone = normalizeVietnamPhone(phone);
  const toNumber = `+${normalizedPhone}`;
  const message = `Mã xác thực của bạn là ${otp}. Mã có hiệu lực trong 5 phút.`;

  if (
    !TWILIO_CONFIG.accountSid ||
    !TWILIO_CONFIG.authToken ||
    !TWILIO_CONFIG.fromNumber
  ) {
    return {
      success: false,
      error:
        "Thiếu cấu hình Twilio. Hãy điền TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN và TWILIO_FROM_NUMBER.",
    };
  }

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_CONFIG.accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${TWILIO_CONFIG.accountSid}:${TWILIO_CONFIG.authToken}`,
          ).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: toNumber,
          From: TWILIO_CONFIG.fromNumber,
          Body: message,
        }),
      },
    );

    if (!response.ok) {
      const errorBody = await response.text();
      return { success: false, error: `Twilio gửi thất bại: ${errorBody}` };
    }

    return { success: true };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Lỗi gửi OTP qua Twilio",
    };
  }
}

export async function sendTwilioVerifyOtp(phone: string) {
  const normalizedPhone = normalizeVietnamPhone(phone);
  const response = await fetch(
    `https://verify.twilio.com/v2/Services/${TWILIO_CONFIG.verifyServiceSid}/Verifications`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${TWILIO_CONFIG.accountSid}:${TWILIO_CONFIG.authToken}`,
        ).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: `+${normalizedPhone}`, Channel: "sms" }),
    },
  );

  if (!response.ok) {
    return { success: false, error: `Twilio Verify gửi thất bại: ${await response.text()}` };
  }

  return { success: true };
}

export async function verifyTwilioVerifyOtp(phone: string, code: string) {
  const normalizedPhone = normalizeVietnamPhone(phone);
  const response = await fetch(
    `https://verify.twilio.com/v2/Services/${TWILIO_CONFIG.verifyServiceSid}/VerificationCheck`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${TWILIO_CONFIG.accountSid}:${TWILIO_CONFIG.authToken}`,
        ).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: `+${normalizedPhone}`, Code: code }),
    },
  );

  if (!response.ok) {
    return { success: false, error: `Twilio Verify xác minh thất bại: ${await response.text()}` };
  }

  const result = (await response.json()) as { status?: string };
  return { success: result.status === "approved", error: "Mã OTP không đúng hoặc đã hết hạn." };
}

export async function upsertOtpRecord(phone: string, otp: string) {
  const normalizedPhone = normalizeVietnamPhone(phone);
  const otpHashValue = hashOtpCode(normalizedPhone, otp);

  const { error } = await supabaseAdmin.from("twilio_login_otps").upsert(
    [
      {
        phone: normalizedPhone,
        otp_hash: otpHashValue,
        attempts: 0,
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    { onConflict: "phone" },
  );

  if (error) {
    throw error;
  }

  return normalizedPhone;
}

export async function verifyOtpRecord(
  phone: string,
  otp: string,
  otpAlreadyVerified = false,
): Promise<VerifyOtpResult> {
  const normalizedPhone = normalizeVietnamPhone(phone);
  const otpHashValue = hashOtpCode(normalizedPhone, otp);

  if (!otpAlreadyVerified) {
    const { data: record, error } = await supabaseAdmin
      .from("twilio_login_otps")
      .select("phone, otp_hash, expires_at, attempts")
      .eq("phone", normalizedPhone)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!record) {
      return { success: false, message: "Mã OTP không tồn tại hoặc đã hết hạn." };
    }

    if (new Date(record.expires_at).getTime() < Date.now()) {
      await supabaseAdmin
        .from("twilio_login_otps")
        .delete()
        .eq("phone", normalizedPhone);
      return { success: false, message: "Mã OTP đã hết hạn." };
    }

    if (record.otp_hash !== otpHashValue) {
      const nextAttempts = Number(record.attempts ?? 0) + 1;

      if (nextAttempts >= 5) {
        await supabaseAdmin
          .from("twilio_login_otps")
          .delete()
          .eq("phone", normalizedPhone);
      } else {
        await supabaseAdmin
          .from("twilio_login_otps")
          .update({
            attempts: nextAttempts,
            updated_at: new Date().toISOString(),
          })
          .eq("phone", normalizedPhone);
      }

      return { success: false, message: "Mã OTP không đúng." };
    }

    await supabaseAdmin
      .from("twilio_login_otps")
      .delete()
      .eq("phone", normalizedPhone);
  }

  const { data: mapping } = await supabaseAdmin
    .from("twilio_phone_users")
    .select("auth_user_id, display_name, pin_hash")
    .eq("phone", normalizedPhone)
    .maybeSingle();

  let authUserId = mapping?.auth_user_id;
  let displayName = mapping?.display_name ?? normalizedPhone;

  if (!authUserId) {
    const { data: createdUser, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        phone: `+${normalizedPhone}`,
        phone_confirm: true,
        user_metadata: {
          phone: normalizedPhone,
          display_name: normalizedPhone,
          provider: "twilio-sms",
        },
      });

    if (!createError && createdUser?.user) {
      authUserId = createdUser.user.id;
      displayName =
        (createdUser.user.user_metadata?.display_name as string) ??
        normalizedPhone;
    } else {
      let page = 1;
      const perPage = 100;
      let foundUser: {
        id: string;
        phone?: string | null;
        user_metadata?: Record<string, unknown>;
      } | null = null;

      while (!foundUser) {
        const { data, error: listError } =
          await supabaseAdmin.auth.admin.listUsers({ page, perPage });

        if (listError) {
          throw listError;
        }

        foundUser =
          data.users.find(
            (user) =>
              normalizeVietnamPhone(user.phone ?? "") === normalizedPhone,
          ) ?? null;

        if (foundUser || data.users.length < perPage) {
          break;
        }

        page += 1;
      }

      if (!foundUser) {
        throw new Error(
          createError?.message ??
            "Không thể tạo hoặc tìm user Supabase cho số điện thoại này.",
        );
      }

      authUserId = foundUser.id;
      displayName =
        (foundUser.user_metadata?.display_name as string) ?? normalizedPhone;
    }

    const { error: mappingError } = await supabaseAdmin
      .from("twilio_phone_users")
      .upsert(
        [
          {
            phone: normalizedPhone,
            auth_user_id: authUserId,
            display_name: displayName,
            updated_at: new Date().toISOString(),
          },
        ],
        { onConflict: "phone" },
      );

    if (mappingError) {
      throw mappingError;
    }
  }

  const session: TwilioLoginSession = {
    phone: normalizedPhone,
    userId: authUserId,
    createdAt: new Date().toISOString(),
    displayName,
    provider: "twilio-sms",
  };

  return {
    success: true,
    session,
    isAdmin: false,
    hasPin: Boolean(mapping?.pin_hash),
    sessionCookie: encodeTwilioSession(session),
  };
}
