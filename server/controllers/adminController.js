import db from '../config/database.js';
import { getFullAvatarUrl } from '../utils/urlHelper.js';
import { createNotification } from './notificationController.js';

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
        p.category,
        p.tags,
        u.username as author
      FROM posts p
      LEFT JOIN users u ON p.authorId = u.id
      ORDER BY 
        CASE 
          WHEN p.status = 'pending' THEN 1
          WHEN p.status = 'visible' THEN 2
          WHEN p.status = 'hidden' THEN 3
        END,
        p.createdAt DESC
    `);

    res.json({ 
      success: true, 
      posts: posts.map(p => ({
        ...p,
        createdAt: p.createdAt?.toISOString() || '',
        needsReview: p.status === 'pending',
        hasReports: false,
        reportCount: 0
      }))
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi lấy danh sách bài viết!' 
    });
  }
};

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
      message: 'Tạo bài viết thành công!',
      post: newPost[0]
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi tạo bài viết!' 
    });
  }
};

export const togglePostStatus = async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const { status } = req.body;
    const adminId = req.user?.id;

    const [posts] = await db.query('SELECT * FROM posts WHERE id = ?', [postId]);
    
    if (posts.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Bài viết không tồn tại!' 
      });
    }

    const post = posts[0];
    const currentStatus = post.status;
    const newStatus = status || (currentStatus === 'visible' ? 'hidden' : 'visible');

    await db.query('UPDATE posts SET status = ? WHERE id = ?', [newStatus, postId]);

    const [updated] = await db.query(
      'SELECT p.*, u.username as author FROM posts p LEFT JOIN users u ON p.authorId = u.id WHERE p.id = ?',
      [postId]
    );

    if (adminId) {
      try {
        const message = newStatus === 'visible' 
          ? `đã hiển thị lại bài viết "${post.title}" của bạn!`
          : `đã ẩn bài viết "${post.title}" của bạn!`;
        
        await createNotification(
          post.authorId,
          newStatus === 'visible' ? 'post_approved' : 'post_reported',
          adminId,
          message,
          postId
        );
      } catch (notifError) {
        console.error('Error creating toggle status notification:', notifError);
      }
    }

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

export const approvePost = async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const adminId = req.user?.id;


    const [posts] = await db.query('SELECT * FROM posts WHERE id = ?', [postId]);
    
    if (posts.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Bài viết không tồn tại' 
      });
    }

    const post = posts[0];

    await db.query('UPDATE posts SET status = ? WHERE id = ?', ['visible', postId]);


    const [updated] = await db.query(
      'SELECT p.*, u.username as author FROM posts p LEFT JOIN users u ON p.authorId = u.id WHERE p.id = ?',
      [postId]
    );

    if (adminId) {
      try {
        await createNotification(
          post.authorId,
          'post_approved',
          adminId,
          `đã duyệt bài viết "${post.title}" của bạn`,
          postId
        );
      } catch (notifError) {
        console.error('Error creating approval notification:', notifError);
      }
    }

    res.json({ 
      success: true, 
      message: 'Đã duyệt bài viết thành công. Bài viết sẽ hiển thị trên trang chủ!',
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


export const rejectPost = async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const { reason } = req.body;


    const [posts] = await db.query('SELECT * FROM posts WHERE id = ?', [postId]);
    
    if (posts.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Bài viết không tồn tại' 
      });
    }


    await db.query('UPDATE posts SET status = ? WHERE id = ?', ['hidden', postId]);


    const [updated] = await db.query(
      'SELECT p.*, u.username as author FROM posts p LEFT JOIN users u ON p.authorId = u.id WHERE p.id = ?',
      [postId]
    );

    res.json({ 
      success: true, 
      message: reason || 'Đã từ chối bài viết này. Bài viết sẽ không hiển thị công khai!',
      post: {
        ...updated[0],
        needsReview: false,
        status: 'hidden'
      }
    });
  } catch (error) {
    console.error('Reject post error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi từ chối bài viết!' 
    });
  }
};


export const deletePost = async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const adminId = req.user?.id;


    const [posts] = await db.query('SELECT * FROM posts WHERE id = ?', [postId]);
    
    if (posts.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Bài viết không tồn tại' 
      });
    }

    const post = posts[0];

    if (adminId) {
      try {
        await createNotification(
          post.authorId,
          'post_reported',
          adminId,
          `đã xóa bài viết "${post.title}" của bạn!`,
          null
        );
      } catch (notifError) {
        console.error('Error creating delete notification:', notifError);
      }
    }

    await db.query('DELETE FROM comments WHERE postId = ?', [postId]);


    await db.query('DELETE FROM posts WHERE id = ?', [postId]);

    res.json({ 
      success: true, 
      message: 'Đã xóa bài viết thành công!'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi xóa bài viết!' 
    });
  }
};




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
        p.title as postTitle
      FROM comments c
      LEFT JOIN users u ON c.userId = u.id
      LEFT JOIN posts p ON c.postId = p.id
      ORDER BY c.createdAt DESC
    `);

    res.json({ 
      success: true, 
      comments: comments.map(c => ({
        ...c,
        createdAt: c.createdAt?.toISOString() || '',

      }))
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi lấy danh sách bình luận!' 
    });
  }
};


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
      message: 'Tạo bình luận thành công!',
      comment: newComment[0]
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi tạo bình luận!' 
    });
  }
};


