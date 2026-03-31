import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, createError } from '@/middleware/errorHandler';
import { AuthRequest, CreateProjectRequest, ApiResponse } from '@/types';

const router = Router();
const prisma = new PrismaClient();

// Get all projects for authenticated user
router.get('/', asyncHandler(async (req: AuthRequest, res) => {
  const userId = req.user?.id;
  
  if (!userId) {
    throw createError('User not authenticated', 401, true);
  }

  const projects = await prisma.project.findMany({
    where: { userId },
    include: {
      projectPlants: {
        include: { plant: true }
      },
      activities: {
        take: 10,
        orderBy: { createdAt: 'desc' }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const response: ApiResponse = {
    success: true,
    data: {
      projects,
      count: projects.length
    },
    message: 'Projects retrieved successfully',
    timestamp: new Date().toISOString()
  };

  res.json(response);
}));

// Get specific project by ID
router.get('/:id', asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    throw createError('User not authenticated', 401, true);
  }

  const project = await prisma.project.findFirst({
    where: { id, userId },
    include: {
      projectPlants: {
        include: { plant: true }
      },
      activities: {
        take: 20,
        orderBy: { createdAt: 'desc' }
      },
      reports: {
        take: 10,
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!project) {
    throw createError('Project not found', 404, true);
  }

  const response: ApiResponse = {
    success: true,
    data: project,
    message: 'Project retrieved successfully',
    timestamp: new Date().toISOString()
  };

  res.json(response);
}));

// Create new project
router.post('/', asyncHandler(async (req: AuthRequest, res) => {
  const userId = req.user?.id;
  const { name, description, balconyJson, designJson, location, area, budget }: CreateProjectRequest = req.body;

  if (!userId) {
    throw createError('User not authenticated', 401, true);
  }

  if (!name || !balconyJson) {
    throw createError('Project name and balcony configuration are required', 400, true);
  }

  const project = await prisma.project.create({
    data: {
      name,
      description,
      status: 'planning',
      balconyJson,
      designJson: designJson || {},
      location,
      area: area ? parseFloat(area.toString()) : null,
      budget: budget ? parseFloat(budget.toString()) : null,
      userId
    },
    include: {
      projectPlants: {
        include: { plant: true }
      }
    }
  });

  // Log activity
  await prisma.activity.create({
    data: {
      type: 'project_created',
      title: 'Project created',
      description: `Created new project: ${name}`,
      projectId: project.id,
      userId
    }
  });

  const response: ApiResponse = {
    success: true,
    data: project,
    message: 'Project created successfully',
    timestamp: new Date().toISOString()
  };

  res.status(201).json(response);
}));

// Update project
router.put('/:id', asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const { name, description, balconyJson, designJson, status, location, area, budget, startDate, endDate } = req.body;

  if (!userId) {
    throw createError('User not authenticated', 401, true);
  }

  // Verify project exists and user owns it
  const existingProject = await prisma.project.findFirst({
    where: { id, userId }
  });

  if (!existingProject) {
    throw createError('Project not found', 404, true);
  }

  const updatedProject = await prisma.project.update({
    where: { id },
    data: {
      name,
      description,
      balconyJson,
      designJson,
      status: status || existingProject.status,
      location,
      area: area ? parseFloat(area.toString()) : existingProject.area,
      budget: budget ? parseFloat(budget.toString()) : existingProject.budget,
      startDate: startDate ? new Date(startDate) : existingProject.startDate,
      endDate: endDate ? new Date(endDate) : existingProject.endDate,
      updatedAt: new Date()
    },
    include: {
      projectPlants: {
        include: { plant: true }
      }
    }
  });

  // Log activity
  await prisma.activity.create({
    data: {
      type: 'project_updated',
      title: 'Project updated',
      description: `Updated project: ${name}`,
      projectId: updatedProject.id,
      userId
    }
  });

  const response: ApiResponse = {
    success: true,
    data: updatedProject,
    message: 'Project updated successfully',
    timestamp: new Date().toISOString()
  };

  res.json(response);
}));

// Delete project
router.delete('/:id', asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    throw createError('User not authenticated', 401, true);
  }

  // Verify project exists and user owns it
  const existingProject = await prisma.project.findFirst({
    where: { id, userId }
  });

  if (!existingProject) {
    throw createError('Project not found', 404, true);
  }

  await prisma.project.delete({
    where: { id }
  });

  // Log activity
  await prisma.activity.create({
    data: {
      type: 'project_deleted',
      title: 'Project deleted',
      description: `Deleted project: ${existingProject.name}`,
      projectId: existingProject.id,
      userId
    }
  });

  const response: ApiResponse = {
    success: true,
    message: 'Project deleted successfully',
    timestamp: new Date().toISOString()
  };

  res.json(response);
}));

