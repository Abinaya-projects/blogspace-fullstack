import { Router } from 'express';
import {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
} from '../controllers/postController.js';
import {
  getPostComments,
  createComment,
} from '../controllers/commentController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.route('/')
  .get(getPosts)
  .post(protect, createPost);

router.route('/:id')
  .get(getPostById)
  .put(protect, updatePost)
  .delete(protect, deletePost);

// Comments for a specific post
router.route('/:id/comments')
  .get(getPostComments)
  .post(protect, createComment);

export default router;
