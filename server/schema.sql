USE bloghub_db;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  status ENUM('active', 'locked', 'deleted') DEFAULT 'active',
  warningCount INT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deletedAt TIMESTAMP NULL DEFAULT NULL,
  about TEXT,
  avatarUrl VARCHAR(255),
  websites TEXT,
  INDEX idx_email (email),
  INDEX idx_username (username),
  INDEX idx_status (status),
  INDEX idx_warning (warningCount)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE users MODIFY COLUMN status ENUM('active', 'locked', 'deleted') DEFAULT 'active';

ALTER TABLE users ADD COLUMN IF NOT EXISTS deletedAt TIMESTAMP NULL DEFAULT NULL;

CREATE TABLE IF NOT EXISTS posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content LONGTEXT NOT NULL,
  authorId INT NOT NULL,
  status ENUM('pending', 'visible', 'hidden') DEFAULT 'pending',
  likes INT DEFAULT 0,
  views INT DEFAULT 0,
  category VARCHAR(100) DEFAULT NULL,
  tags TEXT DEFAULT NULL,
  privacy ENUM('public', 'private', 'followers') DEFAULT 'public',
  reaction_like INT DEFAULT 0,
  reaction_love INT DEFAULT 0,
  reaction_haha INT DEFAULT 0,
  reaction_wow INT DEFAULT 0,
  reaction_sad INT DEFAULT 0,
  reaction_angry INT DEFAULT 0,
  total_reactions INT DEFAULT 0,
  pinnedCommentId INT DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (authorId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_author (authorId),
  INDEX idx_status (status),
  INDEX idx_category (category),
  INDEX idx_privacy (privacy),
  INDEX idx_created (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE posts ADD COLUMN IF NOT EXISTS views INT DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT NULL;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS tags TEXT DEFAULT NULL;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS privacy ENUM('public', 'private', 'followers') DEFAULT 'public';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS reaction_like INT DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS reaction_love INT DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS reaction_haha INT DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS reaction_wow INT DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS reaction_sad INT DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS reaction_angry INT DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS total_reactions INT DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS pinnedCommentId INT DEFAULT NULL;

CREATE TABLE IF NOT EXISTS comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  content TEXT NOT NULL,
  postId INT NOT NULL,
  userId INT NULL,
  parentId INT DEFAULT NULL,
  status ENUM('visible', 'hidden') DEFAULT 'visible',
  likes INT DEFAULT 0,
  isAnonymous BOOLEAN DEFAULT FALSE,
  anonymousId VARCHAR(255) DEFAULT NULL,
  reportCount INT DEFAULT 0,
  reaction_like INT DEFAULT 0,
  reaction_love INT DEFAULT 0,
  reaction_haha INT DEFAULT 0,
  reaction_wow INT DEFAULT 0,
  reaction_sad INT DEFAULT 0,
  reaction_angry INT DEFAULT 0,
  total_reactions INT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (parentId) REFERENCES comments(id) ON DELETE CASCADE,
  INDEX idx_post (postId),
  INDEX idx_user (userId),
  INDEX idx_parent (parentId),
  INDEX idx_status (status),
  INDEX idx_anonymous (isAnonymous),
  INDEX idx_report_count (reportCount),
  INDEX idx_created (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE comments MODIFY COLUMN userId INT NULL;

ALTER TABLE comments ADD COLUMN IF NOT EXISTS likes INT DEFAULT 0;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS isAnonymous BOOLEAN DEFAULT FALSE;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS anonymousId VARCHAR(255) DEFAULT NULL;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS reportCount INT DEFAULT 0;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS reaction_like INT DEFAULT 0;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS reaction_love INT DEFAULT 0;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS reaction_haha INT DEFAULT 0;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS reaction_wow INT DEFAULT 0;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS reaction_sad INT DEFAULT 0;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS reaction_angry INT DEFAULT 0;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS total_reactions INT DEFAULT 0;

ALTER TABLE posts ADD CONSTRAINT IF NOT EXISTS fk_pinned_comment 
FOREIGN KEY (pinnedCommentId) REFERENCES comments(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS reactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  postId INT NOT NULL,
  userId INT NOT NULL,
  reactionType ENUM('like', 'love', 'haha', 'wow', 'sad', 'angry') NOT NULL DEFAULT 'like',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_post_reaction (postId, userId),
  INDEX idx_post_reaction (postId, reactionType),
  INDEX idx_user (userId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS comment_reactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  commentId INT NOT NULL,
  userId INT NOT NULL,
  reactionType ENUM('like', 'love', 'haha', 'wow', 'sad', 'angry') NOT NULL DEFAULT 'like',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (commentId) REFERENCES comments(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_comment_reaction (commentId, userId),
  INDEX idx_comment_reaction (commentId, reactionType),
  INDEX idx_user (userId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS post_views (
  id INT AUTO_INCREMENT PRIMARY KEY,
  postId INT NOT NULL,
  userId INT DEFAULT NULL,
  sessionId VARCHAR(255) DEFAULT NULL,
  viewedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_post_user (postId, userId),
  INDEX idx_post_session (postId, sessionId),
  INDEX idx_viewed (viewedAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE post_views ADD COLUMN IF NOT EXISTS userId INT DEFAULT NULL AFTER postId;

CREATE TABLE IF NOT EXISTS follows (
  id INT AUTO_INCREMENT PRIMARY KEY,
  followerId INT NOT NULL,
  followingId INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (followerId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (followingId) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_follow (followerId, followingId),
  INDEX idx_follower (followerId),
  INDEX idx_following (followingId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  type ENUM('share', 'like', 'comment', 'follow', 'reaction', 'post_approved', 'post_reported', 'comment_reported') NOT NULL,
  postId INT DEFAULT NULL,
  senderId INT DEFAULT NULL,
  anonymousId VARCHAR(255) DEFAULT NULL,
  message TEXT NOT NULL,
  isRead BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (senderId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE,
  INDEX idx_user_read (userId, isRead),
  INDEX idx_user_created (userId, createdAt),
  INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  sessionToken VARCHAR(500) NOT NULL UNIQUE,
  deviceInfo TEXT,
  ipAddress VARCHAR(45),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expiresAt TIMESTAMP NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (userId),
  INDEX idx_token (sessionToken),
  INDEX idx_expires (expiresAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  postId INT NOT NULL,
  reportedBy INT NOT NULL,
  reason TEXT NOT NULL,
  status ENUM('pending', 'reviewed', 'resolved') DEFAULT 'pending',
  reviewedBy INT DEFAULT NULL,
  reviewedAt TIMESTAMP NULL DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (reportedBy) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewedBy) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_post (postId),
  INDEX idx_reporter (reportedBy),
  INDEX idx_status (status),
  INDEX idx_created (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS comment_reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  commentId INT NOT NULL,
  reporterId INT NOT NULL,
  reason TEXT NOT NULL,
  status ENUM('pending', 'reviewed', 'rejected', 'action_taken') DEFAULT 'pending',
  adminResponse TEXT DEFAULT NULL,
  reviewedBy INT DEFAULT NULL,
  reviewedAt TIMESTAMP DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (commentId) REFERENCES comments(id) ON DELETE CASCADE,
  FOREIGN KEY (reporterId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewedBy) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_comment (commentId),
  INDEX idx_reporter (reporterId),
  INDEX idx_status (status),
  INDEX idx_created (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS bookmarks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  postId INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_post_bookmark (userId, postId),
  INDEX idx_user (userId),
  INDEX idx_post (postId),
  INDEX idx_created (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS likes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  postId INT NOT NULL,
  userId INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_post_user (postId, userId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS comment_likes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  commentId INT NOT NULL,
  userId INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (commentId) REFERENCES comments(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_comment_like (commentId, userId),
  INDEX idx_comment (commentId),
  INDEX idx_user (userId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS comment_replies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  content TEXT NOT NULL,
  commentId INT NOT NULL,
  userId INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (commentId) REFERENCES comments(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_comment (commentId),
  INDEX idx_user (userId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

- -- 1. Xóa user admin cũ (để tránh lỗi trùng email)
-- DELETE FROM users WHERE email = 'admin@bloghub.com';

-- -- 2. Tạo lại Admin với mật khẩu: m@t.|<h@u?NaY'c0'500ChU~
-- INSERT INTO users (username, email, password, role, status, warningCount, createdAt, updatedAt)
-- VALUES (
--     'SuperAdmin', 
--     'admin@bloghub.com', 
--     '$2a$12$h6tGBitB/lWevrkeUk0cqOv0yaaBiqPwN7wJvUUd8uDtkRrb4eg4G', 
--     'admin', 
--     'active', 
--     0, 
--     NOW(), 
--     NOW()
-- );

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
-- 
-- File này AN TOÀN cho database mới hoặc cập nhật
-- Không xóa dữ liệu, chỉ tạo/cập nhật cấu trúc
-- Sử dụng IF NOT EXISTS để tránh lỗi
-- 
-- HƯỚNG DẪN SỬ DỤNG TRONG TABLEPLUS:
-- 1. Mở TablePlus và connect vào database
-- 2. Chọn database: bloghub_db
-- 3. File → Import → From SQL Dump
-- 4. Chọn file schema.sql này
-- 5. BỎ CHỌN "Drop existing objects" (quan trọng!)
-- 6. Click Import
-- 
-- HOẶC DÙNG COMMAND LINE:
-- mysql -u username -p bloghub_db < schema.sql
-- 
-- SAU KHI IMPORT:
-- - Kiểm tra: SHOW TABLES;
-- - Restart backend server trên Railway
-- ============================================================================

