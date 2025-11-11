import { useState, useCallback, useEffect } from 'react';
import { mockMonthlyStats } from '../data/mockAdminData';
import type { AdminPost, AdminComment, AdminUser } from '../data/mockAdminData';
import axios from '../config/axios';
import toast from 'react-hot-toast';

export const useAdminData = () => {
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [monthlyStats, setMonthlyStats] = useState(mockMonthlyStats);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Toggle trạng thái hiển thị bài viết
  const togglePostStatus = useCallback(async (postId: number, status?: 'visible'|'hidden') => {
    // Optimistic update
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? { ...post, status: status || (post.status === 'visible' ? 'hidden' : 'visible') }
          : post
      )
    );

    try {
      const res = await axios.put(`/admin/posts/${postId}/status`, { status });
      if (res.data.success) {
        const updated = res.data.post;
        setPosts(prev => prev.map(p => p.id === updated.id ? updated : p));
        toast.success(res.data.message || 'Cập nhật trạng thái bài viết thành công');
      }
    } catch (error: unknown) {
      console.error('Toggle post status failed', error);
      const errMsg = error instanceof Error ? error.message : 'Lỗi khi cập nhật trạng thái bài viết';
      toast.error(errMsg);
      // Revert optimistic update on error
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? { ...post, status: post.status === 'visible' ? 'hidden' : 'visible' }
            : post
        )
      );
    }
  }, []);

  // Toggle trạng thái hiển thị bình luận
  const toggleCommentStatus = useCallback(async (commentId: number, status?: 'visible'|'hidden') => {
    // Optimistic update
    setComments(prevComments =>
      prevComments.map(comment =>
        comment.id === commentId
          ? { ...comment, status: status || (comment.status === 'visible' ? 'hidden' : 'visible') }
          : comment
      )
    );

    try {
      const res = await axios.put(`/admin/comments/${commentId}/status`, { status });
      if (res.data.success) {
        const updated = res.data.comment;
        setComments(prev => prev.map(c => c.id === updated.id ? updated : c));
        toast.success(res.data.message || 'Cập nhật trạng thái bình luận thành công');
      }
    } catch (error: unknown) {
      console.error('Toggle comment status failed', error);
      const errMsg = error instanceof Error ? error.message : 'Lỗi khi cập nhật trạng thái bình luận';
      toast.error(errMsg);
      // Revert optimistic update
      setComments(prevComments =>
        prevComments.map(comment =>
          comment.id === commentId
            ? { ...comment, status: comment.status === 'visible' ? 'hidden' : 'visible' }
            : comment
        )
      );
    }
  }, []);

  // Toggle trạng thái khóa/mở khóa người dùng
  const toggleUserStatus = useCallback(async (userId: number, status?: 'active'|'locked') => {
    // Optimistic update
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === userId
          ? { ...user, status: status || (user.status === 'active' ? 'locked' : 'active') }
          : user
      )
    );

    try {
      const res = await axios.put(`/admin/users/${userId}/status`, { status });
      if (res.data.success) {
        const updated = res.data.user;
        setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
        toast.success(res.data.message || 'Cập nhật trạng thái người dùng thành công');
      }
    } catch (error: unknown) {
      console.error('Toggle user status failed', error);
      const errMsg = error instanceof Error ? error.message : 'Lỗi khi cập nhật trạng thái người dùng';
      toast.error(errMsg);
      // Revert optimistic update
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId
            ? { ...user, status: user.status === 'active' ? 'locked' : 'active' }
            : user
        )
      );
    }
  }, []);

  // Approve post (duyệt bài viết)
  const approvePost = useCallback(async (postId: number) => {
    // Optimistic update
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? { ...post, needsReview: false, status: 'visible' }
          : post
      )
    );

    try {
      const res = await axios.put(`/admin/posts/${postId}/approve`);
      if (res.data.success) {
        const updated = res.data.post;
        setPosts(prev => prev.map(p => p.id === updated.id ? updated : p));
        toast.success(res.data.message || 'Duyệt bài viết thành công');
      }
    } catch (error: unknown) {
      console.error('Approve post failed', error);
      const errMsg = error instanceof Error ? error.message : 'Lỗi khi duyệt bài viết';
      toast.error(errMsg);
      // Revert optimistic update on error
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? { ...post, needsReview: true, status: 'hidden' }
            : post
        )
      );
    }
  }, []);

  // Delete user (xóa người dùng)
  const deleteUser = useCallback(async (userId: number) => {
    // Optimistic update
    setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));

    try {
      const res = await axios.delete(`/admin/users/${userId}`);
      if (res.data.success) {
        toast.success(res.data.message || 'Xóa người dùng thành công');
      }
    } catch (error: unknown) {
      console.error('Delete user failed', error);
      const errMsg = error instanceof Error ? error.message : 'Lỗi khi xóa người dùng';
      toast.error(errMsg);
      // Note: In a real app, you'd need to restore the user from cache/refetch
    }
  }, []);

  // Delete post (xóa bài viết)
  const deletePost = useCallback(async (postId: number) => {
    // Optimistic update
    setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));

    try {
      const res = await axios.delete(`/admin/posts/${postId}`);
      if (res.data.success) {
        toast.success(res.data.message || 'Xóa bài viết thành công');
      }
    } catch (error: unknown) {
      console.error('Delete post failed', error);
      const errMsg = error instanceof Error ? error.message : 'Lỗi khi xóa bài viết';
      toast.error(errMsg);
    }
  }, []);

  // Fetch data from server on mount - REQUIRED (no mock fallback for team sync)
  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [pRes, cRes, uRes, sRes] = await Promise.all([
          axios.get('/admin/posts'),
          axios.get('/admin/comments'),
          axios.get('/admin/users'),
          axios.get('/admin/stats')
        ]);

        if (!mounted) return;

        if (pRes.data.success) setPosts(pRes.data.posts);
        if (cRes.data.success) setComments(cRes.data.comments);
        if (uRes.data.success) setUsers(uRes.data.users);
        if (sRes.data.success) setMonthlyStats(sRes.data.monthlyStats);
      } catch (error: unknown) {
        console.error('Failed to load admin data from server:', error);
        
        // Show specific error to help debug
        if (!mounted) return;
        
        const errMsg = error && typeof error === 'object' && 'message' in error 
          ? String(error.message) 
          : 'Không thể kết nối đến server';
        toast.error(
          `Lỗi tải dữ liệu: ${errMsg}\n\nVui lòng kiểm tra:\n1. Server backend đang chạy (localhost:5000)\n2. Đăng nhập với tài khoản admin\n3. Kết nối MySQL database`,
          { duration: 6000 }
        );
        
        // Don't fallback to mock - keep arrays empty to show the real problem
        setPosts([]);
        setComments([]);
        setUsers([]);
        setMonthlyStats([]);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchData();

    return () => { mounted = false; };
  }, []);

  // Lọc người dùng theo tên hoặc email
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Thống kê tổng quan
  const stats = {
    totalPosts: posts.length,
    totalUsers: users.length,
    hotPosts: posts.filter(post => post.likes >= 50).length, // Hot nếu >= 50 likes
    pendingReviewPosts: posts.filter(post => post.needsReview).length,
    pendingReviewComments: comments.filter(comment => comment.needsReview).length,
    activeUsers: users.filter(user => user.status === 'active').length,
    lockedUsers: users.filter(user => user.status === 'locked').length
  };

  return {
    // Data
    posts,
    comments,
    users: filteredUsers,
    monthlyStats,
    isLoading,
    stats,
    
    // Search
    searchQuery,
    setSearchQuery,
    
    // Actions
    togglePostStatus,
    toggleCommentStatus,
    toggleUserStatus,
    approvePost,
    deleteUser,
    deletePost
  };
};