export const toggleCommentStatus = async (req, res) => {
  try {
    const commentId = parseInt(req.params.id);
    const { status } = req.body;


    const [comments] = await db.query('SELECT * FROM comments WHERE id = ?', [commentId]);
    
    if (comments.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Bình luận không tồn tại!' 
      });
    }

    const currentStatus = comments[0].status;
    const newStatus = status || (currentStatus === 'visible' ? 'hidden' : 'visible');


    await db.query('UPDATE comments SET status = ? WHERE id = ?', [newStatus, commentId]);


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
      message: 'Lỗi khi cập nhật trạng thái bình luận!' 
    });
  }
};




export const getUsers = async (req, res) => {
  try {
    const [users] = await db.query(`
      SELECT 
        u.id,
        u.username as name,
        u.email,
        u.role,
        u.avatarUrl,
        COALESCE(u.status, 'active') as status,
        COUNT(DISTINCT p.id) as postsCount,
        COUNT(DISTINCT c.id) as commentsCount,
        DATE_FORMAT(u.createdAt, '%Y-%m-%d') as joinedAt
      FROM users u
      LEFT JOIN posts p ON u.id = p.authorId
      LEFT JOIN comments c ON u.id = c.userId
      WHERE u.role != 'admin'
      GROUP BY u.id, u.username, u.email, u.role, u.avatarUrl, u.status, u.createdAt
      ORDER BY u.createdAt DESC
    `);


    const usersWithFullAvatarUrls = users.map(user => ({
      ...user,
      avatarUrl: getFullAvatarUrl(user.avatarUrl)
    }));

    res.json({ success: true, users: usersWithFullAvatarUrls });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi lấy danh sách người dùng!' 
    });
  }
};


