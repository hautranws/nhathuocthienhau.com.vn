import type { User } from "@supabase/supabase-js";

export const TWILIO_SESSION_COOKIE = "th_twilio_session";

export const ADMIN_EMAIL = "tranthienhaudau2@gmail.com";
export const ADMIN_PHONE_CORE = "989217112";

export type TwilioLoginSession = {
  phone: string;
  userId: string;
  createdAt: string;
  displayName?: string;
  provider: "twilio-sms";
};

export function normalizeVietnamPhone(phone: string) {
  let normalized = phone.trim().replace(/\s+/g, "").replace(/^\+/, "");
  normalized = normalized.replace(/\D/g, "");

  if (normalized.startsWith("84")) {
    const localNumber = normalized.slice(2).replace(/^0/, "");
    return `84${localNumber}`;
  }

  if (normalized.startsWith("0")) {
    return `84${normalized.slice(1)}`;
  }

  return normalized;
}

export function formatVietnamPhone(phone: string) {
  const normalized = normalizeVietnamPhone(phone);
  return normalized.startsWith("84")
    ? `0${normalized.slice(2)}`
    : normalized;
}

export function isAdminPhone(phone: string) {
  return normalizeVietnamPhone(phone).includes(ADMIN_PHONE_CORE);
}

export function encodeTwilioSession(session: TwilioLoginSession) {
  return encodeURIComponent(JSON.stringify(session));
}

export function decodeTwilioSession(rawValue: string | null | undefined) {
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(decodeURIComponent(rawValue)) as TwilioLoginSession;
  } catch {
    return null;
  }
}

export function getTwilioUserFromSession(session: TwilioLoginSession): User {
  return {
    id: session.userId,
    aud: "authenticated",
    app_metadata: { provider: "twilio-sms" },
    created_at: session.createdAt,
    email: undefined,
    phone: session.phone,
    role: "authenticated",
    updated_at: session.createdAt,
    user_metadata: {
      phone: session.phone,
      display_name: session.displayName ?? session.phone,
      provider: "twilio-sms",
    },
  } as User;
}
