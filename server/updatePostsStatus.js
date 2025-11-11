import db from './config/database.js';

async function updatePostsStatus() {
  try {
    // Update all posts by user ID 19 to visible
    const [result] = await db.query(
      'UPDATE posts SET status = ? WHERE authorId = ?',
      ['visible', 19]
    );
    
    console.log(`✅ Đã cập nhật ${result.affectedRows} bài viết thành visible`);
    
    // Show updated posts
    const [posts] = await db.query(
      'SELECT id, title, status, authorId FROM posts WHERE authorId = ?',
      [19]
    );
    
    console.log('\nDanh sách bài viết của bạn:');
    console.table(posts);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
}

updatePostsStatus();
