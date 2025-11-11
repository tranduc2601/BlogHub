import { Router } from 'express';
import {
  getPosts,
  createPost,
  togglePostStatus,
  approvePost,
  deletePost,
  getComments,
  createComment,
  toggleCommentStatus,
  getUsers,
  toggleUserStatus,
  deleteUser,
  getStats,
  getReports,
  approveReport,
  rejectReport
} from '../controllers/adminController.js';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

// Apply auth and admin middleware to all routes
router.use(authMiddleware);
router.use(adminMiddleware);

// Posts routes
router.get('/posts', getPosts);
router.post('/posts', createPost);
router.put('/posts/:id/status', togglePostStatus);
router.put('/posts/:id/approve', approvePost);
router.delete('/posts/:id', deletePost);

// Comments routes
router.get('/comments', getComments);
router.post('/comments', createComment);
router.put('/comments/:id/status', toggleCommentStatus);

// Users routes
router.get('/users', getUsers);
router.put('/users/:id/status', toggleUserStatus);
router.delete('/users/:id', deleteUser);

// Stats routes
router.get('/stats', getStats);

// Reports routes
router.get('/reports', getReports);
router.put('/reports/:id/approve', approveReport);
router.put('/reports/:id/reject', rejectReport);

export default router;
