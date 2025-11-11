import db from './config/database.js';

async function updatePostTags() {
  try {
    const postsWithTags = [
      { id: 9, tags: ['AI', 'CôngNghệ', 'Innovation', 'TechTrends2024'] },
      { id: 10, tags: ['Lifestyle', 'Minimalism', 'SốngTốiGiản', 'WorkLifeBalance'] },
      { id: 11, tags: ['DuLịch', 'Phượt', 'HiddenGem', 'KhámPhá'] },
      { id: 12, tags: ['ẨmThực', 'NauAn', 'PhoGa', 'AmThucViet'] },
      { id: 13, tags: ['GiáoDục', 'Microlearning', 'HọcTập', 'KỹNăngMềm'] }
    ];
    
    for (const post of postsWithTags) {
      const tagsJson = JSON.stringify(post.tags);
      await db.query('UPDATE posts SET tags = ? WHERE id = ?', [tagsJson, post.id]);
      console.log(`✅ Updated post ${post.id} with tags: ${post.tags.join(', ')}`);
    }
    
    // Show updated posts
    const [updatedPosts] = await db.query('SELECT id, title, tags FROM posts WHERE id IN (9, 10, 11, 12, 13)');
    console.log('\nBài viết đã cập nhật tags:');
    updatedPosts.forEach(post => {
      console.log(`\nID: ${post.id}`);
      console.log(`Title: ${post.title}`);
      console.log(`Tags: ${post.tags}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
}

updatePostTags();
