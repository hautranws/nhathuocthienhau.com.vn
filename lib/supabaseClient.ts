import { createBrowserClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createBrowserClient(supabaseUrl, supabaseKey);

const isRefreshTokenError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error ?? "");
  const normalized = message.toLowerCase();

  return (
    normalized.includes("refresh token") ||
    normalized.includes("invalid refresh token") ||
    normalized.includes("refresh token not found")
  );
};

export async function safeSupabaseSignOut() {
  try {
    await supabase.auth.signOut();
  } catch (error) {
    if (!isRefreshTokenError(error)) {
      console.warn("Supabase signOut failed:", error);
    }
  }
}

export async function getSafeSupabaseUser(): Promise<User | null> {
  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      if (isRefreshTokenError(sessionError)) {
        console.warn("Supabase session refresh failed; using signed-out state.", sessionError.message);
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
        console.warn("Supabase user refresh failed; using signed-out state.", userError.message);
        await safeSupabaseSignOut();
        return null;
      }

      return user ?? null;
    } catch (error) {
      if (isRefreshTokenError(error)) {
        console.warn("Supabase user refresh failed; using signed-out state.", error);
        await safeSupabaseSignOut();
        return null;
      }
      throw error;
    }
  } catch (error) {
    if (isRefreshTokenError(error)) {
      console.warn("Supabase auth check failed; using signed-out state.", error);
      await safeSupabaseSignOut();
      return null;
    }
    throw error;
  }
}
