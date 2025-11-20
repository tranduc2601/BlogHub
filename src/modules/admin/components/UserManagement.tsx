/**
 * UserManagement - Quản lý người dùng
 * Hiển thị danh sách người dùng với chức năng tìm kiếm và khóa/mở khóa tài khoản
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Modal } from '@/shared/ui';
import type { AdminUser } from '@/shared/types';

interface UserManagementProps {
  users: AdminUser[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onToggleUserStatus: (userId: number) => void;
  onDeleteUser?: (userId: number) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ 
  users, 
  searchQuery, 
  onSearchChange, 
  onToggleUserStatus,
  onDeleteUser
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Lấy giá trị từ URL query params
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'locked'>(
    (searchParams.get('status') as 'all' | 'active' | 'locked') || 'all'
  );
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get('page') || '1', 10)
  );
  const USERS_PER_PAGE = 5;

  const filteredUsers = users
    .filter(user => user.role !== 'admin')
    .filter(user => {
      if (statusFilter === 'all') return true;
      return user.status === statusFilter;
    })
    .sort((a, b) => a.id - b.id);
  
  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const startIndex = (currentPage - 1) * USERS_PER_PAGE;
  const endIndex = startIndex + USERS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // Cập nhật URL khi state thay đổi
  useEffect(() => {
    const params = new URLSearchParams();
    if (statusFilter !== 'all') {
      params.set('status', statusFilter);
    }
    if (currentPage > 1) {
      params.set('page', currentPage.toString());
    }
    setSearchParams(params, { replace: true });
  }, [statusFilter, currentPage, setSearchParams]);

  // Tự động chuyển về trang trước nếu trang hiện tại không còn user nào
  useEffect(() => {
    if (paginatedUsers.length === 0 && currentPage > 1 && filteredUsers.length > 0) {
      setCurrentPage(currentPage - 1);
    }
  }, [paginatedUsers.length, currentPage, filteredUsers.length]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };
  const [modal, setModal] = useState<{
    isOpen: boolean;
    type: 'info' | 'warning' | 'error' | 'success' | 'confirm';
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });

  const handleToggle = (userId: number, userName: string, currentStatus: string) => {
    const action = currentStatus === 'active' ? 'khóa' : 'mở khóa';
    setModal({
      isOpen: true,
      type: 'confirm',
      title: 'Xác nhận thay đổi',
      message: `Bạn có chắc muốn ${action} tài khoản của "${userName}"?`,
      onConfirm: () => {
        onToggleUserStatus(userId);
        setModal({
          isOpen: true,
          type: 'success',
          title: 'Thành công',
          message: `Đã ${action} tài khoản thành công!`
        });
      }
    });
  };

  const handleDelete = (userId: number, userName: string) => {
    setModal({
      isOpen: true,
      type: 'warning',
      title: 'Xác nhận xóa',
      message: `Bạn có chắc muốn xóa tài khoản của "${userName}"? Hành động này không thể hoàn tác!`,
      onConfirm: () => {
        onDeleteUser?.(userId);
      }
    });
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6">
      
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Quản lý người dùng</h2>
        <p className="text-gray-600 mt-1">Quản lý tài khoản và trạng thái người dùng</p>
      </div>

      <div className="bg-white rounded-[16px] p-6 shadow-lg space-y-4">
        <div>
          <label htmlFor="search" className="block text-sm font-semibold text-gray-700 mb-2">
            <i className="fa-solid fa-magnifying-glass mr-2"></i>Tìm kiếm người dùng
          </label>
          <input
            id="search"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Nhập tên hoặc email để tìm kiếm..."
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
          />
          {searchQuery && (
            <p className="mt-2 text-sm text-gray-600">
              Tìm thấy {users.length} kết quả
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 mt-5">
            <i className="fa-solid fa-filter mr-2"></i>Lọc theo trạng thái
          </label>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                setStatusFilter('all');
                setCurrentPage(1);
              }}
              className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all transform hover:scale-105 active:scale-95 cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <i className="fa-solid fa-users mr-2"></i>
              Tất cả ({users.filter(u => u.role !== 'admin').length})
            </button>
            <button
              onClick={() => {
                setStatusFilter('active');
                setCurrentPage(1);
              }}
              className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all transform hover:scale-105 active:scale-95 cursor-pointer ${
                statusFilter === 'active'
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <i className="fa-solid fa-circle-check mr-2"></i>
              Đang hoạt động ({users.filter(u => u.status === 'active' && u.role !== 'admin').length})
            </button>
            <button
              onClick={() => {
                setStatusFilter('locked');
                setCurrentPage(1);
              }}
              className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all transform hover:scale-105 active:scale-95 cursor-pointer ${
                statusFilter === 'locked'
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <i className="fa-solid fa-lock mr-2"></i>
              Đã khóa ({users.filter(u => u.status === 'locked' && u.role !== 'admin').length})
            </button>
          </div>
        </div>
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-[16px] p-6 text-white shadow-lg">
          <p className="text-blue-100 text-sm font-medium">Tổng người dùng</p>
          <p className="text-3xl font-bold mt-2">{users.length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-[16px] p-6 text-white shadow-lg">
          <p className="text-green-100 text-sm font-medium">Đang hoạt động</p>
          <p className="text-3xl font-bold mt-2">
            {users.filter(u => u.status === 'active').length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-[16px] p-6 text-white shadow-lg">
          <p className="text-red-100 text-sm font-medium">Đã khóa</p>
          <p className="text-3xl font-bold mt-2">
            {users.filter(u => u.status === 'locked').length}
          </p>
        </div>
      </div>

      
      <div className="bg-white rounded-[16px] shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">STT</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Họ và tên</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Vai trò</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Hoạt động</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Tham gia</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    Không tìm thấy người dùng nào!
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user, index) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-sm font-medium text-gray-900">#{startIndex + index + 1}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex flex-col items-center justify-center">
                        {user.avatarUrl ? (
                          <img 
                            src={user.avatarUrl}
                            alt={user.name}
                            className="h-10 w-10 rounded-full object-cover mx-auto"
                            draggable={false}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = target.nextElementSibling as HTMLDivElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                        ) : (
                          <div 
                            className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold mx-auto"
                          >
                            {(user.name || user.fullName)?.split(' ').slice(-1)[0].charAt(0).toUpperCase()}
                          </div>
                        )}
                        <p className="text-sm font-semibold text-gray-900 mt-2">{user.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-sm text-gray-600"><i className="fa-light fa-envelope mr-2"></i>{user.email}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800`}
                      >
                        {'👤 User'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="inline-flex items-center justify-center gap-2 text-xs font-semibold">
                        <span
                          className={
                            user.status === 'active'
                              ? 'inline-block w-3 h-3 rounded-full bg-green-500'
                              : 'inline-block w-3 h-3 rounded-full bg-red-500'
                          }
                        ></span>
                        <span className={user.status === 'active' ? 'text-green-700' : 'text-red-700'}>
                          {user.status === 'active' ? 'Bình thường' : 'Đã khóa'}
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                      <div className="flex items-center gap-2 justify-center">
                        <i className="fa-solid fa-file-pen text-blue-400"></i>
                        <span>{user.postsCount} bài</span>
                      </div>
                      <div className="flex items-center gap-2 justify-center mt-1">
                        <i className="fa-solid fa-comments text-purple-400"></i>
                        <span>{user.commentsCount} bình luận</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                      <i className="fa-regular fa-calendar mr-2"></i>{formatDate(user.joinedAt || user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleToggle(user.id, user.name || user.fullName, user.status)}
                          className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all cursor-pointer transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl ${
                            user.status === 'active'
                              ? 'bg-red-600 hover:bg-gradient-to-br hover:from-red-600 hover:to-red-700 text-white'
                              : 'bg-green-600 hover:bg-gradient-to-br hover:from-green-600 hover:to-green-700 text-white'
                          }`}
                          title={user.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                        >
                          {user.status === 'active' 
                            ? <><i className="fa-solid fa-lock mr-1"></i> Khóa</>
                            : <><i className="fa-solid fa-lock-open mr-2"></i> Mở khóa</>}
                        </button>
                        <button
                          onClick={() => handleDelete(user.id, user.name || user.fullName)}
                          className="px-4 py-2 rounded-xl font-semibold text-sm bg-gray-600 hover:bg-gradient-to-br hover:from-gray-600 hover:to-gray-700 text-white shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:scale-105 active:scale-95"
                          title="Xóa tài khoản"
                        >
                          <i className="fa-regular fa-trash mr-2"></i>
                          Xoá
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Hiển thị <span className="font-semibold">{startIndex + 1}</span> đến{' '}
              <span className="font-semibold">{Math.min(endIndex, filteredUsers.length)}</span> trong tổng số{' '}
              <span className="font-semibold">{filteredUsers.length}</span> người dùng
            </div>
            <div className="flex gap-2">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                  currentPage === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95'
                }`}
              >
                <i className="fa-solid fa-chevron-left mr-2"></i>
                Trang trước
              </button>
              <div className="flex items-center gap-2 px-4">
                <span className="text-sm font-semibold text-gray-700">
                  Trang {currentPage} / {totalPages}
                </span>
              </div>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                  currentPage === totalPages
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95'
                }`}
              >
                Trang sau
                <i className="fa-solid fa-chevron-right ml-2"></i>
              </button>
            </div>
          </div>
        )}
      </div>

      
      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        onConfirm={modal.onConfirm}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
    </div>
  );
};

export default UserManagement;
