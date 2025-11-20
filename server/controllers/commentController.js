import db from '../config/database.js';
import { getFullAvatarUrl } from '../utils/urlHelper.js';
import { createNotification } from './notificationController.js';


export const getCommentsByPostId = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user?.id; 
    

    const [comments] = await db.query(
      `SELECT 
        c.id,
        c.postId,
        c.userId as authorId,
        c.content,
        c.createdAt,
        c.likes,
        c.parentId,
        c.status,
        u.id as userId,
        u.username,
        u.email,
        u.avatarUrl,
        u.role
      FROM comments c
      JOIN users u ON c.userId = u.id
      WHERE c.postId = ? AND c.status = 'visible'
      ORDER BY c.createdAt ASC`,
      [postId]
    );
    

    let likedCommentIds = [];
    let commentReactions = {};
    if (userId && comments.length > 0) {
      const commentIds = comments.map(c => c.id);
      

      const [reactions] = await db.query(
        'SELECT commentId, reactionType FROM comment_reactions WHERE userId = ? AND commentId IN (?)',
        [userId, commentIds]
      );
      
      reactions.forEach(r => {
        commentReactions[r.commentId] = r.reactionType;
        likedCommentIds.push(r.commentId);
      });
      

      if (likedCommentIds.length === 0) {
        try {
          const [likes] = await db.query(
            'SELECT commentId FROM comment_likes WHERE userId = ? AND commentId IN (?)',
            [userId, commentIds]
          );
          likedCommentIds = likes.map(like => like.commentId);
        } catch (err) {

        }
      }
    }
    

    const formattedComments = comments.map(comment => ({
      id: String(comment.id),
      postId: String(comment.postId),
      authorId: String(comment.authorId),
      author: {
        id: comment.userId,
        username: comment.username,
        email: comment.email,
        avatarUrl: getFullAvatarUrl(comment.avatarUrl),
        role: comment.role
      },
      content: comment.content,
      createdAt: comment.createdAt instanceof Date ? comment.createdAt.toISOString() : new Date(comment.createdAt).toISOString(),
      likes: comment.likes || 0,
      isLiked: likedCommentIds.includes(comment.id),
      reactionType: commentReactions[comment.id] || null,
      parentId: comment.parentId ? String(comment.parentId) : null
    }));
    
    res.json({
      success: true,
      comments: formattedComments,
      totalCount: formattedComments.length
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tải bình luận'
    });
  }
};


export const createComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, parentId } = req.body;
    const userId = req.user.id;
    

    
    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Nội dung bình luận không được để trống'
      });
    }
    

    const [posts] = await db.query('SELECT id FROM posts WHERE id = ?', [postId]);
    if (posts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Bài viết không tồn tại'
      });
    }
    

    if (parentId) {
      const [parentComments] = await db.query('SELECT id FROM comments WHERE id = ?', [parentId]);
      if (parentComments.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Bình luận cha không tồn tại'
        });
      }
    }
    

    const [result] = await db.query(
      'INSERT INTO comments (postId, userId, content, parentId, createdAt) VALUES (?, ?, ?, ?, NOW())',
      [postId, userId, content.trim(), parentId || null]
    );
    

    const [newComment] = await db.query(
      `SELECT 
        c.id,
        c.postId,
        c.userId as authorId,
        c.content,
        c.createdAt,
        c.likes,
        c.parentId,
        u.id as userId,
        u.username,
        u.email,
        u.avatarUrl,
        u.role
      FROM comments c
      JOIN users u ON c.userId = u.id
      WHERE c.id = ?`,
      [result.insertId]
    );
    
    if (newComment.length === 0) {
      throw new Error('Failed to retrieve created comment');
    }
    
    const comment = newComment[0];
    

    const formattedComment = {
      id: String(comment.id),
      postId: String(comment.postId),
      authorId: String(comment.authorId),
      author: {
        id: comment.userId,
        username: comment.username,
        email: comment.email,
        avatarUrl: getFullAvatarUrl(comment.avatarUrl),
        role: comment.role
      },
      content: comment.content,
      createdAt: comment.createdAt instanceof Date ? comment.createdAt.toISOString() : new Date(comment.createdAt).toISOString(),
      likes: comment.likes || 0,
      isLiked: false,
      parentId: comment.parentId ? String(comment.parentId) : null
    };
    
    // Create notification for post author
    try {
      const [post] = await db.query('SELECT authorId, title FROM posts WHERE id = ?', [postId]);
      if (post.length > 0) {
        const postAuthorId = post[0].authorId;
        const postTitle = post[0].title;
        await createNotification(
          postAuthorId,
          'comment',
          userId,
          `đã bình luận vào bài viết "${postTitle}"`,
          postId
        );
      }
    } catch (notifError) {
      console.error('Error creating comment notification:', notifError);
    }
    
    res.status(201).json(formattedComment);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tạo bình luận'
    });
  }
};


