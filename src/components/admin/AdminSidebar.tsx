import React from 'react';
import { Link } from 'react-router-dom';

interface AdminSidebarProps {
  activeTab: 'dashboard' | 'posts' | 'users' | 'reports';
  onTabChange: (tab: 'dashboard' | 'posts' | 'users' | 'reports') => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, onTabChange }) => {
  const menuItems = [
    { id: 'dashboard' as const, label: 'Thống kê', icon: <i className="fa-solid fa-chart-simple"></i> },
    { id: 'posts' as const, label: 'Bài viết', icon: <i className="fa-solid fa-blog"></i> },
    { id: 'reports' as const, label: 'Báo cáo', icon: <i className="fa-solid fa-triangle-exclamation"></i> },
    { id: 'users' as const, label: 'Người dùng', icon: <i className="fa-solid fa-user"></i> }
  ];

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Logo/Header */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800">
          Admin Panel
        </h1>
        <p className="text-sm text-gray-500 mt-1">BlogHub Management</p>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 cursor-pointer ${
                  activeTab === item.id
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <Link
          to="/"
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition-all duration-200"
        >
          <span className="text-2xl"><i className="fa-solid fa-house"></i></span>
          <span className="font-medium">Về trang chủ</span>
        </Link>
        <div className="px-4 py-3 bg-gray-50 rounded-xl">
          <p className="text-xs text-gray-500">Đăng nhập với quyền</p>
          <p className="text-sm font-semibold text-gray-800">Administrator</p>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
