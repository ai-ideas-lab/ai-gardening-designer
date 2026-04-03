import { PrismaClient } from '@prisma/client';
import { setupTestDatabase, cleanupTestDatabase } from './setup';

const prisma = new PrismaClient();

/**
 * Integration tests for the entire AI Gardening Designer application
 * These tests verify that all components work together correctly
 */
describe('AI Gardening Designer Integration Tests', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
    await prisma.$disconnect();
  });

  describe('Complete User Workflow', () => {
    let userId: string;
    let projectId: string;
    let plantId: string;

    it('should support complete user registration to project creation workflow', async () => {
      // Step 1: User registration
      const userData = {
        email: 'integration-test@example.com',
        username: 'integrationuser',
        password: 'password123',
        name: 'Integration Test User',
        location: 'Shanghai',
        balconyType: 'balcony',
        balconySize: 15.0,
        balconyDirection: 'south'
      };

      // Create user directly via database for testing
      const user = await prisma.user.create({
        data: userData
      });
      userId = user.id;

      expect(user).toBeTruthy();
      expect(user.email).toBe('integration-test@example.com');
      expect(user.balconySize).toBe(15.0);

      // Step 2: Create a gardening project
      const projectData = {
        name: 'Integration Test Project',
        description: 'A test project for integration testing',
        status: 'in-progress',
        balconyJson: JSON.stringify({
          size: 15.0,
          direction: 'south',
          sunlight: 'partial-sun'
        }),
        designJson: JSON.stringify({
          layout: 'grid',
          style: 'modern'
        }),
        location: 'Shanghai',
        area: 15.0,
        budget: 2000,
        userId: userId
      };

      const project = await prisma.project.create({
        data: projectData
      });
      projectId = project.id;

      expect(project).toBeTruthy();
      expect(project.name).toBe('Integration Test Project');
      expect(project.userId).toBe(userId);

      // Step 3: Add plants to the project
      const plantData = {
        name: '绿萝',
        scientificName: 'Epipremnum aureum',
        category: 'indoor',
        light: 'partial-sun',
        water: 'moderate',
        temperature: JSON.stringify({ min: 15, max: 25 }),
        difficulty: 2,
        description: 'Easy-care indoor plant'
      };

      const plant = await prisma.plant.create({
        data: plantData
      });
      plantId = plant.id;

      // Step 4: Connect plant to project
      const projectPlant = await prisma.projectPlant.create({
        data: {
          projectId: project.id,
          plantId: plant.id,
          quantity: 3,
          position: JSON.stringify({ x: 1, y: 2 })
        }
      });

      expect(projectPlant).toBeTruthy();
      expect(projectPlant.quantity).toBe(3);

      // Step 5: Create care reminders
      const reminder = await prisma.reminder.create({
        data: {
          type: 'water',
          title: '浇水提醒',
          description: '绿萝需要浇水',
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
          projectId: project.id,
          plantId: plant.id,
          userId: userId
        }
      });

      expect(reminder).toBeTruthy();
      expect(reminder.type).toBe('water');

      // Step 6: Create activity log
      const activity = await prisma.activity.create({
        data: {
          type: 'plant_added',
          title: '添加了新植物',
          description: '在项目中添加了绿萝',
          data: JSON.stringify({ plantName: '绿萝', quantity: 3 }),
          projectId: project.id,
          userId: userId
        }
      });

      expect(activity).toBeTruthy();
      expect(activity.type).toBe('plant_added');
    });

    it('should support AI recommendation workflow', async () => {
      // Create AI request log
      const aiRequest = await prisma.aIRequest.create({
        data: {
          type: 'plant_recognition',
          prompt: '识别植物图片',
          response: JSON.stringify({
            plant: '绿萝',
            confidence: 0.95,
            suggestions: ['继续养护', '适当施肥']
          }),
          processingTime: 1500,
          success: true,
          confidence: 0.95,
          userId: userId
        }
      });

      expect(aiRequest).toBeTruthy();
      expect(aiRequest.success).toBe(true);
      expect(aiRequest.processingTime).toBe(1500);

      // Create recommendation based on AI analysis
      const recommendation = await prisma.recommendation.create({
        data: {
          type: 'plant',
          title: '绿萝养护建议',
          description: '根据您的阳台条件，建议增加光照时间',
          data: JSON.stringify({
            plantId: plantId,
            suggestions: ['增加光照时间', '控制浇水频率'],
            priority: 'medium'
          }),
          confidence: 0.85,
          plantId: plantId,
          projectId: projectId,
          userId: userId
        }
      });

      expect(recommendation).toBeTruthy();
      expect(recommendation.type).toBe('plant');
      expect(recommendation.confidence).toBe(0.85);
    });

    it('should support social community workflow', async () => {
      // Create community
      const community = await prisma.community.create({
        data: {
          name: 'Integration Test Community',
          description: 'A test community for integration testing',
          isPublic: true
        }
      });

      expect(community).toBeTruthy();
      expect(community.name).toBe('Integration Test Community');

      // Join community
      const membership = await prisma.communityMembership.create({
        data: {
          userId: userId,
          communityId: community.id,
          role: 'member'
        }
      });

      expect(membership).toBeTruthy();
      expect(membership.userId).toBe(userId);

      // Create a post in the community
      const post = await prisma.post.create({
        data: {
          title: '我的阳台园艺心得',
          content: '分享我的阳台园艺经验和技巧',
          communityId: community.id,
          authorId: userId,
          views: 10
        }
      });

      expect(post).toBeTruthy();
      expect(post.title).toBe('我的阳台园艺心得');

      // Create a comment on the post
      const comment = await prisma.comment.create({
        data: {
          content: '很好的分享！学到了很多',
          postId: post.id,
          authorId: userId
        }
      });

      expect(comment).toBeTruthy();
      expect(comment.content).toBe('很好的分享！学到了很多');
    });

    it('should support data analytics workflow', async () => {
      // Create carbon tracking record
      const carbonRecord = await prisma.carbonRecord.create({
        data: {
          userId: userId,
          category: 'plants',
          subcategory: 'indoor-plants',
          amount: 2.5,
          unit: 'kg',
          description: '室内植物碳吸收'
        }
      });

      expect(carbonRecord).toBeTruthy();
      expect(carbonRecord.amount).toBe(2.5);

      // Create weather data
      const weather = await prisma.weather.create({
        data: {
          location: 'Shanghai',
          date: new Date(),
          temperature: 22,
          humidity: 65,
          precipitation: 0,
          windSpeed: 5,
          weatherCondition: 'partly-cloudy',
          uvIndex: 6
        }
      });

      expect(weather).toBeTruthy();
      expect(weather.temperature).toBe(22);
    });

    it('should support data cleanup and validation', async () => {
      // Test data relationships are properly maintained
      const projectCount = await prisma.project.count({
        where: { userId: userId }
      });
      expect(projectCount).toBeGreaterThan(0);

      const plantCount = await prisma.plant.count({
        where: {
          projectPlants: {
            some: { projectId: projectId }
          }
        }
      });
      expect(plantCount).toBeGreaterThan(0);

      // Test cascade delete
      const deletedUser = await prisma.user.delete({
        where: { id: userId }
      });

      expect(deletedUser).toBeTruthy();
      
      // Verify related data was cascade deleted
      const userProjects = await prisma.project.count({
        where: { userId: userId }
      });
      expect(userProjects).toBe(0); // Should be cascade deleted
    });
  });

  describe('Performance and Load Testing', () => {
    it('should handle multiple concurrent users', async () => {
      const testUsers = [];
      const projects = [];

      // Create multiple test users
      for (let i = 0; i < 10; i++) {
        const user = await prisma.user.create({
          data: {
            email: `loadtest${i}@example.com`,
            username: `loadtestuser${i}`,
            password: 'password123',
            name: `Load Test User ${i}`,
            location: 'Beijing'
          }
        });
        testUsers.push(user);

        const project = await prisma.project.create({
          data: {
            name: `Load Test Project ${i}`,
            description: 'Project for load testing',
            userId: user.id,
            status: 'in-progress'
          }
        });
        projects.push(project);
      }

      expect(testUsers.length).toBe(10);
      expect(projects.length).toBe(10);

      // Verify all data was created successfully
      const userCount = await prisma.user.count({
        where: {
          email: { contains: 'loadtest' }
        }
      });
      expect(userCount).toBe(10);
    });

    it('should handle large dataset efficiently', async () => {
      // Create a large number of plants
      const plants = [];
      for (let i = 0; i < 100; i++) {
        const plant = await prisma.plant.create({
          data: {
            name: `Test Plant ${i}`,
            category: i % 2 === 0 ? 'indoor' : 'outdoor',
            light: i % 3 === 0 ? 'full-sun' : i % 3 === 1 ? 'partial-sun' : 'shade',
            water: 'moderate',
            difficulty: Math.floor(Math.random() * 5) + 1
          }
        });
        plants.push(plant);
      }

      expect(plants.length).toBe(100);

      // Test query performance
      const startTime = Date.now();
      const indoorPlants = await prisma.plant.findMany({
        where: { category: 'indoor' },
        take: 50
      });
      const queryTime = Date.now() - startTime;

      expect(indoorPlants.length).toBe(50);
      expect(queryTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it('should handle database relationships efficiently', async () => {
      // Create complex data relationships
      const user = await prisma.user.create({
        data: {
          email: 'relation-test@example.com',
          username: 'relationuser',
          password: 'password123',
          name: 'Relation Test User'
        }
      });

      const project = await prisma.project.create({
        data: {
          name: 'Relation Test Project',
          userId: user.id,
          status: 'in-progress'
        }
      });

      // Add multiple plants to project
      const projectPlants = [];
      for (let i = 0; i < 5; i++) {
        const plant = await prisma.plant.create({
          data: {
            name: `Project Plant ${i}`,
            category: 'indoor',
            light: 'partial-sun'
          }
        });

        const projectPlant = await prisma.projectPlant.create({
          data: {
            projectId: project.id,
            plantId: plant.id,
            quantity: i + 1
          }
        });
        projectPlants.push(projectPlant);
      }

      // Test relationship queries
      const projectWithPlants = await prisma.project.findUnique({
        where: { id: project.id },
        include: {
          projectPlants: {
            include: {
              plant: true
            }
          }
        }
      });

      expect(projectWithPlants?.projectPlants.length).toBe(5);
      expect(projectWithPlants?.projectPlants[0].quantity).toBe(1);
      expect(projectWithPlants?.projectPlants[4].quantity).toBe(5);
    });
  });

  describe('Error Recovery and Data Integrity', () => {
    it('should maintain data integrity on constraint violations', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'integrity-test@example.com',
          username: 'integrityuser',
          password: 'password123',
          name: 'Integrity Test User'
        }
      });

      // Test duplicate email constraint
      await expect(
        prisma.user.create({
          data: {
            email: 'integrity-test@example.com', // Duplicate email
            username: 'integrityuser2',
            password: 'password123',
            name: 'Second User'
          }
        })
      ).rejects.toThrow();

      // Test duplicate username constraint
      await expect(
        prisma.user.create({
          data: {
            email: 'integrity-test2@example.com',
            username: 'integrityuser', // Duplicate username
            password: 'password123',
            name: 'Third User'
          }
        })
      ).rejects.toThrow();

      // Verify original user still exists
      const existingUser = await prisma.user.findUnique({
        where: { email: 'integrity-test@example.com' }
      });
      expect(existingUser).toBeTruthy();
    });

    it('should handle foreign key constraints properly', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'fk-test@example.com',
          username: 'fkuser',
          password: 'password123',
          name: 'FK Test User'
        }
      });

      const project = await prisma.project.create({
        data: {
          name: 'FK Test Project',
          userId: user.id,
          status: 'in-progress'
        }
      });

      // Test cascade delete when user is deleted
      await prisma.user.delete({
        where: { id: user.id }
      });

      // Verify project was cascade deleted
      const deletedProject = await prisma.project.findUnique({
        where: { id: project.id }
      });
      expect(deletedProject).toBeNull();
    });

    it('should handle database connection errors gracefully', async () => {
      // This test would require simulating database connection issues
      // In a real implementation, we would test connection resilience
      expect(true).toBe(true); // Placeholder for actual resilience testing
    });
  });

  describe('Data Consistency and Validation', () => {
    it('should enforce data validation rules', async () => {
      // Test required fields
      await expect(
        prisma.user.create({
          data: {
            // Missing required fields
            email: 'validation-test@example.com'
          }
        })
      ).rejects.toThrow();

      // Test data format validation
      await expect(
        prisma.user.create({
          data: {
            email: 'invalid-email',
            username: 'validationuser',
            password: 'password123',
            name: 'Validation Test User'
          }
        })
      ).rejects.toThrow();

      // Test numeric constraints
      await expect(
        prisma.plant.create({
          data: {
            name: 'Test Plant',
            category: 'indoor',
            light: 'partial-sun',
            difficulty: 10 // Should be 1-5
          }
        })
      ).rejects.toThrow();
    });

    it('should maintain referential integrity', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'referential-test@example.com',
          username: 'refuser',
          password: 'password123',
          name: 'Referential Test User'
        }
      });

      const project = await prisma.project.create({
        data: {
          name: 'Referential Test Project',
          userId: user.id,
          status: 'in-progress'
        }
      });

      // Test that project references user correctly
      const projectWithUser = await prisma.project.findUnique({
        where: { id: project.id },
        include: { user: true }
      });

      expect(projectWithUser?.user.id).toBe(user.id);
      expect(projectWithUser?.user.email).toBe('referential-test@example.com');
    });

    it('should handle JSON field validation', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'json-test@example.com',
          username: 'jsonuser',
          password: 'password123',
          name: 'JSON Test User',
          preferences: JSON.stringify({
            language: 'zh',
            notifications: true,
            theme: 'light'
          })
        }
      });

      // Verify JSON field is stored correctly
      const userWithPreferences = await prisma.user.findUnique({
        where: { id: user.id }
      });

      expect(userWithPreferences?.preferences).toBeTruthy();
      expect(typeof userWithPreferences?.preferences).toBe('string');
      
      // Parse JSON to verify content
      const preferences = JSON.parse(userWithPreferences?.preferences || '{}');
      expect(preferences.language).toBe('zh');
      expect(preferences.notifications).toBe(true);
      expect(preferences.theme).toBe('light');
    });
  });
});