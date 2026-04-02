import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../src/server';
import { AuthRequest } from '@/types';

const prisma = new PrismaClient();

describe('Community Post Management', () => {
  let userId: string;
  let communityId: string;
  let postId: string;

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
        description: 'Test community for post management',
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

    // Create test post
    const post = await prisma.post.create({
      data: {
        title: 'Test Post',
        content: 'This is a test post content',
        communityId,
        authorId: userId,
        isPinned: false,
        views: 0,
      }
    });
    postId = post.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: 'test@example.com' } });
    await prisma.community.deleteMany({ where: { name: 'Test Community' } });
  });

  describe('POST /communities/:id/posts', () => {
    it('should create a new post in community', async () => {
      const postData = {
        title: 'My New Post',
        content: 'This is my new post content',
        imageUrl: 'https://example.com/image.jpg',
      };

      const response = await request(app)
        .post(`/communities/${communityId}/posts`)
        .set('Authorization', `Bearer test-token`)
        .send(postData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.title).toBe(postData.title);
      expect(response.body.data.content).toBe(postData.content);
      expect(response.body.data.author).toBeDefined();
    });

    it('should prevent non-members from creating posts', async () => {
      const user2 = await prisma.user.create({
        data: {
          email: 'test2@example.com',
          username: 'testuser2',
          password: 'hashedpassword',
          name: 'Test User 2',
        }
      });

      const postData = {
        title: 'Unauthorized Post',
        content: 'This should not be created',
      };

      const response = await request(app)
        .post(`/communities/${communityId}/posts`)
        .set('Authorization', `Bearer test-token-${user2.id}`)
        .send(postData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Must be a community member to create posts');

      // Clean up
      await prisma.user.delete({ where: { id: user2.id } });
    });

    it('should require title for post creation', async () => {
      const postData = {
        content: 'Post without title',
      };

      const response = await request(app)
        .post(`/communities/${communityId}/posts`)
        .set('Authorization', `Bearer test-token`)
        .send(postData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /communities/:id/posts', () => {
    it('should return community posts', async () => {
      const response = await request(app)
        .get(`/communities/${communityId}/posts`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      
      // Should have at least one post
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should handle pagination for community posts', async () => {
      const response = await request(app)
        .get(`/communities/${communityId}/posts?page=1&limit=10`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(10);
    });

    it('should search posts by title or content', async () => {
      const response = await request(app)
        .get(`/communities/${communityId}/posts?search=Test`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      
      // All returned posts should contain "Test"
      const allPostsContainTest = response.body.data.every((post: any) => 
        post.title.includes('Test') || post.content.includes('Test')
      );
      expect(allPostsContainTest).toBe(true);
    });
  });

  describe('PUT /communities/:id/posts/:postId/pin', () => {
    it('should allow admin to pin a post', async () => {
      const response = await request(app)
        .put(`/communities/${communityId}/posts/${postId}/pin`)
        .set('Authorization', `Bearer test-token`)
        .send({ isPinned: true })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.isPinned).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should allow admin to unpin a post', async () => {
      const response = await request(app)
        .put(`/communities/${communityId}/posts/${postId}/pin`)
        .set('Authorization', `Bearer test-token`)
        .send({ isPinned: false })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.isPinned).toBe(false);
    });

    it('should prevent non-admin from pinning posts', async () => {
      const user2 = await prisma.user.create({
        data: {
          email: 'test2@example.com',
          username: 'testuser2',
          password: 'hashedpassword',
          name: 'Test User 2',
        }
      });

      // Add as regular member
      await prisma.communityMembership.create({
        data: {
          userId: user2.id,
          communityId,
          role: 'member',
        }
      });

      const response = await request(app)
        .put(`/communities/${communityId}/posts/${postId}/pin`)
        .set('Authorization', `Bearer test-token-${user2.id}`)
        .send({ isPinned: true })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Only admins and moderators can pin posts');

      // Clean up
      await prisma.user.delete({ where: { id: user2.id } });
    });
  });

  describe('POST /communities/:id/reports', () => {
    it('should allow member to report content', async () => {
      const reportData = {
        type: 'post',
        reason: 'Inappropriate content',
        description: 'This post contains offensive material',
        targetId: postId,
      };

      const response = await request(app)
        .post(`/communities/${communityId}/reports`)
        .set('Authorization', `Bearer test-token`)
        .send(reportData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.type).toBe(reportData.type);
      expect(response.body.data.reason).toBe(reportData.reason);
    });

    it('should prevent non-members from reporting content', async () => {
      const user2 = await prisma.user.create({
        data: {
          email: 'test2@example.com',
          username: 'testuser2',
          password: 'hashedpassword',
          name: 'Test User 2',
        }
      });

      const reportData = {
        type: 'post',
        reason: 'Test report',
        targetId: postId,
      };

      const response = await request(app)
        .post(`/communities/${communityId}/reports`)
        .set('Authorization', `Bearer test-token-${user2.id}`)
        .send(reportData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Must be a community member to report content');

      // Clean up
      await prisma.user.delete({ where: { id: user2.id } });
    });
  });
});