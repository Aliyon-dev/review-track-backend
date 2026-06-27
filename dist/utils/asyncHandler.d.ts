import { Request, Response, NextFunction, RequestHandler } from 'express';
type AsyncFn = (req: Request, res: Response, next: NextFunction) => Promise<void>;
declare const asyncHandler: (fn: AsyncFn) => RequestHandler;
export default asyncHandler;
//# sourceMappingURL=asyncHandler.d.ts.map