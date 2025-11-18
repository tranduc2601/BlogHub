export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12 select-none">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
            Điều khoản sử dụng
          </h1>
          
          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Chấp nhận điều khoản</h2>
              <p className="leading-relaxed">
                Bằng việc truy cập và sử dụng BlogHub, bạn đồng ý tuân theo các điều khoản và điều kiện được quy định dưới đây. 
                Nếu bạn không đồng ý với bất kỳ phần nào của các điều khoản này, vui lòng không sử dụng dịch vụ của chúng tôi.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Quyền và trách nhiệm người dùng</h2>
              <p className="leading-relaxed mb-3">
                Khi sử dụng BlogHub, bạn có trách nhiệm:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Cung cấp thông tin chính xác và cập nhật khi đăng ký tài khoản</li>
                <li>Bảo mật thông tin đăng nhập của bạn</li>
                <li>Chịu trách nhiệm về tất cả hoạt động diễn ra dưới tài khoản của bạn</li>
                <li>Không đăng tải nội dung vi phạm pháp luật, xúc phạm, hoặc gây hại</li>
                <li>Tôn trọng quyền sở hữu trí tuệ của người khác</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Nội dung người dùng</h2>
              <p className="leading-relaxed">
                Bạn giữ quyền sở hữu đối với nội dung mà bạn đăng tải lên BlogHub. Tuy nhiên, bằng việc đăng tải nội dung, 
                bạn cấp cho BlogHub quyền sử dụng, sao chép, phân phối và hiển thị nội dung đó trên nền tảng của chúng tôi. 
                Chúng tôi có quyền xóa bất kỳ nội dung nào vi phạm điều khoản này mà không cần thông báo trước.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Hành vi bị cấm</h2>
              <p className="leading-relaxed mb-3">
                Các hành vi sau đây bị nghiêm cấm trên BlogHub:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Spam hoặc gửi nội dung quảng cáo không mong muốn</li>
                <li>Sử dụng ngôn ngữ thù địch, phân biệt đối xử hoặc xúc phạm</li>
                <li>Cố gắng truy cập trái phép vào hệ thống hoặc tài khoản người khác</li>
                <li>Đăng tải virus, malware hoặc mã độc hại</li>
                <li>Sao chép hoặc đạo nhái nội dung của người khác</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Chấm dứt tài khoản</h2>
              <p className="leading-relaxed">
                BlogHub có quyền tạm ngưng hoặc chấm dứt tài khoản của bạn nếu phát hiện vi phạm điều khoản sử dụng. 
                Bạn cũng có thể yêu cầu xóa tài khoản của mình bất kỳ lúc nào bằng cách liên hệ với chúng tôi.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Giới hạn trách nhiệm</h2>
              <p className="leading-relaxed">
                BlogHub được cung cấp "như hiện tại" mà không có bất kỳ bảo đảm nào. Chúng tôi không chịu trách nhiệm về 
                bất kỳ thithiệt hại nào phát sinh từ việc sử dụng hoặc không thể sử dụng dịch vụ. Chúng tôi cũng không 
                chịu trách nhiệm về nội dung do người dùng đăng tải.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Thay đổi điều khoản</h2>
              <p className="leading-relaxed">
                Chúng tôi có quyền cập nhật các điều khoản sử dụng này bất kỳ lúc nào. Các thay đổi sẽ có hiệu lực ngay 
                khi được đăng tải trên trang web. Việc bạn tiếp tục sử dụng BlogHub sau khi có thay đổi đồng nghĩa với 
                việc bạn chấp nhận các điều khoản mới.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Liên hệ</h2>
              <p className="leading-relaxed">
                Nếu bạn có bất kỳ câu hỏi nào về Điều khoản sử dụng này, vui lòng liên hệ với chúng tôi qua email: 
                <a href="mailto:duyhoangtran2006@gmail.com" className="text-blue-600 hover:text-blue-800 ml-1">
                  duyhoangtran2006@gmail.com
                </a>
              </p>
            </section>

            <div className="mt-8 pt-6 border-t border-gray-200 text-sm text-gray-500 text-center">
              Cập nhật lần cuối: Ngày 17 tháng 11 năm 2025
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
