import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

// Create connection pool for better performance
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 60000,  // 60 seconds
  acquireTimeout: 60000,
  timeout: 60000
});

// Get promise-based wrapper
const promisePool = pool.promise();

// Test database connection
export const testConnection = async () => {
  try {
    const connection = await promisePool.getConnection();
    console.log('Kết nối đến database MySQL thành công!');
    connection.release();
    return true;
  } catch (error) {
    console.error('Kết nối đến database MySQL thất bại:', error.message);
    return false;
  }
};

export default promisePool;
