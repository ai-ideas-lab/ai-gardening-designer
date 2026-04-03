import request from 'supertest';
import express from 'express';
import { prismaMock } from './setup';
import aiRoutes from '../src/routes/ai';
import authRoutes from '../src/routes/auth';
import plantRoutes from '../src/routes/plant';
import projectRoutes from '../src/routes/project';

// Mock Prisma client
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => prismaMock),
}));

// Create Express app
const app = express();
app.use(express.json());
app.use('/api/ai', aiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/plants', plantRoutes);
app.use('/api/projects', projectRoutes);

describe('AI Gardening Designer API Tests', () => {
  const mockPlants = [
    {
      id: '1',
      name: '绿萝',
      scientificName: 'Epipremnum aureum',
      commonNames: ['黄金葛'],
      category: '观叶植物',
      light: 'low',
      water: 'moderate',
      temperature: { min: 15, max: 25 },
      humidity: { min: 40, max: 70 },
      soil: 'well-draining',
      growthRate: 'medium',
      matureSize: { height: 30, spread: 20 },
      difficulty: 1,
      description: '易于养护的观叶植物',
      careTips: ['保持土壤微湿', '避免阳光直射'],
      toxicity: 'non-toxic',
      benefits: ['air-purification', 'easy-care'],
      imageUrl: '/images/pothos.jpg',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      name: '仙人掌',
      scientificName: 'Cactaceae',
      commonNames: ['仙人球'],
      category: '多肉植物',
      light: 'full-sun',
      water: 'minimal',
      temperature: { min: 10, max: 35 },
      humidity: { min: 20, max: 50 },
      soil: 'well-draining',
      growthRate: 'slow',
      matureSize: { height: 15, spread: 15 },
      difficulty: 1,
      description: '耐旱的多肉植物',
      careTips: ['少浇水，多阳光'],
      toxicity: 'non-toxic',
      benefits: ['low-maintenance', 'decorative'],
      imageUrl: '/images/cactus.jpg',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ];

  beforeEach(() => {
    prismaMock.plant.findMany.mockResolvedValue(mockPlants);
    prismaMock.plant.findUnique.mockImplementation(({ where }) => {
      return Promise.resolve(mockPlants.find(plant => plant.id === where.id));
    });
  });

  describe('Plant API', () => {
    it('GET /api/plants - 应该返回所有植物列表', async () => {
      const response = await request(app)
        .get('/api/plants')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].name).toBe('绿萝');
    });

    it('GET /api/plants/:id - 应该返回指定植物信息', async () => {
      const response = await request(app)
        .get('/api/plants/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('绿萝');
      expect(response.body.data.difficulty).toBe(1);
    });

    it('GET /api/plants/:id - 处理植物不存在的情况', async () => {
      prismaMock.plant.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/plants/999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Plant not found');
    });
  });

  describe('Project API', () => {
    const mockProject = {
      id: '1',
      name: '阳台花园设计',
      description: '打造美丽的阳台花园',
      status: 'planning',
      balconyJson: '{"size":{"width":3,"height":2.5,"depth":2},"direction":"south"}',
      designJson: '{"style":"modern","focus":"decorative"}',
      location: '北京市朝阳区',
      area: 7.5,
      budget: 500,
      startDate: new Date(),
      endDate: null,
      userId: 'user-123',
      createdAt: new Date(),
      updatedAt: new Date(),
      user: {
        id: 'user-123',
        email: 'test@example.com',
        name: '测试用户'
      },
      projectPlants: [],
      _count: {
        projectPlants: 0
      }
    };

    beforeEach(() => {
      prismaMock.project.findMany.mockResolvedValue([mockProject]);
      prismaMock.project.findUnique.mockResolvedValue(mockProject);
      prismaMock.project.create.mockResolvedValue(mockProject);
    });

    it('GET /api/projects - 应该返回所有项目列表', async () => {
      const response = await request(app)
        .get('/api/projects')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('阳台花园设计');
    });

    it('POST /api/projects - 应该创建新项目', async () => {
      const newProject = {
        name: '新阳台设计',
        description: '测试项目',
        balconyJson: { size: { width: 2, height: 2, depth: 1 } },
        location: '测试地址',
        area: 4,
        budget: 300,
        userId: 'user-123'
      };

      const response = await request(app)
        .post('/api/projects')
        .send(newProject)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('新阳台设计');
      expect(response.body.data.status).toBe('planning');
    });

    it('POST /api/projects - 处理缺少必需字段的情况', async () => {
      const incompleteProject = {
        description: '不完整的项目',
        location: '测试地址'
      };

      const response = await request(app)
        .post('/api/projects')
        .send(incompleteProject)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('AI Analysis API', () => {
    it('POST /api/ai/recommendations - 应该返回植物推荐', async () => {
      const preferences = {
        balconySize: 10,
        skillLevel: 'beginner',
        careTime: 2,
        budget: 100
      };

      const response = await request(app)
        .post('/api/ai/recommendations')
        .send(preferences)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.recommendations).toHaveLength(3);
      expect(response.body.algorithm).toBe('smart-matching-v1');
    });

    it('POST /api/ai/recommendations - 处理缺少必需字段的情况', async () => {
      const incompletePreferences = {
        balconySize: 10
        // 缺少 skillLevel
      };

      const response = await request(app)
        .post('/api/ai/recommendations')
        .send(incompletePreferences)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('skillLevel');
    });

    it('POST /api/ai/balcony-design - 应该返回阳台设计方案', async () => {
      const designRequest = {
        size: { width: 3, height: 2.5, depth: 2 },
        direction: 'south',
        budget: 500,
        userPreferences: {
          style: 'modern',
          focus: 'decorative',
          difficulty: 'easy'
        }
      };

      const response = await request(app)
        .post('/api/ai/balcony-design')
        .send(designRequest)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.design).toBeDefined();
      expect(response.body.data.totalCost).toBeDefined();
    });

    it('POST /api/ai/diagnose - 应该返回植物健康诊断', async () => {
      const diagnosisRequest = {
        plantId: '1',
        symptoms: ['叶片发黄'],
        environment: {
          light: 'low',
          water: 'moderate',
          temperature: 25,
          humidity: 60
        }
      };

      const response = await request(app)
        .post('/api/ai/diagnose')
        .send(diagnosisRequest)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.problemIdentified).toBe('叶片发黄');
      expect(response.body.data.confidence).toBeGreaterThan(0.7);
    });

    it('GET /api/ai/maintenance-tips/:plantId - 应该返回植物养护建议', async () => {
      const response = await request(app)
        .get('/api/ai/maintenance-tips/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.maintenanceTips.basicCare).toBeDefined();
      expect(response.body.data.currentSeason).toBeDefined();
    });

    it('POST /api/ai/compatibility - 应该返回植物相容性分析', async () => {
      const compatibilityRequest = {
        plantIds: ['1', '2'],
        conditions: {
          light: 'medium',
          water: 'moderate',
          temperature: 22
        }
      };

      const response = await request(app)
        .post('/api/ai/compatibility')
        .send(compatibilityRequest)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.analysis).toHaveLength(1);
      expect(response.body.data.overall).toBeDefined();
    });
  });

  describe('Health Check API', () => {
    it('GET /health - 应该返回系统健康状态', async () => {
      // Mock database connection
      prismaMock.$queryRaw.mockResolvedValue([1]);

      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('ok');
      expect(response.body.database).toBe('connected');
      expect(response.body.timestamp).toBeDefined();
    });

    it('GET /health - 处理数据库连接失败', async () => {
      prismaMock.$queryRaw.mockRejectedValue(new Error('Connection failed'));

      const response = await request(app)
        .get('/health')
        .expect(500);

      expect(response.body.status).toBe('error');
      expect(response.body.database).toBe('disconnected');
    });
  });

  describe('Error Handling', () => {
    it('应该处理404错误', async () => {
      const response = await request(app)
        .get('/api/nonexistent-endpoint')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Not Found');
    });

    it('应该处理JSON解析错误', async () => {
      const response = await request(app)
        .post('/api/ai/recommendations')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});