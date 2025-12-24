import { MenuItem } from "./types";

export const TPCN_DATA: Record<string, { title: string; items: MenuItem[]; type?: string }> = {
  Vitamin: {
    title: "Vitamin và Khoáng chất",
    items: [
      { sub: "CanxiVaVitaminD", sticker: "🦴", title: "Bổ sung Canxi và Vitamin D", count: "25 sản phẩm" },
      { sub: "VitaminTongHop", sticker: "⚡", title: "Vitamin tổng hợp", count: "27 sản phẩm" },
      { sub: "DauCa", sticker: "🐟", title: "Dầu cá, Omega 3, DHA", count: "11 sản phẩm" },
      { sub: "VitaminC", sticker: "🍊", title: "Vitamin C các loại", count: "6 sản phẩm" },
      { sub: "Sat", sticker: "🩸", title: "Bổ sung Sắt & Axit Folic", count: "4 sản phẩm" },
      { sub: "VitaminE", sticker: "💊", title: "Vitamin E các loại", count: "3 sản phẩm" },
      { sub: "KemMagie", sticker: "🛡️", title: "Bổ sung Kẽm & Magie", count: "5 sản phẩm" },
    ],
  },
  SinhLy: {
    title: "Sinh lý - Nội tiết tố",
    type: "small",
    items: [
      { sub: "SinhLyNam", sticker: "🚹", title: "Sinh lý nam", bg: "bg-blue-100" },
      { sub: "SinhLyNu", sticker: "🚺", title: "Sinh lý nữ", bg: "bg-pink-100" },
      { sub: "NoiTiet", sticker: "⚖️", title: "Cân bằng nội tiết", bg: "bg-purple-100" },
      { sub: "SuaKhoeTinhDuc", sticker: "❤️", title: "Sức khỏe tình dục", bg: "bg-red-100" },
      { sub: "ManKinh", sticker: "🍂", title: "Hỗ trợ mãn kinh", bg: "bg-orange-100" },
    ],
  },
  TangCuong: {
    title: "Tăng cường chức năng",
    items: [
      { sub: "ChucNangGan", sticker: "🍺", title: "Chức năng gan", count: "34 sản phẩm" },
      { sub: "TangSucDeKhang", sticker: "🛡️", title: "Tăng sức đề kháng, miễn dịch", count: "39 sản phẩm" },
      { sub: "BoMat", sticker: "👀", title: "Bổ mắt, bảo vệ mắt", count: "12 sản phẩm" },
      { sub: "HoTroTraoDoiChat", sticker: "🔄", title: "Hỗ trợ trao đổi chất", count: "7 sản phẩm" },
      { sub: "GiaiRuou", sticker: "🍷", title: "Giải rượu, cai rượu", count: "4 sản phẩm" },
      { sub: "ChongLaoHoa", sticker: "✨", title: "Chống lão hóa", count: "1 sản phẩm" },
    ],
  },
  HoTro: {
    title: "Hỗ trợ điều trị",
    items: [
      { sub: "CoXuongKhop", sticker: "🦴", title: "Cơ xương khớp", count: "34 sản phẩm" },
      { sub: "HoHapHoXoang", sticker: "🌬️", title: "Hô hấp, ho, xoang", count: "39 sản phẩm" },
      { sub: "ThanTienLietTuyen", sticker: "🚽", title: "Thận, tiền liệt tuyến", count: "15 sản phẩm" },
      { sub: "HoTroTriTri", sticker: "🍑", title: "Hỗ trợ điều trị trĩ", count: "7 sản phẩm" },
      { sub: "HoTroTriGout", sticker: "🦵", title: "Hỗ trợ điều trị gout", count: "4 sản phẩm" },
      { sub: "HoTroTriTieuDuong", sticker: "🩸", title: "Hỗ trợ điều trị tiểu đường", count: "8 sản phẩm" },
      { sub: "HoTroTriUngThu", sticker: "🦀", title: "Hỗ trợ điều trị ung thư", count: "1 sản phẩm" },
    ],
  },
  TieuHoa: {
    title: "Hỗ trợ tiêu hóa",
    items: [
      { sub: "DaDayTaTrang", sticker: "🤢", title: "Dạ dày, tá tràng", count: "15 sản phẩm" },
      { sub: "TaoBon", sticker: "💩", title: "Táo bón", count: "5 sản phẩm" },
      { sub: "ViSinhProbiotic", sticker: "🦠", title: "Vi sinh - Probiotic", count: "23 sản phẩm" },
      { sub: "DaiTrang", sticker: "🧬", title: "Đại tràng", count: "7 sản phẩm" },
      { sub: "KhoTieu", sticker: "🥴", title: "Khó tiêu", count: "5 sản phẩm" },
    ],
  },
  ThanKinh: {
    title: "Thần kinh não",
    items: [
      { sub: "BoNaoCaiThienTriNho", sticker: "🧠", title: "Bổ não - cải thiện trí nhớ", count: "25 sản phẩm" },
      { sub: "HoTroGiacNguNgon", sticker: "😴", title: "Hỗ trợ giấc ngủ ngon", count: "15 sản phẩm" },
      { sub: "TuanHoanMau", sticker: "🔄", title: "Tuần hoàn máu", count: "5 sản phẩm" },
      { sub: "KiemSoatCangThang", sticker: "😌", title: "Kiểm soát căng thẳng", count: "1 sản phẩm" },
      { sub: "HoatHuyet", sticker: "🩸", title: "Hoạt huyết", count: "4 sản phẩm" },
    ],
  },
  LamDep: {
    title: "Hỗ trợ làm đẹp",
    items: [
      { sub: "Da", sticker: "👩", title: "Da", count: "11 sản phẩm" },
      { sub: "HoTroGiamCan", sticker: "⚖️", title: "Hỗ trợ giảm cân", count: "" },
      { sub: "Toc", sticker: "💇‍♀️", title: "Tóc", count: "7 sản phẩm" },
    ],
  },
  TimMach: {
    title: "Sức khỏe tim mạch",
    items: [
      { sub: "GiamCholesterol", sticker: "🍔", title: "Giảm Cholesterol", count: "6 sản phẩm" },
      { sub: "HuyetAp", sticker: "💊", title: "Huyết áp", count: "2 sản phẩm" },
      { sub: "SuyGianTinhMach", sticker: "🦶", title: "Suy giãn tĩnh mạch", count: "3 sản phẩm" },
    ],
  },
  DinhDuong: {
    title: "Dinh dưỡng",
    items: [
      { sub: "Sua", sticker: "🥛", title: "Sữa", count: "37 sản phẩm" },
      { sub: "DinhDuongTreEm", sticker: "🍼", title: "Dinh dưỡng trẻ em", count: "1 sản phẩm" },
    ],
  },
};