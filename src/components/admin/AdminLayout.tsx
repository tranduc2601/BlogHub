/**
 * AdminLayout - Layout component cho trang quản trị
 * Bao gồm sidebar và khu vực nội dung chính
 */

import React, { useState } from 'react';

interface AdminLayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ sidebar, children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex font-[Inter] select-none">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-lg shadow-lg"
      >
        <i className={`fa-solid ${isSidebarOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
      </button>

      {/* Sidebar Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`
        w-64 bg-white shadow-lg fixed h-full overflow-y-auto z-40 transition-transform duration-300
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {sidebar}
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-4 md:p-6 lg:p-8 w-full">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
