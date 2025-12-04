import db from '../config/database.js';
import { getFullAvatarUrl } from '../utils/urlHelper.js';
import { createNotification } from './notificationController.js';


export const deletePost = async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const userId = req.user?.id;


    const [posts] = await db.query('SELECT * FROM posts WHERE id = ?', [postId]);
    if (posts.length === 0) {
      return res.status(404).json({ success: false, message: 'Bài viết không tồn tại' });
    }
    const post = posts[0];
    if (post.authorId !== userId) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền xoá bài viết này!' });
    }

    await db.query('DELETE FROM posts WHERE id = ?', [postId]);
    res.json({ success: true, message: 'Đã xoá bài viết thành công!' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi xoá bài viết!' });
  }
};


export const getPosts = async (req, res) => {
  try {
    const { authorId } = req.query;
    const currentUserId = req.user?.id;
    
    let query = `
      SELECT 
        p.id,
        p.title,
        p.content,
        p.likes,
        COALESCE(p.views, 0) as views,
        p.status,
        p.privacy,
        p.createdAt,
        p.authorId,
        p.category,
        p.tags,
        u.username as author,
        u.avatarUrl as authorAvatar,
        (COUNT(DISTINCT c.id) + COALESCE((
          SELECT COUNT(*) 
          FROM comment_replies cr 
          JOIN comments c2 ON cr.commentId = c2.id 
          WHERE c2.postId = p.id
        ), 0)) as comments
      FROM posts p
      LEFT JOIN users u ON p.authorId = u.id
      LEFT JOIN comments c ON p.id = c.postId
    `;
    
    const params = [];
    


    if (authorId) {
      const authorIdInt = parseInt(authorId);
      query += ' WHERE p.authorId = ?';
      params.push(authorIdInt);
      
      

      if (currentUserId && currentUserId !== authorIdInt) {
        query += ' AND p.status = "visible"';
        query += ' AND (p.privacy = "public"';

        query += ' OR (p.privacy = "followers" AND EXISTS (SELECT 1 FROM follows WHERE followerId = ? AND followingId = ?))';
        params.push(currentUserId, authorIdInt);
        query += ')';
      } else if (!currentUserId) {

        query += ' AND p.status = "visible"';
        query += ' AND p.privacy = "public"';
      } else {

      }

    } else {
      query += ' WHERE p.status = "visible"';
      

      if (currentUserId) {
        query += ' AND (p.privacy = "public" OR p.authorId = ?';
        params.push(currentUserId);

        query += ' OR (p.privacy = "followers" AND EXISTS (SELECT 1 FROM follows WHERE followerId = ? AND followingId = p.authorId))';
        params.push(currentUserId);
        query += ')';
      } else {

        query += ' AND p.privacy = "public"';
      }
    }
    
    query += ' GROUP BY p.id ORDER BY p.createdAt DESC';
    
    const [posts] = await db.query(query, params);

    res.json({ 
      success: true, 
      posts: posts.map(p => {

        let tags = [];
        try {
          tags = p.tags ? JSON.parse(p.tags) : [];
        } catch (e) {
          tags = [];
        }
        

        const wordCount = p.content ? p.content.split(/\s+/).length : 0;
        const readTime = Math.ceil(wordCount / 200);
        
        return {
          ...p,
          authorAvatar: getFullAvatarUrl(p.authorAvatar),
          tags,
          readTime,
          comments: parseInt(p.comments) || 0,
          createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : new Date(p.createdAt).toISOString()
        };
      })
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi lấy danh sách bài viết!' 
    });
  }
};


