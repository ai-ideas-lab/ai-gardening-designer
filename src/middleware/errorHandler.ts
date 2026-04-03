/**
 * Error handling middleware
 */

import { Request, Response, NextFunction } from 'express';

export interface ApiError {
  success: boolean;
  error: {
    message: string;
    code?: string;
    details?: any;
  };
  timestamp: string;
}

/**
 * Create standardized API error response
 */
export const createError = (message: string, code?: string, details?: any): ApiError => {
  return {
    success: false,
    error: {
      message,
      code,
      details
    },
    timestamp: new Date().toISOString()
  };
};

/**
 * Global error handler middleware
 */
export const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error occurred:', error);

  // Handle validation errors
  if (error.name === 'ValidationError') {
    return res.status(400).json(createError('Validation failed', 'VALIDATION_ERROR', error.message));
  }

  // Handle Prisma errors
  if (error.name === 'PrismaClientKnownRequestError') {
    if ((error as any).code === 'P2002') {
      return res.status(409).json(createError('Resource already exists', 'DUPLICATE_ERROR'));
    }
    if ((error as any).code === 'P2025') {
      return res.status(404).json(createError('Resource not found', 'NOT_FOUND_ERROR'));
    }
  }

  // Handle authentication errors
  if (error.name === 'UnauthorizedError') {
    return res.status(401).json(createError('Authentication required', 'AUTH_REQUIRED'));
  }

  // Handle authorization errors
  if (error.name === 'ForbiddenError') {
    return res.status(403).json(createError('Access denied', 'ACCESS_DENIED'));
  }

  // Handle database connection errors
  if (error.name === 'PrismaClientInitializationError') {
    return res.status(503).json(createError('Database connection error', 'DB_CONNECTION_ERROR'));
  }

  // Default error response
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    success: false,
    error: {
      message: error.message || 'Internal server error',
      code: 'INTERNAL_ERROR'
    },
    timestamp: new Date().toISOString()
  });
};

/**
 * Async error wrapper for route handlers
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};