import { Request, Response, NextFunction } from 'express';
import { Role } from '@/models/models';
export interface JwtUserPayload {
    id: string;
    email: string;
    role: Role;
}
export interface AuthRequest extends Request {
    user?: JwtUserPayload;
}
export declare const protect: (req: AuthRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=authMiddleware.d.ts.map