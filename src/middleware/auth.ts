/**
 * Authentication middleware
 */

import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  user: {
    id: string;
    email: string;
    name: string;
  };
}

/**
 * Authentication middleware function
 */
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    // For development/testing, create a mock user
    const mockUser = {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User'
    };

    // Add user to request object
    (req as AuthRequest).user = mockUser;
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({
      success: false,
      error: { message: 'Authentication failed' },
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Optional authentication middleware (doesn't fail if no user)
 */
export const optionalAuthenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    // For development/testing, create a mock user
    const mockUser = {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User'
    };

    // Add user to request object if not already present
    if (!(req as AuthRequest).user) {
      (req as AuthRequest).user = mockUser;
    }
    
    next();
  } catch (error) {
    console.error('Optional authentication error:', error);
    // Don't fail for optional auth
    next();
  }
};