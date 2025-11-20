import db from './config/database.js';

async function cleanupExpiredSessions() {
  try {
    console.log('Cleaning up expired sessions...');
    
    const [result] = await db.query('DELETE FROM user_sessions WHERE expiresAt < NOW()');
    
    console.log(`✓ Cleaned up ${result.affectedRows} expired session(s)`);
    process.exit(0);
  } catch (error) {
    console.error('Error cleaning up sessions:', error);
    process.exit(1);
  }
}

cleanupExpiredSessions();
