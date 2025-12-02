import axios from "@/core/config/axios";

export const bookmarkService = {

  getBookmarks: async (page = 1, limit = 9) => {
    const response = await axios.get('/bookmarks', {
      params: { page, limit }
    });
    return response.data;
  },


  addBookmark: async (postId: number) => {
    const response = await axios.post('/bookmarks', { postId });
    return response.data;
  },


  removeBookmark: async (postId: number) => {
    const response = await axios.delete(`/bookmarks/${postId}`);
    return response.data;
  },


  checkBookmark: async (postId: number) => {
    const response = await axios.get(`/bookmarks/check/${postId}`);
    return response.data;
  }
};
