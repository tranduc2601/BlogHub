// Add missing foreign key constraint for comments.userId
import db from '../config/database.js';

async function addCommentsForeignKey() {
  try {
    console.log('🔄 Adding comments.userId foreign key if missing...');

    // Check if constraint exists
    const [constraints] = await db.query(`
      SELECT CONSTRAINT_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'comments'
        AND COLUMN_NAME = 'userId'
        AND REFERENCED_TABLE_NAME IS NOT NULL
    `);

    if (constraints.length === 0) {
      console.log('Foreign key not found, adding it...');
      
      // Make sure userId allows NULL
      await db.query(`
        ALTER TABLE comments 
        MODIFY COLUMN userId INT NULL
      `);
      console.log('✅ Updated userId to allow NULL');

      // Add the constraint
      await db.query(`
        ALTER TABLE comments 
        ADD CONSTRAINT comments_userId_fk 
        FOREIGN KEY (userId) 
        REFERENCES users(id) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE
      `);
      console.log('✅ Added foreign key constraint');
    } else {
      console.log('✅ Foreign key already exists:', constraints[0].CONSTRAINT_NAME);
    }

    console.log('\n✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

addCommentsForeignKey();
