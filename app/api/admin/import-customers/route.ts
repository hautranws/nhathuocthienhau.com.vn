import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { decodeTwilioSession, formatVietnamPhone, normalizeVietnamPhone, TWILIO_SESSION_COOKIE } from "@/lib/twilio-auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type ImportedCustomer = {
  name: string;
  phone: string;
  points: number;
};

export const runtime = "nodejs";

async function findOrCreateAuthUser(
  phone: string,
  name: string,
  usersByPhone: Map<string, string>,
) {
  const existingUserId = usersByPhone.get(phone);
  if (existingUserId) return existingUserId;

  const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
    phone: `+${phone}`,
    phone_confirm: true,
    user_metadata: { phone, display_name: name },
  });

  if (!createError && created.user) {
    usersByPhone.set(phone, created.user.id);
    return created.user.id;
  }

  let page = 1;
  const perPage = 100;

  while (true) {
    const { data, error: listError } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage,
    });

    if (listError) throw listError;

    const existingUser = data.users.find(
      (user) => normalizeVietnamPhone(user.phone ?? "") === phone,
    );

    if (existingUser) {
      usersByPhone.set(phone, existingUser.id);
      return existingUser.id;
    }

    if (data.users.length < perPage) break;
    page += 1;
  }

  throw new Error(
    createError?.message ??
      `Không thể tạo tài khoản cho số ${formatVietnamPhone(phone)}.`,
  );
}

export async function POST(request: Request) {
  try {
    const rawSession = request.headers.get("cookie")?.split(";").map((item) => item.trim()).find((item) => item.startsWith(`${TWILIO_SESSION_COOKIE}=`))?.slice(TWILIO_SESSION_COOKIE.length + 1);
    const twilioSession = decodeTwilioSession(rawSession);
    let userId = twilioSession?.userId;

    if (!userId) {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return request.headers.get("cookie")
                ?.split(";")
                .map((item) => item.trim())
                .filter(Boolean)
                .map((item) => {
                  const separator = item.indexOf("=");
                  return {
                    name: item.slice(0, separator),
                    value: item.slice(separator + 1),
                  };
                }) ?? [];
            },
            setAll() {
              // This route only verifies the existing session.
            },
          },
        },
      );
      const { data } = await supabase.auth.getUser();
      userId = data.user?.id;
    }

    if (!userId) {
      return NextResponse.json({ success: false, error: "Bạn không có quyền thực hiện thao tác này." }, { status: 403 });
    }

    if (twilioSession) {
      return NextResponse.json({ success: false, error: "Tài khoản đăng nhập bằng số điện thoại không có quyền admin." }, { status: 403 });
    }

    const { data: adminUser, error: adminError } = await supabaseAdmin
      .from("admin_users")
      .select("id")
      .eq("user_id", userId)
      .eq("is_active", true)
      .maybeSingle();

    if (adminError) throw adminError;
    if (!adminUser) {
      return NextResponse.json({ success: false, error: "Tài khoản hiện tại chưa có quyền admin trong hệ thống." }, { status: 403 });
    }

    const body = (await request.json()) as { customers?: ImportedCustomer[] };
    const customers = body.customers ?? [];
    if (!customers.length) {
      return NextResponse.json({ success: false, error: "Danh sách khách hàng trống." }, { status: 400 });
    }

    const usersByPhone = new Map<string, string>();
    const processCustomer = async (customer: ImportedCustomer) => {
      const phone = normalizeVietnamPhone(String(customer.phone ?? ""));
      const name = String(customer.name ?? "").trim();
      const points = Number(customer.points ?? 0);

      if (!phone || !/^\d{9,12}$/.test(phone) || !name || !Number.isFinite(points) || points < 0) {
        return { success: false, error: `Dòng không hợp lệ: ${name || "không tên"} - ${customer.phone || "không SĐT"}` };
      }

      try {
        const { data: existingMapping, error: mappingReadError } = await supabaseAdmin
          .from("twilio_phone_users")
          .select("auth_user_id")
          .eq("phone", phone)
          .maybeSingle();
        if (mappingReadError) throw mappingReadError;

        const existingAuthUserId = existingMapping?.auth_user_id;

        const loyaltyPoints = Math.floor(points);
        let error;

        if (existingAuthUserId) {
          // Import là dữ liệu chuẩn mới: thay thế điểm, không cộng dồn và giữ nguyên PIN.
          ({ error } = await supabaseAdmin
            .from("twilio_phone_users")
            .update({
              display_name: name,
              loyalty_points: loyaltyPoints,
              updated_at: new Date().toISOString(),
            })
            .eq("phone", phone));
        } else {
          const authUserId = await findOrCreateAuthUser(phone, name, usersByPhone);
          ({ error } = await supabaseAdmin.from("twilio_phone_users").insert({
            phone,
            auth_user_id: authUserId,
            display_name: name,
            loyalty_points: loyaltyPoints,
            updated_at: new Date().toISOString(),
          }));
        }
        if (error) throw error;
        return { success: true };
      } catch (error: unknown) {
        return { success: false, error: `${name} (${formatVietnamPhone(phone)}): ${error instanceof Error ? error.message : "lỗi không xác định"}` };
      }
    };

    const results: Array<{ success: boolean; error?: string }> = [];
    const workerCount = Math.min(5, customers.length);
    let nextIndex = 0;
    const worker = async () => {
      while (nextIndex < customers.length) {
        const currentIndex = nextIndex++;
        results[currentIndex] = await processCustomer(customers[currentIndex]);
      }
    };
    await Promise.all(Array.from({ length: workerCount }, () => worker()));

    const errors = results.filter((result) => !result.success).map((result) => result.error ?? "Lỗi không xác định");
    const imported = results.filter((result) => result.success).length;

    return NextResponse.json({ success: true, imported, failed: errors.length, errors });
  } catch (error: unknown) {
    const databaseError = error as { code?: string; message?: string };
    const errorMessage =
      databaseError.code === "42703" && databaseError.message?.includes("loyalty_points")
        ? "Database chưa có cột loyalty_points. Hãy chạy: ALTER TABLE twilio_phone_users ADD COLUMN IF NOT EXISTS loyalty_points INTEGER NOT NULL DEFAULT 0;"
        : error instanceof Error
          ? error.message
          : "Không thể nhập dữ liệu khách hàng.";

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}