export const toggleUserStatus = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { status } = req.body;


    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    
    if (users.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Người dùng không tồn tại!' 
      });
    }


    if (users[0].role === 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Không thể khóa tài khoản Admin!' 
      });
    }

    const currentStatus = users[0].status || 'active';
    const newStatus = status || (currentStatus === 'active' ? 'locked' : 'active');


    await db.query('UPDATE users SET status = ? WHERE id = ?', [newStatus, userId]);


    const [updated] = await db.query(
      `SELECT 
        u.id,
        u.username as name,
        u.email,
        u.role,
        u.avatarUrl,
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
      user: {
        ...updated[0],
        avatarUrl: getFullAvatarUrl(updated[0].avatarUrl)
      }
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi cập nhật trạng thái người dùng!' 
    });
  }
};


export const deleteUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);


    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    
    if (users.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Người dùng không tồn tại!' 
      });
    }


    if (users[0].role === 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Không thể xóa tài khoản admin' 
      });
    }


    await db.query('DELETE FROM comments WHERE userId = ?', [userId]);


    const [userPosts] = await db.query('SELECT id FROM posts WHERE authorId = ?', [userId]);
    for (const post of userPosts) {
      await db.query('DELETE FROM comments WHERE postId = ?', [post.id]);
    }
    await db.query('DELETE FROM posts WHERE authorId = ?', [userId]);


    await db.query('DELETE FROM reports WHERE reportedBy = ?', [userId]);


    await db.query('DELETE FROM users WHERE id = ?', [userId]);

    res.json({ 
      success: true, 
      message: 'Đã xóa người dùng và tất cả dữ liệu liên quan thành công. Email này có thể đăng ký lại!'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi xóa người dùng!' 
    });
  }
};

export const getStats = async (req, res) => {
  try {

    const [allPosts] = await db.query(`
      SELECT 
        DATE_FORMAT(createdAt, '%Y-%m') as yearMonth,
        DATE_FORMAT(createdAt, '%m') as monthNum
      FROM posts
      WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
    `);


    const [allUsers] = await db.query(`
      SELECT 
        DATE_FORMAT(createdAt, '%Y-%m') as yearMonth,
        DATE_FORMAT(createdAt, '%m') as monthNum
      FROM users
      WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        AND role != 'admin'
    `);


    const postsByMonth = {};
    allPosts.forEach(post => {
      const month = post.monthNum;
      postsByMonth[month] = (postsByMonth[month] || 0) + 1;
    });


    const usersByMonth = {};
    allUsers.forEach(user => {
      const month = user.monthNum;
      usersByMonth[month] = (usersByMonth[month] || 0) + 1;
    });


    const currentMonth = new Date().getMonth() + 1; 
    

    const monthlyStats = [];
    for (let i = 5; i >= 0; i--) {
      let month = currentMonth - i;
      let monthName = '';
      
      if (month <= 0) {
        month += 12;
      }
      

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
      message: 'Lỗi khi lấy thống kê!',
      monthlyStats: [] 
    });
  }
};

export const getTopPosts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const [topPosts] = await db.query(`
      SELECT 
        p.id,
        p.title,
        p.likes,
        p.createdAt,
        u.username as author,
        u.avatarUrl as authorAvatar,
        COUNT(DISTINCT c.id) as commentCount
      FROM posts p
      LEFT JOIN users u ON p.authorId = u.id
      LEFT JOIN comments c ON p.id = c.postId
      WHERE p.status = 'visible'
      GROUP BY p.id, p.title, p.likes, p.createdAt, u.username, u.avatarUrl
      ORDER BY p.likes DESC, commentCount DESC
      LIMIT ?
    `, [limit]);

    res.json({ 
      success: true, 
      topPosts: topPosts.map(post => ({
        ...post,
        authorAvatar: getFullAvatarUrl(post.authorAvatar),
        createdAt: post.createdAt?.toISOString() || ''
      }))
    });
  } catch (error) {
    console.error('Get top posts error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi lấy top bài viết!' 
    });
  }
};

export const getTopUsers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const [topUsers] = await db.query(`
      SELECT 
        u.id,
        u.username as name,
        u.avatarUrl,
        u.email,
        COUNT(DISTINCT p.id) as postsCount,
        SUM(p.likes) as totalLikes,
        COUNT(DISTINCT c.id) as commentsCount
      FROM users u
      LEFT JOIN posts p ON u.id = p.authorId AND p.status = 'visible'
      LEFT JOIN comments c ON u.id = c.userId
      WHERE u.role != 'admin'
      GROUP BY u.id, u.username, u.avatarUrl, u.email
      ORDER BY postsCount DESC, totalLikes DESC
      LIMIT ?
    `, [limit]);

    res.json({ 
      success: true, 
      topUsers: topUsers.map(user => ({
        ...user,
        avatarUrl: getFullAvatarUrl(user.avatarUrl),
        totalLikes: user.totalLikes || 0
      }))
    });
  } catch (error) {
    console.error('Get top users error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi lấy top người dùng!' 
    });
  }
};

export const getActivityHistory = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    const [activities] = await db.query(`
      (
        SELECT 
          'post' as type,
          p.id,
          p.title as content,
          u.username as userName,
          u.avatarUrl as userAvatar,
          p.createdAt as timestamp,
          p.id as postId
        FROM posts p
        LEFT JOIN users u ON p.authorId = u.id
        WHERE p.status = 'visible'
      )
      UNION ALL
      (
        SELECT 
          'comment' as type,
          c.id,
          c.content,
          u.username as userName,
          u.avatarUrl as userAvatar,
          c.createdAt as timestamp,
          c.postId
        FROM comments c
        LEFT JOIN users u ON c.userId = u.id
        WHERE c.status = 'visible'
      )
      UNION ALL
      (
        SELECT 
          'report' as type,
          r.id,
          r.reason as content,
          u.username as userName,
          u.avatarUrl as userAvatar,
          r.createdAt as timestamp,
          r.postId
        FROM reports r
        LEFT JOIN users u ON r.reportedBy = u.id
      )
      ORDER BY timestamp DESC
      LIMIT ?
    `, [limit]);

    res.json({ 
      success: true, 
      activities: activities.map(activity => ({
        ...activity,
        userAvatar: getFullAvatarUrl(activity.userAvatar),
        timestamp: activity.timestamp?.toISOString() || ''
      }))
    });
  } catch (error) {
    console.error('Get activity history error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi lấy lịch sử hoạt động!' 
    });
  }
};




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
        createdAt: r.createdAt?.toISOString() || '',
        reviewedAt: r.reviewedAt?.toISOString() || null
      }))
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi lấy danh sách báo cáo!' 
    });
  }
};


export const approveReport = async (req, res) => {
  try {
    const reportId = parseInt(req.params.id);
    const adminId = req.user?.id;


    const [reports] = await db.query(`
      SELECT r.*, p.authorId 
      FROM reports r
      LEFT JOIN posts p ON r.postId = p.id
      WHERE r.id = ?
    `, [reportId]);
    
    if (reports.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Báo cáo không tồn tại!' 
      });
    }

    const report = reports[0];
    const postAuthorId = report.authorId;


    await db.query(
      'UPDATE reports SET status = ?, reviewedAt = NOW(), reviewedBy = ? WHERE id = ?',
      ['resolved', adminId, reportId]
    );


    const [warningColumn] = await db.query('SHOW COLUMNS FROM users LIKE "warningCount"');
    if (warningColumn.length === 0) {
      await db.query('ALTER TABLE users ADD COLUMN warningCount INT DEFAULT 0');
    }


    await db.query(
      'UPDATE users SET warningCount = warningCount + 1 WHERE id = ?',
      [postAuthorId]
    );


    const [users] = await db.query('SELECT warningCount, status FROM users WHERE id = ?', [postAuthorId]);
    const warningCount = users[0].warningCount || 0;

    const [postData] = await db.query('SELECT title FROM posts WHERE id = ?', [report.postId]);
    const postTitle = postData.length > 0 ? postData[0].title : 'bài viết của bạn';

    try {
      await createNotification(
        postAuthorId,
        'post_reported',
        adminId,
        `đã xử lý báo cáo về "${postTitle}". Bạn đã nhận cảnh báo (${warningCount}/3)!`,
        report.postId
      );
    } catch (notifError) {
      console.error('Error creating report notification:', notifError);
    }


    try {
      await createNotification(
        report.reportedBy,
        'post_approved',
        adminId,
        `đã duyệt báo cáo của bạn về "${postTitle}". Người dùng đã nhận cảnh báo!`,
        report.postId
      );
    } catch (notifError) {
      console.error('Error creating reporter notification:', notifError);
    }

    if (warningCount >= 3) {
      await db.query('UPDATE users SET status = ? WHERE id = ?', ['locked', postAuthorId]);
      
      return res.json({ 
        success: true, 
        message: `Đã duyệt báo cáo và cảnh cáo người dùng (${warningCount}/3). Tài khoản đã bị khóa do vi phạm 3 lần!`
      });
    }

    res.json({ 
      success: true, 
      message: `Đã duyệt báo cáo và cảnh cáo người dùng (${warningCount}/3)!`
    });
  } catch (error) {
    console.error('Approve report error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi duyệt báo cáo!' 
    });
  }
};


export const rejectReport = async (req, res) => {
  try {
    const reportId = parseInt(req.params.id);
    const adminId = req.user?.id;


    const [reports] = await db.query(`
      SELECT r.*, p.title as postTitle
      FROM reports r
      LEFT JOIN posts p ON r.postId = p.id
      WHERE r.id = ?
    `, [reportId]);
    
    if (reports.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Báo cáo không tồn tại!' 
      });
    }

    const report = reports[0];


    await db.query(
      'UPDATE reports SET status = ?, reviewedAt = NOW(), reviewedBy = ? WHERE id = ?',
      ['reviewed', adminId, reportId]
    );


    try {
      const postTitle = report.postTitle || 'bài viết';
      await createNotification(
        report.reportedBy,
        'post_approved',
        adminId,
        `đã từ chối báo cáo của bạn về "${postTitle}". Bài viết không vi phạm!`,
        report.postId
      );
    } catch (notifError) {
      console.error('Error creating reporter notification:', notifError);
    }

    res.json({ 
      success: true, 
      message: 'Đã từ chối báo cáo. Bài viết không vi phạm!'
    });
  } catch (error) {
    console.error('Reject report error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi từ chối báo cáo!' 
    });
  }
};

export const deleteReport = async (req, res) => {
  try {
    const reportId = parseInt(req.params.id);
    const adminId = req.user?.id;


    const [reports] = await db.query(`
      SELECT r.*, p.title as postTitle
      FROM reports r
      LEFT JOIN posts p ON r.postId = p.id
      WHERE r.id = ?
    `, [reportId]);
    
    if (reports.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Báo cáo không tồn tại!' 
      });
    }

    const report = reports[0];


    await db.query('DELETE FROM reports WHERE id = ?', [reportId]);

    res.json({ 
      success: true, 
      message: 'Đã xóa báo cáo thành công!'
    });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi xóa báo cáo!' 
    });
  }
};


export const getCommentReports = async (req, res) => {
  try {
    const [reports] = await db.query(`
      SELECT 
        cr.id,
        cr.commentId,
        cr.reporterId,
        cr.reason,
        cr.status,
        cr.adminResponse,
        cr.reviewedBy,
        cr.reviewedAt,
        cr.createdAt,
        c.content as commentContent,
        c.postId,
        c.userId as commentAuthorId,
        cu.username as commentAuthor,
        ru.username as reporterUsername,
        p.title as postTitle,
        ra.username as reviewerUsername
      FROM comment_reports cr
      JOIN comments c ON cr.commentId = c.id
      JOIN users cu ON c.userId = cu.id
      JOIN users ru ON cr.reporterId = ru.id
      LEFT JOIN posts p ON c.postId = p.id
      LEFT JOIN users ra ON cr.reviewedBy = ra.id
      ORDER BY 
        CASE 
          WHEN cr.status = 'pending' THEN 1
          WHEN cr.status = 'reviewed' THEN 2
          ELSE 3
        END,
        cr.createdAt DESC
    `);

    res.json({
      success: true,
      reports: reports.map(r => ({
        ...r,
        createdAt: r.createdAt?.toISOString() || '',
        reviewedAt: r.reviewedAt?.toISOString() || null
      }))
    });
  } catch (error) {
    console.error('Get comment reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách báo cáo bình luận!'
    });
  }
};


export const handleCommentReport = async (req, res) => {
  try {
    const reportId = parseInt(req.params.id);
    const { action, adminResponse } = req.body;
    const adminId = req.user?.id;


    const [reports] = await db.query(`
      SELECT 
        cr.*,
        c.content as commentContent,
        c.userId as commentAuthorId,
        c.postId,
        cu.username as commentAuthor,
        ru.username as reporterUsername,
        p.title as postTitle
      FROM comment_reports cr
      JOIN comments c ON cr.commentId = c.id
      JOIN users cu ON c.userId = cu.id
      JOIN users ru ON cr.reporterId = ru.id
      LEFT JOIN posts p ON c.postId = p.id
      WHERE cr.id = ?
    `, [reportId]);

    if (reports.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Báo cáo không tồn tại!'
      });
    }

    const report = reports[0];

    if (action === 'hide') {

      await db.query('UPDATE comments SET status = ? WHERE id = ?', ['hidden', report.commentId]);


      await db.query(
        'UPDATE comment_reports SET status = ?, adminResponse = ?, reviewedBy = ?, reviewedAt = NOW() WHERE id = ?',
        ['action_taken', adminResponse || 'Bình luận đã bị ẩn do vi phạm quy định', adminId, reportId]
      );


      try {
        await createNotification(
          report.commentAuthorId,
          'comment_reported',
          adminId,
          `Bình luận của bạn đã bị ẩn do vi phạm quy định. Lý do: ${adminResponse || 'Vi phạm chính sách cộng đồng'}`,
          report.postId
        );
      } catch (notifError) {
        console.error('Error creating comment author notification:', notifError);
      }


      try {
        await createNotification(
          report.reporterId,
          'post_approved',
          adminId,
          `Cảm ơn báo cáo của bạn! Bình luận vi phạm từ "${report.commentAuthor}" đã được xử lý.`,
          report.postId
        );
      } catch (notifError) {
        console.error('Error creating reporter notification:', notifError);
      }

      res.json({
        success: true,
        message: 'Đã ẩn bình luận và thông báo cho người dùng!'
      });
    } else if (action === 'reject') {

      await db.query(
        'UPDATE comment_reports SET status = ?, adminResponse = ?, reviewedBy = ?, reviewedAt = NOW() WHERE id = ?',
        ['rejected', adminResponse || 'Bình luận không vi phạm quy định', adminId, reportId]
      );


      try {
        await createNotification(
          report.reporterId,
          'post_approved',
          adminId,
          `Báo cáo của bạn về bình luận từ "${report.commentAuthor}" đã được xem xét. Bình luận không vi phạm quy định.`,
          report.postId
        );
      } catch (notifError) {
        console.error('Error creating reporter notification:', notifError);
      }

      res.json({
        success: true,
        message: 'Đã từ chối báo cáo. Bình luận không vi phạm!'
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Action không hợp lệ!'
      });
    }
  } catch (error) {
    console.error('Handle comment report error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xử lý báo cáo bình luận!'
    });
  }
};

export const deleteCommentReport = async (req, res) => {
  try {
    const reportId = parseInt(req.params.id);
    const adminId = req.user?.id;

    // Kiểm tra báo cáo có tồn tại không
    const [reports] = await db.query(`
      SELECT cr.*, c.content as commentContent
      FROM comment_reports cr
      LEFT JOIN comments c ON cr.commentId = c.id
      WHERE cr.id = ?
    `, [reportId]);
    
    if (reports.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Báo cáo không tồn tại!' 
      });
    }

    // Xóa báo cáo khỏi database
    await db.query('DELETE FROM comment_reports WHERE id = ?', [reportId]);

    res.json({ 
      success: true, 
      message: 'Đã xóa báo cáo thành công!'
    });
  } catch (error) {
    console.error('Delete comment report error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi xóa báo cáo!' 
    });
  }
};
