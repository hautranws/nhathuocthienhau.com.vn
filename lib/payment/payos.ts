export async function createPayOSLink({ orderId, amount, description }: any) {
  console.log("Đang gọi PayOS cho đơn:", orderId);
  return { checkoutUrl: "https://payos.vn" };
}