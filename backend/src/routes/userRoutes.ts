import { Router } from 'express';
import {
  getUserProfile,
  updateUserProfile,
  searchUsers,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
} from '../controllers/userController.js';
import { authenticate, requireEmailVerification } from '../middleware/auth.js';

const router = Router();

// Public routes
router.get('/search', searchUsers);
router.get('/:id', getUserProfile);
router.get('/:id/followers', getFollowers);
router.get('/:id/following', getFollowing);

// Protected routes (require authentication and email verification)
router.put('/profile', authenticate, requireEmailVerification, updateUserProfile);
router.post('/:id/follow', authenticate, requireEmailVerification, followUser);
router.post('/:id/unfollow', authenticate, requireEmailVerification, unfollowUser);

export default router;
