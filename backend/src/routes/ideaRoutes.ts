import { Router } from 'express';
import {
  createIdea,
  getIdeas,
  getIdeaById,
  updateIdea,
  deleteIdea,
  upvoteIdea,
  downvoteIdea,
  getUserIdeas,
} from '../controllers/ideaController.js';
import { authenticate, requireEmailVerification } from '../middleware/auth.js';

const router = Router();

// Public routes (read-only)
router.get('/', getIdeas);
router.get('/:id', getIdeaById);
router.get('/user/:userId', getUserIdeas);

// Protected routes (require authentication and email verification)
router.post('/', authenticate, requireEmailVerification, createIdea);
router.put('/:id', authenticate, requireEmailVerification, updateIdea);
router.delete('/:id', authenticate, requireEmailVerification, deleteIdea);
router.post('/:id/upvote', authenticate, requireEmailVerification, upvoteIdea);
router.post('/:id/downvote', authenticate, requireEmailVerification, downvoteIdea);

export default router;
