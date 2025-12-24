import { MenuItem } from "./types";

export const DMP_DATA: Record<string, { title: string; items: MenuItem[]; type?: string }> = {
  ChamSocDaMat: {
    title: "Chăm sóc da mặt",
    type: "small",
    items: [
      { sub: "SuaRuaMat", sticker: "🧴", title: "Sữa rửa mặt (Kem, gel, sữa)", count: "67 sản phẩm", bg: "bg-blue-50" },
      { sub: "KemChongNang", sticker: "☀️", title: "Kem chống nắng da mặt", count: "17 sản phẩm", bg: "bg-orange-100" },
      { sub: "DuongDaMat", sticker: "💧", title: "Dưỡng da mặt", count: "23 sản phẩm", bg: "bg-pink-100" },
      { sub: "MatNa", sticker: "🎭", title: "Mặt nạ", count: "18 sản phẩm", bg: "bg-blue-50" },
      { sub: "Serum", sticker: "🧪", title: "Serum, Essence hoặc Ampoule", count: "9 sản phẩm", bg: "bg-yellow-100" },
      { sub: "Toner", sticker: "💦", title: "Toner (nước hoa hồng) / Lotion", count: "3 sản phẩm", bg: "bg-green-100" },
      { sub: "TayTeBaoChet", sticker: "🧖‍♀️", title: "Tẩy tế bào chết", count: "4 sản phẩm", bg: "bg-purple-50" },
      { sub: "XitKhoang", sticker: "🚿", title: "Xịt khoáng", count: "4 sản phẩm", bg: "bg-gray-100" },
      { sub: "TayTrang", sticker: "🌫️", title: "Nước tẩy trang, dầu tẩy trang", count: "19 sản phẩm", bg: "bg-blue-100" },
    ],
  },
  ChamSocCoThe: {
    title: "Chăm sóc cơ thể",
    type: "small",
    items: [
      { sub: "SuaTam", sticker: "🚿", title: "Sữa tắm, xà bông", count: "40 sản phẩm", bg: "bg-blue-100" },
      { sub: "ChongNangToanThan", sticker: "☀️", title: "Chống nắng toàn thân", count: "23 sản phẩm", bg: "bg-orange-100" },
      { sub: "KhuMui", sticker: "🌸", title: "Lăn khử mùi, xịt khử mùi", count: "20 sản phẩm", bg: "bg-gray-100" },
      { sub: "DuongThe", sticker: "🧴", title: "Sữa dưỡng thể, kem dưỡng thể", count: "32 sản phẩm", bg: "bg-pink-100" },
      { sub: "ChamSocDaNutNe", sticker: "🦶", title: "Chăm sóc da nứt nẻ", count: "7 sản phẩm", bg: "bg-blue-50" },
      { sub: "KemDuongDaTayChan", sticker: "✋", title: "Kem dưỡng da tay, chân", count: "10 sản phẩm", bg: "bg-yellow-100" },
      { sub: "ChamSocNguc", sticker: "👙", title: "Chăm sóc ngực", count: "1 sản phẩm", bg: "bg-purple-50" },
      { sub: "Massage", sticker: "💆‍♀️", title: "Massage", count: "5 sản phẩm", bg: "bg-red-50" },
    ],
  },
  GiaiPhapLanDa: {
    title: "Giải pháp làn da",
    type: "small",
    items: [
      { sub: "HoTroMoSeo", sticker: "✨", title: "Hỗ trợ mờ sẹo, mờ vết thâm", count: "19 sản phẩm", bg: "bg-blue-50" },
      { sub: "KemHoTroGiamMun", sticker: "🧴", title: "Kem hỗ trợ giảm mụn, gel hỗ trợ giảm mụn", count: "16 sản phẩm", bg: "bg-green-100" },
      { sub: "DuongDaKho", sticker: "💧", title: "Dưỡng da bị khô, thiếu ẩm", count: "22 sản phẩm", bg: "bg-blue-100" },
      { sub: "KemHoTroMoNam", sticker: "🟤", title: "Kem hỗ trợ mờ nám, tàn nhang, đốm nâu", count: "8 sản phẩm", bg: "bg-yellow-100" },
      { sub: "DaManCam", sticker: "🌿", title: "Da mẫn cảm, dễ kích ứng", count: "6 sản phẩm", bg: "bg-green-50" },
      { sub: "DaNhayCam", sticker: "🌸", title: "Da nhạy cảm", count: "3 sản phẩm", bg: "bg-pink-50" },
      { sub: "HoTroTaiTaoDa", sticker: "🔄", title: "Hỗ trợ tái tạo, cải thiện da lão hoá", count: "4 sản phẩm", bg: "bg-purple-50" },
      { sub: "DaSam", sticker: "🌑", title: "Da sạm, xỉn màu", count: "2 sản phẩm", bg: "bg-gray-100" },
    ],
  },
  ChamSocToc: {
    title: "Chăm sóc tóc - da đầu",
    type: "small",
    items: [
      { sub: "DauGoiDauXa", sticker: "🧴", title: "Dầu gội dầu xả", count: "39 sản phẩm", bg: "bg-green-100" },
      { sub: "GiamNamNgua", sticker: "💧", title: "Dầu gội giúp giảm nấm và ngứa da đầu", count: "4 sản phẩm", bg: "bg-blue-100" },
      { sub: "DuongToc", sticker: "👵", title: "Dưỡng tóc, ủ tóc", count: "4 sản phẩm", bg: "bg-gray-200" },
      { sub: "ChamSocChuyenSau", sticker: "💆‍♀️", title: "Chăm sóc chuyên sâu cho tóc", count: "1 sản phẩm", bg: "bg-pink-50" },
    ],
  },
  TrangDiem: {
    title: "Mỹ phẩm trang điểm",
    items: [
      { sub: "SonMoi", sticker: "💄", title: "Son môi", count: "16 sản phẩm", bg: "bg-pink-100" },
      { sub: "TrangDiemMat", sticker: "🪞", title: "Trang điểm mặt", count: "1 sản phẩm", bg: "bg-gray-100" },
    ],
  },
  VungMat: {
    title: "Chăm sóc da vùng mắt",
    items: [
      { sub: "CaiThienQuangTham", sticker: "👁️", title: "Hỗ trợ cải thiện quầng thâm, bọng mắt", count: "", bg: "bg-blue-50" },
      { sub: "CaiThienNepNhanMat", sticker: "🧴", title: "Hỗ trợ cải thiện nếp nhăn vùng mắt", count: "", bg: "bg-pink-50" },
      { sub: "DuongDaMat", sticker: "💆‍♀️", title: "Dưỡng da mắt", count: "3 sản phẩm", bg: "bg-green-50" },
    ],
  },
  ThienNhien: {
    title: "Sản phẩm từ thiên nhiên",
    items: [
      { sub: "TinhDau", sticker: "🪔", title: "Tinh dầu", count: "2 sản phẩm", bg: "bg-green-50" },
      { sub: "DauDua", sticker: "🥥", title: "Dầu dừa", count: "", bg: "bg-yellow-50" },
    ],
  },
};