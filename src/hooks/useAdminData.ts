import { useState, useCallback, useEffect } from 'react';
import { 
  mockAdminPosts, 
  mockAdminComments, 
  mockAdminUsers,
  mockMonthlyStats
} from '../data/mockAdminData';
import type { AdminPost, AdminComment, AdminUser } from '../data/mockAdminData';
import axios from '../config/axios';
import toast from 'react-hot-toast';

interface Report {
  id: number;
  postId: number;
  status: 'pending' | 'approved' | 'rejected';
}

export const useAdminData = () => {
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [monthlyStats, setMonthlyStats] = useState(mockMonthlyStats);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const togglePostStatus = useCallback(async (postId: number, status?: 'visible'|'hidden') => {
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
        toast.success(res.data.message || 'Cập nhật trạng thái bài viết thành công!');
      }
    } catch (error: unknown) {
      console.error('Toggle post status failed', error);
      const errMsg = error instanceof Error ? error.message : 'Lỗi khi cập nhật trạng thái bài viết!';
      toast.error(errMsg);
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? { ...post, status: post.status === 'visible' ? 'hidden' : 'visible' }
            : post
        )
      );
    }
  }, []);
  const toggleCommentStatus = useCallback(async (commentId: number, status?: 'visible'|'hidden') => {
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
        toast.success(res.data.message || 'Cập nhật trạng thái bình luận thành công!');
      }
    } catch (error: unknown) {
      console.error('Toggle comment status failed', error);
      const errMsg = error instanceof Error ? error.message : 'Lỗi khi cập nhật trạng thái bình luận!';
      toast.error(errMsg);
      setComments(prevComments =>
        prevComments.map(comment =>
          comment.id === commentId
            ? { ...comment, status: comment.status === 'visible' ? 'hidden' : 'visible' }
            : comment
        )
      );
    }
  }, []);
  const toggleUserStatus = useCallback(async (userId: number, status?: 'active'|'locked') => {
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
      const errMsg = error instanceof Error ? error.message : 'Lỗi khi cập nhật trạng thái người dùng!';
      toast.error(errMsg);
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId
            ? { ...user, status: user.status === 'active' ? 'locked' : 'active' }
            : user
        )
      );
    }
  }, []);
  const approvePost = useCallback(async (postId: number) => {
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
        toast.success(res.data.message || 'Duyệt bài viết thành công!');
      }
    } catch (error: unknown) {
      console.error('Approve post failed', error);
      const errMsg = error instanceof Error ? error.message : 'Lỗi khi duyệt bài viết!';
      toast.error(errMsg);
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? { ...post, needsReview: true, status: 'pending' }
            : post
        )
      );
    }
  }, []);
  const rejectPost = useCallback(async (postId: number) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? { ...post, needsReview: false, status: 'hidden' }
          : post
      )
    );

    try {
      const res = await axios.put(`/admin/posts/${postId}/reject`);
      if (res.data.success) {
        const updated = res.data.post;
        setPosts(prev => prev.map(p => p.id === updated.id ? updated : p));
        toast.success(res.data.message || 'Từ chối bài viết thành công');
      }
    } catch (error: unknown) {
      console.error('Reject post failed', error);
      const errMsg = error instanceof Error ? error.message : 'Lỗi khi từ chối bài viết!';
      toast.error(errMsg);
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? { ...post, needsReview: true, status: 'pending' }
            : post
        )
      );
    }
  }, []);
  const deleteUser = useCallback(async (userId: number) => {
    setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));

    try {
      const res = await axios.delete(`/admin/users/${userId}`);
      if (res.data.success) {
        toast.success(res.data.message || 'Xóa người dùng thành công!');
        const uRes = await axios.get('/admin/users');
        if (uRes.data.users) {
          setUsers(uRes.data.users);
        }
      }
    } catch (error: unknown) {
      console.error('Delete user failed', error);
      const errMsg = error instanceof Error ? error.message : 'Lỗi khi xóa người dùng!';
      toast.error(errMsg);
      try {
        const uRes = await axios.get('/admin/users');
        if (uRes.data.users) {
          setUsers(uRes.data.users);
        }
      } catch (refetchError) {
        console.error('Failed to refetch users', refetchError);
      }
    }
  }, []);
  const deletePost = useCallback(async (postId: number) => {
    setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));

    try {
      const res = await axios.delete(`/admin/posts/${postId}`);
      if (res.data.success) {
        toast.success(res.data.message || 'Xóa bài viết thành công!');
      }
    } catch (error: unknown) {
      console.error('Delete post failed', error);
      const errMsg = error instanceof Error ? error.message : 'Lỗi khi xóa bài viết!';
      toast.error(errMsg);
    }
  }, []);
  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [pRes, cRes, uRes, rRes, sRes] = await Promise.all([
          axios.get('/admin/posts'),
          axios.get('/admin/comments'),
          axios.get('/admin/users'),
          axios.get('/admin/reports').catch(() => ({ data: { reports: [] } })),
          axios.get('/admin/stats').catch(() => ({ data: { monthlyStats: mockMonthlyStats } }))
        ]);

        if (!mounted) return;

        setPosts(pRes.data.posts || mockAdminPosts);
        setComments(cRes.data.comments || mockAdminComments);
        setUsers(uRes.data.users || mockAdminUsers);
        setReports(rRes.data.reports || []);
        setMonthlyStats(sRes.data.monthlyStats || mockMonthlyStats);
      } catch (error: unknown) {
        console.warn('Failed to load admin data from server, falling back to mock data', error);
        toast.error('Không thể tải dữ liệu từ server, đang dùng dữ liệu mẫu!');
        if (!mounted) return;
        setPosts(mockAdminPosts);
        setComments(mockAdminComments);
        setUsers(mockAdminUsers);
        setReports([]);
        setMonthlyStats(mockMonthlyStats);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchData();

    return () => { mounted = false; };
  }, []);
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const stats = {
    totalPosts: posts.length,
    totalUsers: users.length,
    hotPosts: posts.filter(post => post.likes >= 50).length,    pendingReviewPosts: posts.filter(post => post.status === 'pending').length,
    pendingReviewComments: comments.filter(comment => comment.needsReview).length,
    activeUsers: users.filter(user => user.status === 'active').length,
    lockedUsers: users.filter(user => user.status === 'locked').length,
    totalReports: reports.length,
    pendingReports: reports.filter(report => report.status === 'pending').length,
    approvedReports: reports.filter(report => report.status === 'approved').length,
    rejectedReports: reports.filter(report => report.status === 'rejected').length
  };

  return {
    posts,
    comments,
    users: filteredUsers,
    monthlyStats,
    isLoading,
    stats,
    searchQuery,
    setSearchQuery,
    togglePostStatus,
    toggleCommentStatus,
    toggleUserStatus,
    approvePost,
    rejectPost,
    deleteUser,
    deletePost
  };
};
