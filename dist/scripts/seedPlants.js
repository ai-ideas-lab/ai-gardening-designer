"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Plant data for MVP
const commonPlants = [
    {
        name: "绿萝",
        scientificName: "Epipremnum aureum",
        commonNames: ["黄金葛", "魔鬼藤"],
        category: "indoor",
        light: "low",
        water: "moderate",
        temperature: { ideal: "18-24°C", min: "15°C", max: "30°C" },
        humidity: { ideal: "40-60%", min: "30%", max: "70%" },
        soil: "well-draining potting mix",
        growthRate: "medium",
        matureSize: { height: "20-30cm", spread: "30-50cm" },
        difficulty: 2,
        description: "绿萝是最受欢迎的室内植物之一，易于养护，能有效净化空气。",
        careTips: [
            "避免直射阳光",
            "保持土壤微湿，不要过干",
            "每月施肥一次",
            "定期擦拭叶片保持清洁",
            "可水培或土培"
        ],
        toxicity: "non-toxic",
        benefits: ["air-purification", "easy-care", "pet-friendly"],
        imageUrl: "/images/plants/pothos.jpg"
    },
    {
        name: "仙人掌",
        scientificName: "Cactaceae",
        commonNames: ["仙人球", "仙人掌"],
        category: "outdoor",
        light: "full-sun",
        water: "minimal",
        temperature: { ideal: "21-27°C", min: "10°C", max: "35°C" },
        humidity: { ideal: "20-40%", min: "10%", max: "50%" },
        soil: "cactus mix",
        growthRate: "slow",
        matureSize: { height: "10-30cm", spread: "5-20cm" },
        difficulty: 1,
        description: "仙人掌是耐旱植物，适合新手养护，造型独特。",
        careTips: [
            "需要充足的阳光",
            "浇水要少，土壤完全干透再浇",
            "使用排水良好的土壤",
            "避免积水",
            "冬季减少浇水频率"
        ],
        toxicity: "non-toxic",
        benefits: ["drought-resistant", "low-maintenance", "decorative"],
        imageUrl: "/images/plants/cactus.jpg"
    },
    {
        name: "吊兰",
        scientificName: "Chlorophytum comosum",
        commonNames: ["挂兰", "折鹤兰"],
        category: "indoor",
        light: "medium",
        water: "moderate",
        temperature: { ideal: "18-24°C", min: "13°C", max: "27°C" },
        humidity: { ideal: "40-60%", min: "30%", max: "70%" },
        soil: "well-draining potting mix",
        growthRate: "medium",
        matureSize: { height: "30-60cm", spread: "30-60cm" },
        difficulty: 2,
        description: "吊兰是优秀的室内植物，能净化空气，容易繁殖。",
        careTips: [
            "明亮的散射光",
            "保持土壤湿润但不积水",
            "春季和夏季每月施肥",
            "定期修剪枯叶",
            "可以分株繁殖"
        ],
        toxicity: "non-toxic",
        benefits: ["air-purification", "easy-propagation", "pet-friendly"],
        imageUrl: "/images/plants/spider-plant.jpg"
    },
    {
        name: "薄荷",
        scientificName: "Mentha",
        commonNames: ["薄荷", "留兰香"],
        category: "herb",
        light: "partial-sun",
        water: "frequent",
        temperature: { ideal: "18-24°C", min: "15°C", max: "27°C" },
        humidity: { ideal: "50-70%", min: "40%", max: "80%" },
        soil: "moist, well-draining soil",
        growthRate: "fast",
        matureSize: { height: "30-90cm", spread: "30-60cm" },
        difficulty: 2,
        description: "薄荷是香草植物，叶片有清凉香气，可用于烹饪和泡茶。",
        careTips: [
            "需要充足的水分",
            "喜欢半阴环境",
            "定期修剪促进分枝",
            "容易蔓延，需要控制",
            "可以随时采摘使用"
        ],
        toxicity: "non-toxic",
        benefits: ["culinary", "fragrant", "medicinal"],
        imageUrl: "/images/plants/mint.jpg"
    },
    {
        name: "多肉植物",
        scientificName: "Succulentae",
        commonNames: ["多肉", "肉质植物"],
        category: "outdoor",
        light: "partial-sun",
        water: "minimal",
        temperature: { ideal: "18-25°C", min: "5°C", max: "35°C" },
        humidity: { ideal: "30-50%", min: "20%", max: "60%" },
        soil: "cactus/succulent mix",
        growthRate: "slow",
        matureSize: { height: "10-30cm", spread: "10-30cm" },
        difficulty: 1,
        description: "多肉植物叶片肥厚，储水能力强，造型多样可爱。",
        careTips: [
            "避免积水，宁干勿湿",
            "需要良好的光照",
            "使用排水好的土壤",
            "冬季减少浇水",
            "避免叶片长期潮湿"
        ],
        toxicity: "non-toxic",
        benefits: ["drought-resistant", "decorative", "low-maintenance"],
        imageUrl: "/images/plants/succulent.jpg"
    }
];
// Plant knowledge data
const plantKnowledge = [
    {
        plantName: "绿萝",
        category: "care",
        title: "绿萝基础养护",
        content: "绿萝是最适合新手的室内植物之一，它对光照要求不严，适应性强。",
        difficulty: 1,
        tags: ["基础养护", "新手友好", "空气净化"]
    },
    {
        plantName: "绿萝",
        category: "propagation",
        title: "绿萝扦插繁殖",
        content: "绿萝很容易通过扦插繁殖。剪取10-15cm的茎段，插入湿润土壤中，保持湿润即可。",
        difficulty: 1,
        tags: ["繁殖", "扦插", "简单操作"]
    },
    {
        plantName: "仙人掌",
        category: "care",
        title: "仙人掌浇水要点",
        content: "仙人掌耐旱，浇水要遵循\"干透浇透\"原则，土壤完全干透后再浇透水。",
        difficulty: 1,
        tags: ["浇水", "耐旱", "仙人掌"]
    },
    {
        plantName: "薄荷",
        category: "care",
        title: "薄荷修剪技巧",
        content: "定期修剪薄荷可以促进分枝，保持植株健康。每次采摘顶部2-3对叶片即可。",
        difficulty: 2,
        tags: ["修剪", "薄荷", "香草"]
    }
];
// Plant problem data
const plantProblems = [
    {
        plantName: "绿萝",
        name: "叶片发黄",
        description: "绿萝叶片发黄，可能是由于浇水过多或光照不足。",
        symptoms: ["叶片发黄", "叶片下垂", "根部腐烂"],
        causes: ["浇水过多", "光照不足", "土壤排水不良"],
        solutions: [
            "减少浇水频率，让土壤干透再浇",
            "移至明亮散射光处",
            "检查并改善排水",
            "更换干燥的土壤"
        ],
        severity: 3
    },
    {
        plantName: "仙人掌",
        name: "腐烂问题",
        description: "仙人掌基部出现软化和腐烂，通常是浇水过多导致。",
        symptoms: ["基部软化", "异味", "颜色变深"],
        causes: ["浇水过多", "积水", "通风不良"],
        solutions: [
            "停止浇水，让土壤完全干透",
            "切除腐烂部分，涂抹杀菌剂",
            "改善通风条件",
            "使用排水良好的土壤"
        ],
        severity: 4
    },
    {
        plantName: "薄荷",
        name: "徒长问题",
        description: "薄荷茎秆细长，叶片稀少，光照不足导致徒长。",
        symptoms: ["茎秆细长", "节间距离大", "叶片小而薄"],
        causes: ["光照不足", "氮肥过多"],
        solutions: [
            "增加光照时间",
            "减少氮肥使用",
            "适当修剪促进分枝",
            "提供充足散射光"
        ],
        severity: 2
    }
];
// Seasonal care data
const plantSeasons = [
    {
        plantName: "绿萝",
        season: "spring",
        tasks: ["换盆", "施肥", "修剪"],
        careTips: ["春季是生长旺季，增加浇水频率", "使用平衡肥料", "修剪枯黄叶片"]
    },
    {
        plantName: "绿萝",
        season: "summer",
        tasks: ["增加浇水", "遮阴", "喷水降温"],
        careTips: ["注意通风", "避免强光直射", "保持土壤湿润"]
    },
    {
        plantName: "仙人掌",
        season: "spring",
        tasks: ["少量浇水", "施肥", "检查病虫害"],
        careTips: ["开始正常浇水频率", "使用仙人掌专用肥", "注意通风"]
    },
    {
        plantName: "仙人掌",
        season: "summer",
        tasks: ["充足阳光", "控制浇水", "遮阴保护"],
        careTips: ["提供充足阳光", "避免暴雨", "注意温度控制"]
    }
];
async function main() {
    console.log('开始导入AI园艺设计师的种子数据...');
    // Create plants
    console.log('🌱 导入植物数据...');
    for (const plant of commonPlants) {
        await prisma.plant.upsert({
            where: { name: plant.name },
            update: plant,
            create: plant
        });
    }
    // Create plant knowledge
    console.log('📚 导入植物知识库...');
    for (const knowledge of plantKnowledge) {
        const plant = await prisma.plant.findUnique({
            where: { name: knowledge.plantName }
        });
        if (plant) {
            await prisma.plantKnowledge.create({
                data: {
                    plantId: plant.id,
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
    for (const problem of plantProblems) {
        const plant = await prisma.plant.findUnique({
            where: { name: problem.plantName }
        });
        if (plant) {
            await prisma.plantProblem.create({
                data: {
                    plantId: plant.id,
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
    for (const season of plantSeasons) {
        const plant = await prisma.plant.findUnique({
            where: { name: season.plantName }
        });
        if (plant) {
            await prisma.plantSeason.create({
                data: {
                    plantId: plant.id,
                    season: season.season,
                    tasks: season.tasks,
                    careTips: season.careTips
                }
            });
        }
    }
    console.log('✅ 种子数据导入完成！');
    console.log(`🌱 导入了 ${commonPlants.length} 种常见植物`);
    console.log(`📚 导入了 ${plantKnowledge.length} 条植物知识`);
    console.log(`🚨 导入了 ${plantProblems.length} 个常见问题`);
    console.log(`📅 导入了 ${plantSeasons.length} 条季节养护信息`);
}
main()
    .catch((e) => {
    console.error('导入种子数据时出错:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seedPlants.js.map