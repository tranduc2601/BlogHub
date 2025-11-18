export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12 select-none">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
            Chính sách bảo mật
          </h1>
          
          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Giới thiệu</h2>
              <p className="leading-relaxed">
                Tại BlogHub, chúng tôi cam kết bảo vệ quyền riêng tư và thông tin cá nhân của bạn. 
                Chính sách bảo mật này giải thích cách chúng tôi thu thập, sử dụng, lưu trữ và bảo vệ 
                thông tin của bạn khi bạn sử dụng dịch vụ của chúng tôi.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Thông tin chúng tôi thu thập</h2>
              <p className="leading-relaxed mb-3">
                Chúng tôi thu thập các loại thông tin sau:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Thông tin cá nhân:</strong> Tên, địa chỉ email, ảnh đại diện khi bạn đăng ký tài khoản</li>
                <li><strong>Nội dung:</strong> Bài viết, bình luận và tương tác mà bạn tạo ra trên nền tảng</li>
                <li><strong>Thông tin kỹ thuật:</strong> Địa chỉ IP, loại trình duyệt, hệ điều hành và thông tin thiết bị</li>
                <li><strong>Dữ liệu sử dụng:</strong> Các trang bạn truy cập, thời gian sử dụng và các tương tác với nền tảng</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Cách chúng tôi sử dụng thông tin</h2>
              <p className="leading-relaxed mb-3">
                Thông tin của bạn được sử dụng để:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Cung cấp và duy trì dịch vụ BlogHub</li>
                <li>Xác thực và quản lý tài khoản của bạn</li>
                <li>Cá nhân hóa trải nghiệm người dùng</li>
                <li>Gửi thông báo về hoạt động tài khoản và cập nhật dịch vụ</li>
                <li>Phân tích và cải thiện chất lượng dịch vụ</li>
                <li>Phát hiện và ngăn chặn hoạt động gian lận hoặc lạm dụng</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Chia sẻ thông tin</h2>
              <p className="leading-relaxed">
                Chúng tôi không bán hoặc cho thuê thông tin cá nhân của bạn. Thông tin của bạn chỉ được chia sẻ trong 
                các trường hợp sau:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-3">
                <li><strong>Nội dung công khai:</strong> Bài viết và bình luận của bạn sẽ hiển thị công khai cho người dùng khác</li>
                <li><strong>Nhà cung cấp dịch vụ:</strong> Với các đối tác hỗ trợ vận hành nền tảng (hosting, analytics)</li>
                <li><strong>Yêu cầu pháp lý:</strong> Khi được yêu cầu bởi cơ quan chức năng theo quy định pháp luật</li>
                <li><strong>Bảo vệ quyền lợi:</strong> Để bảo vệ quyền lợi và an toàn của BlogHub và người dùng</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Bảo mật thông tin</h2>
              <p className="leading-relaxed">
                Chúng tôi áp dụng các biện pháp bảo mật kỹ thuật và tổ chức để bảo vệ thông tin của bạn khỏi truy cập 
                trái phép, mất mát hoặc tiết lộ. Điều này bao gồm:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-3">
                <li>Mã hóa dữ liệu khi truyền tải (SSL/TLS)</li>
                <li>Mã hóa mật khẩu bằng thuật toán băm an toàn</li>
                <li>Kiểm soát truy cập nghiêm ngặt đối với dữ liệu người dùng</li>
                <li>Giám sát và kiểm tra bảo mật định kỳ</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Cookies và công nghệ theo dõi</h2>
              <p className="leading-relaxed">
                BlogHub sử dụng cookies và các công nghệ tương tự để cải thiện trải nghiệm người dùng, phân tích lưu lượng 
                truy cập và cá nhân hóa nội dung. Bạn có thể kiểm soát việc sử dụng cookies thông qua cài đặt trình duyệt 
                của mình.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Quyền của bạn</h2>
              <p className="leading-relaxed mb-3">
                Bạn có các quyền sau đối với thông tin cá nhân của mình:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Truy cập và xem thông tin cá nhân mà chúng tôi lưu trữ</li>
                <li>Yêu cầu chỉnh sửa hoặc cập nhật thông tin không chính xác</li>
                <li>Yêu cầu xóa tài khoản và dữ liệu cá nhân</li>
                <li>Từ chối nhận email marketing (không áp dụng cho email hệ thống quan trọng)</li>
                <li>Rút lại sự đồng ý đối với việc xử lý dữ liệu cá nhân</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Lưu trữ dữ liệu</h2>
              <p className="leading-relaxed">
                Chúng tôi lưu trữ thông tin cá nhân của bạn trong khoảng thời gian cần thiết để cung cấp dịch vụ và tuân thủ 
                nghĩa vụ pháp lý. Khi bạn xóa tài khoản, dữ liệu cá nhân của bạn sẽ được xóa hoặc ẩn danh hóa, ngoại trừ 
                trường hợp chúng tôi cần lưu trữ theo yêu cầu pháp luật.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. Thay đổi chính sách</h2>
              <p className="leading-relaxed">
                Chúng tôi có thể cập nhật Chính sách bảo mật này theo thời gian. Chúng tôi sẽ thông báo về các thay đổi 
                quan trọng thông qua email hoặc thông báo trên nền tảng. Ngày cập nhật cuối cùng sẽ được hiển thị ở cuối 
                trang này.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">10. Liên hệ</h2>
              <p className="leading-relaxed">
                Nếu bạn có bất kỳ câu hỏi hoặc thắc mắc nào về Chính sách bảo mật này, hoặc muốn thực hiện quyền của mình, 
                vui lòng liên hệ với chúng tôi qua:
              </p>
              <ul className="list-none space-y-2 ml-4 mt-3">
                <li>
                  <strong>Email:</strong> 
                  <a href="mailto:duyhoangtran2006@gmail.com" className="text-blue-600 hover:text-blue-800 ml-1">
                    duyhoangtran2006@gmail.com
                  </a>
                </li>
                <li><strong>Địa chỉ:</strong> Học Viện Công Nghệ Bưu Chính Viễn Thông, cơ sở tại TP.HCM</li>
              </ul>
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
