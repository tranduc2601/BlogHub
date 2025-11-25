import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import db from './config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

/**
 * Safe migration script to add missing columns to existing tables
 * This script checks if columns exist before adding them
 */
const migrateMissingColumns = async () => {
  try {
    console.log('🔄 Starting database migration...\n');

    // ============================================================================
    // 1. Add warningCount to users table
    // ============================================================================
    console.log('📊 Checking users table...');
    const [userColumns] = await db.query("SHOW COLUMNS FROM users LIKE 'warningCount'");
    if (userColumns.length === 0) {
      console.log('  ➕ Adding warningCount column...');
      await db.query('ALTER TABLE users ADD COLUMN warningCount INT DEFAULT 0');
      await db.query('ALTER TABLE users ADD INDEX idx_warning (warningCount)');
      console.log('  ✅ Added warningCount to users');
    } else {
      console.log('  ✓ warningCount already exists');
    }

    // ============================================================================
    // 2. Add missing columns to comments table
    // ============================================================================
    console.log('\n📊 Checking comments table...');
    
    const columnsToAdd = [
      { name: 'isAnonymous', definition: 'BOOLEAN DEFAULT FALSE', index: 'idx_anonymous' },
      { name: 'anonymousId', definition: 'VARCHAR(255) DEFAULT NULL', index: null },
      { name: 'reportCount', definition: 'INT DEFAULT 0', index: 'idx_report_count' },
      { name: 'reaction_like', definition: 'INT DEFAULT 0', index: null },
      { name: 'reaction_love', definition: 'INT DEFAULT 0', index: null },
      { name: 'reaction_haha', definition: 'INT DEFAULT 0', index: null },
      { name: 'reaction_wow', definition: 'INT DEFAULT 0', index: null },
      { name: 'reaction_sad', definition: 'INT DEFAULT 0', index: null },
      { name: 'reaction_angry', definition: 'INT DEFAULT 0', index: null },
      { name: 'total_reactions', definition: 'INT DEFAULT 0', index: null }
    ];

    for (const column of columnsToAdd) {
      const [exists] = await db.query(`SHOW COLUMNS FROM comments LIKE ?`, [column.name]);
      
      if (exists.length === 0) {
        console.log(`  ➕ Adding ${column.name} column...`);
        await db.query(`ALTER TABLE comments ADD COLUMN ${column.name} ${column.definition}`);
        
        if (column.index) {
          try {
            await db.query(`ALTER TABLE comments ADD INDEX ${column.index} (${column.name})`);
          } catch (err) {
            // Index might already exist, ignore error
            console.log(`    ⚠️  Index ${column.index} might already exist`);
          }
        }
        console.log(`  ✅ Added ${column.name} to comments`);
      } else {
        console.log(`  ✓ ${column.name} already exists`);
      }
    }

    // ============================================================================
    // 3. Verify critical tables exist
    // ============================================================================
    console.log('\n📊 Verifying critical tables...');
    
    const criticalTables = [
      'users', 'posts', 'comments', 'reactions', 'comment_reactions',
      'notifications', 'user_sessions', 'follows', 'bookmarks',
      'reports', 'comment_reports', 'post_views'
    ];

    const [allTables] = await db.query('SHOW TABLES');
    const tableNames = allTables.map(row => Object.values(row)[0]);

    const missingTables = criticalTables.filter(table => !tableNames.includes(table));
    
    if (missingTables.length > 0) {
      console.log('\n⚠️  WARNING: Missing tables detected!');
      console.log('Missing tables:', missingTables.join(', '));
      console.log('\n📌 To create missing tables, run:');
      console.log('   node import-schema.js');
    } else {
      console.log('✅ All critical tables exist');
    }

    // ============================================================================
    // 4. Summary
    // ============================================================================
    console.log('\n' + '='.repeat(60));
    console.log('📋 Migration Summary:');
    console.log('='.repeat(60));
    console.log('✅ Database migration completed successfully!');
    console.log('✅ All required columns have been added');
    console.log('\n📌 Next steps:');
    console.log('   1. Restart your backend server');
    console.log('   2. Test comment reactions feature');
    console.log('   3. Test warning system in admin panel');
    console.log('='.repeat(60));

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('Stack trace:', error.stack);
    console.error('\n💡 Tips:');
    console.error('   - Check database connection settings in .env');
    console.error('   - Ensure database user has ALTER TABLE permissions');
    console.error('   - Try running: node import-schema.js (for fresh setup)');
    process.exit(1);
  }
};

// Run migration
console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║      BlogHub Database Migration - Missing Columns        ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

migrateMissingColumns();
