import { Response, NextFunction } from 'express';
import { AuthRequest } from '@/middleware/authMiddleware';
import { sendSuccess } from '@/utils/responseHelper';
import asyncHandler from '@/utils/asyncHandler';
import { ApplicationStatus, Role } from '@/models/models';
import { canTransition } from '@/services/workflow';
import {
  createApplication,
  getApplications,
  getApplicationById,
  getApplicationsByApplicantId,
  updateApplicationStatus,
  updateApplication,
  deleteApplication,
  ApplicationServiceError,
  getApplicationsByStatus,
} from '@/services/applicationService';

const handleError = (err: unknown, res: Response, next: NextFunction) => {
  if (err instanceof ApplicationServiceError) res.status(err.statusCode);
  next(err);
};

export const createApplicationController = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { title, description, type, priority, amount, justification } = req.body as {
      title: string;
      description: string;
      type?: string;
      priority?: string;
      amount?: number;
      justification?: string;
    };
    try {
      const application = await createApplication(
        { title, description, type, priority, amount, justification },
        req.user!.id,
      );
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
      if (req.user!.role === Role.APPLICANT && application.applicantId !== req.user!.id) {
        res.status(403);
        return next(new Error('Forbidden'));
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
      const updated = await updateApplicationStatus(req.params.id as string, application.status, status, req.user!.id);
      sendSuccess(res, updated);
    } catch (err) {
      handleError(err, res, next);
    }
  },
);


export const getApplicationsByStatusController = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const { status } = req.query as { status: ApplicationStatus };
  try {
    const applications = await getApplicationsByStatus(status);
    sendSuccess(res, applications);
  } catch (err) {
    handleError(err, res, next);
  }
});

export const updateApplicationController = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const updated = await updateApplication(req.params.id as string, req.body, req.user!.id);
      sendSuccess(res, updated);
    } catch (err) {
      handleError(err, res, next);
    }
  },
);

export const deleteApplicationController = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await deleteApplication(req.params.id as string, req.user!.id);
      res.status(204).end();
    } catch (err) {
      handleError(err, res, next);
    }
  },
);

export const submitApplicationController = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const application = await getApplicationById(req.params.id as string);
      if (!application) {
        res.status(404);
        return next(new Error('Application not found'));
      }
      if (application.applicantId !== req.user!.id) {
        res.status(403);
        return next(new Error('Forbidden'));
      }
      if (!canTransition(application.status, ApplicationStatus.SUBMITTED)) {
        res.status(422);
        return next(new Error(`Cannot submit application with status: ${application.status}`));
      }
      const updated = await updateApplicationStatus(
        req.params.id as string,
        application.status,
        ApplicationStatus.SUBMITTED,
        req.user!.id,
      );
      sendSuccess(res, updated);
    } catch (err) {
      handleError(err, res, next);
    }
  },
);