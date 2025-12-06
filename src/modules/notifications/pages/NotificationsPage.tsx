import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from '@/core/config/axios';
import toast from 'react-hot-toast';
import { Modal } from '@/shared/ui';

interface Notification {
  id: number;
  userId: number;
  type: string;
  postId: number | null;
  senderId: number | null;
  message: string;
  isRead: boolean;
  createdAt: string;
  senderName: string | null;
  senderAvatar: string | null;
  postTitle: string | null;
}

const NOTIFICATIONS_PER_PAGE = 10;

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [displayedNotifications, setDisplayedNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
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

  useEffect(() => {
    const filteredNotifs = filter === 'all' 
      ? notifications 
      : notifications.filter(n => !n.isRead);
    
    const initialDisplay = filteredNotifs.slice(0, NOTIFICATIONS_PER_PAGE);
    setDisplayedNotifications(initialDisplay);
    setPage(1);
    setHasMore(filteredNotifs.length > NOTIFICATIONS_PER_PAGE);
  }, [filter, notifications]);

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

  const loadMoreNotifications = useCallback(() => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    
    const filteredNotifs = filter === 'all' 
      ? notifications 
      : notifications.filter(n => !n.isRead);

    const nextPage = page + 1;
    const startIndex = 0;
    const endIndex = nextPage * NOTIFICATIONS_PER_PAGE;
    const newDisplayed = filteredNotifs.slice(startIndex, endIndex);

    setDisplayedNotifications(newDisplayed);
    setPage(nextPage);
    setHasMore(endIndex < filteredNotifs.length);
    setLoadingMore(false);
  }, [loadingMore, hasMore, filter, notifications, page]);

  useEffect(() => {
    const handleScroll = () => {
      if (loadingMore || !hasMore) return;

      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      if (scrollTop + windowHeight >= documentHeight - 300) {
        loadMoreNotifications();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadingMore, hasMore, loadMoreNotifications]);

  const handleNotificationClick = async (notification: Notification) => {
    try {
      if (!notification.isRead) {
        await axios.put(`/notifications/${notification.id}/read`);
        setNotifications(prev =>
          prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
        );
        window.dispatchEvent(new CustomEvent('notification-read'));
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

      window.dispatchEvent(new CustomEvent('notification-read'));
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
      
      window.dispatchEvent(new CustomEvent('notification-deleted'));

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

      const deletedNotif = notifications.find(n => n.id === deleteModal.notificationId);
      const wasUnread = deletedNotif && !deletedNotif.isRead;
      
      await axios.delete(`/notifications/${deleteModal.notificationId}`);
      setNotifications(prev => prev.filter(n => n.id !== deleteModal.notificationId));
      

      if (wasUnread) {
        window.dispatchEvent(new CustomEvent('notification-deleted'));
      }
      
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
    <div className="max-w-4xl mx-auto p-4 md:p-6 select-none">

      <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 mb-4 md:mb-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
          <div className="text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              <i className="fa-solid fa-bell mr-2 md:mr-3 text-blue-600"></i>
              Thông báo
            </h1>
            <p className="text-sm md:text-base text-gray-600 mt-2 flex items-center justify-center md:justify-start gap-2">
              {unreadCount > 0 
                ? `Bạn có ${unreadCount} thông báo chưa đọc!` 
                : (
                  <>
                    <i className="fa-solid fa-circle-check text-green-500"></i>
                    <span>Bạn đã đọc tất cả thông báo!</span>
                  </>
                )}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                disabled={markingAllAsRead}
                className={`px-3 md:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-xl shadow-md hover:-translate-y-0.5 text-sm md:text-base w-full sm:w-auto ${
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
                    <span className="hidden sm:inline">Đánh dấu tất cả đã đọc</span>
                    <span className="sm:hidden">Đánh dấu đã đọc</span>
                  </>
                )}
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                className="px-3 md:px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-xl shadow-md hover:-translate-y-0.5 cursor-pointer text-sm md:text-base w-full sm:w-auto"
              >
                <i className="fa-solid fa-trash mr-2"></i>
                Xóa tất cả
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-2 justify-center md:justify-start">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 md:px-4 py-2 rounded-xl font-medium transition-all duration-300 cursor-pointer text-sm md:text-base flex-1 sm:flex-initial ${
              filter === 'all'
                ? 'bg-blue-600 text-white shadow-lg hover:shadow-xl hover:scale-105'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105 hover:shadow-md'
            }`}
          >
            Tất cả ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 md:px-4 py-2 rounded-xl font-medium transition-all duration-300 cursor-pointer text-sm md:text-base flex-1 sm:flex-initial ${
              filter === 'unread'
                ? 'bg-blue-600 text-white shadow-lg hover:shadow-xl hover:scale-105'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105 hover:shadow-md'
            }`}
          >
            Chưa đọc ({unreadCount})
          </button>
        </div>
      </div>

      {displayedNotifications.length === 0 ? (
        <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-8 md:p-12 text-center">
          <i className="fa-solid fa-bell-slash text-5xl md:text-6xl text-gray-300 mb-4"></i>
          <p className="text-gray-500 text-base md:text-lg font-medium">
            {filter === 'unread' ? 'Không có thông báo chưa đọc' : 'Chưa có thông báo nào'}
          </p>
        </div>
      ) : (
        <>
        <div className="space-y-2 md:space-y-3">
          {displayedNotifications.map((notification) => (
            <Link
              key={notification.id}
              to={notification.postId ? `/post/${notification.postId}` : '#'}
              onClick={() => handleNotificationClick(notification)}
              className={`block bg-white rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 ${
                !notification.isRead ? 'ring-2 ring-blue-400' : ''
              }`}
            >
              <div className="p-3 md:p-5 flex gap-3 md:gap-4 items-start">

                <div className="relative flex-shrink-0">
                  {notification.senderAvatar ? (
                    <img
                      src={notification.senderAvatar}
                      alt={notification.senderName || 'Người dùng ẩn danh'}
                      className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover"
                    />
                  ) : (
                    <div className={`w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br ${getNotificationColor(notification.type)} rounded-full flex items-center justify-center text-white font-bold text-base md:text-lg`}>
                      {notification.senderName ? getAuthorInitial(notification.senderName) : <i className="fa-solid fa-user-secret"></i>}
                    </div>
                  )}

                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-gradient-to-br ${getNotificationColor(notification.type)} rounded-full flex items-center justify-center border-2 border-white`}>
                    <i className={`fa-solid ${getNotificationIcon(notification.type)} text-white text-[10px] md:text-xs mt-0.5`}></i>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`text-sm md:text-base ${!notification.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                    <span className="font-bold">{notification.senderName || 'Người dùng ẩn danh'}</span> {notification.message}
                  </p>
                  {notification.postTitle && (
                    <p className="text-xs md:text-sm text-gray-500 mt-1 truncate">
                      <i className="fa-solid fa-file-lines mr-1"></i>
                      {notification.postTitle}
                    </p>
                  )}
                  <p className="text-[11px] md:text-xs text-blue-600 mt-2">
                    <i className="fa-solid fa-clock mr-1"></i>
                    {getTimeAgo(notification.createdAt)}
                  </p>
                </div>

                <div className="flex items-center gap-1 md:gap-2">
                  {!notification.isRead && (
                    <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-blue-600 rounded-full animate-pulse" title="Chưa đọc"></div>
                  )}
                  <button
                    onClick={(e) => handleDeleteNotification(notification.id, e)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-white bg-red-500 transition-all duration-200 cursor-pointer hover:bg-red-600 hover:scale-105 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-300"
                    title="Xóa thông báo"
                  >
                    <i className="fa-solid fa-trash text-sm"></i>
                    <span>Xóa</span>
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
        </>
      )}
      
      {loadingMore && (
        <div className="flex justify-center py-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Đang tải thêm...</p>
          </div>
        </div>
      )}
      
      {!hasMore && displayedNotifications.length > 0 && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2 text-gray-500">
            <div className="h-px w-16 bg-gray-300"></div>
            <i className="fa-solid fa-check-circle text-green-500"></i>
            <span className="text-sm font-medium">Đã hiển thị tất cả thông báo</span>
            <div className="h-px w-16 bg-gray-300"></div>
          </div>
        </div>
      )}


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