export const getPostById = async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const userId = req.user?.id; 
    

    const [posts] = await db.query(`
      SELECT 
        p.id,
        p.title,
        p.content,
        p.likes,
        COALESCE(p.views, 0) as views,
        p.status,
        p.privacy,
        p.createdAt,
        p.category,
        p.tags,
        u.id as authorId,
        u.username as author,
        u.avatarUrl as authorAvatar
      FROM posts p
      LEFT JOIN users u ON p.authorId = u.id
      WHERE p.id = ?
    `, [postId]);

    if (posts.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Bài viết không tồn tại!' 
      });
    }

    const post = posts[0];


    const isAuthor = userId && post.authorId === userId;
    const isAdmin = req.user?.role === 'admin';
    const isVisible = post.status === 'visible';

    if (!isVisible && !isAuthor && !isAdmin) {
      return res.status(404).json({ 
        success: false, 
        message: 'Bài viết không tồn tại hoặc đã bị ẩn!' 
      });
    }


    if (post.privacy === 'private' && !isAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Bài viết này là riêng tư!'
      });
    }

    if (post.privacy === 'followers' && !isAuthor && !isAdmin) {

      if (!userId) {
        return res.status(403).json({
          success: false,
          message: 'Chỉ người theo dõi mới có thể xem bài viết này!'
        });
      }

      const [followCheck] = await db.query(
        'SELECT 1 FROM follows WHERE followerId = ? AND followingId = ?',
        [userId, post.authorId]
      );

      if (followCheck.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'Chỉ người theo dõi mới có thể xem bài viết này!'
        });
      }
    }


    let tags = [];
    try {
      tags = post.tags ? JSON.parse(post.tags) : [];
    } catch (e) {
      tags = [];
    }
    

    const wordCount = post.content ? post.content.split(/\s+/).length : 0;
    const readTime = Math.ceil(wordCount / 200);

    res.json({ 
      success: true, 
      post: {
        ...post,
        authorAvatar: getFullAvatarUrl(post.authorAvatar),
        tags,
        readTime,
        createdAt: post.createdAt instanceof Date ? post.createdAt.toISOString() : new Date(post.createdAt).toISOString()
      }
    });
  } catch (error) {
    console.error('Get post by ID error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi lấy bài viết!' 
    });
  }
};


export const createPost = async (req, res) => {
  const { title, category, tags, content, privacy } = req.body;
  
  try {

    const authorId = req.user?.id;
    const userRole = req.user?.role;
    
    if (!authorId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Vui lòng đăng nhập để đăng bài viết!' 
      });
    }


    const tagsJson = tags ? JSON.stringify(tags) : null;
    const postPrivacy = privacy || 'public';
    

    const postStatus = userRole === 'admin' ? 'visible' : 'pending';
    

    const [result] = await db.query(
      'INSERT INTO posts (title, content, authorId, status, likes, category, tags, privacy) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [title, content, authorId, postStatus, 0, category, tagsJson, postPrivacy]
    );

    const [newPost] = await db.query(
      'SELECT p.*, u.username as author FROM posts p LEFT JOIN users u ON p.authorId = u.id WHERE p.id = ?',
      [result.insertId]
    );

    const message = userRole === 'admin' 
      ? 'Bài viết đã được đăng thành công!' 
      : 'Bài viết đã được gửi và đang chờ admin duyệt!';


    if (postStatus === 'pending') {
      try {
        const [admins] = await db.query('SELECT id FROM users WHERE role = "admin"');
        for (const admin of admins) {
          await createNotification(
            admin.id,
            'post_approved',
            authorId,
            `đã tạo bài viết "${title}" cần duyệt!`,
            result.insertId
          );
        }
      } catch (notifError) {
        console.error('Error creating admin notification:', notifError);
      }
    }

    res.json({ 
      success: true, 
      message: message,
      post: newPost[0]
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi đăng bài viết!' 
    });
  }
};


export const reportPost = async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const { reason } = req.body;
    const reportedBy = req.user?.id;

    if (!reportedBy) {
      return res.status(401).json({ 
        success: false, 
        message: 'Vui lòng đăng nhập để báo cáo bài viết!' 
      });
    }

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Vui lòng nhập lý do báo cáo!' 
      });
    }


    const [posts] = await db.query('SELECT * FROM posts WHERE id = ?', [postId]);
    if (posts.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Bài viết không tồn tại!' 
      });
    }


    const [existingReports] = await db.query(
      'SELECT * FROM reports WHERE postId = ? AND reportedBy = ? AND status = "pending"',
      [postId, reportedBy]
    );

    if (existingReports.length > 0) {
      return res.status(409).json({ 
        success: false, 
        message: 'Bạn đã báo cáo bài viết này rồi!' 
      });
    }


    const [insertResult] = await db.query(
      'INSERT INTO reports (postId, reportedBy, reason) VALUES (?, ?, ?)',
      [postId, reportedBy, reason]
    );


    try {
      const [postInfo] = await db.query('SELECT title FROM posts WHERE id = ?', [postId]);
      const postTitle = postInfo.length > 0 ? postInfo[0].title : 'một bài viết';
      
      const [admins] = await db.query('SELECT id FROM users WHERE role = "admin"');
      for (const admin of admins) {
        await createNotification(
          admin.id,
          'post_reported',
          reportedBy,
          `đã báo cáo bài viết "${postTitle}" cần xử lý!`,
          postId
        );
      }
    } catch (notifError) {
      console.error('Error creating admin notification:', notifError);
    }

    res.json({ 
      success: true, 
      message: 'Đã gửi báo cáo bài viết thành công. Admin sẽ xem xét trong thời gian sớm nhất!' 
    });
  } catch (error) {
    console.error('Report post error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi gửi báo cáo!' 
    });
  }
};


