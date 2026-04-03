import { authenticate } from '../../middleware/auth';
import { Request, Response, NextFunction } from 'express';

// Mock the database
jest.mock('../../utils/database');
const mockPrisma = require('../../utils/database').prisma;

describe('Authentication Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
      body: {}
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
  });

  describe('when valid JWT token is provided', () => {
    it('should authenticate user successfully', async () => {
      const token = 'valid.jwt.token';
      mockRequest.headers = {
        authorization: `Bearer ${token}`
      };

      // Mock user database query
      const mockUser = {
        id: 'user1',
        name: 'Test User',
        email: 'test@example.com'
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      await authenticate(mockRequest as any, mockResponse as any, mockNext);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user1' }
      });
      expect(mockRequest.user).toEqual(mockUser);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle token without Bearer prefix', async () => {
      const token = 'valid.jwt.token';
      mockRequest.headers = {
        authorization: token
      };

      const mockUser = {
        id: 'user1',
        name: 'Test User',
        email: 'test@example.com'
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      await authenticate(mockRequest as any, mockResponse as any, mockNext);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user1' }
      });
      expect(mockRequest.user).toEqual(mockUser);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('when no token is provided', () => {
    it('should return 401 error', async () => {
      mockRequest.headers = {};

      await authenticate(mockRequest as any, mockResponse as any, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Access denied. No token provided.'
        }
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('when invalid token is provided', () => {
    it('should return 401 error for malformed token', async () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid.token'
      };

      mockPrisma.user.findUnique.mockResolvedValue(null);

      await authenticate(mockRequest as any, mockResponse as any, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Invalid token.'
        }
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('when user is not found', () => {
    it('should return 401 error', async () => {
      mockRequest.headers = {
        authorization: 'Bearer valid.token.but.user.not.found'
      };

      mockPrisma.user.findUnique.mockResolvedValue(null);

      await authenticate(mockRequest as any, mockResponse as any, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'User not found.'
        }
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('when database error occurs', () => {
    it('should return 500 error', async () => {
      mockRequest.headers = {
        authorization: 'Bearer valid.token'
      };

      mockPrisma.user.findUnique.mockRejectedValue(new Error('Database error'));

      await authenticate(mockRequest as any, mockResponse as any, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Internal server error'
        }
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});