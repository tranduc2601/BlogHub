import { useState, useEffect } from 'react';
import axios from '../config/axios';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  postsCount: number;
  commentsCount: number;
  followersCount: number;
  totalLikes: number;
  joinedAt: string;
  avatarUrl?: string;
}

interface UseUsersResult {
  users: User[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useUsers = (): UseUsersResult => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('/users');
      
      if (response.data.success) {
        setUsers(response.data.users);
      } else {
        setError(response.data.message || 'Không thể tải danh sách người dùng');
      }
    } catch (err: unknown) {
      console.error('Error fetching users:', err);
      const errorMessage = (err as { message?: string })?.message || 'Có lỗi xảy ra khi tải danh sách người dùng';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    refetch: fetchUsers
  };
};
