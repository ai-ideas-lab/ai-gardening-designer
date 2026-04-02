import { PrismaClient } from '@prisma/client';
import { aiRecommendations } from '../src/lib/aiRecommendations';
import { AIRecommendationService } from '../src/services/aiGardeningService';

// Mock Prisma client for unit tests
const prisma = new PrismaClient();

describe('AI Recommendation Service', () => {
  let aiService: AIRecommendationService;

  beforeAll(async () => {
    // Initialize AI service
    aiService = new AIRecommendationService();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('getBalconyDesignRecommendations', () => {
    test('should return balcony design recommendations for south-facing balcony', async () => {
      const balconyData = {
        size: 10,
        direction: 'south',
        location: 'Beijing',
        experience: 'intermediate',
        budget: 'medium'
      };

      const result = await aiService.getBalconyDesignRecommendations(balconyData);
      
      expect(result).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.recommendations).toBeDefined();
      expect(Array.isArray(result.recommendations)).toBe(true);
      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.suggestedPlants).toBeDefined();
      expect(Array.isArray(result.suggestedPlants)).toBe(true);
    });

    test('should return different recommendations for north-facing balcony', async () => {
      const balconyData = {
        size: 8,
        direction: 'north',
        location: 'Shanghai',
        experience: 'beginner',
        budget: 'low'
      };

      const result = await aiService.getBalconyDesignRecommendations(balconyData);
      
      expect(result).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.insights).toBeDefined();
      expect(result.insights.light).toContain('低光照');
    });

    test('should handle large balcony spaces', async () => {
      const balconyData = {
        size: 50,
        direction: 'east',
        location: 'Guangzhou',
        experience: 'advanced',
        budget: 'high'
      };

      const result = await aiService.getBalconyDesignRecommendations(balconyData);
      
      expect(result).toBeDefined();
      expect(result.suggestedPlants).toBeDefined();
      expect(result.suggestedPlants.length).toBeGreaterThan(0);
    });
  });

  describe('getPlantCareRecommendations', () => {
    test('should return care recommendations for watering', async () => {
      const careData = {
        plantId: 'test-plant',
        careType: 'watering',
        currentSeason: 'spring',
        environmentalData: {
          temperature: 22,
          humidity: 65,
          light: 'moderate'
        }
      };

      const result = await aiService.getPlantCareRecommendations(careData);
      
      expect(result).toBeDefined();
      expect(result.recommendations).toBeDefined();
      expect(Array.isArray(result.recommendations)).toBe(true);
      expect(result.frequency).toBeDefined();
      expect(result.warningSigns).toBeDefined();
      expect(Array.isArray(result.warningSigns)).toBe(true);
    });

    test('should return care recommendations for fertilizing', async () => {
      const careData = {
        plantId: 'test-plant',
        careType: 'fertilizing',
        currentSeason: 'summer',
        environmentalData: {
          temperature: 28,
          humidity: 70,
          light: 'full-sun'
        }
      };

      const result = await aiService.getPlantCareRecommendations(careData);
      
      expect(result).toBeDefined();
      expect(result.recommendations).toBeDefined();
      expect(result.productRecommendations).toBeDefined();
    });

    test('should handle different seasons for care recommendations', async () => {
      const winterData = {
        plantId: 'test-plant',
        careType: 'watering',
        currentSeason: 'winter',
        environmentalData: {
          temperature: 15,
          humidity: 40,
          light: 'low'
        }
      };

      const result = await aiService.getPlantCareRecommendations(winterData);
      
      expect(result).toBeDefined();
      expect(result.seasonalAdjustments).toBeDefined();
      expect(result.seasonalAdjustments).toContain('减少浇水频率');
    });
  });

  describe('getPlantSelectionRecommendations', () => {
    test('should return plant recommendations for beginners', async () => {
      const selectionData = {
        experience: 'beginner',
        space: 'balcony',
        balconyDirection: 'south',
        sunlightHours: 6,
        budget: 'low',
        maintenanceLevel: 'low'
      };

      const result = await aiService.getPlantSelectionRecommendations(selectionData);
      
      expect(result).toBeDefined();
      expect(result.recommendedPlants).toBeDefined();
      expect(Array.isArray(result.recommendedPlants)).toBe(true);
      expect(result.compatibilityScore).toBeDefined();
      expect(result.gardenLayout).toBeDefined();
    });

    test('should return recommendations for experienced gardeners', async () => {
      const selectionData = {
        experience: 'advanced',
        space: 'garden',
        balconyDirection: 'east',
        sunlightHours: 8,
        budget: 'high',
        maintenanceLevel: 'medium'
      };

      const result = await aiService.getPlantSelectionRecommendations(selectionData);
      
      expect(result).toBeDefined();
      expect(result.recommendedPlants.length).toBeGreaterThan(0);
      expect(result.advancedTips).toBeDefined();
    });

    test('should handle different space types', async () => {
      const indoorData = {
        experience: 'intermediate',
        space: 'indoor',
        balconyDirection: 'north',
        sunlightHours: 3,
        budget: 'medium',
        maintenanceLevel: 'low'
      };

      const result = await aiService.getPlantSelectionRecommendations(indoorData);
      
      expect(result).toBeDefined();
      expect(result.recommendedPlants.every((plant: any) => plant.category === 'indoor')).toBe(true);
    });
  });

  describe('getSeasonalGardeningAdvice', () => {
    test('should return spring gardening advice', async () => {
      const result = await aiService.getSeasonalGardeningAdvice('spring');
      
      expect(result).toBeDefined();
      expect(result.season).toBe('spring');
      expect(result.tasks).toBeDefined();
      expect(Array.isArray(result.tasks)).toBe(true);
      expect(result.plantingGuide).toBeDefined();
      expect(result.maintenanceTips).toBeDefined();
    });

    test('should return summer gardening advice', async () => {
      const result = await aiService.getSeasonalGardeningAdvice('summer');
      
      expect(result).toBeDefined();
      expect(result.season).toBe('summer');
      expect(result.tasks).toBeDefined();
      expect(result.heatProtectionTips).toBeDefined();
    });

    test('should return autumn gardening advice', async () => {
      const result = await aiService.getSeasonalGardeningAdvice('autumn');
      
      expect(result).toBeDefined();
      expect(result.season).toBe('autumn');
      expect(result.tasks).toBeDefined();
      expect(result.harvestingTips).toBeDefined();
    });

    test('should return winter gardening advice', async () => {
      const result = await aiService.getSeasonalGardeningAdvice('winter');
      
      expect(result).toBeDefined();
      expect(result.season).toBe('winter');
      expect(result.tasks).toBeDefined();
      expect(result.coldProtectionTips).toBeDefined();
    });
  });

  describe('getPestAndDiseaseDetection', () => {
    test('should return pest detection analysis', async () => {
      const symptoms = {
        plantType: 'tomato',
        leafSymptoms: ['yellowing', 'spots'],
        pestActivity: ['aphids', 'spider_mites'],
        environmentalData: {
          temperature: 25,
          humidity: 75,
          recentWeather: 'rainy'
        }
      };

      const result = await aiService.getPestAndDiseaseDetection(symptoms);
      
      expect(result).toBeDefined();
      expect(result.diagnosis).toBeDefined();
      expect(result.identifiedPests).toBeDefined();
      expect(Array.isArray(result.identifiedPests)).toBe(true);
      expect(result.treatmentPlan).toBeDefined();
      expect(result.preventionTips).toBeDefined();
    });

    test('should return disease detection analysis', async () => {
      const symptoms = {
        plantType: 'rose',
        leafSymptoms: ['black_spots', 'powdery_mildew'],
        pestActivity: [],
        environmentalData: {
          temperature: 20,
          humidity: 80,
          recentWeather: 'humid'
        }
      };

      const result = await aiService.getPestAndDiseaseDetection(symptoms);
      
      expect(result).toBeDefined();
      expect(result.identifiedDiseases).toBeDefined();
      expect(result.treatmentPlan).toBeDefined();
    });

    test('should handle healthy plant analysis', async () => {
      const healthySymptoms = {
        plantType: 'mint',
        leafSymptoms: [],
        pestActivity: [],
        environmentalData: {
          temperature: 22,
          humidity: 60,
          recentWeather: 'sunny'
        }
      };

      const result = await aiService.getPestAndDiseaseDetection(healthySymptoms);
      
      expect(result).toBeDefined();
      expect(result.status).toBe('healthy');
      expect(result.identifiedPests.length).toBe(0);
      expect(result.identifiedDiseases.length).toBe(0);
    });
  });

  describe('getGrowthProgressTracking', () => {
    test('should return growth analysis for plant', async () => {
      const growthData = {
        plantId: 'test-plant',
        currentHeight: 25,
        currentWidth: 15,
        plantingDate: new Date('2024-01-01'),
        photos: ['photo1.jpg', 'photo2.jpg'],
        careRecords: [
          { type: 'water', date: new Date('2024-01-05') },
          { type: 'fertilize', date: new Date('2024-01-10') }
        ]
      };

      const result = await aiService.getGrowthProgressTracking(growthData);
      
      expect(result).toBeDefined();
      expect(result.growthRate).toBeDefined();
      expect(result.healthScore).toBeDefined();
      expect(result.developmentStage).toBeDefined();
      expect(result.recommendations).toBeDefined();
    });

    test('should calculate growth rate correctly', async () => {
      const growthData = {
        plantId: 'test-plant',
        currentHeight: 30,
        currentWidth: 20,
        plantingDate: new Date('2024-01-01'),
        photos: [],
        careRecords: []
      };

      const result = await aiService.getGrowthProgressTracking(growthData);
      
      expect(result).toBeDefined();
      expect(result.growthRate).toBeDefined();
      expect(typeof result.growthRate).toBe('number');
    });
  });
});