export const reactPost = async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const userId = req.user?.id;
    const { reactionType } = req.body; 

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập để thả cảm xúc!' });
    }


    const validReactions = ['like', 'love', 'haha', 'wow', 'sad', 'angry'];
    if (!reactionType || !validReactions.includes(reactionType)) {
      return res.status(400).json({ success: false, message: 'Loại cảm xúc không hợp lệ!' });
    }


    const [posts] = await db.query('SELECT * FROM posts WHERE id = ?', [postId]);
    if (posts.length === 0) {
      return res.status(404).json({ success: false, message: 'Bài viết không tồn tại!' });
    }


    const [reactions] = await db.query('SELECT * FROM reactions WHERE postId = ? AND userId = ?', [postId, userId]);
    
    if (reactions.length > 0) {
      const currentReaction = reactions[0].reactionType;
      
      if (currentReaction === reactionType) {

        await db.query('DELETE FROM reactions WHERE postId = ? AND userId = ?', [postId, userId]);
        

        await db.query(`UPDATE posts SET 
          reaction_${reactionType} = GREATEST(reaction_${reactionType} - 1, 0),
          total_reactions = GREATEST(total_reactions - 1, 0),
          likes = GREATEST(likes - 1, 0)
          WHERE id = ?`, [postId]);
        
        return res.json({ success: true, message: 'Đã bỏ cảm xúc!', action: 'unreact', reactionType: null });
      } else {

        await db.query('UPDATE reactions SET reactionType = ?, updatedAt = NOW() WHERE postId = ? AND userId = ?', 
          [reactionType, postId, userId]);
        

        await db.query(`UPDATE posts SET 
          reaction_${currentReaction} = GREATEST(reaction_${currentReaction} - 1, 0),
          reaction_${reactionType} = reaction_${reactionType} + 1
          WHERE id = ?`, [postId]);
        
        return res.json({ success: true, message: 'Đã thay đổi cảm xúc!', action: 'change', reactionType });
      }
    } else {

      await db.query('INSERT INTO reactions (postId, userId, reactionType) VALUES (?, ?, ?)', 
        [postId, userId, reactionType]);
      

      await db.query(`UPDATE posts SET 
        reaction_${reactionType} = reaction_${reactionType} + 1,
        total_reactions = total_reactions + 1,
        likes = likes + 1
        WHERE id = ?`, [postId]);
      

      try {
        const post = posts[0];
        const reactionEmojis = {
          like: '👍',
          love: '❤️',
          haha: '😂',
          wow: '😮',
          sad: '😢',
          angry: '😠'
        };
        const emoji = reactionEmojis[reactionType] || '👍';
        await createNotification(
          post.authorId,
          'reaction',
          userId,
          `đã thả ${emoji} vào bài viết "${post.title}"`,
          postId
        );
      } catch (notifError) {
        console.error('Error creating reaction notification:', notifError);
      }
      
      return res.json({ success: true, message: 'Đã thả cảm xúc!', action: 'react', reactionType });
    }
  } catch (error) {
    console.error('React post error:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi thả cảm xúc!' });
  }
};


export const getUserReaction = async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const userId = req.user?.id;

    if (!userId) {
      return res.json({ success: true, reactionType: null });
    }

    const [reactions] = await db.query('SELECT reactionType FROM reactions WHERE postId = ? AND userId = ?', 
      [postId, userId]);
    
    res.json({ 
      success: true, 
      reactionType: reactions.length > 0 ? reactions[0].reactionType : null 
    });
  } catch (error) {
    console.error('Get user reaction error:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi lấy thông tin cảm xúc!' });
  }
};


export const getReactionStats = async (req, res) => {
  try {
    const postId = parseInt(req.params.id);

    const [stats] = await db.query(`
      SELECT 
        reaction_like as \`like\`,
        reaction_love as love,
        reaction_haha as haha,
        reaction_wow as wow,
        reaction_sad as sad,
        reaction_angry as angry,
        total_reactions as total
      FROM posts 
      WHERE id = ?`, [postId]);

    if (stats.length === 0) {
      return res.status(404).json({ success: false, message: 'Bài viết không tồn tại!' });
    }

    res.json({ success: true, counts: stats[0] });
  } catch (error) {
    console.error('Get reaction stats error:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi lấy thống kê cảm xúc!' });
  }
};

