import { PrismaClient } from '@prisma/client';

// Use a separate test database
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./test.db'
    }
  }
});

// Test database setup
export async function setupTestDatabase() {
  console.log('Setting up test database...');
  
  // Clean the database before each test run
  await cleanupTestDatabase();
  
  // Seed with test data if needed
  await seedTestData();
}

export async function cleanupTestDatabase() {
  try {
    console.log('Cleaning up test database...');
    
    // Delete all records in the correct order to respect foreign key constraints
    await prisma.userChallenge.deleteMany();
    await prisma.achievement.deleteMany();
    await prisma.carbonRecord.deleteMany();
    await prisma.userPreference.deleteMany();
    await prisma.groupChallenge.deleteMany();
    await prisma.socialGroup.deleteMany();
    await prisma.user.deleteMany();
    await prisma.reminder.deleteMany();
    await prisma.activity.deleteMany();
    await prisma.projectPlant.deleteMany();
    await prisma.project.deleteMany();
    await prisma.plantProblem.deleteMany();
    await prisma.plantSeason.deleteMany();
    await prisma.plantKnowledge.deleteMany();
    await prisma.upload.deleteMany();
    await prisma.communityMembership.deleteMany();
    await prisma.post.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.purchase.deleteMany();
    await prisma.report.deleteMany();
    await prisma.weather.deleteMany();
    await prisma.recommendation.deleteMany();
    
    console.log('Test database cleaned up successfully');
  } catch (error) {
    console.error('Error cleaning up test database:', error);
    throw error;
  }
}

export async function seedTestData() {
  console.log('Seeding test database...');
  
  try {
    // Create test users
    const testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashedpassword',
        name: 'Test User',
        location: 'Beijing',
        balconyType: 'balcony',
        balconySize: 10.5,
        balconyDirection: 'south',
        preferences: JSON.stringify({
          language: 'zh',
          notifications: true,
          theme: 'light'
        })
      }
    });

    // Create test plants
    const testPlant = await prisma.plant.create({
      data: {
        name: '绿萝',
        scientificName: 'Epipremnum aureum',
        commonNames: JSON.stringify(['绿萝', '黄金葛']),
        category: 'indoor',
        light: 'partial-sun',
        water: 'moderate',
        temperature: JSON.stringify({ min: 15, max: 25 }),
        humidity: JSON.stringify({ min: 40, max: 60 }),
        soil: 'well-draining',
        growthRate: 'medium',
        matureSize: JSON.stringify({ height: 20, width: 15 }),
        difficulty: 2,
        description: '常见的室内观叶植物，容易养护',
        careTips: JSON.stringify([
          '保持土壤湿润但不积水',
          '避免阳光直射',
          '定期擦拭叶片'
        ]),
        toxicity: 'non-toxic',
        benefits: JSON.stringify(['净化空气', '易养护', '观赏性强'])
      }
    });

    // Create test project
    const testProject = await prisma.project.create({
      data: {
        name: '小阳台绿植园',
        description: '打造一个美丽的小阳台绿植空间',
        status: 'in-progress',
        balconyJson: JSON.stringify({
          size: 10.5,
          direction: 'south',
          sunlight: 'partial-sun'
        }),
        designJson: JSON.stringify({
          layout: 'grid',
          plants: ['绿萝', '吊兰', '多肉']
        }),
        location: 'Beijing',
        area: 10.5,
        budget: 1000,
        userId: testUser.id
      }
    });

    console.log('Test database seeded successfully');
  } catch (error) {
    console.error('Error seeding test database:', error);
    throw error;
  }
}

export function getTestPrisma() {
  return prisma;
}

export async function closeTestDatabase() {
  await prisma.$disconnect();
}

// Mock Express request object for testing
export const createMockRequest = (body = {}, params = {}, query = {}) => ({
  body,
  params,
  query,
  headers: {
    'content-type': 'application/json'
  },
  user: null,
  io: null
});

// Mock Express response object for testing
export const createMockResponse = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    end: jest.fn().mockReturnThis(),
    locals: {}
  };
  return res;
};

// Mock Next.js response object for frontend testing
export const createMockNextResponse = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    end: jest.fn().mockReturnThis()
  };
  return res;
};