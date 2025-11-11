/**
 * Admin Controller - Quản lý CRUD cho admin dashboard
 * Tích hợp trực tiếp với MySQL database
 */

import db from '../config/database.js';

// ==================== POSTS ====================

// Get all posts for admin
export const getPosts = async (req, res) => {
  try {
    const [posts] = await db.query(`
      SELECT 
        p.id,
        p.title,
        p.content,
        p.status,
        p.likes,
        p.createdAt,
        p.hasReports,
        p.reportCount,
        u.username as author,
        CASE WHEN p.status = 'hidden' THEN true ELSE false END as needsReview
      FROM posts p
      LEFT JOIN users u ON p.authorId = u.id
      ORDER BY p.createdAt DESC
    `);

    res.json({ 
      success: true, 
      posts: posts.map(p => ({
        ...p,
        createdAt: p.createdAt?.toISOString().slice(0, 10) || '',
        needsReview: p.needsReview === 1 || p.status === 'hidden',
        hasReports: p.hasReports === 1 || p.hasReports === true,
        reportCount: p.reportCount || 0
      }))
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi lấy danh sách bài viết' 
    });
  }
};

// Create new post
export const createPost = async (req, res) => {
  try {
    const { title, content, author, authorId = 1, status = 'visible', likes = 0 } = req.body;

    const [result] = await db.query(
      'INSERT INTO posts (title, content, authorId, status, likes) VALUES (?, ?, ?, ?, ?)',
      [title, content, authorId, status, likes]
    );

    const [newPost] = await db.query(
      'SELECT p.*, u.username as author FROM posts p LEFT JOIN users u ON p.authorId = u.id WHERE p.id = ?',
      [result.insertId]
    );

    res.status(201).json({ 
      success: true, 
      message: 'Tạo bài viết thành công',
      post: newPost[0]
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi tạo bài viết' 
    });
  }
};

// Toggle post status
export const togglePostStatus = async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const { status } = req.body;

    // Get current post
    const [posts] = await db.query('SELECT * FROM posts WHERE id = ?', [postId]);
    
    if (posts.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Bài viết không tồn tại' 
      });
    }

    const currentStatus = posts[0].status;
    const newStatus = status || (currentStatus === 'visible' ? 'hidden' : 'visible');

    // Update status
    await db.query('UPDATE posts SET status = ? WHERE id = ?', [newStatus, postId]);

    // Get updated post with author info
    const [updated] = await db.query(
      'SELECT p.*, u.username as author FROM posts p LEFT JOIN users u ON p.authorId = u.id WHERE p.id = ?',
      [postId]
    );

    res.json({ 
      success: true, 
      message: `Đã ${newStatus === 'visible' ? 'hiển thị' : 'ẩn'} bài viết`,
      post: updated[0]
    });
  } catch (error) {
    console.error('Toggle post status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi cập nhật trạng thái bài viết' 
    });
  }
};

// Approve post (duyệt bài viết)
export const approvePost = async (req, res) => {
  try {
    const postId = parseInt(req.params.id);

    // Get current post
    const [posts] = await db.query('SELECT * FROM posts WHERE id = ?', [postId]);
    
    if (posts.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Bài viết không tồn tại' 
      });
    }

    // Update status to visible (approved)
    await db.query('UPDATE posts SET status = ? WHERE id = ?', ['visible', postId]);

    // Get updated post with author info
    const [updated] = await db.query(
      'SELECT p.*, u.username as author FROM posts p LEFT JOIN users u ON p.authorId = u.id WHERE p.id = ?',
      [postId]
    );

    res.json({ 
      success: true, 
      message: 'Đã duyệt bài viết thành công. Bài viết sẽ hiển thị trên trang chủ.',
      post: {
        ...updated[0],
        needsReview: false,
        status: 'visible'
      }
    });
  } catch (error) {
    console.error('Approve post error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi duyệt bài viết' 
    });
  }
};

