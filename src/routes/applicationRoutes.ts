import { Router } from 'express';
import { protect, requireApplicant } from '@/middleware/authMiddleware';
import { createApplicationController } from '@/controllers/applicationController';

const router = Router();

router.post('/', protect, requireApplicant, createApplicationController);

export default router;
