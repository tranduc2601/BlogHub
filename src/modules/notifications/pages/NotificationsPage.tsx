import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '@/core/config/axios';
import toast from 'react-hot-toast';
import { Modal } from '@/shared/ui';

interface Notification {
  id: number;
  userId: number;
  type: string;
  postId: number | null;
  senderId: number;
  message: string;
  isRead: boolean;
  createdAt: string;
  senderName: string;
  senderAvatar: string | null;
  postTitle: string | null;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [markingAllAsRead, setMarkingAllAsRead] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: 'single' | 'all';
    notificationId?: number;
  }>({ isOpen: false, type: 'single' });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/notifications?limit=100');
      if (response.data.success) {
        setNotifications(response.data.notifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Không thể tải thông báo!');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    try {
      if (!notification.isRead) {
        await axios.put(`/notifications/${notification.id}/read`);
        setNotifications(prev =>
          prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (markingAllAsRead) return;
    
    try {
      setMarkingAllAsRead(true);
      await axios.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('Đã đánh dấu tất cả đã đọc!');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Có lỗi xảy ra!');
    } finally {
      setMarkingAllAsRead(false);
    }
  };

  const handleClearAll = () => {
    setDeleteModal({ isOpen: true, type: 'all' });
  };

  const confirmClearAll = async () => {
    try {
      await Promise.all(
        notifications.map(notification =>
          axios.delete(`/notifications/${notification.id}`)
        )
      );
      setNotifications([]);
      toast.success('Đã xóa tất cả thông báo!');
    } catch (error) {
      console.error('Error clearing notifications:', error);
      toast.error('Có lỗi xảy ra khi xóa thông báo!');
    }
  };

  const handleDeleteNotification = (notificationId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteModal({ isOpen: true, type: 'single', notificationId });
  };

  const confirmDeleteNotification = async () => {
    if (!deleteModal.notificationId) return;

    try {
      await axios.delete(`/notifications/${deleteModal.notificationId}`);
      setNotifications(prev => prev.filter(n => n.id !== deleteModal.notificationId));
      toast.success('Đã xóa thông báo!');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Có lỗi xảy ra!');
    }
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return `${diffDays} ngày trước`;
  };

  const getAuthorInitial = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'comment':
        return 'fa-comment';
      case 'reaction':
        return 'fa-heart';
      case 'follow':
        return 'fa-user-plus';
      case 'post_approved':
        return 'fa-circle-check';
      case 'post_reported':
        return 'fa-triangle-exclamation';
      case 'like':
        return 'fa-thumbs-up';
      case 'share':
        return 'fa-share';
      default:
        return 'fa-bell';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'comment':
        return 'from-blue-400 to-blue-500';
      case 'reaction':
        return 'from-pink-400 to-red-500';
      case 'follow':
        return 'from-green-400 to-green-500';
      case 'post_approved':
        return 'from-emerald-400 to-teal-500';
      case 'post_reported':
        return 'from-orange-400 to-red-500';
      case 'like':
        return 'from-purple-400 to-purple-500';
      case 'share':
        return 'from-cyan-400 to-blue-500';
      default:
        return 'from-blue-400 to-purple-500';
    }
  };

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => !n.isRead);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 select-none">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              <i className="fa-solid fa-bell mr-3 text-blue-600"></i>
              Thông báo
            </h1>
            <p className="text-gray-600 mt-2">
              {unreadCount > 0 
                ? `Bạn có ${unreadCount} thông báo chưa đọc!` 
                : 'Bạn đã đọc tất cả thông báo!'}
            </p>
          </div>
          
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                disabled={markingAllAsRead}
                className={`px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-xl shadow-md hover:-translate-y-0.5 ${
                  markingAllAsRead ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                {markingAllAsRead ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-check-double mr-2"></i>
                    Đánh dấu tất cả đã đọc
                  </>
                )}
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-xl shadow-md hover:-translate-y-0.5 cursor-pointer"
              >
                <i className="fa-solid fa-trash mr-2"></i>
                Xóa tất cả
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 cursor-pointer ${
              filter === 'all'
                ? 'bg-blue-600 text-white shadow-lg hover:shadow-xl hover:scale-105'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105 hover:shadow-md'
            }`}
          >
            Tất cả ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 cursor-pointer ${
              filter === 'unread'
                ? 'bg-blue-600 text-white shadow-lg hover:shadow-xl hover:scale-105'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105 hover:shadow-md'
            }`}
          >
            Chưa đọc ({unreadCount})
          </button>
        </div>
      </div>

      {filteredNotifications.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <i className="fa-light fa-bell-slash text-6xl text-gray-300 mb-4"></i>
          <p className="text-gray-500 text-lg font-medium">
            {filter === 'unread' ? 'Không có thông báo chưa đọc' : 'Chưa có thông báo nào'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <Link
              key={notification.id}
              to={notification.postId ? `/post/${notification.postId}` : '#'}
              onClick={() => handleNotificationClick(notification)}
              className={`block bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 ${
                !notification.isRead ? 'ring-2 ring-blue-400' : ''
              }`}
            >
              <div className="p-5 flex gap-4 items-start">

                <div className="relative flex-shrink-0">
                  {notification.senderAvatar ? (
                    <img
                      src={notification.senderAvatar}
                      alt={notification.senderName}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                  ) : (
                    <div className={`w-14 h-14 bg-gradient-to-br ${getNotificationColor(notification.type)} rounded-full flex items-center justify-center text-white font-bold text-lg`}>
                      {getAuthorInitial(notification.senderName)}
                    </div>
                  )}

                  <div className={`absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br ${getNotificationColor(notification.type)} rounded-full flex items-center justify-center border-2 border-white`}>
                    <i className={`fa-solid ${getNotificationIcon(notification.type)} text-white text-xs`}></i>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`text-base ${!notification.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                    <span className="font-bold">{notification.senderName}</span> {notification.message}
                  </p>
                  {notification.postTitle && (
                    <p className="text-sm text-gray-500 mt-1 truncate">
                      <i className="fa-solid fa-file-lines mr-1"></i>
                      {notification.postTitle}
                    </p>
                  )}
                  <p className="text-xs text-blue-600 mt-2">
                    <i className="fa-solid fa-clock mr-1"></i>
                    {getTimeAgo(notification.createdAt)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {!notification.isRead && (
                    <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse" title="Chưa đọc"></div>
                  )}
                  <button
                    onClick={(e) => handleDeleteNotification(notification.id, e)}
                    className="p-2 rounded-lg text-red-500 transition-all duration-200 cursor-pointer bg-transparent hover:bg-gradient-to-br hover:from-red-400 hover:to-pink-500 hover:text-white hover:scale-105 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-300 group"
                    title="Xóa thông báo"
                  >
                    <i className="fa-solid fa-trash text-sm group-hover:animate-shake"></i>
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, type: 'single' })}
        onConfirm={deleteModal.type === 'all' ? confirmClearAll : confirmDeleteNotification}
        title={deleteModal.type === 'all' ? 'Xóa tất cả thông báo' : 'Xóa thông báo'}
        message={
          deleteModal.type === 'all'
            ? `Bạn có chắc chắn muốn xóa tất cả ${notifications.length} thông báo? Hành động này không thể hoàn tác!`
            : 'Bạn có chắc chắn muốn xóa thông báo này? Hành động này không thể hoàn tác!'
        }
        type="warning"
        confirmText="Xóa"
        cancelText="Hủy"
      />
    </div>
  );
}
