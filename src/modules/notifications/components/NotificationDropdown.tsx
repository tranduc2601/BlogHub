import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from '@/core/config/axios';
import toast from 'react-hot-toast';
import { useDropdown } from '@/core/providers';

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

export default function NotificationDropdown() {
  const { activeDropdown, setActiveDropdown } = useDropdown();
  const isOpen = activeDropdown === 'notification';
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, setActiveDropdown]);

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get('/notifications/unread-count');
      if (response.data.success) {
        const newCount = response.data.count;
        if (newCount !== unreadCount) {

          setShouldAnimate(true);
          setTimeout(() => setShouldAnimate(false), 1000);
        }
        setUnreadCount(newCount);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/notifications?limit=2');
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
        setUnreadCount(prev => Math.max(0, prev - 1));
        setNotifications(prev =>
          prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
        );
      }
      setActiveDropdown(null);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await axios.put('/notifications/read-all');
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('Đã đánh dấu tất cả thông báo đã đọc!');
    } catch (error) {
      console.error('Error marking all as read:', error);
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

  return (
    <div className="relative" ref={dropdownRef}>

      <button
        onClick={() => setActiveDropdown(isOpen ? null : 'notification')}
        className="group relative cursor-pointer"
        title="Thông báo"
      >
        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center transition-all duration-300 group-hover:bg-cyan-500 group-hover:shadow-lg group-hover:scale-110 group-hover:-rotate-3">
          <div className="relative">
            <i className={`fa-solid fa-bell text-gray-700 group-hover:text-white text-lg transition-all duration-300 ${shouldAnimate ? 'animate-swing' : ''}`}></i>
            {unreadCount > 0 && (
              <span 
                className={`absolute -top-2 -right-2 bg-gradient-to-br from-red-500 to-pink-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg ${
                  shouldAnimate ? 'animate-bounce-scale' : 'animate-pulse-subtle'
                }`}
                style={{
                  boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)'
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-[-180px] mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-[80vh] overflow-hidden flex flex-col">
          
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">Thông báo</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Đánh dấu tất cả đã đọc
                </button>
              )}
            </div>
          </div>

          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="flex flex-col justify-center items-center py-8">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Đang tải...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <i className="fa-light fa-bell-slash text-4xl mb-3 text-gray-300"></i>
                <p className="font-medium">Chưa có thông báo nào</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <Link
                    key={notification.id}
                    to={notification.postId ? `/post/${notification.postId}` : '#'}
                    onClick={() => handleNotificationClick(notification)}
                    className={`block p-4 hover:bg-gray-50 transition-colors duration-200 ${
                      !notification.isRead ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex gap-3">

                      <div className="relative flex-shrink-0">
                        {notification.senderAvatar ? (
                          <img
                            src={notification.senderAvatar}
                            alt={notification.senderName}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className={`w-10 h-10 bg-gradient-to-br ${getNotificationColor(notification.type)} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                            {getAuthorInitial(notification.senderName)}
                          </div>
                        )}

                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br ${getNotificationColor(notification.type)} rounded-full flex items-center justify-center border-2 border-white`}>
                          <i className={`fa-solid ${getNotificationIcon(notification.type)} text-white text-[10px]`}></i>
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${!notification.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                          <span className="font-bold">{notification.senderName}</span> {notification.message}
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          {getTimeAgo(notification.createdAt)}
                        </p>
                      </div>

                      {!notification.isRead && (
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50 text-center">
              <Link
                to="/notifications"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                onClick={() => setActiveDropdown(null)}
              >
                Xem tất cả thông báo
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
