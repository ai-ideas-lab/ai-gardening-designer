import { PrismaClient } from '@prisma/client';
import { ProjectService } from '../src/services/projectService';
import { PlantService } from '../src/services/plantService';
import { ReminderService } from '../src/services/reminderService';

const prisma = new PrismaClient();

describe('Database Models and Services', () => {
  let projectService: ProjectService;
  let plantService: PlantService;
  let reminderService: ReminderService;

  beforeAll(async () => {
    // Initialize services
    projectService = new ProjectService();
    plantService = new PlantService();
    reminderService = new ReminderService();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Project Service', () => {
    let testProjectId: string;

    test('should create a new project', async () => {
      const projectData = {
        name: 'Test Garden Project',
        description: 'A beautiful garden project for testing',
        status: 'planning',
        balconyData: {
          type: 'balcony',
          size: 15,
          direction: 'south',
          location: 'Beijing'
        },
        designData: {
          style: 'modern',
          colorScheme: 'green',
          budget: 5000
        },
        userId: 'test-user-id'
      };

      const result = await projectService.createProject(projectData);
      
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.name).toBe(projectData.name);
      expect(result.status).toBe(projectData.status);
      expect(result.balconyData).toBeDefined();
      expect(result.designData).toBeDefined();
      
      testProjectId = result.id;
    });

    test('should get project by ID', async () => {
      const result = await projectService.getProjectById(testProjectId);
      
      expect(result).toBeDefined();
      expect(result.id).toBe(testProjectId);
      expect(result.name).toBe('Test Garden Project');
    });

    test('should update project status', async () => {
      const updateData = {
        status: 'in-progress',
        progress: 25
      };

      const result = await projectService.updateProject(testProjectId, updateData);
      
      expect(result).toBeDefined();
      expect(result.status).toBe('in-progress');
      expect(result.progress).toBe(25);
    });

    test('should get all projects for user', async () => {
      const result = await projectService.getUserProjects('test-user-id');
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('name');
    });

    test('should delete project', async () => {
      const result = await projectService.deleteProject(testProjectId);
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    test('should return error for non-existent project', async () => {
      const result = await projectService.getProjectById('non-existent-id');
      
      expect(result).toBeNull();
    });
  });

  describe('Plant Service', () => {
    let testPlantId: string;

    test('should create a new plant', async () => {
      const plantData = {
        name: 'Test Plant',
        scientificName: 'Testus Plantus',
        commonNames: ['Test Plant', 'Experimental Plant'],
        category: 'indoor',
        light: 'medium',
        water: 'moderate',
        temperature: { ideal: '20-25°C', min: '15°C', max: '30°C' },
        humidity: { ideal: '50-70%', min: '40%', max: '80%' },
        soil: 'well-draining potting mix',
        growthRate: 'medium',
        matureSize: { height: '30cm', spread: '20cm' },
        difficulty: 2,
        description: 'A test plant for unit testing purposes',
        careTips: [
          'Keep soil moist but not waterlogged',
          'Provide bright indirect light',
          'Fertilize monthly during growing season'
        ],
        toxicity: 'non-toxic',
        benefits: ['air-purification', 'easy-care'],
        imageUrl: '/images/test-plant.jpg'
      };

      const result = await plantService.createPlant(plantData);
      
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.name).toBe(plantData.name);
      expect(result.scientificName).toBe(plantData.scientificName);
      expect(result.category).toBe(plantData.category);
      expect(result.difficulty).toBe(plantData.difficulty);
      
      testPlantId = result.id;
    });

    test('should get plant by ID', async () => {
      const result = await plantService.getPlantById(testPlantId);
      
      expect(result).toBeDefined();
      expect(result.id).toBe(testPlantId);
      expect(result.name).toBe('Test Plant');
    });

    test('should get all plants with filters', async () => {
      const result = await plantService.getPlants({
        category: 'indoor',
        difficulty: 2,
        light: 'medium'
      });
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      result.forEach((plant: any) => {
        expect(plant.category).toBe('indoor');
        expect(plant.difficulty).toBe(2);
        expect(plant.light).toBe('medium');
      });
    });

    test('should search plants by name', async () => {
      const result = await plantService.searchPlants('test');
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      result.forEach((plant: any) => {
        expect(plant.name.toLowerCase()).toContain('test');
      });
    });

    test('should get plants by category', async () => {
      const result = await plantService.getPlantsByCategory('indoor');
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      result.forEach((plant: any) => {
        expect(plant.category).toBe('indoor');
      });
    });

    test('should update plant information', async () => {
      const updateData = {
        description: 'Updated description for test plant',
        difficulty: 3
      };

      const result = await plantService.updatePlant(testPlantId, updateData);
      
      expect(result).toBeDefined();
      expect(result.description).toBe(updateData.description);
      expect(result.difficulty).toBe(updateData.difficulty);
    });

    test('should delete plant', async () => {
      const result = await plantService.deletePlant(testPlantId);
      
      expect(result).toBeDefined;
      expect(result.success).toBe(true);
    });

    test('should return error for non-existent plant', async () => {
      const result = await plantService.getPlantById('non-existent-id');
      
      expect(result).toBeNull();
    });
  });

  describe('Reminder Service', () => {
    let testReminderId: string;

    test('should create a new reminder', async () => {
      const reminderData = {
        type: 'water',
        title: 'Water the plants',
        description: 'Remember to water all indoor plants today',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        projectId: 'test-project-id',
        plantId: testPlantId,
        userId: 'test-user-id'
      };

      const result = await reminderService.createReminder(reminderData);
      
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.type).toBe(reminderData.type);
      expect(result.title).toBe(reminderData.title);
      expect(result.dueDate).toEqual(reminderData.dueDate);
      expect(result.completed).toBe(false);
      
      testReminderId = result.id;
    });

    test('should get reminder by ID', async () => {
      const result = await reminderService.getReminderById(testReminderId);
      
      expect(result).toBeDefined();
      expect(result.id).toBe(testReminderId);
      expect(result.title).toBe('Water the plants');
    });

    test('should get all reminders for user', async () => {
      const result = await reminderService.getUserReminders('test-user-id');
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      result.forEach((reminder: any) => {
        expect(reminder.userId).toBe('test-user-id');
      });
    });

    test('should get reminders by type', async () => {
      const result = await reminderService.getRemindersByType('water');
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      result.forEach((reminder: any) => {
        expect(reminder.type).toBe('water');
      });
    });

    test('should get upcoming reminders', async () => {
      const result = await reminderService.getUpcomingReminders(24); // Next 24 hours
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      result.forEach((reminder: any) => {
        const reminderDate = new Date(reminder.dueDate);
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        
        expect(reminderDate.getTime()).toBeGreaterThan(now.getTime());
        expect(reminderDate.getTime()).toBeLessThanOrEqual(tomorrow.getTime());
      });
    });

    test('should update reminder', async () => {
      const updateData = {
        title: 'Updated reminder title',
        completed: true
      };

      const result = await reminderService.updateReminder(testReminderId, updateData);
      
      expect(result).toBeDefined();
      expect(result.title).toBe(updateData.title);
      expect(result.completed).toBe(true);
    });

    test('should mark reminder as completed', async () => {
      const result = await reminderService.markReminderCompleted(testReminderId);
      
      expect(result).toBeDefined();
      expect(result.completed).toBe(true);
    });

    test('should delete reminder', async () => {
      const result = await reminderService.deleteReminder(testReminderId);
      
      expect(result).toBeDefined;
      expect(result.success).toBe(true);
    });

    test('should return error for non-existent reminder', async () => {
      const result = await reminderService.getReminderById('non-existent-id');
      
      expect(result).toBeNull();
    });
  });

  describe('Database Integration', () => {
    test('should handle database connection', async () => {
      const result = await prisma.$queryRaw`SELECT 1`;
      expect(result).toBeDefined();
    });

    test('should handle database transactions', async () => {
      const transactionResult = await prisma.$transaction(async (tx) => {
        const project = await tx.project.create({
          data: {
            name: 'Transaction Test Project',
            description: 'Test project for transaction handling',
            userId: 'test-user-id'
          }
        });
        
        const plant = await tx.plant.create({
          data: {
            name: 'Transaction Test Plant',
            scientificName: 'Transactionus Testus',
            category: 'indoor',
            difficulty: 1,
            userId: 'test-user-id'
          }
        });
        
        return { project, plant };
      });
      
      expect(transactionResult).toBeDefined();
      expect(transactionResult.project).toBeDefined();
      expect(transactionResult.plant).toBeDefined();
      expect(transactionResult.project.name).toBe('Transaction Test Project');
      expect(transactionResult.plant.name).toBe('Transaction Test Plant');
    });

    test('should handle database errors gracefully', async () => {
      // Test with invalid data that should cause an error
      try {
        await prisma.project.create({
          data: {
            name: '', // Invalid: empty name
            description: 'Test project with invalid data',
            userId: 'test-user-id'
          }
        });
        // If we reach here, the test should fail
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeDefined();
        expect(error instanceof Error).toBe(true);
      }
    });

    test('should handle concurrent operations', async () => {
      const promises = [];
      
      for (let i = 0; i < 5; i++) {
        promises.push(
          prisma.project.create({
            data: {
              name: `Concurrent Test Project ${i}`,
              description: `Test project for concurrent operations ${i}`,
              userId: 'test-user-id'
            }
          })
        );
      }
      
      const results = await Promise.all(promises);
      
      expect(results).toBeDefined();
      expect(results.length).toBe(5);
      results.forEach((result, index) => {
        expect(result.name).toBe(`Concurrent Test Project ${index}`);
      });
    });
  });
});