CREATE DATABASE IF NOT EXISTS bloghub_db;
USE bloghub_db;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  status ENUM('active', 'locked') DEFAULT 'active',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  about TEXT,
  avatarUrl VARCHAR(255),
  websites TEXT,
  INDEX idx_email (email),
  INDEX idx_username (username),
  INDEX idx_status (status)
);

CREATE TABLE IF NOT EXISTS posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  authorId INT NOT NULL,
  status ENUM('pending', 'visible', 'hidden') DEFAULT 'pending',
  likes INT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (authorId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_author (authorId),
  INDEX idx_status (status)
);

CREATE TABLE IF NOT EXISTS comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  content TEXT NOT NULL,
  postId INT NOT NULL,
  userId INT NOT NULL,
  parentId INT DEFAULT NULL,
  status ENUM('visible', 'hidden') DEFAULT 'visible',
  likes INT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (parentId) REFERENCES comments(id) ON DELETE CASCADE,
  INDEX idx_post (postId),
  INDEX idx_user (userId),
  INDEX idx_parent (parentId),
  INDEX idx_status (status)
);

-- Reactions table with multiple reaction types (like Facebook)
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
);

-- Legacy likes table (will be removed after migration)
CREATE TABLE IF NOT EXISTS likes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  postId INT NOT NULL,
  userId INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_post_user (postId, userId)
);

-- Add columns to posts table (ignore errors if already exist)
ALTER TABLE posts ADD COLUMN category VARCHAR(100) DEFAULT NULL;
ALTER TABLE posts ADD COLUMN tags TEXT DEFAULT NULL;
ALTER TABLE posts ADD COLUMN views INT DEFAULT 0;
ALTER TABLE posts ADD COLUMN privacy ENUM('public', 'private', 'followers') DEFAULT 'public';
ALTER TABLE posts ADD COLUMN reaction_like INT DEFAULT 0;
ALTER TABLE posts ADD COLUMN reaction_love INT DEFAULT 0;
ALTER TABLE posts ADD COLUMN reaction_haha INT DEFAULT 0;
ALTER TABLE posts ADD COLUMN reaction_wow INT DEFAULT 0;
ALTER TABLE posts ADD COLUMN reaction_sad INT DEFAULT 0;
ALTER TABLE posts ADD COLUMN reaction_angry INT DEFAULT 0;
ALTER TABLE posts ADD COLUMN total_reactions INT DEFAULT 0;
ALTER TABLE posts ADD COLUMN pinnedCommentId INT DEFAULT NULL;
ALTER TABLE posts ADD CONSTRAINT fk_pinned_comment FOREIGN KEY (pinnedCommentId) REFERENCES comments(id) ON DELETE SET NULL;
ALTER TABLE posts ADD INDEX idx_pinned_comment (pinnedCommentId);

CREATE TABLE IF NOT EXISTS post_views (
  id INT AUTO_INCREMENT PRIMARY KEY,
  postId INT NOT NULL,
  userId INT,
  sessionId VARCHAR(255),
  viewedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE,
  INDEX idx_post_user (postId, userId),
  INDEX idx_post_session (postId, sessionId)
);

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
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  type ENUM('share', 'like', 'comment', 'follow', 'reaction', 'post_approved', 'post_reported') NOT NULL,
  postId INT DEFAULT NULL,
  senderId INT NOT NULL,
  message TEXT NOT NULL,
  isRead BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (senderId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE,
  INDEX idx_user_read (userId, isRead),
  INDEX idx_user_created (userId, createdAt),
  INDEX idx_type (type)
);



