import { Response, NextFunction } from 'express';
import { AuthRequest } from '@/middleware/authMiddleware';
import { sendSuccess } from '@/utils/responseHelper';
import asyncHandler from '@/utils/asyncHandler';
import { Role } from '@/models/models';
import { getApplicationById } from '@/services/applicationService';
import { createComment, getEventsByApplicationId } from '@/services/reviewService';

export const addCommentController = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const comment = await createComment(
        req.params.id as string,
        req.user!.id,
        req.body.comment as string,
      );
      sendSuccess(res, comment, 201);
    } catch (err) {
      next(err);
    }
  },
);

export const getEventsController = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const application = await getApplicationById(req.params.id as string);
      if (!application) {
        res.status(404);
        return next(new Error('Application not found'));
      }
      if (req.user!.role === Role.APPLICANT && application.applicantId !== req.user!.id) {
        res.status(403);
        return next(new Error('Forbidden'));
      }
      const events = await getEventsByApplicationId(req.params.id as string);
      sendSuccess(res, events);
    } catch (err) {
      next(err);
    }
  },
);
