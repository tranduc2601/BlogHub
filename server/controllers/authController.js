import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../config/database.js';
import cloudinary from '../config/cloudinary.js';
import { Readable } from 'stream';


export const register = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;
    console.log('Register - req.body:', req.body);


    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ 
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin' 
      });
    }


    if (password !== confirmPassword) {
      return res.status(400).json({ 
        success: false,
        message: 'Mật khẩu không khớp' 
      });
    }


    if (password.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: 'Mật khẩu phải có ít nhất 6 ký tự' 
      });
    }


    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        message: 'Email không hợp lệ' 
      });
    }


    const [existingUsers] = await db.query(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [email, username]
    );
    console.log('Register - existingUsers:', existingUsers);

    if (existingUsers.length > 0) {
      const existingUser = existingUsers[0];
      console.log('Register - existingUser:', existingUser);
      

      if (existingUser.email === email && existingUser.status === 'locked') {
        console.log('Register - Email đã bị khóa:', email);
        return res.status(403).json({ 
          success: false,
          message: 'Email đã bị khóa',
          locked: true
        });
      }
      
      if (existingUser.email === email) {
        console.log('Register - Email đã được đăng ký:', email);
        return res.status(409).json({ 
          success: false,
          message: 'Email đã được đăng ký' 
        });
      }
      if (existingUser.username === username) {
        console.log('Register - Tên người dùng đã tồn tại:', username);
        return res.status(409).json({ 
          success: false,
          message: 'Tên người dùng đã tồn tại' 
        });
      }
    }


    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('Register - hashedPassword:', hashedPassword);


    const [result] = await db.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );
    console.log('Register - Insert result:', result);


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
    console.log('Register - JWT token:', token);

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
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
      message: 'Lỗi server, vui lòng thử lại sau' 
    });
  }
};


export const login = async (req, res) => {
  try {
  const { email, password } = req.body;
  console.log('Login - req.body:', req.body);


    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Vui lòng nhập email và mật khẩu' 
      });
    }


    const [users] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    console.log('Login - users from DB:', users);

    if (users.length === 0) {
      console.log('Login - Không tìm thấy user với email:', email);
      return res.status(401).json({ 
        success: false,
        message: 'Email hoặc mật khẩu không đúng!' 
      });
    }

    const user = users[0];
    console.log('Login - user:', user);


    if (user.status === 'locked') {
      console.log('Login - Tài khoản bị khóa:', email);
      return res.status(403).json({ 
        success: false,
        message: 'Bạn đã bị khóa tài khoản!',
        locked: true
      });
    }


    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Login - isPasswordValid:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('Login - Mật khẩu không đúng cho email:', email);
      return res.status(401).json({ 
        success: false,
        message: 'Email hoặc mật khẩu không đúng!' 
      });
    }

    // Delete all existing sessions for this user (force logout from other devices)
    await db.query(
      'DELETE FROM user_sessions WHERE userId = ?',
      [user.id]
    );

    console.log('Login - Cleared all existing sessions for userId:', user.id);


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

    // Store session in database
    const deviceInfo = req.headers['user-agent'] || 'Unknown Device';
    const ipAddress = req.ip || req.connection.remoteAddress;
    const expiresIn = process.env.JWT_EXPIRES_IN || '24h';
    const expiresInMs = expiresIn.includes('h') ? parseInt(expiresIn) * 60 * 60 * 1000 : parseInt(expiresIn) * 1000;
    const expiresAt = new Date(Date.now() + expiresInMs);

    await db.query(
      'INSERT INTO user_sessions (userId, sessionToken, deviceInfo, ipAddress, expiresAt) VALUES (?, ?, ?, ?, ?)',
      [user.id, token, deviceInfo, ipAddress, expiresAt]
    );

    console.log('Login - Session created for userId:', user.id);

    res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
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
      message: 'Lỗi server, vui lòng thử lại sau' 
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
        message: 'Người dùng không tồn tại' 
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
      message: 'Lỗi server, vui lòng thử lại sau' 
    });
  }
};


