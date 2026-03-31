import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, createError } from '@/middleware/errorHandler';
import { AuthRequest, ApiResponse, PaginatedResponse } from '@/types';

const router = Router();
const prisma = new PrismaClient();

// Get all plants with filtering and pagination
router.get('/', asyncHandler(async (req: AuthRequest, res) => {
  const {
    page = 1,
    limit = 20,
    category,
    light,
    water,
    difficulty,
    search
  } = req.query;

  const skip = (parseInt(page.toString()) - 1) * parseInt(limit.toString());

  const where: any = {};

  if (category) where.category = category;
  if (light) where.light = light;
  if (water) where.water = water;
  if (difficulty) where.difficulty = parseInt(difficulty.toString());
  if (search) {
    where.OR = [
      { name: { contains: search.toString(), mode: 'insensitive' } },
      { scientificName: { contains: search.toString(), mode: 'insensitive' } },
      { commonNames: { has: search.toString() } },
      { description: { contains: search.toString(), mode: 'insensitive' } }
    ];
  }

  const [plants, total] = await Promise.all([
    prisma.plant.findMany({
      where,
      skip,
      take: parseInt(limit.toString()),
      orderBy: { name: 'asc' }
    }),
    prisma.plant.count({ where })
  ]);

  const totalPages = Math.ceil(total / parseInt(limit.toString()));

  const response: PaginatedResponse = {
    data: plants,
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

// Get plant by ID
router.get('/:id', asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;

  const plant = await prisma.plant.findUnique({
    where: { id },
    include: {
      knowledge: {
        orderBy: { createdAt: 'desc' }
      },
      problems: {
        orderBy: { createdAt: 'desc' }
      },
      seasons: {
        orderBy: { season: 'asc' }
      },
      projectPlants: {
        include: {
          project: {
            select: {
              id: true,
              name: true,
              status: true
            }
          }
        }
      }
    }
  });

  if (!plant) {
    throw createError('Plant not found', 404, true);
  }

  const response: ApiResponse = {
    success: true,
    data: plant,
    message: 'Plant retrieved successfully',
    timestamp: new Date().toISOString()
  };

  res.json(response);
}));

// Get plant categories
router.get('/categories/list', asyncHandler(async (req: AuthRequest, res) => {
  const categories = await prisma.plant.findMany({
    select: { category: true },
    distinct: ['category']
  });

  const categoryList = categories.map(c => c.category);

  const response: ApiResponse = {
    success: true,
    data: categoryList,
    message: 'Plant categories retrieved successfully',
    timestamp: new Date().toISOString()
  };

  res.json(response);
}));

// Get plants by category
router.get('/category/:category', asyncHandler(async (req: AuthRequest, res) => {
  const { category } = req.params;
  const { limit = 20 } = req.query;

  const plants = await prisma.plant.findMany({
    where: { category },
    take: parseInt(limit.toString()),
    orderBy: { name: 'asc' }
  });

  const response: ApiResponse = {
    success: true,
    data: plants,
    message: 'Plants by category retrieved successfully',
    timestamp: new Date().toISOString()
  };

  res.json(response);
}));

// Search plants
router.get('/search', asyncHandler(async (req: AuthRequest, res) => {
  const { query, category, limit = 10 } = req.query;

  if (!query) {
    throw createError('Search query is required', 400, true);
  }

  const where: any = {
    OR: [
      { name: { contains: query.toString(), mode: 'insensitive' } },
      { scientificName: { contains: query.toString(), mode: 'insensitive' } },
      { commonNames: { has: query.toString() } },
      { description: { contains: query.toString(), mode: 'insensitive' } }
    ]
  };

  if (category) where.category = category;

  const plants = await prisma.plant.findMany({
    where,
    take: parseInt(limit.toString()),
    orderBy: { name: 'asc' }
  });

  const response: ApiResponse = {
    success: true,
    data: plants,
    message: 'Plant search completed successfully',
    timestamp: new Date().toISOString()
  };

  res.json(response);
}));

// Get plant care information
router.get('/:id/care', asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;

  const plant = await prisma.plant.findUnique({
    where: { id },
    include: {
      knowledge: {
        where: { category: 'care' },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!plant) {
    throw createError('Plant not found', 404, true);
  }

  const careInfo = {
    plant,
    basicCare: {
      water: plant.water,
      light: plant.light,
      temperature: plant.temperature,
      humidity: plant.humidity,
      soil: plant.soil
    },
    careTips: plant.careTips,
    careGuides: plant.knowledge
  };

  const response: ApiResponse = {
    success: true,
    data: careInfo,
    message: 'Plant care information retrieved successfully',
    timestamp: new Date().toISOString()
  };

  res.json(response);
}));

// Get plant problems and solutions
router.get('/:id/problems', asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;

  const problems = await prisma.plantProblem.findMany({
    where: { plantId: id },
    orderBy: { createdAt: 'desc' }
  });

  const response: ApiResponse = {
    success: true,
    data: problems,
    message: 'Plant problems retrieved successfully',
    timestamp: new Date().toISOString()
  };

  res.json(response);
}));

// Get plant seasonal care
router.get('/:id/seasonal-care', asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;

  const seasonalCare = await prisma.plantSeason.findMany({
    where: { plantId: id },
    orderBy: { season: 'asc' }
  });

  const response: ApiResponse = {
    success: true,
    data: seasonalCare,
    message: 'Seasonal care information retrieved successfully',
    timestamp: new Date().toISOString()
  };

  res.json(response);
}));

// Get similar plants
router.get('/:id/similar', asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { limit = 5 } = req.query;

  const plant = await prisma.plant.findUnique({
    where: { id }
  });

  if (!plant) {
    throw createError('Plant not found', 404, true);
  }

  const similarPlants = await prisma.plant.findMany({
    where: {
      AND: [
        { id: { not: id } },
        { category: plant.category },
        { difficulty: { lte: plant.difficulty + 1 } },
        { difficulty: { gte: plant.difficulty - 1 } }
      ]
    },
    take: parseInt(limit.toString()),
    orderBy: { name: 'asc' }
  });

  const response: ApiResponse = {
    success: true,
    data: similarPlants,
    message: 'Similar plants retrieved successfully',
    timestamp: new Date().toISOString()
  };

  res.json(response);
}));

// Get popular plants
router.get('/popular/list', asyncHandler(async (req: AuthRequest, res) => {
  const { limit = 10 } = req.query;

  const popularPlants = await prisma.plant.findMany({
    include: {
      projectPlants: {
        select: { id: true }
      }
    },
    take: parseInt(limit.toString()),
    orderBy: {
      projectPlants: {
        _count: 'desc'
      }
    }
  });

  const response: ApiResponse = {
    success: true,
    data: popularPlants,
    message: 'Popular plants retrieved successfully',
    timestamp: new Date().toISOString()
  };

  res.json(response);
}));

export default router;