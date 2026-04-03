import { SocialController } from '../../controllers/socialController';
import { prisma } from '../../utils/database';
import { AuthRequest } from '../../middleware/auth';
import { createError } from '../../middleware/errorHandler';

// Mock the database
jest.mock('../../utils/database');
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

// Mock authentication middleware
const createMockAuthRequest = (userId: string, userData?: any): AuthRequest => {
  return {
    user: {
      id: userId,
      name: 'Test User',
      email: 'test@example.com',
      ...userData
    },
    headers: {},
    body: {},
    params: {},
    query: {}
  } as unknown as AuthRequest;
};

describe('SocialController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createGroup', () => {
    it('should create a new social group successfully', async () => {
      const mockRequest = createMockAuthRequest('user1');
      mockRequest.body = {
        name: 'Test Garden Group',
        description: 'A group for garden enthusiasts',
        isPrivate: false
      };

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const mockGroup = {
        id: 'group1',
        name: 'Test Garden Group',
        description: 'A group for garden enthusiasts',
        isPrivate: false,
        createdAt: new Date(),
        members: [{
          id: 'user1',
          name: 'Test User',
          avatar: null
        }],
        challenges: []
      };

      mockPrisma.socialGroup.create.mockResolvedValue(mockGroup);

      await SocialController.createGroup(mockRequest, mockResponse);

      expect(mockPrisma.socialGroup.create).toHaveBeenCalledWith({
        data: {
          name: 'Test Garden Group',
          description: 'A group for garden enthusiasts',
          isPrivate: false,
          members: {
            connect: {
              id: 'user1'
            }
          }
        },
        include: {
          members: true,
          challenges: true
        }
      });

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockGroup
      });
    });

    it('should handle database errors gracefully', async () => {
      const mockRequest = createMockAuthRequest('user1');
      mockRequest.body = {
        name: 'Test Garden Group',
        description: 'A group for garden enthusiasts'
      };

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      mockPrisma.socialGroup.create.mockRejectedValue(new Error('Database error'));

      await SocialController.createGroup(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: { message: 'Failed to create group' }
      });
    });
  });

  describe('getUserGroups', () => {
    it('should return user groups successfully', async () => {
      const mockRequest = createMockAuthRequest('user1');
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const mockGroups = [
        {
          id: 'group1',
          name: 'Test Garden Group',
          description: 'A group for garden enthusiasts',
          isPrivate: false,
          createdAt: new Date(),
          members: [{
            id: 'user1',
            name: 'Test User',
            avatar: null
          }],
          challenges: [{
            id: 'challenge1',
            title: 'Test Challenge',
            isActive: true
          }]
        }
      ];

      mockPrisma.socialGroup.findMany.mockResolvedValue(mockGroups);

      await SocialController.getUserGroups(mockRequest, mockResponse);

      expect(mockPrisma.socialGroup.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { isPublic: false },
            {
              members: {
                some: {
                  id: 'user1'
                }
              }
            }
          ]
        },
        include: {
          members: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          },
          challenges: {
            select: {
              id: true,
              title: true,
              isActive: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockGroups
      });
    });
  });

  describe('joinGroup', () => {
    it('should join a public group successfully', async () => {
      const mockRequest = createMockAuthRequest('user1');
      mockRequest.params = { groupId: 'group1' };

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const mockGroup = {
        id: 'group1',
        name: 'Test Garden Group',
        isPrivate: false
      };

      mockPrisma.socialGroup.findUnique.mockResolvedValue(mockGroup);

      await SocialController.joinGroup(mockRequest, mockResponse);

      expect(mockPrisma.socialGroup.findUnique).toHaveBeenCalledWith({
        where: { id: 'group1' }
      });

      expect(mockPrisma.socialGroup.update).toHaveBeenCalledWith({
        where: { id: 'group1' },
        data: {
          members: {
            connect: {
              id: 'user1'
            }
          }
        }
      });

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Successfully joined group'
      });
    });

    it('should reject joining a private group', async () => {
      const mockRequest = createMockAuthRequest('user1');
      mockRequest.params = { groupId: 'group1' };

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const mockGroup = {
        id: 'group1',
        name: 'Test Garden Group',
        isPrivate: true
      };

      mockPrisma.socialGroup.findUnique.mockResolvedValue(mockGroup);

      await SocialController.joinGroup(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: { message: 'Cannot join private group' }
      });
    });

    it('should handle group not found', async () => {
      const mockRequest = createMockAuthRequest('user1');
      mockRequest.params = { groupId: 'nonexistent' };

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      mockPrisma.socialGroup.findUnique.mockResolvedValue(null);

      await SocialController.joinGroup(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: { message: 'Group not found' }
      });
    });
  });

  describe('leaveGroup', () => {
    it('should leave a group successfully', async () => {
      const mockRequest = createMockAuthRequest('user1');
      mockRequest.params = { groupId: 'group1' };

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await SocialController.leaveGroup(mockRequest, mockResponse);

      expect(mockPrisma.socialGroup.update).toHaveBeenCalledWith({
        where: { id: 'group1' },
        data: {
          members: {
            disconnect: {
              id: 'user1'
            }
          }
        }
      });

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Successfully left group'
      });
    });
  });

  describe('createChallenge', () => {
    it('should create a group challenge successfully', async () => {
      const mockRequest = createMockAuthRequest('user1');
      mockRequest.body = {
        groupId: 'group1',
        title: 'Monthly Garden Challenge',
        description: 'Reduce water usage by 20%',
        targetValue: 20,
        unit: 'percent',
        startDate: '2026-04-01',
        endDate: '2026-04-30'
      };

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const mockGroup = {
        id: 'group1',
        name: 'Test Garden Group',
        members: [{ id: 'user1', name: 'Test User' }]
      };

      const mockChallenge = {
        id: 'challenge1',
        groupId: 'group1',
        title: 'Monthly Garden Challenge',
        description: 'Reduce water usage by 20%',
        targetValue: 20,
        unit: 'percent',
        startDate: new Date('2026-04-01'),
        endDate: new Date('2026-04-30'),
        isActive: true,
        group: {
          id: 'group1',
          name: 'Test Garden Group'
        }
      };

      const mockGroupMembers = {
        members: [
          { id: 'user1', name: 'Test User' },
          { id: 'user2', name: 'Another User' }
        ]
      };

      mockPrisma.socialGroup.findFirst.mockResolvedValue(mockGroup);
      mockPrisma.socialGroup.create.mockResolvedValue(mockChallenge);
      mockPrisma.socialGroup.findUnique.mockResolvedValue(mockGroupMembers);
      mockPrisma.userChallenge.createMany.mockResolvedValue({});

      await SocialController.createChallenge(mockRequest, mockResponse);

      expect(mockPrisma.socialGroup.create).toHaveBeenCalledWith({
        data: {
          groupId: 'group1',
          title: 'Monthly Garden Challenge',
          description: 'Reduce water usage by 20%',
          targetValue: 20,
          unit: 'percent',
          startDate: new Date('2026-04-01'),
          endDate: new Date('2026-04-30'),
          isActive: true
        },
        include: {
          group: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockChallenge
      });
    });

    it('should reject challenge creation for non-group members', async () => {
      const mockRequest = createMockAuthRequest('user1');
      mockRequest.body = {
        groupId: 'group1',
        title: 'Monthly Garden Challenge',
        description: 'Reduce water usage by 20%',
        targetValue: 20,
        unit: 'percent',
        startDate: '2026-04-01',
        endDate: '2026-04-30'
      };

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      mockPrisma.socialGroup.findFirst.mockResolvedValue(null);

      await SocialController.createChallenge(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: { message: 'You are not a member of this group' }
      });
    });
  });

  describe('updateChallengeProgress', () => {
    it('should update challenge progress successfully', async () => {
      const mockRequest = createMockAuthRequest('user1');
      mockRequest.params = { challengeId: 'challenge1' };
      mockRequest.body = { progress: 50 };

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const mockUserChallenge = {
        id: 'userChallenge1',
        challengeId: 'challenge1',
        userId: 'user1',
        progress: 0,
        completed: false,
        challenge: {
          title: 'Monthly Garden Challenge'
        }
      };

      const mockUpdatedChallenge = {
        id: 'userChallenge1',
        progress: 50,
        completed: false,
        completedAt: null
      };

      mockPrisma.userChallenge.findFirst.mockResolvedValue(mockUserChallenge);
      mockPrisma.userChallenge.update.mockResolvedValue(mockUpdatedChallenge);

      await SocialController.updateChallengeProgress(mockRequest, mockResponse);

      expect(mockPrisma.userChallenge.update).toHaveBeenCalledWith({
        where: { id: 'userChallenge1' },
        data: {
          progress: 50,
          completed: false,
          completedAt: null
        }
      });

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockUpdatedChallenge
      });
    });

    it('should create achievement when challenge is completed', async () => {
      const mockRequest = createMockAuthRequest('user1');
      mockRequest.params = { challengeId: 'challenge1' };
      mockRequest.body = { progress: 100 };

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const mockUserChallenge = {
        id: 'userChallenge1',
        challengeId: 'challenge1',
        userId: 'user1',
        progress: 0,
        completed: false,
        challenge: {
          title: 'Monthly Garden Challenge'
        }
      };

      const mockUpdatedChallenge = {
        id: 'userChallenge1',
        progress: 100,
        completed: true,
        completedAt: new Date()
      };

      mockPrisma.userChallenge.findFirst.mockResolvedValue(mockUserChallenge);
      mockPrisma.userChallenge.update.mockResolvedValue(mockUpdatedChallenge);
      mockPrisma.achievement.create.mockResolvedValue({});

      await SocialController.updateChallengeProgress(mockRequest, mockResponse);

      expect(mockPrisma.achievement.create).toHaveBeenCalledWith({
        data: {
          userId: 'user1',
          title: '挑战完成',
          description: '完成了碳减排挑战: Monthly Garden Challenge',
          icon: '🏆',
          points: 100
        }
      });

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockUpdatedChallenge
      });
    });

    it('should handle challenge not found', async () => {
      const mockRequest = createMockAuthRequest('user1');
      mockRequest.params = { challengeId: 'nonexistent' };
      mockRequest.body = { progress: 50 };

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      mockPrisma.userChallenge.findFirst.mockResolvedValue(null);

      await SocialController.updateChallengeProgress(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: { message: 'Challenge not found or not enrolled' }
      });
    });
  });

  describe('getLeaderboard', () => {
    it('should return group leaderboard successfully', async () => {
      const mockRequest = createMockAuthRequest('user1');
      mockRequest.params = { groupId: 'group1' };
      mockRequest.query = { period: 'week' };

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const mockGroupMembers = {
        members: [
          { id: 'user1', name: 'Test User', avatar: null },
          { id: 'user2', name: 'Another User', avatar: null }
        ]
      };

      const mockAchievements = [
        {
          id: 'achievement1',
          title: 'Test Achievement',
          points: 50,
          createdAt: new Date()
        }
      ];

      const mockCarbonRecords = [
        {
          id: 'record1',
          type: 'OFFSET',
          carbonEmission: 10,
          date: new Date(),
          category: 'ENERGY'
        }
      ];

      mockPrisma.socialGroup.findUnique.mockResolvedValue(mockGroupMembers);
      mockPrisma.achievement.findMany.mockResolvedValue(mockAchievements);
      mockPrisma.carbonRecord.findMany.mockResolvedValue(mockCarbonRecords);

      const mockLeaderboard = [
        {
          user: {
            id: 'user1',
            name: 'Test User',
            avatar: null
          },
          totalPoints: 50,
          totalReduction: 10,
          achievementsCount: 1,
          recordsCount: 1
        },
        {
          user: {
            id: 'user2',
            name: 'Another User',
            avatar: null
          },
          totalPoints: 0,
          totalReduction: 0,
          achievementsCount: 0,
          recordsCount: 0
        }
      ];

      // Mock the Promise.all return
      (jest.spyOn(SocialController as any, 'calculateCarbonImpact') as jest.Mock)
        .mockResolvedValue({ totalEmissions: 10, reductionsCount: 1, impactScore: 10 });

      // Mock the leaderboard creation and sorting
      jest.spyOn(Promise, 'all').mockResolvedValueOnce(mockLeaderboard);
      
      // Mock the sort method
      const originalSort = Array.prototype.sort;
      Array.prototype.sort = jest.fn(function() {
        return originalSort.call(this, (a: any, b: any) => b.totalPoints - a.totalPoints);
      });

      await SocialController.getLeaderboard(mockRequest, mockResponse);

      // Restore original sort
      Array.prototype.sort = originalSort;

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          leaderboard: mockLeaderboard.sort((a: any, b: any) => b.totalPoints - a.totalPoints),
          period: 'week',
          totalMembers: 2
        }
      });
    });
  });

  describe('getUserSocialStats', () => {
    it('should return user social stats successfully', async () => {
      const mockRequest = createMockAuthRequest('user1');
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Mock database counts
      mockPrisma.socialGroup.count.mockResolvedValue(3);
      mockPrisma.userChallenge.count.mockResolvedValue(5);
      mockPrisma.achievement.count.mockResolvedValue(10);
      mockPrisma.achievement.count.mockResolvedValue(2); // Recent achievements

      // Mock carbon impact calculation
      (jest.spyOn(SocialController as any, 'calculateCarbonImpact') as jest.Mock)
        .mockResolvedValue({
          totalEmissions: 100,
          reductionsCount: 5,
          impactScore: 50
        });

      await SocialController.getUserSocialStats(mockRequest, mockResponse);

      expect(mockPrisma.socialGroup.count).toHaveBeenCalledWith({
        where: {
          members: {
            some: { id: 'user1' }
          }
        }
      });

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          groups: 3,
          activeChallenges: 5,
          totalAchievements: 10,
          recentAchievements: 2,
          carbonImpact: {
            totalEmissions: 100,
            reductionsCount: 5,
            impactScore: 50
          }
        }
      });
    });
  });
});