// Delete post
export const deletePost = async (req, res) => {
  try {
    const postId = parseInt(req.params.id);

    // Get current post
    const [posts] = await db.query('SELECT * FROM posts WHERE id = ?', [postId]);
    
    if (posts.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Bài viết không tồn tại' 
      });
    }

    // Delete all comments for this post first
    await db.query('DELETE FROM comments WHERE postId = ?', [postId]);

    // Delete the post
    await db.query('DELETE FROM posts WHERE id = ?', [postId]);

    res.json({ 
      success: true, 
      message: 'Đã xóa bài viết thành công'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi xóa bài viết' 
    });
  }
};

// ==================== COMMENTS ====================

// Get all comments for admin
export const getComments = async (req, res) => {
  try {
    const [comments] = await db.query(`
      SELECT 
        c.id,
        c.postId,
        c.content,
        c.status,
        c.createdAt,
        u.username as author,
        p.title as postTitle,
        CASE WHEN c.status = 'hidden' THEN true ELSE false END as needsReview
      FROM comments c
      LEFT JOIN users u ON c.userId = u.id
      LEFT JOIN posts p ON c.postId = p.id
      ORDER BY c.createdAt DESC
    `);

    res.json({ 
      success: true, 
      comments: comments.map(c => ({
        ...c,
        createdAt: c.createdAt?.toISOString().slice(0, 10) || '',
        needsReview: c.needsReview === 1 || c.status === 'hidden'
      }))
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi lấy danh sách bình luận' 
    });
  }
};

// Create new comment
export const createComment = async (req, res) => {
  try {
    const { postId, content, userId = 1, status = 'visible' } = req.body;

    const [result] = await db.query(
      'INSERT INTO comments (postId, userId, content, status) VALUES (?, ?, ?, ?)',
      [postId, userId, content, status]
    );

    const [newComment] = await db.query(
      `SELECT c.*, u.username as author, p.title as postTitle 
       FROM comments c 
       LEFT JOIN users u ON c.userId = u.id 
       LEFT JOIN posts p ON c.postId = p.id 
       WHERE c.id = ?`,
      [result.insertId]
    );

    res.status(201).json({ 
      success: true, 
      message: 'Tạo bình luận thành công',
      comment: newComment[0]
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi tạo bình luận' 
    });
  }
};

// Toggle comment status
export const toggleCommentStatus = async (req, res) => {
  try {
    const commentId = parseInt(req.params.id);
    const { status } = req.body;

    // Get current comment
    const [comments] = await db.query('SELECT * FROM comments WHERE id = ?', [commentId]);
    
    if (comments.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Bình luận không tồn tại' 
      });
    }

    const currentStatus = comments[0].status;
    const newStatus = status || (currentStatus === 'visible' ? 'hidden' : 'visible');

    // Update status
    await db.query('UPDATE comments SET status = ? WHERE id = ?', [newStatus, commentId]);

    // Get updated comment with user and post info
    const [updated] = await db.query(
      `SELECT c.*, u.username as author, p.title as postTitle 
       FROM comments c 
       LEFT JOIN users u ON c.userId = u.id 
       LEFT JOIN posts p ON c.postId = p.id 
       WHERE c.id = ?`,
      [commentId]
    );

    res.json({ 
      success: true, 
      message: `Đã ${newStatus === 'visible' ? 'hiển thị' : 'ẩn'} bình luận`,
      comment: updated[0]
    });
  } catch (error) {
    console.error('Toggle comment status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi cập nhật trạng thái bình luận' 
    });
  }
};

// ==================== USERS ====================

// Get all users for admin
export const getUsers = async (req, res) => {
  try {
    const [users] = await db.query(`
      SELECT 
        u.id,
        u.username as name,
        u.email,
        u.role,
        COALESCE(u.status, 'active') as status,
        COUNT(DISTINCT p.id) as postsCount,
        COUNT(DISTINCT c.id) as commentsCount,
        DATE_FORMAT(u.createdAt, '%Y-%m-%d') as joinedAt
      FROM users u
      LEFT JOIN posts p ON u.id = p.authorId
      LEFT JOIN comments c ON u.id = c.userId
      WHERE u.role != 'admin'
      GROUP BY u.id, u.username, u.email, u.role, u.status, u.createdAt
      ORDER BY u.createdAt DESC
    `);

    res.json({ success: true, users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi lấy danh sách người dùng' 
    });
  }
};

