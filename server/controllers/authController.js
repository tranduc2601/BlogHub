import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../config/database.js';
import cloudinary from '../config/cloudinary.js';
import { Readable } from 'stream';

export const register = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ 
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin!' 
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ 
        success: false,
        message: 'Mật khẩu không khớp!' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: 'Mật khẩu phải có ít nhất 6 ký tự!' 
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        message: 'Email không hợp lệ!' 
      });
    }

    const [existingUsers] = await db.query(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existingUsers.length > 0) {
      const existingUser = existingUsers[0];
      

      if (existingUser.email === email && existingUser.status === 'locked') {
        return res.status(403).json({ 
          success: false,
          message: 'Email đã bị khóa!',
          locked: true
        });
      }
      
      if (existingUser.email === email) {
        return res.status(409).json({ 
          success: false,
          message: 'Email đã được đăng ký!' 
        });
      }
      if (existingUser.username === username) {
        return res.status(409).json({ 
          success: false,
          message: 'Tên người dùng đã tồn tại!' 
        });
      }
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const [result] = await db.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );

    const token = jwt.sign(
      { 
        id: result.insertId, 
        username, 
        email,
        role: 'user' 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    const deviceInfo = req.headers['user-agent'] || 'Unknown Device';
    const ipAddress = req.ip || req.connection.remoteAddress;
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    const expiresInMs = expiresIn.includes('d') 
      ? parseInt(expiresIn) * 24 * 60 * 60 * 1000 
      : (expiresIn.includes('h') ? parseInt(expiresIn) * 60 * 60 * 1000 : parseInt(expiresIn) * 1000);
    const expiresAt = new Date(Date.now() + expiresInMs);

    await db.query(
      'INSERT INTO user_sessions (userId, sessionToken, deviceInfo, ipAddress, expiresAt) VALUES (?, ?, ?, ?, ?)',
      [result.insertId, token, deviceInfo, ipAddress, expiresAt]
    );

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công!',
      token,
      user: {
        id: result.insertId,
        username,
        email,
        role: 'user',
        avatarUrl: null
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server, vui lòng thử lại sau!' 
    });
  }
};


export const login = async (req, res) => {
  try {
  const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Vui lòng nhập email và mật khẩu!' 
      });
    }

    const [users] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ 
        success: false,
        message: 'Email hoặc mật khẩu không đúng!' 
      });
    }

    const user = users[0];

    if (user.status === 'locked') {
      return res.status(403).json({ 
        success: false,
        message: 'Bạn đã bị khóa tài khoản!',
        locked: true
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false,
        message: 'Email hoặc mật khẩu không đúng!' 
      });
    }

    await db.query(
      'DELETE FROM user_sessions WHERE userId = ?',
      [user.id]
    );

    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    const deviceInfo = req.headers['user-agent'] || 'Unknown Device';
    const ipAddress = req.ip || req.connection.remoteAddress;
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    const expiresInMs = expiresIn.includes('d') 
      ? parseInt(expiresIn) * 24 * 60 * 60 * 1000 
      : (expiresIn.includes('h') ? parseInt(expiresIn) * 60 * 60 * 1000 : parseInt(expiresIn) * 1000);
    const expiresAt = new Date(Date.now() + expiresInMs);

    await db.query(
      'INSERT INTO user_sessions (userId, sessionToken, deviceInfo, ipAddress, expiresAt) VALUES (?, ?, ?, ?, ?)',
      [user.id, token, deviceInfo, ipAddress, expiresAt]
    );

    res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công!',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        about: user.about,
        websites: user.websites ? (typeof user.websites === 'string' ? JSON.parse(user.websites) : user.websites) : [],
        warningCount: user.warningCount || 0
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server, vui lòng thử lại sau!' 
    });
  }
};


