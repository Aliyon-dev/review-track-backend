import { Response, NextFunction } from 'express';
import { AuthRequest } from '@/middleware/authMiddleware';
import { sendSuccess } from '@/utils/responseHelper';
import asyncHandler from '@/utils/asyncHandler';
import { ApplicationStatus } from '@/models/models';
import { canTransition } from '@/services/workflow';
import {
  createApplication,
  getApplications,
  getApplicationById,
  getApplicationsByApplicantId,
  updateApplicationStatus,
  ApplicationServiceError,
} from '@/services/applicationService';

const handleError = (err: unknown, res: Response, next: NextFunction) => {
  if (err instanceof ApplicationServiceError) res.status(err.statusCode);
  next(err);
};

export const createApplicationController = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { title, description } = req.body as { title: string; description: string };
    try {
      const application = await createApplication(title, description, req.user!.id);
      sendSuccess(res, application, 201);
    } catch (err) {
      handleError(err, res, next);
    }
  },
);

export const getAllApplicationsController = asyncHandler(
  async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const applications = await getApplications();
      sendSuccess(res, applications);
    } catch (err) {
      handleError(err, res, next);
    }
  },
);

export const getMyApplicationsController = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const applications = await getApplicationsByApplicantId(req.user!.id);
      sendSuccess(res, applications);
    } catch (err) {
      handleError(err, res, next);
    }
  },
);

export const getApplicationByIdController = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const application = await getApplicationById(req.params.id as string);
      if (!application) {
        res.status(404);
        return next(new Error('Application not found'));
      }
      sendSuccess(res, application);
    } catch (err) {
      handleError(err, res, next);
    }
  },
);

export const updateApplicationStatusController = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { status } = req.body as { status: ApplicationStatus };
    try {
      const application = await getApplicationById(req.params.id as string);
      if (!application) {
        res.status(404);
        return next(new Error('Application not found'));
      }
      if (!canTransition(application.status, status)) {
        res.status(422);
        return next(new Error(`Invalid transition: ${application.status} → ${status}`));
      }
      const updated = await updateApplicationStatus(req.params.id as string, status);
      sendSuccess(res, updated);
    } catch (err) {
      handleError(err, res, next);
    }
  },
);
