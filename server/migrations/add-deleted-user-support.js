// Migration to add deletedAt column and 'deleted' status to users table
import db from '../config/database.js';

async function addDeletedUserSupport() {
  try {
    console.log('🔄 Starting migration: Add deleted user support...');

    // 1. Check if 'deleted' status already exists in the ENUM
    const [columns] = await db.query(`
      SELECT COLUMN_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'users' 
        AND COLUMN_NAME = 'status'
    `);

    if (columns.length > 0) {
      const columnType = columns[0].COLUMN_TYPE;
      console.log('Current status ENUM:', columnType);

      // Check if 'deleted' is already in the ENUM
      if (!columnType.includes("'deleted'")) {
        console.log('Adding "deleted" to status ENUM...');
        await db.query(`
          ALTER TABLE users 
          MODIFY COLUMN status ENUM('active', 'locked', 'deleted') DEFAULT 'active'
        `);
        console.log('✅ Added "deleted" status to users.status ENUM');
      } else {
        console.log('✅ "deleted" status already exists in ENUM');
      }
    }

    // 2. Add deletedAt column if it doesn't exist
    const [deletedAtColumn] = await db.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'users' 
        AND COLUMN_NAME = 'deletedAt'
    `);

    if (deletedAtColumn.length === 0) {
      console.log('Adding deletedAt column...');
      await db.query(`
        ALTER TABLE users 
        ADD COLUMN deletedAt TIMESTAMP NULL DEFAULT NULL
      `);
      console.log('✅ Added deletedAt column to users table');
    } else {
      console.log('✅ deletedAt column already exists');
    }

    // 3. Create index on status column if it doesn't exist
    const [statusIndex] = await db.query(`
      SELECT COUNT(*) as count
      FROM INFORMATION_SCHEMA.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'users'
        AND INDEX_NAME = 'idx_status'
    `);

    if (statusIndex[0].count === 0) {
      console.log('Creating index on status column...');
      await db.query(`
        ALTER TABLE users 
        ADD INDEX idx_status (status)
      `);
      console.log('✅ Created index on users.status');
    } else {
      console.log('✅ Index on status column already exists');
    }

    // 4. Create a placeholder user (id=0) for anonymized comments if it doesn't exist
    const [placeholderUser] = await db.query(
      'SELECT id FROM users WHERE id = 0'
    );

    if (placeholderUser.length === 0) {
      console.log('Creating placeholder user for anonymized comments...');
      await db.query(`
        INSERT INTO users (id, username, email, password, status) 
        VALUES (0, 'deleted_user', 'deleted@system.local', '', 'deleted')
      `);
      console.log('✅ Created placeholder user (id=0)');
    } else {
      console.log('✅ Placeholder user already exists');
    }

    console.log('✅ Migration completed successfully!');
    console.log('');
    console.log('Summary:');
    console.log('- Added "deleted" status to users.status ENUM');
    console.log('- Added deletedAt column to users table');
    console.log('- Created index on status column');
    console.log('- Created placeholder user for anonymized comments');
    console.log('');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run migration
addDeletedUserSupport()
  .then(() => {
    console.log('Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration script failed:', error);
    process.exit(1);
  });
