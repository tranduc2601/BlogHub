/**
 * Script Setup Admin - Tạo tài khoản admin với password cố định
 * Chạy script này NGAY SAU KHI setup database
 * 
 * Cách sử dụng:
 * 1. Chạy schema.sql trước: mysql -u root -p bloghub_db < schema.sql
 * 2. Chạy script này: node setup-admin.js
 * 
 * ⚠️ QUAN TRỌNG: Tất cả máy phải chạy script này để có cùng tài khoản admin
 */

import bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// ============================================
// THÔNG TIN ADMIN CHUNG CHO TẤT CẢ MÁY
// ============================================
const ADMIN_CREDENTIALS = {
  email: 'admin@bloghub.com',
  username: 'admin',
  password: 'admin123',  // Password gốc - sẽ được hash
  role: 'admin'
};

// Password hash cố định - được tạo sẵn từ 'admin123'
// Hash này sẽ GIỐNG NHAU trên mọi máy, đảm bảo đăng nhập thống nhất
// ⚠️ KHÔNG thay đổi hash này! Nếu cần đổi password, tạo hash mới và thay thế
const FIXED_PASSWORD_HASH = '$2b$10$vCq88XjAOphgIgpRpip08ugR3swTbP4mcVhIReldJ/W5Xkl7vNm/i';

const setupAdmin = async () => {
  let connection;
  
  try {
    console.log('🔄 Đang kết nối database...');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'bloghub_db'
    });

    console.log('✅ Đã kết nối database');

    // Kiểm tra xem admin đã tồn tại chưa
    const [existingUsers] = await connection.query(
      'SELECT * FROM users WHERE email = ?',
      [ADMIN_CREDENTIALS.email]
    );

    if (existingUsers.length > 0) {
      console.log('⚠️  Tài khoản admin đã tồn tại!');
      console.log('🔄 Đang cập nhật password để đảm bảo thống nhất...');
      
      // SỬ DỤNG HASH CỐ ĐỊNH - đảm bảo giống nhau trên mọi máy
      await connection.query(
        'UPDATE users SET password = ?, role = ?, username = ? WHERE email = ?',
        [FIXED_PASSWORD_HASH, ADMIN_CREDENTIALS.role, ADMIN_CREDENTIALS.username, ADMIN_CREDENTIALS.email]
      );
      
      console.log('✅ Đã cập nhật tài khoản admin thành công!');
    } else {
      console.log('📝 Đang tạo tài khoản admin mới...');
      
      // SỬ DỤNG HASH CỐ ĐỊNH - đảm bảo giống nhau trên mọi máy
      const [result] = await connection.query(
        'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
        [ADMIN_CREDENTIALS.username, ADMIN_CREDENTIALS.email, FIXED_PASSWORD_HASH, ADMIN_CREDENTIALS.role]
      );

      console.log('✅ Tạo tài khoản admin thành công!');
      console.log('🆔 Admin ID:', result.insertId);
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 THÔNG TIN ĐĂNG NHẬP ADMIN');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:    ', ADMIN_CREDENTIALS.email);
    console.log('👤 Username: ', ADMIN_CREDENTIALS.username);
    console.log('🔑 Password: ', ADMIN_CREDENTIALS.password);
    console.log('👑 Role:     ', ADMIN_CREDENTIALS.role);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🌐 Login:      http://localhost:5173/login');
    console.log('🛡️  Admin Panel: http://localhost:5173/admin');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('✅ Setup admin hoàn tất!');
    console.log('💡 Lưu ý: Tất cả máy trong team phải chạy script này sau khi setup database\n');

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Giải pháp:');
      console.log('1. Kiểm tra MySQL đã chạy chưa');
      console.log('2. Kiểm tra cấu hình trong file .env:');
      console.log('   - DB_HOST=' + (process.env.DB_HOST || 'localhost'));
      console.log('   - DB_USER=' + (process.env.DB_USER || 'root'));
      console.log('   - DB_PASSWORD=<your-password>');
      console.log('   - DB_NAME=' + (process.env.DB_NAME || 'bloghub_db'));
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('\n💡 Database chưa tồn tại!');
      console.log('Chạy lệnh: mysql -u root -p < schema.sql');
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Đã đóng kết nối database');
    }
  }
};

// Chạy script
setupAdmin();
