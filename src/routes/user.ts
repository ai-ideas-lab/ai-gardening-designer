import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, createError } from '@/middleware/errorHandler';
import { AuthRequest, ApiResponse } from '@/types';

const router = Router();
const prisma = new PrismaClient();

// Get current user profile
router.get('/profile', asyncHandler(async (req: AuthRequest, res) => {
  const userId = req.user?.id;

  if (!userId) {
    throw createError('User not authenticated', 401, true);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      name: true,
      avatar: true,
      location: true,
      balconyType: true,
      balconySize: true,
      balconyDirection: true,
      preferences: true,
      createdAt: true,
      updatedAt: true
    }
  });

  if (!user) {
    throw createError('User not found', 404, true);
  }

  const response: ApiResponse = {
    success: true,
    data: user,
    message: 'User profile retrieved successfully',
    timestamp: new Date().toISOString()
  };

  res.json(response);
}));

// Get user statistics
router.get('/stats', asyncHandler(async (req: AuthRequest, res) => {
  const userId = req.user?.id;

  if (!userId) {
    throw createError('User not authenticated', 401, true);
  }

  const projectsCount = await prisma.project.count({ where: { userId } });
  const totalPlants = await prisma.projectPlant.count({
    where: {
      project: { userId }
    }
  });
  const activitiesCount = await prisma.activity.count({ where: { userId } });
  const completedReminders = await prisma.reminder.count({
    where: { userId, completed: true }
  });

  const stats = {
    projects: projectsCount,
    totalPlants,
    activities: activitiesCount,
    completedReminders,
    joinedSince: await prisma.user.findUnique({ where: { id: userId } }).then(u => u?.createdAt)
  };

  const response: ApiResponse = {
    success: true,
    data: stats,
    message: 'User statistics retrieved successfully',
    timestamp: new Date().toISOString()
  };

  res.json(response);
}));

// Update user preferences
router.put('/preferences', asyncHandler(async (req: AuthRequest, res) => {
  const userId = req.user?.id;
  const { preferences } = req.body;

  if (!userId) {
    throw createError('User not authenticated', 401, true);
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { preferences }
  });

  const response: ApiResponse = {
    success: true,
    data: updatedUser,
    message: 'User preferences updated successfully',
    timestamp: new Date().toISOString()
  };

  res.json(response);
}));

export default router;