export const getMe = async (req, res) => {
  try {
    const userId = req.user.id;

    const [users] = await db.query(
      'SELECT id, username, email, role, createdAt, about, avatarUrl, websites FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Người dùng không tồn tại!' 
      });
    }


    const user = users[0];
    if (user.websites && typeof user.websites === 'string') {
      try {
        user.websites = JSON.parse(user.websites);
      } catch (e) {
        user.websites = [];
      }
    }


    res.status(200).json({
      success: true,
      user: user
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server, vui lòng thử lại sau!' 
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, email, about, password } = req.body;

    if (email) {

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ 
          success: false,
          message: 'Email không hợp lệ!' 
        });
      }
      
      const [existingEmail] = await db.query(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, userId]
      );
      
      if (existingEmail.length > 0) {
        return res.status(409).json({ 
          success: false,
          message: 'Email này đã được sử dụng bởi tài khoản khác!' 
        });
      }
    }
    
    const websites = Object.keys(req.body)
      .filter(k => k.startsWith('websites['))
      .map(k => req.body[k]);
    
    const [currentUsers] = await db.query(
      'SELECT password, avatarUrl FROM users WHERE id = ?',
      [userId]
    );
    
    const currentUser = currentUsers[0];
    let avatarUrl = currentUser?.avatarUrl || null;

    if (password && password.trim().length > 0) {

      if (password.length < 6) {
        return res.status(400).json({ 
          success: false,
          message: 'Mật khẩu phải có ít nhất 6 ký tự!' 
        });
      }
      
      const hasUpperCase = /[A-Z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
      
      if (!hasUpperCase || !hasNumber || !hasSpecialChar) {
        return res.status(400).json({ 
          success: false,
          message: 'Mật khẩu phải có ít nhất 1 ký tự hoa, 1 chữ số và 1 ký tự đặc biệt!' 
        });
      }
      
      if (currentUser && currentUser.password) {
        const isSamePassword = await bcrypt.compare(password, currentUser.password);
        if (isSamePassword) {
          return res.status(400).json({ 
            success: false,
            message: 'Mật khẩu mới không được trùng với mật khẩu hiện tại!' 
          });
        }
      }
    }
    
    if (req.file) {
      try {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'bloghub/avatars',
            resource_type: 'image',
            transformation: [
              { width: 400, height: 400, crop: 'fill', gravity: 'face' }
            ]
          },
          async (error, result) => {
            if (error) {
              console.error('Cloudinary upload error:', error);
              return res.status(500).json({
                success: false,
                message: 'Lỗi khi upload hình ảnh!'
              });
            }     
            avatarUrl = result.secure_url;        
            await updateDatabase();
          }
        );

        const bufferStream = Readable.from(req.file.buffer);
        bufferStream.pipe(uploadStream);
        
        return;
      } catch (uploadError) {
        console.error('Upload error:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Lỗi khi upload hình ảnh!'
        });
      }
    }
    
    await updateDatabase();
    async function updateDatabase() {
      try {

        if (password && password.trim().length > 0) {
          const hashedPassword = await bcrypt.hash(password, 10);
          await db.query(
            'UPDATE users SET username = ?, email = ?, about = ?, avatarUrl = ?, websites = ?, password = ? WHERE id = ?',
            [username, email, about, avatarUrl, JSON.stringify(websites), hashedPassword, userId]
          );
        } else {

          const result = await db.query(
            'UPDATE users SET username = ?, email = ?, about = ?, avatarUrl = ?, websites = ? WHERE id = ?',
            [username, email, about, avatarUrl, JSON.stringify(websites), userId]
          );
        }
        
        const [users] = await db.query(
          'SELECT id, username, email, role, about, avatarUrl, websites FROM users WHERE id = ?',
          [userId]
        );
        
        const updatedUser = users[0];
        if (updatedUser.websites && typeof updatedUser.websites === 'string') {
          try {
            updatedUser.websites = JSON.parse(updatedUser.websites);
          } catch (e) {
            updatedUser.websites = [];
          }
        }
        
        res.json({ 
          success: true, 
          user: updatedUser 
        });
      } catch (dbError) {
        console.error('Database update error:', dbError);
        res.status(500).json({ 
          success: false, 
          message: 'Lỗi server khi cập nhật hồ sơ!' 
        });
      }
    }
  } catch (error) {
    console.error('UpdateProfile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server khi cập nhật hồ sơ!' 
    });
  }
};


