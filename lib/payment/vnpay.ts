export function createVNPayUrl({ orderId, amount, orderInfo }: any) {
  console.log("Đang gọi VNPay cho đơn:", orderId);
  return "https://vnpay.vn";
}