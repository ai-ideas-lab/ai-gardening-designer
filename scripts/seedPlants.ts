import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始导入植物数据库种子数据...');

  try {
    // 读取植物数据文件
    const plantsDataPath = join(__dirname, '..', 'data', 'plants.json');
    const plantsData = JSON.parse(readFileSync(plantsDataPath, 'utf8'));

    console.log(`📋 找到 ${plantsData.length} 种植物数据`);

    // 导入植物数据
    for (const plant of plantsData) {
      console.log(`🌿 导入植物: ${plant.name}`);

      const existingPlant = await prisma.plant.findFirst({
        where: { 
          name: {
            contains: plant.name
          }
        }
      });

      if (existingPlant) {
        console.log(`  ✅ ${plant.name} 已存在，跳过`);
        continue;
      }

      const createdPlant = await prisma.plant.create({
        data: {
          name: plant.name,
          scientificName: plant.scientificName || null,
          commonNames: plant.commonNames ? JSON.stringify(plant.commonNames) : null,
          category: plant.category || 'indoor',
          light: plant.light || 'partial-sun',
          water: plant.water || 'moderate',
          temperature: plant.temperature ? JSON.stringify(plant.temperature) : null,
          humidity: plant.humidity ? JSON.stringify(plant.humidity) : null,
          soil: plant.soil || 'potting-mix',
          growthRate: plant.growthRate || 'medium',
          matureSize: plant.matureSize ? JSON.stringify(plant.matureSize) : null,
          difficulty: plant.difficulty || 3,
          description: plant.description || '',
          careTips: plant.careTips ? JSON.stringify(plant.careTips) : null,
          toxicity: plant.toxicity || 'non-toxic',
          benefits: plant.benefits ? JSON.stringify(plant.benefits) : null,
          imageUrl: plant.imageUrl || null,
        }
      });

      console.log(`  ✅ 成功创建: ${plant.name}`);

      // 为植物添加养护知识
      const careKnowledge = [
        {
          title: '基础养护指南',
          content: '定期浇水，保持土壤湿润但不过湿；提供适当光照；注意通风；定期施肥促进生长。',
          category: 'care',
          difficulty: 1
        },
        {
          title: '常见问题处理',
          content: '注意观察植物状态；及时处理病虫害；调整浇水频率；定期检查土壤质量。',
          category: 'care',
          difficulty: 2
        },
        {
          title: '季节养护要点',
          content: '春季：增加浇水频率，施肥促生长；夏季：注意遮阴，增加湿度；秋季：减少浇水，准备越冬；冬季：控水保温，停止施肥。',
          category: 'care',
          difficulty: 3
        }
      ];

      for (const knowledge of careKnowledge) {
        await prisma.plantKnowledge.create({
          data: {
            plantId: createdPlant.id,
            title: knowledge.title,
            content: knowledge.content,
            category: knowledge.category,
            difficulty: knowledge.difficulty
          }
        });
      }

      // 为植物添加季节性养护建议
      const seasons = ['spring', 'summer', 'autumn', 'winter'];
      
      for (const season of seasons) {
        let tasks: string[] = [];
        let tips: string[] = [];
        
        switch (season) {
          case 'spring':
            tasks = ['换盆', '施肥', '修剪枯枝'];
            tips = ['增加浇水频率', '提供充足光照', '注意通风'];
            break;
          case 'summer':
            tasks = ['遮阴', '增加浇水频率', '防病虫害'];
            tips = ['避免中午浇水', '保持空气湿度', '适当喷水降温'];
            break;
          case 'autumn':
            tasks = ['减少浇水', '停止施肥', '清理落叶'];
            tips = ['准备越冬', '移至室内', '检查根系健康'];
            break;
          case 'winter':
            tasks = ['控水', '保温', '防冻'];
            tips = ['减少浇水频率', '避免冷风直吹', '停止施肥'];
            break;
        }
        
        await prisma.plantSeason.create({
          data: {
            plantId: createdPlant.id,
            season,
            tasks: JSON.stringify(tasks),
            careTips: JSON.stringify(tips)
          }
        });
      }

      // 添加常见植物问题
      const commonProblems = [
        {
          name: '叶片发黄',
          description: '植物叶片出现黄色斑点或整体发黄',
          symptoms: JSON.stringify(['叶片发黄', '生长缓慢']),
          causes: JSON.stringify(['浇水过多', '光照不足', '缺乏营养']),
          solutions: JSON.stringify(['控制浇水频率', '调整光照', '施用氮肥']),
          severity: 2
        },
        {
          name: '叶片枯萎',
          description: '植物叶片枯萎、干燥、失去光泽',
          symptoms: JSON.stringify(['叶片枯萎', '边缘卷曲']),
          causes: JSON.stringify(['缺水', '光照过强', '根系问题']),
          solutions: JSON.stringify(['增加浇水', '移至阴凉处', '检查根系']),
          severity: 3
        },
        {
          name: '生长缓慢',
          description: '植物生长停滞，新叶长出缓慢',
          symptoms: JSON.stringify(['生长缓慢', '叶片小']),
          causes: JSON.stringify(['光照不足', '营养缺乏', '温度不适']),
          solutions: JSON.stringify(['增加光照', '施用生长肥', '调整温度']),
          severity: 2
        }
      ];

      for (const problem of commonProblems) {
        await prisma.plantProblem.create({
          data: {
            plantId: createdPlant.id,
            name: problem.name,
            description: problem.description,
            symptoms: problem.symptoms,
            causes: problem.causes,
            solutions: problem.solutions,
            severity: problem.severity
          }
        });
      }
    }

    console.log('🎉 植物数据库种子数据导入完成！');
    console.log(`📊 总计导入植物: ${plantsData.length} 种`);
    console.log(`📚 总计养护知识: ${3 * plantsData.length} 条`);
    console.log(`🍂 总计季节建议: ${4 * plantsData.length} 条`);
    console.log(`🚨 总计问题诊断: ${3 * plantsData.length} 条`);

  } catch (error) {
    console.error('❌ 种子数据导入失败:', error);
    throw error;
  }
}

