// Định nghĩa kiểu dữ liệu (Optional, giúp code chuẩn hơn)
export interface MenuItem {
  sub: string;
  sticker: string;
  title: string;
  count?: string;
  bg?: string;
}

export const TPCN_DATA: Record<
  string,
  { title: string; items: MenuItem[]; type?: string }
> = {
  Vitamin: {
    title: "Vitamin và Khoáng chất",
    items: [
      {
        sub: "CanxiVaVitaminD",
        sticker: "🦴",
        title: "Bổ sung Canxi và Vitamin D",
        count: "25 sản phẩm",
      },
      {
        sub: "VitaminTongHop",
        sticker: "⚡",
        title: "Vitamin tổng hợp",
        count: "27 sản phẩm",
      },
      {
        sub: "DauCa",
        sticker: "🐟",
        title: "Dầu cá, Omega 3, DHA",
        count: "11 sản phẩm",
      },
      {
        sub: "VitaminC",
        sticker: "🍊",
        title: "Vitamin C các loại",
        count: "6 sản phẩm",
      },
      {
        sub: "Sat",
        sticker: "🩸",
        title: "Bổ sung Sắt & Axit Folic",
        count: "4 sản phẩm",
      },
      {
        sub: "VitaminE",
        sticker: "💊",
        title: "Vitamin E các loại",
        count: "3 sản phẩm",
      },
      {
        sub: "KemMagie",
        sticker: "🛡️",
        title: "Bổ sung Kẽm & Magie",
        count: "5 sản phẩm",
      },
    ],
  },
  SinhLy: {
    title: "Sinh lý - Nội tiết tố",
    type: "small",
    items: [
      {
        sub: "SinhLyNam",
        sticker: "🚹",
        title: "Sinh lý nam",
        bg: "bg-blue-100",
      },
      {
        sub: "SinhLyNu",
        sticker: "🚺",
        title: "Sinh lý nữ",
        bg: "bg-pink-100",
      },
      {
        sub: "NoiTiet",
        sticker: "⚖️",
        title: "Cân bằng nội tiết",
        bg: "bg-purple-100",
      },
      {
        sub: "SuaKhoeTinhDuc",
        sticker: "❤️",
        title: "Sức khỏe tình dục",
        bg: "bg-red-100",
      },
      {
        sub: "ManKinh",
        sticker: "🍂",
        title: "Hỗ trợ mãn kinh",
        bg: "bg-orange-100",
      },
    ],
  },
  TangCuong: {
    title: "Tăng cường chức năng",
    items: [
      {
        sub: "ChucNangGan",
        sticker: "🍺",
        title: "Chức năng gan",
        count: "34 sản phẩm",
      },
      {
        sub: "TangSucDeKhang",
        sticker: "🛡️",
        title: "Tăng sức đề kháng, miễn dịch",
        count: "39 sản phẩm",
      },
      {
        sub: "BoMat",
        sticker: "👀",
        title: "Bổ mắt, bảo vệ mắt",
        count: "12 sản phẩm",
      },
      {
        sub: "HoTroTraoDoiChat",
        sticker: "🔄",
        title: "Hỗ trợ trao đổi chất",
        count: "7 sản phẩm",
      },
      {
        sub: "GiaiRuou",
        sticker: "🍷",
        title: "Giải rượu, cai rượu",
        count: "4 sản phẩm",
      },
      {
        sub: "ChongLaoHoa",
        sticker: "✨",
        title: "Chống lão hóa",
        count: "1 sản phẩm",
      },
    ],
  },
  HoTro: {
    title: "Hỗ trợ điều trị",
    items: [
      {
        sub: "CoXuongKhop",
        sticker: "🦴",
        title: "Cơ xương khớp",
        count: "34 sản phẩm",
      },
      {
        sub: "HoHapHoXoang",
        sticker: "🌬️",
        title: "Hô hấp, ho, xoang",
        count: "39 sản phẩm",
      },
      {
        sub: "ThanTienLietTuyen",
        sticker: "🚽",
        title: "Thận, tiền liệt tuyến",
        count: "15 sản phẩm",
      },
      {
        sub: "HoTroTriTri",
        sticker: "🍑",
        title: "Hỗ trợ điều trị trĩ",
        count: "7 sản phẩm",
      },
      {
        sub: "HoTroTriGout",
        sticker: "🦵",
        title: "Hỗ trợ điều trị gout",
        count: "4 sản phẩm",
      },
      {
        sub: "HoTroTriTieuDuong",
        sticker: "🩸",
        title: "Hỗ trợ điều trị tiểu đường",
        count: "8 sản phẩm",
      },
      {
        sub: "HoTroTriUngThu",
        sticker: "🦀",
        title: "Hỗ trợ điều trị ung thư",
        count: "1 sản phẩm",
      },
    ],
  },
  TieuHoa: {
    title: "Hỗ trợ tiêu hóa",
    items: [
      {
        sub: "DaDayTaTrang",
        sticker: "🤢",
        title: "Dạ dày, tá tràng",
        count: "15 sản phẩm",
      },
      { sub: "TaoBon", sticker: "💩", title: "Táo bón", count: "5 sản phẩm" },
      {
        sub: "ViSinhProbiotic",
        sticker: "🦠",
        title: "Vi sinh - Probiotic",
        count: "23 sản phẩm",
      },
      {
        sub: "DaiTrang",
        sticker: "🧬",
        title: "Đại tràng",
        count: "7 sản phẩm",
      },
      { sub: "KhoTieu", sticker: "🥴", title: "Khó tiêu", count: "5 sản phẩm" },
    ],
  },
  ThanKinh: {
    title: "Thần kinh não",
    items: [
      {
        sub: "BoNaoCaiThienTriNho",
        sticker: "🧠",
        title: "Bổ não - cải thiện trí nhớ",
        count: "25 sản phẩm",
      },
      {
        sub: "HoTroGiacNguNgon",
        sticker: "😴",
        title: "Hỗ trợ giấc ngủ ngon",
        count: "15 sản phẩm",
      },
      {
        sub: "TuanHoanMau",
        sticker: "🔄",
        title: "Tuần hoàn máu",
        count: "5 sản phẩm",
      },
      {
        sub: "KiemSoatCangThang",
        sticker: "😌",
        title: "Kiểm soát căng thẳng",
        count: "1 sản phẩm",
      },
      {
        sub: "HoatHuyet",
        sticker: "🩸",
        title: "Hoạt huyết",
        count: "4 sản phẩm",
      },
    ],
  },
  LamDep: {
    title: "Hỗ trợ làm đẹp",
    items: [
      { sub: "Da", sticker: "👩", title: "Da", count: "11 sản phẩm" },
      {
        sub: "HoTroGiamCan",
        sticker: "⚖️",
        title: "Hỗ trợ giảm cân",
        count: "",
      },
      { sub: "Toc", sticker: "💇‍♀️", title: "Tóc", count: "7 sản phẩm" },
    ],
  },
  TimMach: {
    title: "Sức khỏe tim mạch",
    items: [
      {
        sub: "GiamCholesterol",
        sticker: "🍔",
        title: "Giảm Cholesterol",
        count: "6 sản phẩm",
      },
      {
        sub: "HuyetAp",
        sticker: "💊",
        title: "Huyết áp",
        count: "2 sản phẩm",
      },
      {
        sub: "SuyGianTinhMach",
        sticker: "🦶",
        title: "Suy giãn tĩnh mạch",
        count: "3 sản phẩm",
      },
    ],
  },
  DinhDuong: {
    title: "Dinh dưỡng",
    items: [
      {
        sub: "Sua",
        sticker: "🥛",
        title: "Sữa",
        count: "37 sản phẩm",
      },
      {
        sub: "DinhDuongTreEm",
        sticker: "🍼",
        title: "Dinh dưỡng trẻ em",
        count: "1 sản phẩm",
      },
    ],
  },
};

