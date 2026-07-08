import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  // Chỉ bảo vệ /admin routes
  if (!request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  try {
    let response = NextResponse.next();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            );
          },
        },
      },
    );

    // Chỉ kiểm tra đăng nhập - AdminLayout sẽ kiểm tra quyền admin
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(
        new URL("/login?redirect=/admin", request.url),
      );
    }

    return response;
  } catch (error) {
    console.error("Middleware error:", error);
    // Nếu có lỗi, cho phép request (AdminLayout sẽ kiểm tra lại)
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
