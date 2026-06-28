import { Request, Response, NextFunction } from 'express';

import asyncHandler from '@/utils/asyncHandler';
import { sendSuccess } from '@/utils/responseHelper';
import { loginUser, getMe, AuthError } from '@/services/authService';
import { AuthRequest } from '@/middleware/authMiddleware';

export const getMeController = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await getMe(req.user!.id);
    sendSuccess(res, user);
  } catch (err) {
    if (err instanceof AuthError) res.status(err.statusCode);
    next(err);
  }
});

export const logoutController = asyncHandler(async (_req: AuthRequest, res: Response): Promise<void> => {
  sendSuccess(res, { message: 'Logged out' });
});

export const login = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { email, password } = req.body as { email: string; password: string };

  try {
    const result = await loginUser(email, password);
    sendSuccess(res, result);
  } catch (err) {
    if (err instanceof AuthError) {
      res.status(err.statusCode);
    }
    next(err);
  }
});
