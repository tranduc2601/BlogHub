import { useState, useEffect, useCallback } from 'react';
import type { Comment } from '@/shared/types';
import axios from '@/core/config/axios';

export interface UseCommentsReturn {
  comments: Comment[];
  loading: boolean;
  error: string | null;
  addComment: (content: string, parentId?: string, isAnonymous?: boolean) => Promise<void>;
  updateComment: (commentId: string, content: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  likeComment: (commentId: string) => Promise<void>;
  refreshComments: () => Promise<void>;
}

export const useComments = (postId: string | number): UseCommentsReturn => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`/posts/${postId}/comments`);
      const data = response.data as { success?: boolean; comments?: Comment[] };
      if (data.success) {
        setComments(data.comments || []);
      } else {
        setComments([]);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  const addComment = useCallback(async (content: string, parentId?: string, isAnonymous?: boolean) => {
    try {
      
      await axios.post(`/posts/${postId}/comments`, {
        content,
        parentId: parentId || null,
        isAnonymous: isAnonymous || false
      });
      await fetchComments();
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Không thể gửi bình luận');
      throw err;
    }
  }, [postId, fetchComments]);

  const updateComment = useCallback(async (commentId: string, content: string) => {
    try {
      
      await axios.put(`/posts/comments/${commentId}`, { content });
      setComments(prev => 
        prev.map(comment => 
          comment.id === commentId 
            ? { ...comment, content }
            : comment
        )
      );
    } catch (err) {
      console.error('Error updating comment:', err);
      setError('Không thể cập nhật bình luận');
      throw err;
    }
  }, []);

  const deleteComment = useCallback(async (commentId: string) => {
    try {
      
      await axios.delete(`/posts/comments/${commentId}`);
      setComments(prev => 
        prev.filter(comment => 
          comment.id !== commentId && comment.parentId !== commentId
        )
      );
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError('Không thể xóa bình luận');
      throw err;
    }
  }, []);

  const likeComment = useCallback(async (commentId: string) => {
    try {
      
      const response = await axios.post(`/posts/comments/${commentId}/like`);
      const data = response.data as { success?: boolean; likesCount?: number; isLiked?: boolean };
      if (data.success) {
        setComments(prev => 
          prev.map(comment => 
            comment.id === commentId 
              ? { 
                  ...comment, 
                  likes: data.likesCount ?? comment.likes,
                  isLiked: data.isLiked ?? comment.isLiked 
                }
              : comment
          )
        );
      }
    } catch (err) {
      console.error('Error liking comment:', err);
      setError('Không thể thích bình luận');
    }
  }, []);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return {
    comments,
    loading,
    error,
    addComment,
    updateComment,
    deleteComment,
    likeComment,
    refreshComments: fetchComments
  };
};
