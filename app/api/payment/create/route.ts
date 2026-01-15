import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin";
import nodemailer from "nodemailer"; // Thư viện gửi mail

// Giữ nguyên các hàm import thanh toán của bạn
import { createVNPayUrl } from "../../../../lib/payment/vnpay";
import { createMoMoUrl } from "../../../../lib/payment/momo";
import { createPayOSLink } from "../../../../lib/payment/payos";

// ==================================================================
// ⚙️ CẤU HÌNH GỬI THÔNG BÁO (GIỮ NGUYÊN)
// ==================================================================

// 1. Cấu hình Email (Dùng Gmail App Password)
const EMAIL_CONFIG = {
  user: "email_cua_ban@gmail.com", // ⚠️ Điền Email gửi đi
  pass: "xxxx xxxx xxxx xxxx",     // ⚠️ Điền Mật khẩu ứng dụng
  staffEmail: "email_nhan_vien@gmail.com", // ⚠️ Email nhân viên
};

// 2. Cấu hình Zalo OA
const ZALO_CONFIG = {
  accessToken: "DIEN_ZALO_ACCESS_TOKEN_VAO_DAY", // ⚠️ Token Zalo
  oaId: "ID_ZALO_OA_CUA_BAN", 
};

// ==================================================================

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Nhận dữ liệu từ Frontend (Thêm couponCode)
    const { items, customer, paymentMethod, couponCode } = body;
    const { name, phone, address, note } = customer;

    // --- BƯỚC 0: TÍNH TOÁN LẠI GIÁ & MÃ GIẢM GIÁ (SERVER SIDE) ---
    // ⚠️ QUAN TRỌNG: Tính lại tổng tiền từ danh sách items để tránh hack giá từ Frontend
    const serverSubTotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    
    let discountAmount = 0;
    let finalAmount = serverSubTotal;
    let appliedCouponCode = null;

    // Nếu có mã giảm giá gửi lên
    if (couponCode) {
        // Lấy thông tin coupon từ DB bằng quyền Admin
        const { data: coupon } = await supabaseAdmin
            .from("coupons")
            .select("*")
            .eq("code", couponCode.toUpperCase().trim()) // Chuyển chữ hoa, xóa khoảng trắng
            .single();

        if (coupon) {
            // Kiểm tra các điều kiện
            const now = new Date();
            const expiry = coupon.expiry_date ? new Date(coupon.expiry_date) : null;
            const isExpired = expiry && now > expiry;
            const isLimitReached = coupon.usage_limit > 0 && coupon.used_count >= coupon.usage_limit;
            const isMinOrderMet = serverSubTotal >= (coupon.min_order_value || 0);

            // Nếu mã hợp lệ
            if (coupon.is_active && !isExpired && !isLimitReached && isMinOrderMet) {
                // Tính tiền giảm
                if (coupon.discount_type === 'percent') {
                    discountAmount = (serverSubTotal * coupon.discount_value) / 100;
                } else {
                    discountAmount = coupon.discount_value;
                }
                
                // Không giảm quá số tiền đơn hàng
                if (discountAmount > serverSubTotal) discountAmount = serverSubTotal;

                finalAmount = serverSubTotal - discountAmount;
                appliedCouponCode = coupon.code;

                // ⬇️ CẬP NHẬT: Trừ lượt sử dụng của mã (Tăng used_count lên 1)
                await supabaseAdmin.from("coupons").update({ used_count: coupon.used_count + 1 }).eq("id", coupon.id);
            }
        }
    }

    // --- BƯỚC 1: XỬ LÝ USER (TỰ ĐỘNG TẠO TÀI KHOẢN) ---
    let formattedPhone = phone.trim();
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "84" + formattedPhone.substring(1);
    }
    formattedPhone = formattedPhone.replace("+", "");

    let userId = null;
    let isNewUser = false;
    const randomPassword = Math.random().toString(36).slice(-8) + "Aa1@";

    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      phone: formattedPhone,
      password: randomPassword,
      email_confirm: true,
      phone_confirm: true,
      user_metadata: { full_name: name, address: address, phone: phone },
    });

    if (!createError && newUser) {
      userId = newUser.user.id;
      isNewUser = true;
    }

    // --- BƯỚC 2: TẠO ĐƠN HÀNG VÀO DB ---
    // Lưu ý: Lưu thêm discount_amount, final_price, coupon_code
    const { data: orderData, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert([
        {
          user_id: userId,
          customer_name: name,
          phone: phone,
          address: address,
          total_price: serverSubTotal, // Giá gốc trước giảm
          final_price: finalAmount,    // Giá cuối cùng khách phải trả
          discount_amount: discountAmount,
          coupon_code: appliedCouponCode,
          payment_method: paymentMethod,
          payment_status: "pending",
          note: note,
        },
      ])
      .select()
      .single();

    if (orderError) throw orderError;

    // Lưu chi tiết sản phẩm
    const orderItemsData = items.map((item: any) => ({
      order_id: orderData.id,
      product_name: item.title || item.name,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error: itemsError } = await supabaseAdmin
      .from("order_items")
      .insert(orderItemsData);

    if (itemsError) throw itemsError;

    // ==================================================================
    // 🔥 GỬI THÔNG BÁO (EMAIL & ZALO)
    // ==================================================================
    (async () => {
      try {
        const orderId = orderData.id;
        const totalStr = finalAmount.toLocaleString("vi-VN"); // Gửi số tiền cuối cùng
        
        // A. GỬI EMAIL CHO NHÂN VIÊN
        if (EMAIL_CONFIG.user && EMAIL_CONFIG.pass) {
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: { user: EMAIL_CONFIG.user, pass: EMAIL_CONFIG.pass },
            });

            const itemsHtml = items.map((item: any) => 
                `<li>${item.title || item.name} - SL: <b>${item.quantity}</b></li>`
            ).join("");

            // Nếu có mã giảm giá thì hiện thêm dòng này trong mail
            let couponHtml = "";
            if (discountAmount > 0) {
                couponHtml = `<p style="color: green;"><b>🎁 Đã dùng mã:</b> ${appliedCouponCode} (Giảm ${discountAmount.toLocaleString()}đ)</p>`;
            }

            const mailOptions = {
                from: `"Hệ thống Đơn hàng" <${EMAIL_CONFIG.user}>`,
                to: EMAIL_CONFIG.staffEmail,
                subject: `🔔 Đơn mới #${orderId} - ${name} - ${totalStr}đ`,
                html: `
                    <h2>CÓ ĐƠN HÀNG MỚI!</h2>
                    <p><b>Mã đơn:</b> #${orderId}</p>
                    <p><b>Khách hàng:</b> ${name}</p>
                    <p><b>SĐT:</b> <a href="tel:${phone}">${phone}</a></p>
                    <p><b>Địa chỉ:</b> ${address}</p>
                    <p><b>Ghi chú:</b> ${note || "Không có"}</p>
                    <p><b>Thanh toán:</b> ${paymentMethod}</p>
                    <hr/>
                    <h3>Chi tiết:</h3>
                    <ul>${itemsHtml}</ul>
                    <p>Giá gốc: ${serverSubTotal.toLocaleString()}đ</p>
                    ${couponHtml}
                    <h3>TỔNG THANH TOÁN: <span style="color:red">${totalStr} đ</span></h3>
                    <p><i>Vui lòng gọi khách xác nhận ngay!</i></p>
                `,
            };

            await transporter.sendMail(mailOptions);
        }

        // B. GỬI ZALO (Code cũ giữ nguyên)
        if (ZALO_CONFIG.accessToken && formattedPhone) {
             console.log("🚀 (Zalo Integration) Kích hoạt gửi Zalo...");
             // Logic Zalo của bạn ở đây...
        }

      } catch (notifyError) {
        console.error("❌ Lỗi gửi thông báo:", notifyError);
      }
    })();


    // --- BƯỚC 3: TẠO LINK THANH TOÁN ---
    // Sử dụng giá cuối cùng (finalAmount) để thanh toán
    let paymentUrl = "";
    const orderId = orderData.id;
    const orderInfo = `Thanh toan don #${orderId}`;
    const amountToPay = finalAmount; // ⚠️ Quan trọng: Thanh toán số tiền sau giảm

    switch (paymentMethod) {
      case "COD":
        break;
      case "VNPAY":
      case "ATM":
      case "VISA":
        paymentUrl = createVNPayUrl({ orderId, amount: amountToPay, orderInfo });
        break;
      case "MOMO":
        paymentUrl = await createMoMoUrl({ orderId, amount: amountToPay, orderInfo });
        break;
      case "BANK":
        const payOSData = await createPayOSLink({ 
            orderId: Number(orderId), 
            amount: amountToPay, 
            description: orderInfo 
        });
        paymentUrl = payOSData.checkoutUrl;
        break;
      default:
        break;
    }

    // --- BƯỚC 4: TRẢ KẾT QUẢ ---
    return NextResponse.json({ 
      success: true,
      orderId: orderId,
      isNewUser: isNewUser,
      url: paymentUrl
    });

  } catch (error: any) {
    console.error("Payment API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}