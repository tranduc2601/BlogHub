-- ================================================
-- RAILWAY DATABASE COMPLETE SETUP SCRIPT
-- ================================================
-- Purpose: One-time setup for Railway MySQL database
-- Run this ONCE when setting up a new Railway database
-- ================================================

-- Step 1: Create database
CREATE DATABASE IF NOT EXISTS bloghub_db;
USE bloghub_db;

-- ================================================
-- STEP 2: CREATE TABLES
-- ================================================

-- Users table
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
  warningCount INT DEFAULT 0,
  INDEX idx_email (email),
  INDEX idx_username (username),
  INDEX idx_status (status)
);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  authorId INT NOT NULL,
  status ENUM('visible', 'hidden') DEFAULT 'visible',
  likes INT DEFAULT 0,
  category VARCHAR(100) DEFAULT NULL,
  tags TEXT DEFAULT NULL,
  hasReports BOOLEAN DEFAULT FALSE,
  reportCount INT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (authorId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_author (authorId),
  INDEX idx_status (status),
  INDEX idx_category (category)
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  content TEXT NOT NULL,
  postId INT NOT NULL,
  userId INT NOT NULL,
  status ENUM('visible', 'hidden') DEFAULT 'visible',
  likes INT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_post (postId),
  INDEX idx_user (userId),
  INDEX idx_status (status)
);

-- Likes table
CREATE TABLE IF NOT EXISTS likes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  postId INT NOT NULL,
  userId INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_post_user (postId, userId),
  INDEX idx_post_user (postId, userId)
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  postId INT NOT NULL,
  reportedBy INT NOT NULL,
  reason TEXT NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewedAt TIMESTAMP NULL,
  reviewedBy INT NULL,
  FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (reportedBy) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewedBy) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_post (postId),
  INDEX idx_status (status)
);

-- ================================================
-- STEP 3: CREATE ADMIN USER
-- ================================================
-- Password: admin123 (bcrypt hashed)
-- Run this AFTER generating hash with: 
-- node -e "import('bcrypt').then(bcrypt => bcrypt.default.hash('admin123', 10).then(hash => console.log(hash)));"

INSERT INTO users (username, email, password, role, status) 
VALUES (
  'Admin BlogHub',
  'admin@bloghub.com',
  '$2b$10$RGM0aMLHptkm8uWnvHPSXOuEmam8M7k0Buzr5srSQz1vvQkmOWToC',
  'admin',
  'active'
)
ON DUPLICATE KEY UPDATE 
  password = '$2b$10$RGM0aMLHptkm8uWnvHPSXOuEmam8M7k0Buzr5srSQz1vvQkmOWToC';

-- ================================================
-- STEP 4: VERIFY SETUP
-- ================================================

-- Show all tables
SHOW TABLES;

-- Verify admin user
SELECT id, username, email, role, status FROM users WHERE role = 'admin';

-- Show posts table structure
SHOW COLUMNS FROM posts;

-- Show comments table structure  
SHOW COLUMNS FROM comments;

-- ================================================
-- SETUP COMPLETE! 
-- ================================================
-- Next steps:
-- 1. Update server/.env with Railway credentials
-- 2. Start backend: cd server && npm start
-- 3. Start frontend: npm run dev
-- 4. Login with: admin@bloghub.com / admin123
-- ================================================