export const DMP_DATA: Record<
  string,
  { title: string; items: MenuItem[]; type?: string }
> = {
  ChamSocDaMat: {
    title: "Chăm sóc da mặt",
    type: "small",
    items: [
      {
        sub: "SuaRuaMat",
        sticker: "🧴",
        title: "Sữa rửa mặt (Kem, gel, sữa)",
        count: "67 sản phẩm",
        bg: "bg-blue-50",
      },
      {
        sub: "KemChongNang",
        sticker: "☀️",
        title: "Kem chống nắng da mặt",
        count: "17 sản phẩm",
        bg: "bg-orange-100",
      },
      {
        sub: "DuongDaMat",
        sticker: "💧",
        title: "Dưỡng da mặt",
        count: "23 sản phẩm",
        bg: "bg-pink-100",
      },
      {
        sub: "MatNa",
        sticker: "🎭",
        title: "Mặt nạ",
        count: "18 sản phẩm",
        bg: "bg-blue-50",
      },
      {
        sub: "Serum",
        sticker: "🧪",
        title: "Serum, Essence hoặc Ampoule",
        count: "9 sản phẩm",
        bg: "bg-yellow-100",
      },
      {
        sub: "Toner",
        sticker: "💦",
        title: "Toner (nước hoa hồng) / Lotion",
        count: "3 sản phẩm",
        bg: "bg-green-100",
      },
      {
        sub: "TayTeBaoChet",
        sticker: "🧖‍♀️",
        title: "Tẩy tế bào chết",
        count: "4 sản phẩm",
        bg: "bg-purple-50",
      },
      {
        sub: "XitKhoang",
        sticker: "🚿",
        title: "Xịt khoáng",
        count: "4 sản phẩm",
        bg: "bg-gray-100",
      },
      {
        sub: "TayTrang",
        sticker: "🌫️",
        title: "Nước tẩy trang, dầu tẩy trang",
        count: "19 sản phẩm",
        bg: "bg-blue-100",
      },
    ],
  },
  ChamSocCoThe: {
    title: "Chăm sóc cơ thể",
    type: "small",
    items: [
      {
        sub: "SuaTam",
        sticker: "🚿",
        title: "Sữa tắm, xà bông",
        count: "40 sản phẩm",
        bg: "bg-blue-100",
      },
      {
        sub: "ChongNangToanThan",
        sticker: "☀️",
        title: "Chống nắng toàn thân",
        count: "23 sản phẩm",
        bg: "bg-orange-100",
      },
      {
        sub: "KhuMui",
        sticker: "🌸",
        title: "Lăn khử mùi, xịt khử mùi",
        count: "20 sản phẩm",
        bg: "bg-gray-100",
      },
      {
        sub: "DuongThe",
        sticker: "🧴",
        title: "Sữa dưỡng thể, kem dưỡng thể",
        count: "32 sản phẩm",
        bg: "bg-pink-100",
      },
      {
        sub: "ChamSocDaNutNe",
        sticker: "🦶",
        title: "Chăm sóc da nứt nẻ",
        count: "7 sản phẩm",
        bg: "bg-blue-50",
      },
      {
        sub: "KemDuongDaTayChan",
        sticker: "✋",
        title: "Kem dưỡng da tay, chân",
        count: "10 sản phẩm",
        bg: "bg-yellow-100",
      },
      {
        sub: "ChamSocNguc",
        sticker: "👙",
        title: "Chăm sóc ngực",
        count: "1 sản phẩm",
        bg: "bg-purple-50",
      },
      {
        sub: "Massage",
        sticker: "💆‍♀️",
        title: "Massage",
        count: "5 sản phẩm",
        bg: "bg-red-50",
      },
    ],
  },
  GiaiPhapLanDa: {
    title: "Giải pháp làn da",
    type: "small",
    items: [
      {
        sub: "HoTroMoSeo",
        sticker: "✨",
        title: "Hỗ trợ mờ sẹo, mờ vết thâm",
        count: "19 sản phẩm",
        bg: "bg-blue-50",
      },
      {
        sub: "KemHoTroGiamMun",
        sticker: "🧴",
        title: "Kem hỗ trợ giảm mụn, gel hỗ trợ giảm mụn",
        count: "16 sản phẩm",
        bg: "bg-green-100",
      },
      {
        sub: "DuongDaKho",
        sticker: "💧",
        title: "Dưỡng da bị khô, thiếu ẩm",
        count: "22 sản phẩm",
        bg: "bg-blue-100",
      },
      {
        sub: "KemHoTroMoNam",
        sticker: "🟤",
        title: "Kem hỗ trợ mờ nám, tàn nhang, đốm nâu",
        count: "8 sản phẩm",
        bg: "bg-yellow-100",
      },
      {
        sub: "DaManCam",
        sticker: "🌿",
        title: "Da mẫn cảm, dễ kích ứng",
        count: "6 sản phẩm",
        bg: "bg-green-50",
      },
      {
        sub: "DaNhayCam",
        sticker: "🌸",
        title: "Da nhạy cảm",
        count: "3 sản phẩm",
        bg: "bg-pink-50",
      },
      {
        sub: "HoTroTaiTaoDa",
        sticker: "🔄",
        title: "Hỗ trợ tái tạo, cải thiện da lão hoá",
        count: "4 sản phẩm",
        bg: "bg-purple-50",
      },
      {
        sub: "DaSam",
        sticker: "🌑",
        title: "Da sạm, xỉn màu",
        count: "2 sản phẩm",
        bg: "bg-gray-100",
      },
    ],
  },
  ChamSocToc: {
    title: "Chăm sóc tóc - da đầu",
    type: "small",
    items: [
      {
        sub: "DauGoiDauXa",
        sticker: "🧴",
        title: "Dầu gội dầu xả",
        count: "39 sản phẩm",
        bg: "bg-green-100",
      },
      {
        sub: "GiamNamNgua",
        sticker: "💧",
        title: "Dầu gội giúp giảm nấm và ngứa da đầu",
        count: "4 sản phẩm",
        bg: "bg-blue-100",
      },
      {
        sub: "DuongToc",
        sticker: "👵",
        title: "Dưỡng tóc, ủ tóc",
        count: "4 sản phẩm",
        bg: "bg-gray-200",
      },
      {
        sub: "ChamSocChuyenSau",
        sticker: "💆‍♀️",
        title: "Chăm sóc chuyên sâu cho tóc",
        count: "1 sản phẩm",
        bg: "bg-pink-50",
      },
    ],
  },
  TrangDiem: {
    title: "Mỹ phẩm trang điểm",
    items: [
      {
        sub: "SonMoi",
        sticker: "💄",
        title: "Son môi",
        count: "16 sản phẩm",
        bg: "bg-pink-100",
      },
      {
        sub: "TrangDiemMat",
        sticker: "🪞",
        title: "Trang điểm mặt",
        count: "1 sản phẩm",
        bg: "bg-gray-100",
      },
    ],
  },
  VungMat: {
    title: "Chăm sóc da vùng mắt",
    items: [
      {
        sub: "CaiThienQuangTham",
        sticker: "👁️",
        title: "Hỗ trợ cải thiện quầng thâm, bọng mắt",
        count: "",
        bg: "bg-blue-50",
      },
      {
        sub: "CaiThienNepNhanMat",
        sticker: "🧴",
        title: "Hỗ trợ cải thiện nếp nhăn vùng mắt",
        count: "",
        bg: "bg-pink-50",
      },
      {
        sub: "DuongDaMat",
        sticker: "💆‍♀️",
        title: "Dưỡng da mắt",
        count: "3 sản phẩm",
        bg: "bg-green-50",
      },
    ],
  },
  ThienNhien: {
    title: "Sản phẩm từ thiên nhiên",
    items: [
      {
        sub: "TinhDau",
        sticker: "🪔",
        title: "Tinh dầu",
        count: "2 sản phẩm",
        bg: "bg-green-50",
      },
      {
        sub: "DauDua",
        sticker: "🥥",
        title: "Dầu dừa",
        count: "",
        bg: "bg-yellow-50",
      },
    ],
  },
};