// Add plant to project
router.post('/:id/plants', asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const { plantId, quantity = 1, position, notes } = req.body;

  if (!userId) {
    throw createError('User not authenticated', 401, true);
  }

  if (!plantId) {
    throw createError('Plant ID is required', 400, true);
  }

  // Verify project exists and user owns it
  const project = await prisma.project.findFirst({
    where: { id, userId }
  });

  if (!project) {
    throw createError('Project not found', 404, true);
  }

  // Verify plant exists
  const plant = await prisma.plant.findUnique({
    where: { id: plantId }
  });

  if (!plant) {
    throw createError('Plant not found', 404, true);
  }

  // Check if plant already exists in project
  const existingProjectPlant = await prisma.projectPlant.findUnique({
    where: {
      projectId_plantId: {
        projectId: id,
        plantId: plantId
      }
    }
  });

  let projectPlant;
  if (existingProjectPlant) {
    // Update existing project plant
    projectPlant = await prisma.projectPlant.update({
      where: { id: existingProjectPlant.id },
      data: {
        quantity: existingProjectPlant.quantity + quantity,
        position: position || existingProjectPlant.position,
        notes: notes || existingProjectPlant.notes
      }
    });
  } else {
    // Create new project plant
    projectPlant = await prisma.projectPlant.create({
      data: {
        projectId: id,
        plantId: plantId,
        quantity,
        position: position || {},
        notes
      },
      include: { plant: true }
    });
  }

  // Update project status
  await prisma.project.update({
    where: { id },
    data: { status: 'in-progress' }
  });

  // Log activity
  await prisma.activity.create({
    data: {
      type: 'plant_added',
      title: 'Plant added to project',
      description: `Added ${quantity} ${plant.name} to project ${project.name}`,
      projectId: id,
      plantId,
      userId
    }
  });

  const response: ApiResponse = {
    success: true,
    data: projectPlant,
    message: 'Plant added to project successfully',
    timestamp: new Date().toISOString()
  };

  res.status(201).json(response);
}));

// Remove plant from project
router.delete('/:id/plants/:plantId', asyncHandler(async (req: AuthRequest, res) => {
  const { id, plantId } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    throw createError('User not authenticated', 401, true);
  }

  // Verify project exists and user owns it
  const project = await prisma.project.findFirst({
    where: { id, userId }
  });

  if (!project) {
    throw createError('Project not found', 404, true);
  }

  // Remove project plant
  const deletedProjectPlant = await prisma.projectPlant.delete({
    where: {
      projectId_plantId: {
        projectId: id,
        plantId: plantId
      }
    }
  });

  if (!deletedProjectPlant) {
    throw createError('Plant not found in project', 404, true);
  }

  // Log activity
  await prisma.activity.create({
    data: {
      type: 'plant_removed',
      title: 'Plant removed from project',
      description: `Removed plant from project ${project.name}`,
      projectId: id,
      plantId,
      userId
    }
  });

  const response: ApiResponse = {
    success: true,
    message: 'Plant removed from project successfully',
    timestamp: new Date().toISOString()
  };

  res.json(response);
}));

// Update project plant
router.put('/:id/plants/:plantId', asyncHandler(async (req: AuthRequest, res) => {
  const { id, plantId } = req.params;
  const userId = req.user?.id;
  const { quantity, position, notes } = req.body;

  if (!userId) {
    throw createError('User not authenticated', 401, true);
  }

  // Verify project exists and user owns it
  const project = await prisma.project.findFirst({
    where: { id, userId }
  });

  if (!project) {
    throw createError('Project not found', 404, true);
  }

  const updatedProjectPlant = await prisma.projectPlant.update({
    where: {
      projectId_plantId: {
        projectId: id,
        plantId: plantId
      }
    },
    data: {
      quantity: quantity || undefined,
      position: position || undefined,
      notes: notes || undefined
    },
    include: { plant: true }
  });

  const response: ApiResponse = {
    success: true,
    data: updatedProjectPlant,
    message: 'Project plant updated successfully',
    timestamp: new Date().toISOString()
  };

  res.json(response);
}));

// Get project activities
router.get('/:id/activities', asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const { limit = 20 } = req.query;

  if (!userId) {
    throw createError('User not authenticated', 401, true);
  }

  // Verify project exists and user owns it
  const project = await prisma.project.findFirst({
    where: { id, userId }
  });

  if (!project) {
    throw createError('Project not found', 404, true);
  }

  const activities = await prisma.activity.findMany({
    where: { projectId: id },
    include: {
      user: {
        select: { id: true, name: true, email: true }
      }
    },
    take: parseInt(limit.toString()),
    orderBy: { createdAt: 'desc' }
  });

  const response: ApiResponse = {
    success: true,
    data: {
      activities,
      count: activities.length
    },
    message: 'Project activities retrieved successfully',
    timestamp: new Date().toISOString()
  };

  res.json(response);
}));

// Get project analytics
router.get('/:id/analytics', asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    throw createError('User not authenticated', 401, true);
  }

  // Verify project exists and user owns it
  const project = await prisma.project.findFirst({
    where: { id, userId }
  });

  if (!project) {
    throw createError('Project not found', 404, true);
  }

  // Get project statistics
  const projectPlants = await prisma.projectPlant.findMany({
    where: { projectId: id },
    include: { plant: true }
  });

  const plantCategories = projectPlants.reduce((acc, projectPlant) => {
    acc[projectPlant.plant.category] = (acc[projectPlant.plant.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalPlants = projectPlants.reduce((sum, projectPlant) => sum + projectPlant.quantity, 0);

  const analytics = {
    project: {
      id,
      name: project.name,
      status: project.status,
      area: project.area,
      budget: project.budget,
      startDate: project.startDate,
      endDate: project.endDate
    },
    plants: {
      total: totalPlants,
      unique: projectPlants.length,
      categories: plantCategories
    },
    activities: {
      total: await prisma.activity.count({ where: { projectId: id } }),
      recent: await prisma.activity.count({ 
        where: { 
          projectId: id,
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      })
    },
    care: {
      upcomingReminders: await prisma.reminder.count({
        where: {
          projectId: id,
          dueDate: { gte: new Date() },
          completed: false
        }
      })
    }
  };

  const response: ApiResponse = {
    success: true,
    data: analytics,
    message: 'Project analytics retrieved successfully',
    timestamp: new Date().toISOString()
  };

  res.json(response);
}));

export default router;