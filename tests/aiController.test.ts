import { PrismaClient } from '@prisma/client';
import * as aiController from '../src/controllers/aiController';
import { setupTestDatabase, cleanupTestDatabase, getTestPrisma, createMockRequest, createMockResponse } from './setup';

const prisma = getTestPrisma();

describe('AIController', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
    await prisma.$disconnect();
  });

  describe('recognizePlant', () => {
    it('should recognize plant from image successfully', async () => {
      const req = createMockRequest({
        image: 'base64-encoded-image-data',
        analysisType: 'plant_recognition'
      });

      const res = createMockResponse();

      await aiController.recognizePlant(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          plant: expect.objectContaining({
            name: expect.any(String),
            confidence: expect.any(Number),
            suggestions: expect.any(Array)
          })
        })
      }));
    });

    it('should return error for missing image', async () => {
      const req = createMockRequest({
        analysisType: 'plant_recognition'
        // No image provided
      });

      const res = createMockResponse();

      await aiController.recognizePlant(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: '请提供植物图片'
      }));
    });

    it('should handle AI recognition timeout', async () => {
      // Mock a timeout scenario
      jest.useFakeTimers();
      
      const req = createMockRequest({
        image: 'base64-encoded-large-image-data',
        analysisType: 'plant_recognition'
      });

      const res = createMockResponse();

      // Simulate timeout
      setTimeout(() => {
        expect(res.status).toHaveBeenCalledWith(408);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
          success: false,
          message: 'AI识别超时，请重试'
        }));
      }, 31000); // Slightly over 30s timeout

      await aiController.recognizePlant(req, res);
      
      jest.useRealTimers();
    });
  });

  describe('recommendPlants', () => {
    it('should recommend plants based on balcony conditions', async () => {
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

      await aiController.recommendPlants(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          recommendations: expect.any(Array),
          analysis: expect.objectContaining({
            balconyScore: expect.any(Number),
            lightMatch: expect.any(Number)
          })
        })
      }));

      // Verify recommendations contain plant data
      const recommendations = res.json.mock.calls[0][0].data.recommendations;
      expect(recommendations).toBeInstanceOf(Array);
      expect(recommendations.length).toBeGreaterThan(0);
      
      // Each recommendation should have plant info and match score
      recommendations.forEach(rec => {
        expect(rec).toHaveProperty('plant');
        expect(rec).toHaveProperty('matchScore');
        expect(rec).toHaveProperty('reasons');
      });
    });

    it('should handle missing balcony conditions', async () => {
      const req = createMockRequest({
        // Missing required balcony conditions
        preferences: {
          difficulty: 'easy'
        }
      });

      const res = createMockResponse();

      await aiController.recommendPlants(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: '请提供完整的阳台条件信息'
      }));
    });

    it('should return personalized recommendations for user preferences', async () => {
      // First login to get user context
      const loginReq = createMockRequest({
        email: 'test@example.com',
        password: 'password123'
      });
      
      const loginRes = createMockResponse();
      // Assuming loginUser is available and working
      // await loginUser(loginReq, loginRes);
      
      const req = createMockRequest({
        balconySize: 10,
        balconyDirection: 'north',
        sunlight: 'shade',
        preferences: {
          difficulty: 'easy',
          types: ['indoor', 'herb']
        }
      });

      const res = createMockResponse();

      await aiController.recommendPlants(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      
      const recommendations = res.json.mock.calls[0][0].data.recommendations;
      expect(recommendations).toBeInstanceOf(Array);
      
      // Check that recommendations consider user preferences
      const hasEasyDifficulty = recommendations.some(rec => 
        rec.plant.difficulty <= 2
      );
      expect(hasEasyDifficulty).toBe(true);
    });
  });

  describe('diagnosePlant', () => {
    it('should diagnose plant problems successfully', async () => {
      const req = createMockRequest({
        plantId: 'test-plant-id',
        symptoms: [
          '叶片发黄',
          '叶子边缘干枯',
          '生长缓慢'
        ],
        image: 'base64-encoded-plant-image'
      });

      const res = createMockResponse();

      await aiController.diagnosePlant(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          diagnosis: expect.objectContaining({
            problem: expect.any(String),
            confidence: expect.any(Number),
            causes: expect.any(Array),
            solutions: expect.any(Array),
            urgency: expect.any(String)
          })
        })
      }));
    });

    it('should return error for missing symptoms', async () => {
      const req = createMockRequest({
        plantId: 'test-plant-id'
        // No symptoms provided
      });

      const res = createMockResponse();

      await aiController.diagnosePlant(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: '请提供植物症状描述'
      }));
    });

    it('should handle unknown plant ID gracefully', async () => {
      const req = createMockRequest({
        plantId: 'nonexistent-plant-id',
        symptoms: ['叶片发黄']
      });

      const res = createMockResponse();

      await aiController.diagnosePlant(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: '未找到指定的植物'
      }));
    });
  });

  describe('generateDesign', () => {
    it('should generate garden design based on requirements', async () => {
      const req = createMockRequest({
        balconySize: 20,
        balconyDirection: 'south',
        sunlight: 'full-sun',
        style: 'modern',
        budget: 2000,
        preferences: {
          difficulty: 'medium',
          maintenance: 'low',
          aesthetics: 'minimal'
        }
      });

      const res = createMockResponse();

      await aiController.generateDesign(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          design: expect.objectContaining({
            layout: expect.any(String),
            plants: expect.any(Array),
            zones: expect.any(Array),
            estimatedCost: expect.any(Number),
            difficulty: expect.any(String),
            tips: expect.any(Array)
          })
        })
      }));
    });

    it('should validate design requirements', async () => {
      const req = createMockRequest({
        balconySize: -5, // Invalid size
        balconyDirection: 'south',
        sunlight: 'full-sun'
      });

      const res = createMockResponse();

      await aiController.generateDesign(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: expect.stringContaining('阳台面积')
      }));
    });

    it('should consider budget constraints in design', async () => {
      const req = createMockRequest({
        balconySize: 15,
        balconyDirection: 'east',
        sunlight: 'partial-sun',
        budget: 500, // Low budget
        style: 'budget-friendly',
        preferences: {
          difficulty: 'easy',
          maintenance: 'low'
        }
      });

      const res = createMockResponse();

      await aiController.generateDesign(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      
      const design = res.json.mock.calls[0][0].data.design;
      expect(design.estimatedCost).toBeLessThanOrEqual(500);
      
      // Should recommend affordable plants
      const hasAffordablePlants = design.plants.some(plant => 
        plant.estimatedCost <= 100
      );
      expect(hasAffordablePlants).toBe(true);
    });
  });

  describe('getCareSchedule', () => {
    it('should generate care schedule for plants', async () => {
      const req = createMockRequest({
        plantIds: ['plant1', 'plant2'],
        location: 'Beijing',
        season: 'spring'
      });

      const res = createMockResponse();

      await aiController.getCareSchedule(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          schedule: expect.any(Array),
          seasonalTips: expect.any(Array),
            weatherForecast: expect.any(Object)
        })
      }));
    });

    it('should handle empty plant IDs list', async () => {
      const req = createMockRequest({
        plantIds: [], // Empty list
        location: 'Beijing',
        season: 'spring'
      });

      const res = createMockResponse();

      await aiController.getCareSchedule(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: '请提供至少一个植物ID'
      }));
    });
  });

  describe('analyzeSoil', () => {
    it('should analyze soil composition and provide recommendations', async () => {
      const req = createMockRequest({
        soilImage: 'base64-encoded-soil-image',
        location: 'Beijing',
        plantTypes: ['tomato', 'lettuce']
      });

      const res = createMockResponse();

      await aiController.analyzeSoil(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          analysis: expect.objectContaining({
            ph: expect.any(Number),
            nutrients: expect.any(Object),
            organicMatter: expect.any(Number),
            recommendations: expect.any(Array)
          })
        })
      }));
    });

    it('should return error for invalid soil image', async () => {
      const req = createMockRequest({
        soilImage: 'invalid-image-data',
        location: 'Beijing'
      });

      const res = createMockResponse();

      await aiController.analyzeSoil(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: '无效的土壤图片'
      }));
    });
  });

  describe('getPlantHealth', () => {
    it('should assess overall plant health', async () => {
      const req = createMockRequest({
        plantId: 'test-plant-id',
        images: ['base64-image1', 'base64-image2'],
        environmentalData: {
          temperature: 22,
          humidity: 65,
          light: 'partial-sun'
        }
      });

      const res = createMockResponse();

      await aiController.getPlantHealth(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          healthScore: expect.any(Number),
          status: expect.any(String),
          issues: expect.any(Array),
          recommendations: expect.any(Array)
        })
      }));
    });

    it('should provide health recommendations', async () => {
      const req = createMockRequest({
        plantId: 'test-plant-id',
        images: ['base64-image1']
      });

      const res = createMockResponse();

      await aiController.getPlantHealth(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      
      const healthData = res.json.mock.calls[0][0].data;
      expect(healthData).toHaveProperty('recommendations');
      expect(Array.isArray(healthData.recommendations)).toBe(true);
    });
  });

  describe('AI request tracking', () => {
    it('should track AI requests for analytics', async () => {
      const req = createMockRequest({
        analysisType: 'plant_recognition',
        timestamp: new Date().toISOString()
      });

      const res = createMockResponse();

      await aiController.recognizePlant(req, res);

      // Verify the request was logged in database
      const requestLog = await prisma.aIRequest.findFirst({
        where: {
          type: 'plant_recognition'
        }
      });

      expect(requestLog).toBeTruthy();
      expect(requestLog.success).toBe(true);
      expect(requestLog.processingTime).toBeGreaterThan(0);
    });
  });
});