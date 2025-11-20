import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/core/auth';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  redirectTo?: string;
}

export default function ProtectedRoute({ children, requireAdmin = false, redirectTo }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Loading state - Đồng bộ với UI của AdminPage
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Redirect to login with intended destination
  if (!isAuthenticated) {
    return <Navigate to={redirectTo || "/login"} state={{ from: location.pathname }} replace />;
  }

  // Check admin permission
  if (requireAdmin && user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 select-none">
        <div className="max-w-md mx-4 p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 text-center animate-fadeInUp">
          {/* Icon with animation */}
          <div className="mb-6 relative">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center animate-pulse-subtle">
              <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>

          {/* Title and message */}
          <h1 className="text-2xl font-bold text-gray-800 mb-3">
            <i className="fa-solid fa-shield-halved text-red-600 mr-2"></i>
            Truy cập bị từ chối
          </h1>
          <p className="text-gray-600 mb-2 leading-relaxed">
            Bạn không có quyền truy cập trang quản trị.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Chỉ tài khoản <span className="font-semibold text-yellow-600">Admin</span> mới được phép truy cập.
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a 
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl cursor-pointer"
            >
              <i className="fa-solid fa-house"></i>
              Về trang chủ
            </a>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-xl font-semibold border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg cursor-pointer"
            >
              <i className="fa-solid fa-arrow-left"></i>
              Quay lại
            </button>
          </div>

          {/* Additional info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              <i className="fa-solid fa-circle-info mr-1"></i>
              Nếu bạn cho rằng đây là lỗi, vui lòng liên hệ quản trị viên
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
