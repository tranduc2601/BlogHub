export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  joinDate: string;
  postsCount: number;
  followersCount: number;
  role?: 'user' | 'admin';
  avatarUrl?: string;
  warningCount?: number;
  about?: string;
  websites?: string[];
  username?: string;
  status?: string;
  commentsCount?: number;
  followingCount?: number;
  totalLikes?: number;
  joinedAt?: string;
}

export interface Post {
  id: string | number;
  title: string;
  content: string;
  excerpt?: string;
  authorId: string | number;
  author: User | string;
  authorAvatar?: string;
  createdAt: string;
  updatedAt?: string;
  readTime: number;
  likes: number;
  comments?: number;
  views?: number;
  category: string;
  tags: string[];
  featuredImage?: string;
  published?: boolean;
  status?: string;
  total_reactions?: number;
  privacy?: 'public' | 'private' | 'followers';
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  author: User;
  content: string;
  createdAt: string;
  likes: number;
  isLiked?: boolean;
  reactionType?: 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry' | null;
  reactionCounts?: {
    like: number;
    love: number;
    haha: number;
    wow: number;
    sad: number;
    angry: number;
    total: number;
  };
  parentId?: string | null;
  replies?: Comment[];
  isAnonymous?: boolean;
  anonymousId?: number;
  isOwner?: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  total?: number;
  page?: number;
  limit?: number;
}


export interface AdminPost {
  id: number;
  title: string;
  author: string;
  content: string;
  status: 'pending' | 'visible' | 'hidden';
  likes: number;
  views?: number;
  createdAt: string;
  needsReview: boolean;
  hasReports?: boolean;
  tags?: string;
  category?: string;
}

export interface AdminComment {
  id: number;
  postId: number;
  author: string;
  content: string;
  createdAt: string;
  needsReview: boolean;
  hasReports?: boolean;
  status: 'visible' | 'hidden';
  postTitle?: string;
}

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: 'user' | 'admin';
  status: 'active' | 'locked';
  createdAt: string;
  name?: string;
  avatarUrl?: string;
  postsCount?: number;
  commentsCount?: number;
  joinedAt?: string;
}
