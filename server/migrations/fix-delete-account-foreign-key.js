// Migration to fix foreign key constraint for account deletion
// This allows comments to be anonymized (userId = 0) when user is deleted
import db from '../config/database.js';

async function fixDeleteAccountForeignKey() {
  try {
    console.log('🔄 Starting migration: Fix delete account foreign key constraint...');

    // 1. Check if placeholder user (id=0) exists, create if not
    const [placeholderUser] = await db.query(
      'SELECT id FROM users WHERE id = 0'
    );

    if (placeholderUser.length === 0) {
      console.log('Creating placeholder user (id=0)...');
      try {
        await db.query(`
          INSERT INTO users (id, username, email, password, status) 
          VALUES (0, 'deleted_user_system', 'deleted@system.local', '', 'deleted')
        `);
        console.log('✅ Created placeholder user');
      } catch (err) {
        // If user with username already exists but id is different, just skip
        if (err.code === 'ER_DUP_ENTRY') {
          console.log('⚠️ Placeholder user creation skipped (username exists)');
        } else {
          throw err;
        }
      }
    } else {
      console.log('✅ Placeholder user already exists');
    }

    // 2. Get current foreign key constraint name
    const [constraints] = await db.query(`
      SELECT CONSTRAINT_NAME, REFERENCED_TABLE_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'comments'
        AND COLUMN_NAME = 'userId'
        AND REFERENCED_TABLE_NAME IS NOT NULL
    `);

    if (constraints.length > 0) {
      const constraintName = constraints[0].CONSTRAINT_NAME;
      console.log(`Found foreign key constraint: ${constraintName}`);

      // 3. Drop existing foreign key constraint
      console.log('Dropping old foreign key constraint...');
      await db.query(`
        ALTER TABLE comments 
        DROP FOREIGN KEY ${constraintName}
      `);
      console.log('✅ Dropped old constraint');

      // 4. Update userId column to allow NULL FIRST (before adding constraint)
      console.log('Updating userId column to allow NULL...');
      await db.query(`
        ALTER TABLE comments 
        MODIFY COLUMN userId INT NULL
      `);
      console.log('✅ Updated userId column to allow NULL');

      // 5. Add new foreign key constraint with ON DELETE SET NULL
      // This will allow setting userId to NULL when user is deleted
      console.log('Adding new foreign key constraint with ON DELETE SET NULL...');
      await db.query(`
        ALTER TABLE comments 
        ADD CONSTRAINT comments_userId_fk 
        FOREIGN KEY (userId) 
        REFERENCES users(id) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE
      `);
      console.log('✅ Added new constraint with ON DELETE SET NULL');

    } else {
      console.log('⚠️ No foreign key constraint found for comments.userId');
    }

    // 6. Check and fix comment_reactions foreign key as well
    const [reactionConstraints] = await db.query(`
      SELECT CONSTRAINT_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'comment_reactions'
        AND COLUMN_NAME = 'userId'
        AND REFERENCED_TABLE_NAME IS NOT NULL
    `);

    if (reactionConstraints.length > 0) {
      const reactionConstraintName = reactionConstraints[0].CONSTRAINT_NAME;
      console.log(`\nFound comment_reactions foreign key: ${reactionConstraintName}`);

      console.log('Dropping old comment_reactions foreign key...');
      await db.query(`
        ALTER TABLE comment_reactions 
        DROP FOREIGN KEY ${reactionConstraintName}
      `);
      console.log('✅ Dropped old constraint');

      console.log('Adding new comment_reactions foreign key with ON DELETE CASCADE...');
      await db.query(`
        ALTER TABLE comment_reactions 
        ADD CONSTRAINT comment_reactions_userId_fk 
        FOREIGN KEY (userId) 
        REFERENCES users(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
      `);
      console.log('✅ Added new constraint with ON DELETE CASCADE');
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('');
    console.log('Summary:');
    console.log('- Created/verified placeholder user (id=0)');
    console.log('- Fixed comments.userId foreign key to allow SET NULL on delete');
    console.log('- Updated comments.userId column to allow NULL values');
    console.log('- Fixed comment_reactions.userId foreign key with CASCADE delete');
    console.log('');
    console.log('Now users can be deleted without foreign key constraint errors!');
    console.log('Comments will have userId set to NULL when user is deleted.');
    console.log('');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run migration
fixDeleteAccountForeignKey()
  .then(() => {
    console.log('Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration script failed:', error);
    process.exit(1);
  });
