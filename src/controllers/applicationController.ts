import { Response, NextFunction } from 'express';
import { AuthRequest } from '@/middleware/authMiddleware';
import { sendSuccess } from '@/utils/responseHelper';
import asyncHandler from '@/utils/asyncHandler';
import { createApplication, ApplicationServiceError } from '@/services/applicationService';

export const createApplicationController = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { title, description } = req.body as { title: string; description: string };
    const applicantId = req.user!.id;

    try {
      const application = await createApplication(title, description, applicantId);
      sendSuccess(res, application, 201);
    } catch (err) {
      if (err instanceof ApplicationServiceError) {
        res.status(err.statusCode);
      }
      next(err);
    }
  },
);
