import { Role } from '@/models/models';
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
export declare class AuthError extends Error {
    statusCode: number;
    constructor(message: string, statusCode: number);
}
export declare const loginUser: (email: string, password: string) => Promise<LoginResult>;
//# sourceMappingURL=authService.d.ts.map