import { Router } from 'express';
import * as info from '../controllers/infoController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', info.listInfo);
router.get('/:id', info.getInfo);
router.post('/', authorize('admin'), info.createInfo);
router.patch('/:id', authorize('admin'), info.updateInfo);
router.delete('/:id', authorize('admin'), info.deleteInfo);

export default router;
