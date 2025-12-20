import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t mt-12 pt-10 pb-6 text-gray-700 font-sans">
      <div className="container mx-auto px-4">
        
        {/* Lưới 4 cột thông tin */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Cột 1: Giới thiệu */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-blue-800">Về Thiên Hậu Pharma</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-blue-600">Giới thiệu chung</Link></li>
              <li><Link href="#" className="hover:text-blue-600">Hệ thống nhà thuốc</Link></li>
              <li><Link href="#" className="hover:text-blue-600">Giấy phép kinh doanh</Link></li>
              <li><Link href="#" className="hover:text-blue-600">Quy chế hoạt động</Link></li>
              <li><Link href="#" className="hover:text-blue-600">Chính sách bảo mật</Link></li>
            </ul>
          </div>

          {/* Cột 2: Danh mục */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-blue-800">Danh mục chính</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-blue-600">Thực phẩm chức năng</Link></li>
              <li><Link href="#" className="hover:text-blue-600">Dược mỹ phẩm</Link></li>
              <li><Link href="#" className="hover:text-blue-600">Chăm sóc cá nhân</Link></li>
              <li><Link href="#" className="hover:text-blue-600">Thuốc không kê đơn</Link></li>
              <li><Link href="#" className="hover:text-blue-600">Thiết bị y tế</Link></li>
            </ul>
          </div>

          {/* Cột 3: Hỗ trợ khách hàng */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-blue-800">Tổng đài hỗ trợ</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-semibold">Tư vấn mua hàng (Miễn phí)</p>
                <p className="text-xl font-bold text-orange-500">1800 6928</p>
              </div>
              <div>
                <p className="font-semibold">Góp ý, khiếu nại</p>
                <p className="text-xl font-bold text-orange-500">1800 6929</p>
              </div>
            </div>
          </div>

          {/* Cột 4: Kết nối & Chứng nhận */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-blue-800">Kết nối với chúng tôi</h3>
            <div className="flex gap-3 mb-6">
                <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center cursor-pointer">f</span>
                <span className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center cursor-pointer">G+</span>
                <span className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center cursor-pointer">X</span>
            </div>
            
            <h3 className="font-bold text-sm mb-2 text-blue-800">Chứng nhận</h3>
            <div className="flex gap-2">
                <div className="w-24 h-8 bg-red-100 flex items-center justify-center text-xs text-red-600 font-bold border border-red-300 rounded">
                    Đã thông báo BCT
                </div>
                <div className="w-24 h-8 bg-blue-100 flex items-center justify-center text-xs text-blue-600 font-bold border border-blue-300 rounded">
                    DMCA Protected
                </div>
            </div>
          </div>

        </div>

        {/* Dòng bản quyền cuối cùng */}
        <div className="border-t pt-6 text-center text-xs text-gray-500">
            <p className="mb-1">© 2025 Công ty Cổ phần Dược phẩm Thiên Hậu. Mọi quyền được bảo lưu.</p>
            <p>Địa chỉ: Số 123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh. SĐT: 0999.999.999</p>
        </div>

      </div>
    </footer>
  );
}