import db from '../config/database.js';

// Get comments by post ID
export const getCommentsByPostId = async (req, res) => {
  try {
    const { postId } = req.params;
    
    const [comments] = await db.query(
      `SELECT 
        c.id,
        c.postId,
        c.userId as authorId,
        c.content,
        c.createdAt,
        c.likes,
        u.id as userId,
        u.username,
        u.email,
        u.avatarUrl
      FROM comments c
      JOIN users u ON c.userId = u.id
      WHERE c.postId = ?
      ORDER BY c.createdAt DESC`,
      [postId]
    );
    
    // Transform to match frontend Comment interface
    const formattedComments = comments.map(comment => ({
      id: String(comment.id),
      postId: String(comment.postId),
      authorId: String(comment.authorId),
      author: {
        id: comment.userId,
        username: comment.username,
        email: comment.email,
        avatarUrl: comment.avatarUrl
      },
      content: comment.content,
      createdAt: comment.createdAt,
      likes: comment.likes || 0
    }));
    
    res.json({
      success: true,
      comments: formattedComments
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tải bình luận'
    });
  }
};

// Create new comment
export const createComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
    
    console.log('=== Creating comment ===');
    console.log('Post ID:', postId);
    console.log('User ID:', userId);
    console.log('Content:', content);
    
    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Nội dung bình luận không được để trống'
      });
    }
    
    // Check if post exists
    const [posts] = await db.query('SELECT id FROM posts WHERE id = ?', [postId]);
    if (posts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Bài viết không tồn tại'
      });
    }
    
    // Insert comment
    const [result] = await db.query(
      'INSERT INTO comments (postId, userId, content, createdAt, likes) VALUES (?, ?, ?, NOW(), 0)',
      [postId, userId, content.trim()]
    );
    
    // Get the created comment with user info
    const [newComment] = await db.query(
      `SELECT 
        c.id,
        c.postId,
        c.userId as authorId,
        c.content,
        c.createdAt,
        c.likes,
        u.id as userId,
        u.username,
        u.email,
        u.avatarUrl
      FROM comments c
      JOIN users u ON c.userId = u.id
      WHERE c.id = ?`,
      [result.insertId]
    );
    
    if (newComment.length === 0) {
      throw new Error('Failed to retrieve created comment');
    }
    
    const comment = newComment[0];
    
    // Format response
    const formattedComment = {
      id: String(comment.id),
      postId: String(comment.postId),
      authorId: String(comment.authorId),
      author: {
        id: comment.userId,
        username: comment.username,
        email: comment.email,
        avatarUrl: comment.avatarUrl
      },
      content: comment.content,
      createdAt: comment.createdAt,
      likes: comment.likes || 0
    };
    
    console.log('Comment created successfully:', formattedComment);
    
    res.status(201).json(formattedComment);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tạo bình luận'
    });
  }
};

// Like a comment
export const likeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    
    const [result] = await db.query(
      'UPDATE comments SET likes = likes + 1 WHERE id = ?',
      [commentId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Bình luận không tồn tại'
      });
    }
    
    res.json({
      success: true,
      message: 'Đã thích bình luận'
    });
  } catch (error) {
    console.error('Error liking comment:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể thích bình luận'
    });
  }
};

// Delete a comment
export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;
    
    // Check if comment belongs to user
    const [comments] = await db.query(
      'SELECT userId FROM comments WHERE id = ?',
      [commentId]
    );
    
    if (comments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Bình luận không tồn tại'
      });
    }
    
    if (comments[0].userId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa bình luận này'
      });
    }
    
    await db.query('DELETE FROM comments WHERE id = ?', [commentId]);
    
    res.json({
      success: true,
      message: 'Đã xóa bình luận'
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể xóa bình luận'
    });
  }
};
