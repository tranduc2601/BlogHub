import { useState, useEffect, useCallback } from 'react';
import axios from '@/core/config/axios';
import type { Post } from '@/shared/types';

export interface UsePostsReturn {
  posts: Post[];
  loading: boolean;
  error: string | null;
  refreshPosts: () => void;
  getPost: (id: string) => Post | undefined;
}

export const usePosts = (type: 'recent' | 'popular' = 'recent', limit: number = 6): UsePostsReturn => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const url = '/posts';
      const res = await axios.get(url);
      let fetchedPosts: Post[] = res.data.posts || [];
      if (type === 'recent') {
        fetchedPosts = fetchedPosts
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, limit);
      } else if (type === 'popular') {
        fetchedPosts = fetchedPosts
          .sort((a, b) => ((b.views || 0) + (b.likes || 0)) - ((a.views || 0) + (a.likes || 0)))
          .slice(0, limit);
      }
      setPosts(fetchedPosts);
    } catch (err) {
      setError('Không thể tải danh sách bài viết!');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  }, [type, limit]);

  const refreshPosts = useCallback(() => {
    fetchPosts();
  }, [fetchPosts]);

  const getPost = useCallback((id: string) => {
    return posts.find(post => String(post.id) === String(id));
  }, [posts]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return {
    posts,
    loading,
    error,
    refreshPosts,
    getPost
  };
};
