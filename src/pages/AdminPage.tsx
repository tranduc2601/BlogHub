/**
 * AdminPage - Trang quản trị chính
 * Kết hợp tất cả components và quản lý routing nội bộ
 */

import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import AdminLayout from '../components/admin/AdminLayout';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminDashboard from '../components/admin/AdminDashboard';
import PostManagement from '../components/admin/PostManagement';
import UserManagement from '../components/admin/UserManagement';
import ReportManagement from '../components/admin/ReportManagement';
import { useAdminData } from '../hooks/useAdminData';
import axios from '../config/axios';

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [pendingReportsCount, setPendingReportsCount] = useState(0);
  const [pendingPostsCount, setPendingPostsCount] = useState(0);
  const getActiveTab = (pathname: string): 'dashboard' | 'posts' | 'users' | 'reports' => {
    if (pathname.includes('post-management')) return 'posts';
    if (pathname.includes('report-management')) return 'reports';
    if (pathname.includes('user-management')) return 'users';
    return 'dashboard';
  };
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
    rejectPost,
    deleteUser,
    deletePost
  } = useAdminData();
  useEffect(() => {
    const fetchPendingCounts = async () => {
      try {
        // Fetch pending reports count
        const reportsResponse = await axios.get('/admin/reports');
        if (reportsResponse.data.success) {
          const pendingCount = reportsResponse.data.reports.filter((r: { status: string }) => r.status === 'pending').length;
          setPendingReportsCount(pendingCount);
        }

        // Fetch pending posts count
        const postsResponse = await axios.get('/admin/posts');
        if (postsResponse.data.success) {
          const pendingPostsCount = postsResponse.data.posts.filter((p: { status: string }) => p.status === 'pending').length;
          setPendingPostsCount(pendingPostsCount);
        }
      } catch (error) {
        console.error('Failed to fetch pending counts:', error);
      }
    };
    fetchPendingCounts();
  }, []);

  return (
    <AdminLayout
      sidebar={
        <AdminSidebar 
          activeTab={getActiveTab(location.pathname)} 
          onTabChange={(tab) => {
            const routes: Record<string, string> = {
              'dashboard': '/admin/dashboard',
              'posts': '/admin/post-management',
              'reports': '/admin/report-management',
              'users': '/admin/user-management'
            };
            navigate(routes[tab]);
          }}
          pendingPostsCount={pendingPostsCount}
          pendingReportsCount={pendingReportsCount}
        />
      }
    >
      <Routes>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={
          isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Đang tải...</p>
              </div>
            </div>
          ) : (
            <AdminDashboard stats={stats} monthlyStats={monthlyStats} />
          )
        } />
        <Route path="post-management/*" element={
          <PostManagement 
            posts={posts} 
            onToggleStatus={togglePostStatus}
            onApprovePost={approvePost}
            onRejectPost={rejectPost}
            onDeletePost={deletePost}
            onPendingCountChange={setPendingPostsCount}
          />
        } />
        <Route path="report-management" element={
          <ReportManagement onPendingCountChange={setPendingReportsCount} />
        } />
        <Route path="user-management" element={
          isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Đang tải...</p>
              </div>
            </div>
          ) : (
            <UserManagement 
              users={users}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onToggleUserStatus={toggleUserStatus}
              onDeleteUser={deleteUser}
            />
          )
        } />
      </Routes>
    </AdminLayout>
  );
};

export default AdminPage;
