import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Helper function to convert JSON to string
const jsonToString = (obj: any): string => {
  return JSON.stringify(obj);
};

// Helper function to convert array to JSON string
const arrayToJsonString = (arr: string[]): string => {
  return JSON.stringify(arr);
};

async function main() {
  console.log('🌱 开始初始化AI园艺设计师数据库...');

  // Create plants
  console.log('🌿 导入植物数据...');
  const commonPlants = [
    {
      name: "绿萝",
      scientificName: "Epipremnum aureum",
      commonNames: "黄金葛,魔鬼藤",
      category: "indoor",
      light: "low",
      water: "moderate",
      temperature: jsonToString({ ideal: "18-24°C", min: "15°C", max: "30°C" }),
      humidity: jsonToString({ ideal: "40-60%", min: "30%", max: "70%" }),
      soil: "well-draining potting mix",
      growthRate: "medium",
      matureSize: jsonToString({ height: "20-30cm", spread: "30-50cm" }),
      difficulty: 2,
      description: "绿萝是最受欢迎的室内植物之一，易于养护，能有效净化空气。",
      careTips: arrayToJsonString([
        "避免直射阳光",
        "保持土壤微湿，不要过干",
        "每月施肥一次",
        "定期擦拭叶片保持清洁",
        "可水培或土培"
      ]),
      toxicity: "non-toxic",
      benefits: arrayToJsonString(["air-purification", "easy-care", "pet-friendly"]),
      imageUrl: "/images/plants/pothos.jpg"
    },
    {
      name: "仙人掌",
      scientificName: "Cactaceae",
      commonNames: "仙人球,仙人掌",
      category: "outdoor",
      light: "full-sun",
      water: "minimal",
      temperature: jsonToString({ ideal: "21-27°C", min: "10°C", max: "35°C" }),
      humidity: jsonToString({ ideal: "20-40%", min: "10%", max: "50%" }),
      soil: "cactus mix",
      growthRate: "slow",
      matureSize: jsonToString({ height: "10-30cm", spread: "5-20cm" }),
      difficulty: 1,
      description: "仙人掌是耐旱植物，适合新手养护，造型独特。",
      careTips: arrayToJsonString([
        "需要充足的阳光",
        "浇水要少，土壤完全干透再浇",
        "使用排水良好的土壤",
        "避免积水",
        "冬季减少浇水频率"
      ]),
      toxicity: "non-toxic",
      benefits: arrayToJsonString(["drought-resistant", "low-maintenance", "decorative"]),
      imageUrl: "/images/plants/cactus.jpg"
    },
    {
      name: "吊兰",
      scientificName: "Chlorophytum comosum",
      commonNames: "挂兰,折鹤兰",
      category: "indoor",
      light: "medium",
      water: "moderate",
      temperature: jsonToString({ ideal: "18-24°C", min: "13°C", max: "27°C" }),
      humidity: jsonToString({ ideal: "40-60%", min: "30%", max: "70%" }),
      soil: "well-draining potting mix",
      growthRate: "medium",
      matureSize: jsonToString({ height: "30-60cm", spread: "30-60cm" }),
      difficulty: 2,
      description: "吊兰是优秀的室内植物，能净化空气，容易繁殖。",
      careTips: arrayToJsonString([
        "明亮的散射光",
        "保持土壤湿润但不积水",
        "春季和夏季每月施肥",
        "定期修剪枯叶",
        "可以分株繁殖"
      ]),
      toxicity: "non-toxic",
      benefits: arrayToJsonString(["air-purification", "easy-propagation", "pet-friendly"]),
      imageUrl: "/images/plants/spider-plant.jpg"
    },
    {
      name: "薄荷",
      scientificName: "Mentha",
      commonNames: "薄荷,留兰香",
      category: "herb",
      light: "partial-sun",
      water: "frequent",
      temperature: jsonToString({ ideal: "18-24°C", min: "15°C", max: "27°C" }),
      humidity: jsonToString({ ideal: "50-70%", min: "40%", max: "80%" }),
      soil: "moist, well-draining soil",
      growthRate: "fast",
      matureSize: jsonToString({ height: "30-90cm", spread: "30-60cm" }),
      difficulty: 2,
      description: "薄荷是香草植物，叶片有清凉香气，可用于烹饪和泡茶。",
      careTips: arrayToJsonString([
        "需要充足的水分",
        "喜欢半阴环境",
        "定期修剪促进分枝",
        "容易蔓延，需要控制",
        "可以随时采摘使用"
      ]),
      toxicity: "non-toxic",
      benefits: arrayToJsonString(["culinary", "fragrant", "medicinal"]),
      imageUrl: "/images/plants/mint.jpg"
    },
    {
      name: "多肉植物",
      scientificName: "Succulentae",
      commonNames: "多肉,肉质植物",
      category: "outdoor",
      light: "partial-sun",
      water: "minimal",
      temperature: jsonToString({ ideal: "18-25°C", min: "5°C", max: "35°C" }),
      humidity: jsonToString({ ideal: "30-50%", min: "20%", max: "60%" }),
      soil: "cactus/succulent mix",
      growthRate: "slow",
      matureSize: jsonToString({ height: "10-30cm", spread: "10-30cm" }),
      difficulty: 1,
      description: "多肉植物叶片肥厚，储水能力强，造型多样可爱。",
      careTips: arrayToJsonString([
        "避免积水，宁干勿湿",
        "需要良好的光照",
        "使用排水好的土壤",
        "冬季减少浇水",
        "避免叶片长期潮湿"
      ]),
      toxicity: "non-toxic",
      benefits: arrayToJsonString(["drought-resistant", "decorative", "low-maintenance"]),
      imageUrl: "/images/plants/succulent.jpg"
    }
  ];

  for (const plant of commonPlants) {
    const existingPlant = await prisma.plant.findFirst({
      where: { name: plant.name }
    });
    
    if (existingPlant) {
      await prisma.plant.update({
        where: { id: existingPlant.id },
        data: plant
      });
    } else {
      await prisma.plant.create({
        data: plant
      });
    }
  }

  // Get created plants for reference
  const plants = await prisma.plant.findMany();
  const plantMap = new Map(plants.map(p => [p.name, p.id]));

  // Create plant knowledge
  console.log('📚 导入植物知识库...');
  const plantKnowledge = [
    {
      plantName: "绿萝",
      category: "care",
      title: "绿萝基础养护",
      content: "绿萝是最适合新手的室内植物之一，它对光照要求不严，适应性强。",
      difficulty: 1,
      tags: arrayToJsonString(["基础养护", "新手友好", "空气净化"])
    },
    {
      plantName: "绿萝",
      category: "propagation",
      title: "绿萝扦插繁殖",
      content: "绿萝很容易通过扦插繁殖。剪取10-15cm的茎段，插入湿润土壤中，保持湿润即可。",
      difficulty: 1,
      tags: arrayToJsonString(["繁殖", "扦插", "简单操作"])
    },
    {
      plantName: "仙人掌",
      category: "care",
      title: "仙人掌浇水要点",
      content: "仙人掌耐旱，浇水要遵循\"干透浇透\"原则，土壤完全干透后再浇透水。",
      difficulty: 1,
      tags: arrayToJsonString(["浇水", "耐旱", "仙人掌"])
    },
    {
      plantName: "薄荷",
      category: "care",
      title: "薄荷修剪技巧",
      content: "定期修剪薄荷可以促进分枝，保持植株健康。每次采摘顶部2-3对叶片即可。",
      difficulty: 2,
      tags: arrayToJsonString(["修剪", "薄荷", "香草"])
    }
  ];

  for (const knowledge of plantKnowledge) {
    const plantId = plantMap.get(knowledge.plantName);
    if (plantId) {
      await prisma.plantKnowledge.create({
        data: {
          plantId,
          title: knowledge.title,
          content: knowledge.content,
          category: knowledge.category,
          difficulty: knowledge.difficulty,
          tags: knowledge.tags
        }
      });
    }
  }

  // Create plant problems
  console.log('🚨 导入植物问题库...');
  const plantProblems = [
    {
      plantName: "绿萝",
      name: "叶片发黄",
      description: "绿萝叶片发黄，可能是由于浇水过多或光照不足。",
      symptoms: arrayToJsonString(["叶片发黄", "叶片下垂", "根部腐烂"]),
      causes: arrayToJsonString(["浇水过多", "光照不足", "土壤排水不良"]),
      solutions: arrayToJsonString([
        "减少浇水频率，让土壤干透再浇",
        "移至明亮散射光处",
        "检查并改善排水",
        "更换干燥的土壤"
      ]),
      severity: 3
    },
    {
      plantName: "仙人掌",
      name: "腐烂问题",
      description: "仙人掌基部出现软化和腐烂，通常是浇水过多导致。",
      symptoms: arrayToJsonString(["基部软化", "异味", "颜色变深"]),
      causes: arrayToJsonString(["浇水过多", "积水", "通风不良"]),
      solutions: arrayToJsonString([
        "停止浇水，让土壤完全干透",
        "切除腐烂部分，涂抹杀菌剂",
        "改善通风条件",
        "使用排水良好的土壤"
      ]),
      severity: 4
    },
    {
      plantName: "薄荷",
      name: "徒长问题",
      description: "薄荷茎秆细长，叶片稀少，光照不足导致徒长。",
      symptoms: arrayToJsonString(["茎秆细长", "节间距离大", "叶片小而薄"]),
      causes: arrayToJsonString(["光照不足", "氮肥过多"]),
      solutions: arrayToJsonString([
        "增加光照时间",
        "减少氮肥使用",
        "适当修剪促进分枝",
        "提供充足散射光"
      ]),
      severity: 2
    }
  ];

  for (const problem of plantProblems) {
    const plantId = plantMap.get(problem.plantName);
    if (plantId) {
      await prisma.plantProblem.create({
        data: {
          plantId,
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

  // Create seasonal care data
  console.log('📅 导入季节性养护数据...');
  const plantSeasons = [
    {
      plantName: "绿萝",
      season: "spring",
      tasks: arrayToJsonString(["换盆", "施肥", "修剪"]),
      careTips: arrayToJsonString(["春季是生长旺季，增加浇水频率", "使用平衡肥料", "修剪枯黄叶片"])
    },
    {
      plantName: "绿萝",
      season: "summer",
      tasks: arrayToJsonString(["增加浇水", "遮阴", "喷水降温"]),
      careTips: arrayToJsonString(["注意通风", "避免强光直射", "保持土壤湿润"])
    },
    {
      plantName: "仙人掌",
      season: "spring",
      tasks: arrayToJsonString(["少量浇水", "施肥", "检查病虫害"]),
      careTips: arrayToJsonString(["开始正常浇水频率", "使用仙人掌专用肥", "注意通风"])
    },
    {
      plantName: "仙人掌",
      season: "summer",
      tasks: arrayToJsonString(["充足阳光", "控制浇水", "遮阴保护"]),
      careTips: arrayToJsonString(["提供充足阳光", "避免暴雨", "注意温度控制"])
    }
  ];

  for (const season of plantSeasons) {
    const plantId = plantMap.get(season.plantName);
    if (plantId) {
      await prisma.plantSeason.create({
        data: {
          plantId,
          season: season.season,
          tasks: season.tasks,
          careTips: season.careTips
        }
      });
    }
  }

  // Create a test user
  console.log('👤 创建测试用户...');
  const testUser = await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: {},
    create: {
      email: "test@example.com",
      username: "testuser",
      password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
      name: "测试用户",
      location: "北京市",
      balconyType: "阳台",
      balconySize: 10.5,
      balconyDirection: "南",
      preferences: jsonToString({
        language: "zh-CN",
        notifications: true,
        theme: "light"
      })
    }
  });

  // Create a sample project
  console.log('🏡 创建示例项目...');
  const sampleProject = await prisma.project.create({
    data: {
      name: "我的阳台花园",
      description: "在南向阳台上打造一个小型花园",
      status: "planning",
      balconyJson: jsonToString({
        type: "balcony",
        area: 10.5,
        direction: "south",
        sunlight: "full",
        features: ["栏杆", "排水", "遮阳"]
      }),
      designJson: jsonToString({
        style: "modern",
        budget: 2000,
        plants: ["绿萝", "仙人掌", "薄荷"],
        layout: {
          areas: [
            { name: "观赏区", plants: ["绿萝"], position: "center" },
            { name: "香草区", plants: ["薄荷"], position: "corner" },
            { name: "多肉区", plants: ["仙人掌"], position: "edge" }
          ]
        }
      }),
      location: "北京市朝阳区",
      area: 10.5,
      budget: 2000,
      startDate: new Date("2024-04-01"),
      userId: testUser.id
    }
  });

  console.log('✅ 数据库初始化完成！');
  console.log(`🌱 导入了 ${commonPlants.length} 种常见植物`);
  console.log(`📚 导入了 ${plantKnowledge.length} 条植物知识`);
  console.log(`🚨 导入了 ${plantProblems.length} 个常见问题`);
  console.log(`📅 导入了 ${plantSeasons.length} 条季节养护信息`);
  console.log(`👤 创建了测试用户: ${testUser.email}`);
  console.log(`🏡 创建了示例项目: ${sampleProject.name}`);
}

main()
  .catch((e) => {
    console.error('初始化数据库时出错:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });