-- ============================================
-- ADMIN USERS TABLE - BẢNG QUẢN LÍ ADMIN
-- ============================================

-- 1. Tạo bảng admin_users
CREATE TABLE admin_users (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'admin', -- 'admin', 'moderator', etc.
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Enable RLS (Row Level Security)
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Admins can read other admins
CREATE POLICY "Admins can view all admins"
  ON admin_users FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM admin_users WHERE is_active = true));

-- 4. Policy: Only service role can insert/update/delete (backend only)
CREATE POLICY "Service role can manage admins"
  ON admin_users
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- 5. Create index on user_id for faster queries
CREATE INDEX idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX idx_admin_users_is_active ON admin_users(is_active);

-- ============================================
-- CÁCH SỬ DỤNG
-- ============================================

-- CÓ THỂ CHẠY TRỰC TIẾP TRONG SUPABASE SQL EDITOR

-- 1. Thêm user mới làm admin (THAY EMAIL_NGƯỜI_DÙNG)
-- Sau khi user đã tạo account thì chạy:
INSERT INTO admin_users (user_id, email, full_name, role, is_active)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@example.com'),
  'admin@example.com',
  'Tên Admin',
  'admin',
  true
);

-- 2. Tắt quyền admin của ai đó
UPDATE admin_users SET is_active = false WHERE email = 'admin@example.com';

-- 3. Xem danh sách admin
SELECT email, full_name, role, is_active, created_at FROM admin_users ORDER BY created_at DESC;

-- 4. Xóa admin (nếu cần)
DELETE FROM admin_users WHERE email = 'admin@example.com';
