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
  getTopPosts,
  getTopUsers,
  getActivityHistory,
  getReports,
  approveReport,
  rejectReport,
  deleteReport,
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
router.get('/stats/top-posts', getTopPosts);
router.get('/stats/top-users', getTopUsers);
router.get('/stats/activity-history', getActivityHistory);


router.get('/reports', getReports);
router.put('/reports/:id/approve', approveReport);
router.put('/reports/:id/reject', rejectReport);
router.delete('/reports/:id', deleteReport);

router.get('/comment-reports', getCommentReports);
router.put('/comment-reports/:id/handle', handleCommentReport);

export default router;
