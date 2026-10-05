import { Router } from 'express';
import * as admin from '../controllers/adminController.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

router.use(requireAdmin);

router.get('/stats', admin.stats);
router.get('/analytics', admin.analytics);
router.get('/incidents', admin.recentIncidents);
router.get('/users', admin.listUsers);
router.patch('/users/:id', admin.updateUser);

export default router;