// --- PHẦN MỚI THÊM VÀO: CSCN_DATA ĐẦY ĐỦ ---
export const CSCN_DATA: Record<
  string,
  { title: string; items: MenuItem[]; type?: string; icon?: string }
> = {
  HoTroTinhDuc: {
    title: "Hỗ trợ tình dục",
    icon: "⚤",
    items: [
      {
        sub: "BaoCaoSu",
        sticker: "🛡️",
        title: "Bao cao su",
        count: "10 sản phẩm",
      },
      {
        sub: "GelBoiTron",
        sticker: "💧",
        title: "Gel bôi trơn",
        count: "5 sản phẩm",
      },
    ],
  },
  ThucPhamDoUong: {
    title: "Thực phẩm - Đồ uống",
    icon: "🥤",
    items: [
      {
        sub: "NuocYen",
        sticker: "🍵",
        title: "Nước Yến",
        count: "19 sản phẩm",
      },
      {
        sub: "KeoCung",
        sticker: "🍬",
        title: "Kẹo cứng",
        count: "20 sản phẩm",
      },
      {
        sub: "NuocUongKhongGas",
        sticker: "🥤",
        title: "Nước uống không gas",
        count: "5 sản phẩm",
      },
      {
        sub: "DuongAnKieng",
        sticker: "🧂",
        title: "Đường ăn kiêng",
        count: "7 sản phẩm",
      },
      {
        sub: "TraThaoDuoc",
        sticker: "🌿",
        title: "Trà thảo dược",
        count: "15 sản phẩm",
      },
      {
        sub: "KeoDeo",
        sticker: "🧸",
        title: "Kẹo dẻo",
        count: "",
      },
      {
        sub: "ToYen",
        sticker: "🕊️",
        title: "Tổ Yến",
        count: "",
      },
    ],
  },
  VeSinhCaNhan: {
    title: "Vệ sinh cá nhân",
    icon: "🧴",
    items: [
      {
        sub: "DungDichVeSinh",
        sticker: "✨",
        title: "Dung dịch vệ sinh phụ nữ",
        count: "24 sản phẩm",
      },
      {
        sub: "VeSinhTai",
        sticker: "👂",
        title: "Vệ sinh tai",
        count: "12 sản phẩm",
      },
      {
        sub: "BangVeSinh",
        sticker: "🌸",
        title: "Băng vệ sinh",
        count: "10 sản phẩm",
      },
      {
        sub: "NuocRuaTay",
        sticker: "🧼",
        title: "Nước rửa tay",
        count: "4 sản phẩm",
      },
      {
        sub: "BongTayTrang",
        sticker: "☁️",
        title: "Bông tẩy trang",
        count: "5 sản phẩm",
      },
    ],
  },
  ChamSocRangMieng: {
    title: "Chăm sóc răng miệng",
    icon: "🦷",
    items: [
      {
        sub: "KemDanhRang",
        sticker: "🪥",
        title: "Kem đánh răng",
        count: "6 sản phẩm",
      },
      {
        sub: "BanChaiDien",
        sticker: "⚡",
        title: "Bàn chải điện",
        count: "7 sản phẩm",
      },
      {
        sub: "ChiNhaKhoa",
        sticker: "🧵",
        title: "Chỉ nha khoa",
        count: "7 sản phẩm",
      },
      {
        sub: "ChamSocRang",
        sticker: "🦷",
        title: "Chăm sóc răng",
        count: "3 sản phẩm",
      },
      {
        sub: "NuocSucMieng",
        sticker: "💧",
        title: "Nước súc miệng",
        count: "16 sản phẩm",
      },
    ],
  },
  DoDungGiaDinh: {
    title: "Đồ dùng gia đình",
    icon: "🏠",
    items: [
      {
        sub: "DietConTrung",
        sticker: "🦟",
        title: "Chống muỗi & côn trùng",
        count: "14 sản phẩm",
      },
      {
        sub: "DoDungChoBe",
        sticker: "🍼",
        title: "Đồ dùng cho bé",
        count: "12 sản phẩm",
      },
      {
        sub: "DoDungChoMe",
        sticker: "🤰",
        title: "Đồ dùng cho mẹ",
        count: "3 sản phẩm",
      },
      {
        sub: "DauGio",
        sticker: "🧴",
        title: "Dầu gió, dầu nóng",
        count: "12 sản phẩm",
      },
    ],
  },
  HangTongHop: {
    title: "Hàng tổng hợp",
    icon: "📦",
    items: [
      {
        sub: "KhanGiayKhanUot",
        sticker: "🧻",
        title: "Khăn giấy, khăn ướt",
        count: "7 sản phẩm",
      },
      {
        sub: "TuiChuom",
        sticker: "🔥",
        title: "Túi chườm",
        count: "3 sản phẩm",
      },
      {
        sub: "DungCuKhac",
        sticker: "🛠️",
        title: "Dụng cụ khác",
        count: "10 sản phẩm",
      },
    ],
  },
  TinhDau: {
    title: "Tinh dầu các loại",
    icon: "💧",
    items: [
      {
        sub: "TinhDauMassage",
        sticker: "💆‍♀️",
        title: "Tinh dầu massage",
        count: "2 sản phẩm",
      },
      {
        sub: "TinhDauTriCam",
        sticker: "🌬️",
        title: "Tinh dầu trị cảm",
        count: "2 sản phẩm",
      },
      {
        sub: "TinhDauXong",
        sticker: "♨️",
        title: "Tinh dầu xông",
        count: "2 sản phẩm",
      },
      {
        sub: "TinhDauTram",
        sticker: "🌿",
        title: "Tinh dầu tràm",
        count: "5 sản phẩm",
      },
      {
        sub: "TinhDauKhuynhDiep",
        sticker: "🍃",
        title: "Tinh dầu khuynh diệp",
        count: "4 sản phẩm",
      },
    ],
  },
  ThietBiLamDep: {
    title: "Thiết bị làm đẹp",
    icon: "💅",
    items: [
      {
        sub: "DungCuTayLong",
        sticker: "🦵",
        title: "Dụng cụ tẩy lông",
        count: "2 sản phẩm",
      },
      {
        sub: "DungCuCaoRau",
        sticker: "🪒",
        title: "Dụng cụ cạo râu",
        count: "1 sản phẩm",
      },
      {
        sub: "MayRuaMat",
        sticker: "🧼",
        title: "Máy rửa mặt",
        count: "2 sản phẩm",
      },
      {
        sub: "MayMassageMat",
        sticker: "💆‍♀️",
        title: "Máy massage mặt",
        count: "3 sản phẩm",
      },
    ],
  },
};

