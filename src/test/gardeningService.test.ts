/**
 * AI Gardening Service Test Suite
 * 
 * 测试AI园艺设计器的核心功能，包括：
 * - 智能植物推荐
 * - 养护提醒生成
 * - 植物健康诊断
 * - 空间环境分析
 */

import { AIRecommendationService, GardenHealthMonitor } from '@/services/aiGardeningService';
import { PrismaClient } from '@prisma/client';
import { mock } from 'jest-mock-extended';

// Mock dependencies
jest.mock('@/services/aiGardeningService');
jest.mock('@prisma/client');

const mockPrisma = mock<PrismaClient>();
const aiRecommendationService = new AIRecommendationService(mockPrisma);
const gardenHealthMonitor = new GardenHealthMonitor(mockPrisma);

describe('AI Gardening Service Tests', () => {
  // 测试数据
  const mockUser = {
    id: 'user1',
    name: '测试用户',
    email: 'test@example.com',
    location: '上海',
    preferences: {
      sunlight: 'medium',
      temperature: 'warm',
      difficulty: 'beginner',
      style: 'modern'
    }
  };

  const mockBalcony = {
    id: 'balcony1',
    userId: 'user1',
    location: '上海',
    area: 10,
    direction: 'south',
    sunlight: 6,
    humidity: 65,
    temperature: 22,
    flooring: 'tiles',
    hasShade: false,
    budget: 500
  };

  const mockPlants = [
    {
      id: 'plant1',
      name: '绿萝',
      scientificName: 'Epipremnum aureum',
      difficulty: 'easy',
      sunlight: ['low', 'medium'],
      temperature: [18, 30],
      humidity: [40, 80],
      watering: 'every 3-4 days',
      description: '非常适合室内养护的观叶植物',
      careLevel: 1,
      price: 30,
      imageUrl: '/images/plant1.jpg'
    },
    {
      id: 'plant2', 
      name: '吊兰',
      scientificName: 'Chlorophytum comosum',
      difficulty: 'easy',
      sunlight: ['low', 'medium'],
      temperature: [15, 25],
      humidity: [40, 70],
      watering: 'every 5-7 days',
      description: '净化空气效果很好的植物',
      careLevel: 1,
      price: 25,
      imageUrl: '/images/plant2.jpg'
    },
    {
      id: 'plant3',
      name: '薄荷',
      scientificName: 'Mentha',
      difficulty: 'medium',
      sunlight: ['medium', 'high'],
      temperature: [18, 28],
      humidity: [50, 80],
      watering: 'every 2 days',
      description: '香草植物，可以食用',
      careLevel: 2,
      price: 20,
      imageUrl: '/images/plant3.jpg'
    }
  ];

  describe('AI Plant Recommendation', () => {
    beforeEach(() => {
      mockPrisma.plant.findMany.mockResolvedValue(mockPlants);
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.balcony.findUnique.mockResolvedValue(mockBalcony);
    });

    it('should recommend plants based on balcony conditions', async () => {
      const recommendations = await aiRecommendationService.getRecommendations({
        userId: 'user1',
        balconyId: 'balcony1',
        preferences: mockUser.preferences
      });

      expect(recommendations).toBeDefined();
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations[0].confidence).toBeGreaterThan(0);
      expect(recommendations[0].fitScore).toBeGreaterThan(0);
    });

    it('should filter plants by difficulty level', async () => {
      const recommendations = await aiRecommendationService.getRecommendations({
        userId: 'user1',
        balconyId: 'balcony1',
        preferences: { ...mockUser.preferences, difficulty: 'beginner' }
      });

      // 应该只推荐容易养护的植物
      recommendations.forEach(rec => {
        expect(rec.plant.difficulty).toBe('easy');
      });
    });

    it('should score plants based on sunlight requirements', async () => {
      const recommendations = await aiRecommendationService.getRecommendations({
        userId: 'user1', 
        balconyId: 'balcony1',
        preferences: mockUser.preferences
      });

      // 东南向阳台，应该更推荐喜阳植物
      expect(recommendations).toBeDefined();
    });

    it('should handle insufficient data gracefully', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      
      await expect(
        aiRecommendationService.getRecommendations({
          userId: 'user1',
          balconyId: 'balcony1',
          preferences: mockUser.preferences
        })
      ).rejects.toThrow('User not found');
    });
  });

  describe('Garden Health Monitoring', () => {
    beforeEach(() => {
      mockPrisma.plant.findUnique.mockResolvedValue(mockPlants[0]);
      mockPrisma.reminder.findMany.mockResolvedValue([]);
    });

    it('should generate care reminders based on plant needs', async () => {
      const reminders = await gardenHealthMonitor.generateCareReminders({
        plantId: 'plant1',
        currentConditions: {
          sunlight: 6,
          temperature: 22,
          humidity: 65,
          soilMoisture: 50
        }
      });

      expect(reminders).toBeDefined();
      expect(Array.isArray(reminders)).toBe(true);
      
      // 检查是否有浇水提醒
      const wateringReminder = reminders.find(r => r.type === 'watering');
      expect(wateringReminder).toBeDefined();
    });

    it('should detect plant health issues', async () => {
      const healthStatus = await gardenHealthMonitor.checkPlantHealth({
        plantId: 'plant1',
        symptoms: [
          { type: 'leafColor', value: 'yellow' },
          { type: 'wilting', value: true }
        ]
      });

      expect(healthStatus).toBeDefined();
      expect(healthStatus.overallHealth).toBeLessThan(100);
      expect(healthStatus.issues).toBeDefined();
      expect(Array.isArray(healthStatus.issues)).toBe(true);
    });

    it('should provide maintenance recommendations', async () => {
      const recommendations = await gardenHealthMonitor.getMaintenanceAdvice({
        plantId: 'plant1',
        season: 'spring',
        careHistory: []
      });

      expect(recommendations).toBeDefined();
      expect(Array.isArray(recommendations)).toBe(true);
      
      // 检查是否有季节性建议
      const seasonalAdvice = recommendations.find(r => r.seasonal);
      expect(seasonalAdvice).toBeDefined();
    });

    it('should track plant growth progress', async () => {
      const growthProgress = await gardenHealthMonitor.trackGrowth({
        plantId: 'plant1',
        measurements: [
          { date: '2026-04-01', height: 15 },
          { date: '2026-04-03', height: 16 }
        ]
      });

      expect(growthProgress).toBeDefined();
      expect(growthProgress.averageGrowthRate).toBeGreaterThan(0);
      expect(growthProgress.healthTrend).toBeDefined();
    });
  });

  describe('Space Analysis', () => {
    it('should analyze balcony layout optimization', async () => {
      const layout = await aiRecommendationService.analyzeSpaceLayout({
        balcony: mockBalcony,
        selectedPlants: mockPlants.slice(0, 2)
      });

      expect(layout).toBeDefined();
      expect(layout.spaceEfficiency).toBeGreaterThan(0);
      expect(layout.suggestions).toBeDefined();
      expect(Array.isArray(layout.suggestions)).toBe(true);
    });

    it('should calculate planting capacity', async () => {
      const capacity = await aiRecommendationService.calculatePlantingCapacity({
        area: mockBalcony.area,
        plantType: 'small',
        spacing: 20
      });

      expect(capacity).toBeDefined();
      expect(capacity.maxPlants).toBeGreaterThan(0);
      expect(capacity.spaceUtilization).toBeGreaterThan(0);
    });
  });

  describe('Seasonal Gardening', () => {
    it('should provide seasonal gardening advice', async () => {
      const advice = await aiRecommendationService.getSeasonalAdvice({
        location: '上海',
        season: 'spring',
        userDifficulty: 'beginner'
      });

      expect(advice).toBeDefined();
      expect(advice.currentSeason).toBe('spring');
      expect(advice.recommendedPlants).toBeDefined();
      expect(advice.careTips).toBeDefined();
    });

    it('should handle seasonal plant transitions', async () => {
      const transitions = await aiRecommendationService.getSeasonalTransitions({
        location: '上海',
        currentSeason: 'winter',
        nextSeason: 'spring'
      });

      expect(transitions).toBeDefined();
      expect(transitions.plantsToAdd).toBeDefined();
      expect(transitions.plantsToRemove).toBeDefined();
      expect(transitions.careChanges).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid plant data', async () => {
      mockPrisma.plant.findUnique.mockResolvedValue(null);
      
      await expect(
        gardenHealthMonitor.generateCareReminders({
          plantId: 'invalid-plant-id',
          currentConditions: {
            sunlight: 6,
            temperature: 22,
            humidity: 65,
            soilMoisture: 50
          }
        })
      ).rejects.toThrow('Plant not found');
    });

    it('should handle extreme environmental conditions', async () => {
      const extremeConditions = {
        sunlight: 15, // 过高
        temperature: 40, // 过高
        humidity: 20, // 过低
        soilMoisture: 10 // 过低
      };

      const warnings = await gardenHealthMonitor.generateCareReminders({
        plantId: 'plant1',
        currentConditions: extremeConditions
      });

      // 应该有环境警告
      const environmentalWarnings = warnings.filter(w => w.priority === 'high');
      expect(environmentalWarnings.length).toBeGreaterThan(0);
    });
  });

  describe('Performance Testing', () => {
    it('should generate recommendations efficiently', async () => {
      const startTime = Date.now();
      
      await aiRecommendationService.getRecommendations({
        userId: 'user1',
        balconyId: 'balcony1',
        preferences: mockUser.preferences
      });

      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // 响应时间应该在1秒以内
      expect(duration).toBeLessThan(1000);
    });

    it('should handle large plant databases', async () => {
      // 模拟大量植物数据
      const largePlantDatabase = Array(100).fill(null).map((_, i) => ({
        id: `plant${i}`,
        name: `植物${i}`,
        difficulty: i % 3 === 0 ? 'easy' : 'medium',
        sunlight: ['medium'],
        temperature: [20, 25],
        humidity: [50, 70],
        watering: 'every 3 days',
        description: `植物${i}的描述`,
        careLevel: i % 3 + 1,
        price: i * 5,
        imageUrl: `/images/plant${i}.jpg`
      }));

      mockPrisma.plant.findMany.mockResolvedValue(largePlantDatabase);

      const recommendations = await aiRecommendationService.getRecommendations({
        userId: 'user1',
        balconyId: 'balcony1',
        preferences: mockUser.preferences
      });

      expect(recommendations).toBeDefined();
      expect(recommendations.length).toBeGreaterThan(0);
    });
  });
});