import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 智能植物推荐系统
 * 根据用户环境偏好、技能水平和空间条件推荐最适合的植物
 */
export async function getSmartPlantRecommendations(userPreferences: {
  balconyType?: string;
  balconySize?: number;
  balconyDirection?: string;
  skillLevel?: 'beginner' | 'intermediate' | 'expert';
  careTime?: number; // 每周愿意投入的养护时间（小时）
  budget?: number; // 预算
  preferences?: string[]; // 植物偏好（如观叶、开花、香草等）
}) {
  try {
    // 获取所有植物数据
    const allPlants = await prisma.plant.findMany();
    
    // 根据用户技能水平过滤植物难度
    let filteredPlants = allPlants;
    if (userPreferences.skillLevel === 'beginner') {
      filteredPlants = filteredPlants.filter(plant => plant.difficulty <= 2);
    } else if (userPreferences.skillLevel === 'intermediate') {
      filteredPlants = filteredPlants.filter(plant => plant.difficulty <= 4);
    }
    
    // 根据阳台类型过滤
    if (userPreferences.balconyType === 'small') {
      filteredPlants = filteredPlants.filter(plant => {
        const matureSize = plant.matureSize ? JSON.parse(plant.matureSize) : null;
        return matureSize ? matureSize.height && parseInt(matureSize.height) < 50 : true;
      });
    }
    
    // 根据阳台朝向调整光照需求
    if (userPreferences.balconyDirection === 'north') {
      filteredPlants = filteredPlants.filter(plant => 
        plant.light === 'low' || plant.light === 'partial-shade'
      );
    } else if (userPreferences.balconyDirection === 'south') {
      filteredPlants = filteredPlants.filter(plant => 
        plant.light === 'full-sun' || plant.light === 'partial-sun'
      );
    }
    
    // 计算每个植物的推荐分数
    const scoredPlants = filteredPlants.map(plant => {
      let score = 0;
      let reasons: string[] = [];
      
      // 基础匹配分数
      score += 50;
      
      // 难度匹配
      if (userPreferences.skillLevel === 'beginner' && plant.difficulty === 1) {
        score += 30;
        reasons.push('新手友好');
      } else if (userPreferences.skillLevel === 'intermediate' && plant.difficulty <= 3) {
        score += 25;
        reasons.push('适合中级养护者');
      }
      
      // 光照匹配
      if (userPreferences.balconyDirection) {
        if (userPreferences.balconyDirection === 'south' && plant.light === 'full-sun') {
          score += 20;
          reasons.push('充足阳光匹配');
        } else if (userPreferences.balconyDirection === 'north' && plant.light === 'low') {
          score += 20;
          reasons.push('耐阴性强');
        } else if (plant.light === 'partial-sun') {
          score += 15;
          reasons.push('半阴环境适配');
        }
      }
      
      // 养护时间匹配
      if (userPreferences.careTime) {
        if (userPreferences.careTime <= 2 && plant.water === 'minimal') {
          score += 20;
          reasons.push('低维护需求');
        } else if (userPreferences.careTime >= 5 && plant.water === 'frequent') {
          score += 15;
          reasons.push('高频养护爱好者');
        } else if (userPreferences.careTime >= 3 && plant.water === 'moderate') {
          score += 15;
          reasons.push('适中养护需求');
        }
      }
      
      // 空间适配
      if (userPreferences.balconySize && userPreferences.balconySize <= 10) {
        const matureSize = plant.matureSize ? JSON.parse(plant.matureSize) : null;
        if (matureSize && matureSize.height && parseInt(matureSize.height) <= 30) {
          score += 15;
          reasons.push('适合小型空间');
        }
      }
      
      // 预算匹配
      if (userPreferences.budget && userPreferences.budget <= 50) {
        score += 10;
        reasons.push('性价比高');
      }
      
      // 特殊偏好匹配
      if (userPreferences.preferences) {
        const benefits = plant.benefits ? JSON.parse(plant.benefits) : [];
        const hasPreferredBenefit = userPreferences.preferences.some(pref => 
          benefits.includes(pref)
        );
        if (hasPreferredBenefit) {
          score += 20;
          reasons.push(`符合${userPreferences.preferences.join('、')}偏好`);
        }
      }
      
      // 增加一些随机性以避免总是相同的推荐
      score += Math.random() * 10;
      
      return {
        ...plant,
        score: Math.min(score, 100), // 限制最高分
        recommendationReasons: reasons
      };
    });
    
    // 按分数排序
    scoredPlants.sort((a, b) => b.score - a.score);
    
    // 返回前6个推荐
    const recommendations = scoredPlants.slice(0, 6);
    
    return {
      success: true,
      data: {
        recommendations,
        totalCount: filteredPlants.length,
        userPreferences,
        algorithm: "smart-matching-v1"
      },
      message: `基于您的偏好，为您推荐${recommendations.length}种植物`
    };
    
  } catch (error) {
    console.error('智能植物推荐出错:', error);
    return {
      success: false,
      error: (error as Error).message,
      message: '植物推荐生成失败'
    };
  }
}

