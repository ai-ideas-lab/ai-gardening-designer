import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Weather data for major Chinese cities
const weatherData = [
  {
    location: "北京",
    date: "2026-03-15",
    temperature: 15.5,
    humidity: 45,
    precipitation: 2.3,
    windSpeed: 12.5,
    weatherCondition: "partly-cloudy",
    uvIndex: 6
  },
  {
    location: "上海",
    date: "2026-03-15",
    temperature: 18.2,
    humidity: 65,
    precipitation: 8.1,
    windSpeed: 8.3,
    weatherCondition: "rainy",
    uvIndex: 3
  },
  {
    location: "广州",
    date: "2026-03-15",
    temperature: 22.8,
    humidity: 75,
    precipitation: 15.2,
    windSpeed: 6.7,
    weatherCondition: "cloudy",
    uvIndex: 4
  },
  {
    location: "深圳",
    date: "2026-03-15",
    temperature: 23.5,
    humidity: 78,
    precipitation: 12.8,
    windSpeed: 7.2,
    weatherCondition: "overcast",
    uvIndex: 2
  },
  {
    location: "杭州",
    date: "2026-03-15",
    temperature: 17.3,
    humidity: 58,
    precipitation: 5.6,
    windSpeed: 9.8,
    weatherCondition: "sunny",
    uvIndex: 7
  }
];

// Default plant recommendations for different conditions
const defaultRecommendations = [
  {
    conditions: {
      light: "low",
      water: "moderate",
      difficulty: 1
    },
    recommendations: [
      { name: "绿萝", reason: "耐阴性强，适合室内养护" },
      { name: "吊兰", reason: "适应性强，容易繁殖" },
      { name: "虎皮兰", reason: "极度耐阴，几乎不需要照料" }
    ]
  },
  {
    conditions: {
      light: "medium",
      water: "moderate",
      difficulty: 2
    },
    recommendations: [
      { name: "薄荷", reason: "需要半阴环境，生长迅速" },
      { name: "吊兰", reason: "中等光照下表现良好" },
      { name: "龟背竹", reason: "喜散射光，形态优美" }
    ]
  },
  {
    conditions: {
      light: "full-sun",
      water: "minimal",
      difficulty: 1
    },
    recommendations: [
      { name: "仙人掌", reason: "耐晒耐旱，新手友好" },
      { name: "多肉植物", reason: "喜欢阳光，储水能力强" },
      { name: "石莲花", reason: "耐晒，形态独特" }
    ]
  }
];

async function main() {
  console.log('🌍 初始化AI园艺设计师环境数据...');

  // Create weather data
  console.log('🌤️ 导入天气数据...');
  for (const weather of weatherData) {
    await prisma.weather.upsert({
      where: {
        location_date: {
          location: weather.location,
          date: weather.date
        }
      },
      update: weather,
      create: weather
    });
  }

  // Create default recommendations
  console.log('💡 导入默认推荐规则...');
  for (const rec of defaultRecommendations) {
    const plantNames = rec.recommendations.map(r => r.name);
    const plants = await prisma.plant.findMany({
      where: { name: { in: plantNames } }
    });

    if (plants.length > 0) {
      await prisma.recommendation.create({
        data: {
          type: 'plant',
          title: `适合${JSON.stringify(rec.conditions)}条件植物推荐`,
          description: `基于光照、水分和养护难度推荐适合的植物`,
          data: {
            conditions: rec.conditions,
            recommendations: rec.recommendations,
            plantIds: plants.map(p => p.id)
          },
          confidence: 0.8,
          userId: 'default-user' // This would normally be a real user ID
        }
      });
    }
  }

  // Create sample communities
  console.log('👥 创建示例社区...');
  const communities = [
    {
      name: "阳台园艺爱好者",
      description: "分享阳台种植经验和技巧，互相学习成长",
      isPublic: true,
      rules: "1. 互相尊重，友好交流\n2. 分享真实经验\n3. 禁止广告内容"
    },
    {
      name: "新手园丁交流群",
      description: "新手互助，共同成长，从零开始学习园艺",
      isPublic: true,
      rules: "1. 多问多学\n2. 分享失败经验也很宝贵\n3. 耐心解答新手问题"
    },
    {
      name: "香草植物爱好者",
      description: "专注于香草植物的种植、使用和分享",
      isPublic: true,
      rules: "1. 分享香草种植技巧\n2. 讨论香草的用途\n3. 交流品种选择"
    }
  ];

  for (const community of communities) {
    await prisma.community.create({
      data: community
    });
  }

  // Create sample posts
  console.log('📝 创建示例帖子...');
  const samplePosts = [
    {
      title: "我的第一个阳台小花园",
      content: "经过一个月的努力，我的小阳台终于有了一些绿意！种植了绿萝、薄荷和几株多肉植物，虽然有些经验不足，但看到它们慢慢长大真的很开心。",
      communityName: "阳台园艺爱好者",
      authorName: "园艺新手",
      views: 156,
      comments: 23
    },
    {
      title: "仙人掌浇水心得分享",
      content: "养仙人掌一年多了，终于摸到了一些门道。总结一下：1. 浇水要少而频，2. 土壤一定要透气，3. 冬季基本可以不浇水。希望对新手有帮助！",
      communityName: "新手园丁交流群",
      authorName: "多肉达人",
      views: 89,
      comments: 15
    },
    {
      title: "薄荷的多种用途",
      content: "薄荷不仅是很好的观赏植物，还有很多实用价值：泡茶、驱蚊、做调料、提神醒脑...今天分享一下我的薄荷种植心得。",
      communityName: "香草植物爱好者",
      authorName: "香草专家",
      views: 203,
      comments: 31
    }
  ];

  for (const post of samplePosts) {
    const community = await prisma.community.findFirst({
      where: { name: post.communityName }
    });
    
    if (community) {
      // Create the post
      const newPost = await prisma.post.create({
        data: {
          title: post.title,
          content: post.content,
          communityId: community.id,
          authorId: 'sample-author', // This would normally be a real user ID
          isPinned: false,
          views: post.views
        }
      });

      // Create some sample comments
      const comments = [
        "分享得很好，受益匪浅！",
        "有同样的经验，确实需要耐心",
        "请问在哪里可以买到这么好的植物？",
        "期待更多分享！",
        "图片看起来很棒，种植技术不错"
      ];

      for (const comment of comments.slice(0, post.comments)) {
        await prisma.comment.create({
          data: {
            content: comment,
            postId: newPost.id,
            authorId: 'sample-commenter' // This would normally be a real user ID
          }
        });
      }
    }
  }

  console.log('✅ 环境数据初始化完成！');
  console.log(`🌤️ 导入了 ${weatherData.length} 条天气数据`);
  console.log(`💡 导入了 ${defaultRecommendations.length} 条推荐规则`);
  console.log(`👥 创建了 ${communities.length} 个示例社区`);
  console.log(`📝 创建了 ${samplePosts.length} 个示例帖子`);
}

main()
  .catch((e) => {
    console.error('初始化环境数据时出错:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });