import { MenuItem } from "./types";

export const THUOC_DATA: Record<
  string,
  { title: string; items: MenuItem[]; type?: string; icon?: string }
> = {
  NhomTriLieu: {
    title: "Thuốc theo nhóm trị liệu",
    icon: "💊",
    items: [
      {
        sub: "ThuocDiUng",
        sticker: "🤧",
        title: "Thuốc dị ứng",
        count: "137 sản phẩm",
        children: [
            { sub: "ThuocChongDiUng", sticker: "💊", title: "Thuốc chống dị ứng", count: "138 sản phẩm" },
            { sub: "ThuocSayTauXe", sticker: "🚌", title: "Thuốc say tàu xe", count: "" }, 
        ]
      },
      {
        sub: "GiaiDoc",
        sticker: "🧪",
        title: "Thuốc giải độc, khử độc và hỗ trợ cai nghiện",
        count: "7 sản phẩm",
        children: [
            { sub: "ThuocCaiNghienMaTuy", sticker: "📦", title: "Thuốc hỗ trợ cai nghiện ma tuý", count: "1 sản phẩm" },
            { sub: "CapCuuGiaiDoc", sticker: "💉", title: "Cấp cứu giải độc", count: "5 sản phẩm" },
            { sub: "VienCaiThuocLa", sticker: "🚭", title: "Viên cai thuốc lá", count: "1 sản phẩm" },
        ]
      },
      {
        sub: "DaLieu",
        sticker: "🧴",
        title: "Thuốc da liễu",
        count: "289 sản phẩm",
        children: [
            { sub: "ThuocTriMun", sticker: "🧖‍♀️", title: "Thuốc trị mụn", count: "23 sản phẩm" },
            { sub: "ThuocBoiNgoaiDa", sticker: "🧴", title: "Thuốc bôi ngoài da", count: "234 sản phẩm" },
            { sub: "ThuocSatKhuan", sticker: "🧼", title: "Thuốc sát khuẩn", count: "22 sản phẩm" },
            { sub: "ThuocBoiSeo", sticker: "✨", title: "Thuốc bôi sẹo - liền sẹo", count: "2 sản phẩm" },
            { sub: "DauMuU", sticker: "🌿", title: "Dầu mù u", count: "1 sản phẩm" },
            { sub: "DauGoiTriGau", sticker: "🚿", title: "Dầu gội trị gàu", count: "8 sản phẩm" },
        ]
      },
      {
        sub: "MiengDanCaoXoa",
        sticker: "🩹",
        title: "Miếng dán, cao xoa, dầu",
        count: "52 sản phẩm",
        children: [
            { sub: "DauGio", sticker: "🧴", title: "Dầu gió", count: "11 sản phẩm" },
            { sub: "CaoXoa", sticker: "🍯", title: "Cao xoa", count: "13 sản phẩm" },
            { sub: "MiengDanGiamDau", sticker: "🤕", title: "Miếng dán giảm đau", count: "12 sản phẩm" },
            { sub: "MiengDanSayTauXe", sticker: "🚌", title: "Miếng dán say tàu xe", count: "1 sản phẩm" },
            { sub: "MiengDanHaSot", sticker: "🌡️", title: "Miếng dán hạ sốt", count: "" },
            { sub: "MiengDanThuGian", sticker: "😌", title: "Miếng dán thư giãn", count: "" },
            { sub: "DauNongXoaBop", sticker: "🔥", title: "Dầu nóng xoa bóp", count: "14 sản phẩm" },
        ]
      },
      {
        sub: "CoXuongKhop",
        sticker: "🦴",
        title: "Cơ - xương - khớp",
        count: "175 sản phẩm",
        children: [
            { sub: "ThuocTriGout", sticker: "🦶", title: "Thuốc trị gout", count: "28 sản phẩm" },
            { sub: "ThuocTriThoaiHoaKhop", sticker: "🦴", title: "Thuốc trị thoái hoá khớp", count: "2 sản phẩm" },
            { sub: "ThuocGianCo", sticker: "💪", title: "Thuốc giãn cơ", count: "34 sản phẩm" },
            { sub: "ThuocXuongKhop", sticker: "🦵", title: "Thuốc xương khớp", count: "111 sản phẩm" },
        ]
      },
      {
        sub: "ThuocBoVitamin",
        sticker: "⚡",
        title: "Thuốc bổ & vitamin",
        count: "279 sản phẩm",
        children: [
            { sub: "ThuocBo", sticker: "💊", title: "Thuốc bổ", count: "209 sản phẩm" },
            { sub: "ThuocBuDienGiai", sticker: "💧", title: "Thuốc bù điện giải", count: "7 sản phẩm" },
            { sub: "DinhDuong", sticker: "🍼", title: "Dinh dưỡng", count: "3 sản phẩm" },
            { sub: "BoXuongKhop", sticker: "🦴", title: "Bổ xương khớp", count: "9 sản phẩm" },
            { sub: "TangCuongDeKhang", sticker: "🛡️", title: "Thuốc tăng cường sức đề kháng", count: "14 sản phẩm" },
            { sub: "SiroBo", sticker: "🍇", title: "Siro bổ", count: "36 sản phẩm" },
        ]
      },
      {
        sub: "ThuocUngThu",
        sticker: "🎗️",
        title: "Thuốc ung thư",
        count: "134 sản phẩm",
        children: [
            { sub: "DieuTriUngThu", sticker: "💊", title: "Thuốc điều trị ung thư", count: "78 sản phẩm" },
            { sub: "ChongUngThu", sticker: "🛡️", title: "Thuốc chống ung thư", count: "56 sản phẩm" },
        ]
      },
      {
        sub: "GiamDauHaSot",
        sticker: "🌡️",
        title: "Thuốc giảm đau, hạ sốt, kháng viêm",
        count: "383 sản phẩm",
        children: [
            { sub: "ThuocGiamDauHaSot", sticker: "💊", title: "Thuốc giảm đau hạ sốt", count: "130 sản phẩm" },
            { sub: "ThuocGiamDauKhangViem", sticker: "💊", title: "Thuốc giảm đau kháng viêm", count: "142 sản phẩm" },
            { sub: "ThuocKhangViem", sticker: "💊", title: "Thuốc kháng viêm", count: "92 sản phẩm" },
            { sub: "ThuocTriDauNuaDau", sticker: "🤕", title: "Thuốc trị đau nửa đầu", count: "18 sản phẩm" },
        ]
      },
      {
        sub: "ThuocHoHap",
        sticker: "🫁",
        title: "Thuốc hô hấp",
        count: "310 sản phẩm",
        children: [
            { sub: "SiroTriHoCam", sticker: "🥤", title: "Siro trị ho cảm", count: "56 sản phẩm" },
            { sub: "ThuocTriHoCam", sticker: "💊", title: "Thuốc trị ho cảm", count: "135 sản phẩm" },
            { sub: "SiroHenSuyen", sticker: "🌬️", title: "Siro hen suyễn", count: "" }, 
            { sub: "ThuocTriHenSuyen", sticker: "💨", title: "Thuốc trị hen suyễn", count: "80 sản phẩm" },
            { sub: "SiroTriSoMui", sticker: "🤧", title: "Siro trị sổ mũi", count: "13 sản phẩm" },
            { sub: "VienNgamTriHo", sticker: "🍬", title: "Viên ngậm trị ho, viêm họng", count: "26 sản phẩm" },
        ]
      },
      {
        sub: "KhangSinhKhangNam",
        sticker: "💊",
        title: "Thuốc kháng sinh, kháng nấm",
        count: "555 sản phẩm",
        children: [
            { sub: "ThuocKhangNam", sticker: "🍄", title: "Thuốc kháng nấm", count: "34 sản phẩm" },
            { sub: "SiroKhangSinh", sticker: "🥤", title: "Siro kháng sinh", count: "2 sản phẩm" },
            { sub: "ThuocKhangLao", sticker: "🦠", title: "Thuốc kháng lao", count: "7 sản phẩm" },
            { sub: "ThuocKhangSinh", sticker: "💊", title: "Thuốc kháng sinh", count: "410 sản phẩm" },
            { sub: "ThuocTriGiunSan", sticker: "🪱", title: "Thuốc trị giun sán", count: "23 sản phẩm" },
            { sub: "ThuocKhangVirus", sticker: "🛡️", title: "Thuốc kháng virus", count: "71 sản phẩm" },
            { sub: "ThuocTriSotRet", sticker: "🦟", title: "Thuốc trị sốt rét", count: "3 sản phẩm" },
        ]
      },
      {
        sub: "MatTaiMuiHong",
        sticker: "👀",
        title: "Thuốc Mắt, Tai, Mũi, Họng",
        count: "226 sản phẩm",
        children: [
            { sub: "ThuocXitMui", sticker: "👃", title: "Thuốc xịt mũi", count: "20 sản phẩm" },
            { sub: "ThuocNhoTai", sticker: "👂", title: "Thuốc nhỏ tai", count: "7 sản phẩm" },
            { sub: "ThuocTriViemXoang", sticker: "🤕", title: "Thuốc trị viêm xoang", count: "6 sản phẩm" },
            { sub: "OngHitMui", sticker: "😤", title: "Ống hít mũi", count: "2 sản phẩm" },
            { sub: "DungDichSucMieng", sticker: "💧", title: "Dung dịch súc miệng", count: "8 sản phẩm" },
            { sub: "ThuocTaiMuiHong", sticker: "👅", title: "Thuốc tai mũi họng", count: "31 sản phẩm" },
            { sub: "ThuocBoiRangMieng", sticker: "🦷", title: "Thuốc bôi răng miệng", count: "7 sản phẩm" },
            { sub: "ThuocXitHenSuyen", sticker: "💨", title: "Thuốc xịt hen suyễn", count: "11 sản phẩm" },
            { sub: "ThuocTriTangNhanAp", sticker: "👁️", title: "Thuốc trị tăng nhãn áp", count: "5 sản phẩm" },
            { sub: "ThuocNhoMat", sticker: "💧", title: "Thuốc nhỏ mắt", count: "122 sản phẩm" },
            { sub: "ThuocTraMat", sticker: "👀", title: "Thuốc tra mắt", count: "7 sản phẩm" },
        ]
      },
      {
        sub: "HeThanKinh",
        sticker: "🧠",
        title: "Thuốc hệ thần kinh",
        count: "316 sản phẩm",
        children: [
            { sub: "ThuocAnThan", sticker: "😴", title: "Thuốc an thần", count: "10 sản phẩm" },
            { sub: "ThuocChongTramCam", sticker: "💊", title: "Thuốc chống trầm cảm", count: "19 sản phẩm" },
            { sub: "ThuocThanKinh", sticker: "🧠", title: "Thuốc thần kinh", count: "287 sản phẩm" },
        ]
      },
      {
        sub: "TiemChichDichTruyen",
        sticker: "💉",
        title: "Thuốc tiêm chích & dịch truyền",
        count: "142 sản phẩm",
        children: [
            { sub: "DichTruyen", sticker: "💧", title: "Dịch truyền", count: "48 sản phẩm" },
            { sub: "ThuocTiemChich", sticker: "💉", title: "Thuốc tiêm chích", count: "102 sản phẩm" },
            { sub: "DungDichTiem", sticker: "🧪", title: "Dung dịch tiêm", count: "2 sản phẩm" },
        ]
      },
      {
        sub: "TieuHoaGanMat",
        sticker: "🤢",
        title: "Thuốc tiêu hoá & gan mật",
        count: "648 sản phẩm",
        children: [
            { sub: "ThuocLoiTieu", sticker: "💧", title: "Thuốc lợi tiểu", count: "18 sản phẩm" },
            { sub: "ThuocGanMat", sticker: "🛡️", title: "Thuốc gan mật", count: "11 sản phẩm" },
            { sub: "ThuocDaDay", sticker: "🥣", title: "Thuốc dạ dày", count: "273 sản phẩm" },
            { sub: "SiroTieuHoa", sticker: "🥤", title: "Siro tiêu hoá", count: "2 sản phẩm" },
            { sub: "ThuocTriTieuChay", sticker: "🧻", title: "Thuốc trị tiêu chảy", count: "47 sản phẩm" },
            { sub: "ThuocTieuHoa", sticker: "💊", title: "Thuốc tiêu hoá", count: "116 sản phẩm" },
            { sub: "ThuocTriTaoBon", sticker: "💩", title: "Thuốc trị táo bón", count: "25 sản phẩm" },
            { sub: "ThuocTriBenhGan", sticker: "🏥", title: "Thuốc trị bệnh gan", count: "149 sản phẩm" },
        ]
      },
      {
        sub: "TimMachMau",
        sticker: "❤️",
        title: "Thuốc tim mạch & máu",
        count: "854 sản phẩm",
        children: [
            { sub: "ThuocChongDongMau", sticker: "💊", title: "Thuốc chống đông máu", count: "63 sản phẩm" },
            { sub: "ThuocTimMachHuyetAp", sticker: "🩺", title: "Thuốc tim mạch huyết áp", count: "454 sản phẩm" },
            { sub: "TangCuongTuanHoanNao", sticker: "🧠", title: "Thuốc tăng cường tuần hoàn não", count: "115 sản phẩm" },
            { sub: "ThuocTriTriSuyGian", sticker: "🦵", title: "Thuốc trị trĩ, suy giãn tĩnh mạch", count: "32 sản phẩm" },
            { sub: "ThuocTriMoMau", sticker: "🩸", title: "Thuốc trị mỡ máu", count: "148 sản phẩm" },
            { sub: "ThuocCamMau", sticker: "🩹", title: "Thuốc cầm máu", count: "11 sản phẩm" },
            { sub: "ThuocTriThieuMau", sticker: "💉", title: "Thuốc trị thiếu máu", count: "27 sản phẩm" },
        ]
      },
      {
        sub: "TietNieuSinhDuc",
        sticker: "🚻",
        title: "Thuốc tiết niệu - sinh dục",
        count: "248 sản phẩm",
        children: [
            { sub: "DichTruyen", sticker: "💧", title: "Dịch truyền", count: "48 sản phẩm" },
            { sub: "ThuocTiemChich", sticker: "💉", title: "Thuốc tiêm chích", count: "102 sản phẩm" },
            { sub: "DungDichTiem", sticker: "🧪", title: "Dung dịch tiêm", count: "2 sản phẩm" },
        ]
      },
      {
        sub: "ThuocTeBoi",
        sticker: "🧊",
        title: "Thuốc tê bôi",
        count: "1 sản phẩm",
      },
      {
        sub: "TriTieuDuong",
        sticker: "🩸",
        title: "Thuốc trị tiểu đường",
        count: "187 sản phẩm",
      },
    ],
  },
};
