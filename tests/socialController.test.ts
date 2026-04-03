import { PrismaClient } from '@prisma/client';
import * as socialController from '../src/controllers/socialController';
import { setupTestDatabase, cleanupTestDatabase, getTestPrisma, createMockRequest, createMockResponse } from './setup';

const prisma = getTestPrisma();

describe('SocialController', () => {
  let authToken: string;
  let userId: string;
  let communityId: string;

  beforeAll(async () => {
    await setupTestDatabase();
    
    // Create test user and get auth token
    const loginReq = createMockRequest({
      email: 'test@example.com',
      password: 'password123'
    });
    
    const loginRes = createMockResponse();
    // This would normally call the actual login controller
    // For now, let's assume we have a valid token
    authToken = 'mock-jwt-token';
    userId = 'test-user-id';
    
    // Create test community
    const community = await prisma.community.create({
      data: {
        name: '园艺爱好者社区',
        description: '分享园艺经验和技巧',
        isPublic: true
      }
    });
    communityId = community.id;
  });

  afterAll(async () => {
    await cleanupTestDatabase();
    await prisma.$disconnect();
  });

  describe('createCommunity', () => {
    it('should create a new community successfully', async () => {
      const req = createMockRequest({
        name: '阳台园艺交流群',
        description: '专门分享小阳台园艺经验',
        isPublic: true,
        rules: '友善交流，禁止广告'
      });

      const res = createMockResponse();

      await socialController.createCommunity(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: '社区创建成功',
        data: expect.objectContaining({
          name: '阳台园艺交流群',
          description: '专门分享小阳台园艺经验',
          isPublic: true
        })
      }));
    });

    it('should return error for duplicate community name', async () => {
      const req = createMockRequest({
        name: '园艺爱好者社区', // Already exists
        description: 'Duplicate community'
      });

      const res = createMockResponse();

      await socialController.createCommunity(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: expect.stringContaining('社区名称已存在')
      }));
    });

    it('should validate community name length', async () => {
      const req = createMockRequest({
        name: 'ab', // Too short
        description: 'Very short community name'
      });

      const res = createMockResponse();

      await socialController.createCommunity(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: expect.stringContaining('名称长度')
      }));
    });
  });

  describe('joinCommunity', () => {
    it('should allow user to join a community successfully', async () => {
      const req = createMockRequest(
        {}, // No body needed
        { communityId }, // URL parameters
        {}, // Query params
        { authorization: `Bearer ${authToken}` } // Headers
      );

      const res = createMockResponse();

      await socialController.joinCommunity(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: '成功加入社区'
      }));

      // Verify membership was created
      const membership = await prisma.communityMembership.findFirst({
        where: {
          userId,
          communityId
        }
      });
      expect(membership).toBeTruthy();
    });

    it('should return error for joining non-existent community', async () => {
      const req = createMockRequest(
        {},
        { communityId: 'nonexistent-id' },
        {},
        { authorization: `Bearer ${authToken}` }
      );

      const res = createMockResponse();

      await socialController.joinCommunity(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: '社区不存在'
      }));
    });

    it('should prevent duplicate community membership', async () => {
      // First join
      await prisma.communityMembership.create({
        data: {
          userId,
          communityId
        }
      });

      const req = createMockRequest(
        {},
        { communityId },
        {},
        { authorization: `Bearer ${authToken}` }
      );

      const res = createMockResponse();

      await socialController.joinCommunity(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: '您已经是该社区成员'
      }));
    });
  });

  describe('leaveCommunity', () => {
    it('should allow user to leave a community successfully', async () => {
      // First join the community
      await prisma.communityMembership.create({
        data: {
          userId,
          communityId
        }
      });

      const req = createMockRequest(
        {},
        { communityId },
        {},
        { authorization: `Bearer ${authToken}` }
      );

      const res = createMockResponse();

      await socialController.leaveCommunity(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: '成功退出社区'
      }));

      // Verify membership was removed
      const membership = await prisma.communityMembership.findFirst({
        where: {
          userId,
          communityId
        }
      });
      expect(membership).toBeFalsy();
    });

    it('should return error for leaving non-existent community', async () => {
      const req = createMockRequest(
        {},
        { communityId: 'nonexistent-id' },
        {},
        { authorization: `Bearer ${authToken}` }
      );

      const res = createMockResponse();

      await socialController.leaveCommunity(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: '社区不存在'
      }));
    });
  });

  describe('createPost', () => {
    it('should create a new post successfully', async () => {
      const req = createMockRequest({
        title: '我的小阳台改造分享',
        content: '分享我的小阳台改造经验，从 barren 到绿意盎然...',
        imageUrl: 'https://example.com/balcony-before.jpg',
        tags: ['阳台改造', '绿植', 'DIY']
      }, {}, {}, { authorization: `Bearer ${authToken}` });

      const res = createMockResponse();

      await socialController.createPost(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: '帖子创建成功',
        data: expect.objectContaining({
          title: '我的小阳台改造分享',
          content: '分享我的小阳台改造经验，从 barren 到绿意盎然...',
          imageUrl: 'https://example.com/balcony-before.jpg'
        })
      }));

      // Verify post was created
      const post = await prisma.post.findFirst({
        where: {
          title: '我的小阳台改造分享'
        }
      });
      expect(post).toBeTruthy();
    });

    it('should validate post content length', async () => {
      const req = createMockRequest({
        title: '短标题',
        content: '太短的内容' // Should fail validation
      }, {}, {}, { authorization: `Bearer ${authToken}` });

      const res = createMockResponse();

      await socialController.createPost(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: expect.stringContaining('内容长度')
      }));
    });

    it('should require authentication for creating posts', async () => {
      const req = createMockRequest({
        title: '未认证的帖子',
        content: '这个帖子没有认证'
      });

      const res = createMockResponse();

      await socialController.createPost(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: '请先登录'
      }));
    });
  });

  describe('getCommunityPosts', () => {
    it('should get community posts with pagination', async () => {
      // Create test posts
      await prisma.post.createMany({
        data: [
          {
            title: '帖子1',
            content: '内容1',
            communityId,
            authorId: userId,
            views: 10
          },
          {
            title: '帖子2',
            content: '内容2',
            communityId,
            authorId: userId,
            views: 5
          }
        ]
      });

      const req = createMockRequest(
        {},
        {},
        { page: 1, limit: 10, sortBy: 'views', sortOrder: 'desc' } // Query params
      );

      const res = createMockResponse();

      await socialController.getCommunityPosts(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          posts: expect.any(Array),
          pagination: expect.objectContaining({
            page: 1,
            limit: 10,
            total: expect.any(Number)
          })
        })
      }));

      // Should return 2 posts
      const posts = res.json.mock.calls[0][0].data.posts;
      expect(posts.length).toBe(2);
    });

    it('should handle empty community', async () => {
      const req = createMockRequest(
        {},
        {},
        { page: 1, limit: 10 }
      );

      const res = createMockResponse();

      await socialController.getCommunityPosts(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          posts: [],
          pagination: expect.objectContaining({
            total: 0
          })
        })
      }));
    });
  });

  describe('addComment', () => {
    let postId: string;

    beforeEach(async () => {
      // Create a test post
      const post = await prisma.post.create({
        data: {
          title: '测试帖子',
          content: '这是一个测试帖子',
          communityId,
          authorId: userId
        }
      });
      postId = post.id;
    });

    it('should add a comment to a post successfully', async () => {
      const req = createMockRequest({
        content: '很好的分享！学到了很多',
        parentId: null // Top-level comment
      }, { postId }, {}, { authorization: `Bearer ${authToken}` });

      const res = createMockResponse();

      await socialController.addComment(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: '评论添加成功',
        data: expect.objectContaining({
          content: '很好的分享！学到了很多',
          parentId: null
        })
      }));

      // Verify comment was created
      const comment = await prisma.comment.findFirst({
        where: {
          postId,
          content: '很好的分享！学到了很多'
        }
      });
      expect(comment).toBeTruthy();
    });

    it('should handle nested comments', async () => {
      // First create a parent comment
      const parentComment = await prisma.comment.create({
        data: {
          content: '父评论',
          postId,
          authorId: userId
        }
      });

      const req = createMockRequest({
        content: '回复父评论',
        parentId: parentComment.id
      }, { postId }, {}, { authorization: `Bearer ${authToken}` });

      const res = createMockResponse();

      await socialController.addComment(req, res);

      expect(res.status).toHaveBeenCalledWith(201);

      // Verify nested comment was created
      const comment = await prisma.comment.findFirst({
        where: {
          postId,
          parentId: parentComment.id
        }
      });
      expect(comment).toBeTruthy();
    });

    it('should validate comment content', async () => {
      const req = createMockRequest({
        content: '短', // Too short
        postId: postId
      }, {}, {}, { authorization: `Bearer ${authToken}` });

      const res = createMockResponse();

      await socialController.addComment(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: expect.stringContaining('评论内容')
      }));
    });
  });

  describe('likePost', () => {
    let postId: string;

    beforeEach(async () => {
      // Create a test post
      const post = await prisma.post.create({
        data: {
          title: '测试帖子',
          content: '这是一个测试帖子',
          communityId,
          authorId: userId,
          likes: 0
        }
      });
      postId = post.id;
    });

    it('should like a post successfully', async () => {
      const req = createMockRequest(
        {},
        { postId },
        {},
        { authorization: `Bearer ${authToken}` }
      );

      const res = createMockResponse();

      await socialController.likePost(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: '点赞成功',
        data: expect.objectContaining({
          liked: true,
          likeCount: 1
        })
      }));

      // Verify like was recorded
      const post = await prisma.post.findUnique({
        where: { id: postId }
      });
      expect(post?.likes).toBe(1);
    });

    it('should unlike a post', async () => {
      // First like the post
      await prisma.post.update({
        where: { id: postId },
        data: { likes: 1 }
      });

      const req = createMockRequest(
        {},
        { postId },
        {},
        { authorization: `Bearer ${authToken}` }
      );

      const res = createMockResponse();

      await socialController.likePost(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: '取消点赞成功',
        data: expect.objectContaining({
          liked: false,
          likeCount: 0
        })
      }));
    });
  });

  describe('getCommunityStats', () => {
    it('should return community statistics', async () => {
      // Create test data
      await prisma.post.createMany({
        data: [
          {
            title: '帖子1',
            content: '内容1',
            communityId,
            authorId: userId,
            views: 100,
            likes: 5
          },
          {
            title: '帖子2',
            content: '内容2',
            communityId,
            authorId: userId,
            views: 50,
            likes: 3
          }
        ]
      });

      const req = createMockRequest(
        {},
        { communityId },
        {}
      );

      const res = createMockResponse();

      await socialController.getCommunityStats(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          memberCount: expect.any(Number),
          postCount: expect.any(Number),
          totalViews: expect.any(Number),
          totalLikes: expect.any(Number),
          recentActivity: expect.any(Array)
        })
      }));
    });
  });

  describe('reportContent', () => {
    it('should report inappropriate content', async () => {
      const req = createMockRequest({
        type: 'post',
        reason: '垃圾广告',
        description: '帖子中包含大量广告内容',
        targetId: 'some-post-id'
      }, {}, {}, { authorization: `Bearer ${authToken}` });

      const res = createMockResponse();

      await socialController.reportContent(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: '举报提交成功',
        data: expect.objectContaining({
          reportId: expect.any(String),
          status: 'pending'
        })
      }));

      // Verify report was created
      const report = await prisma.report.findFirst({
        where: {
          targetId: 'some-post-id',
          reason: '垃圾广告'
        }
      });
      expect(report).toBeTruthy();
    });

    it('should validate report data', async () => {
      const req = createMockRequest({
        type: 'invalid-type',
        reason: ''
      }, {}, {}, { authorization: `Bearer ${authToken}` });

      const res = createMockResponse();

      await socialController.reportContent(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: expect.stringContaining('举报类型')
      }));
    });
  });
});