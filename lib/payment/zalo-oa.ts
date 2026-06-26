// Hàm helper để gửi Zalo OA message
export async function sendZaloOAMessage(
  appId: string,
  secretKey: string,
  refreshToken: string,
  phone: string,
  message: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Bước 1: Lấy Access Token bằng Refresh Token
    console.log("🔄 Đang lấy Access Token từ Refresh Token...");
    const tokenRes = await fetch(
      "https://oauth.zaloapp.com/v4/oa/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          secret_key: secretKey,
        },
        body: new URLSearchParams({
          refresh_token: refreshToken,
          app_id: appId,
          grant_type: "refresh_token",
        }),
      },
    );

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      console.error("❌ Lỗi lấy Access Token:", tokenData);
      return { success: false, error: "Không thể lấy Access Token" };
    }

    const accessToken = tokenData.access_token;
    console.log("✅ Đã lấy Access Token thành công");

    // Bước 2: Format số điện thoại thành định dạng Zalo (84xx...)
    let formattedPhone = phone.trim();
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "84" + formattedPhone.substring(1);
    }
    formattedPhone = formattedPhone.replace(/\D/g, "");

    console.log("📱 Gửi tin nhắn Zalo OA đến:", formattedPhone);

    // Bước 3: Gửi tin nhắn OA thô (không cần template)
    const messageRes = await fetch(
      "https://business.openapi.zalo.me/message/send",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          access_token: accessToken,
        },
        body: JSON.stringify({
          phone: formattedPhone,
          message: message,
        }),
      },
    );

    const messageData = await messageRes.json();

    if (messageData.error === 0) {
      console.log("✅ Gửi Zalo OA thành công!");
      return { success: true };
    } else {
      console.error("❌ Lỗi gửi Zalo OA:", messageData);
      return {
        success: false,
        error: messageData.message || "Lỗi không rõ",
      };
    }
  } catch (err: any) {
    console.error("❌ Exception khi gửi Zalo OA:", err.message);
    return { success: false, error: err.message };
  }
}

// Hàm tạo nội dung tin nhắn đơn hàng
export function generateOrderMessage(orderData: {
  orderId: number;
  name: string;
  items: any[];
  total: number;
  address: string;
  paymentMethod: string;
  note?: string;
}): string {
  const itemsList = orderData.items
    .map((item) => `• ${item.title || item.name} x${item.quantity}`)
    .join("\n");

  const message = `
👋 Xin chào ${orderData.name}!

📦 Cảm ơn bạn đã đặt hàng tại Nhà Thuốc Thiên Hậu.

🧾 CHI TIẾT ĐƠN HÀNG #${orderData.orderId}
${itemsList}

💰 TỔNG TIỀN: ${orderData.total.toLocaleString()}đ
📍 ĐỊA CHỈ GIAO: ${orderData.address}
💳 THANH TOÁN: ${orderData.paymentMethod}
${orderData.note ? `📝 GHI CHÚ: ${orderData.note}` : ""}

✅ Đơn hàng của bạn đã được tiếp nhận. 
Chúng tôi sẽ liên hệ sớm để xác nhận.

📞 Liên hệ: 1800 6928 (Tư vấn miễn phí)

Cảm ơn bạn! 🙏
Nhà Thuốc Thiên Hậu
`.trim();

  return message;
}
