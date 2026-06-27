import { Request, Response, NextFunction } from 'express';

import asyncHandler from '@/utils/asyncHandler';
import { sendSuccess } from '@/utils/responseHelper';
import { loginUser, AuthError } from '@/services/authService';

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