describe('AI Recommendations Library', () => {
  test('should export AI recommendation functions', () => {
    expect(aiRecommendations).toBeDefined();
    expect(typeof aiRecommendations.getBalconyDesign).toBe('function');
    expect(typeof aiRecommendations.getPlantCare).toBe('function');
    expect(typeof aiRecommendations.getPlantSelection).toBe('function');
    expect(typeof aiRecommendations.getSeasonalAdvice).toBe('function');
    expect(typeof aiRecommendations.detectPestDisease).toBe('function');
    expect(typeof aiRecommendations.trackGrowth).toBe('function');
  });

  test('getBalconyDesign should return recommendations', async () => {
    const result = await aiRecommendations.getBalconyDesign({
      size: 10,
      direction: 'south',
      location: 'Beijing'
    });
    
    expect(result).toBeDefined();
    expect(result.recommendations).toBeDefined();
    expect(Array.isArray(result.recommendations)).toBe(true);
  });

  test('getPlantCare should return care instructions', async () => {
    const result = await aiRecommendations.getPlantCare({
      plantType: 'tomato',
      careType: 'watering'
    });
    
    expect(result).toBeDefined();
    expect(result.instructions).toBeDefined();
    expect(result.frequency).toBeDefined();
  });

  test('getPlantSelection should return plant recommendations', async () => {
    const result = await aiRecommendations.getPlantSelection({
      experience: 'beginner',
      space: 'balcony'
    });
    
    expect(result).toBeDefined();
    expect(result.recommendedPlants).toBeDefined();
    expect(Array.isArray(result.recommendedPlants)).toBe(true);
  });

  test('getSeasonalAdvice should return seasonal guidance', async () => {
    const result = await aiRecommendations.getSeasonalAdvice('spring');
    
    expect(result).toBeDefined();
    expect(result.tasks).toBeDefined();
    expect(Array.isArray(result.tasks)).toBe(true);
  });

  test('detectPestDisease should return pest detection', async () => {
    const result = await aiRecommendations.detectPestDisease({
      plantType: 'tomato',
      symptoms: ['yellow_leaves']
    });
    
    expect(result).toBeDefined();
    expect(result.diagnosis).toBeDefined();
  });

  test('trackGrowth should return growth analysis', async () => {
    const result = await aiRecommendations.trackGrowth({
      plantType: 'tomato',
      currentHeight: 25,
      plantingDays: 30
    });
    
    expect(result).toBeDefined();
    expect(result.growthRate).toBeDefined();
    expect(result.healthStatus).toBeDefined();
  });
});