export const verifyCurrentPassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword } = req.body;

    if (!currentPassword) {
      return res.status(400).json({ 
        success: false,
        message: 'Vui lòng nhập mật khẩu hiện tại!' 
      });
    }

    const [users] = await db.query(
      'SELECT password FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Người dùng không tồn tại!' 
      });
    }

    const user = users[0];
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    
    res.json({ 
      success: true,
      isValid: isPasswordValid
    });
  } catch (error) {
    console.error('VerifyCurrentPassword error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server khi xác thực mật khẩu!' 
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ 
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin!' 
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ 
        success: false,
        message: 'Mật khẩu xác nhận không khớp!' 
      });
    }


    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: 'Mật khẩu phải có ít nhất 6 ký tự!' 
      });
    }

    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
    
    if (!hasUpperCase || !hasNumber || !hasSpecialChar) {
      return res.status(400).json({ 
        success: false,
        message: 'Mật khẩu phải có ít nhất 1 ký tự hoa, 1 chữ số và 1 ký tự đặc biệt!' 
      });
    }


    const [users] = await db.query(
      'SELECT password FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Người dùng không tồn tại!' 
      });
    }

    const user = users[0];


    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false,
        message: 'Mật khẩu hiện tại không đúng!' 
      });
    }


    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ 
        success: false,
        message: 'Mật khẩu mới không được trùng với mật khẩu hiện tại!' 
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, userId]
    );

    res.json({ 
      success: true,
      message: 'Đổi mật khẩu thành công!' 
    });
  } catch (error) {
    console.error('ChangePassword error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server khi đổi mật khẩu!' 
    });
  }
};

export const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const userId = req.user?.id;

    if (!token || !userId) {
      return res.status(400).json({ 
        success: false,
        message: 'Token không hợp lệ!' 
      });
    }

    await db.query(
      'DELETE FROM user_sessions WHERE userId = ? AND sessionToken = ?',
      [userId, token]
    );

    res.status(200).json({
      success: true,
      message: 'Đăng xuất thành công!'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server khi đăng xuất!' 
    });
  }
};

