/**
 * AdminDashboard - Trang thống kê tổng quan
 * Hiển thị các metrics chính và biểu đồ xu hướng
 */

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AdminDashboardProps {
  stats: {
    totalPosts: number;
    totalUsers: number;
    hotPosts: number;
    pendingReviewPosts: number;
    pendingReviewComments: number;
    activeUsers: number;
    lockedUsers: number;
    totalReports: number;
    pendingReports: number;
    approvedReports: number;
    rejectedReports: number;
  };
  monthlyStats?: Array<{ month: string; posts: number; users: number }>;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ stats, monthlyStats = [] }) => {
  return (
    <div className="space-y-6">
      
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Thống kê tổng quan</h2>
        <p className="text-gray-600 mt-1">Dashboard quản trị BlogHub</p>
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-[16px] p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Tổng bài viết</p>
              <p className="text-3xl font-bold mt-2">{stats.totalPosts}</p>
            </div>
            <div className="text-5xl opacity-50">
              <i className="fa-solid fa-blog"></i>
            </div>
          </div>
          <div className="mt-4 text-sm text-blue-100">
            {stats.pendingReviewPosts} bài cần kiểm duyệt
          </div>
        </div>

        
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-[16px] p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Tổng người dùng</p>
              <p className="text-3xl font-bold mt-2">{stats.totalUsers}</p>
            </div>
            <div className="text-5xl opacity-50">
              <i className="fa-solid fa-user"></i>
            </div>
          </div>
          <div className="mt-4 text-sm text-green-100">
            {stats.activeUsers} tài khoản bình thường
          </div>
        </div>

        
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-[16px] p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Bài viết Hot</p>
              <p className="text-3xl font-bold mt-2">{stats.hotPosts}</p>
            </div>
            <div className="text-5xl opacity-50">
              <i className="fa-light fa-fire-flame-curved"></i>
            </div>
          </div>
          <div className="mt-4 text-sm text-orange-100">
            ≥ 50 lượt thích
          </div>
        </div>

        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-[16px] p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Bình luận</p>
              <p className="text-3xl font-bold mt-2">{stats.pendingReviewComments}</p>
            </div>
            <div className="text-5xl opacity-50">
              <i className="fa-regular fa-comments"></i>
            </div>
          </div>
          <div className="mt-4 text-sm text-purple-100">
            Cần kiểm duyệt
          </div>
        </div>

        
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-[16px] p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Báo cáo vi phạm</p>
              <p className="text-3xl font-bold mt-2">{stats.totalReports}</p>
            </div>
            <div className="text-5xl opacity-50">
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>
          </div>
          <div className="mt-4 text-sm text-red-100">
            {stats.pendingReports} chờ xử lý
          </div>
        </div>
      </div>

      
      <div className="bg-white rounded-[16px] p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Chi tiết hoạt động</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-xl">
            <p className="text-sm text-blue-600 font-medium">Tài khoản bình thường</p>
            <p className="text-2xl font-bold text-blue-700 mt-1">{stats.activeUsers}</p>
          </div>
          <div className="p-4 bg-red-50 rounded-xl">
            <p className="text-sm text-red-600 font-medium">Tài khoản bị khóa</p>
            <p className="text-2xl font-bold text-red-700 mt-1">{stats.lockedUsers}</p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-xl">
            <p className="text-sm text-yellow-600 font-medium">Tổng bài viết cần kiểm duyệt</p>
            <p className="text-2xl font-bold text-yellow-700 mt-1">
              {stats.pendingReviewPosts + stats.pendingReviewComments}
            </p>
          </div>
        </div>
      </div>

      
      <div className="bg-white rounded-[16px] p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Thống kê báo cáo vi phạm</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
            <p className="text-sm text-gray-600 font-medium">Tổng báo cáo bài viết</p>
            <p className="text-2xl font-bold text-gray-700 mt-1">{stats.totalReports}</p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-xl border-2 border-yellow-200">
            <p className="text-sm text-yellow-600 font-medium">Bài viết đang chờ xử lý</p>
            <p className="text-2xl font-bold text-yellow-700 mt-1">{stats.pendingReports}</p>
          </div>
          <div className="p-4 bg-red-50 rounded-xl border-2 border-red-200">
            <p className="text-sm text-red-600 font-medium">Bài viết đã duyệt</p>
            <p className="text-2xl font-bold text-red-700 mt-1">{stats.approvedReports}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-xl border-2 border-green-200">
            <p className="text-sm text-green-600 font-medium">Bài viết đã từ chối</p>
            <p className="text-2xl font-bold text-green-700 mt-1">{stats.rejectedReports}</p>
          </div>
        </div>
      </div>

      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="bg-white rounded-[16px] p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Xu hướng bài viết theo tháng</h3>
          {monthlyStats.length === 0 || monthlyStats.every(m => m.posts === 0) ? (
            <div className="h-[300px] flex items-center justify-center">
              <p className="text-gray-500 text-center">Chưa có bài viết nào được đăng</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="posts" fill="#3b82f6" name="Bài viết" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        
        <div className="bg-white rounded-[16px] p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Người dùng mới theo tháng</h3>
          {monthlyStats.length === 0 || monthlyStats.every(m => m.users === 0) ? (
            <div className="h-[300px] flex items-center justify-center">
              <p className="text-gray-500 text-center">Chưa có người dùng mới</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="users" fill="#10b981" name="Người dùng" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
