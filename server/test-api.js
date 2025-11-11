/**
 * Test Script - Kiểm tra kết nối API và Database
 * Chạy: node server/test-api.js
 */

import { testConnection } from './config/database.js';

console.log('\n' + '='.repeat(60));
console.log('🧪 KIỂM TRA KẾT NỐI API & DATABASE');
console.log('='.repeat(60) + '\n');

async function runTests() {
  try {
    // Test 1: Database Connection
    console.log('📊 Test 1: Kết nối MySQL Database...');
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('❌ FAIL: Không kết nối được database');
      console.log('\n💡 Hướng dẫn khắc phục:');
      console.log('   1. Kiểm tra MySQL có đang chạy không');
      console.log('   2. Kiểm tra file .env có đúng thông tin không');
      console.log('   3. Chạy: mysql -u root -p < schema.sql\n');
      process.exit(1);
    }
    
    console.log('✅ PASS: Kết nối database thành công\n');
    
    // Test 2: Check if tables exist
    console.log('📊 Test 2: Kiểm tra bảng trong database...');
    const db = (await import('./config/database.js')).default;
    
    const tables = ['users', 'posts', 'comments', 'reports'];
    for (const table of tables) {
      try {
        const [rows] = await db.query(`SELECT COUNT(*) as count FROM ${table}`);
        const count = rows[0].count;
        console.log(`   ✅ Bảng '${table}': ${count} records`);
      } catch (err) {
        console.log(`   ❌ Bảng '${table}': Không tồn tại hoặc lỗi`);
        console.error(`      Error: ${err.message}`);
      }
    }
    
    console.log('\n📊 Test 3: Kiểm tra admin user...');
    const [adminUsers] = await db.query(`SELECT id, username, email, role FROM users WHERE role = 'admin'`);
    
    if (adminUsers.length === 0) {
      console.log('   ⚠️  WARNING: Chưa có admin user');
      console.log('   💡 Chạy: node server/setup-admin.js để tạo admin\n');
    } else {
      console.log('   ✅ Đã có admin user:');
      adminUsers.forEach(admin => {
        console.log(`      - ${admin.username} (${admin.email})`);
      });
      console.log('');
    }
    
    // Test 4: Server URL
    console.log('📊 Test 4: Thông tin server...');
    const PORT = process.env.PORT || 5000;
    const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
    
    console.log(`   ✅ Backend API: http://localhost:${PORT}`);
    console.log(`   ✅ Frontend URL: ${CLIENT_URL}`);
    console.log(`   ✅ API Base: http://localhost:${PORT}/api\n`);
    
    // Summary
    console.log('='.repeat(60));
    console.log('🎉 KẾT QUẢ: Tất cả kiểm tra cơ bản đã hoàn thành!');
    console.log('='.repeat(60) + '\n');
    
    console.log('📝 Bước tiếp theo:');
    console.log('   1. Chạy backend: npm start (trong folder server)');
    console.log('   2. Chạy frontend: npm run dev (trong folder root)');
    console.log('   3. Truy cập: http://localhost:5173');
    console.log('   4. Đăng nhập admin để test trang admin\n');
    
    await db.end();
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ LỖI:', error.message);
    console.error('\nChi tiết:', error);
    process.exit(1);
  }
}

runTests();
