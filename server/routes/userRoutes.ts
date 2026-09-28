import { Router } from 'express';
import {
  getUserProfile,
  updateUserProfile,
  getDashboardStats,
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/stats/dashboard', protect, getDashboardStats);
router.route('/:id')
  .get(getUserProfile)
  .put(protect, updateUserProfile);

export default router;
