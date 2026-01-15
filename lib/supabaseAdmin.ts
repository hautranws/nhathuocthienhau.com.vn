import { createClient } from "@supabase/supabase-js";

// Lấy biến môi trường từ file .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Kiểm tra xem đã có biến chưa (tránh lỗi ngớ ngẩn)
if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    "❌ LỖI: Thiếu biến môi trường SUPABASE_SERVICE_ROLE_KEY hoặc URL. Hãy kiểm tra file .env.local"
  );
}

// Tạo Client với quyền Admin (Service Role)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false, // Server không cần refresh token
    persistSession: false,   // Không lưu session (vì server xử lý xong là thôi)
  },
});