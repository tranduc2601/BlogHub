import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import axios from '../config/axios';

interface User {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'admin';
  avatarUrl?: string;
  warningCount?: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ token: string; user: User } | null>;
  register: (username: string, email: string, password: string, confirmPassword: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
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

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Check both localStorage and sessionStorage for token
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');

      if (token && storedUser) {
        // Set user immediately from storage to avoid flicker
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsLoading(false);
        
        // Verify token in background
        try {
          const response = await axios.get('/auth/me');
          
          if (response.data.success) {
            setUser(response.data.user);
          } else {
            // Invalid token
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
            setUser(null);
          }
        } catch (error) {
          // If verification fails, keep user logged in but log the error
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
      const response = await axios.post('/auth/login', { email, password });
      if (response.data.success) {
        const { token, user: userData } = response.data;
        setUser(userData);
        return { token, user: userData };
      } else {
        throw new Error(response.data.message || 'Đăng nhập thất bại');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Đăng nhập thất bại';
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
      const response = await axios.post('/auth/register', {
        username,
        email,
        password,
        confirmPassword
      });
      
      if (response.data.success) {
        const { token, user: userData } = response.data;
        
        // Save to localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Update state
        setUser(userData);
      } else {
        throw new Error(response.data.message || 'Đăng ký thất bại');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Đăng ký thất bại';
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    // Clear both localStorage and sessionStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    
    // Clear state
    setUser(null);
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
