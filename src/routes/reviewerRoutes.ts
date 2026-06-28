import { Router } from 'express';
import { protect, requireReviewer } from '@/middleware/authMiddleware';
import {
  getAllApplicationsController,
  getApplicationByIdController,
} from '@/controllers/applicationController';
import {
  startReviewController,
  approveApplicationController,
  rejectApplicationController,
  returnApplicationController,
} from '@/controllers/reviewerController';

const router = Router();

router.use(protect, requireReviewer);

router.get('/applications', getAllApplicationsController);
router.get('/applications/:id', getApplicationByIdController);
router.post('/applications/:id/start-review', startReviewController);
router.post('/applications/:id/approve', approveApplicationController);
router.post('/applications/:id/reject', rejectApplicationController);
router.post('/applications/:id/return', returnApplicationController);

export default router;