export const getReactionUsers = async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const { reactionType } = req.query;

    let query = `
      SELECT 
        u.id,
        u.username,
        u.username as fullName,
        u.avatarUrl as avatar,
        r.reactionType
      FROM reactions r
      JOIN users u ON r.userId = u.id
      WHERE r.postId = ?
    `;
    
    const params = [postId];

    if (reactionType && reactionType !== 'all') {
      query += ' AND r.reactionType = ?';
      params.push(reactionType);
    }

    query += ' ORDER BY r.createdAt DESC';

    const [users] = await db.query(query, params);


    const [counts] = await db.query(`
      SELECT 
        SUM(CASE WHEN reactionType = 'like' THEN 1 ELSE 0 END) as \`like\`,
        SUM(CASE WHEN reactionType = 'love' THEN 1 ELSE 0 END) as love,
        SUM(CASE WHEN reactionType = 'haha' THEN 1 ELSE 0 END) as haha,
        SUM(CASE WHEN reactionType = 'wow' THEN 1 ELSE 0 END) as wow,
        SUM(CASE WHEN reactionType = 'sad' THEN 1 ELSE 0 END) as sad,
        SUM(CASE WHEN reactionType = 'angry' THEN 1 ELSE 0 END) as angry
      FROM reactions
      WHERE postId = ?
    `, [postId]);

    const reactionCounts = counts[0] || {};

    res.json({ 
      success: true, 
      users: users.map(user => ({
        ...user,
        avatar: getFullAvatarUrl(user.avatar)
      })),
      counts: reactionCounts
    });
  } catch (error) {
    console.error('Get reaction users error:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi lấy danh sách người dùng!' });
  }
};


export const likePost = async (req, res) => {

  req.body.reactionType = 'like';
  return reactPost(req, res);
};


export const isPostLiked = async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const userId = req.user?.id;

    if (!userId) {
      return res.json({ success: true, isLiked: false, reactionType: null });
    }

    const [reactions] = await db.query('SELECT reactionType FROM reactions WHERE postId = ? AND userId = ?', 
      [postId, userId]);
    
    res.json({ 
      success: true, 
      isLiked: reactions.length > 0,
      reactionType: reactions.length > 0 ? reactions[0].reactionType : null
    });
  } catch (error) {
    console.error('Check like status error:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi kiểm tra trạng thái like!' });
  }
};


export const updatePost = async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const userId = req.user?.id;
    const { title, content, category, tags, privacy } = req.body;


    const [posts] = await db.query('SELECT * FROM posts WHERE id = ?', [postId]);
    if (posts.length === 0) {
      return res.status(404).json({ success: false, message: 'Bài viết không tồn tại!' });
    }

    const post = posts[0];
    if (post.authorId !== userId) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền chỉnh sửa bài viết này!' });
    }


    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Tiêu đề và nội dung không được để trống!' });
    }


    const tagsJson = Array.isArray(tags) ? JSON.stringify(tags) : tags;
    const postPrivacy = privacy || post.privacy || 'public';
    await db.query(
      'UPDATE posts SET title = ?, content = ?, category = ?, tags = ?, privacy = ?, updatedAt = NOW() WHERE id = ?',
      [title, content, category, tagsJson, postPrivacy, postId]
    );


    const [updatedPosts] = await db.query(`
      SELECT 
        p.id,
        p.title,
        p.content,
        p.likes,
        p.status,
        p.createdAt,
        p.updatedAt,
        p.authorId,
        p.category,
        p.tags,
        u.username as author,
        u.avatarUrl as authorAvatar
      FROM posts p
      LEFT JOIN users u ON p.authorId = u.id
      WHERE p.id = ?
    `, [postId]);

    res.json({ 
      success: true, 
      message: 'Cập nhật bài viết thành công!',
      post: updatedPosts[0]
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi cập nhật bài viết!' });
  }
};


