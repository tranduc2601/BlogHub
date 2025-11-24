import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  getBookmarks,
  addBookmark,
  removeBookmark,
  checkBookmark
} from '../controllers/bookmarkController.js';

const router = express.Router();

// Tất cả routes đều yêu cầu authentication
router.get('/', authMiddleware, getBookmarks);
router.post('/', authMiddleware, addBookmark);
router.delete('/:postId', authMiddleware, removeBookmark);
router.get('/check/:postId', authMiddleware, checkBookmark);

export default router;
