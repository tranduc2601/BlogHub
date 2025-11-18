import db from './config/database.js';

async function updateNotificationsTable() {
  try {
    console.log('Updating notifications table...');
    
    // Update the ENUM type to include new notification types
    await db.query(`
      ALTER TABLE notifications 
      MODIFY COLUMN type ENUM('share', 'like', 'comment', 'follow', 'reaction', 'post_approved', 'post_reported') NOT NULL
    `);
    
    console.log('✓ Notifications table updated successfully!');
    console.log('New notification types added:');
    console.log('  - reaction: Khi ai đó thả reaction vào bài viết');
    console.log('  - post_approved: Khi bài viết được admin duyệt');
    console.log('  - post_reported: Khi bài viết bị report và admin đã xử lý');
    
    process.exit(0);
  } catch (error) {
    console.error('Error updating notifications table:', error);
    process.exit(1);
  }
}

updateNotificationsTable();
