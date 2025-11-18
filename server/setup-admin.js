import bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const ADMIN_CREDENTIALS = {
  email: 'admin@bloghub.com',
  username: 'admin',
  password: 'admin123',  
  role: 'admin'
};

const FIXED_PASSWORD_HASH = '$2b$10$vCq88XjAOphgIgpRpip08ugR3swTbP4mcVhIReldJ/W5Xkl7vNm/i';

const setupAdmin = async () => {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'bloghub_db'
    });

    const [existingUsers] = await connection.query(
      'SELECT * FROM users WHERE email = ?',
      [ADMIN_CREDENTIALS.email]
    );

    if (existingUsers.length > 0) {

      await connection.query(
        'UPDATE users SET password = ?, role = ?, username = ? WHERE email = ?',
        [FIXED_PASSWORD_HASH, ADMIN_CREDENTIALS.role, ADMIN_CREDENTIALS.username, ADMIN_CREDENTIALS.email]
      );
      
    } else {

      const [result] = await connection.query(
        'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
        [ADMIN_CREDENTIALS.username, ADMIN_CREDENTIALS.email, FIXED_PASSWORD_HASH, ADMIN_CREDENTIALS.role]
      );

    }

  } catch (error) {
    console.error('Lỗi:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};


setupAdmin();