// Toggle user status
export const toggleUserStatus = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { status } = req.body;

    // Get current user
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    
    if (users.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Người dùng không tồn tại' 
      });
    }

    // Don't allow locking admin users
    if (users[0].role === 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Không thể khóa tài khoản admin' 
      });
    }

    const currentStatus = users[0].status || 'active';
    const newStatus = status || (currentStatus === 'active' ? 'locked' : 'active');

    // Update status
    await db.query('UPDATE users SET status = ? WHERE id = ?', [newStatus, userId]);

    // Get updated user info
    const [updated] = await db.query(
      `SELECT 
        u.id,
        u.username as name,
        u.email,
        u.role,
        u.status,
        COUNT(DISTINCT p.id) as postsCount,
        COUNT(DISTINCT c.id) as commentsCount,
        DATE_FORMAT(u.createdAt, '%Y-%m-%d') as joinedAt
      FROM users u
      LEFT JOIN posts p ON u.id = p.authorId
      LEFT JOIN comments c ON u.id = c.userId
      WHERE u.id = ?
      GROUP BY u.id`,
      [userId]
    );

    res.json({ 
      success: true, 
      message: `Đã ${newStatus === 'locked' ? 'khóa' : 'mở khóa'} tài khoản`,
      user: updated[0]
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi cập nhật trạng thái người dùng' 
    });
  }
};

// Delete user and all associated data
export const deleteUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    // Get current user
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    
    if (users.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Người dùng không tồn tại' 
      });
    }

    // Don't allow deleting admin users
    if (users[0].role === 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Không thể xóa tài khoản admin' 
      });
    }

    // Delete all comments by this user
    await db.query('DELETE FROM comments WHERE userId = ?', [userId]);

    // Delete all posts by this user (and their associated comments)
    const [userPosts] = await db.query('SELECT id FROM posts WHERE authorId = ?', [userId]);
    for (const post of userPosts) {
      await db.query('DELETE FROM comments WHERE postId = ?', [post.id]);
    }
    await db.query('DELETE FROM posts WHERE authorId = ?', [userId]);

    // Delete all reports by this user
    await db.query('DELETE FROM reports WHERE reportedBy = ?', [userId]);

    // Delete the user
    await db.query('DELETE FROM users WHERE id = ?', [userId]);

    // Optimize: Reset AUTO_INCREMENT if this was the last user
    // This helps keep IDs sequential when deleting the most recent users
    const [maxId] = await db.query('SELECT MAX(id) as maxId FROM users');
    const nextId = (maxId[0].maxId || 0) + 1;
    await db.query('ALTER TABLE users AUTO_INCREMENT = ?', [nextId]);

    res.json({ 
      success: true, 
      message: 'Đã xóa người dùng và tất cả dữ liệu liên quan thành công. Email này có thể đăng ký lại.'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi xóa người dùng' 
    });
  }
};

// ==================== STATS ====================

// Get monthly statistics
export const getStats = async (req, res) => {
  try {
    // Get all posts with their creation dates
    const [allPosts] = await db.query(`
      SELECT 
        DATE_FORMAT(createdAt, '%Y-%m') as yearMonth,
        DATE_FORMAT(createdAt, '%m') as monthNum
      FROM posts
      WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
    `);

    // Get all users with their creation dates
    const [allUsers] = await db.query(`
      SELECT 
        DATE_FORMAT(createdAt, '%Y-%m') as yearMonth,
        DATE_FORMAT(createdAt, '%m') as monthNum
      FROM users
      WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
    `);

    // Count posts by month
    const postsByMonth = {};
    allPosts.forEach(post => {
      const month = post.monthNum;
      postsByMonth[month] = (postsByMonth[month] || 0) + 1;
    });

    // Count users by month
    const usersByMonth = {};
    allUsers.forEach(user => {
      const month = user.monthNum;
      usersByMonth[month] = (usersByMonth[month] || 0) + 1;
    });

    // Get current month
    const currentMonth = new Date().getMonth() + 1; // 1-12
    
    // Generate last 6 months data
    const monthlyStats = [];
    for (let i = 5; i >= 0; i--) {
      let month = currentMonth - i;
      let monthName = '';
      
      if (month <= 0) {
        month += 12;
      }
      
      // Vietnamese month names
      monthName = `T${month}`;
      
      const monthStr = month.toString().padStart(2, '0');
      
      monthlyStats.push({
        month: monthName,
        posts: postsByMonth[monthStr] || 0,
        users: usersByMonth[monthStr] || 0
      });
    }

    res.json({ success: true, monthlyStats });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi lấy thống kê',
      monthlyStats: [] 
    });
  }
};

