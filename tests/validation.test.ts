import { Request, Response, NextFunction } from 'express';
import * as validation from '../src/middleware/validation';
import { createMockRequest, createMockResponse } from './setup';

describe('Validation Middleware', () => {
  describe('validateRegisterUser', () => {
    it('should pass validation for valid registration data', () => {
      const req = createMockRequest({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        name: 'Test User'
      });

      const res = createMockResponse();
      const next = jest.fn();

      validation.validateRegisterUser(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should reject invalid email format', () => {
      const req = createMockRequest({
        email: 'invalid-email',
        username: 'testuser',
        password: 'password123',
        name: 'Test User'
      });

      const res = createMockResponse();
      const next = jest.fn();

      validation.validateRegisterUser(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: expect.stringContaining('邮箱格式')
      }));
    });

    it('should reject short password', () => {
      const req = createMockRequest({
        email: 'test@example.com',
        username: 'testuser',
        password: '123', // Too short
        name: 'Test User'
      });

      const res = createMockResponse();
      const next = jest.fn();

      validation.validateRegisterUser(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: expect.stringContaining('密码')
      }));
    });

    it('should reject missing required fields', () => {
      const req = createMockRequest({
        email: 'test@example.com',
        // Missing username, password, name
      });

      const res = createMockResponse();
      const next = jest.fn();

      validation.validateRegisterUser(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should reject duplicate email in request body', () => {
      const req = createMockRequest({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        email: 'test@example.com' // Duplicate field
      });

      const res = createMockResponse();
      const next = jest.fn();

      validation.validateRegisterUser(req, res, next);

      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('validateLogin', () => {
    it('should pass validation for valid login data', () => {
      const req = createMockRequest({
        email: 'test@example.com',
        password: 'password123'
      });

      const res = createMockResponse();
      const next = jest.fn();

      validation.validateLogin(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should reject missing email', () => {
      const req = createMockRequest({
        password: 'password123'
        // Missing email
      });

      const res = createMockResponse();
      const next = jest.fn();

      validation.validateLogin(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should reject missing password', () => {
      const req = createMockRequest({
        email: 'test@example.com'
        // Missing password
      });

      const res = createMockResponse();
      const next = jest.fn();

      validation.validateLogin(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('validatePlantRecognition', () => {
    it('should pass validation for plant recognition request', () => {
      const req = createMockRequest({
        image: 'base64-encoded-image-data',
        analysisType: 'plant_recognition'
      });

      const res = createMockResponse();
      const next = jest.fn();

      validation.validatePlantRecognition(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should reject missing image', () => {
      const req = createMockRequest({
        analysisType: 'plant_recognition'
        // Missing image
      });

      const res = createMockResponse();
      const next = jest.fn();

      validation.validatePlantRecognition(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: '请提供植物图片'
      }));
    });

    it('should reject invalid analysis type', () => {
      const req = createMockRequest({
        image: 'base64-encoded-image-data',
        analysisType: 'invalid_type'
      });

      const res = createMockResponse();
      const next = jest.fn();

      validation.validatePlantRecognition(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('validatePlantRecommendation', () => {
    it('should pass validation for plant recommendation request', () => {
      const req = createMockRequest({
        balconySize: 15,
        balconyDirection: 'south',
        sunlight: 'partial-sun'
      });

      const res = createMockResponse();
      const next = jest.fn();

      validation.validatePlantRecommendation(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should reject invalid balcony size', () => {
      const req = createMockRequest({
        balconySize: -5, // Invalid size
        balconyDirection: 'south',
        sunlight: 'partial-sun'
      });

      const res = createMockResponse();
      const next = jest.fn();

      validation.validatePlantRecommendation(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: expect.stringContaining('阳台面积')
      }));
    });

    it('should reject invalid balcony direction', () => {
      const req = createMockRequest({
        balconySize: 15,
        balconyDirection: 'invalid_direction',
        sunlight: 'partial-sun'
      });

      const res = createMockResponse();
      const next = jest.fn();

      validation.validatePlantRecommendation(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should validate optional preferences object', () => {
      const req = createMockRequest({
        balconySize: 15,
        balconyDirection: 'south',
        sunlight: 'partial-sun',
        preferences: {
          difficulty: 'easy',
          types: ['indoor', 'flower']
        }
      });

      const res = createMockResponse();
      const next = jest.fn();

      validation.validatePlantRecommendation(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should reject invalid preferences structure', () => {
      const req = createMockRequest({
        balconySize: 15,
        balconyDirection: 'south',
        sunlight: 'partial-sun',
        preferences: 'invalid_object' // Should be object, not string
      });

      const res = createMockResponse();
      const next = jest.fn();

      validation.validatePlantRecommendation(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('validateCommunityData', () => {
    it('should pass validation for valid community data', () => {
      const req = createMockRequest({
        name: '园艺爱好者社区',
        description: '分享园艺经验和技巧',
        isPublic: true,
        rules: '友善交流，禁止广告'
      });

      const res = createMockResponse();
      const next = jest.fn();

      validation.validateCommunityData(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should reject short community name', () => {
      const req = createMockRequest({
        name: 'ab', // Too short
        description: 'Very short community name'
      });

      const res = createMockResponse();
      const next = jest.fn();

      validation.validateCommunityData(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: expect.stringContaining('名称长度')
      }));
    });

    it('should reject invalid isPublic type', () => {
      const req = createMockRequest({
        name: 'Test Community',
        description: 'Test description',
        isPublic: 'yes' // Should be boolean
      });

      const res = createMockResponse();
      const next = jest.fn();

      validation.validateCommunityData(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('validatePostData', () => {
    it('should pass validation for valid post data', () => {
      const req = createMockRequest({
        title: '我的小阳台改造分享',
        content: '分享我的小阳台改造经验，从 barren 到绿意盎然...',
        imageUrl: 'https://example.com/balcony-before.jpg',
        tags: ['阳台改造', '绿植', 'DIY']
      });

      const res = createMockResponse();
      const next = jest.fn();

      validation.validatePostData(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should reject empty title', () => {
      const req = createMockRequest({
        title: '', // Empty title
        content: 'Post content'
      });

      const res = createMockResponse();
      const next = jest.fn();

      validation.validatePostData(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should reject short content', () => {
      const req = createMockRequest({
        title: 'Test Post',
        content: '短' // Too short
      });

      const res = createMockResponse();
      const next = jest.fn();

      validation.validatePostData(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should validate tags array', () => {
      const req = createMockRequest({
        title: 'Test Post',
        content: 'Post content',
        tags: ['tag1', 'tag2', 'tag3'] // Valid array
      });

      const res = createMockResponse();
      const next = jest.fn();

      validation.validatePostData(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should reject invalid tags format', () => {
      const req = createMockRequest({
        title: 'Test Post',
        content: 'Post content',
        tags: 'invalid_array' // Should be array
      });

      const res = createMockResponse();
      const next = jest.fn();

      validation.validatePostData(req, res, next);

      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('validateCommentData', () => {
    it('should pass validation for valid comment data', () => {
      const req = createMockRequest({
        content: '很好的分享！学到了很多',
        parentId: null
      });

      const res = createMockResponse();
      const next = jest.fn();

      validation.validateCommentData(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should reject empty content', () => {
      const req = createMockRequest({
        content: '', // Empty content
        parentId: null
      });

      const res = createMockResponse();
      const next = jest.fn();

      validation.validateCommentData(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should reject short content', () => {
      const req = createMockRequest({
        content: '短', // Too short
        parentId: null
      });

      const res = createMockResponse();
      const next = jest.fn();

      validation.validateCommentData(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should validate optional parentId', () => {
      const req = createMockRequest({
        content: 'Comment content',
        parentId: 'parent-id-123'
      });

      const res = createMockResponse();
      const next = jest.fn();

      validation.validateCommentData(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('validateReportData', () => {
    it('should pass validation for valid report data', () => {
      const req = createMockRequest({
        type: 'post',
        reason: '垃圾广告',
        description: '帖子中包含大量广告内容',
        targetId: 'post-id-123'
      });

      const res = createMockResponse();
      const next = jest.fn();

      validation.validateReportData(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should reject invalid report type', () => {
      const req = createMockRequest({
        type: 'invalid_type',
        reason: 'Test reason'
      });

      const res = createMockResponse();
      const next = jest.fn();

      validation.validateReportData(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should reject empty reason', () => {
      const req = createMockRequest({
        type: 'post',
        reason: '', // Empty reason
        description: 'Test description'
      });

      const res = createMockResponse();
      const next = jest.fn();

      validation.validateReportData(req, res, next);

      expect(next).not.toHaveBeenCalled();
    });

    it('should reject missing targetId', () => {
      const req = createMockRequest({
        type: 'post',
        reason: 'Test reason',
        description: 'Test description'
        // Missing targetId
      });

      const res = createMockResponse();
      const next = jest.fn();

      validation.validateReportData(req, res, next);

      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('validateGardenDesign', () => {
    it('should pass validation for valid garden design request', () => {
      const req = createMockRequest({
        balconySize: 20,
        balconyDirection: 'south',
        sunlight: 'full-sun',
        style: 'modern',
        budget: 2000
      });

      const res = createMockResponse();
      const next = jest.fn();

      validation.validateGardenDesign(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should reject negative budget', () => {
      const req = createMockRequest({
        balconySize: 20,
        balconyDirection: 'south',
        sunlight: 'full-sun',
        budget: -100 // Negative budget
      });

      const res = createMockResponse();
      const next = jest.fn();

      validation.validateGardenDesign(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should validate optional preferences', () => {
      const req = createMockRequest({
        balconySize: 20,
        balconyDirection: 'south',
        sunlight: 'full-sun',
        preferences: {
          difficulty: 'medium',
          maintenance: 'low'
        }
      });

      const res = createMockResponse();
      const next = jest.fn();

      validation.validateGardenDesign(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('validateEnvironmentalData', () => {
    it('should pass validation for valid environmental data', () => {
      const req = createMockRequest({
        temperature: 22,
        humidity: 65,
        light: 'partial-sun',
        location: 'Beijing'
      });

      const res = createMockResponse();
      const next = jest.fn();

      validation.validateEnvironmentalData(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should reject invalid temperature range', () => {
      const req = createMockRequest({
        temperature: 50, // Too high
        humidity: 65,
        light: 'partial-sun'
      });

      const res = createMockResponse();
      const next = jest.fn();

      validation.validateEnvironmentalData(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should validate light conditions', () => {
      const req = createMockRequest({
        temperature: 22,
        humidity: 65,
        light: 'invalid_light' // Invalid light condition
      });

      const res = createMockResponse();
      const next = jest.fn();

      validation.validateEnvironmentalData(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});