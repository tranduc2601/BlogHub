/**
 * Create Reports Table
 * Chạy: node server/create-reports-table.js
 */

import db from './config/database.js';

async function createReportsTable() {
  try {
    console.log('\n📊 Tạo bảng reports...\n');
    
    // Check if table exists
    const [tables] = await db.query(`
      SELECT COUNT(*) as count 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'bloghub_db' 
      AND TABLE_NAME = 'reports'
    `);
    
    if (tables[0].count > 0) {
      console.log('✅ Bảng reports đã tồn tại\n');
      await db.end();
      return;
    }
    
    // Create reports table
    await db.query(`
      CREATE TABLE reports (
        id INT AUTO_INCREMENT PRIMARY KEY,
        postId INT NOT NULL,
        reportedBy INT NOT NULL,
        reason TEXT NOT NULL,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        reviewedAt TIMESTAMP NULL,
        reviewedBy INT NULL,
        FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE,
        FOREIGN KEY (reportedBy) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (reviewedBy) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    
    console.log('✅ Tạo bảng reports thành công!\n');
    
    // Add hasReports column to posts if not exists
    try {
      await db.query(`
        ALTER TABLE posts 
        ADD COLUMN hasReports BOOLEAN DEFAULT FALSE AFTER status
      `);
      console.log('✅ Thêm cột hasReports vào bảng posts\n');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️  Cột hasReports đã tồn tại trong bảng posts\n');
      }
    }
    
    // Add reportCount column to posts if not exists
    try {
      await db.query(`
        ALTER TABLE posts 
        ADD COLUMN reportCount INT DEFAULT 0 AFTER hasReports
      `);
      console.log('✅ Thêm cột reportCount vào bảng posts\n');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️  Cột reportCount đã tồn tại trong bảng posts\n');
      }
    }
    
    // Add warningCount column to users if not exists
    try {
      await db.query(`
        ALTER TABLE users 
        ADD COLUMN warningCount INT DEFAULT 0 AFTER status
      `);
      console.log('✅ Thêm cột warningCount vào bảng users\n');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️  Cột warningCount đã tồn tại trong bảng users\n');
      }
    }
    
    await db.end();
    console.log('🎉 Hoàn thành! Bảng reports đã sẵn sàng.\n');
    
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    await db.end();
    process.exit(1);
  }
}

createReportsTable();
