import { Router } from 'express';
import { protect, requireApplicant, requireRole } from '@/middleware/authMiddleware';
import { validate } from '@/middleware/validateMiddleware';
import { Role } from '@/models/models';
import {
  createApplicationController,
  getAllApplicationsController,
  getMyApplicationsController,
  getApplicationByIdController,
  updateApplicationStatusController,
  getApplicationsByStatusController,
  submitApplicationController,
  updateApplicationController,
  deleteApplicationController,
} from '@/controllers/applicationController';
import { addCommentController, getEventsController } from '@/controllers/reviewController';
import { commentValidators } from '@/validators/reviewValidators';

const router = Router();

router.post('/', protect, requireApplicant, createApplicationController);
router.get('/', protect, requireRole(Role.REVIEWER, Role.ADMIN), getAllApplicationsController);
router.get('/my', protect, requireApplicant, getMyApplicationsController);
router.get('/status', protect, requireRole(Role.REVIEWER, Role.ADMIN), getApplicationsByStatusController);
router.get('/:id', protect, requireRole(Role.APPLICANT, Role.REVIEWER, Role.ADMIN), getApplicationByIdController);
router.patch('/:id/submit', protect, requireApplicant, submitApplicationController);
router.patch('/:id/status', protect, requireRole(Role.REVIEWER, Role.ADMIN), updateApplicationStatusController);
router.patch('/:id', protect, requireApplicant, updateApplicationController);
router.delete('/:id', protect, requireApplicant, deleteApplicationController);
router.post('/:id/comments', protect, requireRole(Role.REVIEWER, Role.ADMIN), commentValidators, validate, addCommentController);
router.get('/:id/events', protect, getEventsController);

export default router;
