import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { testConnection } from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import postRoutes from './routes/postRoutes.js';
import userRoutes from './routes/userRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import { likeComment } from './controllers/commentController.js';
import { authMiddleware } from './middleware/authMiddleware.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: 'BlogHub API Server đang hoạt động',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      posts: '/api/posts (coming soon)',
      comments: '/api/comments (coming soon)'
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);

app.post('/api/comments/:commentId/like', authMiddleware, likeComment);

app.use((req, res) => {
  console.error(`404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    success: false,
    message: 'API endpoint không tồn tại',
    path: req.originalUrl,
    method: req.method
  });
});

app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Lỗi server không xác định'
  });
});

const startServer = async () => {
  try {
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('Hiện tại không kết nối được đến Database. Vui lòng kiểm tra lại cấu hình MySQL.\n');
      console.log('Hướng dẫn:\n');
      console.log('   1. Đảm bảo MySQL đang chạy\n');
      console.log('   2. Chạy file schema.sql để tạo database và bảng\n');
      console.log('   3. Kiểm tra file .env với thông tin kết nối đúng\n');
      process.exit(1);
    }

    app.listen(PORT, () => {
      console.log('\n' + '='.repeat(50) + '\n');
      console.log(`Server đang chạy tại cổng: http://localhost:${PORT}\n`);
      console.log(`Môi trường làm việc hiện tại: ${process.env.NODE_ENV || 'Phát triển dự án'}\n`);
      console.log(`CORS đã được bật tại URL: ${process.env.CLIENT_URL}\n`);
      console.log('='.repeat(50) + '\n');
    });

  } catch (error) {
    console.error('Có lỗi khi khởi động server:', error);
    process.exit(1);
  }
};

startServer();