export const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
    
    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Nội dung bình luận không được để trống'
      });
    }
    

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
    
    if (comments[0].userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền chỉnh sửa bình luận này'
      });
    }
    

    await db.query(
      'UPDATE comments SET content = ? WHERE id = ?',
      [content.trim(), commentId]
    );
    
    res.json({
      success: true,
      message: 'Đã cập nhật bình luận'
    });
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể cập nhật bình luận'
    });
  }
};


export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;
    

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


export const likeComment = async (req, res) => {

  req.body.reactionType = 'like';
  return reactComment(req, res);
};


export const reactComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;
    const { reactionType } = req.body;


    const validReactions = ['like', 'love', 'haha', 'wow', 'sad', 'angry'];
    if (!reactionType || !validReactions.includes(reactionType)) {
      return res.status(400).json({ success: false, message: 'Loại biểu cảm không hợp lệ' });
    }
    

    const [comments] = await db.query('SELECT id FROM comments WHERE id = ?', [commentId]);
    if (comments.length === 0) {
      return res.status(404).json({ success: false, message: 'Bình luận không tồn tại' });
    }
    

    const [reactions] = await db.query(
      'SELECT * FROM comment_reactions WHERE commentId = ? AND userId = ?',
      [commentId, userId]
    );
    
    if (reactions.length > 0) {
      const currentReaction = reactions[0].reactionType;
      
      if (currentReaction === reactionType) {

        await db.query('DELETE FROM comment_reactions WHERE commentId = ? AND userId = ?', [commentId, userId]);
        

        await db.query(`UPDATE comments SET 
          reaction_${reactionType} = GREATEST(reaction_${reactionType} - 1, 0),
          total_reactions = GREATEST(total_reactions - 1, 0),
          likes = GREATEST(likes - 1, 0)
          WHERE id = ?`, [commentId]);
        
        return res.json({ success: true, message: 'Đã bỏ biểu cảm', action: 'unreact', reactionType: null });
      } else {

        await db.query(
          'UPDATE comment_reactions SET reactionType = ?, updatedAt = NOW() WHERE commentId = ? AND userId = ?',
          [reactionType, commentId, userId]
        );
        

        await db.query(`UPDATE comments SET 
          reaction_${currentReaction} = GREATEST(reaction_${currentReaction} - 1, 0),
          reaction_${reactionType} = reaction_${reactionType} + 1
          WHERE id = ?`, [commentId]);
        
        return res.json({ success: true, message: 'Đã thay đổi biểu cảm', action: 'change', reactionType });
      }
    } else {

      await db.query(
        'INSERT INTO comment_reactions (commentId, userId, reactionType) VALUES (?, ?, ?)',
        [commentId, userId, reactionType]
      );
      

      await db.query(`UPDATE comments SET 
        reaction_${reactionType} = reaction_${reactionType} + 1,
        total_reactions = total_reactions + 1,
        likes = likes + 1
        WHERE id = ?`, [commentId]);
      
      return res.json({ success: true, message: 'Đã thả biểu cảm', action: 'react', reactionType });
    }
  } catch (error) {
    console.error('Error reacting to comment:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi thả biểu cảm' });
  }
};


export const getUserCommentReaction = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.json({ success: true, reactionType: null });
    }

    const [reactions] = await db.query(
      'SELECT reactionType FROM comment_reactions WHERE commentId = ? AND userId = ?',
      [commentId, userId]
    );
    
    res.json({ 
      success: true, 
      reactionType: reactions.length > 0 ? reactions[0].reactionType : null 
    });
  } catch (error) {
    console.error('Get user comment reaction error:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi lấy thông tin biểu cảm' });
  }
};


export const getCommentReactions = async (req, res) => {
  try {
    const { commentId } = req.params;


    const [comments] = await db.query('SELECT id FROM comments WHERE id = ?', [commentId]);
    if (comments.length === 0) {
      return res.status(404).json({ success: false, message: 'Bình luận không tồn tại' });
    }


    const [reactions] = await db.query(
      `SELECT 
        cr.id,
        cr.reactionType,
        cr.createdAt,
        u.id as userId,
        u.username,
        u.avatarUrl
      FROM comment_reactions cr
      JOIN users u ON cr.userId = u.id
      WHERE cr.commentId = ?
      ORDER BY cr.createdAt DESC`,
      [commentId]
    );


    const reactionGroups = {
      like: [],
      love: [],
      haha: [],
      wow: [],
      sad: [],
      angry: []
    };

    reactions.forEach(r => {
      reactionGroups[r.reactionType].push({
        userId: r.userId,
        username: r.username,
        avatarUrl: getFullAvatarUrl(r.avatarUrl),
        createdAt: r.createdAt
      });
    });


    const counts = {
      like: reactionGroups.like.length,
      love: reactionGroups.love.length,
      haha: reactionGroups.haha.length,
      wow: reactionGroups.wow.length,
      sad: reactionGroups.sad.length,
      angry: reactionGroups.angry.length,
      total: reactions.length
    };

    res.json({ 
      success: true, 
      reactions: reactionGroups,
      counts 
    });
  } catch (error) {
    console.error('Get comment reactions error:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi lấy thông tin reactions' });
  }
};


