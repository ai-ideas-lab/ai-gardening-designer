import { PrismaClient } from '@prisma/client';
import * as userController from '../src/controllers/userController';
import { setupTestDatabase, cleanupTestDatabase, getTestPrisma, createMockRequest, createMockResponse } from './setup';

const prisma = getTestPrisma();

describe('UserController', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
    await prisma.$disconnect();
  });

  describe('registerUser', () => {
    it('should register a new user successfully', async () => {
      const req = createMockRequest({
        email: 'newuser@example.com',
        username: 'newuser',
        password: 'password123',
        name: 'New User',
        location: 'Shanghai',
        balconyType: 'balcony',
        balconySize: 15.0,
        balconyDirection: 'east'
      });

      const res = createMockResponse();

      await userController.registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: '用户注册成功',
        data: expect.objectContaining({
          email: 'newuser@example.com',
          username: 'newuser',
          name: 'New User'
        })
      }));
    });

    it('should return error for duplicate email', async () => {
      const req = createMockRequest({
        email: 'test@example.com', // This email already exists in test data
        username: 'duplicateuser',
        password: 'password123',
        name: 'Duplicate User'
      });

      const res = createMockResponse();

      await userController.registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: expect.stringContaining('邮箱已存在')
      }));
    });

    it('should return error for invalid email format', async () => {
      const req = createMockRequest({
        email: 'invalid-email',
        username: 'testuser2',
        password: 'password123',
        name: 'Test User 2'
      });

      const res = createMockResponse();

      await userController.registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: expect.stringContaining('邮箱格式')
      }));
    });

    it('should return error for missing required fields', async () => {
      const req = createMockRequest({
        email: 'test@example.com',
        // Missing required fields like username, password
        name: 'Test User'
      });

      const res = createMockResponse();

      await userController.registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: expect.stringContaining('缺少必要字段')
      }));
    });
  });

  describe('loginUser', () => {
    it('should login user with correct credentials', async () => {
      const req = createMockRequest({
        email: 'test@example.com',
        password: 'password123'
      });

      const res = createMockResponse();

      await userController.loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: '登录成功',
        data: expect.objectContaining({
          user: expect.objectContaining({
            email: 'test@example.com'
          }),
          token: expect.any(String)
        })
      }));
    });

    it('should return error for invalid credentials', async () => {
      const req = createMockRequest({
        email: 'test@example.com',
        password: 'wrongpassword'
      });

      const res = createMockResponse();

      await userController.loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: '邮箱或密码错误'
      }));
    });

    it('should return error for non-existent user', async () => {
      const req = createMockRequest({
        email: 'nonexistent@example.com',
        password: 'password123'
      });

      const res = createMockResponse();

      await userController.loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: '邮箱或密码错误'
      }));
    });
  });

  describe('getUserProfile', () => {
    it('should get user profile successfully', async () => {
      // First login to get token
      const loginReq = createMockRequest({
        email: 'test@example.com',
        password: 'password123'
      });
      
      const loginRes = createMockResponse();
      await userController.loginUser(loginReq, loginRes);

      const token = loginRes.json.mock.calls[0][0].data.token;
      
      // Get profile
      const req = createMockRequest({}, {}, {}, { authorization: `Bearer ${token}` });
      const res = createMockResponse();

      await userController.getUserProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          email: 'test@example.com',
          username: 'testuser',
          name: 'Test User',
          location: 'Beijing',
          balconyType: 'balcony',
          balconySize: 10.5,
          balconyDirection: 'south'
        })
      }));
    });

    it('should return error for invalid token', async () => {
      const req = createMockRequest({}, {}, {}, { authorization: 'Bearer invalid-token' });
      const res = createMockResponse();

      await userController.getUserProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: '无效的token'
      }));
    });

    it('should return error for missing token', async () => {
      const req = createMockRequest();
      const res = createMockResponse();

      await userController.getUserProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: '缺少token'
      }));
    });
  });

  describe('updateUserProfile', () => {
    it('should update user profile successfully', async () => {
      // First login to get token
      const loginReq = createMockRequest({
        email: 'test@example.com',
        password: 'password123'
      });
      
      const loginRes = createMockResponse();
      await userController.loginUser(loginReq, loginRes);

      const token = loginRes.json.mock.calls[0][0].data.token;
      
      // Update profile
      const req = createMockRequest({
        name: 'Updated User',
        location: 'Shanghai',
        balconySize: 20.0
      }, {}, {}, { authorization: `Bearer ${token}` });
      
      const res = createMockResponse();

      await userController.updateUserProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: '用户信息更新成功',
        data: expect.objectContaining({
          name: 'Updated User',
          location: 'Shanghai',
          balconySize: 20.0
        })
      }));
    });

    it('should return error for invalid update data', async () => {
      // First login to get token
      const loginReq = createMockRequest({
        email: 'test@example.com',
        password: 'password123'
      });
      
      const loginRes = createMockResponse();
      await userController.loginUser(loginReq, loginRes);

      const token = loginRes.json.mock.calls[0][0].data.token;
      
      // Update with invalid data
      const req = createMockRequest({
        email: 'invalid@example.com' // Email cannot be updated
      }, {}, {}, { authorization: `Bearer ${token}` });
      
      const res = createMockResponse();

      await userController.updateUserProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      // First login to get token
      const loginReq = createMockRequest({
        email: 'test@example.com',
        password: 'password123'
      });
      
      const loginRes = createMockResponse();
      await userController.loginUser(loginReq, loginRes);

      const token = loginRes.json.mock.calls[0][0].data.token;
      
      // Change password
      const req = createMockRequest({
        currentPassword: 'password123',
        newPassword: 'newpassword123',
        confirmPassword: 'newpassword123'
      }, {}, {}, { authorization: `Bearer ${token}` });
      
      const res = createMockResponse();

      await userController.changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: '密码修改成功'
      }));
    });

    it('should return error for incorrect current password', async () => {
      // First login to get token
      const loginReq = createMockRequest({
        email: 'test@example.com',
        password: 'password123'
      });
      
      const loginRes = createMockResponse();
      await userController.loginUser(loginReq, loginRes);

      const token = loginRes.json.mock.calls[0][0].data.token;
      
      // Change with wrong current password
      const req = createMockRequest({
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword123',
        confirmPassword: 'newpassword123'
      }, {}, {}, { authorization: `Bearer ${token}` });
      
      const res = createMockResponse();

      await userController.changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: '当前密码错误'
      }));
    });

    it('should return error for password mismatch', async () => {
      // First login to get token
      const loginReq = createMockRequest({
        email: 'test@example.com',
        password: 'password123'
      });
      
      const loginRes = createMockResponse();
      await userController.loginUser(loginReq, loginRes);

      const token = loginRes.json.mock.calls[0][0].data.token;
      
      // Change with mismatched passwords
      const req = createMockRequest({
        currentPassword: 'password123',
        newPassword: 'newpassword123',
        confirmPassword: 'differentpassword'
      }, {}, {}, { authorization: `Bearer ${token}` });
      
      const res = createMockResponse();

      await userController.changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: '新密码和确认密码不匹配'
      }));
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      // First register a new user to delete
      const registerReq = createMockRequest({
        email: 'deleteuser@example.com',
        username: 'deleteuser',
        password: 'password123',
        name: 'Delete User'
      });

      const registerRes = createMockResponse();
      await userController.registerUser(registerReq, registerRes);

      const user = registerRes.json.mock.calls[0][0].data;
      
      // Login to get token
      const loginReq = createMockRequest({
        email: 'deleteuser@example.com',
        password: 'password123'
      });
      
      const loginRes = createMockResponse();
      await userController.loginUser(loginReq, loginRes);

      const token = loginRes.json.mock.calls[0][0].data.token;
      
      // Delete user
      const req = createMockRequest({}, {}, {}, { authorization: `Bearer ${token}` });
      const res = createMockResponse();

      await userController.deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: '用户删除成功'
      }));
    });
  });
});