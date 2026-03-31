const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 AI园艺设计师 - 数据库初始化脚本');
  console.log('=====================================');

  try {
    // Step 1: Check if database exists, if not create it
    console.log('🔍 检查数据库状态...');
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('✅ 数据库已存在');
    } catch (error) {
      console.log('📁 数据库不存在，创建中...');
      execSync('touch dev.db', { cwd: __dirname });
      console.log('✅ 数据库文件已创建');
    }

    // Step 2: Run database migrations
    console.log('🔄 运行数据库迁移...');
    try {
      execSync('npx prisma migrate dev --name init', { 
        cwd: __dirname,
        stdio: 'inherit'
      });
      console.log('✅ 数据库迁移完成');
    } catch (error) {
      console.log('⚠️ 迁移失败，尝试重置...');
      try {
        execSync('npx prisma migrate reset --force', { 
          cwd: __dirname,
          stdio: 'inherit'
        });
        console.log('✅ 数据库重置完成');
      } catch (resetError) {
        console.log('🔧 尝试生成客户端...');
        execSync('npx prisma generate', { 
          cwd: __dirname,
          stdio: 'inherit'
        });
        console.log('✅ Prisma客户端已生成');
      }
    }

    // Step 3: Generate Prisma client
    console.log('🔧 生成Prisma客户端...');
    execSync('npx prisma generate', { 
      cwd: __dirname,
      stdio: 'inherit'
    });
    console.log('✅ Prisma客户端生成完成');

    // Step 4: Seed plant data
    console.log('🌿 导入植物基础数据...');
    try {
      const seedPlantsScript = path.join(__dirname, 'seedPlants.js');
      if (fs.existsSync(seedPlantsScript)) {
        execSync(`node ${seedPlantsScript}`, { 
          cwd: __dirname,
          stdio: 'inherit'
        });
        console.log('✅ 植物数据导入完成');
      } else {
        console.log('⚠️ 植物种子脚本不存在，跳过');
      }
    } catch (error) {
      console.error('❌ 植物数据导入失败:', error.message);
    }

    // Step 5: Seed environment data
    console.log('🌍 导入环境数据...');
    try {
      const seedEnvironmentScript = path.join(__dirname, 'seedEnvironment.js');
      if (fs.existsSync(seedEnvironmentScript)) {
        execSync(`node ${seedEnvironmentScript}`, { 
          cwd: __dirname,
          stdio: 'inherit'
        });
        console.log('✅ 环境数据导入完成');
      } else {
        console.log('⚠️ 环境种子脚本不存在，跳过');
      }
    } catch (error) {
      console.error('❌ 环境数据导入失败:', error.message);
    }

    // Step 6: Verify data
    console.log('📊 验证数据完整性...');
    const stats = await Promise.all([
      prisma.plant.count(),
      prisma.plantKnowledge.count(),
      prisma.plantProblem.count(),
      prisma.plantSeason.count(),
      prisma.weather.count(),
      prisma.community.count()
    ]);

    console.log('\n📈 数据统计:');
    console.log(`🌱 植物种类: ${stats[0]}`);
    console.log(`📚 植物知识: ${stats[1]}`);
    console.log(`🚨 植物问题: ${stats[2]}`);
    console.log(`📅 季节养护: ${stats[3]}`);
    console.log(`🌤️ 天气数据: ${stats[4]}`);
    console.log(`👥 社区数量: ${stats[5]}`);

    if (stats[0] > 0) {
      console.log('\n✅ 数据库初始化成功完成！');
      console.log('🚀 AI园艺设计师已准备就绪，可以开始使用了！');
      console.log('\n💡 下一步:');
      console.log('1. 运行 `npm run dev` 启动开发服务器');
      console.log('2. 访问 http://localhost:3000 查看应用');
      console.log('3. 使用API端点测试功能');
    } else {
      console.log('\n❌ 数据初始化失败，请检查错误信息');
    }

  } catch (error) {
    console.error('❌ 数据库初始化过程中发生错误:', error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error('初始化失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });