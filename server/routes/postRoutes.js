import express from 'express';
import { reportPost, createPost, getPosts, getPostById, deletePost, likePost, isPostLiked } from '../controllers/postController.js';
import { getCommentsByPostId, createComment, likeComment, deleteComment } from '../controllers/commentController.js';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all visible posts (public)
router.get('/', getPosts);

// Get single post by ID (public)
router.get('/:id', getPostById);

// Check if post is liked by user (requires auth)
router.get('/:id/isLiked', optionalAuthMiddleware, isPostLiked);

// Endpoint đăng bài viết mới (requires auth)
router.post('/', authMiddleware, createPost);

// Endpoint báo cáo bài viết vi phạm (requires auth)
router.post('/:id/report', authMiddleware, reportPost);

// Endpoint xoá bài viết (requires auth)
router.delete('/:id', authMiddleware, deletePost);

// Endpoint thả tim bài viết (requires auth)
router.post('/:id/like', authMiddleware, likePost);

// Comment routes
// Get comments for a post (public)
router.get('/:postId/comments', getCommentsByPostId);

// Create a comment (requires auth)
router.post('/:postId/comments', authMiddleware, createComment);

// Like a comment (requires auth)
router.post('/comments/:commentId/like', authMiddleware, likeComment);

// Delete a comment (requires auth)
router.delete('/comments/:commentId', authMiddleware, deleteComment);

export default router;