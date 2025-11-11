import { useState, useEffect, useCallback } from 'react';
import type { Comment } from '../data/mockData';
import axios from '../config/axios';

export interface UseCommentsReturn {
  comments: Comment[];
  loading: boolean;
  error: string | null;
  addComment: (comment: Omit<Comment, 'id' | 'createdAt' | 'likes'>) => void;
  likeComment: (commentId: string) => void;
}

export const useComments = (postId: string): UseCommentsReturn => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching comments for post:', postId);
      
      // Fetch from API - no mock fallback for team data sync
      const response = await axios.get(`/posts/${postId}/comments`);
      
      console.log('Comments fetched:', response.data);
      
      if (response.data.success) {
        setComments(response.data.comments);
      } else {
        setError('Không thể tải bình luận');
        setComments([]);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Không thể tải bình luận. Vui lòng kiểm tra kết nối server.');
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  const addComment = useCallback(async (newComment: Omit<Comment, 'id' | 'createdAt' | 'likes'>) => {
    try {
      console.log('=== useComments addComment ===');
      console.log('API URL:', `/posts/${postId}/comments`);
      console.log('Request data:', newComment);
      
      // Gọi API lưu bình luận lên backend
      const res = await axios.post(`/posts/${postId}/comments`, newComment);
      
      console.log('API Response:', res.data);
      
      const comment: Comment = res.data;
      setComments(prev => [comment, ...prev]);
    } catch (err) {
      console.error('=== Error in useComments addComment ===');
      console.error('Full error:', err);
      
      const error = err as { response?: { status?: number; data?: unknown; headers?: unknown }; config?: { url?: string; method?: string; data?: unknown } };
      
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        console.error('Response headers:', error.response.headers);
      }
      
      if (error.config) {
        console.error('Request URL:', error.config.url);
        console.error('Request method:', error.config.method);
        console.error('Request data:', error.config.data);
      }
      
      setError('Không thể gửi bình luận');
      throw err; // Re-throw to let caller handle it
    }
  }, [postId]);

  const likeComment = useCallback((commentId: string) => {
    setComments(prev => 
      prev.map(comment => 
        comment.id === commentId 
          ? { ...comment, likes: comment.likes + 1 }
          : comment
      )
    );
    
    // Simulate API call
    setTimeout(() => {
      console.log('Comment liked:', commentId);
    }, 300);
  }, []);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return {
    comments,
    loading,
    error,
    addComment,
    likeComment
  };
};
