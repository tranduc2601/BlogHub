import { Router } from 'express';
import db from '../config/database.js';
import { followUser, unfollowUser, checkFollowStatus, getFollowers, getFollowing, getFollowerCounts } from '../controllers/userController.js';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', async (req, res) => {
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
        (SELECT COUNT(*) 
         FROM follows f 
         JOIN users follower ON f.followerId = follower.id 
         WHERE f.followingId = u.id AND follower.role != 'admin') as followersCount,
        COALESCE((SELECT SUM(likes) FROM posts WHERE authorId = u.id), 0) as totalLikes,
        DATE_FORMAT(u.createdAt, '%Y-%m-%d') as joinedAt
      FROM users u
      LEFT JOIN posts p ON u.id = p.authorId AND p.status = 'visible'
      LEFT JOIN comments c ON u.id = c.userId AND c.status = 'visible'
      WHERE (u.status = 'active' OR u.status IS NULL) AND u.role != 'admin'
      GROUP BY u.id, u.username, u.email, u.role, u.avatarUrl, u.status, u.createdAt
      ORDER BY u.createdAt DESC
    `);

    res.json({ success: true, users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi lấy danh sách người dùng!' 
    });
  }
});

// Specific routes must come before parameterized routes
router.post('/:userId/follow', authMiddleware, followUser);
router.delete('/:userId/follow', authMiddleware, unfollowUser);
router.get('/:userId/follow-status', optionalAuthMiddleware, checkFollowStatus);
router.get('/:userId/followers', getFollowers);
router.get('/:userId/following', getFollowing);
router.get('/:userId/follower-counts', getFollowerCounts);

// Generic :id route comes last to avoid conflicts
router.get('/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

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
        (SELECT COUNT(*) 
         FROM follows f 
         JOIN users follower ON f.followerId = follower.id 
         WHERE f.followingId = u.id AND follower.role != 'admin') as followersCount,
        DATE_FORMAT(u.createdAt, '%Y-%m-%d') as joinedAt
      FROM users u
      LEFT JOIN posts p ON u.id = p.authorId AND p.status = 'visible'
      LEFT JOIN comments c ON u.id = c.userId AND c.status = 'visible'
      WHERE u.id = ? AND (u.status = 'active' OR u.status IS NULL)
      GROUP BY u.id, u.username, u.email, u.role, u.avatarUrl, u.status, u.createdAt
    `, [userId]);

    if (users.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Người dùng không tồn tại!' 
      });
    }

    res.json({ success: true, user: users[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi lấy thông tin người dùng!' 
    });
  }
});

export default router;
