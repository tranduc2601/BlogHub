import { Router } from 'express';
import { 
  getNotifications, 
  getUnreadCount, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification 
} from '../controllers/notificationController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

// Get all notifications
router.get('/', authMiddleware, getNotifications);

// Get unread count
router.get('/unread-count', authMiddleware, getUnreadCount);

// Mark notification as read
router.put('/:id/read', authMiddleware, markAsRead);

// Mark all as read
router.put('/read-all', authMiddleware, markAllAsRead);

// Delete notification
router.delete('/:id', authMiddleware, deleteNotification);

export default router;
