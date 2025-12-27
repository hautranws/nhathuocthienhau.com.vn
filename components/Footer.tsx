import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white border-t mt-12 pt-10 pb-6 text-gray-700 font-sans">
      <div className="container mx-auto px-4">
        {/* Lưới 4 cột thông tin */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Cột 1: Giới thiệu (ĐÃ SỬA LINK) */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-blue-800 uppercase">
              Về Thiên Hậu Pharma
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/thong-tin/gioi-thieu" className="hover:text-blue-600 transition-colors">
                  Giới thiệu chung
                </Link>
              </li>
              <li>
                {/* Nếu chưa có bài viết hệ thống, tạm trỏ về giới thiệu */}
                <Link href="/thong-tin/gioi-thieu" className="hover:text-blue-600 transition-colors">
                  Hệ thống nhà thuốc
                </Link>
              </li>
              <li>
                <Link href="/thong-tin/giay-phep" className="hover:text-blue-600 transition-colors">
                  Giấy phép kinh doanh
                </Link>
              </li>
              <li>
                <Link href="/thong-tin/quy-che" className="hover:text-blue-600 transition-colors">
                  Quy chế hoạt động
                </Link>
              </li>
              <li>
                <Link href="/thong-tin/bao-mat" className="hover:text-blue-600 transition-colors">
                  Chính sách bảo mật
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 2: Danh mục (ĐÃ CẬP NHẬT HREF CHUẨN) */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-blue-800 uppercase">
              Danh mục chính
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/danh-muc/thuc-pham-chuc-nang" className="hover:text-blue-600 transition-colors">
                  Thực phẩm chức năng
                </Link>
              </li>
              <li>
                <Link href="/danh-muc/duoc-my-pham" className="hover:text-blue-600 transition-colors">
                  Dược mỹ phẩm
                </Link>
              </li>
              <li>
                <Link href="/danh-muc/cham-soc-ca-nhan" className="hover:text-blue-600 transition-colors">
                  Chăm sóc cá nhân
                </Link>
              </li>
              <li>
                <Link href="/danh-muc/thuoc" className="hover:text-blue-600 transition-colors">
                  Thuốc không kê đơn
                </Link>
              </li>
              <li>
                <Link href="/danh-muc/thiet-bi-y-te" className="hover:text-blue-600 transition-colors">
                  Thiết bị y tế
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 3: Hỗ trợ khách hàng (THÊM LINK GỌI ĐIỆN) */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-blue-800 uppercase">
              Tổng đài hỗ trợ
            </h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-semibold text-gray-600">Tư vấn mua hàng (Miễn phí)</p>
                <a href="tel:18006928" className="text-xl font-bold text-orange-500 hover:text-blue-700 transition">
                  1800 6928
                </a>
              </div>
              <div>
                <p className="font-semibold text-gray-600">Góp ý, khiếu nại</p>
                <a href="tel:18006929" className="text-xl font-bold text-orange-500 hover:text-blue-700 transition">
                  1800 6929
                </a>
              </div>
            </div>
          </div>

          {/* Cột 4: Kết nối & Chứng nhận (THAY ICON & ẢNH ĐẸP HƠN) */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-blue-800 uppercase">
              Kết nối với chúng tôi
            </h3>
            <div className="flex gap-3 mb-6">
              {/* Facebook Icon */}
              <a href="#" className="w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition shadow-md">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              {/* Google/Youtube Icon */}
              <a href="#" className="w-9 h-9 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition shadow-md">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
              </a>
              {/* X (Twitter) Icon */}
              <a href="#" className="w-9 h-9 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition shadow-md">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
            </div>

            <h3 className="font-bold text-sm mb-2 text-blue-800 uppercase">Chứng nhận</h3>
            <div className="flex gap-2">
              {/* Ảnh logo BCT */}
              <div className="w-32">
                 <img 
                    
                    alt="Đã thông báo Bộ Công Thương"
                    className="w-full h-auto object-contain cursor-pointer hover:opacity-80 transition"
                 />
              </div>
              {/* DMCA Badge */}
              <div className="w-24 h-8 bg-blue-100 flex items-center justify-center text-xs text-blue-600 font-bold border border-blue-300 rounded cursor-pointer">
                DMCA Protected
              </div>
            </div>
          </div>
        </div>

        {/* Dòng bản quyền cuối cùng (GIỮ NGUYÊN) */}
        <div className="border-t pt-6 text-center text-xs text-gray-500">
          <p className="mb-2 font-bold text-gray-700 text-sm">
            © 2025 Hộ kinh doanh nhà thuốc Thiên Hậu 1. Chủ sở hữu Phạm Anh Thư
          </p>
          <p className="mb-1">
            <span className="font-semibold">Địa chỉ:</span> Số 130 đường Tây Hòa Khu Phố 1 Phước Long A Thành phố Thủ Đức, Thành phố Hồ Chí Minh.
          </p>
          <p className="mb-1">
             <span className="font-semibold">MST:</span> 8127931501-001 | <span className="font-semibold">SĐT:</span> 0988991837
          </p>
        </div>
      </div>
    </footer>
  );
}