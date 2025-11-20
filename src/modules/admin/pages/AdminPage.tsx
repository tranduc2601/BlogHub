/**
 * AdminPage - Trang quản trị chính
 * Kết hợp tất cả components và quản lý routing nội bộ
 */

import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import AdminSidebar from '../components/AdminSidebar';
import AdminDashboard from '../components/AdminDashboard';
import PostManagement from '../components/PostManagement';
import UserManagement from '../components/UserManagement';
import ReportManagement from '../components/ReportManagement';
import CommentReportManagement from '../components/CommentReportManagement';
import { useAdminData } from '../hooks/useAdminData';
import axios from '@/core/config/axios';

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [pendingReportsCount, setPendingReportsCount] = useState(0);
  const [pendingPostsCount, setPendingPostsCount] = useState(0);
  const [pendingCommentReportsCount, setPendingCommentReportsCount] = useState(0);
  const getActiveTab = (pathname: string): 'dashboard' | 'posts' | 'users' | 'reports' | 'comment-reports' => {
    if (pathname.includes('post-management')) return 'posts';
    if (pathname.includes('comment-report-management')) return 'comment-reports';
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

        // Fetch pending comment reports count
        const commentReportsResponse = await axios.get('/admin/comment-reports');
        if (commentReportsResponse.data.success) {
          const pendingCount = commentReportsResponse.data.reports.filter((r: { status: string }) => r.status === 'pending').length;
          setPendingCommentReportsCount(pendingCount);
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
              'comment-reports': '/admin/comment-report-management',
              'users': '/admin/user-management'
            };
            navigate(routes[tab]);
          }}
          pendingPostsCount={pendingPostsCount}
          pendingReportsCount={pendingReportsCount}
          pendingCommentReportsCount={pendingCommentReportsCount}
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
        <Route path="comment-report-management" element={
          <CommentReportManagement />
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
