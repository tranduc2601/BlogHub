import fs from 'fs';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

async function importSchema() {
  let connection;
  
  try {
    console.log('🔄 Connecting to database...');
    console.log(`Host: ${process.env.DB_HOST}`);
    console.log(`Port: ${process.env.DB_PORT}`);
    console.log(`Database: ${process.env.DB_NAME}`);
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      multipleStatements: true
    });

    console.log('✅ Connected to database successfully!\n');

    console.log('🔄 Reading schema.sql file...');
    const schemaPath = join(__dirname, 'schema.sql');
    let schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Remove CREATE DATABASE and USE statements if database name is different
    if (process.env.DB_NAME !== 'bloghub_db') {
      console.log(`⚠️  Database name is '${process.env.DB_NAME}', removing CREATE DATABASE statements...`);
      schema = schema.replace(/CREATE DATABASE IF NOT EXISTS bloghub_db;/g, '');
      schema = schema.replace(/USE bloghub_db;/g, '');
    }

    // Split into individual statements and filter out empty ones
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📋 Found ${statements.length} SQL statements to execute\n`);

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      
      // Skip comments
      if (statement.startsWith('--')) continue;

      try {
        // Extract table/action name for logging
        let actionName = 'Unknown';
        if (statement.includes('CREATE TABLE')) {
          const match = statement.match(/CREATE TABLE (?:IF NOT EXISTS )?`?(\w+)`?/);
          if (match) actionName = `CREATE TABLE ${match[1]}`;
        } else if (statement.includes('ALTER TABLE')) {
          const match = statement.match(/ALTER TABLE `?(\w+)`?/);
          if (match) actionName = `ALTER TABLE ${match[1]}`;
        } else if (statement.includes('CREATE INDEX')) {
          actionName = 'CREATE INDEX';
        }

        process.stdout.write(`[${i + 1}/${statements.length}] ${actionName}...`);
        
        await connection.query(statement);
        console.log(' ✅');
        successCount++;
      } catch (error) {
        // Some errors are expected (like duplicate column, table exists, etc.)
        const expectedErrors = [
          'Duplicate column name',
          'Duplicate key name',
          'already exists',
          'Cannot add foreign key constraint'
        ];

        const isExpectedError = expectedErrors.some(err => 
          error.message.includes(err)
        );

        if (isExpectedError) {
          console.log(' ⚠️  (skipped - already exists)');
          skipCount++;
        } else {
          console.log(` ❌ ${error.message}`);
          errorCount++;
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Import Summary:');
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ⚠️  Skipped:    ${skipCount}`);
    console.log(`   ❌ Errors:     ${errorCount}`);
    console.log('='.repeat(60));

    // Verify tables
    console.log('\n🔍 Verifying tables...');
    const [tables] = await connection.query('SHOW TABLES');
    console.log(`✅ Total tables in database: ${tables.length}`);
    
    const expectedTables = [
      'users', 'posts', 'comments', 'reactions', 'likes',
      'post_views', 'follows', 'notifications', 'user_sessions',
      'comment_reports', 'comment_replies', 'comment_reactions',
      'comment_likes', 'reports', 'bookmarks'
    ];

    console.log('\n📋 Expected tables:');
    for (const tableName of expectedTables) {
      const exists = tables.some(row => Object.values(row)[0] === tableName);
      console.log(`   ${exists ? '✅' : '❌'} ${tableName}`);
    }

    if (errorCount > 0) {
      console.log('\n⚠️  Schema imported with some errors. Please review the error messages above.');
      process.exit(1);
    } else {
      console.log('\n✅ Schema imported successfully!');
      process.exit(0);
    }

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed.');
    }
  }
}

// Run the import
console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║         BlogHub Schema Import Tool v1.0                   ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

importSchema();
