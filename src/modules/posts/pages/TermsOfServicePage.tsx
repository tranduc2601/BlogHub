export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12 select-none">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 sm:px-8 lg:px-12 py-8 sm:py-12">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <i className="fa-solid fa-file-contract text-2xl sm:text-3xl text-white"></i>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1 sm:mb-2">
                  Điều khoản sử dụng
                </h1>
                <p className="text-blue-100 text-sm sm:text-base">
                  Vui lòng đọc kỹ trước khi sử dụng BlogHub
                </p>
              </div>
            </div>
          </div>


          <div className="px-6 sm:px-8 lg:px-12 py-8 sm:py-10 lg:py-12">
            <div className="space-y-6 sm:space-y-8 text-gray-700">
              <section className="scroll-mt-20">
                <div className="flex items-start gap-3 sm:gap-4 mb-4">
                  <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm sm:text-base">1</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">Chấp nhận điều khoản</h2>
                </div>
                <p className="leading-relaxed text-gray-600 text-sm sm:text-base">
                  Bằng việc truy cập và sử dụng BlogHub, bạn đồng ý tuân theo các điều khoản và điều kiện được quy định dưới đây. 
                  Nếu bạn không đồng ý với bất kỳ phần nào của các điều khoản này, vui lòng không sử dụng dịch vụ của chúng tôi.
                </p>
              </section>

              <section className="scroll-mt-20">
                <div className="flex items-start gap-3 sm:gap-4 mb-4">
                  <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm sm:text-base">2</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">Quyền và trách nhiệm người dùng</h2>
                </div>
                <p className="leading-relaxed mb-4 text-gray-600 text-sm sm:text-base">
                  Khi sử dụng BlogHub, bạn có trách nhiệm:
                </p>
                <ul className="space-y-2 sm:space-y-3">
                  <li className="flex items-start gap-3 bg-gray-50 p-3 sm:p-4 rounded-xl">
                    <i className="fa-solid fa-circle-check text-blue-600 mt-1 flex-shrink-0"></i>
                    <span className="text-sm sm:text-base text-gray-700">Cung cấp thông tin chính xác và cập nhật khi đăng ký tài khoản</span>
                  </li>
                  <li className="flex items-start gap-3 bg-gray-50 p-3 sm:p-4 rounded-xl">
                    <i className="fa-solid fa-circle-check text-blue-600 mt-1 flex-shrink-0"></i>
                    <span className="text-sm sm:text-base text-gray-700">Bảo mật thông tin đăng nhập của bạn</span>
                  </li>
                  <li className="flex items-start gap-3 bg-gray-50 p-3 sm:p-4 rounded-xl">
                    <i className="fa-solid fa-circle-check text-blue-600 mt-1 flex-shrink-0"></i>
                    <span className="text-sm sm:text-base text-gray-700">Chịu trách nhiệm về tất cả hoạt động diễn ra dưới tài khoản của bạn</span>
                  </li>
                  <li className="flex items-start gap-3 bg-gray-50 p-3 sm:p-4 rounded-xl">
                    <i className="fa-solid fa-circle-check text-blue-600 mt-1 flex-shrink-0"></i>
                    <span className="text-sm sm:text-base text-gray-700">Không đăng tải nội dung vi phạm pháp luật, xúc phạm, hoặc gây hại</span>
                  </li>
                  <li className="flex items-start gap-3 bg-gray-50 p-3 sm:p-4 rounded-xl">
                    <i className="fa-solid fa-circle-check text-blue-600 mt-1 flex-shrink-0"></i>
                    <span className="text-sm sm:text-base text-gray-700">Tôn trọng quyền sở hữu trí tuệ của người khác</span>
                  </li>
                </ul>
              </section>

              <section className="scroll-mt-20">
                <div className="flex items-start gap-3 sm:gap-4 mb-4">
                  <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm sm:text-base">3</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">Nội dung người dùng</h2>
                </div>
                <p className="leading-relaxed text-gray-600 text-sm sm:text-base">
                  Bạn giữ quyền sở hữu đối với nội dung mà bạn đăng tải lên BlogHub. Tuy nhiên, bằng việc đăng tải nội dung, 
                  bạn cấp cho BlogHub quyền sử dụng, sao chép, phân phối và hiển thị nội dung đó trên nền tảng của chúng tôi. 
                  Chúng tôi có quyền xóa bất kỳ nội dung nào vi phạm điều khoản này mà không cần thông báo trước.
                </p>
              </section>

              <section className="scroll-mt-20">
                <div className="flex items-start gap-3 sm:gap-4 mb-4">
                  <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm sm:text-base">4</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">Hành vi bị cấm</h2>
                </div>
                <p className="leading-relaxed mb-4 text-gray-600 text-sm sm:text-base">
                  Các hành vi sau đây bị nghiêm cấm trên BlogHub:
                </p>
                <ul className="space-y-2 sm:space-y-3">
                  <li className="flex items-start gap-3 bg-red-50 p-3 sm:p-4 rounded-xl">
                    <i className="fa-solid fa-circle-xmark text-red-600 mt-1 flex-shrink-0"></i>
                    <span className="text-sm sm:text-base text-gray-700">Spam hoặc gửi nội dung quảng cáo không mong muốn</span>
                  </li>
                  <li className="flex items-start gap-3 bg-red-50 p-3 sm:p-4 rounded-xl">
                    <i className="fa-solid fa-circle-xmark text-red-600 mt-1 flex-shrink-0"></i>
                    <span className="text-sm sm:text-base text-gray-700">Sử dụng ngôn ngữ thù địch, phân biệt đối xử hoặc xúc phạm</span>
                  </li>
                  <li className="flex items-start gap-3 bg-red-50 p-3 sm:p-4 rounded-xl">
                    <i className="fa-solid fa-circle-xmark text-red-600 mt-1 flex-shrink-0"></i>
                    <span className="text-sm sm:text-base text-gray-700">Cố gắng truy cập trái phép vào hệ thống hoặc tài khoản người khác</span>
                  </li>
                  <li className="flex items-start gap-3 bg-red-50 p-3 sm:p-4 rounded-xl">
                    <i className="fa-solid fa-circle-xmark text-red-600 mt-1 flex-shrink-0"></i>
                    <span className="text-sm sm:text-base text-gray-700">Đăng tải virus, malware hoặc mã độc hại</span>
                  </li>
                  <li className="flex items-start gap-3 bg-red-50 p-3 sm:p-4 rounded-xl">
                    <i className="fa-solid fa-circle-xmark text-red-600 mt-1 flex-shrink-0"></i>
                    <span className="text-sm sm:text-base text-gray-700">Sao chép hoặc đạo nhái nội dung của người khác</span>
                  </li>
                </ul>
              </section>

              <section className="scroll-mt-20">
                <div className="flex items-start gap-3 sm:gap-4 mb-4">
                  <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm sm:text-base">5</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">Chấm dứt tài khoản</h2>
                </div>
                <p className="leading-relaxed text-gray-600 text-sm sm:text-base">
                  BlogHub có quyền tạm ngưng hoặc chấm dứt tài khoản của bạn nếu phát hiện vi phạm điều khoản sử dụng. 
                  Bạn cũng có thể yêu cầu xóa tài khoản của mình bất kỳ lúc nào bằng cách liên hệ với chúng tôi.
                </p>
              </section>

              <section className="scroll-mt-20">
                <div className="flex items-start gap-3 sm:gap-4 mb-4">
                  <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm sm:text-base">6</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">Giới hạn trách nhiệm</h2>
                </div>
                <p className="leading-relaxed text-gray-600 text-sm sm:text-base">
                  BlogHub được cung cấp "như hiện tại" mà không có bất kỳ bảo đảm nào. Chúng tôi không chịu trách nhiệm về 
                  bất kỳ thiệt hại nào phát sinh từ việc sử dụng hoặc không thể sử dụng dịch vụ. Chúng tôi cũng không 
                  chịu trách nhiệm về nội dung do người dùng đăng tải.
                </p>
              </section>

              <section className="scroll-mt-20">
                <div className="flex items-start gap-3 sm:gap-4 mb-4">
                  <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm sm:text-base">7</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">Thay đổi điều khoản</h2>
                </div>
                <p className="leading-relaxed text-gray-600 text-sm sm:text-base">
                  Chúng tôi có quyền cập nhật các điều khoản sử dụng này bất kỳ lúc nào. Các thay đổi sẽ có hiệu lực ngay 
                  khi được đăng tải trên trang web. Việc bạn tiếp tục sử dụng BlogHub sau khi có thay đổi đồng nghĩa với 
                  việc bạn chấp nhận các điều khoản mới.
                </p>
              </section>

              <section className="scroll-mt-20">
                <div className="flex items-start gap-3 sm:gap-4 mb-4">
                  <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm sm:text-base">8</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">Liên hệ</h2>
                </div>
                <p className="leading-relaxed mb-4 text-gray-600 text-sm sm:text-base">
                  Nếu bạn có bất kỳ câu hỏi nào về Điều khoản sử dụng này, vui lòng liên hệ với chúng tôi qua:
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
