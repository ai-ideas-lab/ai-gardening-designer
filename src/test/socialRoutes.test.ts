import request from 'supertest';
import { app } from '../../index';
import { prisma } from '../../utils/database';

// Mock the database
jest.mock('../../utils/database');
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

// Mock authentication
jest.mock('../../middleware/auth', () => ({
  authenticate: (req: any, res: any, next: any) => {
    req.user = {
      id: 'user1',
      name: 'Test User',
      email: 'test@example.com'
    };
    next();
  }
}));

describe('Social Routes Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/social/groups', () => {
    it('should create a new group successfully', async () => {
      const groupData = {
        name: 'Test Garden Group',
        description: 'A group for garden enthusiasts',
        isPrivate: false
      };

      const mockGroup = {
        id: 'group1',
        ...groupData,
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

      const response = await request(app)
        .post('/api/social/groups')
        .send(groupData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject(mockGroup);
      expect(mockPrisma.socialGroup.create).toHaveBeenCalledWith({
        data: {
          ...groupData,
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
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/social/groups')
        .send({
          // Missing required name field
          description: 'A group for garden enthusiasts'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/social/groups', () => {
    it('should return user groups', async () => {
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

      const response = await request(app)
        .get('/api/social/groups')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0]).toMatchObject(mockGroups[0]);
    });
  });

  describe('POST /api/social/groups/:groupId/join', () => {
    it('should join a public group successfully', async () => {
      const mockGroup = {
        id: 'group1',
        name: 'Test Garden Group',
        isPrivate: false
      };

      mockPrisma.socialGroup.findUnique.mockResolvedValue(mockGroup);

      const response = await request(app)
        .post('/api/social/groups/group1/join')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Successfully joined group');
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
    });

    it('should reject joining private group', async () => {
      const mockGroup = {
        id: 'group1',
        name: 'Test Garden Group',
        isPrivate: true
      };

      mockPrisma.socialGroup.findUnique.mockResolvedValue(mockGroup);

      const response = await request(app)
        .post('/api/social/groups/group1/join')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Cannot join private group');
    });
  });

  describe('POST /api/social/groups/:groupId/leave', () => {
    it('should leave group successfully', async () => {
      const response = await request(app)
        .post('/api/social/groups/group1/leave')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Successfully left group');
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
    });
  });

  describe('POST /api/social/challenges', () => {
    it('should create a challenge successfully', async () => {
      const challengeData = {
        groupId: 'group1',
        title: 'Monthly Garden Challenge',
        description: 'Reduce water usage by 20%',
        targetValue: 20,
        unit: 'percent',
        startDate: '2026-04-01',
        endDate: '2026-04-30'
      };

      const mockGroup = {
        id: 'group1',
        name: 'Test Garden Group',
        members: [{ id: 'user1', name: 'Test User' }]
      };

      const mockChallenge = {
        id: 'challenge1',
        ...challengeData,
        startDate: new Date('2026-04-01'),
        endDate: new Date('2026-04-30'),
        isActive: true,
        group: {
          id: 'group1',
          name: 'Test Garden Group'
        }
      };

      mockPrisma.socialGroup.findFirst.mockResolvedValue(mockGroup);
      mockPrisma.socialGroup.create.mockResolvedValue(mockChallenge);
      mockPrisma.socialGroup.findUnique.mockResolvedValue({
        members: [
          { id: 'user1', name: 'Test User' },
          { id: 'user2', name: 'Another User' }
        ]
      });
      mockPrisma.userChallenge.createMany.mockResolvedValue({});

      const response = await request(app)
        .post('/api/social/challenges')
        .send(challengeData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject(mockChallenge);
    });

    it('should reject challenge creation for non-group members', async () => {
      mockPrisma.socialGroup.findFirst.mockResolvedValue(null);

      const challengeData = {
        groupId: 'group1',
        title: 'Monthly Garden Challenge',
        description: 'Reduce water usage by 20%',
        targetValue: 20,
        unit: 'percent',
        startDate: '2026-04-01',
        endDate: '2026-04-30'
      };

      const response = await request(app)
        .post('/api/social/challenges')
        .send(challengeData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('You are not a member of this group');
    });
  });

  describe('GET /api/social/groups/:groupId/leaderboard', () => {
    it('should return group leaderboard', async () => {
      const mockGroupMembers = {
        members: [
          { id: 'user1', name: 'Test User', avatar: null },
          { id: 'user2', name: 'Another User', avatar: null }
        ]
      };

      mockPrisma.socialGroup.findUnique.mockResolvedValue(mockGroupMembers);
      mockPrisma.achievement.findMany.mockResolvedValue([]);
      mockPrisma.carbonRecord.findMany.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/social/groups/group1/leaderboard')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('leaderboard');
      expect(response.body.data).toHaveProperty('period');
      expect(response.body.data).toHaveProperty('totalMembers');
    });
  });

  describe('GET /api/social/stats', () => {
    it('should return user social stats', async () => {
      mockPrisma.socialGroup.count.mockResolvedValue(3);
      mockPrisma.userChallenge.count.mockResolvedValue(5);
      mockPrisma.achievement.count.mockResolvedValue(10);
      mockPrisma.achievement.count.mockResolvedValue(2); // Recent achievements

      const response = await request(app)
        .get('/api/social/stats')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('groups', 3);
      expect(response.body.data).toHaveProperty('activeChallenges', 5);
      expect(response.body.data).toHaveProperty('totalAchievements', 10);
      expect(response.body.data).toHaveProperty('recentAchievements', 2);
    });
  });
});