export const deleteAccount = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    const userId = req.user.id;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ 
        success: false,
        message: 'Vui lòng nhập mật khẩu để xác nhận!' 
      });
    }

    await connection.beginTransaction();

    const [users] = await connection.query(
      'SELECT * FROM users WHERE id = ? AND (status = "active" OR status IS NULL)',
      [userId]
    );

    if (users.length === 0) {
      await connection.rollback();
      return res.status(404).json({ 
        success: false,
        message: 'Tài khoản không tồn tại hoặc đã bị xóa!' 
      });
    }

    const user = users[0];

    if (user.role === 'admin') {
      await connection.rollback();
      return res.status(403).json({ 
        success: false,
        message: 'Tài khoản quản trị viên không thể bị xóa!' 
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      await connection.rollback();
      return res.status(401).json({ 
        success: false,
        message: 'Mật khẩu không đúng!' 
      });
    }

    const deletedEmail = `deleted_${userId}_${user.email}`;
    const deletedUsername = `deleted_user_${userId}`;
    
    await connection.query(
      `UPDATE users 
       SET status = 'deleted',
           email = ?,
           username = ?,
           password = '',
           avatarUrl = NULL,
           about = NULL,
           websites = NULL,
           deletedAt = NOW()
       WHERE id = ?`,
      [deletedEmail, deletedUsername, userId]
    );

    await connection.query(
      'DELETE FROM user_sessions WHERE userId = ?',
      [userId]
    );

    await connection.query(
      'UPDATE posts SET status = "hidden" WHERE authorId = ?',
      [userId]
    );

    await connection.query(
      `UPDATE comments 
       SET userId = NULL, 
           isAnonymous = TRUE 
       WHERE userId = ?`,
      [userId]
    );

    await connection.query(
      'DELETE FROM reactions WHERE userId = ?',
      [userId]
    );

    await connection.query(
      'DELETE FROM comment_reactions WHERE userId = ?',
      [userId]
    );

    await connection.query(
      'DELETE FROM bookmarks WHERE userId = ?',
      [userId]
    );

    await connection.query(
      'DELETE FROM follows WHERE followerId = ? OR followingId = ?',
      [userId, userId]
    );

    await connection.query(
      'DELETE FROM notifications WHERE userId = ? OR senderId = ?',
      [userId, userId]
    );

    try {
      await connection.query(
        'DELETE FROM comment_reports WHERE reporterId = ?',
        [userId]
      );
    } catch (error) {

      if (error.code !== 'ER_NO_SUCH_TABLE') {
        throw error;
      }
    }

    await connection.commit();

    res.json({ 
      success: true,
      message: 'Tài khoản đã được xóa thành công!' 
    });
  } catch (error) {

    await connection.rollback();
    console.error('DeleteAccount error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server khi xóa tài khoản!' 
    });
  } finally {
    connection.release();
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false,
        message: 'Vui lòng nhập email!' 
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        message: 'Email không hợp lệ!' 
      });
    }

    const [users] = await db.query(
      'SELECT id, email, status FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Email không tồn tại trong hệ thống!' 
      });
    }

    const user = users[0];


    if (user.status === 'locked') {
      return res.status(403).json({ 
        success: false,
        message: 'Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên!' 
      });
    }

    if (user.status === 'deleted') {
      return res.status(403).json({ 
        success: false,
        message: 'Tài khoản đã bị xóa!' 
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db.query(`
      CREATE TABLE IF NOT EXISTS password_resets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        email VARCHAR(255) NOT NULL,
        otp VARCHAR(6) NOT NULL,
        expiresAt DATETIME NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await db.query(
      'DELETE FROM password_resets WHERE email = ?',
      [email]
    );

    await db.query(
      'INSERT INTO password_resets (userId, email, otp, expiresAt) VALUES (?, ?, ?, ?)',
      [user.id, email, otp, expiresAt]
    );

    res.json({ 
      success: true,
      message: 'Mã OTP đã được gửi đến email của bạn!',
      otp: otp
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server khi xử lý yêu cầu!' 
    });
  }
};


export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ 
        success: false,
        message: 'Vui lòng nhập đầy đủ thông tin!' 
      });
    }


    const [resets] = await db.query(
      'SELECT * FROM password_resets WHERE email = ? AND otp = ? AND used = FALSE ORDER BY createdAt DESC LIMIT 1',
      [email, otp]
    );

    if (resets.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Mã OTP không đúng hoặc đã được sử dụng!' 
      });
    }

    const reset = resets[0];


    if (new Date() > new Date(reset.expiresAt)) {
      return res.status(400).json({ 
        success: false,
        message: 'Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới!' 
      });
    }

    res.json({ 
      success: true,
      message: 'Xác thực OTP thành công!' 
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server khi xác thực OTP!' 
    });
  }
};


export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ 
        success: false,
        message: 'Vui lòng nhập đầy đủ thông tin!' 
      });
    }


    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: 'Mật khẩu phải có ít nhất 6 ký tự!' 
      });
    }

    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
    
    if (!hasUpperCase || !hasNumber || !hasSpecialChar) {
      return res.status(400).json({ 
        success: false,
        message: 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 số và 1 ký tự đặc biệt!' 
      });
    }


    const [resets] = await db.query(
      'SELECT * FROM password_resets WHERE email = ? AND otp = ? AND used = FALSE ORDER BY createdAt DESC LIMIT 1',
      [email, otp]
    );

    if (resets.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Mã OTP không đúng hoặc đã được sử dụng!' 
      });
    }

    const reset = resets[0];


    if (new Date() > new Date(reset.expiresAt)) {
      return res.status(400).json({ 
        success: false,
        message: 'Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới!' 
      });
    }


    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);


    await db.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, reset.userId]
    );


    await db.query(
      'UPDATE password_resets SET used = TRUE WHERE id = ?',
      [reset.id]
    );


    await db.query(
      'DELETE FROM user_sessions WHERE userId = ?',
      [reset.userId]
    );

    res.json({ 
      success: true,
      message: 'Đổi mật khẩu thành công. Vui lòng đăng nhập lại!' 
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server khi đặt lại mật khẩu!' 
    });
  }
};
