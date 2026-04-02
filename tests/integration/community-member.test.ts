import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../src/server';
import { AuthRequest } from '@/types';

const prisma = new PrismaClient();

describe('Community Member Management', () => {
  let userId: string;
  let communityId: string;

  beforeAll(async () => {
    // Create test user
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashedpassword',
        name: 'Test User',
      }
    });
    userId = user.id;

    // Create test community
    const community = await prisma.community.create({
      data: {
        name: 'Test Community',
        description: 'Test community for member management',
        isPublic: true,
        members: {
          create: {
            userId,
            role: 'admin',
          }
        }
      }
    });
    communityId = community.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: 'test@example.com' } });
    await prisma.community.deleteMany({ where: { name: 'Test Community' } });
  });

  describe('POST /communities/:id/join', () => {
    it('should allow user to join a community', async () => {
      const response = await request(app)
        .post(`/communities/${communityId}/join`)
        .set('Authorization', `Bearer test-token`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Joined community successfully');
    });

    it('should prevent joining non-existent community', async () => {
      const fakeCommunityId = 'non-existent-id';
      const response = await request(app)
        .post(`/communities/${fakeCommunityId}/join`)
        .set('Authorization', `Bearer test-token`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Community not found');
    });
  });

  describe('POST /communities/:id/leave', () => {
    it('should allow user to leave a community', async () => {
      // First join another user
      const user2 = await prisma.user.create({
        data: {
          email: 'test2@example.com',
          username: 'testuser2',
          password: 'hashedpassword',
          name: 'Test User 2',
        }
      });

      // Join community as regular member
      await prisma.communityMembership.create({
        data: {
          userId: user2.id,
          communityId,
          role: 'member',
        }
      });

      const response = await request(app)
        .post(`/communities/${communityId}/leave`)
        .set('Authorization', `Bearer test-token-${user2.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Left community successfully');

      // Clean up
      await prisma.user.delete({ where: { id: user2.id } });
    });
  });

  describe('GET /communities/:id/members', () => {
    it('should return community members', async () => {
      const response = await request(app)
        .get(`/communities/${communityId}/members`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      
      // Should have at least one member (the admin user)
      const adminMember = response.body.data.find((member: any) => 
        member.userId === userId && member.role === 'admin'
      );
      expect(adminMember).toBeDefined();
    });

    it('should handle pagination for community members', async () => {
      const response = await request(app)
        .get(`/communities/${communityId}/members?limit=10`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.pagination).toBeDefined();
    });
  });
});