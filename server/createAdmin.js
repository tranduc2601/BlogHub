/**
 * Script tạo tài khoản Admin
 * Chạy: node createAdmin.js
 */

import bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const createAdminUser = async () => {
  let connection;
  
  try {
    console.log('🔄 Đang kết nối database...');
    
    // Tạo kết nối
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'bloghub_db'
    });

    console.log('✅ Đã kết nối database');

    // Thông tin admin
    const adminEmail = 'admin@bloghub.com';
    const adminUsername = 'admin';
    const adminPassword = 'duy1tran!?';

    // Kiểm tra xem admin đã tồn tại chưa
    const [existingUsers] = await connection.query(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [adminEmail, adminUsername]
    );

    if (existingUsers.length > 0) {
      console.log('⚠️  Tài khoản admin đã tồn tại!');
      console.log('📧 Email:', adminEmail);
      console.log('👤 Username:', adminUsername);
      
      // Cập nhật mật khẩu
      const updatePassword = process.argv.includes('--update-password');
      
      if (updatePassword) {
        console.log('🔄 Đang cập nhật mật khẩu...');
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        
        await connection.query(
          'UPDATE users SET password = ?, role = ? WHERE email = ?',
          [hashedPassword, 'admin', adminEmail]
        );
        
        console.log('✅ Đã cập nhật mật khẩu và role thành công!');
      } else {
        console.log('💡 Để cập nhật mật khẩu, chạy: node createAdmin.js --update-password');
      }
      
      return;
    }

    // Hash password
    console.log('🔐 Đang hash password...');
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Tạo admin user
    console.log('📝 Đang tạo tài khoản admin...');
    const [result] = await connection.query(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [adminUsername, adminEmail, hashedPassword, 'admin']
    );

    console.log('\n✅ Tạo tài khoản admin thành công!\n');
    console.log('📋 Thông tin đăng nhập:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:    ', adminEmail);
    console.log('🔑 Password: ', adminPassword);
    console.log('👑 Role:     ', 'admin');
    console.log('🆔 ID:       ', result.insertId);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🌐 Đăng nhập tại: http://localhost:5173/login');
    console.log('🛡️  Admin Panel: http://localhost:5173/admin\n');

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Giải pháp:');
      console.log('1. Kiểm tra MySQL đã chạy chưa');
      console.log('2. Kiểm tra cấu hình trong file .env:');
      console.log('   - DB_HOST');
      console.log('   - DB_USER');
      console.log('   - DB_PASSWORD');
      console.log('   - DB_NAME');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Đã đóng kết nối database');
    }
  }
};

// Chạy script
createAdminUser();
