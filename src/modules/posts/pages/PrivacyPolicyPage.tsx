export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12 lg:py-16 select-none">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-block mb-4 sm:mb-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <i className="fa-solid fa-shield-halved text-3xl sm:text-4xl text-white"></i>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
            Chính sách bảo mật
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            Cam kết bảo vệ quyền riêng tư và thông tin cá nhân của bạn
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="p-6 sm:p-8 lg:p-12">
            <div className="space-y-8 sm:space-y-10 text-gray-700">
              <section className="scroll-mt-20">
                <div className="flex items-start gap-3 sm:gap-4 mb-4">
                  <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm sm:text-base">1</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">Giới thiệu</h2>
                </div>
                <p className="leading-relaxed text-sm sm:text-base ml-0 sm:ml-14">
                Tại BlogHub, chúng tôi cam kết bảo vệ quyền riêng tư và thông tin cá nhân của bạn. 
                Chính sách bảo mật này giải thích cách chúng tôi thu thập, sử dụng, lưu trữ và bảo vệ 
                thông tin của bạn khi bạn sử dụng dịch vụ của chúng tôi.
              </p>
              </section>

              <section className="scroll-mt-20">
                <div className="flex items-start gap-3 sm:gap-4 mb-4">
                  <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm sm:text-base">2</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">Thông tin chúng tôi thu thập</h2>
                </div>
                <p className="leading-relaxed text-sm sm:text-base mb-4 ml-0 sm:ml-14">
                  Chúng tôi thu thập các loại thông tin sau:
                </p>
                <ul className="space-y-3 ml-0 sm:ml-14">
                  <li className="flex items-start gap-3 bg-gray-50 p-3 sm:p-4 rounded-xl">
                    <i className="fa-solid fa-circle-check text-blue-600 mt-1 flex-shrink-0"></i>
                    <span className="text-sm sm:text-base"><strong className="text-gray-900">Thông tin cá nhân:</strong> Tên, địa chỉ email, ảnh đại diện khi bạn đăng ký tài khoản</span>
                  </li>
                  <li className="flex items-start gap-3 bg-gray-50 p-3 sm:p-4 rounded-xl">
                    <i className="fa-solid fa-circle-check text-blue-600 mt-1 flex-shrink-0"></i>
                    <span className="text-sm sm:text-base"><strong className="text-gray-900">Nội dung:</strong> Bài viết, bình luận và tương tác mà bạn tạo ra trên nền tảng</span>
                  </li>
                  <li className="flex items-start gap-3 bg-gray-50 p-3 sm:p-4 rounded-xl">
                    <i className="fa-solid fa-circle-check text-blue-600 mt-1 flex-shrink-0"></i>
                    <span className="text-sm sm:text-base"><strong className="text-gray-900">Thông tin kỹ thuật:</strong> Địa chỉ IP, loại trình duyệt, hệ điều hành và thông tin thiết bị</span>
                  </li>
                  <li className="flex items-start gap-3 bg-gray-50 p-3 sm:p-4 rounded-xl">
                    <i className="fa-solid fa-circle-check text-blue-600 mt-1 flex-shrink-0"></i>
                    <span className="text-sm sm:text-base"><strong className="text-gray-900">Dữ liệu sử dụng:</strong> Các trang bạn truy cập, thời gian sử dụng và các tương tác với nền tảng</span>
                  </li>
                </ul>
              </section>

              <section className="scroll-mt-20">
                <div className="flex items-start gap-3 sm:gap-4 mb-4">
                  <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm sm:text-base">3</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">Cách chúng tôi sử dụng thông tin</h2>
                </div>
                <p className="leading-relaxed mb-4 text-gray-600 text-sm sm:text-base">
                  Thông tin của bạn được sử dụng để:
                </p>
                <ul className="space-y-2 sm:space-y-3">
                  <li className="flex items-start gap-3 bg-gray-50 p-3 sm:p-4 rounded-xl">
                    <i className="fa-solid fa-circle-check text-blue-600 mt-1 flex-shrink-0"></i>
                    <span className="text-sm sm:text-base text-gray-700">Cung cấp và duy trì dịch vụ BlogHub</span>
                  </li>
                  <li className="flex items-start gap-3 bg-gray-50 p-3 sm:p-4 rounded-xl">
                    <i className="fa-solid fa-circle-check text-blue-600 mt-1 flex-shrink-0"></i>
                    <span className="text-sm sm:text-base text-gray-700">Xác thực và quản lý tài khoản của bạn</span>
                  </li>
                  <li className="flex items-start gap-3 bg-gray-50 p-3 sm:p-4 rounded-xl">
                    <i className="fa-solid fa-circle-check text-blue-600 mt-1 flex-shrink-0"></i>
                    <span className="text-sm sm:text-base text-gray-700">Cá nhân hóa trải nghiệm người dùng</span>
                  </li>
                  <li className="flex items-start gap-3 bg-gray-50 p-3 sm:p-4 rounded-xl">
                    <i className="fa-solid fa-circle-check text-blue-600 mt-1 flex-shrink-0"></i>
                    <span className="text-sm sm:text-base text-gray-700">Gửi thông báo về hoạt động tài khoản và cập nhật dịch vụ</span>
                  </li>
                  <li className="flex items-start gap-3 bg-gray-50 p-3 sm:p-4 rounded-xl">
                    <i className="fa-solid fa-circle-check text-blue-600 mt-1 flex-shrink-0"></i>
                    <span className="text-sm sm:text-base text-gray-700">Phân tích và cải thiện chất lượng dịch vụ</span>
                  </li>
                  <li className="flex items-start gap-3 bg-gray-50 p-3 sm:p-4 rounded-xl">
                    <i className="fa-solid fa-circle-check text-blue-600 mt-1 flex-shrink-0"></i>
                    <span className="text-sm sm:text-base text-gray-700">Phát hiện và ngăn chặn hoạt động gian lận hoặc lạm dụng</span>
                  </li>
                </ul>
              </section>

            <section className="scroll-mt-20">
              <div className="flex items-start gap-3 sm:gap-4 mb-4">
                <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm sm:text-base">4</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">Chia sẻ thông tin</h2>
              </div>
              <p className="leading-relaxed mb-4 text-gray-600 text-sm sm:text-base">
                Chúng tôi không bán hoặc cho thuê thông tin cá nhân của bạn. Thông tin của bạn chỉ được chia sẻ trong 
                các trường hợp sau:
              </p>
              <ul className="space-y-2 sm:space-y-3">
                <li className="flex items-start gap-3 bg-gray-50 p-3 sm:p-4 rounded-xl">
                  <i className="fa-solid fa-circle-check text-blue-600 mt-1 flex-shrink-0"></i>
                  <span className="text-sm sm:text-base"><strong className="text-gray-900">Nội dung công khai:</strong> Bài viết và bình luận của bạn sẽ hiển thị công khai cho người dùng khác</span>
                </li>
                <li className="flex items-start gap-3 bg-gray-50 p-3 sm:p-4 rounded-xl">
                  <i className="fa-solid fa-circle-check text-blue-600 mt-1 flex-shrink-0"></i>
                  <span className="text-sm sm:text-base"><strong className="text-gray-900">Nhà cung cấp dịch vụ:</strong> Với các đối tác hỗ trợ vận hành nền tảng (hosting, analytics)</span>
                </li>
                <li className="flex items-start gap-3 bg-gray-50 p-3 sm:p-4 rounded-xl">
                  <i className="fa-solid fa-circle-check text-blue-600 mt-1 flex-shrink-0"></i>
                  <span className="text-sm sm:text-base"><strong className="text-gray-900">Yêu cầu pháp lý:</strong> Khi được yêu cầu bởi cơ quan chức năng theo quy định pháp luật</span>
                </li>
                <li className="flex items-start gap-3 bg-gray-50 p-3 sm:p-4 rounded-xl">
                  <i className="fa-solid fa-circle-check text-blue-600 mt-1 flex-shrink-0"></i>
                  <span className="text-sm sm:text-base"><strong className="text-gray-900">Bảo vệ quyền lợi:</strong> Để bảo vệ quyền lợi và an toàn của BlogHub và người dùng</span>
                </li>
              </ul>
            </section>

            <section className="scroll-mt-20">
              <div className="flex items-start gap-3 sm:gap-4 mb-4">
                <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm sm:text-base">5</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">Bảo mật thông tin</h2>
              </div>
              <p className="leading-relaxed mb-4 text-gray-600 text-sm sm:text-base">
                Chúng tôi áp dụng các biện pháp bảo mật kỹ thuật và tổ chức để bảo vệ thông tin của bạn khỏi truy cập 
                trái phép, mất mát hoặc tiết lộ. Điều này bao gồm:
              </p>
              <ul className="space-y-2 sm:space-y-3">
                <li className="flex items-start gap-3 bg-gray-50 p-3 sm:p-4 rounded-xl">
                  <i className="fa-solid fa-circle-check text-blue-600 mt-1 flex-shrink-0"></i>
                  <span className="text-sm sm:text-base text-gray-700">Mã hóa dữ liệu khi truyền tải (SSL/TLS)</span>
                </li>
                <li className="flex items-start gap-3 bg-gray-50 p-3 sm:p-4 rounded-xl">
                  <i className="fa-solid fa-circle-check text-blue-600 mt-1 flex-shrink-0"></i>
                  <span className="text-sm sm:text-base text-gray-700">Mã hóa mật khẩu bằng thuật toán băm an toàn</span>
                </li>
                <li className="flex items-start gap-3 bg-gray-50 p-3 sm:p-4 rounded-xl">
                  <i className="fa-solid fa-circle-check text-blue-600 mt-1 flex-shrink-0"></i>
                  <span className="text-sm sm:text-base text-gray-700">Kiểm soát truy cập nghiêm ngặt đối với dữ liệu người dùng</span>
                </li>
                <li className="flex items-start gap-3 bg-gray-50 p-3 sm:p-4 rounded-xl">
                  <i className="fa-solid fa-circle-check text-blue-600 mt-1 flex-shrink-0"></i>
                  <span className="text-sm sm:text-base text-gray-700">Giám sát và kiểm tra bảo mật định kỳ</span>
                </li>
              </ul>
            </section>

            <section className="scroll-mt-20">
              <div className="flex items-start gap-3 sm:gap-4 mb-4">
                <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm sm:text-base">6</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">Cookies và công nghệ theo dõi</h2>
              </div>
              <p className="leading-relaxed text-gray-600 text-sm sm:text-base">
                BlogHub sử dụng cookies và các công nghệ tương tự để cải thiện trải nghiệm người dùng, phân tích lưu lượng 
                truy cập và cá nhân hóa nội dung. Bạn có thể kiểm soát việc sử dụng cookies thông qua cài đặt trình duyệt 
                của mình.
              </p>
            </section>

            <section className="scroll-mt-20">
              <div className="flex items-start gap-3 sm:gap-4 mb-4">
                <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm sm:text-base">7</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">Quyền của bạn</h2>
              </div>
              <p className="leading-relaxed mb-4 text-gray-600 text-sm sm:text-base">
                Bạn có các quyền sau đối với thông tin cá nhân của mình:
              </p>
              <ul className="space-y-2 sm:space-y-3">
                <li className="flex items-start gap-3 bg-gray-50 p-3 sm:p-4 rounded-xl">
                  <i className="fa-solid fa-circle-check text-blue-600 mt-1 flex-shrink-0"></i>
                  <span className="text-sm sm:text-base text-gray-700">Truy cập và xem thông tin cá nhân mà chúng tôi lưu trữ</span>
                </li>
                <li className="flex items-start gap-3 bg-gray-50 p-3 sm:p-4 rounded-xl">
                  <i className="fa-solid fa-circle-check text-blue-600 mt-1 flex-shrink-0"></i>
                  <span className="text-sm sm:text-base text-gray-700">Yêu cầu chỉnh sửa hoặc cập nhật thông tin không chính xác</span>
                </li>
                <li className="flex items-start gap-3 bg-gray-50 p-3 sm:p-4 rounded-xl">
                  <i className="fa-solid fa-circle-check text-blue-600 mt-1 flex-shrink-0"></i>
                  <span className="text-sm sm:text-base text-gray-700">Yêu cầu xóa tài khoản và dữ liệu cá nhân</span>
                </li>
                <li className="flex items-start gap-3 bg-gray-50 p-3 sm:p-4 rounded-xl">
                  <i className="fa-solid fa-circle-check text-blue-600 mt-1 flex-shrink-0"></i>
                  <span className="text-sm sm:text-base text-gray-700">Từ chối nhận email marketing (không áp dụng cho email hệ thống quan trọng)</span>
                </li>
                <li className="flex items-start gap-3 bg-gray-50 p-3 sm:p-4 rounded-xl">
                  <i className="fa-solid fa-circle-check text-blue-600 mt-1 flex-shrink-0"></i>
                  <span className="text-sm sm:text-base text-gray-700">Rút lại sự đồng ý đối với việc xử lý dữ liệu cá nhân</span>
                </li>
              </ul>
            </section>

            <section className="scroll-mt-20">
              <div className="flex items-start gap-3 sm:gap-4 mb-4">
                <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm sm:text-base">8</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">Lưu trữ dữ liệu</h2>
              </div>
              <p className="leading-relaxed text-gray-600 text-sm sm:text-base">
                Chúng tôi lưu trữ thông tin cá nhân của bạn trong khoảng thời gian cần thiết để cung cấp dịch vụ và tuân thủ 
                nghĩa vụ pháp lý. Khi bạn xóa tài khoản, dữ liệu cá nhân của bạn sẽ được xóa hoặc ẩn danh hóa, ngoại trừ 
                trường hợp chúng tôi cần lưu trữ theo yêu cầu pháp luật.
              </p>
            </section>

            <section className="scroll-mt-20">
              <div className="flex items-start gap-3 sm:gap-4 mb-4">
                <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm sm:text-base">9</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">Thay đổi chính sách</h2>
              </div>
              <p className="leading-relaxed text-gray-600 text-sm sm:text-base">
                Chúng tôi có thể cập nhật Chính sách bảo mật này theo thời gian. Chúng tôi sẽ thông báo về các thay đổi 
                quan trọng thông qua email hoặc thông báo trên nền tảng. Ngày cập nhật cuối cùng sẽ được hiển thị ở cuối 
                trang này.
              </p>
            </section>

            <section className="scroll-mt-20">
              <div className="flex items-start gap-3 sm:gap-4 mb-4">
                <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm sm:text-base">10</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">Liên hệ</h2>
              </div>
              <p className="leading-relaxed mb-4 text-gray-600 text-sm sm:text-base">
                Nếu bạn có bất kỳ câu hỏi hoặc thắc mắc nào về Chính sách bảo mật này, hoặc muốn thực hiện quyền của mình, 
                vui lòng liên hệ với chúng tôi qua:
              </p>
              <div className="bg-gray-50 p-4 sm:p-6 rounded-xl space-y-3">
                <div className="flex items-start gap-3">
                  <i className="fa-solid fa-envelope text-blue-600 mt-1"></i>
                  <div>
                    <strong className="text-gray-900 text-sm sm:text-base">Email:</strong>
                    <a href="mailto:duyhoangtran2006@gmail.com" className="text-blue-600 hover:text-blue-700 ml-2 text-sm sm:text-base transition-colors">
                      duyhoangtran2006@gmail.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <i className="fa-solid fa-location-dot text-blue-600 mt-1"></i>
                  <div>
                    <strong className="text-gray-900 text-sm sm:text-base">Địa chỉ:</strong>
                    <span className="text-gray-700 ml-2 text-sm sm:text-base">Học Viện Công Nghệ Bưu Chính Viễn Thông, cơ sở tại TP.HCM</span>
                  </div>
                </div>
              </div>
            </section>

            </div>
          </div>
          
          {/* Footer */}
          <div className="bg-gray-50 px-6 sm:px-8 lg:px-12 py-6 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <i className="fa-solid fa-calendar-days text-blue-600"></i>
                <span>Cập nhật lần cuối: 17/11/2025</span>
              </div>
              <a 
                href="mailto:duyhoangtran2006@gmail.com" 
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                <i className="fa-solid fa-envelope"></i>
                <span>Liên hệ hỗ trợ</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
