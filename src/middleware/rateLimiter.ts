import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

export const rateLimiter = (
  windowMs: number = 15 * 60 * 1000, // 15 minutes
  maxRequests: number = 100
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip rate limiting for health check
    if (req.path === '/health') {
      return next();
    }

    // Get client identifier - IP address or user ID
    const clientId = req.ip || 'unknown';
    const userId = req.user?.id || undefined;

    // Use user ID if available, otherwise IP address
    const identifier = userId || clientId;
    
    const now = Date.now();
    
    // Clean up expired entries
    Object.keys(store).forEach(key => {
      if (store[key].resetTime < now) {
        delete store[key];
      }
    });

    if (!store[identifier]) {
      store[identifier] = {
        count: 1,
        resetTime: now + windowMs
      };
      return next();
    }

    const record = store[identifier];

    if (record.resetTime < now) {
      // Reset window
      record.count = 1;
      record.resetTime = now + windowMs;
      return next();
    }

    if (record.count >= maxRequests) {
      const remainingTime = Math.ceil((record.resetTime - now) / 1000 / 60);
      res.set('Retry-After', Math.ceil(remainingTime));
      
      return res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: remainingTime,
        timestamp: new Date().toISOString()
      });
    }

    record.count++;
    next();
  };
};

export const rateLimiterEnhanced = (
  windowMs: number = 15 * 60 * 1000,
  maxRequests: number = 100,
  skipSuccessfulRequests: boolean = false
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientId = req.ip || 'unknown';
    const userId = req.user?.id || undefined;
    const identifier = userId || clientId;
    
    const now = Date.now();

    // Clean up expired entries
    Object.keys(store).forEach(key => {
      if (store[key].resetTime < now) {
        delete store[key];
      }
    });

    if (!store[identifier]) {
      store[identifier] = {
        count: 0,
        resetTime: now + windowMs,
        successes: 0,
        failures: 0
      };
    }

    const record = store[identifier];

    if (record.resetTime < now) {
      // Reset window
      record.count = 0;
      record.successes = 0;
      record.failures = 0;
      record.resetTime = now + windowMs;
    }

    // Add rate limit headers
    const remaining = Math.max(0, maxRequests - record.count);
    const resetTime = new Date(record.resetTime).toISOString();
    
    res.set('X-RateLimit-Limit', maxRequests.toString());
    res.set('X-RateLimit-Remaining', remaining.toString());
    res.set('X-RateLimit-Reset', resetTime);
    res.set('X-RateLimit-Window-Milliseconds', windowMs.toString());

    // Track request success/failure
    const originalEnd = res.end;
    const originalWrite = res.write;

    let hasFinished = false;

    res.write = function(chunk: any, encoding?: any) {
      if (!hasFinished) {
        record.count++;
        record.successes++;
        hasFinished = true;
      }
      return originalWrite.call(this, chunk, encoding);
    };

    res.end = function(chunk?: any, encoding?: any) {
      if (!hasFinished) {
        record.count++;
        record.successes++;
        hasFinished = true;
      }
      return originalEnd.call(this, chunk, encoding);
    };

    // Handle error cases
    const originalSend = res.send;
    res.send = function(data: any) {
      if (!hasFinished) {
        const statusCode = res.statusCode;
        if (statusCode >= 400) {
          record.failures++;
        } else {
          record.successes++;
        }
        record.count++;
        hasFinished = true;
      }
      return originalSend.call(this, data);
    };

    next();
  };
};