import { Router } from 'express';
import {
  createComment,
  getCommentsByIdea,
  updateComment,
  deleteComment,
} from '../controllers/commentController.js';
import { authenticate, requireEmailVerification } from '../middleware/auth.js';

const router = Router();

// Get comments for an idea (public)
router.get('/idea/:ideaId', getCommentsByIdea);

// Protected routes (require authentication and email verification)
router.post('/idea/:ideaId', authenticate, requireEmailVerification, createComment);
router.put('/:id', authenticate, requireEmailVerification, updateComment);
router.delete('/:id', authenticate, requireEmailVerification, deleteComment);

export default router;
