-- ============================================
-- TWILIO OTP SETUP
-- ============================================

-- 1. Bảng lưu OTP đang hoạt động
CREATE TABLE IF NOT EXISTS twilio_login_otps (
  id BIGSERIAL PRIMARY KEY,
  phone VARCHAR(20) NOT NULL UNIQUE,
  otp_hash TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_twilio_login_otps_expires_at ON twilio_login_otps(expires_at);

-- 2. Bảng map số điện thoại sang Supabase Auth user
CREATE TABLE IF NOT EXISTS twilio_phone_users (
  id BIGSERIAL PRIMARY KEY,
  phone VARCHAR(20) NOT NULL UNIQUE,
  auth_user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_twilio_phone_users_phone ON twilio_phone_users(phone);

-- 2.1. Hash mã PIN 6 số để đăng nhập nhanh sau khi xác minh OTP
ALTER TABLE twilio_phone_users
  ADD COLUMN IF NOT EXISTS pin_hash TEXT,
  ADD COLUMN IF NOT EXISTS loyalty_points INTEGER NOT NULL DEFAULT 0;

-- 3. Cho phép backend service role xử lý dữ liệu
ALTER TABLE twilio_login_otps ENABLE ROW LEVEL SECURITY;
ALTER TABLE twilio_phone_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage twilio otps"
  ON twilio_login_otps
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can manage twilio users"
  ON twilio_phone_users
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');