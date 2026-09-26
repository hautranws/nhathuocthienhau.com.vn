import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin";
import nodemailer from "nodemailer";

// Giữ nguyên các hàm import thanh toán của bạn
import { createVNPayUrl } from "../../../../lib/payment/vnpay";
import { createMoMoUrl } from "../../../../lib/payment/momo";
import { createPayOSLink } from "../../../../lib/payment/payos";

// Import Zalo OA functions
import {
  sendZaloOAMessage,
  generateOrderMessage,
} from "../../../../lib/payment/zalo-oa";

type SubmittedOrderItem = {
  id: number | string;
  price: number | string;
  quantity: number | string;
};

type OrderProduct = {
  id: number;
  title: string;
  price: number;
  is_out_of_stock: boolean | null;
};

const isSubmittedOrderItem = (value: unknown): value is SubmittedOrderItem => {
  if (!value || typeof value !== "object") return false;

  const item = value as Record<string, unknown>;
  return (
    Number.isSafeInteger(Number(item.id)) &&
    Number(item.id) > 0 &&
    Number.isFinite(Number(item.price)) &&
    Number.isSafeInteger(Number(item.quantity)) &&
    Number(item.quantity) > 0
  );
};

const EMAIL_CONFIG = {
  user: process.env.ORDER_EMAIL_USER ?? "",
  pass: process.env.ORDER_EMAIL_APP_PASSWORD ?? "",
  staffEmail: process.env.ORDER_NOTIFICATION_EMAIL ?? "",
};

