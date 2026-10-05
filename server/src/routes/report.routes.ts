import { Router } from 'express';
import * as reports from '../controllers/reportController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { reportLimiter } from '../middleware/rateLimit.js';
import { uploadIncidentImage } from '../middleware/upload.js';

const router = Router();

router.use(authenticate);

router.post('/', reportLimiter, uploadIncidentImage, reports.submitReport);
router.get('/', reports.listReports);
router.get('/map', authorize('admin'), reports.listReportsForMap);
router.get('/:id', reports.getReport);
router.get('/:id/assessment', reports.getAssessment);

router.post('/:id/assess', authorize('admin'), reports.reassess);
router.patch('/:id/status', authorize('admin'), reports.updateStatus);
router.patch('/:id/resources', authorize('admin'), reports.assignResources);
router.delete('/:id', authorize('admin'), reports.deleteReport);

export default router;
