import { Router } from 'express';
import * as alerts from '../controllers/alertController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', alerts.listAlerts);
router.patch('/read-all', alerts.markAllRead);
router.patch('/:id/read', alerts.markRead);

router.get('/admin/all', authorize('admin'), alerts.listBroadcasts);
router.post('/', authorize('admin'), alerts.createAlert);
router.delete('/:id', authorize('admin'), alerts.deleteAlert);

export default router;
