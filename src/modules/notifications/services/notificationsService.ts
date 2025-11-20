import { axiosInstance } from '@/core/config';

export const notificationsService = {
  async getNotifications() {
    const response = await axiosInstance.get('/notifications');
    return response.data;
  },

  async markAsRead(notificationId: string | number) {
    const response = await axiosInstance.put(`/notifications/${notificationId}/read`);
    return response.data;
  },

  async markAllAsRead() {
    const response = await axiosInstance.put('/notifications/read-all');
    return response.data;
  },

  async deleteNotification(notificationId: string | number) {
    const response = await axiosInstance.delete(`/notifications/${notificationId}`);
    return response.data;
  },

  async getUnreadCount() {
    const response = await axiosInstance.get('/notifications/unread-count');
    return response.data;
  }
};