// --- PHẦN MỚI THÊM VÀO: TBYT_DATA ---
export const TBYT_DATA: Record<
  string,
  { title: string; items: MenuItem[]; type?: string; icon?: string }
> = {
  DungCuYTe: {
    title: "Dụng cụ y tế",
    icon: "🩺",
    items: [
      {
        sub: "DungCuVeSinhMui",
        sticker: "👃",
        title: "Dụng cụ vệ sinh mũi",
        count: "56 sản phẩm",
      },
      {
        sub: "KimCacLoai",
        sticker: "💉",
        title: "Kim các loại",
        count: "41 sản phẩm",
      },
      {
        sub: "MayMassage",
        sticker: "💆",
        title: "Máy massage",
        count: "9 sản phẩm",
      },
      {
        sub: "TuiChuom",
        sticker: "🔥",
        title: "Túi chườm",
        count: "5 sản phẩm",
      },
      {
        sub: "VoNganTinhMach",
        sticker: "🦵",
        title: "Vớ ngăn tĩnh mạch",
        count: "11 sản phẩm",
      },
      {
        sub: "GangTay",
        sticker: "🧤",
        title: "Găng tay",
        count: "15 sản phẩm",
      },
      {
        sub: "DaiLung",
        sticker: "🦴",
        title: "Đai lưng",
        count: "12 sản phẩm",
      },
      {
        sub: "DungCuVeSinhTai",
        sticker: "👂",
        title: "Dụng cụ vệ sinh tai",
        count: "2 sản phẩm",
      },
      {
        sub: "DaiNep",
        sticker: "🤕",
        title: "Đai nẹp",
        count: "47 sản phẩm",
      },
      {
        sub: "MayXongKhiDung",
        sticker: "🌬️",
        title: "Máy xông khí dung",
        count: "10 sản phẩm",
      },
      {
        sub: "CacDungCuKhac",
        sticker: "🛠️",
        title: "Các dụng cụ và sản phẩm khác",
        count: "74 sản phẩm",
      },
    ],
  },
  DungCuTheoDoi: {
    title: "Dụng cụ theo dõi",
    icon: "🩺",
    items: [
      {
        sub: "MayDoHuyetAp",
        sticker: "🩺",
        title: "Máy đo huyết áp",
        count: "32 sản phẩm",
      },
      {
        sub: "MayDoDuongHuyet",
        sticker: "💉",
        title: "Máy, que thử đường huyết",
        count: "31 sản phẩm",
      },
      {
        sub: "ThuThai",
        sticker: "👶",
        title: "Thử thai",
        count: "7 sản phẩm",
      },
      {
        sub: "NhietKe",
        sticker: "🌡️",
        title: "Nhiệt kế",
        count: "10 sản phẩm",
      },
      {
        sub: "KitTestCovid",
        sticker: "🦠",
        title: "Kit Test Covid",
        count: "5 sản phẩm",
      },
      {
        sub: "MayDoSpO2",
        sticker: "🌬️",
        title: "Máy đo SpO2",
        count: "5 sản phẩm",
      },
    ],
  },
  DungCuSoCuu: {
    title: "Dụng cụ sơ cứu",
    icon: "🚑",
    items: [
      {
        sub: "BangYTe",
        sticker: "🩹",
        title: "Băng y tế",
        count: "69 sản phẩm",
      },
      {
        sub: "BongYTe",
        sticker: "☁️",
        title: "Bông y tế",
        count: "18 sản phẩm",
      },
      {
        sub: "ConNuocSatTrung",
        sticker: "🧴",
        title: "Cồn, nước sát trùng, nước muối",
        count: "14 sản phẩm",
      },
      {
        sub: "ChamSocVetThuong",
        sticker: "🩹",
        title: "Chăm sóc vết thương",
        count: "13 sản phẩm",
      },
      {
        sub: "XitGiamDau",
        sticker: "💨",
        title: "Xịt giảm đau, kháng viêm",
        count: "6 sản phẩm",
      },
      {
        sub: "MiengDanGiamDau",
        sticker: "🤕",
        title: "Miếng dán giảm đau, hạ sốt",
        count: "8 sản phẩm",
      },
    ],
  },
  KhauTrang: {
    title: "Khẩu trang y tế",
    icon: "😷",
    items: [
      {
        sub: "KhauTrangYTe",
        sticker: "😷",
        title: "Khẩu trang y tế",
        count: "33 sản phẩm",
      },
      {
        sub: "KhauTrangVai",
        sticker: "😷",
        title: "Khẩu trang vải",
        count: "",
      },
    ],
  },
};
