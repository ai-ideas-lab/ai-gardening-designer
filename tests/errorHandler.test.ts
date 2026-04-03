import { Request, Response, NextFunction } from 'express';
import * as errorHandler from '../src/middleware/errorHandler';
import { createMockRequest, createMockResponse } from './setup';

describe('Error Handler Middleware', () => {
  describe('errorHandler', () => {
    it('should handle validation errors', () => {
      const error = new Error('Validation failed');
      (error as any).status = 400;
      (error as any).type = 'validation';

      const req = createMockRequest();
      const res = createMockResponse();
      const next = jest.fn();

      errorHandler.errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: 'Validation failed'
      }));
    });

    it('should handle authentication errors', () => {
      const error = new Error('Authentication failed');
      (error as any).status = 401;
      (error as any).type = 'authentication';

      const req = createMockRequest();
      const res = createMockResponse();
      const next = jest.fn();

      errorHandler.errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: 'Authentication failed'
      }));
    });

    it('should handle authorization errors', () => {
      const error = new Error('Authorization failed');
      (error as any).status = 403;
      (error as any).type = 'authorization';

      const req = createMockRequest();
      const res = createMockResponse();
      const next = jest.fn();

      errorHandler.errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: 'Authorization failed'
      }));
    });

    it('should handle not found errors', () => {
      const error = new Error('Resource not found');
      (error as any).status = 404;
      (error as any).type = 'not_found';

      const req = createMockRequest();
      const res = createMockResponse();
      const next = jest.fn();

      errorHandler.errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: 'Resource not found'
      }));
    });

    it('should handle rate limiting errors', () => {
      const error = new Error('Rate limit exceeded');
      (error as any).status = 429;
      (error as any).type = 'rate_limit';

      const req = createMockRequest();
      const res = createMockResponse();
      const next = jest.fn();

      errorHandler.errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(429);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: expect.stringContaining('请求过于频繁')
      }));
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        retryAfter: expect.any(Number)
      }));
    });

    it('should handle database errors', () => {
      const error = new Error('Database operation failed');
      (error as any).status = 500;
      (error as any).type = 'database';

      const req = createMockRequest();
      const res = createMockResponse();
      const next = jest.fn();

      errorHandler.errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: expect.stringContaining('数据库操作失败')
      }));
    });

    it('should handle AI service errors', () => {
      const error = new Error('AI service unavailable');
      (error as any).status = 503;
      (error as any).type = 'ai_service';

      const req = createMockRequest();
      const res = createMockResponse();
      const next = jest.fn();

      errorHandler.errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(503);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: expect.stringContaining('AI服务不可用')
      }));
    });

    it('should handle default errors as internal server error', () => {
      const error = new Error('Unexpected error');

      const req = createMockRequest();
      const res = createMockResponse();
      const next = jest.fn();

      errorHandler.errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: expect.stringContaining('内部服务器错误')
      }));
    });

    it('should include error details in development mode', () => {
      process.env.NODE_ENV = 'development';

      const error = new Error('Detailed error');
      (error as any).status = 500;
      (error as any).stack = 'Error stack trace';

      const req = createMockRequest();
      const res = createMockResponse();
      const next = jest.fn();

      errorHandler.errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      const responseJson = res.json.mock.calls[0][0];
      expect(responseJson).toHaveProperty('stack');
      expect(responseJson.stack).toContain('Error stack trace');

      // Reset environment
      process.env.NODE_ENV = 'test';
    });

    it('should not include stack trace in production mode', () => {
      process.env.NODE_ENV = 'production';

      const error = new Error('Production error');
      (error as any).status = 500;
      (error as any).stack = 'Error stack trace';

      const req = createMockRequest();
      const res = createMockResponse();
      const next = jest.fn();

      errorHandler.errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      const responseJson = res.json.mock.calls[0][0];
      expect(responseJson).not.toHaveProperty('stack');

      // Reset environment
      process.env.NODE_ENV = 'test';
    });

    it('should handle async errors', async () => {
      const asyncError = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Async error'));
        }, 10);
      });

      const error = await asyncError.catch(e => e);
      (error as any).status = 500;

      const req = createMockRequest();
      const res = createMockResponse();
      const next = jest.fn();

      // Note: In real implementation, async errors need to be caught
      errorHandler.errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('should handle custom error properties', () => {
      const error = new Error('Custom error with details');
      (error as any).status = 400;
      (error as any).type = 'custom';
      (error as any).details = {
        field: 'email',
        message: 'Invalid email format'
      };

      const req = createMockRequest();
      const res = createMockResponse();
      const next = jest.fn();

      errorHandler.errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      const responseJson = res.json.mock.calls[0][0];
      expect(responseJson).toHaveProperty('details');
      expect(responseJson.details).toEqual({
        field: 'email',
        message: 'Invalid email format'
      });
    });

    it('should handle error without status code', () => {
      const error = new Error('Error without status');
      // No status property

      const req = createMockRequest();
      const res = createMockResponse();
      const next = jest.fn();

      errorHandler.errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('asyncHandler', () => {
    it('should handle successful async operation', async () => {
      const mockFunction = jest.fn().mockResolvedValue('success');
      const asyncHandler = errorHandler.asyncHandler(mockFunction);

      const req = createMockRequest();
      const res = createMockResponse();
      const next = jest.fn();

      await asyncHandler(req, res, next);

      expect(mockFunction).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle async operation with errors', async () => {
      const mockError = new Error('Async error');
      const mockFunction = jest.fn().mockRejectedValue(mockError);
      const asyncHandler = errorHandler.asyncHandler(mockFunction);

      const req = createMockRequest();
      const res = createMockResponse();
      const next = jest.fn();

      await asyncHandler(req, res, next);

      expect(mockFunction).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(mockError);
    });

    it('should handle async operation with response', async () => {
      const mockFunction = jest.fn().mockResolvedValue({
        status: 200,
        json: { success: true }
      });
      const asyncHandler = errorHandler.asyncHandler(mockFunction);

      const req = createMockRequest();
      const res = createMockResponse();
      const next = jest.fn();

      await asyncHandler(req, res, next);

      expect(mockFunction).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true });
    });
  });

  describe('createError', () => {
    it('should create a validation error', () => {
      const error = errorHandler.createError('validation', 'Invalid input');
      
      expect(error.message).toBe('Invalid input');
      expect(error.status).toBe(400);
      expect(error.type).toBe('validation');
    });

    it('should create an authentication error', () => {
      const error = errorHandler.createError('authentication', 'Invalid token');
      
      expect(error.message).toBe('Invalid token');
      expect(error.status).toBe(401);
      expect(error.type).toBe('authentication');
    });

    it('should create an authorization error', () => {
      const error = errorHandler.createError('authorization', 'Access denied');
      
      expect(error.message).toBe('Access denied');
      expect(error.status).toBe(403);
      expect(error.type).toBe('authorization');
    });

    it('should create a not found error', () => {
      const error = errorHandler.createError('not_found', 'Resource not found');
      
      expect(error.message).toBe('Resource not found');
      expect(error.status).toBe(404);
      expect(error.type).toBe('not_found');
    });

    it('should create a rate limit error', () => {
      const error = errorHandler.createError('rate_limit', 'Too many requests');
      
      expect(error.message).toBe('Too many requests');
      expect(error.status).toBe(429);
      expect(error.type).toBe('rate_limit');
      expect(error.retryAfter).toBeGreaterThan(0);
    });

    it('should create a database error', () => {
      const error = errorHandler.createError('database', 'Database error');
      
      expect(error.message).toBe('Database error');
      expect(error.status).toBe(500);
      expect(error.type).toBe('database');
    });

    it('should create an AI service error', () => {
      const error = errorHandler.createError('ai_service', 'AI service error');
      
      expect(error.message).toBe('AI service error');
      expect(error.status).toBe(503);
      expect(error.type).toBe('ai_service');
    });

    it('should create a custom error with details', () => {
      const details = { field: 'email', message: 'Invalid email' };
      const error = errorHandler.createError('validation', 'Validation failed', details);
      
      expect(error.message).toBe('Validation failed');
      expect(error.status).toBe(400);
      expect(error.type).toBe('validation');
      expect(error.details).toEqual(details);
    });

    it('should use default retry time for rate limit', () => {
      const error = errorHandler.createError('rate_limit', 'Too many requests');
      
      expect(error.retryAfter).toBe(60000); // Default 1 minute
    });

    it('should accept custom retry time for rate limit', () => {
      const retryAfter = 30000; // 30 seconds
      const error = errorHandler.createError('rate_limit', 'Too many requests', null, retryAfter);
      
      expect(error.retryAfter).toBe(retryAfter);
    });
  });

  describe('isOperationalError', () => {
    it('should identify operational errors', () => {
      const operationalError = new Error('Operational error');
      (operationalError as any).isOperational = true;

      expect(errorHandler.isOperationalError(operationalError)).toBe(true);
    });

    it('should identify non-operational errors', () => {
      const nonOperationalError = new Error('Non-operational error');

      expect(errorHandler.isOperationalError(nonOperationalError)).toBe(false);
    });

    it('should handle errors without isOperational property', () => {
      const error = new Error('Regular error');

      expect(errorHandler.isOperationalError(error)).toBe(false);
    });
  });

  describe('sanitizeError', () => {
    it('should sanitize error message', () => {
      const error = new Error('Error with <script>alert("xss")</script>');
      const sanitized = errorHandler.sanitizeError(error);

      expect(sanitized.message).not.toContain('<script>');
      expect(sanitized.message).not.toContain('alert');
    });

    it('should sanitize error details', () => {
      const error = new Error('Error');
      (error as any).details = {
        message: 'Error with <script>alert("xss")</script>',
        field: 'email'
      };

      const sanitized = errorHandler.sanitizeError(error);

      expect(sanitized.details.message).not.toContain('<script>');
      expect(sanitized.details.field).toBe('email');
    });

    it('should preserve non-string properties', () => {
      const error = new Error('Error');
      (error as any).details = {
        number: 42,
        boolean: true,
        array: [1, 2, 3],
        object: { key: 'value' }
      };

      const sanitized = errorHandler.sanitizeError(error);

      expect(sanitized.details.number).toBe(42);
      expect(sanitized.details.boolean).toBe(true);
      expect(sanitized.details.array).toEqual([1, 2, 3]);
      expect(sanitized.details.object).toEqual({ key: 'value' });
    });
  });
});