import { createBrowserClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import {
  decodeTwilioSession,
  getTwilioUserFromSession,
  TWILIO_SESSION_COOKIE,
} from "./twilio-auth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createBrowserClient(supabaseUrl, supabaseKey);

function readCookieValue(name: string) {
  if (typeof document === "undefined") {
    return null;
  }

  const cookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${name}=`));

  return cookie ? cookie.slice(name.length + 1) : null;
}

const isRefreshTokenError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error ?? "");
  const normalized = message.toLowerCase();

  return (
    normalized.includes("refresh token") ||
    normalized.includes("invalid refresh token") ||
    normalized.includes("refresh token not found")
  );
};

function clearSupabaseAuthStorage() {
  if (typeof window === "undefined") {
    return;
  }

  for (const storage of [window.localStorage, window.sessionStorage]) {
    for (let index = storage.length - 1; index >= 0; index -= 1) {
      const key = storage.key(index);
      if (key?.startsWith("sb-") && key.endsWith("-auth-token")) {
        storage.removeItem(key);
      }
    }
  }
}

export async function safeSupabaseSignOut() {
  clearSupabaseAuthStorage();

  try {
    await supabase.auth.signOut({ scope: "local" });
  } catch (error) {
    if (!isRefreshTokenError(error)) {
      console.warn("Supabase signOut failed:", error);
    }
  }

  if (typeof document !== "undefined") {
    document.cookie = `${TWILIO_SESSION_COOKIE}=; path=/; max-age=0`;
  }

  try {
    await fetch("/api/auth/twilio/logout", { method: "POST" });
  } catch {
    // Ignore logout API failures.
  }
}

export async function getSafeSupabaseUser(): Promise<User | null> {
  try {
    const response = await fetch("/api/auth/twilio/session", {
      cache: "no-store",
      credentials: "include",
    });
    const result = (await response.json()) as { user?: User | null };

    if (result.user) {
      return result.user;
    }
  } catch {
    // Continue with the browser cookie and Supabase session fallbacks.
  }

  const twilioSession = decodeTwilioSession(
    readCookieValue(TWILIO_SESSION_COOKIE),
  );

  if (twilioSession) {
    return getTwilioUserFromSession(twilioSession);
  }

  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      if (isRefreshTokenError(sessionError)) {
        clearSupabaseAuthStorage();
        await safeSupabaseSignOut();
        return null;
      }
      return null;
    }

    if (session?.user) {
      return session.user;
    }

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError && isRefreshTokenError(userError)) {
        clearSupabaseAuthStorage();
        await safeSupabaseSignOut();
        return null;
      }

      return user ?? null;
    } catch (error) {
      if (isRefreshTokenError(error)) {
        clearSupabaseAuthStorage();
        await safeSupabaseSignOut();
        return null;
      }
      throw error;
    }
  } catch (error) {
    if (isRefreshTokenError(error)) {
      clearSupabaseAuthStorage();
      await safeSupabaseSignOut();
      return null;
    }
    throw error;
  }
}
