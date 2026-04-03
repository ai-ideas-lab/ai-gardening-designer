import express from 'express';
import { PrismaClient } from '@prisma/client';
import { 
  getSmartPlantRecommendations, 
  optimizeBalconyDesign, 
  diagnosePlantHealth 
} from '../lib/aiRecommendations';
import { aiGardeningService } from '../services/aiGardeningService';
import { createError } from '../middleware/errorHandler';

const prisma = new PrismaClient();
const router = express.Router();

// Middleware to track request start time
const trackStartTime = (req: any, res: any, next: any) => {
  req.startTime = Date.now();
  next();
};

/**
 * 获取智能植物推荐
 * POST /api/ai/recommendations
 * 
 * 请求体示例:
 * {
 *   balconyType: "small",
 *   balconySize: 10,
 *   balconyDirection: "south", 
 *   skillLevel: "beginner",
 *   careTime: 2,
 *   budget: 100,
 *   preferences: ["air-purification", "easy-care"]
 * }
 */
router.post('/recommendations', trackStartTime, async (req, res) => {
  try {
    const userPreferences = req.body;
    
    // 验证必需字段
    if (!userPreferences.balconySize || !userPreferences.skillLevel) {
      return res.status(400).json({
        success: false,
        error: '缺少必需字段: balconySize, skillLevel',
        timestamp: new Date().toISOString()
      });
    }
    
    const result = await getSmartPlantRecommendations(userPreferences);
    
    res.json({
      success: result.success,
      data: result.data,
      message: result.message,
      timestamp: new Date().toISOString(),
      algorithm: 'smart-matching-v1',
      processingTime: Date.now() - (req as any).startTime
    });
    
  } catch (error) {
    console.error('植物推荐API错误:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * 优化阳台设计方案
 * POST /api/ai/balcony-design
 * 
 * 请求体示例:
 * {
 *   size: { width: 3, height: 2.5, depth: 2 },
 *   direction: "south",
 *   budget: 500,
 *   userPreferences: {
 *     style: "modern",
 *     focus: "decorative",
 *     difficulty: "easy"
 *   }
 * }
 */
router.post('/balcony-design', trackStartTime, async (req, res) => {
  try {
    const { size, direction, budget, userPreferences } = req.body;
    
    // 验证必需字段
    if (!size || !direction || !budget || !userPreferences) {
      return res.status(400).json({
        success: false,
        error: '缺少必需字段: size, direction, budget, userPreferences',
        timestamp: new Date().toISOString()
      });
    }
    
    const balconyConfig = {
      size,
      direction,
      budget,
      userPreferences
    };
    
    const result = await optimizeBalconyDesign(balconyConfig);
    
    res.json({
      success: result.success,
      data: result.data,
      message: result.message,
      timestamp: new Date().toISOString(),
      algorithm: 'space-optimization-v1',
      processingTime: Date.now() - (req as any).startTime
    });
    
  } catch (error) {
    console.error('阳台设计API错误:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * 植物健康诊断
 * POST /api/ai/diagnose
 * 
 * 请求体示例:
 * {
 *   plantId: "plant-id-123",
 *   symptoms: ["叶片发黄", "生长缓慢"],
 *   environment: {
 *     light: "medium",
 *     water: "moderate", 
 *     temperature: 25,
 *     humidity: 60,
 *     recentChanges: ["最近换盆", "施肥"]
 *   }
 * }
 */
router.post('/diagnose', trackStartTime, async (req, res) => {
  try {
    const { plantId, symptoms, environment } = req.body;
    
    // 验证必需字段
    if (!plantId || !symptoms || !environment) {
      return res.status(400).json({
        success: false,
        error: '缺少必需字段: plantId, symptoms, environment',
        timestamp: new Date().toISOString()
      });
    }
    
    const result = await diagnosePlantHealth(plantId, symptoms, environment);
    
    res.json({
      success: result.success,
      data: result.data,
      message: result.message,
      timestamp: new Date().toISOString(),
      algorithm: 'health-diagnosis-v1',
      processingTime: Date.now() - (req as any).startTime
    });
    
  } catch (error) {
    console.error('健康诊断API错误:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * 获取植物维护建议
 * GET /api/ai/maintenance-tips/:plantId
 */
router.get('/maintenance-tips/:plantId', async (req, res) => {
  try {
    const { plantId } = req.params;
    
    const plant = await prisma.plant.findUnique({
      where: { id: plantId },
      include: {
        knowledge: {
          where: { category: 'care' },
          orderBy: { difficulty: 'asc' }
        },
        seasons: true
      }
    });
    
    if (!plant) {
      return res.status(404).json({
        success: false,
        error: '植物未找到',
        timestamp: new Date().toISOString()
      });
    }
    
    // 获取当前季节
    const currentSeason = getCurrentSeason();
    
    // 生成维护建议
    const maintenanceTips = {
      basicCare: {
        watering: plant.water === 'frequent' ? '每天浇水，保持土壤湿润' :
                plant.water === 'moderate' ? '每2-3天浇水一次，保持土壤微湿' :
                '每5-7天浇水一次，宁干勿湿',
        light: plant.light === 'full-sun' ? '需要充足的直射阳光' :
              plant.light === 'partial-sun' ? '喜欢明亮的散射光' :
              plant.light === 'partial-shade' ? '喜欢半阴环境' :
              '耐阴性强，适合室内环境',
        fertilizing: plant.growthRate === 'fast' ? '每月施肥2次，使用平衡肥料' :
                   plant.growthRate === 'medium' ? '每月施肥1次' :
                   '每2-3个月施肥1次，少量即可'
      },
      seasonalCare: plant.seasons.filter(season => season.season === currentSeason),
      warnings: [],
      tips: plant.knowledge.map(knowledge => ({
        title: knowledge.title,
        content: knowledge.content,
        difficulty: knowledge.difficulty,
        category: knowledge.category
      }))
    };
    
    // 根据植物特性添加警告
    if (plant.toxicity === 'toxic-to-pets') {
      (maintenanceTips.warnings as string[]).push('注意：该植物对宠物有毒，请放置在宠物无法接触的地方');
    }
    
    if (plant.difficulty >= 4) {
      (maintenanceTips.warnings as string[]).push('该植物需要较高养护技能，建议有经验的园艺爱好者尝试');
    }
    
    res.json({
      success: true,
      data: {
        plant: {
          id: plant.id,
          name: plant.name,
          category: plant.category,
          difficulty: plant.difficulty
        },
        currentSeason,
        maintenanceTips,
        estimatedWeeklyTime: plant.difficulty * 0.5 + 1 // 根据难度估算每周所需时间
      },
      message: `为${plant.name}生成个性化维护建议`,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('维护建议API错误:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * 获取植物相容性分析
 * POST /api/ai/compatibility
 * 
 * 请求体示例:
 * {
 *   plantIds: ["plant-id-1", "plant-id-2"],
 *   conditions: {
 *     light: "medium",
 *     water: "moderate",
 *     temperature: 22
 *   }
 * }
 */
router.post('/compatibility', async (req, res) => {
  try {
    const { plantIds, conditions } = req.body;
    
    if (!plantIds || plantIds.length < 2) {
      return res.status(400).json({
        success: false,
        error: '至少需要2种植物进行相容性分析',
        timestamp: new Date().toISOString()
      });
    }
    
    const plants = await prisma.plant.findMany({
      where: { id: { in: plantIds } }
    });
    
    if (plants.length < 2) {
      return res.status(404).json({
        success: false,
        error: '部分植物未找到',
        timestamp: new Date().toISOString()
      });
    }
    
    const compatibility = {
      overall: 'good',
      score: 0,
      analysis: [] as Array<{
        plant1: string;
        plant2: string;
        compatibility: 'excellent' | 'good' | 'fair' | 'poor';
        reason: string;
      }>,
      recommendations: [] as string[]
    };
    
    // 分析每对植物的相容性
    for (let i = 0; i < plants.length; i++) {
      for (let j = i + 1; j < plants.length; j++) {
        const plant1 = plants[i];
        const plant2 = plants[j];
        
        let score = 50; // 基础分
        let compatibilityLevel: 'excellent' | 'good' | 'fair' | 'poor' = 'good';
        let reason = '';
        
        // 光照需求匹配
        if (plant1.light === plant2.light) {
          score += 20;
          compatibilityLevel = 'excellent';
          reason = `两者都喜欢${plant1.light}环境，光照需求一致`;
        } else if (Math.abs(['full-sun', 'partial-sun', 'partial-shade', 'low'].indexOf(plant1.light) - 
                         ['full-sun', 'partial-sun', 'partial-shade', 'low'].indexOf(plant2.light)) <= 1) {
          score += 10;
          compatibilityLevel = 'good';
          reason = `光照需求相近，可以协调种植`;
        } else {
          score -= 15;
          compatibilityLevel = 'poor';
          reason = `光照需求差异较大，难以协调`;
        }
        
        // 水分需求匹配
        if (plant1.water === plant2.water) {
          score += 20;
          compatibilityLevel = compatibilityLevel === 'excellent' ? 'excellent' : 'good';
          reason += '，水分需求一致';
        } else {
          score -= 10;
          reason += '，水分需求需要调整';
        }
        
        // 难度匹配
        if (Math.abs(plant1.difficulty - plant2.difficulty) <= 1) {
          score += 10;
          reason += '，养护难度相近';
        } else {
          score -= 5;
          reason += '，养护难度差异较大';
        }
        
        // 更新总分
        if (score > compatibility.score) {
          compatibility.score = score;
        }
        
        compatibility.analysis.push({
          plant1: plant1.name,
          plant2: plant2.name,
          compatibility: compatibilityLevel,
          reason
        });
      }
    }
    
    // 根据总分确定整体相容性
    if (compatibility.score >= 70) {
      compatibility.overall = 'excellent';
    } else if (compatibility.score >= 50) {
      compatibility.overall = 'good';
    } else if (compatibility.score >= 30) {
      compatibility.overall = 'fair';
    } else {
      compatibility.overall = 'poor';
    }
    
    // 生成建议
    compatibility.recommendations = generateCompatibilityRecommendations(plants, conditions);
    
    res.json({
      success: true,
      data: compatibility,
      message: `完成${plants.length}种植物相容性分析`,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('相容性分析API错误:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message,
      timestamp: new Date().toISOString()
    });
  }
});

// 辅助函数：获取当前季节
function getCurrentSeason(): string {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
}

// 辅助函数：生成相容性建议
function generateCompatibilityRecommendations(plants: any[], conditions: any): string[] {
  const recommendations: string[] = [];
  
  // 检查是否有毒性植物
  const toxicPlants = plants.filter(p => p.toxicity && p.toxicity !== 'non-toxic');
  if (toxicPlants.length > 0) {
    recommendations.push(`注意：${toxicPlants.map(p => p.name).join('、')}有毒性，请谨慎种植`);
  }
  
  // 检查空间需求
  const totalMatureSize = plants.reduce((sum, plant) => {
    const size = plant.matureSize ? JSON.parse(plant.matureSize) : { height: 20, spread: 20 };
    return sum + parseInt(size.height || 20) + parseInt(size.spread || 20);
  }, 0);
  
  if (totalMatureSize > 200) {
    recommendations.push('这些植物成熟后空间需求较大，建议分批种植或选择较小的品种');
  }
  
  // 光照建议
  const lightLevels = plants.map(p => p.light);
  if (lightLevels.includes('full-sun') && lightLevels.includes('low')) {
    recommendations.push('建议使用分区种植，将喜阳和耐阴植物分开摆放');
  }
  
  return recommendations;
}

/**
 * 智能植物问题诊断
 * POST /api/ai/diagnose-problem
 * 
 * 请求体示例:
 * {
 *   plantId: "plant-id-123",
 *   problemDescription: "叶片发黄，生长缓慢，有斑点",
 *   image?: "base64-encoded-image" (可选)
 * }
 */
router.post('/diagnose-problem', trackStartTime, async (req, res) => {
  try {
    const { plantId, problemDescription, image } = req.body;
    
    // 验证必需字段
    if (!plantId || !problemDescription) {
      return res.status(400).json({
        success: false,
        error: '缺少必需字段: plantId, problemDescription',
        timestamp: new Date().toISOString()
      });
    }
    
    let imageBuffer;
    if (image) {
      // 将base64图像转换为Buffer
      const base64Data = image.replace(/^data:image\/[a-z]+;base64,/, "");
      imageBuffer = Buffer.from(base64Data, 'base64');
    }
    
    const result = await aiGardeningService.diagnosePlantProblem(
      plantId,
      problemDescription,
      imageBuffer
    );
    
    res.json({
      success: true,
      data: result,
      message: '完成植物问题诊断',
      timestamp: new Date().toISOString(),
      algorithm: 'smart-diagnosis-v1',
      processingTime: Date.now() - (req as any).startTime
    });
    
  } catch (error) {
    console.error('植物问题诊断API错误:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * 个性化植物护理建议
 * POST /api/ai/personalized-care
 * 
 * 请求体示例:
 * {
 *   userId: "user-id-123",
 *   plantId?: "plant-id-123" (可选，指定特定植物)
 * }
 */
router.post('/personalized-care', trackStartTime, async (req, res) => {
  try {
    const { userId, plantId } = req.body;
    
    // 验证必需字段
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: '缺少必需字段: userId',
        timestamp: new Date().toISOString()
      });
    }
    
    const result = await aiGardeningService.getPersonalizedCareRecommendations(
      userId,
      plantId
    );
    
    res.json({
      success: true,
      data: result,
      message: plantId 
        ? `为植物ID ${plantId} 生成个性化护理建议`
        : '为用户生成全面个性化护理建议',
      timestamp: new Date().toISOString(),
      algorithm: 'personalized-learning-v1',
      processingTime: Date.now() - (req as any).startTime
    });
    
  } catch (error) {
    console.error('个性化护理建议API错误:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * 获取AI系统诊断和学习能力状态
 * GET /api/ai/capabilities
 */
router.get('/capabilities', async (req, res) => {
  try {
    const capabilities = {
      diagnosis: {
        enabled: true,
        features: [
          '植物图像识别',
          '症状描述分析',
          'AI诊断建议',
          '相似问题匹配',
          '预防学习机制'
        ],
        confidence: '85-95%',
        supportedPlantTypes: '100+常见植物'
      },
      personalization: {
        enabled: true,
        features: [
          '用户护理模式学习',
          '个性化优化建议',
          '季节性调整',
          '成功模式识别',
          '持续改进机制'
        ],
        dataRequirements: '最少5次护理记录',
        learningSpeed: '周级优化'
      },
      integration: {
        aiModels: ['GPT-4 Vision', 'GPT-4'],
        dataSources: ['Plant Knowledge Base', 'User Activities', 'Weather Data'],
        responseTime: '2-5秒',
        accuracy: '持续改进中'
      }
    };
    
    res.json({
      success: true,
      data: capabilities,
      message: 'AI系统诊断和学习能力状态',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('能力状态API错误:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;