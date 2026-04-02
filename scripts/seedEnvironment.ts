import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始导入环境数据...');

  try {
    // 导入阳台类型数据
    console.log('🏠 导入阳台类型数据...');
    const balconyTypes = [
      { name: '小阳台', description: '面积小于5平方米的小型阳台，适合垂直种植' },
      { name: '中等阳台', description: '面积5-15平方米的普通阳台，可放置花架和种植箱' },
      { name: '大阳台', description: '面积大于15平方米的大型阳台，可种植多种植物' },
      { name: '露台', description: '开放式露台空间，光照充足，适合多种植物' },
      { name: '室内窗台', description: '室内窗台环境，光照有限，适合耐阴植物' },
      { name: '天台', description: '屋顶天台，环境恶劣，需要特殊防护' }
    ];

    for (const type of balconyTypes) {
      const existing = await prisma.balconyType.findUnique({
        where: { name: type.name }
      });

      if (!existing) {
        await prisma.balconyType.create({
          data: type
        });
        console.log(`  ✅ 创建阳台类型: ${type.name}`);
      }
    }

    // 导入植物类别数据
    console.log('🌿 导入植物类别数据...');
    const plantCategories = [
      { name: '观叶植物', description: '以观赏叶片为主的植物，如绿萝、龟背竹等' },
      { name: '开花植物', description: '会开出美丽花朵的植物，如茉莉、杜鹃等' },
      { name: '多肉植物', description: '具有储水能力的多肉植物，如仙人掌、芦荟等' },
      { name: '香草植物', description: '具有香气的草本植物，可食用或药用' },
      { name: '蔬菜', description: '可食用的蔬菜植物，适合家庭种植' },
      { name: '水果', description: '可食用的水果植物，需要较大空间' },
      { name: '攀援植物', description: '需要攀爬支撑的植物，如葡萄、常春藤等' },
      { name: '水生植物', description: '适合水培或水环境的植物' }
    ];

    for (const category of plantCategories) {
      const existing = await prisma.plantCategory.findUnique({
        where: { name: category.name }
      });

      if (!existing) {
        await prisma.plantCategory.create({
          data: category
        });
        console.log(`  ✅ 创建植物类别: ${category.name}`);
      }
    }

    // 导入养护活动类型
    console.log('🔄 导入养护活动类型...');
    const activityTypes = [
      { name: '浇水', icon: '💧', frequency: 'daily', description: '给植物浇水保持土壤湿润' },
      { name: '施肥', icon: '🌱', frequency: 'weekly', description: '给植物施用肥料促进生长' },
      { name: '修剪', icon: '✂️', frequency: 'monthly', description: '修剪枯枝败叶，促进新芽生长' },
      { name: '换盆', icon: '🪴', frequency: 'yearly', description: '更换更大的花盆，提供更多生长空间' },
      { name: '病虫害防治', icon: '🚨', frequency: 'weekly', description: '检查并防治植物病虫害' },
      { name: '清洁', icon: '🧹', frequency: 'weekly', description: '清洁叶片和花盆表面' },
      { name: '转动花盆', icon: '🔄', frequency: 'weekly', description: '转动花盆使植物均匀接受光照' },
      { name: '检查根系', icon: '🔍', frequency: 'monthly', description: '检查植物根系健康状况' }
    ];

    for (const activity of activityTypes) {
      const existing = await prisma.activityType.findUnique({
        where: { name: activity.name }
      });

      if (!existing) {
        await prisma.activityType.create({
          data: activity
        });
        console.log(`  ✅ 创建养护活动: ${activity.name}`);
      }
    }

    // 导入光照条件
    console.log('☀️ 导入光照条件...');
    const lightConditions = [
      { level: 'full-sun', name: '充足阳光', description: '每天需要6-8小时直射阳光', icon: '☀️' },
      { level: 'partial-sun', name: '半阴环境', description: '每天需要4-6小时散射光', icon: '⛅' },
      { level: 'partial-shade', name: '半阴遮阳', description: '每天需要2-4小时散射光', icon: '🌤️' },
      { level: 'shade', name: '阴凉环境', description: '只需要少量散射光或无直射光', icon: '🌙' },
      { level: 'low', name: '低光照', description: '适合完全无直射光的环境', icon: '🌑' }
    ];

    for (const light of lightConditions) {
      const existing = await prisma.lightCondition.findUnique({
        where: { level: light.level }
      });

      if (!existing) {
        await prisma.lightCondition.create({
          data: light
        });
        console.log(`  ✅ 创建光照条件: ${light.name}`);
      }
    }

    // 导入浇水频率
    console.log('💧 导入浇水频率...');
    const wateringFrequencies = [
      { frequency: 'frequent', name: '频繁浇水', description: '每天或每两天浇水一次', icon: '💧💧💧' },
      { frequency: 'moderate', name: '中等浇水', description: '每3-5天浇水一次', icon: '💧💧' },
      { frequency: 'minimal', name: '少量浇水', description: '每周或更长时间浇水一次', icon: '💧' },
      { frequency: 'seasonal', name: '季节性浇水', description: '根据季节调整浇水频率', icon: '🍂🌞❄️' }
    ];

    for (const watering of wateringFrequencies) {
      const existing = await prisma.wateringFrequency.findUnique({
        where: { frequency: watering.frequency }
      });

      if (!existing) {
        await prisma.wateringFrequency.create({
          data: watering
        });
        console.log(`  ✅ 创建浇水频率: ${watering.name}`);
      }
    }

    // 导入植物功效
    console.log('✨ 导入植物功效...');
    const plantBenefits = [
      { name: 'air-purification', icon: '🌬️', description: '净化空气，吸收有害气体' },
      { name: 'easy-care', icon: '👍', description: '容易养护，适合新手' },
      { name: 'fragrant', icon: '🌸', description: '具有香气，可提神醒脑' },
      { name: 'medicinal', icon: '💊', description: '具有药用价值' },
      { name: 'edible', icon: '🍃', description: '可食用，可入菜' },
      { name: 'pet-safe', icon: '🐶', description: '对宠物无毒安全' },
      { name: 'pest-repellent', icon: '🚫🐜', description: '驱虫防虫' },
      { name: 'flowering', icon: '🌺', description: '开花植物，观赏价值高' },
      { name: 'fast-growing', icon: '🚀', description: '生长迅速，见效快' },
      { name: 'drought-tolerant', icon: '🏜️', description: '耐旱能力强' },
      { name: 'low-maintenance', icon: '⚡', description: '维护成本低' },
      { name: 'statement-plant', icon: '👑', description: '大型植物，可作为焦点' },
      { name: 'hanging-friendly', icon: '🎪', description: '适合悬挂种植' },
      { name: 'climbing', icon: '🧗', description: '需要攀爬支撑' },
      { name: 'water-efficient', icon: '💧💰', description: '省水环保' }
    ];

    for (const benefit of plantBenefits) {
      const existing = await prisma.plantBenefit.findUnique({
        where: { name: benefit.name }
      });

      if (!existing) {
        await prisma.plantBenefit.create({
          data: benefit
        });
        console.log(`  ✅ 创建植物功效: ${benefit.name}`);
      }
    }

    // 导入植物知识分类
    console.log('📚 导入知识分类...');
    const knowledgeCategories = [
      { name: '养护指南', icon: '📖', description: '日常养护和照料方法' },
      { name: '病害防治', icon: '🚨', description: '常见疾病和害虫防治' },
      { name: '繁殖技巧', icon: '🌱', description: '植物繁殖和育苗方法' },
      { name: '季节养护', icon: '🍂', description: '四季养护要点和注意事项' },
      { name: '植物搭配', icon: '🎨', description: '植物搭配和组合建议' },
      { name: '环境优化', icon: '🌍', description: '优化植物生长环境' },
      { name: '营养管理', icon: '🥗', description: '施肥和营养管理' },
      { name: '容器选择', icon: '🪴', description: '花盆和容器选择建议' }
    ];

    for (const category of knowledgeCategories) {
      const existing = await prisma.knowledgeCategory.findUnique({
        where: { name: category.name }
      });

      if (!existing) {
        await prisma.knowledgeCategory.create({
          data: category
        });
        console.log(`  ✅ 创建知识分类: ${category.name}`);
      }
    }

    // 导入用户偏好
    console.log('🎯 导入用户偏好...');
    const userPreferences = [
      { name: '观叶爱好者', icon: '🌿', description: '喜欢观叶植物，注重叶片形态和颜色' },
      { name: '开花追求者', icon: '🌸', description: '喜欢开花植物，期待花朵绽放' },
      { name: '香草收集者', icon: '🌱', description: '喜欢香草植物，注重香气和实用性' },
      { name: '新手入门', icon: '👶', description: '刚开始种植，需要低维护植物' },
      { name: '园艺专家', icon: '👨‍🌾', description: '有种植经验，喜欢挑战高难度植物' },
      { name: '空间利用', icon: '📐', description: '注重空间利用，喜欢垂直种植' },
      { name: '宠物家庭', icon: '🐶', description: '家里有宠物，选择无毒植物' },
      { name: '儿童教育', icon: '👧', description: '用于儿童教育，选择有趣易种植的植物' }
    ];

    for (const preference of userPreferences) {
      const existing = await prisma.userPreference.findUnique({
        where: { name: preference.name }
      });

      if (!existing) {
        await prisma.userPreference.create({
          data: preference
        });
        console.log(`  ✅ 创建用户偏好: ${preference.name}`);
      }
    }

    // 导入项目模板
    console.log('📁 导入项目模板...');
    const projectTemplates = [
      {
        name: '新手入门花园',
        description: '适合新手的第一批植物组合',
        difficulty: 1,
        estimatedTime: 2,
        budget: 200,
        plants: ['绿萝', '吊兰', '仙人掌'],
        tips: '选择容易养护的植物，建立养护习惯'
      },
      {
        name: '香草厨房花园',
        description: '适合厨房的香草植物组合',
        difficulty: 2,
        estimatedTime: 3,
        budget: 300,
        plants: ['薄荷', '罗勒', '迷迭香'],
        tips: '放在阳光充足的窗台，方便采摘使用'
      },
      {
        name: '观赏花卉花园',
        description: '美观的花卉植物组合',
        difficulty: 3,
        estimatedTime: 4,
        budget: 500,
        plants: ['茉莉花', '杜鹃花', '向日葵'],
        tips: '需要充足的阳光和定期的养护'
      },
      {
        name: '多肉植物组合',
        description: '低维护的多肉植物组合',
        difficulty: 1,
        estimatedTime: 2,
        budget: 150,
        plants: ['仙人掌', '芦荟', '多肉组合'],
        tips: '排水良好，避免过度浇水'
      },
      {
        name: '室内空气净化',
        description: '净化空气的室内植物组合',
        difficulty: 1,
        estimatedTime: 2,
        budget: 250,
        plants: ['绿萝', '虎皮兰', '吊兰'],
        tips: '适合室内环境，注意光照和通风'
      }
    ];

    for (const template of projectTemplates) {
      const existing = await prisma.projectTemplate.findUnique({
        where: { name: template.name }
      });

      if (!existing) {
        await prisma.projectTemplate.create({
          data: {
            name: template.name,
            description: template.description,
            difficulty: template.difficulty,
            estimatedTime: template.estimatedTime,
            budget: template.budget,
            plants: JSON.stringify(template.plants),
            tips: template.tips
          }
        });
        console.log(`  ✅ 创建项目模板: ${template.name}`);
      }
    }

    console.log('🎉 环境数据导入完成！');
    console.log(`📊 总计导入阳台类型: ${balconyTypes.length} 种`);
    console.log(`🌿 总计导入植物类别: ${plantCategories.length} 种`);
    console.log(`🔄 总计导入养护活动: ${activityTypes.length} 种`);
    console.log(`☀️ 总计导入光照条件: ${lightConditions.length} 种`);
    console.log(`💧 总计导入浇水频率: ${wateringFrequencies.length} 种`);
    console.log(`✨ 总计导入植物功效: ${plantBenefits.length} 种`);
    console.log(`📚 总计导入知识分类: ${knowledgeCategories.length} 种`);
    console.log(`🎯 总计导入用户偏好: ${userPreferences.length} 种`);
    console.log(`📁 总计导入项目模板: ${projectTemplates.length} 种`);

  } catch (error) {
    console.error('❌ 环境数据导入失败:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ 环境数据初始化失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });