import db from '../config/database.js';
import { convertAvatarUrls } from '../utils/urlHelper.js';
import { createNotification } from './notificationController.js';


export const followUser = async (req, res) => {
  try {
    const followerId = req.user.id;
    const followingId = parseInt(req.params.userId);


    if (followerId === followingId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Bạn không thể theo dõi chính mình' 
      });
    }


    const [users] = await db.query('SELECT id FROM users WHERE id = ?', [followingId]);
    if (users.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Người dùng không tồn tại' 
      });
    }


    const [existing] = await db.query(
      'SELECT id FROM follows WHERE followerId = ? AND followingId = ?',
      [followerId, followingId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Bạn đã theo dõi người dùng này' 
      });
    }


    await db.query(
      'INSERT INTO follows (followerId, followingId) VALUES (?, ?)',
      [followerId, followingId]
    );

    // Create notification for the followed user
    try {
      const [follower] = await db.query('SELECT username FROM users WHERE id = ?', [followerId]);
      const followerName = follower.length > 0 ? follower[0].username : 'Ai đó';
      await createNotification(
        followingId,
        'follow',
        followerId,
        `đã bắt đầu theo dõi bạn`,
        null
      );
    } catch (notifError) {
      console.error('Error creating follow notification:', notifError);
    }

    res.json({ 
      success: true, 
      message: 'Đã theo dõi người dùng thành công' 
    });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi theo dõi người dùng' 
    });
  }
};


export const unfollowUser = async (req, res) => {
  try {
    const followerId = req.user.id;
    const followingId = parseInt(req.params.userId);


    const [result] = await db.query(
      'DELETE FROM follows WHERE followerId = ? AND followingId = ?',
      [followerId, followingId]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Bạn chưa theo dõi người dùng này' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Đã hủy theo dõi người dùng thành công' 
    });
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi hủy theo dõi người dùng' 
    });
  }
};


export const checkFollowStatus = async (req, res) => {
  try {
    const followerId = req.user?.id;
    const followingId = parseInt(req.params.userId);

    if (!followerId) {
      return res.json({ success: true, isFollowing: false });
    }

    const [follows] = await db.query(
      'SELECT id FROM follows WHERE followerId = ? AND followingId = ?',
      [followerId, followingId]
    );

    res.json({ 
      success: true, 
      isFollowing: follows.length > 0 
    });
  } catch (error) {
    console.error('Check follow status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi kiểm tra trạng thái theo dõi' 
    });
  }
};


export const getFollowers = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    const [followers] = await db.query(`
      SELECT 
        u.id,
        u.username as name,
        u.email,
        u.role,
        u.avatarUrl,
        u.createdAt as joinedAt,
        COUNT(DISTINCT p.id) as postsCount,
        COUNT(DISTINCT c.id) as commentsCount,
        COUNT(DISTINCT f2.followerId) as followersCount,
        COALESCE(SUM(p.likes), 0) as totalLikes
      FROM follows f
      JOIN users u ON f.followerId = u.id
      LEFT JOIN posts p ON u.id = p.authorId
      LEFT JOIN comments c ON u.id = c.userId
      LEFT JOIN follows f2 ON u.id = f2.followingId
      WHERE f.followingId = ? AND u.role != 'admin'
      GROUP BY u.id, u.username, u.email, u.role, u.avatarUrl, u.createdAt
      ORDER BY f.createdAt DESC
    `, [userId]);

    res.json({ 
      success: true, 
      users: convertAvatarUrls(followers)
    });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi lấy danh sách người theo dõi' 
    });
  }
};


export const getFollowing = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    const [following] = await db.query(`
      SELECT 
        u.id,
        u.username as name,
        u.email,
        u.role,
        u.avatarUrl,
        u.createdAt as joinedAt,
        COUNT(DISTINCT p.id) as postsCount,
        COUNT(DISTINCT c.id) as commentsCount,
        COUNT(DISTINCT f2.followerId) as followersCount,
        COALESCE(SUM(p.likes), 0) as totalLikes
      FROM follows f
      JOIN users u ON f.followingId = u.id
      LEFT JOIN posts p ON u.id = p.authorId
      LEFT JOIN comments c ON u.id = c.userId
      LEFT JOIN follows f2 ON u.id = f2.followingId
      WHERE f.followerId = ? AND u.role != 'admin'
      GROUP BY u.id, u.username, u.email, u.role, u.avatarUrl, u.createdAt
      ORDER BY f.createdAt DESC
    `, [userId]);

    res.json({ 
      success: true, 
      users: convertAvatarUrls(following)
    });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi lấy danh sách đang theo dõi' 
    });
  }
};


export const getFollowerCounts = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    const [followerCount] = await db.query(
      `SELECT COUNT(*) as count 
       FROM follows f 
       JOIN users u ON f.followerId = u.id 
       WHERE f.followingId = ? AND u.role != 'admin'`,
      [userId]
    );

    const [followingCount] = await db.query(
      `SELECT COUNT(*) as count 
       FROM follows f 
       JOIN users u ON f.followingId = u.id 
       WHERE f.followerId = ? AND u.role != 'admin'`,
      [userId]
    );

    res.json({ 
      success: true, 
      followers: followerCount[0].count,
      following: followingCount[0].count
    });
  } catch (error) {
    console.error('Get follower counts error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi lấy số lượng người theo dõi' 
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    const [users] = await db.query(`
      SELECT 
        u.id,
        u.username as name,
        u.email,
        u.avatarUrl,
        u.createdAt as joinedAt,
        COUNT(DISTINCT p.id) as postsCount,
        COUNT(DISTINCT c.id) as commentsCount,
        (SELECT COUNT(*) 
         FROM follows f 
         JOIN users follower ON f.followerId = follower.id 
         WHERE f.followingId = u.id AND follower.role != 'admin') as followersCount
      FROM users u
      LEFT JOIN posts p ON u.id = p.authorId
      LEFT JOIN comments c ON u.id = c.userId
      WHERE u.id = ?
      GROUP BY u.id
    `, [userId]);

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    const user = users[0];
    user.avatarUrl = user.avatarUrl ? `http://localhost:5000${user.avatarUrl}` : null;

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin người dùng'
    });
  }
};
