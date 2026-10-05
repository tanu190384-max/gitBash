import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { systemStatus, userDashboard } from '../controllers/dashboardController.js';
import adminRoutes from './admin.routes.js';
import alertRoutes from './alert.routes.js';
import authRoutes from './auth.routes.js';
import infoRoutes from './info.routes.js';
import reportRoutes from './report.routes.js';
import resourceRoutes from './resource.routes.js';

const router = Router();

router.get('/health', (_req, res) => res.json({ success: true, data: { status: 'ok', uptime: process.uptime() } }));
router.get('/system/status', systemStatus);

router.use('/auth', authRoutes);
router.get('/dashboard', authenticate, userDashboard);
router.use('/reports', reportRoutes);
router.use('/resources', resourceRoutes);
router.use('/emergency-info', infoRoutes);
router.use('/alerts', alertRoutes);
router.use('/admin', adminRoutes);

export default router;
