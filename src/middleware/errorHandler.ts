import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';
  const isOperational = error.isOperational || false;

  // Log error details
  console.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    statusCode,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
    isOperational
  });

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production' && !isOperational) {
    res.status(statusCode).json({
      error: 'Internal Server Error',
      message: 'Something went wrong. Please try again later.',
      timestamp: new Date().toISOString()
    });
  } else {
    // Development environment - include full error details
    res.status(statusCode).json({
      error: message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method
    });
  }
};

export const createError = (message: string, statusCode: number = 500, isOperational: boolean = true): AppError => {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.isOperational = isOperational;
  return error;
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};