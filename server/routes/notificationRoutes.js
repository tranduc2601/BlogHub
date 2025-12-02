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


router.get('/', authMiddleware, getNotifications);


router.get('/unread-count', authMiddleware, getUnreadCount);


router.put('/:id/read', authMiddleware, markAsRead);


router.put('/read-all', authMiddleware, markAllAsRead);


router.delete('/:id', authMiddleware, deleteNotification);

export default router;
