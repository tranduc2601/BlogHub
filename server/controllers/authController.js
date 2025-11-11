import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../config/database.js';

// Register new user
export const register = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;
    console.log('Register - req.body:', req.body);

    // Validation
    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ 
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin' 
      });
    }

    // Check password match
    if (password !== confirmPassword) {
      return res.status(400).json({ 
        success: false,
        message: 'Mật khẩu không khớp' 
      });
    }

    // Check password length
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: 'Mật khẩu phải có ít nhất 6 ký tự' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        message: 'Email không hợp lệ' 
      });
    }

    // Check if user exists
    const [existingUsers] = await db.query(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [email, username]
    );
    console.log('Register - existingUsers:', existingUsers);

    if (existingUsers.length > 0) {
      const existingUser = existingUsers[0];
      console.log('Register - existingUser:', existingUser);
      
      // Check if account is locked
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

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('Register - hashedPassword:', hashedPassword);

    // Insert new user
    const [result] = await db.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );
    console.log('Register - Insert result:', result);

    // Generate JWT token
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
        role: 'user'
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

// Login user
export const login = async (req, res) => {
  try {
  const { email, password } = req.body;
  console.log('Login - req.body:', req.body);

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Vui lòng nhập email và mật khẩu' 
      });
    }

    // Check if user exists
    const [users] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    console.log('Login - users from DB:', users);

    if (users.length === 0) {
      console.log('Login - Không tìm thấy user với email:', email);
      return res.status(401).json({ 
        success: false,
        message: 'Email hoặc mật khẩu không đúng' 
      });
    }

    const user = users[0];
    console.log('Login - user:', user);

    // Check if account is locked
    if (user.status === 'locked') {
      console.log('Login - Tài khoản bị khóa:', email);
      return res.status(403).json({ 
        success: false,
        message: 'Email đã bị khóa',
        locked: true
      });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Login - isPasswordValid:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('Login - Mật khẩu không đúng cho email:', email);
      return res.status(401).json({ 
        success: false,
        message: 'Email hoặc mật khẩu không đúng' 
      });
    }

    // Generate JWT token
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

    res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
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

// Get current user info
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

    res.status(200).json({
      success: true,
      user: users[0]
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server, vui lòng thử lại sau' 
    });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, about } = req.body;
    
    console.log('UpdateProfile - userId:', userId);
    console.log('UpdateProfile - body:', req.body);
    console.log('UpdateProfile - file:', req.file);
    
    // Lấy websites từ form-data
    const websites = Object.keys(req.body)
      .filter(k => k.startsWith('websites['))
      .map(k => req.body[k]);
    
    console.log('UpdateProfile - websites:', websites);
    
    // Lấy avatarUrl hiện tại
    const [currentUser] = await db.query(
      'SELECT avatarUrl FROM users WHERE id = ?',
      [userId]
    );
    
    console.log('UpdateProfile - currentUser:', currentUser);
    
    let avatarUrl = currentUser[0]?.avatarUrl || null;
    
    // Nếu có file mới được upload
    if (req.file) {
      avatarUrl = `/uploads/${req.file.filename}`;
    }
    
    // Cập nhật vào database
    await db.query(
      'UPDATE users SET username = ?, about = ?, avatarUrl = ?, websites = ? WHERE id = ?',
      [username, about, avatarUrl, JSON.stringify(websites), userId]
    );
    
    // Trả về user đã cập nhật
    const [users] = await db.query(
      'SELECT id, username, email, role, about, avatarUrl, websites FROM users WHERE id = ?',
      [userId]
    );
    
    res.json({ 
      success: true, 
      user: users[0] 
    });
  } catch (error) {
    console.error('UpdateProfile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server khi cập nhật hồ sơ' 
    });
  }
};