export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, email, about, password } = req.body;
    
    console.log('UpdateProfile - userId:', userId);
    console.log('UpdateProfile - body:', req.body);
    console.log('UpdateProfile - file:', req.file);
    

    if (email) {

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ 
          success: false,
          message: 'Email không hợp lệ' 
        });
      }
      

      const [existingEmail] = await db.query(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, userId]
      );
      
      if (existingEmail.length > 0) {
        return res.status(409).json({ 
          success: false,
          message: 'Email đã được sử dụng bởi tài khoản khác' 
        });
      }
    }
    

    const websites = Object.keys(req.body)
      .filter(k => k.startsWith('websites['))
      .map(k => req.body[k]);
    
    console.log('UpdateProfile - websites:', websites);
    

    const [currentUsers] = await db.query(
      'SELECT password, avatarUrl FROM users WHERE id = ?',
      [userId]
    );
    
    console.log('UpdateProfile - currentUser:', currentUsers);
    
    const currentUser = currentUsers[0];
    let avatarUrl = currentUser?.avatarUrl || null;
    

    if (password && password.trim().length > 0) {

      if (password.length < 6) {
        return res.status(400).json({ 
          success: false,
          message: 'Mật khẩu phải có ít nhất 6 ký tự' 
        });
      }
      

      const hasUpperCase = /[A-Z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
      
      if (!hasUpperCase || !hasNumber || !hasSpecialChar) {
        return res.status(400).json({ 
          success: false,
          message: 'Mật khẩu phải có ít nhất 1 ký tự hoa, 1 chữ số và 1 ký tự đặc biệt' 
        });
      }
      

      if (currentUser && currentUser.password) {
        const isSamePassword = await bcrypt.compare(password, currentUser.password);
        if (isSamePassword) {
          return res.status(400).json({ 
            success: false,
            message: 'Mật khẩu mới không được trùng với mật khẩu hiện tại' 
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
                message: 'Lỗi khi upload ảnh'
              });
            }
            
            avatarUrl = result.secure_url;
            console.log('UpdateProfile - Cloudinary URL:', avatarUrl);
            

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
          message: 'Lỗi khi upload ảnh'
        });
      }
    }
    

    await updateDatabase();
    

    async function updateDatabase() {
      try {

        if (password && password.trim().length > 0) {
          const hashedPassword = await bcrypt.hash(password, 10);
          console.log('UpdateProfile - Updating with password. SQL params:', [username, email, about, avatarUrl, JSON.stringify(websites), userId]);
          await db.query(
            'UPDATE users SET username = ?, email = ?, about = ?, avatarUrl = ?, websites = ?, password = ? WHERE id = ?',
            [username, email, about, avatarUrl, JSON.stringify(websites), hashedPassword, userId]
          );
          console.log('UpdateProfile - Password updated');
        } else {

          console.log('UpdateProfile - Updating without password. SQL params:', [username, email, about, avatarUrl, JSON.stringify(websites), userId]);
          const result = await db.query(
            'UPDATE users SET username = ?, email = ?, about = ?, avatarUrl = ?, websites = ? WHERE id = ?',
            [username, email, about, avatarUrl, JSON.stringify(websites), userId]
          );
          console.log('UpdateProfile - Update result:', result);
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


        
        console.log('UpdateProfile - Returning user:', updatedUser);
        
        res.json({ 
          success: true, 
          user: updatedUser 
        });
      } catch (dbError) {
        console.error('Database update error:', dbError);
        res.status(500).json({ 
          success: false, 
          message: 'Lỗi server khi cập nhật hồ sơ' 
        });
      }
    }
  } catch (error) {
    console.error('UpdateProfile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server khi cập nhật hồ sơ' 
    });
  }
};

// Verify current password only
export const verifyCurrentPassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword } = req.body;

    if (!currentPassword) {
      return res.status(400).json({ 
        success: false,
        message: 'Vui lòng nhập mật khẩu hiện tại' 
      });
    }

    // Get current user password
    const [users] = await db.query(
      'SELECT password FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Người dùng không tồn tại' 
      });
    }

    const user = users[0];

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    
    res.json({ 
      success: true,
      isValid: isPasswordValid
    });
  } catch (error) {
    console.error('VerifyCurrentPassword error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server khi xác thực mật khẩu' 
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;
    
    console.log('ChangePassword - userId:', userId);

    // Validate input
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ 
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin' 
      });
    }

    // Check if new password matches confirm password
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ 
        success: false,
        message: 'Mật khẩu xác nhận không khớp' 
      });
    }

    // Validate new password strength
    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: 'Mật khẩu phải có ít nhất 6 ký tự' 
      });
    }

    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
    
    if (!hasUpperCase || !hasNumber || !hasSpecialChar) {
      return res.status(400).json({ 
        success: false,
        message: 'Mật khẩu phải có ít nhất 1 ký tự hoa, 1 chữ số và 1 ký tự đặc biệt' 
      });
    }

    // Get current user password
    const [users] = await db.query(
      'SELECT password FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Người dùng không tồn tại' 
      });
    }

    const user = users[0];

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false,
        message: 'Mật khẩu hiện tại không đúng' 
      });
    }

    // Check if new password is same as current password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ 
        success: false,
        message: 'Mật khẩu mới không được trùng với mật khẩu hiện tại' 
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in database
    await db.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, userId]
    );

    console.log('ChangePassword - Password updated successfully for userId:', userId);

    res.json({ 
      success: true,
      message: 'Đổi mật khẩu thành công' 
    });
  } catch (error) {
    console.error('ChangePassword error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server khi đổi mật khẩu' 
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
        message: 'Token không hợp lệ' 
      });
    }

    // Delete session from database
    await db.query(
      'DELETE FROM user_sessions WHERE userId = ? AND sessionToken = ?',
      [userId, token]
    );

    console.log('Logout - Session deleted for userId:', userId);

    res.status(200).json({
      success: true,
      message: 'Đăng xuất thành công'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server khi đăng xuất' 
    });
  }
};
