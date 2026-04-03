import { Request, Response, NextFunction } from 'express';
import * as auth from '../src/middleware/auth';
import { createMockRequest, createMockResponse } from './setup';

// Mock JWT for testing
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
  sign: jest.fn()
}));

const { verify } = require('jsonwebtoken');

describe('Authentication Middleware', () => {
  describe('authenticateToken', () => {
    it('should authenticate valid token', () => {
      const mockUser = { id: 'user-id-123', email: 'test@example.com' };
      verify.mockReturnValue(mockUser);

      const req = createMockRequest(
        {},
        {},
        {},
        { authorization: 'Bearer valid-jwt-token' }
      );

      const res = createMockResponse();
      const next = jest.fn();

      auth.authenticateToken(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toEqual(mockUser);
    });

    it('should reject missing authorization header', () => {
      const req = createMockRequest(); // No authorization header

      const res = createMockResponse();
      const next = jest.fn();

      auth.authenticateToken(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: '缺少token'
      }));
    });

    it('should reject malformed authorization header', () => {
      const req = createMockRequest(
        {},
        {},
        {},
        { authorization: 'InvalidHeaderFormat' }
      );

      const res = createMockResponse();
      const next = jest.fn();

      auth.authenticateToken(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: 'token格式错误'
      }));
    });

    it('should reject invalid token', () => {
      verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const req = createMockRequest(
        {},
        {},
        {},
        { authorization: 'Bearer invalid-token' }
      );

      const res = createMockResponse();
      const next = jest.fn();

      auth.authenticateToken(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: '无效的token'
      }));
    });

    it('should handle expired token', () => {
      verify.mockImplementation(() => {
        throw new Error('jwt expired');
      });

      const req = createMockRequest(
        {},
        {},
        {},
        { authorization: 'Bearer expired-token' }
      );

      const res = createMockResponse();
      const next = jest.fn();

      auth.authenticateToken(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: 'token已过期'
      }));
    });

    it('should attach user to request object', () => {
      const mockUser = { id: 'user-id-123', email: 'test@example.com' };
      verify.mockReturnValue(mockUser);

      const req = createMockRequest(
        {},
        {},
        {},
        { authorization: 'Bearer valid-jwt-token' }
      );

      const res = createMockResponse();
      const next = jest.fn();

      auth.authenticateToken(req, res, next);

      expect(req.user).toEqual(mockUser);
    });
  });

  describe('optionalAuth', () => {
    it('should continue without token', () => {
      const req = createMockRequest(); // No authorization header

      const res = createMockResponse();
      const next = jest.fn();

      auth.optionalAuth(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeUndefined();
    });

    it('should authenticate with valid token', () => {
      const mockUser = { id: 'user-id-123', email: 'test@example.com' };
      verify.mockReturnValue(mockUser);

      const req = createMockRequest(
        {},
        {},
        {},
        { authorization: 'Bearer valid-jwt-token' }
      );

      const res = createMockResponse();
      const next = jest.fn();

      auth.optionalAuth(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toEqual(mockUser);
    });

    it('should continue with invalid token', () => {
      verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const req = createMockRequest(
        {},
        {},
        {},
        { authorization: 'Bearer invalid-token' }
      );

      const res = createMockResponse();
      const next = jest.fn();

      auth.optionalAuth(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeUndefined();
    });
  });

  describe('requireRole', () => {
    it('should allow user with required role', () => {
      const mockUser = { 
        id: 'user-id-123', 
        email: 'test@example.com',
        role: 'admin'
      };
      verify.mockReturnValue(mockUser);

      const req = createMockRequest(
        {},
        {},
        {},
        { authorization: 'Bearer valid-jwt-token' }
      );

      const res = createMockResponse();
      const next = jest.fn();

      auth.requireRole(['admin', 'moderator'])(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should reject user without required role', () => {
      const mockUser = { 
        id: 'user-id-123', 
        email: 'test@example.com',
        role: 'user'
      };
      verify.mockReturnValue(mockUser);

      const req = createMockRequest(
        {},
        {},
        {},
        { authorization: 'Bearer valid-jwt-token' }
      );

      const res = createMockResponse();
      const next = jest.fn();

      auth.requireRole(['admin'])(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: '权限不足'
      }));
    });

    it('should reject unauthenticated user', () => {
      const req = createMockRequest(); // No authorization header

      const res = createMockResponse();
      const next = jest.fn();

      auth.requireRole(['admin'])(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should allow multiple required roles', () => {
      const mockUser = { 
        id: 'user-id-123', 
        email: 'test@example.com',
        role: 'moderator'
      };
      verify.mockReturnValue(mockUser);

      const req = createMockRequest(
        {},
        {},
        {},
        { authorization: 'Bearer valid-jwt-token' }
      );

      const res = createMockResponse();
      const next = jest.fn();

      auth.requireRole(['admin', 'moderator', 'editor'])(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should work with single role requirement', () => {
      const mockUser = { 
        id: 'user-id-123', 
        email: 'test@example.com',
        role: 'admin'
      };
      verify.mockReturnValue(mockUser);

      const req = createMockRequest(
        {},
        {},
        {},
        { authorization: 'Bearer valid-jwt-token' }
      );

      const res = createMockResponse();
      const next = jest.fn();

      auth.requireRole(['admin'])(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('validateOwnership', () => {
    it('should allow ownership validation when user owns the resource', () => {
      const mockUser = { 
        id: 'user-id-123', 
        email: 'test@example.com'
      };
      verify.mockReturnValue(mockUser);

      const req = createMockRequest(
        {},
        {},
        {},
        { authorization: 'Bearer valid-jwt-token' }
      );

      // Simulate a request where the resource belongs to the user
      (req as any).resource = { userId: 'user-id-123' };

      const res = createMockResponse();
      const next = jest.fn();

      auth.validateOwnership(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should reject ownership validation when user does not own the resource', () => {
      const mockUser = { 
        id: 'user-id-123', 
        email: 'test@example.com'
      };
      verify.mockReturnValue(mockUser);

      const req = createMockRequest(
        {},
        {},
        {},
        { authorization: 'Bearer valid-jwt-token' }
      );

      // Simulate a request where the resource belongs to another user
      (req as any).resource = { userId: 'different-user-id' };

      const res = createMockResponse();
      const next = jest.fn();

      auth.validateOwnership(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: '您没有权限操作此资源'
      }));
    });

    it('should reject when resource has no userId', () => {
      const mockUser = { 
        id: 'user-id-123', 
        email: 'test@example.com'
      };
      verify.mockReturnValue(mockUser);

      const req = createMockRequest(
        {},
        {},
        {},
        { authorization: 'Bearer valid-jwt-token' }
      );

      // Simulate a resource without userId
      (req as any).resource = { someOtherField: 'value' };

      const res = createMockResponse();
      const next = jest.fn();

      auth.validateOwnership(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: '资源标识无效'
      }));
    });

    it('should reject when resource is not set', () => {
      const mockUser = { 
        id: 'user-id-123', 
        email: 'test@example.com'
      };
      verify.mockReturnValue(mockUser);

      const req = createMockRequest(
        {},
        {},
        {},
        { authorization: 'Bearer valid-jwt-token' }
      );

      // No resource set on request
      const res = createMockResponse();
      const next = jest.fn();

      auth.validateOwnership(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('rateLimiter', () => {
    beforeEach(() => {
      // Reset mock implementations
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should allow requests within rate limit', () => {
      const req = createMockRequest();
      const res = createMockResponse();
      const next = jest.fn();

      // First request - should pass
      auth.rateLimiter(req, res, next);
      expect(next).toHaveBeenCalled();

      // Reset next mock for next call
      next.mockClear();
      next.mockImplementation(() => {});

      // Second request - should pass
      auth.rateLimiter(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('should block requests that exceed rate limit', () => {
      const req = createMockRequest();
      const res = createMockResponse();
      const next = jest.fn();

      // Simulate too many requests
      for (let i = 0; i < 100; i++) { // Exceed typical rate limit
        auth.rateLimiter(req, res, next);
      }

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(429);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: expect.stringContaining('请求过于频繁')
      }));
    });

    it('should reset rate limit after cooldown', () => {
      const req = createMockRequest();
      const res = createMockResponse();
      const next = jest.fn();

      // Simulate rate limit exceeded
      for (let i = 0; i < 100; i++) {
        auth.rateLimiter(req, res, next);
      }
      expect(next).not.toHaveBeenCalled();

      // Advance time beyond cooldown
      jest.advanceTimersByTime(60000); // 1 minute

      // Reset next mock
      next.mockClear();
      next.mockImplementation(() => {});

      // Request should now pass
      auth.rateLimiter(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('should track different endpoints separately', () => {
      const req1 = createMockRequest(); // API endpoint
      const req2 = createMockRequest({}, {}, {}, {}, '/api/login'); // Login endpoint
      
      const res1 = createMockResponse();
      const res2 = createMockResponse();
      const next1 = jest.fn();
      const next2 = jest.fn();

      // Simulate many requests to first endpoint
      for (let i = 0; i < 50; i++) {
        auth.rateLimiter(req1, res1, next1);
      }
      expect(next1).toHaveBeenCalledTimes(50);

      // First endpoint should be blocked now
      next1.mockClear();
      next1.mockImplementation(() => {});
      auth.rateLimiter(req1, res1, next1);
      expect(next1).not.toHaveBeenCalled();

      // Second endpoint should still work
      auth.rateLimiter(req2, res2, next2);
      expect(next2).toHaveBeenCalled();
    });
  });

  describe('requestLogger', () => {
    it('should log request information', () => {
      const req = createMockRequest(
        {},
        { id: '123' },
        { page: '1' },
        { authorization: 'Bearer token' }
      );
      
      // Add mock method to req
      (req as any).method = 'GET';
      (req as any).path = '/api/test';
      (req as any).ip = '127.0.0.1';

      const res = createMockResponse();
      const next = jest.fn();

      // Mock console.log to capture log output
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      auth.requestLogger(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('GET /api/test')
      );

      consoleSpy.mockRestore();
    });

    it('should log response status after request completion', () => {
      const req = createMockRequest();
      (req as any).method = 'POST';
      (req as any).path = '/api/test';
      (req as any).ip = '127.0.0.1';

      const res = createMockResponse();
      const next = jest.fn();

      // Mock console.log
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      auth.requestLogger(req, res, next);

      // Simulate response completion
      res.status(201);
      res.json({ success: true });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('POST /api/test 201')
      );

      consoleSpy.mockRestore();
    });

    it('should handle errors in logging', () => {
      const req = createMockRequest();
      (req as any).method = 'GET';
      (req as any).path = '/api/test';

      const res = createMockResponse();
      const next = jest.fn();

      // Mock console.log to throw error
      const consoleSpy = jest.spyOn(console, 'log')
        .mockImplementationOnce(() => {
          throw new Error('Log error');
        })
        .mockImplementation();

      auth.requestLogger(req, res, next);

      expect(next).toHaveBeenCalled(); // Should not fail middleware chain
      consoleSpy.mockRestore();
    });
  });
});