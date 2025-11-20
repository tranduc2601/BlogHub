import express from 'express';
import { reportPost, createPost, getPosts, getPostById, deletePost, likePost, isPostLiked, updatePost, trackPostView, reactPost, getUserReaction, getReactionStats, getReactionUsers, pinComment, unpinComment, getPinnedComment, sharePost } from '../controllers/postController.js';
import { getCommentsByPostId, createComment, updateComment, likeComment, deleteComment, getRepliesByCommentId, createReply, deleteReply, reactComment, getUserCommentReaction, getCommentReactions, reportComment } from '../controllers/commentController.js';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();


router.get('/', getPosts);

// Pin/Unpin comment routes
router.post('/:postId/pin-comment', authMiddleware, pinComment);
router.delete('/:postId/pin-comment', authMiddleware, unpinComment);
router.get('/:postId/pinned-comment', getPinnedComment);

// Report comment
router.post('/comments/:commentId/report', authMiddleware, reportComment);

router.put('/comments/:commentId', authMiddleware, updateComment);


router.delete('/comments/:commentId', authMiddleware, deleteComment);


router.post('/comments/:commentId/like', authMiddleware, likeComment);


router.post('/comments/:commentId/react', authMiddleware, reactComment);


router.get('/comments/:commentId/user-reaction', optionalAuthMiddleware, getUserCommentReaction);


router.get('/comments/:commentId/reactions', getCommentReactions);


router.get('/comments/:commentId/replies', getRepliesByCommentId);


router.post('/comments/:commentId/replies', authMiddleware, createReply);


router.delete('/replies/:replyId', authMiddleware, deleteReply);


router.get('/:id/isLiked', optionalAuthMiddleware, isPostLiked);


router.get('/:id/user-reaction', optionalAuthMiddleware, getUserReaction);


router.get('/:id/reaction-stats', getReactionStats);


router.get('/:id/reactions/users', optionalAuthMiddleware, getReactionUsers);


router.get('/:postId/comments', optionalAuthMiddleware, getCommentsByPostId);


router.post('/:postId/comments', authMiddleware, createComment);


router.post('/:id/react', authMiddleware, reactPost);


router.post('/:id/like', authMiddleware, likePost);


router.post('/:id/view', optionalAuthMiddleware, trackPostView);


router.post('/:id/report', authMiddleware, reportPost);


router.post('/:id/share', authMiddleware, sharePost);


router.get('/:id', optionalAuthMiddleware, getPostById);


router.post('/', authMiddleware, createPost);


router.put('/:id', authMiddleware, updatePost);


router.delete('/:id', authMiddleware, deletePost);

export default router;