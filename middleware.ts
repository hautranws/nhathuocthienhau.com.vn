import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  // Chỉ bảo vệ /admin routes
  if (!request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  try {
    // Create Supabase client for middleware
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

    // Get user session
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Nếu không có user, redirect tới login
    if (!user) {
      return NextResponse.redirect(
        new URL("/login?redirect=/admin", request.url),
      );
    }

    // Check if user is admin (kiểm tra từ user metadata hoặc database)
    const { data: adminData } = await supabase
      .from("admin_users")
      .select("id")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    if (!adminData) {
      // User không phải admin - redirect
      return NextResponse.redirect(new URL("/", request.url));
    }

    return response;
  } catch (error) {
    console.error("Middleware error:", error);
    // Nếu có lỗi, cho phép request (safe fallback)
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
