import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import db from './config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const updateSchema = async () => {
  try {

    const [postsColumns] = await db.query('SHOW COLUMNS FROM posts LIKE "views"');
    if (postsColumns.length === 0) {
      await db.query('ALTER TABLE posts ADD COLUMN views INT DEFAULT 0');
    }


    const [followsTable] = await db.query('SHOW TABLES LIKE "follows"');
    if (followsTable.length === 0) {
      await db.query(`
        CREATE TABLE follows (
          id INT PRIMARY KEY AUTO_INCREMENT,
          followerId INT NOT NULL,
          followingId INT NOT NULL,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (followerId) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (followingId) REFERENCES users(id) ON DELETE CASCADE,
          UNIQUE KEY unique_follow (followerId, followingId)
        )
      `);
    }


    const [postViewsTable] = await db.query('SHOW TABLES LIKE "post_views"');
    if (postViewsTable.length === 0) {
      await db.query(`
        CREATE TABLE post_views (
          id INT PRIMARY KEY AUTO_INCREMENT,
          postId INT NOT NULL,
          userId INT DEFAULT NULL,
          sessionId VARCHAR(255) DEFAULT NULL,
          viewedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE,
          FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_post_user (postId, userId),
          INDEX idx_post_session (postId, sessionId)
        )
      `);
    } else {
      

      const [userIdColumn] = await db.query('SHOW COLUMNS FROM post_views LIKE "userId"');
      if (userIdColumn.length === 0) {
        await db.query('ALTER TABLE post_views ADD COLUMN userId INT DEFAULT NULL AFTER postId');
        await db.query('ALTER TABLE post_views ADD FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE');
      }
      

      try {
        await db.query('ALTER TABLE post_views DROP INDEX unique_view');
      } catch (err) {

      }
    }


    const [commentsLikesColumn] = await db.query('SHOW COLUMNS FROM comments LIKE "likes"');
    if (commentsLikesColumn.length === 0) {
      await db.query('ALTER TABLE comments ADD COLUMN likes INT DEFAULT 0');
    }


    const [commentsParentIdColumn] = await db.query('SHOW COLUMNS FROM comments LIKE "parentId"');
    if (commentsParentIdColumn.length === 0) {
      await db.query('ALTER TABLE comments ADD COLUMN parentId INT DEFAULT NULL');
      await db.query('ALTER TABLE comments ADD FOREIGN KEY (parentId) REFERENCES comments(id) ON DELETE CASCADE');
      

      const [repliesExist] = await db.query('SHOW TABLES LIKE "comment_replies"');
      if (repliesExist.length > 0) {
        const [replies] = await db.query('SELECT * FROM comment_replies');
        if (replies.length > 0) {
          for (const reply of replies) {
            await db.query(
              'INSERT INTO comments (content, postId, userId, parentId, createdAt, status) SELECT ?, postId, ?, ?, ?, "visible" FROM comments WHERE id = ?',
              [reply.content, reply.userId, reply.commentId, reply.createdAt, reply.commentId]
            );
          }
        }
      }
    }


    const [commentLikesTable] = await db.query('SHOW TABLES LIKE "comment_likes"');
    if (commentLikesTable.length === 0) {
      await db.query(`
        CREATE TABLE comment_likes (
          id INT PRIMARY KEY AUTO_INCREMENT,
          commentId INT NOT NULL,
          userId INT NOT NULL,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (commentId) REFERENCES comments(id) ON DELETE CASCADE,
          FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
          UNIQUE KEY unique_comment_like (commentId, userId)
        )
      `);
    }


    const [commentRepliesTable] = await db.query('SHOW TABLES LIKE "comment_replies"');
    if (commentRepliesTable.length === 0) {
      await db.query(`
        CREATE TABLE comment_replies (
          id INT PRIMARY KEY AUTO_INCREMENT,
          commentId INT NOT NULL,
          userId INT NOT NULL,
          content TEXT NOT NULL,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (commentId) REFERENCES comments(id) ON DELETE CASCADE,
          FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
    }


    const [reportsTable] = await db.query('SHOW TABLES LIKE "reports"');
    if (reportsTable.length === 0) {
      await db.query(`
        CREATE TABLE reports (
          id INT PRIMARY KEY AUTO_INCREMENT,
          postId INT NOT NULL,
          reportedBy INT NOT NULL,
          reason TEXT NOT NULL,
          status ENUM('pending', 'reviewed', 'resolved') DEFAULT 'pending',
          reviewedBy INT DEFAULT NULL,
          reviewedAt TIMESTAMP NULL DEFAULT NULL,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE,
          FOREIGN KEY (reportedBy) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (reviewedBy) REFERENCES users(id) ON DELETE SET NULL
        )
      `);
    } else {
      

      const [reviewedByColumn] = await db.query('SHOW COLUMNS FROM reports LIKE "reviewedBy"');
      if (reviewedByColumn.length === 0) {
        await db.query('ALTER TABLE reports ADD COLUMN reviewedBy INT DEFAULT NULL');
        await db.query('ALTER TABLE reports ADD FOREIGN KEY (reviewedBy) REFERENCES users(id) ON DELETE SET NULL');
      }
      

      const [reviewedAtColumn] = await db.query('SHOW COLUMNS FROM reports LIKE "reviewedAt"');
      if (reviewedAtColumn.length === 0) {
        await db.query('ALTER TABLE reports ADD COLUMN reviewedAt TIMESTAMP NULL DEFAULT NULL');
      }
    }


    try {
      await db.query('DROP TRIGGER IF EXISTS after_user_delete');
      await db.query('DROP PROCEDURE IF EXISTS reorder_user_ids');
    } catch (error) {

    }
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi khi cập nhật schema:', error.message);
    process.exit(1);
  }
};

updateSchema();
