import { Router } from 'express';
import * as auth from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimit.js';

const router = Router();

router.post('/register', authLimiter, auth.register);
router.post('/login', authLimiter, auth.login);
router.post('/logout', auth.logout);
router.get('/me', authenticate, auth.me);
router.patch('/profile', authenticate, auth.updateProfile);
router.patch('/password', authenticate, authLimiter, auth.changePassword);

export default router;
