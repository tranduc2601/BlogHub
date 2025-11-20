import { axiosInstance } from '@/core/config';
import type { Post } from '@/shared/types';

export const postsService = {
  async getPosts(tab: string = 'recent', limit?: number) {
    const response = await axiosInstance.get('/posts', {
      params: { tab, limit }
    });
    return response.data;
  },

  async getPost(id: string | number) {
    const response = await axiosInstance.get(`/posts/${id}`);
    return response.data;
  },

  async createPost(post: Partial<Post>) {
    const response = await axiosInstance.post('/posts', post);
    return response.data;
  },

  async updatePost(id: string | number, post: Partial<Post>) {
    const response = await axiosInstance.put(`/posts/${id}`, post);
    return response.data;
  },

  async deletePost(id: string | number) {
    const response = await axiosInstance.delete(`/posts/${id}`);
    return response.data;
  },

  async reactToPost(postId: string | number, reactionType: string) {
    const response = await axiosInstance.post(`/posts/${postId}/react`, { reactionType });
    return response.data;
  },

  async getPostReactions(postId: string | number) {
    const response = await axiosInstance.get(`/posts/${postId}/reactions`);
    return response.data;
  },

  async searchPosts(query: string, tag?: string) {
    const response = await axiosInstance.get('/posts/search', {
      params: { q: query, tag }
    });
    return response.data;
  }
};
