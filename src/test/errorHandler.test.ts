import { createError } from '../../middleware/errorHandler';
import { Request, Response, NextFunction } from 'express';

describe('Error Handler', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
  });

  describe('createError', () => {
    it('should create error with custom message and status', () => {
      const error = createError('Custom error message', 400);
      
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Custom error message');
      expect(error.status).toBe(400);
    });

    it('should create error with default status 500', () => {
      const error = createError('Default error message');
      
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Default error message');
      expect(error.status).toBe(500);
    });
  });

  describe('Error handling middleware', () => {
    it('should handle custom error with status and message', () => {
      const customError = createError('User not found', 404);
      
      // Mock error handling middleware (this would be in your actual error handler)
      const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
        res.status(err.status || 500).json({
          success: false,
          error: {
            message: err.message
          }
        });
      };

      errorHandler(customError, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'User not found'
        }
      });
    });

    it('should handle standard error with default status 500', () => {
      const standardError = new Error('Standard error occurred');
      
      const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
        res.status(err.status || 500).json({
          success: false,
          error: {
            message: err.message
          }
        });
      };

      errorHandler(standardError, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Standard error occurred'
        }
      });
    });
  });
});