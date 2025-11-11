/**
 * Mock data cho Admin Dashboard
 * Dữ liệu giả lập cho bài viết, bình luận cần kiểm duyệt và người dùng
 */

export interface AdminPost {
  id: number;
  title: string;
  author: string;
  content: string;
  status: 'visible' | 'hidden';
  likes: number;
  createdAt: string;
  needsReview: boolean;
  hasReports?: boolean;
}

export interface AdminComment {
  id: number;
  postId: number;
  postTitle: string;
  author: string;
  content: string;
  status: 'visible' | 'hidden';
  createdAt: string;
  needsReview: boolean;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  status: 'active' | 'locked';
  postsCount: number;
  commentsCount: number;
  joinedAt: string;
}

export interface MonthlyStats {
  month: string;
  posts: number;
  users: number;
}

// Mock Posts cần kiểm duyệt
export const mockAdminPosts: AdminPost[] = [
  {
    id: 1,
    title: 'Hướng dẫn học React cho người mới bắt đầu',
    author: 'Nguyễn Văn A',
    content: 'React là một thư viện JavaScript...',
    status: 'visible',
    likes: 45,
    createdAt: '2025-10-28',
    needsReview: false
  },
  {
    id: 2,
    title: 'Bài viết có nội dung spam quảng cáo',
    author: 'Người dùng spam',
    content: 'Mua hàng giảm giá 99%...',
    status: 'visible',
    likes: 2,
    createdAt: '2025-10-29',
    needsReview: true
  },
  {
    id: 3,
    title: 'TypeScript vs JavaScript - So sánh chi tiết',
    author: 'Trần Thị B',
    content: 'TypeScript cung cấp type safety...',
    status: 'visible',
    likes: 67,
    createdAt: '2025-10-27',
    needsReview: false
  },
  {
    id: 4,
    title: 'Nội dung không phù hợp với cộng đồng',
    author: 'User123',
    content: 'Nội dung vi phạm quy định...',
    status: 'hidden',
    likes: 0,
    createdAt: '2025-10-30',
    needsReview: true
  },
  {
    id: 5,
    title: 'Best practices cho Node.js backend',
    author: 'Lê Văn C',
    content: 'Khi xây dựng backend với Node.js...',
    status: 'visible',
    likes: 89,
    createdAt: '2025-10-26',
    needsReview: false
  }
];

// Mock Comments cần kiểm duyệt
export const mockAdminComments: AdminComment[] = [
  {
    id: 1,
    postId: 1,
    postTitle: 'Hướng dẫn học React cho người mới bắt đầu',
    author: 'Phạm Văn D',
    content: 'Bài viết rất hữu ích, cảm ơn bạn!',
    status: 'visible',
    createdAt: '2025-10-28',
    needsReview: false
  },
  {
    id: 2,
    postId: 1,
    postTitle: 'Hướng dẫn học React cho người mới bắt đầu',
    author: 'Spammer',
    content: 'Link spam: http://spam-site.com',
    status: 'visible',
    createdAt: '2025-10-29',
    needsReview: true
  },
  {
    id: 3,
    postId: 3,
    postTitle: 'TypeScript vs JavaScript - So sánh chi tiết',
    author: 'Hoàng Thị E',
    content: 'Mình thích TypeScript hơn vì có type checking',
    status: 'visible',
    createdAt: '2025-10-27',
    needsReview: false
  },
  {
    id: 4,
    postId: 5,
    postTitle: 'Best practices cho Node.js backend',
    author: 'ToxicUser',
    content: 'Bình luận toxic, xúc phạm người khác',
    status: 'hidden',
    createdAt: '2025-10-30',
    needsReview: true
  },
  {
    id: 5,
    postId: 3,
    postTitle: 'TypeScript vs JavaScript - So sánh chi tiết',
    author: 'Vũ Văn F',
    content: 'So sánh rất chi tiết và khách quan',
    status: 'visible',
    createdAt: '2025-10-28',
    needsReview: false
  }
];

// Mock Users
export const mockAdminUsers: AdminUser[] = [
  {
    id: 1,
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@email.com',
    role: 'user',
    status: 'active',
    postsCount: 15,
    commentsCount: 42,
    joinedAt: '2025-01-15'
  },
  {
    id: 2,
    name: 'Trần Thị B',
    email: 'tranthib@email.com',
    role: 'admin',
    status: 'active',
    postsCount: 23,
    commentsCount: 67,
    joinedAt: '2025-02-20'
  },
  {
    id: 3,
    name: 'Lê Văn C',
    email: 'levanc@email.com',
    role: 'user',
    status: 'active',
    postsCount: 8,
    commentsCount: 19,
    joinedAt: '2025-03-10'
  },
  {
    id: 4,
    name: 'Người dùng spam',
    email: 'spammer@email.com',
    role: 'user',
    status: 'locked',
    postsCount: 3,
    commentsCount: 5,
    joinedAt: '2025-10-25'
  },
  {
    id: 5,
    name: 'Phạm Văn D',
    email: 'phamvand@email.com',
    role: 'user',
    status: 'active',
    postsCount: 12,
    commentsCount: 34,
    joinedAt: '2025-04-05'
  },
  {
    id: 6,
    name: 'Hoàng Thị E',
    email: 'hoangthie@email.com',
    role: 'user',
    status: 'active',
    postsCount: 7,
    commentsCount: 21,
    joinedAt: '2025-05-12'
  },
  {
    id: 7,
    name: 'ToxicUser',
    email: 'toxic@email.com',
    role: 'user',
    status: 'locked',
    postsCount: 2,
    commentsCount: 8,
    joinedAt: '2025-10-20'
  },
  {
    id: 8,
    name: 'Vũ Văn F',
    email: 'vuvanf@email.com',
    role: 'user',
    status: 'active',
    postsCount: 18,
    commentsCount: 45,
    joinedAt: '2025-06-08'
  }
];

// Thống kê theo tháng (cho biểu đồ)
export const mockMonthlyStats: MonthlyStats[] = [
  { month: 'T5', posts: 45, users: 12 },
  { month: 'T6', posts: 52, users: 18 },
  { month: 'T7', posts: 61, users: 23 },
  { month: 'T8', posts: 58, users: 15 },
  { month: 'T9', posts: 73, users: 29 },
  { month: 'T10', posts: 89, users: 34 }
];
