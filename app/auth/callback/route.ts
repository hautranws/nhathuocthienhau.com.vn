import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  // Lấy các tham số từ URL trả về
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  // "next" là trang đích sẽ chuyển đến sau khi login xong (mặc định là trang chủ /)
  const next = searchParams.get("next") ?? "/";

  if (code) {
    // Lấy cookie store (phải await trong Next.js mới)
    const cookieStore = await cookies();

    // Tạo Supabase Client phía Server để xử lý phiên đăng nhập
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.delete({ name, ...options });
          },
        },
      }
    );

    // Trao đổi mã code lấy phiên đăng nhập
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Nếu thành công, chuyển hướng người dùng về trang đích (thường là trang chủ)
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Nếu lỗi, chuyển về trang lỗi (hoặc trang chủ)
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