/**
 * 阳台空间优化设计算法
 * 根据阳台尺寸、朝向、用户偏好生成最优的空间布局方案
 */
export async function optimizeBalconyDesign(balconyConfig: {
  size: { width: number; height: number; depth: number }; // 阳台尺寸
  direction: 'north' | 'south' | 'east' | 'west'; // 朝向
  budget: number; // 预算
  userPreferences: {
    style?: 'modern' | 'traditional' | 'natural' | 'minimalist';
    focus?: 'decorative' | 'functional' | 'productive' | 'therapeutic';
    difficulty?: 'easy' | 'medium' | 'hard';
  };
}) {
  try {
    // 获取适合的植物列表
    const { data: plantRecommendations } = await getSmartPlantRecommendations({
      balconySize: balconyConfig.size.width * balconyConfig.size.depth,
      balconyDirection: balconyConfig.direction,
      budget: balconyConfig.budget,
      skillLevel: balconyConfig.userPreferences.difficulty === 'easy' ? 'beginner' : 
                  balconyConfig.userPreferences.difficulty === 'medium' ? 'intermediate' : 'expert'
    });
    
    if (!plantRecommendations) {
      throw new Error('无法获取植物推荐');
    }
    
    // 设计算法
    const design = {
      layout: {
        primaryZones: [] as Array<{
          type: 'shade' | 'sun' | 'transition';
          plants: Array<{
            id: string;
            name: string;
            quantity: number;
            position: { x: number; y: number; z?: number };
            benefits: string[];
          }>;
          area: number;
        }>,
        verticalSpace: [] as Array<{
          type: 'hanging' | 'climbing' | 'shelf';
          plants: Array<{
            id: string;
            name: string;
            position: { x: number; y: number; z: number };
          }>;
        }>,
        functionalAreas: [] as Array<{
          type: 'seating' | 'storage' | 'growing';
          area: number;
          plants?: Array<{
            id: string;
            name: string;
            quantity: number;
          }>;
        }>
      },
      budgetAllocation: {
        plants: 0,
        containers: 0,
        soil: 0,
        tools: 0,
        decoration: 0
      },
      maintenanceSchedule: {
        daily: [] as string[],
        weekly: [] as string[],
        monthly: [] as string[],
        seasonal: [] as string[]
      }
    };
    
    const totalArea = balconyConfig.size.width * balconyConfig.size.depth;
    
    // 根据朝向划分光照区域
    if (balconyConfig.direction === 'south') {
      // 南向：大部分阳光充足，少量遮阴
      design.layout.primaryZones.push({
        type: 'sun',
        plants: plantRecommendations?.recommendations.slice(0, 3).map((plant, index) => ({
          id: plant.id,
          name: plant.name,
          quantity: Math.floor(balconyConfig.budget / 20), // 根据预算调整数量
          position: { 
            x: (index + 1) * (balconyConfig.size.width / 4), 
            y: balconyConfig.size.depth / 2,
            z: 0
          },
          benefits: plant.benefits ? JSON.parse(plant.benefits) : []
        })),
        area: totalArea * 0.7
      });
      
      design.layout.primaryZones.push({
        type: 'shade',
        plants: plantRecommendations?.recommendations.slice(3, 5).map((plant, index) => ({
          id: plant.id,
          name: plant.name,
          quantity: 1,
          position: { 
            x: (index + 1) * (balconyConfig.size.width / 4), 
            y: balconyConfig.size.depth * 0.2,
            z: 0
          },
          benefits: plant.benefits ? JSON.parse(plant.benefits) : []
        })),
        area: totalArea * 0.3
      });
    } else if (balconyConfig.direction === 'north') {
      // 北向：大部分阴凉，少量阳光
      design.layout.primaryZones.push({
        type: 'shade',
        plants: plantRecommendations?.recommendations.slice(0, 3).map((plant, index) => ({
          id: plant.id,
          name: plant.name,
          quantity: Math.floor(balconyConfig.budget / 30),
          position: { 
            x: (index + 1) * (balconyConfig.size.width / 4), 
            y: balconyConfig.size.depth / 2,
            z: 0
          },
          benefits: plant.benefits ? JSON.parse(plant.benefits) : []
        })),
        area: totalArea * 0.8
      });
    } else {
      // 东西向：过渡区域
      design.layout.primaryZones.push({
        type: 'transition',
        plants: plantRecommendations?.recommendations.slice(0, 2).map((plant, index) => ({
          id: plant.id,
          name: plant.name,
          quantity: Math.floor(balconyConfig.budget / 25),
          position: { 
            x: (index + 1) * (balconyConfig.size.width / 3), 
            y: balconyConfig.size.depth / 2,
            z: 0
          },
          benefits: plant.benefits ? JSON.parse(plant.benefits) : []
        })),
        area: totalArea * 0.6
      });
    }
    
    // 垂直空间利用
    if (balconyConfig.size.height > 2.5) {
      const hangingPlants = plantRecommendations?.recommendations.slice(0, 2).map((plant, index) => ({
        id: plant.id,
        name: plant.name,
        position: { 
          x: (index + 1) * (balconyConfig.size.width / 3), 
          y: balconyConfig.size.depth / 2,
          z: balconyConfig.size.height - 0.5
        }
      })) || [];
      
      design.layout.verticalSpace.push({
        type: 'hanging',
        plants: hangingPlants.map((plant, index) => ({
          id: plant.id,
          name: plant.name,
          position: { 
            x: (index + 1) * (balconyConfig.size.width / 3), 
            y: balconyConfig.size.depth / 2,
            z: balconyConfig.size.height - 0.5
          }
        }))
      });
    }
    
    // 功能区域规划
    const seatingArea = totalArea * 0.2;
    design.layout.functionalAreas.push({
      type: 'seating',
      area: seatingArea
    });
    
    const growingArea = totalArea * 0.6;
    design.layout.functionalAreas.push({
      type: 'growing',
      area: growingArea,
      plants: design.layout.primaryZones[0]?.plants || []
    });
    
    // 预算分配
    const totalPlantCount = design.layout.primaryZones.reduce((sum, zone) => 
      sum + zone.plants.reduce((zoneSum, plant) => zoneSum + plant.quantity, 0), 0
    );
    
    design.budgetAllocation = {
      plants: Math.min(balconyConfig.budget * 0.5, 300),
      containers: Math.min(balconyConfig.budget * 0.2, 100),
      soil: Math.min(balconyConfig.budget * 0.15, 50),
      tools: Math.min(balconyConfig.budget * 0.1, 30),
      decoration: Math.max(balconyConfig.budget - (balconyConfig.budget * 0.95), 20)
    };
    
    // 生成养护计划
    const allPlants = design.layout.primaryZones.flatMap(zone => zone.plants);
    allPlants.forEach(plant => {
      // 根据植物类型生成养护提醒
      if (plant.name.includes('绿萝') || plant.name.includes('吊兰')) {
        design.maintenanceSchedule.weekly.push(`给${plant.name}浇水`);
        design.maintenanceSchedule.monthly.push(`给${plant.name}施肥`);
      } else if (plant.name.includes('仙人掌') || plant.name.includes('多肉')) {
        design.maintenanceSchedule.weekly.push(`检查${plant.name}土壤湿度`);
        design.maintenanceSchedule.monthly.push(`给${plant.name}浇水`);
      }
    });
    
    design.maintenanceSchedule.seasonal.push(`季节性调整植物位置和养护计划`);
    
    return {
      success: true,
      data: {
        design,
        totalCost: Object.values(design.budgetAllocation).reduce((sum, cost) => sum + cost, 0),
        spaceEfficiency: (totalArea - seatingArea) / totalArea,
        lightUtilization: balconyConfig.direction === 'south' ? 0.8 : balconyConfig.direction === 'north' ? 0.4 : 0.6
      },
      message: `为您生成${balconyConfig.direction}向${totalArea}平方米阳台的最优设计方案`
    };
    
  } catch (error) {
    console.error('阳台设计优化出错:', error);
    return {
      success: false,
      error: (error as Error).message,
      message: '阳台设计方案生成失败'
    };
  }
}

