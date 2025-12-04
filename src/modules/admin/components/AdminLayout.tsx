import React, { useState } from 'react';

interface AdminLayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ sidebar, children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex font-[Inter] select-none">

      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 rounded-xl shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-110 active:scale-95"
        aria-label={isSidebarOpen ? 'Đóng menu' : 'Mở menu'}
      >
        <i className={`fa-solid ${isSidebarOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
      </button>


      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 z-40 animate-fadeIn"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        ></div>
      )}


      <aside className={`
        w-72 sm:w-80 md:w-64 bg-white shadow-2xl fixed h-full overflow-y-auto z-40 
        transition-all duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:w-64
      `}>
        {sidebar}
      </aside>


      <main className="flex-1 lg:ml-64 p-3 sm:p-4 md:p-6 lg:p-8 w-full min-h-screen">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
