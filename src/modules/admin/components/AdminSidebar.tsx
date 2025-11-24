import React from "react";
import { Link } from "react-router-dom";

interface AdminSidebarProps {
  activeTab: "dashboard" | "posts" | "users" | "reports" | "comment-reports";
  onTabChange: (
    tab: "dashboard" | "posts" | "users" | "reports" | "comment-reports"
  ) => void;
  pendingPostsCount?: number;
  pendingReportsCount?: number;
  pendingCommentReportsCount?: number;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onTabChange,
  pendingPostsCount = 0,
  pendingReportsCount = 0,
  pendingCommentReportsCount = 0,
}) => {
  const menuItems = [
    {
      id: "dashboard" as const,
      label: "Thống kê",
      icon: <i className="fa-solid fa-chart-simple"></i>,
    },
    {
      id: "posts" as const,
      label: "Bài viết",
      icon: <i className="fa-solid fa-blog"></i>,
      badge: pendingPostsCount,
    },
    {
      id: "reports" as const,
      label: "Báo cáo bài viết",
      icon: <i className="fa-solid fa-triangle-exclamation"></i>,
      badge: pendingReportsCount,
    },
    {
      id: "comment-reports" as const,
      label: "Báo cáo bình luận",
      icon: <i className="fa-solid fa-flag"></i>,
      badge: pendingCommentReportsCount,
    },
    {
      id: "users" as const,
      label: "Người dùng",
      icon: <i className="fa-solid fa-user"></i>,
    },
  ];

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header - responsive text sizing */}
      <div className="p-4 sm:p-5 md:p-6 border-b border-gray-200">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
          <i className="fa-solid fa-shield-halved"></i>
          <span className="hidden sm:inline">Admin Panel</span>
          <span className="sm:hidden">Admin</span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1 ml-0 sm:ml-5.5">
          BlogHub Management
        </p>
      </div>

      {/* Navigation - improved mobile spacing */}
      <nav className="flex-1 p-3 sm:p-4 overflow-y-auto">
        <ul className="space-y-1.5 sm:space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onTabChange(item.id);
                }}
                className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-left transition-all duration-200 cursor-pointer relative z-10 text-sm sm:text-base ${
                  activeTab === item.id
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                    : "text-gray-700 hover:bg-gray-100 active:bg-gray-200"
                }`}
                type="button"
              >
                <span className="text-lg sm:text-xl">{item.icon}</span>
                <span className="font-medium flex-1 truncate">
                  {item.label}
                </span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="flex items-center justify-center min-w-[20px] sm:min-w-[24px] h-5 sm:h-6 px-1.5 sm:px-2 bg-red-500 text-white text-xs font-bold rounded-full animate-wiggle flex-shrink-0">
                    {item.badge}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer - responsive layout */}
      <div className="p-3 sm:p-4 border-t border-gray-200 space-y-2">
        <Link
          to="/"
          className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-gray-700 hover:bg-blue-600 hover:text-white hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 group text-sm sm:text-base"
          draggable={false}
        >
          <span className="text-xl sm:text-2xl group-hover:scale-110 transition-transform">
            <i className="fa-solid fa-house"></i>
          </span>
          <span className="font-medium">Về trang chủ</span>
        </Link>
        <div className="px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 rounded-xl">
          <p className="text-xs text-gray-500">Bạn đang đăng nhập với quyền</p>
          <p className="text-xs sm:text-sm font-semibold text-red-500 ml-0 sm:ml-9 mt-1">
            Administrator
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
