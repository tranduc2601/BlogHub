import db from '../config/database.js';

// Controller xoá bài viết
export const deletePost = async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const userId = req.user?.id;

    // Kiểm tra quyền xoá: chỉ tác giả hoặc admin mới được xoá
    const [posts] = await db.query('SELECT * FROM posts WHERE id = ?', [postId]);
    if (posts.length === 0) {
      return res.status(404).json({ success: false, message: 'Bài viết không tồn tại' });
    }
    const post = posts[0];
    if (post.authorId !== userId) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền xoá bài viết này' });
    }

    await db.query('DELETE FROM posts WHERE id = ?', [postId]);
    res.json({ success: true, message: 'Đã xoá bài viết thành công' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi xoá bài viết' });
  }
};

// Get all visible posts for public viewing
export const getPosts = async (req, res) => {
  try {
    const { authorId } = req.query;
    
    let query = `
      SELECT 
        p.id,
        p.title,
        p.content,
        p.likes,
        p.status,
        p.createdAt,
        p.authorId,
        p.category,
        p.tags,
        u.username as author,
        u.avatarUrl as authorAvatar
      FROM posts p
      LEFT JOIN users u ON p.authorId = u.id
    `;
    
    const params = [];
    
    // If authorId is provided, show all posts by that author (including hidden)
    // Otherwise, only show visible posts
    if (authorId) {
      query += ' WHERE p.authorId = ?';
      params.push(parseInt(authorId)); // Parse to integer
    } else {
      query += ' WHERE p.status = "visible"';
    }
    
    query += ' ORDER BY p.createdAt DESC';
    
    const [posts] = await db.query(query, params);

    res.json({ 
      success: true, 
      posts: posts.map(p => {
        // Parse tags from JSON string
        let tags = [];
        try {
          tags = p.tags ? JSON.parse(p.tags) : [];
        } catch (e) {
          tags = [];
        }
        
        // Calculate read time (average 200 words per minute)
        const wordCount = p.content ? p.content.split(/\s+/).length : 0;
        const readTime = Math.ceil(wordCount / 200);
        
        return {
          ...p,
          tags,
          readTime,
          createdAt: p.createdAt?.toISOString() || new Date().toISOString()
        };
      })
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi lấy danh sách bài viết' 
    });
  }
};

// Get single post by ID
export const getPostById = async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    
    const [posts] = await db.query(`
      SELECT 
        p.id,
        p.title,
        p.content,
        p.likes,
        p.status,
        p.createdAt,
        p.category,
        p.tags,
        u.id as authorId,
        u.username as author,
        u.avatarUrl as authorAvatar
      FROM posts p
      LEFT JOIN users u ON p.authorId = u.id
      WHERE p.id = ? AND p.status = 'visible'
    `, [postId]);

    if (posts.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Bài viết không tồn tại hoặc đã bị ẩn' 
      });
    }

    // Parse tags from JSON string
    let tags = [];
    try {
      tags = posts[0].tags ? JSON.parse(posts[0].tags) : [];
    } catch (e) {
      tags = [];
    }
    
    // Calculate read time
    const wordCount = posts[0].content ? posts[0].content.split(/\s+/).length : 0;
    const readTime = Math.ceil(wordCount / 200);

    res.json({ 
      success: true, 
      post: {
        ...posts[0],
        tags,
        readTime,
        createdAt: posts[0].createdAt?.toISOString() || new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Get post by ID error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi lấy bài viết' 
    });
  }
};

// Controller đăng bài viết mới
export const createPost = async (req, res) => {
  const { title, category, tags, content } = req.body;
  console.log('Nhận yêu cầu đăng bài viết:', { title, category, tags, content });
  
  try {
    // Get user ID from auth middleware
    const authorId = req.user?.id;
    
    if (!authorId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Vui lòng đăng nhập để đăng bài viết' 
      });
    }

    // Convert tags array to JSON string
    const tagsJson = tags ? JSON.stringify(tags) : null;
    
    // Create post with 'visible' status (automatically published)
    const [result] = await db.query(
      'INSERT INTO posts (title, content, authorId, status, likes, category, tags) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, content, authorId, 'visible', 0, category, tagsJson]
    );

    const [newPost] = await db.query(
      'SELECT p.*, u.username as author FROM posts p LEFT JOIN users u ON p.authorId = u.id WHERE p.id = ?',
      [result.insertId]
    );

    res.json({ 
      success: true, 
      message: 'Đăng bài viết thành công!',
      post: newPost[0]
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi đăng bài viết' 
    });
  }
};

// Controller xử lý báo cáo bài viết vi phạm
export const reportPost = async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const { reason } = req.body;
    const reportedBy = req.user?.id;

    if (!reportedBy) {
      return res.status(401).json({ 
        success: false, 
        message: 'Vui lòng đăng nhập để báo cáo bài viết' 
      });
    }

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Vui lòng nhập lý do báo cáo' 
      });
    }

    // Check if post exists
    const [posts] = await db.query('SELECT * FROM posts WHERE id = ?', [postId]);
    if (posts.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Bài viết không tồn tại' 
      });
    }

    // Check if user already reported this post
    const [existingReports] = await db.query(
      'SELECT * FROM reports WHERE postId = ? AND reportedBy = ? AND status = "pending"',
      [postId, reportedBy]
    );

    if (existingReports.length > 0) {
      return res.status(409).json({ 
        success: false, 
        message: 'Bạn đã báo cáo bài viết này rồi' 
      });
    }

    // Create report
    await db.query(
      'INSERT INTO reports (postId, reportedBy, reason) VALUES (?, ?, ?)',
      [postId, reportedBy, reason]
    );

    res.json({ 
      success: true, 
      message: 'Đã gửi báo cáo vi phạm. Admin sẽ xem xét trong thời gian sớm nhất.' 
    });
  } catch (error) {
    console.error('Report post error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi gửi báo cáo' 
    });
  }
};

// API xử lý logic thả tim bài viết
export const likePost = async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập để thả tim' });
    }

    // Kiểm tra bài viết có tồn tại không
    const [posts] = await db.query('SELECT * FROM posts WHERE id = ?', [postId]);
    if (posts.length === 0) {
      return res.status(404).json({ success: false, message: 'Bài viết không tồn tại' });
    }

    // Kiểm tra người dùng đã thả tim chưa
    const [likes] = await db.query('SELECT * FROM likes WHERE postId = ? AND userId = ?', [postId, userId]);
    if (likes.length > 0) {
      return res.status(409).json({ success: false, message: 'Bạn đã thả tim bài viết này rồi' });
    }

    // Thêm lượt thích
    await db.query('INSERT INTO likes (postId, userId) VALUES (?, ?)', [postId, userId]);
    await db.query('UPDATE posts SET likes = likes + 1 WHERE id = ?', [postId]);

    res.json({ success: true, message: 'Đã thả tim bài viết' });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi thả tim bài viết' });
  }
};

// API kiểm tra xem người dùng đã like bài viết chưa
export const isPostLiked = async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const userId = req.user?.id;

    if (!userId) {
      return res.json({ success: true, isLiked: false });
    }

    const [likes] = await db.query('SELECT * FROM likes WHERE postId = ? AND userId = ?', [postId, userId]);
    
    res.json({ success: true, isLiked: likes.length > 0 });
  } catch (error) {
    console.error('Check like status error:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi kiểm tra trạng thái like' });
  }
};
