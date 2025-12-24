import { MenuItem } from "./types";

export const TBYT_DATA: Record<string, { title: string; items: MenuItem[]; type?: string; icon?: string }> = {
  DungCuYTe: {
    title: "Dụng cụ y tế",
    icon: "🩺",
    items: [
      { sub: "DungCuVeSinhMui", sticker: "👃", title: "Dụng cụ vệ sinh mũi", count: "56 sản phẩm" },
      { sub: "KimCacLoai", sticker: "💉", title: "Kim các loại", count: "41 sản phẩm" },
      { sub: "MayMassage", sticker: "💆", title: "Máy massage", count: "9 sản phẩm" },
      { sub: "TuiChuom", sticker: "🔥", title: "Túi chườm", count: "5 sản phẩm" },
      { sub: "VoNganTinhMach", sticker: "🦵", title: "Vớ ngăn tĩnh mạch", count: "11 sản phẩm" },
      { sub: "GangTay", sticker: "🧤", title: "Găng tay", count: "15 sản phẩm" },
      { sub: "DaiLung", sticker: "🦴", title: "Đai lưng", count: "12 sản phẩm" },
      { sub: "DungCuVeSinhTai", sticker: "👂", title: "Dụng cụ vệ sinh tai", count: "2 sản phẩm" },
      { sub: "DaiNep", sticker: "🤕", title: "Đai nẹp", count: "47 sản phẩm" },
      { sub: "MayXongKhiDung", sticker: "🌬️", title: "Máy xông khí dung", count: "10 sản phẩm" },
      { sub: "CacDungCuKhac", sticker: "🛠️", title: "Các dụng cụ và sản phẩm khác", count: "74 sản phẩm" },
    ],
  },
  DungCuTheoDoi: {
    title: "Dụng cụ theo dõi",
    icon: "🩺",
    items: [
      { sub: "MayDoHuyetAp", sticker: "🩺", title: "Máy đo huyết áp", count: "32 sản phẩm" },
      { sub: "MayDoDuongHuyet", sticker: "💉", title: "Máy, que thử đường huyết", count: "31 sản phẩm" },
      { sub: "ThuThai", sticker: "👶", title: "Thử thai", count: "7 sản phẩm" },
      { sub: "NhietKe", sticker: "🌡️", title: "Nhiệt kế", count: "10 sản phẩm" },
      { sub: "KitTestCovid", sticker: "🦠", title: "Kit Test Covid", count: "5 sản phẩm" },
      { sub: "MayDoSpO2", sticker: "🌬️", title: "Máy đo SpO2", count: "5 sản phẩm" },
    ],
  },
  DungCuSoCuu: {
    title: "Dụng cụ sơ cứu",
    icon: "🚑",
    items: [
      { sub: "BangYTe", sticker: "🩹", title: "Băng y tế", count: "69 sản phẩm" },
      { sub: "BongYTe", sticker: "☁️", title: "Bông y tế", count: "18 sản phẩm" },
      { sub: "ConNuocSatTrung", sticker: "🧴", title: "Cồn, nước sát trùng, nước muối", count: "14 sản phẩm" },
      { sub: "ChamSocVetThuong", sticker: "🩹", title: "Chăm sóc vết thương", count: "13 sản phẩm" },
      { sub: "XitGiamDau", sticker: "💨", title: "Xịt giảm đau, kháng viêm", count: "6 sản phẩm" },
      { sub: "MiengDanGiamDau", sticker: "🤕", title: "Miếng dán giảm đau, hạ sốt", count: "8 sản phẩm" },
    ],
  },
  KhauTrang: {
    title: "Khẩu trang y tế",
    icon: "😷",
    items: [
      { sub: "KhauTrangYTe", sticker: "😷", title: "Khẩu trang y tế", count: "33 sản phẩm" },
      { sub: "KhauTrangVai", sticker: "😷", title: "Khẩu trang vải", count: "" },
    ],
  },
};