// 植物数据
const plantsData = [
  {
    name: '绿萝',
    scientificName: 'Epipremnum aureum',
    commonNames: ['黄金葛', '魔鬼藤', '金钱草'],
    category: 'indoor',
    light: 'low',
    water: 'moderate',
    temperature: { min: 18, max: 30, optimal: 22 },
    humidity: { min: 40, max: 80, optimal: 60 },
    soil: 'potting-mix',
    growthRate: 'fast',
    matureSize: { height: 20, spread: 15 },
    difficulty: 1,
    description: '绿萝是一种常见的室内观叶植物，叶片心形，色泽翠绿，具有净化空气的作用。',
    careTips: ['保持土壤微湿，避免积水', '避免强光直射', '定期擦拭叶片保持清洁'],
    toxicity: 'non-toxic',
    benefits: ['air-purification', 'easy-care', 'decorative']
  },
  {
    name: '吊兰',
    scientificName: 'Chlorophytum comosum',
    commonNames: ['挂兰', '兰草', '垂盆草'],
    category: 'indoor',
    light: 'partial-sun',
    water: 'moderate',
    temperature: { min: 15, max: 25, optimal: 20 },
    humidity: { min: 40, max: 70, optimal: 55 },
    soil: 'well-draining',
    growthRate: 'medium',
    matureSize: { height: 30, spread: 25 },
    difficulty: 1,
    description: '吊兰是一种垂吊式观叶植物，叶片细长，会生长出匍匐茎，适合悬挂种植。',
    careTips: ['土壤干透再浇水', '喜欢明亮的散射光', '定期修剪老叶'],
    toxicity: 'non-toxic',
    benefits: ['air-purification', 'hanging-friendly', 'pet-safe']
  },
  {
    name: '仙人掌',
    scientificName: 'Cactaceae',
    commonNames: ['仙人球', '仙人山', '沙漠植物'],
    category: 'succulent',
    light: 'full-sun',
    water: 'minimal',
    temperature: { min: 10, max: 35, optimal: 25 },
    humidity: { min: 20, max: 50, optimal: 30 },
    soil: 'cactus-mix',
    growthRate: 'slow',
    matureSize: { height: 15, spread: 10 },
    difficulty: 1,
    description: '仙人掌是多肉植物，具有储水能力，形态多样，容易养护。',
    careTips: ['浇水要少，土壤干透再浇', '需要充足阳光', '冬季减少浇水'],
    toxicity: 'non-toxic',
    benefits: ['water-efficient', 'low-maintenance', 'decorative']
  },
  {
    name: '龟背竹',
    scientificName: 'Monstera deliciosa',
    commonNames: ['蓬莱蕉', '电线草', '龟背芋'],
    category: 'indoor',
    light: 'partial-sun',
    water: 'moderate',
    temperature: { min: 18, max: 28, optimal: 23 },
    humidity: { min: 50, max: 80, optimal: 65 },
    soil: 'well-draining',
    growthRate: 'fast',
    matureSize: { height: 100, spread: 80 },
    difficulty: 2,
    description: '龟背竹是一种大型观叶植物，叶片具有独特的孔洞和裂缝，极具观赏价值。',
    careTips: ['保持土壤湿润', '喜欢高湿度环境', '需要攀爬支撑'],
    toxicity: 'toxic-to-pets',
    benefits: ['statement-plant', 'air-purification', 'tropical']
  },
  {
    name: '薄荷',
    scientificName: 'Mentha',
    commonNames: ['薄荷草', '留兰香', '绿薄荷'],
    category: 'herb',
    light: 'partial-sun',
    water: 'frequent',
    temperature: { min: 15, max: 25, optimal: 20 },
    humidity: { min: 50, max: 70, optimal: 60 },
    soil: 'moist',
    growthRate: 'fast',
    matureSize: { height: 30, spread: 40 },
    difficulty: 1,
    description: '薄荷是一种香草植物，具有清新的香气，可以食用，也能驱虫。',
    careTips: ['保持土壤湿润', '定期修剪促进分枝', '避免开花以保持叶片品质'],
    toxicity: 'non-toxic',
    benefits: ['culinary', 'medicinal', 'pest-repellent']
  },
  {
    name: '虎皮兰',
    scientificName: 'Sansevieria trifasciata',
    commonNames: ['虎尾兰', '千岁兰', '剑兰'],
    category: 'indoor',
    light: 'low',
    water: 'minimal',
    temperature: { min: 13, max: 32, optimal: 22 },
    humidity: { min: 30, max: 70, optimal: 45 },
    soil: 'well-draining',
    growthRate: 'slow',
    matureSize: { height: 90, spread: 30 },
    difficulty: 1,
    description: '虎皮兰是一种多肉观叶植物，叶片坚硬直立，具有条纹图案，耐阴性强。',
    careTips: ['浇水要少，耐旱性强', '耐阴，适合室内', '避免阳光直射'],
    toxicity: 'toxic-to-pets',
    benefits: ['air-purification', 'low-maintenance', 'night-oxygenation']
  },
  {
    name: '茉莉花',
    scientificName: 'Jasminum sambac',
    commonNames: ['茉莉', '茉莉花', '素馨'],
    category: 'flower',
    light: 'full-sun',
    water: 'moderate',
    temperature: { min: 20, max: 35, optimal: 25 },
    humidity: { min: 60, max: 80, optimal: 70 },
    soil: 'acidic',
    growthRate: 'medium',
    matureSize: { height: 100, spread: 80 },
    difficulty: 3,
    description: '茉莉花是一种芳香花卉，花朵洁白芬芳，香味浓郁，常用于制作花茶。',
    careTips: ['充足光照', '保持土壤湿润', '定期修剪整形'],
    toxicity: 'non-toxic',
    benefits: ['fragrant', 'medicinal', 'ornamental']
  },
  {
    name: '芦荟',
    scientificName: 'Aloe vera',
    commonNames: ['库拉索芦荟', '药用芦荟', '沙漠百合'],
    category: 'succulent',
    light: 'full-sun',
    water: 'minimal',
    temperature: { min: 13, max: 32, optimal: 22 },
    humidity: { min: 30, max: 50, optimal: 40 },
    soil: 'well-draining',
    growthRate: 'medium',
    matureSize: { height: 60, spread: 40 },
    difficulty: 1,
    description: '芦荟是一种多肉植物，具有药用价值，叶片肥厚多汁，含有凝胶状物质。',
    careTips: ['少浇水，土壤干透再浇', '需要充足阳光', '避免低温环境'],
    toxicity: 'non-toxic',
    benefits: ['medicinal', 'skin-care', 'air-purification']
  },
  {
    name: '杜鹃花',
    scientificName: 'Rhododendron',
    commonNames: ['映山红', '山石榴', '踯躅'],
    category: 'flower',
    light: 'partial-sun',
    water: 'moderate',
    temperature: { min: 12, max: 25, optimal: 18 },
    humidity: { min: 60, max: 80, optimal: 70 },
    soil: 'acidic',
    growthRate: 'slow',
    matureSize: { height: 150, spread: 120 },
    difficulty: 3,
    description: '杜鹃花是一种美丽的观赏花卉，花色丰富，春季开花，具有很高的观赏价值。',
    careTips: ['喜欢酸性土壤', '保持湿润环境', '避免强光直射'],
    toxicity: 'toxic-to-pets',
    benefits: ['spring-blooming', 'colorful', 'ornamental']
  },
  {
    name: '向日葵',
    scientificName: 'Helianthus annuus',
    commonNames: ['太阳花', '朝阳花', '望日葵'],
    category: 'flower',
    light: 'full-sun',
    water: 'moderate',
    temperature: { min: 15, max: 30, optimal: 22 },
    humidity: { min: 40, max: 70, optimal: 55 },
    soil: 'fertile',
    growthRate: 'fast',
    matureSize: { height: 200, spread: 60 },
    difficulty: 2,
    description: '向日葵是一种一年生草本植物，花朵大型黄色，具有向光性，象征阳光和积极。',
    careTips: ['充足阳光', '定期浇水', '需要支撑防止倒伏'],
    toxicity: 'non-toxic',
    benefits: ['sunflower', 'bird-friendly', 'ornamental']
  }
];

// 写入植物数据到文件
import { writeFileSync } from 'fs';
import { mkdirSync } from 'fs';

try {
  // 创建数据目录
  const dataDir = join(__dirname, '..', 'data');
  mkdirSync(dataDir, { recursive: true });
  
  // 写入植物数据
  writeFileSync(join(dataDir, 'plants.json'), JSON.stringify(plantsData, null, 2));
  console.log('📁 植物数据文件已创建: data/plants.json');
} catch (error) {
  console.error('❌ 创建数据文件失败:', error);
}

// 执行主函数
main()
  .catch((e) => {
    console.error('❌ 数据库初始化失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });