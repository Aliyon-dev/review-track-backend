import { Router } from 'express';
import { protect, requireApplicant, requireRole } from '@/middleware/authMiddleware';
import { Role } from '@/models/models';
import {
  createApplicationController,
  getAllApplicationsController,
  getMyApplicationsController,
  getApplicationByIdController,
  updateApplicationStatusController,
  getApplicationsByStatusController
} from '@/controllers/applicationController';

const router = Router();

router.post('/', protect, requireApplicant, createApplicationController);
router.get('/', protect, requireRole(Role.REVIEWER, Role.ADMIN), getAllApplicationsController);
router.get('/my', protect, requireApplicant, getMyApplicationsController);
router.get('/status', protect, requireRole(Role.REVIEWER, Role.ADMIN), getApplicationsByStatusController);
router.get('/:id', protect, requireRole(Role.REVIEWER, Role.ADMIN), getApplicationByIdController);
router.patch('/:id/status', protect, requireRole(Role.REVIEWER, Role.ADMIN), updateApplicationStatusController);

export default router;
