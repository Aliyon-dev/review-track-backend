import { Response, NextFunction } from 'express';
import { AuthRequest } from '@/middleware/authMiddleware';
import { sendSuccess } from '@/utils/responseHelper';
import asyncHandler from '@/utils/asyncHandler';
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
      const events = await getEventsByApplicationId(req.params.id as string);
      sendSuccess(res, events);
    } catch (err) {
      next(err);
    }
  },
);
