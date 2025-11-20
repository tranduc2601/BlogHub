import { Router } from 'express';
import {
  getPosts,
  createPost,
  togglePostStatus,
  approvePost,
  rejectPost,
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
  rejectReport,
  getCommentReports,
  handleCommentReport
} from '../controllers/adminController.js';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware.js';

const router = Router();


router.use(authMiddleware);
router.use(adminMiddleware);


router.get('/posts', getPosts);
router.post('/posts', createPost);
router.put('/posts/:id/status', togglePostStatus);
router.put('/posts/:id/approve', approvePost);
router.put('/posts/:id/reject', rejectPost);
router.delete('/posts/:id', deletePost);


router.get('/comments', getComments);
router.post('/comments', createComment);
router.put('/comments/:id/status', toggleCommentStatus);


router.get('/users', getUsers);
router.put('/users/:id/status', toggleUserStatus);
router.delete('/users/:id', deleteUser);


router.get('/stats', getStats);


router.get('/reports', getReports);
router.put('/reports/:id/approve', approveReport);
router.put('/reports/:id/reject', rejectReport);

// Comment Reports
router.get('/comment-reports', getCommentReports);
router.put('/comment-reports/:id/handle', handleCommentReport);

export default router;