// ==================== REPORTS ====================

// Get all reports
export const getReports = async (req, res) => {
  try {
    const [reports] = await db.query(`
      SELECT 
        r.id,
        r.postId,
        r.reason,
        r.status,
        r.createdAt,
        r.reviewedAt,
        p.title as postTitle,
        u1.username as reportedByUser,
        u2.username as postAuthor,
        u2.id as postAuthorId,
        u3.username as reviewedByUser
      FROM reports r
      LEFT JOIN posts p ON r.postId = p.id
      LEFT JOIN users u1 ON r.reportedBy = u1.id
      LEFT JOIN users u2 ON p.authorId = u2.id
      LEFT JOIN users u3 ON r.reviewedBy = u3.id
      ORDER BY r.createdAt DESC
    `);

    res.json({ 
      success: true, 
      reports: reports.map(r => ({
        ...r,
        createdAt: r.createdAt?.toISOString().slice(0, 10) || '',
        reviewedAt: r.reviewedAt?.toISOString().slice(0, 10) || null
      }))
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi lấy danh sách báo cáo' 
    });
  }
};

// Approve report (vi phạm) - tăng warning cho user
export const approveReport = async (req, res) => {
  try {
    const reportId = parseInt(req.params.id);
    const adminId = req.user?.id;

    // Get report info
    const [reports] = await db.query(`
      SELECT r.*, p.authorId 
      FROM reports r
      LEFT JOIN posts p ON r.postId = p.id
      WHERE r.id = ?
    `, [reportId]);
    
    if (reports.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Báo cáo không tồn tại' 
      });
    }

    const report = reports[0];
    const postAuthorId = report.authorId;

    // Update report status
    await db.query(
      'UPDATE reports SET status = ?, reviewedAt = NOW(), reviewedBy = ? WHERE id = ?',
      ['approved', adminId, reportId]
    );

    // Increment warning count for post author
    await db.query(
      'UPDATE users SET warningCount = warningCount + 1 WHERE id = ?',
      [postAuthorId]
    );

    // Get updated warning count
    const [users] = await db.query('SELECT warningCount, status FROM users WHERE id = ?', [postAuthorId]);
    const warningCount = users[0].warningCount;

    // If warning count >= 3, lock account
    if (warningCount >= 3) {
      await db.query('UPDATE users SET status = ? WHERE id = ?', ['locked', postAuthorId]);
      
      return res.json({ 
        success: true, 
        message: `Đã duyệt báo cáo và cảnh cáo người dùng (${warningCount}/3). Tài khoản đã bị khóa do vi phạm 3 lần.`
      });
    }

    res.json({ 
      success: true, 
      message: `Đã duyệt báo cáo và cảnh cáo người dùng (${warningCount}/3)`
    });
  } catch (error) {
    console.error('Approve report error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi duyệt báo cáo' 
    });
  }
};

// Reject report (không vi phạm)
export const rejectReport = async (req, res) => {
  try {
    const reportId = parseInt(req.params.id);
    const adminId = req.user?.id;

    // Get report info
    const [reports] = await db.query('SELECT * FROM reports WHERE id = ?', [reportId]);
    
    if (reports.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Báo cáo không tồn tại' 
      });
    }

    // Update report status
    await db.query(
      'UPDATE reports SET status = ?, reviewedAt = NOW(), reviewedBy = ? WHERE id = ?',
      ['rejected', adminId, reportId]
    );

    res.json({ 
      success: true, 
      message: 'Đã từ chối báo cáo. Bài viết không vi phạm.'
    });
  } catch (error) {
    console.error('Reject report error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi từ chối báo cáo' 
    });
  }
};
