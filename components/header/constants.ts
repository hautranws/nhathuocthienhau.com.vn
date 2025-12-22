// components/header/constants.ts
import { TPCN_DATA, DMP_DATA, CSCN_DATA, TBYT_DATA } from "../data";

export const TOP_SEARCHES = [
  "Omega 3",
  "Canxi",
  "Dung dịch vệ sinh",
  "Sữa rửa mặt",
  "Thuốc nhỏ mắt",
  "Kẽm",
  "Kem chống nắng",
  "Men vi sinh",
  "Vitamin C",
  "Bổ não",
];

export const THUOC_SIDEBAR = [
  { id: "TraCuuThuoc", l: "Tra cứu thuốc", i: "💊" },
  { id: "TraCuuDuocChat", l: "Tra cứu dược chất", i: "⚗️" },
  { id: "TraCuuDuocLieu", l: "Tra cứu dược liệu", i: "🌿" },
];

export const THUOC_GRID = [
  { t: "Thuốc kháng sinh", i: "🦠", bg: "bg-green-50" },
  { t: "Thuốc điều trị ung thư", i: "🧬", bg: "bg-red-50" },
  { t: "Thuốc tim mạch", i: "❤️", bg: "bg-pink-50" },
  { t: "Thuốc thần kinh", i: "🧠", bg: "bg-purple-50" },
  { t: "Thuốc tiêu hóa", i: "🤢", bg: "bg-yellow-50" },
];

export const BENH_SIDEBAR = [
  { t: "Chuyên trang ung thư", i: "🧬" },
  { t: "Bệnh thường gặp", i: "🤕" },
  { t: "Tin khuyến mại", i: "🎉" },
  { t: "Truyền Thông", i: "🌟" },
];

export const NAV_ITEMS = [
  {
    id: "TPCN",
    label: "Thực phẩm chức năng",
    href: "/category/Thực phẩm chức năng",
    data: TPCN_DATA,
    defaultTab: "Vitamin",
    type: "dynamic",
  },
  {
    id: "DMP",
    label: "Dược mỹ phẩm",
    href: "/category/Dược mỹ phẩm",
    data: DMP_DATA,
    defaultTab: "ChamSocDaMat",
    type: "dynamic",
  },
  {
    id: "THUOC",
    label: "Thuốc",
    href: "/category/Thuốc",
    data: null,
    defaultTab: "TraCuuThuoc",
    type: "custom_thuoc",
  },
  {
    id: "CSCN",
    label: "Chăm sóc cá nhân",
    href: "/category/Chăm sóc cá nhân",
    data: CSCN_DATA,
    defaultTab: "HoTroTinhDuc",
    type: "dynamic",
  },
  {
    id: "TBYT",
    label: "Thiết bị y tế",
    href: "/category/Thiết bị y tế",
    data: TBYT_DATA,
    defaultTab: "DungCuYTe",
    type: "dynamic",
  },
  {
    id: "BENH",
    label: "Bệnh & Góc sức khỏe",
    href: "#",
    data: null,
    defaultTab: null,
    type: "custom_benh",
  },
];
