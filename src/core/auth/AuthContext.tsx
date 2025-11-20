import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { axiosInstance } from '@/core/config';

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'admin';
  avatarUrl?: string;
  warningCount?: number;
  about?: string;
  websites?: string[];
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ token: string; user: User } | null>;
  register: (username: string, email: string, password: string, confirmPassword: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');

      if (token && storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsLoading(false);

        try {
          const response = await axiosInstance.get('/auth/me');
          
          if (response.data.success) {
            const updatedUser = response.data.user;
            setUser(updatedUser);
            if (localStorage.getItem('token')) {
              localStorage.setItem('user', JSON.stringify(updatedUser));
            } else if (sessionStorage.getItem('token')) {
              sessionStorage.setItem('user', JSON.stringify(updatedUser));
            }
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
            setUser(null);
          }
        } catch (error) {
          console.error('Auth verification failed, keeping user logged in:', error);
        }
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<{ token: string; user: User } | null> => {
    try {
      const response = await axiosInstance.post('/auth/login', { email, password });
      if (response.data.success) {
        const { token, user: userData } = response.data;
        setUser(userData);
        return { token, user: userData };
      } else {
        throw new Error(response.data.message || 'Đăng nhập thất bại!');
      }
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        throw error;
      }
      const errorMessage = error instanceof Error ? error.message : 'Đăng nhập thất bại!';
      throw new Error(errorMessage);
    }
  };

  const register = async (
    username: string, 
    email: string, 
    password: string, 
    confirmPassword: string
  ) => {
    try {
      const response = await axiosInstance.post('/auth/register', {
        username,
        email,
        password,
        confirmPassword
      });
      
      if (response.data.success) {
        const { token, user: userData } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      } else {
        throw new Error(response.data.message || 'Đăng ký thất bại');
      }
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        throw error;
      }
      const errorMessage = error instanceof Error ? error.message : 'Đăng ký thất bại';
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      await axiosInstance.post('/auth/logout');
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
