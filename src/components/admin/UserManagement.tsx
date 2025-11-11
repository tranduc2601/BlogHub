/**
 * UserManagement - Quản lý người dùng
 * Hiển thị danh sách người dùng với chức năng tìm kiếm và khóa/mở khóa tài khoản
 */

import React, { useState } from 'react';
import Modal from '../Modal';
import type { AdminUser } from '../../data/mockAdminData';

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
  // Định dạng ngày dd/mm/yyyy
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Quản lý người dùng</h2>
        <p className="text-gray-600 mt-1">Quản lý tài khoản và trạng thái người dùng</p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-[16px] p-6 shadow-lg">
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

      {/* Summary Stats */}
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
          <p className="text-red-100 text-sm font-medium">Đã bị khóa</p>
          <p className="text-3xl font-bold mt-2">
            {users.filter(u => u.status === 'locked').length}
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-[16px] shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Tên</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Vai trò</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Hoạt động</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Tham gia</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.filter(user => user.role !== 'admin').length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    Không tìm thấy người dùng nào
                  </td>
                </tr>
              ) : (
                users.filter(user => user.role !== 'admin').map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-sm font-medium text-gray-900">#{user.id}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold mx-auto">
                          {user.name.charAt(0)}
                        </div>
                        <p className="text-sm font-semibold text-gray-900 mt-2">{user.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-sm text-gray-600">{user.email}</span>
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
                          {user.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
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
                      {formatDate(user.joinedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleToggle(user.id, user.name, user.status)}
                          className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                            user.status === 'active'
                              ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl'
                              : 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl'
                          }`}
                          title={user.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                        >
                          {user.status === 'active' 
                            ? <><i className="fa-solid fa-lock mr-2"></i> Khóa</>
                            : <><i className="fa-solid fa-lock-open mr-2"></i> Mở khóa</>}
                        </button>
                        <button
                          onClick={() => handleDelete(user.id, user.name)}
                          className="px-4 py-2 rounded-xl font-semibold text-sm bg-gray-600 hover:bg-gray-700 text-white shadow-lg hover:shadow-xl transition-all"
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
      </div>

      {/* Modal Component */}
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
