import { Request, Response, NextFunction } from 'express';
export declare const rateLimiter: (windowMs?: number, // 15 minutes
maxRequests?: number) => (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const rateLimiterEnhanced: (windowMs?: number, maxRequests?: number, skipSuccessfulRequests?: boolean) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=rateLimiter.d.ts.map