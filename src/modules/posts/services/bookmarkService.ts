import axios from "@/core/config/axios";

export const bookmarkService = {
  // Lấy danh sách bài viết đã lưu
  getBookmarks: async (page = 1, limit = 9) => {
    const response = await axios.get('/bookmarks', {
      params: { page, limit }
    });
    return response.data;
  },

  // Thêm bookmark
  addBookmark: async (postId: number) => {
    const response = await axios.post('/bookmarks', { postId });
    return response.data;
  },

  // Xóa bookmark
  removeBookmark: async (postId: number) => {
    const response = await axios.delete(`/bookmarks/${postId}`);
    return response.data;
  },

  // Kiểm tra bài viết đã được bookmark chưa
  checkBookmark: async (postId: number) => {
    const response = await axios.get(`/bookmarks/check/${postId}`);
    return response.data;
  }
};
