import { Response, NextFunction } from 'express';
import { AuthRequest } from '@/middleware/authMiddleware';
import { sendSuccess } from '@/utils/responseHelper';
import asyncHandler from '@/utils/asyncHandler';
import { ApplicationStatus } from '@/models/models';
import { canTransition } from '@/services/workflow';
import {
  getApplicationById,
  updateApplicationStatus,
  ApplicationServiceError,
} from '@/services/applicationService';

const handleError = (err: unknown, res: Response, next: NextFunction) => {
  if (err instanceof ApplicationServiceError) res.status(err.statusCode);
  next(err);
};

const applyTransition = (toStatus: ApplicationStatus) =>
  asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const application = await getApplicationById(req.params.id as string);
      if (!application) {
        res.status(404);
        return next(new Error('Application not found'));
      }
      if (!canTransition(application.status, toStatus)) {
        res.status(422);
        return next(new Error(`Invalid transition: ${application.status} → ${toStatus}`));
      }
      const updated = await updateApplicationStatus(
        req.params.id as string,
        application.status,
        toStatus,
        req.user!.id,
      );
      sendSuccess(res, updated);
    } catch (err) {
      handleError(err, res, next);
    }
  });

export const startReviewController = applyTransition(ApplicationStatus.UNDER_REVIEW);
export const approveApplicationController = applyTransition(ApplicationStatus.APPROVED);
export const rejectApplicationController = applyTransition(ApplicationStatus.REJECTED);
export const returnApplicationController = applyTransition(ApplicationStatus.CHANGES_REQUESTED);
