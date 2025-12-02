import db from '../config/database.js';


export const getBookmarks = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const offset = (page - 1) * limit;


    const [bookmarks] = await db.query(
      `SELECT 
        b.id as bookmarkId,
        b.createdAt as bookmarkedAt,
        p.id,
        p.title,
        p.content,
        p.category,
        p.tags,
        p.views,
        p.privacy,
        p.status,
        p.createdAt,
        p.updatedAt,
        p.authorId,
        p.total_reactions as totalReactions,
        u.username as author,
        u.avatarUrl as authorAvatar,
        (SELECT COUNT(*) FROM comments WHERE postId = p.id AND status = 'visible') as commentCount
      FROM bookmarks b
      INNER JOIN posts p ON b.postId = p.id
      INNER JOIN users u ON p.authorId = u.id
      WHERE b.userId = ? AND p.status = 'visible'
      ORDER BY b.createdAt DESC
      LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );


    const [countResult] = await db.query(
      `SELECT COUNT(*) as total 
       FROM bookmarks b
       INNER JOIN posts p ON b.postId = p.id
       WHERE b.userId = ? AND p.status = 'visible'`,
      [userId]
    );

    const total = countResult[0].total;


    const formattedBookmarks = bookmarks.map(post => ({
      ...post,
      tags: post.tags ? (typeof post.tags === 'string' ? JSON.parse(post.tags) : post.tags) : []
    }));

    res.json({
      success: true,
      bookmarks: formattedBookmarks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tải danh sách bài viết đã lưu!'
    });
  }
};


export const addBookmark = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.body;

    if (!postId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu postId!'
      });
    }


    const [posts] = await db.query(
      'SELECT id, status FROM posts WHERE id = ?',
      [postId]
    );

    if (posts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Bài viết không tồn tại!'
      });
    }


    const [existing] = await db.query(
      'SELECT id FROM bookmarks WHERE userId = ? AND postId = ?',
      [userId, postId]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Bạn đã lưu bài viết này rồi!'
      });
    }


    await db.query(
      'INSERT INTO bookmarks (userId, postId) VALUES (?, ?)',
      [userId, postId]
    );

    res.json({
      success: true,
      message: 'Đã lưu bài viết!'
    });
  } catch (error) {
    console.error('Error adding bookmark:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể lưu bài viết!'
    });
  }
};


export const removeBookmark = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.params;

    if (!postId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu postId!'
      });
    }


    const [result] = await db.query(
      'DELETE FROM bookmarks WHERE userId = ? AND postId = ?',
      [userId, postId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Bookmark không tồn tại!'
      });
    }

    res.json({
      success: true,
      message: 'Đã xóa bài viết khỏi danh sách lưu!'
    });
  } catch (error) {
    console.error('Error removing bookmark:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể xóa bookmark!'
    });
  }
};


export const checkBookmark = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.params;

    const [bookmarks] = await db.query(
      'SELECT id FROM bookmarks WHERE userId = ? AND postId = ?',
      [userId, postId]
    );

    res.json({
      success: true,
      isBookmarked: bookmarks.length > 0
    });
  } catch (error) {
    console.error('Error checking bookmark:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể kiểm tra bookmark!'
    });
  }
};