export const trackPostView = async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const userId = req.user?.id || null; 
    const sessionId = req.body.sessionId || null; 
    

    const [posts] = await db.query('SELECT id, authorId FROM posts WHERE id = ?', [postId]);
    if (posts.length === 0) {
      return res.status(404).json({ success: false, message: 'Bài viết không tồn tại!' });
    }
    
    const post = posts[0];
    

    if (userId && post.authorId === userId) {
      return res.json({ success: true, message: 'Không tính lượt xem của tác giả!' });
    }
    

    let checkQuery = 'SELECT id FROM post_views WHERE postId = ? AND viewedAt > DATE_SUB(NOW(), INTERVAL 1 MINUTE)';
    const checkParams = [postId];
    
    if (userId) {
      checkQuery += ' AND userId = ?';
      checkParams.push(userId);
    } else if (sessionId) {
      checkQuery += ' AND sessionId = ?';
      checkParams.push(sessionId);
    } else {

      checkQuery += ' AND userId IS NULL AND sessionId IS NULL';
    }
    
    const [existingViews] = await db.query(checkQuery, checkParams);
    
    if (existingViews.length > 0) {
      return res.json({ success: true, message: 'Đã tính lượt xem trong 1 phút qua!' });
    }
    

    await db.query(
      'INSERT INTO post_views (postId, userId, sessionId) VALUES (?, ?, ?)',
      [postId, userId, sessionId]
    );
    

    await db.query(
      'UPDATE posts SET views = (SELECT COUNT(*) FROM post_views WHERE postId = ?) WHERE id = ?',
      [postId, postId]
    );
    
    res.json({ success: true, message: 'Đã ghi nhận lượt xem!' });
  } catch (error) {
    console.error('Track view error:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi ghi nhận lượt xem!' });
  }
};


export const pinComment = async (req, res) => {
  try {
    const postId = parseInt(req.params.postId);
    const { commentId } = req.body;
    const userId = req.user?.id;


    const [posts] = await db.query('SELECT * FROM posts WHERE id = ?', [postId]);
    if (posts.length === 0) {
      return res.status(404).json({ success: false, message: 'Bài viết không tồn tại!' });
    }

    const post = posts[0];


    if (post.authorId !== userId) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền ghim bình luận!' });
    }


    const [comments] = await db.query(
      'SELECT * FROM comments WHERE id = ? AND postId = ? AND parentId IS NULL',
      [commentId, postId]
    );

    if (comments.length === 0) {
      return res.status(404).json({ success: false, message: 'Bình luận không tồn tại hoặc không phải bình luận gốc!' });
    }


    await db.query('UPDATE posts SET pinnedCommentId = ? WHERE id = ?', [commentId, postId]);

    res.json({ success: true, message: 'Đã ghim bình luận thành công!', pinnedCommentId: commentId });
  } catch (error) {
    console.error('Pin comment error:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi ghim bình luận!' });
  }
};


export const unpinComment = async (req, res) => {
  try {
    const postId = parseInt(req.params.postId);
    const userId = req.user?.id;


    const [posts] = await db.query('SELECT * FROM posts WHERE id = ?', [postId]);
    if (posts.length === 0) {
      return res.status(404).json({ success: false, message: 'Bài viết không tồn tại!' });
    }

    const post = posts[0];


    if (post.authorId !== userId) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền gỡ ghim bình luận!' });
    }


    await db.query('UPDATE posts SET pinnedCommentId = NULL WHERE id = ?', [postId]);

    res.json({ success: true, message: 'Đã gỡ ghim bình luận thành công!' });
  } catch (error) {
    console.error('Unpin comment error:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi gỡ ghim bình luận!' });
  }
};


export const getPinnedComment = async (req, res) => {
  try {
    const postId = parseInt(req.params.postId);


    const [posts] = await db.query('SELECT pinnedCommentId FROM posts WHERE id = ?', [postId]);
    
    if (posts.length === 0) {
      return res.status(404).json({ success: false, message: 'Bài viết không tồn tại!' });
    }

    const pinnedCommentId = posts[0].pinnedCommentId;

    res.json({ success: true, pinnedCommentId });
  } catch (error) {
    console.error('Get pinned comment error:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi lấy thông tin bình luận ghim!' });
  }
};


export const sharePost = async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const { recipientId } = req.body;
    const senderId = req.user.id;


    const [posts] = await db.query('SELECT * FROM posts WHERE id = ?', [postId]);
    if (posts.length === 0) {
      return res.status(404).json({ success: false, message: 'Bài viết không tồn tại!' });
    }


    const [recipients] = await db.query('SELECT id FROM users WHERE id = ?', [recipientId]);
    if (recipients.length === 0) {
      return res.status(404).json({ success: false, message: 'Người dùng không tồn tại!' });
    }


    if (senderId === recipientId) {
      return res.status(400).json({ success: false, message: 'Không thể chia sẻ cho chính mình!' });
    }

    const post = posts[0];
    

    const [senders] = await db.query('SELECT username FROM users WHERE id = ?', [senderId]);
    const senderName = senders[0]?.username || 'Ai đó';


    const message = `${senderName} đã chia sẻ bài viết "${post.title}" với bạn!`;
    await createNotification(recipientId, 'share', senderId, message, postId);

    res.json({ 
      success: true, 
      message: 'Đã chia sẻ bài viết thành công!' 
    });
  } catch (error) {
    console.error('Share post error:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi chia sẻ bài viết!' });
  }
};
