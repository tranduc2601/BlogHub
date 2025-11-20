import { axiosInstance } from '@/core/config';

export const usersService = {
  async getUsers(params?: { search?: string; page?: number; limit?: number }) {
    const response = await axiosInstance.get('/users', { params });
    return response.data;
  },

  async getUser(id: string | number) {
    const response = await axiosInstance.get(`/users/${id}`);
    return response.data;
  },

  async updateProfile(data: any) {
    const response = await axiosInstance.put('/users/profile', data);
    return response.data;
  },

  async followUser(userId: string | number) {
    const response = await axiosInstance.post(`/users/${userId}/follow`);
    return response.data;
  },

  async unfollowUser(userId: string | number) {
    const response = await axiosInstance.delete(`/users/${userId}/follow`);
    return response.data;
  },

  async getFollowStatus(userId: string | number) {
    const response = await axiosInstance.get(`/users/${userId}/follow-status`);
    return response.data;
  },

  async getFollowers(userId: string | number) {
    const response = await axiosInstance.get(`/users/${userId}/followers`);
    return response.data;
  },

  async getFollowing(userId: string | number) {
    const response = await axiosInstance.get(`/users/${userId}/following`);
    return response.data;
  },

  async changePassword(data: { currentPassword: string; newPassword: string }) {
    const response = await axiosInstance.post('/users/change-password', data);
    return response.data;
  }
};
