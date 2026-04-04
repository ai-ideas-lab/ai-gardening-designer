/**
 * Test setup helpers for AI Gardening Designer
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Setup test database with test data
 */
export const setupTestDatabase = async () => {
  try {
    // Clear test data
    await prisma.userChallenge.deleteMany();
    await prisma.achievement.deleteMany();
    await prisma.carbonRecord.deleteMany();
    await prisma.socialChallenge.deleteMany();
    await prisma.socialGroupMember.deleteMany();
    await prisma.socialGroup.deleteMany();
    await prisma.reminder.deleteMany();
    await prisma.projectPlant.deleteMany();
    await prisma.project.deleteMany();
    await prisma.plant.deleteMany();
    await prisma.upload.deleteMany();
    await prisma.activity.deleteMany();
    await prisma.user.deleteMany();

    // Create test users
    const testUsers = await prisma.user.createMany({
      data: [
        {
          id: 'user1',
          email: 'test1@example.com',
          password: 'hashedpassword1',
          name: 'Test User 1',
          preferences: JSON.stringify({
            sunlight: 'medium',
            temperature: 'warm',
            difficulty: 'beginner',
            style: 'modern'
          })
        },
        {
          id: 'user2',
          email: 'test2@example.com',
          password: 'hashedpassword2',
          name: 'Test User 2',
          preferences: JSON.stringify({
            sunlight: 'high',
            temperature: 'hot',
            difficulty: 'intermediate',
            style: 'traditional'
          })
        }
      ]
    });

    // Create test plants
    const testPlants = await prisma.plant.createMany({
      data: [
        {
          id: 'plant1',
          name: '绿萝',
          scientificName: 'Epipremnum aureum',
          category: 'indoor',
          light: 'partial-shade',
          water: 'moderate',
          temperature: JSON.stringify([18, 30]),
          humidity: JSON.stringify([40, 80]),
          difficulty: 1,
          description: '非常适合室内养护的观叶植物',
          careTips: JSON.stringify(['保持土壤微湿', '避免阳光直射']),
          benefits: JSON.stringify(['净化空气', '易于养护'])
        },
        {
          id: 'plant2',
          name: '吊兰',
          scientificName: 'Chlorophytum comosum',
          category: 'indoor',
          light: 'low',
          water: 'minimal',
          temperature: JSON.stringify([15, 25]),
          humidity: JSON.stringify([40, 70]),
          difficulty: 1,
          description: '净化空气效果很好的植物',
          careTips: JSON.stringify(['浇水不宜过多', '喜欢半阴环境']),
          benefits: JSON.stringify(['净化甲醛', '释放氧气'])
        }
      ]
    });

    // Create test social groups
    const testGroups = await prisma.socialGroup.createMany({
      data: [
        {
          id: 'group1',
          name: '园艺爱好者',
          description: '喜欢园艺的朋友们',
          isPrivate: false,
          isPublic: true
        },
        {
          id: 'group2',
          name: '阳台种植小组',
          description: '专门讨论阳台种植',
          isPrivate: true,
          isPublic: false
        }
      ]
    });

    // Create test group members
    const testMembers = await prisma.socialGroupMember.createMany({
      data: [
        {
          userId: 'user1',
          groupId: 'group1',
          role: 'admin'
        },
        {
          userId: 'user2',
          groupId: 'group1',
          role: 'member'
        }
      ]
    });

    console.log('✅ Test database setup completed');
    return { testUsers, testPlants, testGroups, testMembers };
  } catch (error) {
    console.error('❌ Error setting up test database:', error);
    throw error;
  }
};

/**
 * Cleanup test database
 */
export const cleanupTestDatabase = async () => {
  try {
    // Clear test data in reverse order of dependencies
    await prisma.userChallenge.deleteMany();
    await prisma.achievement.deleteMany();
    await prisma.carbonRecord.deleteMany();
    await prisma.socialChallenge.deleteMany();
    await prisma.socialGroupMember.deleteMany();
    await prisma.socialGroup.deleteMany();
    await prisma.reminder.deleteMany();
    await prisma.projectPlant.deleteMany();
    await prisma.project.deleteMany();
    await prisma.plant.deleteMany();
    await prisma.upload.deleteMany();
    await prisma.activity.deleteMany();
    await prisma.user.deleteMany();

    console.log('✅ Test database cleanup completed');
  } catch (error) {
    console.error('❌ Error cleaning up test database:', error);
    throw error;
  }
};

/**
 * Get test database client
 */
export const getTestPrisma = () => {
  return prisma;
};

// Export types for testing
export type TestUser = {
  id: string;
  email: string;
  name: string;
  preferences: any;
};

export type TestGroup = {
  id: string;
  name: string;
  description: string;
  isPrivate: boolean;
  isPublic: boolean;
};