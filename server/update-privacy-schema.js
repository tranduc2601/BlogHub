import db from './config/database.js';
import fs from 'fs';

async function updateSchema() {
  try {
    console.log('Đang cập nhật database schema...');
    
    // Check if privacy column exists
    const [columns] = await db.query(`
      SHOW COLUMNS FROM posts LIKE 'privacy'
    `);
    
    if (columns.length === 0) {
      // Add privacy column
      await db.query(`
        ALTER TABLE posts 
        ADD COLUMN privacy ENUM('public', 'private', 'followers') DEFAULT 'public'
      `);
      console.log('✓ Đã thêm cột privacy vào bảng posts');
    } else {
      console.log('✓ Cột privacy đã tồn tại trong bảng posts');
    }
    
    console.log('✓ Database schema đã được cập nhật thành công!');
    process.exit(0);
  } catch (error) {
    console.error('Lỗi khi cập nhật schema:', error);
    process.exit(1);
  }
}

updateSchema();
