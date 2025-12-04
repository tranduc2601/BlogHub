import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/core/auth";

export default function NotFoundPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [countdown, setCountdown] = useState(10);
  const [isAutoRedirect, setIsAutoRedirect] = useState(true);

  useEffect(() => {
    if (!isAutoRedirect) return;

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      navigate("/");
    }
  }, [countdown, navigate, isAutoRedirect]);

  const handleGoHome = () => {
    navigate("/");
  };

  const handleGoBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const handleBrowsePosts = () => {
    navigate("/posts");
  };

  const handleCancelAutoRedirect = () => {
    setIsAutoRedirect(false);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8 select-none">
      <div className="max-w-4xl w-full">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          
          <div className="bg-[#2664eb] px-6 py-12 sm:px-8 sm:py-16 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
              <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
            </div>
            
            <div className="relative z-10">
              <div className="inline-block animate-bounce mb-6">
                <i className="fa-solid fa-face-sad-tear text-6xl sm:text-8xl text-white"></i>
              </div>
              
              <h1 className="text-7xl sm:text-9xl font-black text-white mb-4 tracking-tight">
                404
              </h1>
              
              <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
                <p className="text-white text-base sm:text-lg font-semibold">
                  Trang không tồn tại
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 py-8 sm:px-8 sm:py-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
                Ối! Có vẻ như bạn đã lạc đường.
              </h2>
              
              <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                Trang bạn đang tìm kiếm có thể đã bị xóa, đổi tên hoặc tạm thời không khả dụng.
              </p>
            </div>

            {isAutoRedirect && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 sm:p-6 mb-8 animate-pulse">
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <i className="fa-solid fa-clock text-blue-600 text-xl"></i>
                  <p className="text-gray-700 font-medium text-sm sm:text-base">
                    Tự động chuyển về trang chủ sau{" "}
                    <span className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 text-white rounded-full font-bold text-lg sm:text-xl mx-1">
                      {countdown}
                    </span>{" "}
                    giây
                  </p>
                  <button
                    onClick={handleCancelAutoRedirect}
                    className="ml-2 mt-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 underline transition-colors cursor-pointer"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <button
                onClick={handleGoHome}
                className="group relative px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold transition-all duration-300 hover:shadow-xl hover:scale-105 active:scale-95 overflow-hidden cursor-pointer"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <div className="relative flex items-center justify-center gap-2">
                  <i className="fa-solid fa-home text-lg mr-1"></i>
                  <span>Về trang chủ</span>
                </div>
              </button>

              <button
                onClick={handleGoBack}
                className="group relative px-6 py-4 bg-white border-3 border-gray-300 text-gray-700 rounded-xl font-semibold transition-all duration-300 hover:border-blue-500 hover:text-blue-600 hover:shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
              >
                <div className="flex items-center justify-center gap-2">
                  <i className="fa-solid fa-arrow-left text-lg mr-1"></i>
                  <span>Quay lại</span>
                </div>
              </button>

              <button
                onClick={handleBrowsePosts}
                className="group relative px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold transition-all duration-300 hover:shadow-xl hover:scale-105 active:scale-95 overflow-hidden cursor-pointer"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <div className="relative flex items-center justify-center gap-2">
                  <i className="fa-solid fa-newspaper text-lg mr-1"></i>
                  <span>Xem bài viết</span>
                </div>
              </button>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 sm:p-8 border border-gray-200">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <i className="fa-solid fa-lightbulb text-yellow-500 mr-2"></i>
                Gợi ý cho bạn
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a
                  href="/"
                  className="group flex items-start gap-3 p-4 bg-white rounded-xl border-2 border-transparent hover:border-blue-500 transition-all duration-300 hover:shadow-md"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                    <i className="fa-solid fa-house text-blue-600 group-hover:text-white transition-colors"></i>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors">
                      Trang chủ
                    </h4>
                    <p className="text-sm text-gray-600">
                      Khám phá các bài viết mới nhất
                    </p>
                  </div>
                </a>

                <a
                  href="/posts"
                  className="group flex items-start gap-3 p-4 bg-white rounded-xl border-2 border-transparent hover:border-purple-500 transition-all duration-300 hover:shadow-md"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-600 transition-colors">
                    <i className="fa-solid fa-newspaper text-purple-600 group-hover:text-white transition-colors"></i>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 mb-1 group-hover:text-purple-600 transition-colors">
                      Tất cả bài viết
                    </h4>
                    <p className="text-sm text-gray-600">
                      Duyệt qua toàn bộ bài viết
                    </p>
                  </div>
                </a>

                <a
                  href="/users"
                  className="group flex items-start gap-3 p-4 bg-white rounded-xl border-2 border-transparent hover:border-green-500 transition-all duration-300 hover:shadow-md"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-600 transition-colors">
                    <i className="fa-solid fa-users text-green-600 group-hover:text-white transition-colors"></i>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 mb-1 group-hover:text-green-600 transition-colors">
                      Người dùng
                    </h4>
                    <p className="text-sm text-gray-600">
                      Kết nối với cộng đồng
                    </p>
                  </div>
                </a>

                {user ? (
                  <a
                    href="/profile"
                    className="group flex items-start gap-3 p-4 bg-white rounded-xl border-2 border-transparent hover:border-orange-500 transition-all duration-300 hover:shadow-md"
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-600 transition-colors">
                      <i className="fa-solid fa-user text-orange-600 group-hover:text-white transition-colors"></i>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 mb-1 group-hover:text-orange-600 transition-colors">
                        Trang cá nhân
                      </h4>
                      <p className="text-sm text-gray-600">
                        Quản lý thông tin của bạn
                      </p>
                    </div>
                  </a>
                ) : (
                  <a
                    href="/login"
                    className="group flex items-start gap-3 p-4 bg-white rounded-xl border-2 border-transparent hover:border-orange-500 transition-all duration-300 hover:shadow-md"
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-600 transition-colors">
                      <i className="fa-solid fa-right-to-bracket text-orange-600 group-hover:text-white transition-colors"></i>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 mb-1 group-hover:text-orange-600 transition-colors">
                        Đăng nhập
                      </h4>
                      <p className="text-sm text-gray-600">
                        Truy cập đầy đủ tính năng
                      </p>
                    </div>
                  </a>
                )}
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-gray-500 text-sm">
                Nếu bạn cho rằng đây là lỗi, vui lòng{" "}
                <a
                  href="mailto:duyhoangtran2006@gmail.com"
                  className="text-blue-600 hover:text-blue-800 font-medium underline"
                >
                  liên hệ với chúng tôi
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
