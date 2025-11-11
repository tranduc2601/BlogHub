import { Router } from 'express';
import db from '../config/database.js';

const router = Router();

// Get all users (public endpoint) - for UsersPage
router.get('/', async (req, res) => {
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
      LEFT JOIN posts p ON u.id = p.authorId AND p.status = 'visible'
      LEFT JOIN comments c ON u.id = c.userId AND c.status = 'visible'
      WHERE (u.status = 'active' OR u.status IS NULL) AND u.role != 'admin'
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
});

// Get user by ID (public endpoint)
router.get('/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

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
      LEFT JOIN posts p ON u.id = p.authorId AND p.status = 'visible'
      LEFT JOIN comments c ON u.id = c.userId AND c.status = 'visible'
      WHERE u.id = ? AND (u.status = 'active' OR u.status IS NULL)
      GROUP BY u.id, u.username, u.email, u.role, u.status, u.createdAt
    `, [userId]);

    if (users.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Người dùng không tồn tại' 
      });
    }

    res.json({ success: true, user: users[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi lấy thông tin người dùng' 
    });
  }
});

export default router;
