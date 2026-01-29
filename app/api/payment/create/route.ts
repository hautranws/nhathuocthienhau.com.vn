import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin";
import nodemailer from "nodemailer"; 

// Giữ nguyên các hàm import thanh toán của bạn
import { createVNPayUrl } from "../../../../lib/payment/vnpay";
import { createMoMoUrl } from "../../../../lib/payment/momo";
import { createPayOSLink } from "../../../../lib/payment/payos";

// ==================================================================
// ⚙️ CẤU HÌNH GỬI THÔNG BÁO (GIỮ NGUYÊN)
// ==================================================================

const EMAIL_CONFIG = {
  user: "email_cua_ban@gmail.com", 
  pass: "xxxx xxxx xxxx xxxx",     
  staffEmail: "email_nhan_vien@gmail.com", 
};

const ZALO_CONFIG = {
  accessToken: "DIEN_ZALO_ACCESS_TOKEN_VAO_DAY", 
  oaId: "ID_ZALO_OA_CUA_BAN", 
};

// ==================================================================

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 👇 [SỬA] Nhận thêm userId từ Frontend gửi lên
    const { items, customer, paymentMethod, couponCode, userId: clientUserId } = body;
    const { name, phone, address, note } = customer;

    // --- BƯỚC 0: TÍNH TOÁN LẠI GIÁ & MÃ GIẢM GIÁ (GIỮ NGUYÊN) ---
    const serverSubTotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    
    let discountAmount = 0;
    let finalAmount = serverSubTotal;
    let appliedCouponCode = null;

    if (couponCode) {
        const { data: coupon } = await supabaseAdmin
            .from("coupons")
            .select("*")
            .eq("code", couponCode.toUpperCase().trim())
            .single();

        if (coupon) {
            const now = new Date();
            const expiry = coupon.expiry_date ? new Date(coupon.expiry_date) : null;
            const isExpired = expiry && now > expiry;
            const isLimitReached = coupon.usage_limit > 0 && coupon.used_count >= coupon.usage_limit;
            const isMinOrderMet = serverSubTotal >= (coupon.min_order_value || 0);

            if (coupon.is_active && !isExpired && !isLimitReached && isMinOrderMet) {
                if (coupon.discount_type === 'percent') {
                    discountAmount = (serverSubTotal * coupon.discount_value) / 100;
                } else {
                    discountAmount = coupon.discount_value;
                }
                
                if (discountAmount > serverSubTotal) discountAmount = serverSubTotal;
                finalAmount = serverSubTotal - discountAmount;
                appliedCouponCode = coupon.code;

                await supabaseAdmin.from("coupons").update({ used_count: coupon.used_count + 1 }).eq("id", coupon.id);
            }
        }
    }

    // --- [SỬA] BƯỚC 1: XỬ LÝ USER (ƯU TIÊN USER ĐANG ĐĂNG NHẬP) ---
    
    let userId = clientUserId; // 1. Ưu tiên dùng ID từ frontend gửi lên
    let isNewUser = false;

    // 2. Chỉ khi KHÔNG CÓ userId (Khách vãng lai) thì mới tạo User mới theo SĐT
    if (!userId) {
        let formattedPhone = phone.trim();
        if (formattedPhone.startsWith("0")) {
          formattedPhone = "84" + formattedPhone.substring(1);
        }
        formattedPhone = formattedPhone.replace("+", "");

        const randomPassword = Math.random().toString(36).slice(-8) + "Aa1@";

        // Tạo user mới
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
        } else {
           // [MỞ RỘNG] Nếu tạo lỗi (do SĐT đã tồn tại), cố gắng tìm user đó để gán đơn hàng (tránh đơn vô chủ)
           // Lưu ý: Phần này tùy chọn, nếu muốn an toàn thì để userId = null đơn vẫn tạo được nhưng không gắn vào ai
           console.log("User creation failed or exists:", createError?.message);
        }
    }

    // --- BƯỚC 2: TẠO ĐƠN HÀNG VÀO DB (GIỮ NGUYÊN) ---
    const { data: orderData, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert([
        {
          user_id: userId, // ID này giờ đây có thể là của khách cũ hoặc mới
          customer_name: name,
          phone: phone,
          address: address,
          total_price: serverSubTotal,
          final_price: finalAmount,
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
    // 🔥 GỬI THÔNG BÁO (GIỮ NGUYÊN)
    // ==================================================================
    (async () => {
      try {
        const orderId = orderData.id;
        const totalStr = finalAmount.toLocaleString("vi-VN"); 
        
        if (EMAIL_CONFIG.user && EMAIL_CONFIG.pass) {
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: { user: EMAIL_CONFIG.user, pass: EMAIL_CONFIG.pass },
            });

            const itemsHtml = items.map((item: any) => 
                `<li>${item.title || item.name} - SL: <b>${item.quantity}</b></li>`
            ).join("");

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

        if (ZALO_CONFIG.accessToken && phone) {
             // Logic Zalo giữ nguyên
        }

      } catch (notifyError) {
        console.error("❌ Lỗi gửi thông báo:", notifyError);
      }
    })();


    // --- BƯỚC 3: TẠO LINK THANH TOÁN (GIỮ NGUYÊN) ---
    let paymentUrl = "";
    const orderId = orderData.id;
    const orderInfo = `Thanh toan don #${orderId}`;
    const amountToPay = finalAmount;

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