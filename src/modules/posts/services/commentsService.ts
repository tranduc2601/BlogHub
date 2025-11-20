import { axiosInstance } from '@/core/config';

export const commentsService = {
  async getComments(postId: string | number) {
    const response = await axiosInstance.get(`/posts/${postId}/comments`);
    return response.data;
  },

  async addComment(postId: string | number, content: string, parentId?: string) {
    const response = await axiosInstance.post(`/posts/${postId}/comments`, {
      content,
      parentId
    });
    return response.data;
  },

  async updateComment(commentId: string, content: string) {
    const response = await axiosInstance.put(`/comments/${commentId}`, { content });
    return response.data;
  },

  async deleteComment(commentId: string) {
    const response = await axiosInstance.delete(`/comments/${commentId}`);
    return response.data;
  },

  async likeComment(commentId: string) {
    const response = await axiosInstance.post(`/comments/${commentId}/like`);
    return response.data;
  },

  async reactToComment(commentId: string, reactionType: string) {
    const response = await axiosInstance.post(`/comments/${commentId}/react`, { reactionType });
    return response.data;
  }
};
