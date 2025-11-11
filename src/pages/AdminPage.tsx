/**
 * AdminPage - Trang quản trị chính
 * Kết hợp tất cả components và quản lý routing nội bộ
 */

import React, { useState } from 'react';
import AdminLayout from '../components/admin/AdminLayout';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminDashboard from '../components/admin/AdminDashboard';
import PostManagement from '../components/admin/PostManagement';
import UserManagement from '../components/admin/UserManagement';
import ReportManagement from '../components/admin/ReportManagement';
import { useAdminData } from '../hooks/useAdminData';

const AdminPage: React.FC = () => {
  // State để quản lý tab hiện tại
  const [activeTab, setActiveTab] = useState<'dashboard' | 'posts' | 'users' | 'reports'>('dashboard');

  // Sử dụng custom hook để quản lý data
  const {
    posts,
    users,
    stats,
    monthlyStats,
    isLoading,
    searchQuery,
    setSearchQuery,
    togglePostStatus,
    toggleUserStatus,
    approvePost,
    deleteUser,
    deletePost
  } = useAdminData();

  // Render nội dung dựa trên tab được chọn
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return isLoading ? <div className="text-center p-8">Đang tải dữ liệu...</div> : <AdminDashboard stats={stats} monthlyStats={monthlyStats} />;
      
      case 'posts':
        return (
          <PostManagement 
            posts={posts} 
            onToggleStatus={togglePostStatus}
            onApprovePost={approvePost}
            onDeletePost={deletePost}
          />
        );
      
      case 'reports':
        return <ReportManagement />;
      
      case 'users':
        return (
          <UserManagement 
            users={users}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onToggleUserStatus={toggleUserStatus}
            onDeleteUser={deleteUser}
          />
        );
      
      default:
        return <AdminDashboard stats={stats} />;
    }
  };

  return (
    <AdminLayout
      sidebar={
        <AdminSidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />
      }
    >
      {renderContent()}
    </AdminLayout>
  );
};

export default AdminPage;
