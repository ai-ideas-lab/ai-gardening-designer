import { getSmartPlantRecommendations, optimizeBalconyDesign, diagnosePlantHealth } from '../src/lib/aiRecommendations';
import { prismaMock } from './setup';

// Mock Prisma client
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => prismaMock),
}));

describe('AI Recommendations - 智能植物推荐', () => {
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
    },
    {
      id: '3',
      name: '兰花',
      scientificName: 'Orchidaceae',
      commonNames: ['蝴蝶兰'],
      category: '观赏花卉',
      light: 'partial-sun',
      water: 'moderate',
      temperature: { min: 18, max: 28 },
      humidity: { min: 50, max: 80 },
      soil: 'orchid-mix',
      growthRate: 'slow',
      matureSize: { height: 25, spread: 15 },
      difficulty: 3,
      description: '优雅的观赏花卉',
      careTips: ['需要高湿度环境', '使用专用营养土'],
      toxicity: 'non-toxic',
      benefits: ['elegant', 'air-purification'],
      imageUrl: '/images/orchid.jpg',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ];

  beforeEach(() => {
    prismaMock.plant.findMany.mockResolvedValue(mockPlants);
  });

  describe('getSmartPlantRecommendations', () => {
    it('应该为新手推荐低难度植物', async () => {
      const preferences = {
        balconySize: 10,
        skillLevel: 'beginner' as const,
        careTime: 2,
        budget: 100,
        preferences: ['easy-care']
      };

      const result = await getSmartPlantRecommendations(preferences);

      expect(result.success).toBe(true);
      expect(result.data.recommendations).toHaveLength(3);
      expect(result.data.recommendations[0].difficulty).toBeLessThanOrEqual(2);
      expect(result.data.recommendations[0].name).toBe('绿萝');
    });

    it('应该根据阳台朝向调整推荐', async () => {
      const preferences = {
        balconySize: 10,
        balconyDirection: 'north' as const,
        skillLevel: 'beginner' as const,
      };

      const result = await getSmartPlantRecommendations(preferences);

      expect(result.success).toBe(true);
      expect(result.data.recommendations).toHaveLength(1);
      expect(result.data.recommendations[0].light).toBe('low');
    });

    it('应该根据预算过滤植物', async () => {
      const preferences = {
        balconySize: 10,
        skillLevel: 'beginner' as const,
        budget: 30,
      };

      const result = await getSmartPlantRecommendations(preferences);

      expect(result.success).toBe(true);
      expect(result.data.recommendations.length).toBeGreaterThan(0);
      expect(result.data.recommendations[0].score).toBeGreaterThan(50);
    });

    it('应该处理错误情况', async () => {
      prismaMock.plant.findMany.mockRejectedValue(new Error('Database error'));

      const preferences = {
        balconySize: 10,
        skillLevel: 'beginner' as const,
      };

      const result = await getSmartPlantRecommendations(preferences);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('optimizeBalconyDesign', () => {
    it('应该为南向阳台设计布局', async () => {
      const balconyConfig = {
        size: { width: 3, height: 2.5, depth: 2 },
        direction: 'south' as const,
        budget: 500,
        userPreferences: {
          style: 'modern',
          focus: 'decorative',
          difficulty: 'easy'
        }
      };

      const result = await optimizeBalconyDesign(balconyConfig);

      expect(result.success).toBe(true);
      expect(result.data.design.primaryZones).toHaveLength(2);
      expect(result.data.budgetAllocation.plants).toBeGreaterThan(0);
      expect(result.data.lightUtilization).toBeGreaterThan(0.7);
    });

    it('应该为北向阳台设计布局', async () => {
      const balconyConfig = {
        size: { width: 2, height: 2.5, depth: 1.5 },
        direction: 'north' as const,
        budget: 300,
        userPreferences: {
          style: 'natural',
          focus: 'therapeutic',
          difficulty: 'medium'
        }
      };

      const result = await optimizeBalconyDesign(balconyConfig);

      expect(result.success).toBe(true);
      expect(result.data.design.primaryZones).toHaveLength(1);
      expect(result.data.spaceEfficiency).toBeGreaterThan(0.6);
    });

    it('应该为小型空间优化垂直利用', async () => {
      const balconyConfig = {
        size: { width: 1, height: 3, depth: 1 },
        direction: 'east' as const,
        budget: 200,
        userPreferences: {
          style: 'minimalist',
          focus: 'functional',
          difficulty: 'easy'
        }
      };

      const result = await optimizeBalconyDesign(balconyConfig);

      expect(result.success).toBe(true);
      expect(result.data.design.verticalSpace).toHaveLength(1);
      expect(result.data.totalCost).toBeLessThanOrEqual(200);
    });
  });

  describe('diagnosePlantHealth', () => {
    it('应该诊断叶片发黄问题', async () => {
      const plant = mockPlants[0];
      prismaMock.plant.findUnique.mockResolvedValue(plant);

      const symptoms = ['叶片发黄'];
      const environment = {
        light: 'low',
        water: 'frequent',
        temperature: 25,
        humidity: 80,
        recentChanges: ['最近换盆']
      };

      const result = await diagnosePlantHealth('1', symptoms, environment);

      expect(result.success).toBe(true);
      expect(result.data.problemIdentified).toBe('叶片发黄');
      expect(result.data.confidence).toBeGreaterThan(0.8);
      expect(result.data.possibleCauses).toContain('浇水过多导致根部腐烂');
    });

    it('应该诊断生长缓慢问题', async () => {
      const plant = mockPlants[2];
      prismaMock.plant.findUnique.mockResolvedValue(plant);

      const symptoms = ['生长缓慢'];
      const environment = {
        light: 'partial-sun',
        water: 'moderate',
        temperature: 22,
        humidity: 60
      };

      const result = await diagnosePlantHealth('3', symptoms, environment);

      expect(result.success).toBe(true);
      expect(result.data.problemIdentified).toBe('生长缓慢');
      expect(result.data.confidence).toBeGreaterThan(0.7);
    });

    it('应该处理植物不存在的情况', async () => {
      prismaMock.plant.findUnique.mockResolvedValue(null);

      const symptoms = ['叶片发黄'];
      const environment = {
        light: 'low',
        water: 'moderate',
        temperature: 25,
        humidity: 60
      };

      const result = await diagnosePlantHealth('999', symptoms, environment);

      expect(result.success).toBe(false);
      expect(result.error).toBe('植物未找到');
    });
  });
});