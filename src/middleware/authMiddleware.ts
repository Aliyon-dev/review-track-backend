import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@/models/models';
import env from '@/config/env';

export interface JwtUserPayload {
  id: string;
  email: string;
  role: Role;
}

export interface AuthRequest extends Request {
  user?: JwtUserPayload;
}

export const protect = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401);
    return next(new Error('Not authorized, no token'));
  }

  try {
    const token = authHeader.split(' ')[1];
    req.user = jwt.verify(token, env.jwtSecret) as JwtUserPayload;
    next();
  } catch {
    res.status(401);
    next(new Error('Not authorized, token invalid'));
  }
};
