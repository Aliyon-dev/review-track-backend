import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import prisma from '@/lib/prisma';
import env from '@/config/env';
import { Role } from '@/models/models';
import { JwtUserPayload } from '@/middleware/authMiddleware';

export interface LoginResult {
  token: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: Role;
  };
}

export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export const loginUser = async (
  email: string,
  password: string,
): Promise<LoginResult> => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new AuthError('Invalid credentials', 401);
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatch) {
    throw new AuthError('Invalid credentials', 401);
  }

  const payload: JwtUserPayload = {
    id: user.id,
    email: user.email,
    role: user.role as Role,
  };

  const token = jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as jwt.SignOptions['expiresIn'],
  });

  return {
    token,
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role as Role,
    },
  };
};
