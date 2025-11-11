/**
 * Seed script - Thêm dữ liệu mẫu vào database
 * Chạy: node seedData.js
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const seedData = async () => {
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

    // Check if data already exists
    const [existingPosts] = await connection.query('SELECT COUNT(*) as count FROM posts');
    
    if (existingPosts[0].count > 0) {
      console.log('⚠️  Database đã có dữ liệu. Bỏ qua seed.');
      console.log('💡 Để reset và seed lại, xóa dữ liệu cũ trước:');
      console.log('   DELETE FROM comments;');
      console.log('   DELETE FROM posts;');
      return;
    }

    console.log('📝 Đang thêm dữ liệu mẫu...\n');

    // Insert sample posts
    console.log('➕ Thêm bài viết mẫu...');
    const posts = [
      {
        title: 'Hướng dẫn học React cho người mới bắt đầu',
        content: 'React là một thư viện JavaScript mạnh mẽ để xây dựng giao diện người dùng...',
        authorId: 1,
        status: 'visible',
        likes: 45
      },
      {
        title: 'Bài viết có nội dung spam quảng cáo',
        content: 'Mua hàng giảm giá 99%...',
        authorId: 1,
        status: 'visible',
        likes: 2
      },
      {
        title: 'TypeScript vs JavaScript - So sánh chi tiết',
        content: 'TypeScript cung cấp type safety giúp phát hiện lỗi sớm...',
        authorId: 1,
        status: 'visible',
        likes: 67
      },
      {
        title: 'Nội dung không phù hợp với cộng đồng',
        content: 'Nội dung vi phạm quy định...',
        authorId: 1,
        status: 'hidden',
        likes: 0
      },
      {
        title: 'Best practices cho Node.js backend',
        content: 'Khi xây dựng backend với Node.js, có một số nguyên tắc quan trọng...',
        authorId: 1,
        status: 'visible',
        likes: 89
      }
    ];

    for (const post of posts) {
      await connection.query(
        'INSERT INTO posts (title, content, authorId, status, likes) VALUES (?, ?, ?, ?, ?)',
        [post.title, post.content, post.authorId, post.status, post.likes]
      );
    }
    console.log(`✅ Đã thêm ${posts.length} bài viết\n`);

    // Get post IDs
    const [insertedPosts] = await connection.query('SELECT id FROM posts ORDER BY id');
    const postIds = insertedPosts.map(p => p.id);

    // Insert sample comments
    console.log('➕ Thêm bình luận mẫu...');
    const comments = [
      {
        postId: postIds[0],
        userId: 1,
        content: 'Bài viết rất hữu ích, cảm ơn bạn!',
        status: 'visible'
      },
      {
        postId: postIds[0],
        userId: 1,
        content: 'Link spam: http://spam-site.com',
        status: 'visible'
      },
      {
        postId: postIds[2],
        userId: 1,
        content: 'Mình thích TypeScript hơn vì có type checking',
        status: 'visible'
      },
      {
        postId: postIds[4],
        userId: 1,
        content: 'Bình luận toxic, xúc phạm người khác',
        status: 'hidden'
      },
      {
        postId: postIds[2],
        userId: 1,
        content: 'So sánh rất chi tiết và khách quan',
        status: 'visible'
      }
    ];

    for (const comment of comments) {
      await connection.query(
        'INSERT INTO comments (postId, userId, content, status) VALUES (?, ?, ?, ?)',
        [comment.postId, comment.userId, comment.content, comment.status]
      );
    }
    console.log(`✅ Đã thêm ${comments.length} bình luận\n`);

    console.log('═══════════════════════════════════════');
    console.log('🎉 Seed dữ liệu thành công!');
    console.log('═══════════════════════════════════════');
    console.log('📊 Thống kê:');
    console.log(`   - ${posts.length} bài viết`);
    console.log(`   - ${comments.length} bình luận`);
    console.log('═══════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Giải pháp:');
      console.log('1. Kiểm tra MySQL đã chạy chưa');
      console.log('2. Kiểm tra cấu hình trong file .env');
      console.log('3. Chạy schema.sql trước để tạo bảng');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Đã đóng kết nối database');
    }
  }
};

seedData();
