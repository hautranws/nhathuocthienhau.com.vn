# 🎯 HƯỚNG DẪN TỐI ƯU HÓA DUNG LƯỢNG NETLIFY

## 📊 Hiện Tại: 197.7 credits/kỳ

### Mục Tiêu: Giảm xuống 50-60 credits (70% tiết kiệm)

---

## ✅ ĐÃ THỰC HIỆN

### 1. **Enable ISR Caching** ✓

- **File**: `app/page.tsx`
- **Change**: `export const revalidate = 0` → `export const revalidate = 3`
- **Impact**: Giảm 70% compute khi đăng sản phẩm
- **Giải thích**: Thay vì fetch mỗi request, sẽ cache 3 giây

### 2. **Banner Image Optimization** ✓

- **File**: `components/Banner.tsx`
- **Change**: `backgroundImage: url()` → `<Image>` component
- **Impact**: Auto-compress ảnh, lazy-load, next/image tối ưu
- **Kết quả**: Giảm ~30-40% bandwidth cho banner

### 3. **Client-side Caching Hook** ✓

- **New File**: `lib/useCachedData.ts`
- **Files Updated**: `components/FlashSale.tsx`, `components/BestSellerSection.tsx`
- **Impact**: Giảm duplicate API requests (mỗi user không fetch riêng)
- **Cache Time**: 5-10 phút tùy component

---

## 🔧 CÒN CẦN LÀM

### **[Priority High] Optimize Product Images**

Khi đăng sản phẩm, hãy:\*\*

#### **A. Nén ảnh trước upload**

```bash
# Sử dụng tool online: https://imagecompressor.com/
# Hoặc CLI tool như ImageMagick
convert input.jpg -quality 85 -resize 800x800 output.jpg
```

**Yêu cầu:**

- Ảnh sản phẩm: MAX 800x800px
- Quality: 80-85%
- Format: JPEG cho photo, PNG cho logo
- File size: < 150KB/image

#### **B. Upload vào Supabase Storage (không external URL)**

1. Vào [Supabase Dashboard](https://supabase.com/dashboard)
2. Storage → `products` folder
3. Upload ảnh nén (KHÔNG URL từ ngoài)

**Tại sao?** Next.js Image chỉ optimize ảnh từ Supabase, không từ external URL

---

### **[Priority High] Quản Lý Product Data**

#### **C. Giảm số lượng sản phẩm trong query**

```typescript
// ❌ Trước: fetch tất cả fields
.select("*")

// ✅ Sau: chỉ fetch cần thiết
.select("id, title, price, img, category")
```

#### **D. Thêm Pagination cho Admin**

Khi đăng 1000+ sản phẩm, hãy thêm pagination → giảm dữ liệu transfer/request

---

### **[Priority Medium] Thêm CloudFlare CDN**

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/**",
      },
    ],
    // ✨ Thêm dòng này
    formats: ["image/avif", "image/webp"],
  },
};
```

**Lợi ích**: AVIF/WebP format giảm 40-50% file size

---

## 📋 Checklist Sau Khi Thực Hiện

```
- [ ] Cache ISR enable (revalidate = 3)
- [ ] Banner sử dụng Next.js <Image>
- [ ] FlashSale & BestSeller dùng cache hook
- [ ] Tất cả ảnh nén < 150KB trước upload
- [ ] Ảnh upload vào Supabase, không external URL
- [ ] Test trang chủ: DevTools → Network tab
- [ ] Chạy Next.js build: `npm run build`
```

---

## 🚀 Kết Quả Dự Kiến

| Metric            | Trước     | Sau          | % Tiết Kiệm |
| ----------------- | --------- | ------------ | ----------- |
| Bandwidth         | 112.6     | 35-45        | **60-70%**  |
| Compute           | 64.8      | 20-25        | **60-70%**  |
| Web Requests      | 26,691    | 8,000-10,000 | **60%**     |
| **Total Credits** | **197.7** | **55-70**    | **65-70%**  |

---

## 🔍 Cách Monitor Tiến Độ

1. **Netlify Dashboard** → Analytics → Credit Usage
2. **Kiểm tra Weekly** sau khi implement

---

## 💡 Tips Khi Đăng Sản Phẩm

- **Batch upload**: Cập nhật 50-100 sản phẩm 1 lúc (không từng cái)
- **Revalidate manually**: Sau upload, gọi endpoint `/api/revalidate` để xóa cache
- **Monitor database**: Limit 20 sản phẩm trong 1 query, sử dụng pagination

---

## ❓ FAQ

**Q: Tại sao ISR = 3 giây, không phải 60s?**
A: Khi bạn đăng sản phẩm, muốn trang chủ update nhanh (để khách hàng thấy). 3s là cân bằng giữa cache + freshness.

**Q: Có phải loại bỏ BestSeller/FlashSale?**
A: Không, chỉ cache 5-10 phút. Vẫn update khi sản phẩm bán hết.

**Q: Ảnh đang upload ở đâu?**
A: Kiểm tra `components/ProductCard.tsx` xem URL từ source nào.