/**
 * 植物健康诊断和问题解决方案
 */
export async function diagnosePlantHealth(plantId: string, symptoms: string[], environment: {
  light: string;
  water: string;
  temperature: number;
  humidity: number;
  recentChanges?: string[];
}) {
  try {
    const plant = await prisma.plant.findUnique({
      where: { id: plantId },
      include: {
        problems: true,
        knowledge: true
      }
    });
    
    if (!plant) {
      return {
        success: false,
        error: '植物未找到',
        message: '请检查植物ID是否正确'
      };
    }
    
    let diagnosis = {
      plant: plant.name,
      problemIdentified: '',
      confidence: 0,
      possibleCauses: [] as string[],
      solutions: [] as string[],
      preventionTips: [] as string[],
      urgency: 'low'
    };
    
    // 基于症状进行诊断
    if (symptoms.includes('叶片发黄')) {
      diagnosis.problemIdentified = '叶片发黄';
      diagnosis.confidence = 0.8;
      diagnosis.possibleCauses = [
        '浇水过多导致根部腐烂',
        '光照不足',
        '缺乏营养元素',
        '温度不适'
      ];
      
      // 根据环境数据细化原因
      if (environment.water === 'frequent' && environment.humidity > 70) {
        diagnosis.possibleCauses.unshift('浇水过多，土壤积水');
        diagnosis.confidence = 0.95;
      }
      
      diagnosis.solutions = [
        '控制浇水频率，让土壤干透再浇',
        '调整光照位置，提供适当光照',
        '检查排水情况',
        '施用平衡肥料'
      ];
    }
    
    if (symptoms.includes('叶片枯萎')) {
      diagnosis.problemIdentified = '叶片枯萎';
      diagnosis.confidence = 0.85;
      diagnosis.possibleCauses = [
        '缺水',
        '根系问题',
        '病害感染',
        '温度过高'
      ];
      
      if (environment.water === 'minimal' && environment.temperature > 30) {
        diagnosis.possibleCauses.unshift('水分不足且高温环境');
        diagnosis.confidence = 0.95;
      }
      
      diagnosis.solutions = [
        '适当增加浇水频率',
        '检查根系健康状况',
        '移至阴凉处降温',
        '使用杀菌剂处理'
      ];
    }
    
    if (symptoms.includes('生长缓慢')) {
      diagnosis.problemIdentified = '生长缓慢';
      diagnosis.confidence = 0.75;
      diagnosis.possibleCauses = [
        '光照不足',
        '营养缺乏',
        '温度不适',
        '植物休眠期'
      ];
      
      diagnosis.solutions = [
        '增加光照时间',
        '施用生长促进肥料',
        '检查温度是否适宜',
        '考虑植物生长周期'
      ];
    }
    
    // 查询特定植物的养护知识
    const relevantKnowledge = plant.knowledge.filter(knowledge => 
      knowledge.category === 'care' || knowledge.category === 'disease'
    );
    
    if (relevantKnowledge.length > 0) {
      diagnosis.preventionTips = relevantKnowledge.map(knowledge => 
        knowledge.content
      ).slice(0, 3);
    }
    
    // 确定紧急程度
    if (diagnosis.confidence > 0.9 || symptoms.includes('根部腐烂')) {
      diagnosis.urgency = 'high';
    } else if (diagnosis.confidence > 0.7) {
      diagnosis.urgency = 'medium';
    }
    
    return {
      success: true,
      data: diagnosis,
      message: `成功诊断${plant.name}的健康问题`
    };
    
  } catch (error) {
    console.error('植物健康诊断出错:', error);
    return {
      success: false,
      error: (error as Error).message,
      message: '植物健康诊断失败'
    };
  }
}