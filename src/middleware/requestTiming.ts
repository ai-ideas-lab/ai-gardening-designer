import { Request, Response, NextFunction } from 'express';

/**
 * Request timing middleware to track request processing time
 * This middleware adds startTime to the request object for performance monitoring
 */
export const requestTimingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Add startTime to request object
  (req as any).startTime = Date.now();
  
  // Track response time
  const originalSend = res.send;
  res.send = function(data) {
    const endTime = Date.now();
    const processingTime = endTime - (req as any).startTime;
    
    // Add timing info to response if not already present
    if (typeof data === 'object' && !data.processingTime) {
      data = {
        ...data,
        processingTime,
        timestamp: new Date().toISOString()
      };
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};