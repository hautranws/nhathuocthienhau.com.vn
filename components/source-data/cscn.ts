import { MenuItem } from "./types";

export const CSCN_DATA: Record<string, { title: string; items: MenuItem[]; type?: string; icon?: string }> = {
  HoTroTinhDuc: {
    title: "Hỗ trợ tình dục",
    icon: "⚤",
    items: [
      { sub: "BaoCaoSu", sticker: "🛡️", title: "Bao cao su", count: "10 sản phẩm" },
      { sub: "GelBoiTron", sticker: "💧", title: "Gel bôi trơn", count: "5 sản phẩm" },
    ],
  },
  ThucPhamDoUong: {
    title: "Thực phẩm - Đồ uống",
    icon: "🥤",
    items: [
      { sub: "NuocYen", sticker: "🍵", title: "Nước Yến", count: "19 sản phẩm" },
      { sub: "KeoCung", sticker: "🍬", title: "Kẹo cứng", count: "20 sản phẩm" },
      { sub: "NuocUongKhongGas", sticker: "🥤", title: "Nước uống không gas", count: "5 sản phẩm" },
      { sub: "DuongAnKieng", sticker: "🧂", title: "Đường ăn kiêng", count: "7 sản phẩm" },
      { sub: "TraThaoDuoc", sticker: "🌿", title: "Trà thảo dược", count: "15 sản phẩm" },
      { sub: "KeoDeo", sticker: "🧸", title: "Kẹo dẻo", count: "" },
      { sub: "ToYen", sticker: "🕊️", title: "Tổ Yến", count: "" },
    ],
  },
  VeSinhCaNhan: {
    title: "Vệ sinh cá nhân",
    icon: "🧴",
    items: [
      { sub: "DungDichVeSinh", sticker: "✨", title: "Dung dịch vệ sinh phụ nữ", count: "24 sản phẩm" },
      { sub: "VeSinhTai", sticker: "👂", title: "Vệ sinh tai", count: "12 sản phẩm" },
      { sub: "BangVeSinh", sticker: "🌸", title: "Băng vệ sinh", count: "10 sản phẩm" },
      { sub: "NuocRuaTay", sticker: "🧼", title: "Nước rửa tay", count: "4 sản phẩm" },
      { sub: "BongTayTrang", sticker: "☁️", title: "Bông tẩy trang", count: "5 sản phẩm" },
    ],
  },
  ChamSocRangMieng: {
    title: "Chăm sóc răng miệng",
    icon: "🦷",
    items: [
      { sub: "KemDanhRang", sticker: "🪥", title: "Kem đánh răng", count: "6 sản phẩm" },
      { sub: "BanChaiDien", sticker: "⚡", title: "Bàn chải điện", count: "7 sản phẩm" },
      { sub: "ChiNhaKhoa", sticker: "🧵", title: "Chỉ nha khoa", count: "7 sản phẩm" },
      { sub: "ChamSocRang", sticker: "🦷", title: "Chăm sóc răng", count: "3 sản phẩm" },
      { sub: "NuocSucMieng", sticker: "💧", title: "Nước súc miệng", count: "16 sản phẩm" },
    ],
  },
  DoDungGiaDinh: {
    title: "Đồ dùng gia đình",
    icon: "🏠",
    items: [
      { sub: "DietConTrung", sticker: "🦟", title: "Chống muỗi & côn trùng", count: "14 sản phẩm" },
      { sub: "DoDungChoBe", sticker: "🍼", title: "Đồ dùng cho bé", count: "12 sản phẩm" },
      { sub: "DoDungChoMe", sticker: "🤰", title: "Đồ dùng cho mẹ", count: "3 sản phẩm" },
      { sub: "DauGio", sticker: "🧴", title: "Dầu gió, dầu nóng", count: "12 sản phẩm" },
    ],
  },
  HangTongHop: {
    title: "Hàng tổng hợp",
    icon: "📦",
    items: [
      { sub: "KhanGiayKhanUot", sticker: "🧻", title: "Khăn giấy, khăn ướt", count: "7 sản phẩm" },
      { sub: "TuiChuom", sticker: "🔥", title: "Túi chườm", count: "3 sản phẩm" },
      { sub: "DungCuKhac", sticker: "🛠️", title: "Dụng cụ khác", count: "10 sản phẩm" },
    ],
  },
  TinhDau: {
    title: "Tinh dầu các loại",
    icon: "💧",
    items: [
      { sub: "TinhDauMassage", sticker: "💆‍♀️", title: "Tinh dầu massage", count: "2 sản phẩm" },
      { sub: "TinhDauTriCam", sticker: "🌬️", title: "Tinh dầu trị cảm", count: "2 sản phẩm" },
      { sub: "TinhDauXong", sticker: "♨️", title: "Tinh dầu xông", count: "2 sản phẩm" },
      { sub: "TinhDauTram", sticker: "🌿", title: "Tinh dầu tràm", count: "5 sản phẩm" },
      { sub: "TinhDauKhuynhDiep", sticker: "🍃", title: "Tinh dầu khuynh diệp", count: "4 sản phẩm" },
    ],
  },
  ThietBiLamDep: {
    title: "Thiết bị làm đẹp",
    icon: "💅",
    items: [
      { sub: "DungCuTayLong", sticker: "🦵", title: "Dụng cụ tẩy lông", count: "2 sản phẩm" },
      { sub: "DungCuCaoRau", sticker: "🪒", title: "Dụng cụ cạo râu", count: "1 sản phẩm" },
      { sub: "MayRuaMat", sticker: "🧼", title: "Máy rửa mặt", count: "2 sản phẩm" },
      { sub: "MayMassageMat", sticker: "💆‍♀️", title: "Máy massage mặt", count: "3 sản phẩm" },
    ],
  },
};