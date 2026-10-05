import { Router } from 'express';
import * as resources from '../controllers/resourceController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', resources.listResources);
router.get('/:id', resources.getResource);
router.post('/', authorize('admin'), resources.createResource);
router.patch('/:id', authorize('admin'), resources.updateResource);
router.delete('/:id', authorize('admin'), resources.deleteResource);

export default router;
