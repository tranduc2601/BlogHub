import jwt from 'jsonwebtoken';
import db from '../config/database.js';


export const authMiddleware = async (req, res, next) => {
  try {

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        message: 'Không có token xác thực' 
      });
    }

    const token = authHeader.substring(7); 


    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    

    const [users] = await db.query(
      'SELECT id, username, email, role, status FROM users WHERE id = ?',
      [decoded.id]
    );

    if (users.length === 0) {
      return res.status(401).json({ 
        success: false,
        message: 'Tài khoản không tồn tại!',
        accountLocked: true
      });
    }

    const user = users[0];


    if (user.status === 'locked') {
      return res.status(403).json({ 
        success: false,
        message: 'Tài khoản của bạn đã bị khóa bởi quản trị viên!',
        accountLocked: true
      });
    }

    // Check if session exists and is valid
    const [sessions] = await db.query(
      'SELECT * FROM user_sessions WHERE userId = ? AND sessionToken = ? AND expiresAt > NOW()',
      [user.id, token]
    );

    if (sessions.length === 0) {
      return res.status(401).json({ 
        success: false,
        message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại!',
        sessionExpired: true
      });
    }
    

    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status
    };

    next();

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Token đã hết hạn, vui lòng đăng nhập lại!' 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: 'Token không hợp lệ!' 
      });
    }

    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi xác thực!' 
    });
  }
};


export const adminMiddleware = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Chưa xác thực' 
      });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Không có quyền truy cập. Chỉ Admin mới được phép!' 
      });
    }

    next();

  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi xác thực quyền!' 
    });
  }
};


export const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {
          id: decoded.id,
          username: decoded.username,
          email: decoded.email,
          role: decoded.role
        };
      } catch (error) {

        req.user = null;
      }
    }

    next();

  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next();
  }
};