const ZALO_CONFIG = {
  appId: process.env.ZALO_OA_APP_ID ?? "",
  secretKey: process.env.ZALO_OA_SECRET_KEY ?? "",
  refreshToken: process.env.ZALO_OA_REFRESH_TOKEN ?? "",
  templateId: process.env.ZALO_ZNS_TEMPLATE_ID ?? "",
};

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      paymentMethod,
      couponCode,
      userId: clientUserId,
      mapLocation,
    } = body;
    const submittedItems = body.items;
    const customer = body.customer;

    if (!Array.isArray(submittedItems) || submittedItems.length === 0) {
      return NextResponse.json({ error: "Đơn hàng không có sản phẩm hợp lệ." }, { status: 400 });
    }

    if (
      !customer ||
      typeof customer.name !== "string" ||
      !customer.name.trim() ||
      typeof customer.phone !== "string" ||
      !customer.phone.trim() ||
      typeof customer.address !== "string" ||
      !customer.address.trim()
    ) {
      return NextResponse.json({ error: "Thông tin người nhận chưa hợp lệ." }, { status: 400 });
    }

    const name = customer.name.trim();
    const phone = customer.phone.trim();
    const address = customer.address.trim();
    const note = typeof customer.note === "string" ? customer.note : "";
    const deliveryMethod = customer.deliveryMethod === "store" ? "store" : "home";
    const shippingMode =
      deliveryMethod === "home" && body.shippingMode === "express"
        ? "express"
        : "standard";

    const validItems = submittedItems.filter(isSubmittedOrderItem);

    if (validItems.length !== submittedItems.length) {
      return NextResponse.json({ error: "Sản phẩm hoặc số lượng không hợp lệ." }, { status: 400 });
    }

    const productIds = Array.from(
      new Set(validItems.map((item) => Number(item.id))),
    );
    const { data: dbProducts, error: productsError } = await supabaseAdmin
      .from("products")
      .select("id, title, price, is_out_of_stock")
      .in("id", productIds);

    if (productsError) throw productsError;

    const products = (dbProducts || []) as OrderProduct[];
    const productsById = new Map(
      products.map((product) => [Number(product.id), product]),
    );

    if (productsById.size !== productIds.length) {
      return NextResponse.json({ error: "Một số sản phẩm không còn tồn tại." }, { status: 409 });
    }

    const outOfStockProduct = products.find((product) => product.is_out_of_stock);

    if (outOfStockProduct) {
      return NextResponse.json(
        { error: `Sản phẩm ${outOfStockProduct.title} hiện đã hết hàng.` },
        { status: 409 },
      );
    }

    const priceChanged = validItems.some((item) => {
      const product = productsById.get(Number(item.id));
      return !product || Number(item.price) !== Number(product.price);
    });

    if (priceChanged) {
      return NextResponse.json(
        { error: "Giá một số sản phẩm vừa thay đổi. Vui lòng tải lại giỏ hàng trước khi đặt." },
        { status: 409 },
      );
    }

    const items = validItems.map((item) => {
      const product = productsById.get(Number(item.id));
      if (!product) throw new Error("Không tìm thấy sản phẩm trong đơn hàng.");
      return {
        id: Number(product.id),
        title: product.title,
        price: Number(product.price),
        quantity: Number(item.quantity),
      };
    });

    const serverSubTotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const addressLower = address.toLowerCase();
    const isHCMC = ["hồ chí minh", "hcm", "sài gòn"].some((city) =>
      addressLower.includes(city),
    );
    if (shippingMode === "express" && serverSubTotal < 300000) {
      return NextResponse.json(
        { error: "Đơn giao nhanh cần có giá trị tối thiểu 300.000đ." },
        { status: 400 },
      );
    }

    const shippingFee =
      deliveryMethod === "store" ||
      serverSubTotal >= 99000 ||
      shippingMode === "express"
        ? 0
        : isHCMC
          ? 18000
          : 32000;

    let discountAmount = 0;
    let finalAmount = serverSubTotal + shippingFee;
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
        const isLimitReached =
          coupon.usage_limit > 0 && coupon.used_count >= coupon.usage_limit;
        const isMinOrderMet = serverSubTotal >= (coupon.min_order_value || 0);

        if (
          coupon.is_active &&
          !isExpired &&
          !isLimitReached &&
          isMinOrderMet
        ) {
          if (coupon.discount_type === "percent") {
            discountAmount = (serverSubTotal * coupon.discount_value) / 100;
          } else {
            discountAmount = coupon.discount_value;
          }

          if (
            coupon.max_discount_amount > 0 &&
            discountAmount > coupon.max_discount_amount
          ) {
            discountAmount = coupon.max_discount_amount;
          }
          if (discountAmount > serverSubTotal) discountAmount = serverSubTotal;
          finalAmount = serverSubTotal - discountAmount + shippingFee;
          appliedCouponCode = coupon.code;

          await supabaseAdmin
            .from("coupons")
            .update({ used_count: coupon.used_count + 1 })
            .eq("id", coupon.id);
        }
      }
    }

    // --- BƯỚC 1: XỬ LÝ USER (GIỮ NGUYÊN) ---

    let userId = clientUserId;
    let isNewUser = false;

    if (!userId) {
      let formattedPhone = phone.trim();
      if (formattedPhone.startsWith("0")) {
        formattedPhone = "84" + formattedPhone.substring(1);
      }
      formattedPhone = formattedPhone.replace("+", "");

      const randomPassword = Math.random().toString(36).slice(-8) + "Aa1@";

      const { data: newUser, error: createError } =
        await supabaseAdmin.auth.admin.createUser({
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
        console.log("User creation failed or exists:", createError?.message);
      }
    }

    const finalNote = [
      note,
      mapLocation ? `Bản đồ: ${mapLocation}` : null,
      shippingMode
        ? `Phương thức ship: ${shippingMode === "express" ? "Giao trong ngày" : "Giao tiêu chuẩn"}`
        : null,
      `Freeship: ${shippingFee === 0 ? "Có" : "Không"}`,
      `Phí ship: ${shippingFee.toLocaleString("vi-VN")}đ`,
    ]
      .filter(Boolean)
      .join(" | ");

    // --- BƯỚC 2: TẠO ĐƠN HÀNG VÀO DB (GIỮ NGUYÊN) ---
    const { data: orderData, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert([
        {
          user_id: userId,
          customer_name: name,
          phone: phone,
          address: address,
          total_price: serverSubTotal,
          final_price: finalAmount,
          discount_amount: discountAmount,
          coupon_code: appliedCouponCode,
          payment_method: paymentMethod,
          payment_status: "pending",
          note: finalNote,
        },
      ])
      .select()
      .single();

    if (orderError) throw orderError;

    // Lưu chi tiết sản phẩm
    const orderItemsData = items.map((item) => ({
      order_id: orderData.id,
      product_name: item.title,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error: itemsError } = await supabaseAdmin
      .from("order_items")
      .insert(orderItemsData);

    if (itemsError) throw itemsError;

    // ==================================================================
    // 🔥 GỬI THÔNG BÁO (ĐÃ BẬT LOGIC GỬI EMAIL)
    // ==================================================================
    (async () => {
      try {
        const orderId = orderData.id;
        const totalStr = finalAmount.toLocaleString("vi-VN");

        // 1. GỬI EMAIL (Sẽ hoạt động khi bạn điền đúng EMAIL_CONFIG ở trên)
        if (
          EMAIL_CONFIG.user &&
          EMAIL_CONFIG.pass &&
          EMAIL_CONFIG.staffEmail
        ) {
          console.log("🚀 Đang gửi Email báo đơn hàng...");
          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: { user: EMAIL_CONFIG.user, pass: EMAIL_CONFIG.pass },
          });

          const itemsHtml = items
            .map(
              (item) =>
                `<li>${item.title} - SL: <b>${item.quantity}</b></li>`,
            )
            .join("");

          let couponHtml = "";
          if (discountAmount > 0) {
            couponHtml = `<p style="color: green;"><b>🎁 Đã dùng mã:</b> ${appliedCouponCode} (Giảm ${discountAmount.toLocaleString()}đ)</p>`;
          }

          const mailOptions = {
            from: `"Nhà thuốc Thiên Hậu" <${EMAIL_CONFIG.user}>`,
            to: EMAIL_CONFIG.staffEmail,
            subject: `🔔 ĐƠN MỚI #${orderId} - Khách: ${name} - Giá trị: ${totalStr}đ`,
            html: `
              <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">📦 CÓ ĐƠN HÀNG MỚI!</h2>
                
                <p><b>Mã đơn hàng:</b> #${orderId}</p>
                <p><b>Khách hàng:</b> ${name}</p>
                <p><b>Điện thoại:</b> <a href="tel:${phone}" style="color: #d97706; font-weight: bold; text-decoration: none;">${phone}</a></p>
                <p><b>Địa chỉ nhận hàng:</b> ${address}</p>
                <p><b>Phương thức thanh toán:</b> ${paymentMethod}</p>
                <p><b>Ghi chú của khách:</b> <i>${note || "Không có"}</i></p>
                
                <h3 style="background-color: #f3f4f6; padding: 10px; margin-top: 20px;">🛒 Chi tiết sản phẩm:</h3>
                <ul style="line-height: 1.6;">${itemsHtml}</ul>
                
                <p>Giá gốc: ${serverSubTotal.toLocaleString()}đ</p>
                ${couponHtml}
                
                <h3 style="color: #dc2626; font-size: 20px; border-top: 1px dashed #ccc; padding-top: 15px;">
                  TỔNG THU: ${totalStr} VNĐ
                </h3>
                
                <p style="color: #4b5563; font-style: italic; margin-top: 20px;">Vui lòng kiểm tra và liên hệ khách hàng để xác nhận đơn!</p>
              </div>
                `,
          };

          await transporter.sendMail(mailOptions);
          console.log("✅ Gửi Email thành công!");
        } else {
          console.log("⚠️ Bỏ qua gửi Email vì chưa điền Cấu hình.");
        }

        // 2. GỬI TIN NHẮN ZALO OA (HÀNG CHÍNH, KHÔNG CẦN TEMPLATE)
        if (
          ZALO_CONFIG.appId &&
          ZALO_CONFIG.secretKey &&
          ZALO_CONFIG.refreshToken &&
          phone
        ) {
          try {
            console.log("🚀 Đang gửi Zalo OA message...");

            const orderMessage = generateOrderMessage({
              orderId,
              name,
              items,
              total: finalAmount,
              address,
              paymentMethod,
              note,
            });

            const result = await sendZaloOAMessage(
              ZALO_CONFIG.appId,
              ZALO_CONFIG.secretKey,
              ZALO_CONFIG.refreshToken,
              phone,
              orderMessage,
            );

            if (result.success) {
              console.log("✅ Gửi Zalo OA thành công!");
            } else {
              console.error("❌ Lỗi gửi Zalo OA:", result.error);
            }
          } catch (zaloOAError) {
            console.error("❌ Exception khi gửi Zalo OA:", zaloOAError);
          }
        } else {
          console.log("⚠️ Bỏ qua Zalo OA vì chưa điền đầy đủ Cấu hình.");
        }

        // 3. GỬI TIN NHẮN ZALO ZNS (TEMPLATE - TÙY CHỌN)
        if (
          ZALO_CONFIG.appId &&
          ZALO_CONFIG.secretKey &&
          ZALO_CONFIG.refreshToken &&
          ZALO_CONFIG.templateId &&
          phone
        ) {
          if (ZALO_CONFIG.templateId === "ID_MAU_TIN_ZNS_CUA_BAN") {
            console.log("⚠️ CHƯA GỬI ZALO ZNS: Bạn chưa điền Template ID.");
          } else {
            console.log("🚀 Đang xử lý Zalo ZNS...");
            let newAccessToken = "";
            try {
              const tokenRes = await fetch(
                "https://oauth.zaloapp.com/v4/oa/access_token",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    secret_key: ZALO_CONFIG.secretKey,
                  },
                  body: new URLSearchParams({
                    refresh_token: ZALO_CONFIG.refreshToken,
                    app_id: ZALO_CONFIG.appId,
                    grant_type: "refresh_token",
                  }),
                },
              );
              const tokenData = await tokenRes.json();
              if (tokenData.access_token) {
                newAccessToken = tokenData.access_token;
                console.log("✅ Đã làm mới Access Token Zalo thành công!");
              }
            } catch (tokenErr) {
              console.error("❌ Lỗi kết nối Zalo Auth:", tokenErr);
            }

            if (newAccessToken) {
              let zaloPhone = phone.trim();
              if (zaloPhone.startsWith("0"))
                zaloPhone = "84" + zaloPhone.substring(1);
              zaloPhone = zaloPhone.replace(/\D/g, "");

              const znsRes = await fetch(
                "https://business.openapi.zalo.me/message/template",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    access_token: newAccessToken,
                  },
                  body: JSON.stringify({
                    phone: zaloPhone,
                    template_id: ZALO_CONFIG.templateId,
                    template_data: {
                      customer_name: name,
                      order_code: String(orderId),
                      total_amount: totalStr + " đ",
                      status: "Đang xử lý",
                    },
                    tracking_id: String(orderId),
                  }),
                },
              );

              const znsData = await znsRes.json();
              if (znsData.error !== 0)
                console.error("❌ Lỗi gửi ZNS:", znsData);
            }
          }
        }
      } catch (notifyError) {
        console.error("❌ Lỗi gửi thông báo:", notifyError);
      }
    })();

    // --- BƯỚC 3: TRẢ LINK THANH TOÁN (ĐÃ THÊM PAYOS) ---
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
        paymentUrl = createVNPayUrl({
          orderId,
          amount: amountToPay,
          orderInfo,
        });
        break;
      case "MOMO":
        paymentUrl = await createMoMoUrl({
          orderId,
          amount: amountToPay,
          orderInfo,
        });
        break;
      case "BANK":
      case "PAYOS":
        const payOSData = await createPayOSLink({
          orderId: Number(orderId),
          amount: amountToPay,
          description: orderInfo,
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
      url: paymentUrl,
    });
  } catch (error: unknown) {
    console.error("Payment API Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Lỗi xử lý thanh toán." },
      { status: 500 },
    );
  }
}
