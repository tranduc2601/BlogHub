/**
 * Railway Database Connection Verification
 * Chạy: node server/verify-railway.js
 * 
 * Script này kiểm tra:
 * 1. Kết nối đến Railway MySQL
 * 2. Database schema đầy đủ
 * 3. JWT Secret configuration
 * 4. Admin user tồn tại
 */

import db from './config/database.js';
import dotenv from 'dotenv';

dotenv.config();

console.log('\n' + '='.repeat(70));
console.log('🚂 RAILWAY DATABASE VERIFICATION');
console.log('='.repeat(70) + '\n');

async function verifyRailway() {
  try {
    // Test 1: Check Environment Variables
    console.log('📋 Test 1: Kiểm tra Environment Variables...\n');
    
    const requiredVars = [
      'DB_HOST',
      'DB_PORT', 
      'DB_USER',
      'DB_PASSWORD',
      'DB_NAME',
      'JWT_SECRET'
    ];
    
    let hasAllVars = true;
    requiredVars.forEach(varName => {
      const value = process.env[varName];
      if (!value) {
        console.log(`   ❌ Missing: ${varName}`);
        hasAllVars = false;
      } else {
        // Mask password
        const displayValue = varName === 'DB_PASSWORD' 
          ? '*'.repeat(value.length)
          : value;
        console.log(`   ✅ ${varName}: ${displayValue}`);
      }
    });
    
    if (!hasAllVars) {
      console.log('\n❌ Thiếu environment variables. Kiểm tra file .env\n');
      process.exit(1);
    }
    
    // Test 2: Database Connection
    console.log('\n📊 Test 2: Kết nối Railway MySQL Database...\n');
    
    const [result] = await db.query('SELECT DATABASE() as db, VERSION() as version');
    const dbName = result[0].db;
    const version = result[0].version;
    
    console.log(`   ✅ Connected to: ${dbName}`);
    console.log(`   ✅ MySQL Version: ${version}`);
    
    // Verify it's Railway (check if host contains 'railway')
    if (process.env.DB_HOST.includes('railway')) {
      console.log(`   ✅ Host: ${process.env.DB_HOST} (Railway)`);
    } else {
      console.log(`   ⚠️  Warning: Host không chứa 'railway' - có thể không phải Railway?`);
      console.log(`   ℹ️  Current host: ${process.env.DB_HOST}`);
    }
    
    // Test 3: Check Tables
    console.log('\n📊 Test 3: Kiểm tra Database Schema...\n');
    
    const tables = ['users', 'posts', 'comments', 'reports'];
    let allTablesExist = true;
    
    for (const table of tables) {
      try {
        const [rows] = await db.query(`SELECT COUNT(*) as count FROM ${table}`);
        const count = rows[0].count;
        console.log(`   ✅ Table '${table}': ${count} records`);
      } catch (err) {
        console.log(`   ❌ Table '${table}': KHÔNG TỒN TẠI`);
        allTablesExist = false;
      }
    }
    
    if (!allTablesExist) {
      console.log('\n❌ Schema chưa đầy đủ. Team Lead cần import schema.sql:');
      console.log('   mysql -h HOST -P PORT -u USER -pPASSWORD DATABASE < server/schema.sql\n');
      await db.end();
      process.exit(1);
    }
    
    // Test 4: Check Admin User
    console.log('\n📊 Test 4: Kiểm tra Admin User...\n');
    
    const [admins] = await db.query(`
      SELECT id, username, email, role 
      FROM users 
      WHERE role = 'admin'
    `);
    
    if (admins.length === 0) {
      console.log('   ❌ Chưa có admin user');
      console.log('   💡 Chạy: node server/setup-admin.js\n');
    } else {
      console.log(`   ✅ Tìm thấy ${admins.length} admin user(s):`);
      admins.forEach(admin => {
        console.log(`      - ${admin.username} (${admin.email})`);
      });
      console.log('');
    }
    
    // Test 5: JWT Secret
    console.log('📊 Test 5: Kiểm tra JWT Configuration...\n');
    
    const jwtSecret = process.env.JWT_SECRET;
    if (jwtSecret === 'your-super-secret-jwt-key-change-this-in-production') {
      console.log('   ⚠️  WARNING: Đang dùng JWT_SECRET mặc định!');
      console.log('   💡 Team Lead nên đổi thành secret chung cho cả team\n');
    } else if (jwtSecret.length < 32) {
      console.log('   ⚠️  WARNING: JWT_SECRET quá ngắn (nên >= 32 ký tự)\n');
    } else {
      console.log('   ✅ JWT_SECRET: Hợp lệ');
      console.log(`   ℹ️  Length: ${jwtSecret.length} characters\n`);
    }
    
    // Test 6: Network Test
    console.log('📊 Test 6: Network & Latency Test...\n');
    
    const start = Date.now();
    await db.query('SELECT 1');
    const latency = Date.now() - start;
    
    console.log(`   ✅ Latency: ${latency}ms`);
    if (latency > 500) {
      console.log('   ⚠️  Kết nối hơi chậm (>500ms)');
    } else if (latency > 200) {
      console.log('   ℹ️  Kết nối bình thường');
    } else {
      console.log('   ✅ Kết nối rất tốt!');
    }
    console.log('');
    
    // Summary
    console.log('='.repeat(70));
    console.log('🎉 VERIFICATION COMPLETED!');
    console.log('='.repeat(70) + '\n');
    
    console.log('✅ Railway Database đã sẵn sàng!\n');
    console.log('📝 Bước tiếp theo:');
    console.log('   1. Terminal 1: cd server && npm start');
    console.log('   2. Terminal 2: npm run dev');
    console.log('   3. Browser: http://localhost:5173');
    console.log('   4. Test tạo/sửa/xóa data với team members khác\n');
    
    // Team Sync Info
    console.log('👥 Đồng bộ với team:');
    console.log('   - Tất cả members phải dùng CÙNG DB_* credentials');
    console.log('   - Tất cả members phải dùng CÙNG JWT_SECRET');
    console.log('   - Data tự động đồng bộ khi refresh trang\n');
    
    await db.end();
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ LỖI:', error.message);
    console.error('\n📋 Chi tiết lỗi:', error);
    
    console.log('\n💡 Hướng dẫn khắc phục:\n');
    console.log('1. Kiểm tra file server/.env có đúng credentials không');
    console.log('2. Kiểm tra internet connection');
    console.log('3. Verify Railway database có đang chạy không (railway.app dashboard)');
    console.log('4. Hỏi Team Lead xác nhận credentials\n');
    
    console.log('📖 Xem hướng dẫn đầy đủ: RAILWAY_DATABASE_SETUP.md\n');
    
    await db.end();
    process.exit(1);
  }
}

verifyRailway();
