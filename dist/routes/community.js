"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const errorHandler_1 = require("@/middleware/errorHandler");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Get all communities
router.get('/', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { page = 1, limit = 20, search, isPublic } = req.query;
    const skip = (parseInt(page.toString()) - 1) * parseInt(limit.toString());
    const where = {};
    if (search) {
        where.OR = [
            { name: { contains: search.toString(), mode: 'insensitive' } },
            { description: { contains: search.toString(), mode: 'insensitive' } }
        ];
    }
    if (isPublic !== undefined) {
        where.isPublic = isPublic === 'true';
    }
    const [communities, total] = await Promise.all([
        prisma.community.findMany({
            where,
            skip,
            take: parseInt(limit.toString()),
            orderBy: { createdAt: 'desc' },
            include: {
                members: {
                    take: 1,
                    select: { id: true, name: true }
                },
                posts: {
                    take: 1,
                    orderBy: { createdAt: 'desc' },
                    select: { id: true, title: true, views: true }
                }
            }
        }),
        prisma.community.count({ where })
    ]);
    const totalPages = Math.ceil(total / parseInt(limit.toString()));
    const response = {
        data: communities,
        pagination: {
            page: parseInt(page.toString()),
            limit: parseInt(limit.toString()),
            total,
            totalPages
        },
        timestamp: new Date().toISOString()
    };
    res.json(response);
}));
// Get community by ID
router.get('/:id', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const community = await prisma.community.findUnique({
        where: { id },
        include: {
            members: {
                orderBy: { joinedAt: 'desc' }
            },
            posts: {
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: {
                    author: {
                        select: { id: true, name: true, avatar: true }
                    },
                    comments: {
                        take: 2,
                        include: {
                            author: {
                                select: { id: true, name: true }
                            }
                        }
                    }
                }
            }
        }
    });
    if (!community) {
        throw (0, errorHandler_1.createError)('Community not found', 404, true);
    }
    const response = {
        success: true,
        data: community,
        message: 'Community retrieved successfully',
        timestamp: new Date().toISOString()
    };
    res.json(response);
}));
// Create new community
router.post('/', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    const { name, description, isPublic = true, rules } = req.body;
    if (!userId) {
        throw (0, errorHandler_1.createError)('User not authenticated', 401, true);
    }
    if (!name) {
        throw (0, errorHandler_1.createError)('Community name is required', 400, true);
    }
    const community = await prisma.community.create({
        data: {
            name,
            description,
            isPublic: isPublic === 'true',
            rules,
            members: {
                create: {
                    userId,
                    role: 'admin'
                }
            }
        },
        include: {
            members: {
                select: { id: true, name: true }
            }
        }
    });
    const response = {
        success: true,
        data: community,
        message: 'Community created successfully',
        timestamp: new Date().toISOString()
    };
    res.status(201).json(response);
}));
// Join community
router.post('/:id/join', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
        throw (0, errorHandler_1.createError)('User not authenticated', 401, true);
    }
    const community = await prisma.community.findUnique({
        where: { id }
    });
    if (!community) {
        throw (0, errorHandler_1.createError)('Community not found', 404, true);
    }
    // Check if already a member
    const existingMembership = await prisma.communityMembership.findUnique({
        where: {
            userId_communityId: {
                userId,
                communityId: id
            }
        }
    });
    if (existingMembership) {
        throw (0, errorHandler_1.createError)('Already a member of this community', 400, true);
    }
    await prisma.communityMembership.create({
        data: {
            userId,
            communityId: id,
            role: 'member'
        }
    });
    const response = {
        success: true,
        message: 'Joined community successfully',
        timestamp: new Date().toISOString()
    };
    res.json(response);
}));
// Leave community
router.post('/:id/leave', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
        throw (0, errorHandler_1.createError)('User not authenticated', 401, true);
    }
    const community = await prisma.community.findUnique({
        where: { id }
    });
    if (!community) {
        throw (0, errorHandler_1.createError)('Community not found', 404, true);
    }
    await prisma.communityMembership.delete({
        where: {
            userId_communityId: {
                userId,
                communityId: id
            }
        }
    });
    const response = {
        success: true,
        message: 'Left community successfully',
        timestamp: new Date().toISOString()
    };
    res.json(response);
}));
// Get community members
router.get('/:id/members', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { limit = 20 } = req.query;
    const members = await prisma.communityMembership.findMany({
        where: { communityId: id },
        take: parseInt(limit.toString()),
        orderBy: { joinedAt: 'desc' },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    avatar: true,
                    location: true
                }
            }
        }
    });
    const response = {
        success: true,
        data: members,
        message: 'Community members retrieved successfully',
        timestamp: new Date().toISOString()
    };
    res.json(response);
}));
// Create community post
router.post('/:id/posts', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const { title, content, imageUrl } = req.body;
    if (!userId) {
        throw (0, errorHandler_1.createError)('User not authenticated', 401, true);
    }
    // Check if user is member of community
    const membership = await prisma.communityMembership.findUnique({
        where: {
            userId_communityId: {
                userId,
                communityId: id
            }
        }
    });
    if (!membership) {
        throw (0, errorHandler_1.createError)('Must be a community member to create posts', 403, true);
    }
    const post = await prisma.post.create({
        data: {
            title,
            content,
            imageUrl,
            communityId: id,
            authorId: userId
        },
        include: {
            author: {
                select: { id: true, name: true, avatar: true }
            },
            comments: {
                take: 3,
                orderBy: { createdAt: 'desc' },
                include: {
                    author: {
                        select: { id: true, name: true }
                    }
                }
            }
        }
    });
    const response = {
        success: true,
        data: post,
        message: 'Post created successfully',
        timestamp: new Date().toISOString()
    };
    res.status(201).json(response);
}));
// Get community posts
router.get('/:id/posts', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page.toString()) - 1) * parseInt(limit.toString());
    const [posts, total] = await Promise.all([
        prisma.post.findMany({
            where: { communityId: id },
            skip,
            take: parseInt(limit.toString()),
            orderBy: { createdAt: 'desc' },
            include: {
                author: {
                    select: { id: true, name: true, avatar: true }
                },
                comments: {
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        author: {
                            select: { id: true, name: true }
                        }
                    }
                },
                reports: {
                    where: { status: 'pending' }
                }
            }
        }),
        prisma.post.count({ where: { communityId: id } })
    ]);
    const totalPages = Math.ceil(total / parseInt(limit.toString()));
    const response = {
        data: posts,
        pagination: {
            page: parseInt(page.toString()),
            limit: parseInt(limit.toString()),
            total,
            totalPages
        },
        timestamp: new Date().toISOString()
    };
    res.json(response);
}));
// Pin/unpin community post
router.put('/:id/posts/:postId/pin', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id, postId } = req.params;
    const userId = req.user?.id;
    const { isPinned } = req.body;
    if (!userId) {
        throw (0, errorHandler_1.createError)('User not authenticated', 401, true);
    }
    // Check if user is admin/moderator
    const membership = await prisma.communityMembership.findUnique({
        where: {
            userId_communityId: {
                userId,
                communityId: id
            }
        }
    });
    if (!membership || (membership.role !== 'admin' && membership.role !== 'moderator')) {
        throw (0, errorHandler_1.createError)('Only admins and moderators can pin posts', 403, true);
    }
    const post = await prisma.post.update({
        where: { id: postId },
        data: { isPinned: isPinned === true },
        include: {
            author: {
                select: { id: true, name: true, avatar: true }
            }
        }
    });
    const response = {
        success: true,
        data: post,
        message: `Post ${isPinned ? 'pinned' : 'unpinned'} successfully`,
        timestamp: new Date().toISOString()
    };
    res.json(response);
}));
// Report community content
router.post('/:id/reports', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const { type, reason, description, targetId } = req.body;
    if (!userId) {
        throw (0, errorHandler_1.createError)('User not authenticated', 401, true);
    }
    // Check if user is member of community
    const membership = await prisma.communityMembership.findUnique({
        where: {
            userId_communityId: {
                userId,
                communityId: id
            }
        }
    });
    if (!membership) {
        throw (0, errorHandler_1.createError)('Must be a community member to report content', 403, true);
    }
    const report = await prisma.report.create({
        data: {
            type,
            reason,
            description,
            targetId,
            reporterId: userId
        }
    });
    const response = {
        success: true,
        data: report,
        message: 'Report submitted successfully',
        timestamp: new Date().toISOString()
    };
    res.status(201).json(response);
}));
exports.default = router;
//# sourceMappingURL=community.js.map