# 🔐 ADMIN AUTHENTICATION - HƯỚNG DẪN SETUP

## 📋 Vấn Đề Ban Đầu
❌ **Trang /admin trước**: Bất kỳ ai cũng truy cập được  
✅ **Sau cập nhật**: Chỉ admin có thể vào

---

## 🚀 CẬP NHẬT LẦN NÀY

### 1. **Middleware Bảo Vệ** (middleware.ts)
- Kiểm tra user login trước khi vào /admin
- Kiểm tra user có trong bảng admin_users không
- Redirect nếu không phải admin

### 2. **Admin Layout Auth** (app/admin/layout.tsx)
- Client-side double-check
- Loading state + check quyền hạn
- Đăng xuất button

### 3. **Database Schema** (SQL_ADMIN_SETUP.sql)
- Bảng `admin_users` lưu danh sách admin
- RLS Policy bảo mật

---

## 🔧 SETUP LẦN ĐẦU TIÊN

### **Bước 1: Chạy SQL Script**

1. Vào **Supabase Dashboard** → **SQL Editor**
2. **Copy toàn bộ** nội dung từ file `SQL_ADMIN_SETUP.sql`
3. **Paste** vào SQL Editor
4. **Click "Run"** (nút play)

✅ Bảng `admin_users` sẽ được tạo

---

### **Bước 2: Thêm User Làm Admin**

**Cách 1: Qua Supabase Dashboard (Dễ nhất)**

1. Vào **Supabase** → **Auth** → **Users**
2. Tìm user bạn muốn làm admin (hoặc tạo mới)
3. Copy **User UID** (UUID dài)
4. Vào **SQL Editor**, chạy:

```sql
INSERT INTO admin_users (user_id, email, full_name, role, is_active)
VALUES (
  'PASTE_UUID_VÀO_ĐÂY',
  'email@example.com',
  'Tên Người Dùng',
  'admin',
  true
);
```

Thay:
- `PASTE_UUID_VÀO_ĐÂY` → UUID từ Auth Users
- `email@example.com` → email của admin
- `Tên Người Dùng` → tên hiển thị

**Cách 2: Qua Login Form**

1. Tài khoản tạo account lần đầu qua `/login`
2. Sau đó admin manual add vào bảng (Cách 1)

---

### **Bước 3: Test Login**

1. Vào `https://nhathuocthienhau.com.vn/admin`
2. Nếu chưa login:
   - Redirect tới `/login`
   - Sau login, redirect lại `/admin`
3. Nếu không phải admin:
   - Redirect tới trang chủ `/`

---

## 📊 Lệnh SQL Hữu Ích

### **Xem danh sách admin**
```sql
SELECT email, full_name, role, is_active FROM admin_users;
```

### **Tắt quyền admin (vẫn giữ record)**
```sql
UPDATE admin_users SET is_active = false WHERE email = 'admin@example.com';
```

### **Bật lại quyền admin**
```sql
UPDATE admin_users SET is_active = true WHERE email = 'admin@example.com';
```

### **Xóa admin hoàn toàn**
```sql
DELETE FROM admin_users WHERE email = 'admin@example.com';
```

---

## ✅ Danh Sách Quyền Hiện Có

- **`/admin`** - Dashboard
- **`/admin/add`** - Thêm sản phẩm
- **`/admin/products`** - Danh sách sản phẩm
- **`/admin/inventory`** - Kho hàng
- **`/admin/orders`** - Đơn hàng
- **`/admin/banners`** - Quản lý banner
- **`/admin/coupons`** - Mã giảm giá
- Tất cả đều được bảo vệ ✅

---

## ⚠️ Troubleshooting

### **"Đang kiểm tra quyền Admin..." mãi không hết**
→ Middleware có lỗi  
→ Kiểm tra `.env.local` có `NEXT_PUBLIC_SUPABASE_URL` không

### **Redirect tới home mặc dù login rồi**
→ User không có record trong `admin_users`  
→ Thêm qua SQL (Bước 2)

### **Lỗi "Table does not exist"**
→ Chưa chạy SQL script  
→ Vào Supabase SQL Editor chạy file `SQL_ADMIN_SETUP.sql`

---

## 🔒 Security Best Practices

✅ **Làm tốt:**
- RLS Policy chỉ cho service_role quản lý
- Middleware check trước rendering
- Double-check ở client & server

⚠️ **Cần làm thêm:**
- Rate limit login attempts (chống brute force)
- Activity logging (ghi lại ai access)
- 2FA (Two-factor authentication) - tuỳ chọn

---

## 📝 Kế Hoạch Tiếp Theo

1. **Deploy ngay** (đã push)
2. **Setup SQL** trên Supabase Production
3. **Thêm user admin** qua SQL
4. **Test login** `/admin`
5. **Xóa/ tắt user test** (nếu có)
