// components/data/infoData.ts

export const INFO_MENU = [
  {
    id: "gioi-thieu",
    title: "Giới thiệu nhà thuốc",
    content: `
      <h3 class="text-2xl font-bold mb-4">Về Thiên Hậu Pharma</h3>
      <p class="mb-4">Hệ thống Nhà thuốc Thiên Hậu là một trong những chuỗi bán lẻ dược phẩm uy tín...</p>
      <p class="mb-4">Chúng tôi chuyên cung cấp đa dạng các loại thuốc kê đơn, không kê đơn, thực phẩm chức năng...</p>
      <h3 class="text-xl font-bold mb-2">Tầm nhìn</h3>
      <p>Trở thành chuỗi nhà thuốc dẫn đầu...</p>
    `,
  },
  {
    id: "giay-phep",
    title: "Giấy phép kinh doanh",
    content: `
      <h3 class="text-2xl font-bold mb-4">Giấy phép kinh doanh</h3>
      <p><strong>Mã số thuế:</strong> 8127931501-001</p>
      <p><strong>Ngày cấp:</strong> 01/01/2024</p>
      <p><strong>Nơi cấp:</strong> Sở Kế hoạch và Đầu tư TP.HCM</p>
      <div class="mt-4 p-4 bg-gray-100 rounded">
        (Chỗ này bạn chèn ảnh chụp giấy phép vào sau)
      </div>
    `,
  },
  {
    id: "quy-che",
    title: "Quy chế hoạt động",
    content: `
      <h3 class="text-2xl font-bold mb-4">Quy chế hoạt động</h3>
      <p>Nội dung quy chế hoạt động của website thương mại điện tử...</p>
    `,
  },
  {
    id: "bao-mat",
    title: "Chính sách bảo mật",
    content: `
        <div class="text-gray-800 text-sm md:text-base leading-relaxed">
        <h3 class="text-2xl font-bold text-blue-900 mb-6 border-b pb-2 uppercase">Chính sách bảo mật thông tin</h3>

        <div class="mb-6">
          <h4 class="text-lg font-bold text-blue-800 mb-2">1. Mục đích và phạm vi thu thập thông tin</h4>
          <p class="mb-2">
            <strong>Nhà thuốc Thiên Hậu</strong> chỉ thu thập thông tin liên lạc cần thiết để thực hiện giao dịch giữa website/ứng dụng với khách hàng mà không lấy thêm thông tin gì khác. Thông tin của khách hàng sẽ chỉ được lưu lại khi khách hàng tạo tài khoản và đăng nhập.
          </p>
          <p class="mb-2">
            Chúng tôi cam kết không chia sẻ hay sử dụng thông tin cá nhân của khách hàng cho một bên thứ 3 nào khác với mục đích lợi nhuận. Thông tin sẽ chỉ được sử dụng trong nội bộ Nhà thuốc Thiên Hậu. Khi cần thiết, chúng tôi có thể sử dụng những thông tin này để liên hệ trực tiếp với khách hàng dưới các hình thức như: gửi thư, đơn đặt hàng, thư cảm ơn, thông tin khuyến mãi.
          </p>
          <p class="font-semibold mb-1">Những thông tin thu thập bao gồm:</p>
          <ul class="list-disc pl-6 space-y-1 bg-gray-50 p-3 rounded border border-gray-200">
            <li>Tên khách hàng</li>
            <li>Địa chỉ giao hàng</li>
            <li>Số điện thoại</li>
            <li>Ngày sinh & Giới tính</li>
            <li>Email (nếu có)</li>
          </ul>
        </div>

        <div class="mb-6">
          <h4 class="text-lg font-bold text-blue-800 mb-2">2. Phạm vi sử dụng thông tin</h4>
          <p class="mb-2">Những thông tin trên chỉ được sử dụng cho những mục đích sau đây:</p>
          <ul class="list-disc pl-6 space-y-1">
            <li>Giao hàng cho các đơn hàng được đặt mua trên website/ứng dụng.</li>
            <li>Thông báo giao hàng và hỗ trợ khách hàng.</li>
            <li>Cung cấp thông tin sản phẩm, dịch vụ mới.</li>
            <li>Xử lý đơn đặt hàng và cung cấp dịch vụ theo yêu cầu.</li>
            <li>Chia sẻ cho đơn vị vận chuyển để giao hàng.</li>
            <li>Quản lý tài khoản, kiểm tra dữ liệu để cải thiện trải nghiệm người dùng.</li>
          </ul>
          <p class="mt-2 text-sm italic text-gray-600">
            * Chi tiết đơn hàng của khách hàng sẽ được giữ bảo mật và chỉ được cung cấp cho chủ đơn hàng. Chúng tôi không chịu trách nhiệm nếu khách hàng tự ý chia sẻ thông tin tài khoản cho bên thứ 3.
          </p>
        </div>

        <div class="mb-6">
          <h4 class="text-lg font-bold text-blue-800 mb-2">3. Những người hoặc tổ chức có thể tiếp cận thông tin</h4>
          <p class="mb-2">Khách hàng đồng ý rằng, trong trường hợp cần thiết, các đối tượng sau có quyền tiếp cận thông tin:</p>
          <ul class="list-disc pl-6 space-y-1">
            <li>Ban quản trị, nhân viên <strong>Nhà thuốc Thiên Hậu</strong>.</li>
            <li>Bên thứ ba có dịch vụ tích hợp với website/ứng dụng.</li>
            <li>Đơn vị vận chuyển liên kết.</li>
            <li>Cố vấn tài chính, pháp lý và Công ty kiểm toán (khi cần thiết).</li>
            <li>Cơ quan nhà nước có thẩm quyền (khi có yêu cầu).</li>
          </ul>
        </div>

        <div class="mb-6">
          <h4 class="text-lg font-bold text-blue-800 mb-2">4. Thời gian lưu trữ thông tin</h4>
          <p>
            Thông tin của khách hàng sẽ được giữ đúng trong thời hạn pháp luật quy định hoặc chỉ sử dụng cho mục đích mà thông tin đó được thu thập. Dữ liệu sẽ bị hủy khi khách hàng có yêu cầu hoặc hệ thống ngưng hoạt động.
          </p>
        </div>

        <div class="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 class="text-lg font-bold text-blue-800 mb-2">5. Địa chỉ đơn vị thu thập và quản lý thông tin</h4>
          <ul class="space-y-2">
            <li><strong>Đơn vị:</strong> Hộ kinh doanh Nhà thuốc Thiên Hậu 1</li>
            <li><strong>Người đại diện pháp lý:</strong> Phạm Anh Thư</li>
            <li><strong>Địa chỉ:</strong> Số 130 đường Tây Hòa, Khu Phố 1, Phước Long A, TP. Thủ Đức, TP. Hồ Chí Minh</li>
            <li><strong>Hotline:</strong> <span class="text-red-600 font-bold">0988 991 837</span></li>
            <li><strong>Email:</strong> <a href="mailto:thmed.thienhau@thmed.com.vn" class="text-blue-600 hover:underline">thmed.thienhau@thmed.com.vn</a></li>
          </ul>
        </div>

        <div class="mb-6">
          <h4 class="text-lg font-bold text-blue-800 mb-2">6. Phương tiện tiếp cận và chỉnh sửa dữ liệu</h4>
          <p>
            Bất cứ thời điểm nào khách hàng cũng có thể truy cập vào tài khoản cá nhân trên website để chỉnh sửa thông tin của mình, hoặc liên hệ trực tiếp với bộ phận CSKH của Thiên Hậu để được hỗ trợ.
          </p>
        </div>

        <div class="mb-6">
          <h4 class="text-lg font-bold text-blue-800 mb-2">7. Cam kết bảo vệ thông tin cá nhân</h4>
          <p class="mb-2">
            Nhà thuốc Thiên Hậu cam kết bảo mật tuyệt đối thông tin cá nhân của khách hàng theo chính sách này. Chúng tôi không tiết lộ thông tin ra ngoài vì mục đích thương mại vi phạm cam kết.
          </p>
          <p>Chúng tôi chỉ cung cấp thông tin khi:</p>
          <ul class="list-disc pl-6 space-y-1 mt-1">
            <li>Có yêu cầu của cơ quan pháp luật.</li>
            <li>Bảo vệ quyền lợi chính đáng của Thiên Hậu trước pháp luật.</li>
            <li>Tình huống khẩn cấp nhằm bảo đảm an toàn cá nhân của thành viên khác.</li>
          </ul>
        </div>

        <div class="mb-6">
          <h4 class="text-lg font-bold text-blue-800 mb-2">8. Cơ chế giải quyết khiếu nại & Thay đổi chính sách</h4>
          <p class="mb-2">
            Nhà thuốc Thiên Hậu có quyền thay đổi chính sách này và sẽ cập nhật công khai trên website.
          </p>
          <p class="mb-2">
            Khi phát hiện thông tin cá nhân bị sử dụng sai mục đích, quý khách vui lòng gửi khiếu nại qua:
          </p>
          <ul class="space-y-1 font-semibold text-gray-700 ml-4">
            <li>📞 Hotline: <span class="text-red-600">0988 991 837</span></li>
            <li>📧 Email: <span class="text-blue-600">thmed.thienhau@thmed.com.vn</span></li>
          </ul>
          <p class="mt-2">
            Ban quản trị cam kết phản hồi trong vòng <strong>24 giờ làm việc</strong> kể từ khi tiếp nhận khiếu nại.
          </p>
        </div>

      </div>
    `,
  },
  {
    id: "doi-tra",
    title: "Chính sách đổi trả thuốc",
    content: `
<div class="text-gray-800 text-sm md:text-base">
        <h3 class="text-xl font-bold text-blue-800 mb-4 uppercase">1. Quy định đổi trả tại Thiên Hậu Pharma</h3>
        
        <div class="overflow-x-auto mb-6">
          <table class="w-full border-collapse border border-gray-300 min-w-[600px]">
            <thead>
              <tr class="bg-blue-50 text-blue-900">
                <th class="border border-gray-300 p-3 w-1/4">Nhóm sản phẩm</th>
                <th class="border border-gray-300 p-3 w-2/4">Chính sách & Điều kiện</th>
                <th class="border border-gray-300 p-3 w-1/4">Sản phẩm loại trừ (Không đổi trả)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="border border-gray-300 p-3 align-top font-semibold">
                  1. Thuốc<br>
                  2. Thực phẩm chức năng<br>
                  3. Hóa/dược mỹ phẩm<br>
                  4. Trang thiết bị y tế ngoài máy (dụng cụ, kit test...)
                </td>
                <td class="border border-gray-300 p-3 align-top">
                  <p class="font-bold text-red-600 mb-1">🔸 Lỗi nhà sản xuất:</p>
                  <ul class="list-disc pl-5 mb-3 space-y-1">
                    <li>Miễn phí đổi hoặc trả hàng.</li>
                    <li>Thời gian: Không quá <strong>30 ngày</strong> kể từ ngày mua.</li>
                    <li>Biểu hiện lỗi: Biến đổi màu, không đồng nhất, viên bị vỡ vụn, kem vón cục, hỗn dịch phân lớp...</li>
                  </ul>

                  <p class="font-bold text-green-600 mb-1">🔸 Không có lỗi (Nhu cầu khách hàng):</p>
                  <ul class="list-disc pl-5 space-y-1">
                    <li>Miễn phí đổi/trả nếu sản phẩm còn nguyên seal, tem.</li>
                    <li><strong>Thu phí 30%</strong> giá trị nếu mất vỏ hộp (với SP có vỏ hộp).</li>
                    <li>Thời gian: Không quá <strong>30 ngày</strong>.</li>
                    <li>Điều kiện: Chưa xé tem niêm phong, chưa xé vỏ bọc, chưa mở Garanti.</li>
                    <li>Giới hạn: Đổi trả tối đa 5 sản phẩm cùng mã/đơn hàng.</li>
                  </ul>
                </td>
                <td class="border border-gray-300 p-3 align-top bg-gray-50 text-xs">
                  <ul class="list-disc pl-4 space-y-2">
                    <li>Thuốc đặc trị Covid (Molnupiravir).</li>
                    <li>Thuốc ung thư giá từ 5 triệu đồng.</li>
                    <li>Hàng tiêm chích, hàng bảo quản lạnh (vắc xin, insulin...).</li>
                    <li>Hàng đặt lẻ, hàng dự án, hàng cắt liều.</li>
                    <li>Sản phẩm mất tem/Garanti.</li>
                    <li>Dạng lỏng (xịt), kem/gel đã mở nắp.</li>
                    <li>SP không thể tái sử dụng: Que thử, vớ y khoa, nẹp, kim...</li>
                    <li>Hàng khuyến mại.</li>
                    <li>Sản phẩm không còn nguyên vẹn (vỉ đã cắt, hộp đã dùng 1 phần).</li>
                  </ul>
                </td>
              </tr>

              <tr>
                <td class="border border-gray-300 p-3 align-top font-semibold">
                  5. Trang thiết bị y tế MÁY
                </td>
                <td class="border border-gray-300 p-3 align-top">
                  <p class="font-bold text-red-600 mb-1">🔸 Lỗi nhà sản xuất:</p>
                  <ul class="list-disc pl-5 mb-3 space-y-1">
                    <li>Miễn phí đổi trả.</li>
                    <li>Thời gian: Không quá <strong>1 năm</strong>.</li>
                    <li>Yêu cầu: Đầy đủ thành phần chính.</li>
                  </ul>

                  <p class="font-bold text-green-600 mb-1">🔸 Không có lỗi (Nhu cầu khách hàng):</p>
                  <ul class="list-disc pl-5 space-y-1">
                    <li><strong>Thu phí 30%</strong> nếu đã qua sử dụng hoặc mất vỏ hộp.</li>
                    <li>Miễn phí nếu chưa sử dụng.</li>
                    <li>Thời gian: Không quá <strong>30 ngày</strong>.</li>
                    <li>Giới hạn: Tối đa 5 sản phẩm cùng mã/đơn hàng.</li>
                  </ul>
                </td>
                <td class="border border-gray-300 p-3 align-top bg-gray-50 text-xs">
                  Sản phẩm hư hỏng do lỗi người sử dụng (rơi vỡ, ngấm nước, sử dụng sai nguồn điện...).
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
          <h4 class="font-bold text-lg mb-2">⚠️ Lưu ý quan trọng:</h4>
          <ul class="list-disc pl-5 space-y-2">
            <li>Các trường hợp đổi/trả cần có <strong>Số điện thoại trên hóa đơn</strong> để tra cứu.</li>
            <li>Quý khách vui lòng hoàn trả quà tặng kèm (nếu có). Nếu mất, Thiên Hậu sẽ thu phí tương đương giá trị quà tặng.</li>
            <li><strong>Thuốc ung thư dưới 5 triệu:</strong> Bán nguyên hộp chỉ đổi nguyên hộp, bán vỉ đổi vỉ.</li>
            <li>Thiên Hậu áp dụng đổi trả một phần hoặc toàn bộ đơn hàng (trừ thuốc ung thư quy định riêng). Số tiền hoàn lại tính theo thực tế trả hàng.</li>
          </ul>
        </div>

        <h3 class="text-xl font-bold text-blue-800 mb-4 uppercase">2. Phương thức đổi trả & Hoàn tiền</h3>
        <p class="mb-4">
          Khách hàng mang sản phẩm đã mua (kèm vỏ hộp, hướng dẫn sử dụng, quà tặng...) tới cửa hàng <strong>Nhà thuốc Thiên Hậu</strong> để được hỗ trợ.
        </p>
        <p class="font-semibold mb-2">Khách hàng có 2 lựa chọn nhận tiền hoàn:</p>
        <ul class="list-disc pl-5 space-y-2">
          <li><strong>Tiền mặt:</strong> Nhận ngay tại quầy thu ngân.</li>
          <li><strong>Chuyển khoản:</strong> Thiên Hậu sẽ gửi đường link nhập thông tin tài khoản qua tin nhắn/Zalo. Tiền sẽ về tài khoản sau <strong>2-3 ngày làm việc</strong> (trừ T7, CN, Lễ, Tết).</li>
        </ul>
      </div>
    `
  },
  {
    id: "giao-hang",
    title: "Chính sách giao hàng",
    content: `
      <div class="text-gray-800 text-sm md:text-base leading-relaxed">
        <h3 class="text-2xl font-bold text-blue-900 mb-6 border-b pb-2 uppercase">Chính sách giao hàng & Thanh toán</h3>

        <div class="mb-8">
          <h4 class="text-lg font-bold text-blue-800 mb-3 uppercase">I. Về đơn thuốc</h4>
          
          <div class="mb-4">
            <p class="font-bold text-gray-700">1. Nhà thuốc Thiên Hậu có giao thuốc không?</p>
            <ul class="list-disc pl-6 space-y-2 mt-1">
              <li><strong>Thuốc kê đơn:</strong> Nhà thuốc chỉ bán tại cửa hàng khi có đơn thuốc hợp lệ, theo đúng chỉ định. <em>Thuốc kê đơn không bán trực tuyến.</em></li>
              <li><strong>Thuốc không kê đơn:</strong> Quý khách có thể đặt hàng trực tuyến qua website hoặc liên hệ Hotline/Zalo <strong class="text-red-600">0988 991 837</strong> để được hỗ trợ.</li>
            </ul>
          </div>

          <div>
            <p class="font-bold text-gray-700">2. Khi nào tôi nhận được hàng?</p>
            <p class="mt-1">
              Thời gian nhận hàng phụ thuộc vào vị trí địa lý. Quý khách có thể liên hệ tổng đài <strong class="text-red-600">0988 991 837</strong> để biết thời gian dự kiến chính xác nhất.
            </p>
          </div>
        </div>

        <div class="mb-8">
          <h4 class="text-lg font-bold text-blue-800 mb-3 uppercase">II. Phí vận chuyển & Thời gian</h4>

          <div class="mb-6 overflow-x-auto">
            <p class="font-bold text-gray-700 mb-2">1. Biểu phí giao hàng</p>
            <table class="w-full border-collapse border border-gray-300 min-w-[500px] text-sm">
              <thead>
                <tr class="bg-blue-50 text-blue-900">
                  <th class="border border-gray-300 p-3">Giá trị đơn hàng</th>
                  <th class="border border-gray-300 p-3">Nội thành (TP.HCM)</th>
                  <th class="border border-gray-300 p-3">Liên tỉnh / Thành phố khác</th>
                </tr>
              </thead>
              <tbody class="text-center">
                <tr>
                  <td class="border border-gray-300 p-3 font-semibold">Từ 300.000đ trở lên</td>
                  <td class="border border-gray-300 p-3 text-green-600 font-bold">Miễn phí</td>
                  <td class="border border-gray-300 p-3">40.000đ</td>
                </tr>
                <tr>
                  <td class="border border-gray-300 p-3 font-semibold">Dưới 300.000đ</td>
                  <td class="border border-gray-300 p-3">25.000đ</td>
                  <td class="border border-gray-300 p-3">40.000đ</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mb-6 overflow-x-auto">
            <p class="font-bold text-gray-700 mb-2">2. Thời gian giao hàng dự kiến</p>
            <table class="w-full border-collapse border border-gray-300 min-w-[500px] text-sm">
              <thead>
                <tr class="bg-gray-100 text-gray-800">
                  <th class="border border-gray-300 p-2 text-left">Khu vực</th>
                  <th class="border border-gray-300 p-2 text-left">Khoảng cách</th>
                  <th class="border border-gray-300 p-2 text-left">Thời gian dự kiến</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="border border-gray-300 p-2" rowspan="2">TP.HCM (Nội thành)</td>
                  <td class="border border-gray-300 p-2">&lt; 10km</td>
                  <td class="border border-gray-300 p-2">Giao nhanh trong ngày (8h - 20h)</td>
                </tr>
                <tr>
                  <td class="border border-gray-300 p-2">&gt; 10km</td>
                  <td class="border border-gray-300 p-2">1 - 2 ngày làm việc</td>
                </tr>
                <tr>
                  <td class="border border-gray-300 p-2" rowspan="2">Liên tỉnh</td>
                  <td class="border border-gray-300 p-2">Trung tâm Tỉnh/TP</td>
                  <td class="border border-gray-300 p-2">2 - 3 ngày làm việc</td>
                </tr>
                <tr>
                  <td class="border border-gray-300 p-2">Huyện / Xã</td>
                  <td class="border border-gray-300 p-2">4 - 6 ngày làm việc</td>
                </tr>
              </tbody>
            </table>
            <p class="text-xs text-gray-500 mt-2 italic">* Lưu ý: Với sản phẩm tạm hết hàng, thời gian có thể kéo dài thêm 3-5 ngày để nhập kho.</p>
          </div>

          <div class="mb-6">
            <p class="font-bold text-gray-700 mb-2">3. Hình thức thanh toán</p>
            <ul class="list-disc pl-6 space-y-2">
              <li><strong>Thanh toán khi nhận hàng (COD):</strong> Quý khách thanh toán tiền mặt cho shipper khi nhận hàng.</li>
              <li><strong>Chuyển khoản trước:</strong>
                <div class="bg-yellow-50 p-4 mt-2 rounded border border-yellow-200">
                  <p><strong>Ngân hàng:</strong> [TECHCOMBANK]</p>
                  <p><strong>Số tài khoản:</strong> [19038401620018]</p>
                  <p><strong>Chủ tài khoản:</strong> PHẠM ANH THƯ (Hộ KD Nhà Thuốc Thiên Hậu 1)</p>
                  <p class="text-sm text-gray-500 mt-1"><em>* Vui lòng ghi nội dung chuyển khoản: Tên + SĐT đặt hàng.</em></p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div class="mb-6">
          <h4 class="text-lg font-bold text-blue-800 mb-3 uppercase">III. Hỏi đáp giao hàng</h4>
          
          <div class="space-y-4">
            <div>
              <p class="font-bold text-gray-800">1. Nhà thuốc Thiên Hậu có giao hàng cuối tuần/Lễ không?</p>
              <p>Chúng tôi giao hàng tất cả các ngày trong tuần (trừ một số ngày Lễ lớn sẽ có thông báo riêng).</p>
            </div>
            <div>
              <p class="font-bold text-gray-800">2. Tôi cần hàng gấp?</p>
              <p>Nếu ở khu vực Thủ Đức hoặc lân cận, chúng tôi sẽ cố gắng hỗ trợ giao siêu tốc. Vui lòng gọi Hotline để yêu cầu.</p>
            </div>
            <div>
              <p class="font-bold text-gray-800">3. Kiểm tra hàng trước khi thanh toán?</p>
              <p>Quý khách <strong>ĐƯỢC PHÉP</strong> mở kiện hàng kiểm tra tình trạng bên ngoài (móp méo, rách tem...) trước khi thanh toán. Không áp dụng dùng thử sản phẩm.</p>
            </div>
            <div>
              <p class="font-bold text-gray-800">4. Giao hàng không thành công?</p>
              <p>Nếu lần 1 không thành công, chúng tôi sẽ liên hệ lại để sắp xếp. Nếu không liên lạc được sau nhiều lần, đơn hàng sẽ bị hủy.</p>
            </div>
          </div>
        </div>

      </div>
    `
  },
  {
    id: "thanh-toan",
    title: "Chính sách thanh toán",
    content: `
      <div class="text-gray-800 text-sm md:text-base leading-relaxed">
        <h3 class="text-2xl font-bold text-blue-900 mb-6 border-b pb-2 uppercase">Phương thức thanh toán</h3>

        <p class="mb-4">
          Tại <strong>Nhà thuốc Thiên Hậu</strong>, chúng tôi hỗ trợ đa dạng các phương thức thanh toán để thuận tiện nhất cho Quý khách hàng mua sắm trực tuyến:
        </p>

        <div class="space-y-6">
          
          <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 class="text-lg font-bold text-blue-800 mb-2 flex items-center gap-2">
              <span>1. Thanh toán tiền mặt khi nhận hàng (COD)</span>
            </h4>
            <p>
              Đây là hình thức được ưa chuộng nhất. Thiên Hậu sẽ giao hàng tận nơi, Quý khách nhận hàng, kiểm tra đầy đủ rồi mới thanh toán tiền mặt trực tiếp cho nhân viên giao hàng (Shipper).
            </p>
          </div>

          <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 class="text-lg font-bold text-blue-800 mb-2 flex items-center gap-2">
              <span>2. Thanh toán qua thẻ ngân hàng (Tại quầy)</span>
            </h4>
            <p>
              Khi mua hàng trực tiếp tại nhà thuốc, chúng tôi chấp nhận thanh toán bằng nhiều loại thẻ: Thẻ ATM nội địa, Thẻ tín dụng/Ghi nợ quốc tế (Visa, MasterCard, JCB...).
            </p>
          </div>

          <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 class="text-lg font-bold text-blue-800 mb-2 flex items-center gap-2">
              <span>3. Chuyển khoản ngân hàng</span>
            </h4>
            <p class="mb-3">
              Quý khách có thể chọn chuyển khoản trước vào tài khoản của Nhà thuốc Thiên Hậu theo thông tin dưới đây:
            </p>
            
            <div class="bg-white p-4 rounded border border-blue-100 shadow-sm">
              <ul class="space-y-2 font-medium text-gray-700">
                <li>
                  <span class="inline-block w-32 text-gray-500 font-normal">Ngân hàng:</span>
                  <strong class="text-blue-700 text-lg">[TECHCOMBANK]</strong>
                </li>
                <li>
                  <span class="inline-block w-32 text-gray-500 font-normal">Số tài khoản:</span>
                  <strong class="text-red-600 text-xl tracking-wider">[19038401620018]</strong>
                </li>
                <li>
                  <span class="inline-block w-32 text-gray-500 font-normal">Chủ tài khoản:</span>
                  <strong class="uppercase text-gray-800">[PHẠM ANH THƯ]</strong>
                </li>
                <li class="pt-2 border-t mt-2">
                  <span class="inline-block w-32 text-gray-500 font-normal">Nội dung CK:</span>
                  <span class="italic text-gray-600">Họ tên + Số điện thoại mua hàng</span>
                </li>
              </ul>
            </div>
          </div>

        </div>

        <div class="mt-8 p-4 bg-yellow-50 text-sm border-l-4 border-yellow-400">
          <p class="font-bold mb-1">⚠️ Lưu ý:</p>
          <p>
            Giá sản phẩm niêm yết trên website là giá <strong>đã bao gồm thuế VAT</strong>, nhưng <strong>chưa bao gồm chi phí vận chuyển</strong>. 
            Chi tiết biểu phí vận chuyển Quý khách vui lòng xem tại mục <a href="/thong-tin/giao-hang" class="text-blue-600 underline font-bold">Chính sách giao hàng</a>.
          </p>
        </div>

      </div>
    `
  },
];