export const getRepliesByCommentId = async (req, res) => {
  try {
    const { commentId } = req.params;
    
    const [replies] = await db.query(
      `SELECT 
        cr.id,
        cr.commentId,
        cr.userId,
        cr.content,
        cr.createdAt,
        u.username,
        u.email,
        u.avatarUrl
      FROM comment_replies cr
      JOIN users u ON cr.userId = u.id
      WHERE cr.commentId = ?
      ORDER BY cr.createdAt ASC`,
      [commentId]
    );
    
    const formattedReplies = replies.map(reply => ({
      id: String(reply.id),
      commentId: String(reply.commentId),
      userId: String(reply.userId),
      author: {
        id: reply.userId,
        username: reply.username,
        email: reply.email,
        avatarUrl: reply.avatarUrl
      },
      content: reply.content,
      createdAt: reply.createdAt
    }));
    
    res.json({
      success: true,
      replies: formattedReplies
    });
  } catch (error) {
    console.error('Error fetching replies:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tải phản hồi'
    });
  }
};


export const createReply = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
    
    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Nội dung phản hồi không được để trống'
      });
    }
    

    const [comments] = await db.query('SELECT id FROM comments WHERE id = ?', [commentId]);
    if (comments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Bình luận không tồn tại'
      });
    }
    

    const [result] = await db.query(
      'INSERT INTO comment_replies (commentId, userId, content, createdAt) VALUES (?, ?, ?, NOW())',
      [commentId, userId, content.trim()]
    );
    

    const [newReply] = await db.query(
      `SELECT 
        cr.id,
        cr.commentId,
        cr.userId,
        cr.content,
        cr.createdAt,
        u.username,
        u.email,
        u.avatarUrl
      FROM comment_replies cr
      JOIN users u ON cr.userId = u.id
      WHERE cr.id = ?`,
      [result.insertId]
    );
    
    const reply = newReply[0];
    
    const formattedReply = {
      id: String(reply.id),
      commentId: String(reply.commentId),
      userId: String(reply.userId),
      author: {
        id: reply.userId,
        username: reply.username,
        email: reply.email,
        avatarUrl: reply.avatarUrl
      },
      content: reply.content,
      createdAt: reply.createdAt
    };
    
    res.status(201).json(formattedReply);
  } catch (error) {
    console.error('Error creating reply:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tạo phản hồi'
    });
  }
};


export const deleteReply = async (req, res) => {
  try {
    const { replyId } = req.params;
    const userId = req.user.id;
    

    const [replies] = await db.query(
      'SELECT userId FROM comment_replies WHERE id = ?',
      [replyId]
    );
    
    if (replies.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Phản hồi không tồn tại'
      });
    }
    
    if (replies[0].userId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa phản hồi này'
      });
    }
    
    await db.query('DELETE FROM comment_replies WHERE id = ?', [replyId]);
    
    res.json({
      success: true,
      message: 'Đã xóa phản hồi'
    });
  } catch (error) {
    console.error('Error deleting reply:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể xóa phản hồi'
    });
  }
};

// Report a comment
export const reportComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { reason } = req.body;
    const reporterId = req.user.id;

    // Check if comment exists
    const [comments] = await db.query(
      'SELECT c.*, u.username as authorUsername FROM comments c JOIN users u ON c.userId = u.id WHERE c.id = ?',
      [commentId]
    );

    if (comments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Bình luận không tồn tại'
      });
    }

    const comment = comments[0];

    // Check if user is trying to report their own comment
    if (comment.userId === reporterId) {
      return res.status(400).json({
        success: false,
        message: 'Bạn không thể báo cáo bình luận của chính mình'
      });
    }

    // Check if user has already reported this comment
    const [existingReports] = await db.query(
      'SELECT id FROM comment_reports WHERE commentId = ? AND reporterId = ?',
      [commentId, reporterId]
    );

    if (existingReports.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Bạn đã báo cáo bình luận này rồi'
      });
    }

    // Create report
    await db.query(
      'INSERT INTO comment_reports (commentId, reporterId, reason) VALUES (?, ?, ?)',
      [commentId, reporterId, reason]
    );

    // Update report count
    await db.query(
      'UPDATE comments SET reportCount = reportCount + 1 WHERE id = ?',
      [commentId]
    );

    // Get all admins
    const [admins] = await db.query(
      "SELECT id FROM users WHERE role = 'admin'"
    );

    // Send notification to all admins
    const notificationPromises = admins.map(admin => 
      createNotification(
        admin.id,
        'comment_reported',
        reporterId,
        `Bình luận từ "${comment.authorUsername}" đã bị báo cáo vi phạm. Lý do: ${reason}`,
        comment.postId
      )
    );

    await Promise.all(notificationPromises);

    res.json({
      success: true,
      message: 'Đã gửi báo cáo thành công. Admin sẽ xem xét và phản hồi sớm.'
    });
  } catch (error) {
    console.error('Error reporting comment:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể gửi báo cáo'
    });
  }
};
