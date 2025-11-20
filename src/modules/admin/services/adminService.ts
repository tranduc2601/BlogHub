import { axiosInstance } from '@/core/config';

export const adminService = {
  async getAdminStats() {
    const response = await axiosInstance.get('/admin/stats');
    return response.data;
  },

  async getReports() {
    const response = await axiosInstance.get('/admin/reports');
    return response.data;
  },

  async handleReport(reportId: string | number, action: string) {
    const response = await axiosInstance.post(`/admin/reports/${reportId}/handle`, { action });
    return response.data;
  },

  async getPosts() {
    const response = await axiosInstance.get('/admin/posts');
    return response.data;
  },

  async getComments() {
    const response = await axiosInstance.get('/admin/comments');
    return response.data;
  },

  async getUsers() {
    const response = await axiosInstance.get('/admin/users');
    return response.data;
  },

  async lockUser(userId: string | number) {
    const response = await axiosInstance.post(`/admin/users/${userId}/lock`);
    return response.data;
  },

  async unlockUser(userId: string | number) {
    const response = await axiosInstance.post(`/admin/users/${userId}/unlock`);
    return response.data;
  },

  async warnUser(userId: string | number, reason: string) {
    const response = await axiosInstance.post(`/admin/users/${userId}/warn`, { reason });
    return response.data;
  },

  async deletePost(postId: string | number) {
    const response = await axiosInstance.delete(`/admin/posts/${postId}`);
    return response.data;
  },

  async deleteComment(commentId: string | number) {
    const response = await axiosInstance.delete(`/admin/comments/${commentId}`);
    return response.data;
  },

  async togglePostStatus(postId: string | number, status?: string) {
    const response = await axiosInstance.put(`/admin/posts/${postId}/status`, { status });
    return response.data;
  },

  async toggleCommentStatus(commentId: string | number, status?: string) {
    const response = await axiosInstance.put(`/admin/comments/${commentId}/status`, { status });
    return response.data;
  },

  async deleteUser(userId: string | number) {
    const response = await axiosInstance.delete(`/admin/users/${userId}`);
    return response.data;
  }
};
