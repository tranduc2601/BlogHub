import db from './config/database.js';

async function checkAndCreateNotifications() {
  try {
    // Check if notifications table exists
    const [tables] = await db.query('SHOW TABLES LIKE "notifications"');
    
    if (tables.length === 0) {
      console.log('❌ Bảng notifications chưa tồn tại. Đang tạo...');
      
      await db.query(`
        CREATE TABLE notifications (
          id INT AUTO_INCREMENT PRIMARY KEY,
          userId INT NOT NULL,
          type ENUM('share', 'like', 'comment', 'follow') NOT NULL,
          postId INT DEFAULT NULL,
          senderId INT NOT NULL,
          message TEXT NOT NULL,
          isRead BOOLEAN DEFAULT FALSE,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (senderId) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE,
          INDEX idx_user_read (userId, isRead),
          INDEX idx_user_created (userId, createdAt),
          INDEX idx_type (type)
        )
      `);
      
      console.log('✅ Đã tạo bảng notifications thành công!');
    } else {
      console.log('✅ Bảng notifications đã tồn tại');
      
      // Show table structure
      const [columns] = await db.query('DESCRIBE notifications');
      console.log('\nCấu trúc bảng notifications:');
      columns.forEach(col => {
        console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : ''} ${col.Key} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
      });
      
      // Count notifications
      const [count] = await db.query('SELECT COUNT(*) as total FROM notifications');
      console.log(`\nSố lượng thông báo: ${count[0].total}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    process.exit(1);
  }
}

checkAndCreateNotifications();
