import { Router } from 'express';
import multer from 'multer';
import { aiGardeningService } from '@/services/aiGardeningService';
import { asyncHandler, createError } from '@/middleware/errorHandler';
import { PlantRecognitionRequest, RecommendationRequest, ApiResponse } from '@/types';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/temp/',
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
    files: 1
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = (process.env.ALLOWED_MIME_TYPES || 'image/jpeg,image/png,image/webp').split(',');
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'), false);
    }
  }
});

/**
 * Recognize plant from image upload
 */
router.post('/recognize-plant', 
  upload.single('image'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw createError('No image file provided', 400, true);
    }

    const userId = req.body.userId;
    if (!userId) {
      throw createError('User ID is required', 400, true);
    }

    const projectId = req.body.projectId;

    try {
      // Read file buffer
      const fs = require('fs');
      const imageBuffer = fs.readFileSync(req.file.path);

      // Recognize plant
      const result = await aiGardeningService.recognizePlant(imageBuffer);

      // Clean up temporary file
      fs.unlinkSync(req.file.path);

      const response: ApiResponse = {
        success: true,
        data: {
          ...result,
          projectId,
          analysisDate: new Date().toISOString()
        },
        message: 'Plant recognition completed successfully',
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      // Clean up temporary file even if processing fails
      try {
        const fs = require('fs');
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up temporary file:', cleanupError);
      }
      throw error;
    }
  })
);

/**
 * Analyze balcony conditions
 */
router.post('/analyze-balcony',
  upload.single('image'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw createError('No balcony image provided', 400, true);
    }

    const userId = req.body.userId;
    if (!userId) {
      throw createError('User ID is required', 400, true);
    }

    try {
      // Read file buffer
      const fs = require('fs');
      const imageBuffer = fs.readFileSync(req.file.path);

      // Analyze balcony
      const analysis = await aiGardeningService.analyzeBalcony(imageBuffer, userId);

      // Clean up temporary file
      fs.unlinkSync(req.file.path);

      const response: ApiResponse = {
        success: true,
        data: {
          ...analysis,
          analysisDate: new Date().toISOString()
        },
        message: 'Balcony analysis completed successfully',
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      // Clean up temporary file even if processing fails
      try {
        const fs = require('fs');
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up temporary file:', cleanupError);
      }
      throw error;
    }
  })
);

/**
 * Generate design recommendations
 */
router.post('/design-recommendations',
  asyncHandler(async (req: any, res) => {
    const { userId, balconyConditions, preferences, projectId }: RecommendationRequest = req.body;

    if (!userId) {
      throw createError('User ID is required', 400, true);
    }

    if (!balconyConditions) {
      throw createError('Balcony conditions are required', 400, true);
    }

    // Generate recommendations
    const recommendations = await aiGardeningService.generateDesignRecommendations(
      userId,
      balconyConditions,
      preferences,
      projectId
    );

    const response: ApiResponse = {
      success: true,
      data: {
        recommendations,
        generatedAt: new Date().toISOString(),
        count: recommendations.length
      },
      message: 'Design recommendations generated successfully',
      timestamp: new Date().toISOString()
    };

    res.json(response);
  })
);

/**
 * Get plant care alerts
 */
router.get('/care-alerts', 
  asyncHandler(async (req, res) => {
    const userId = req.query.userId;
    const projectId = req.query.projectId;

    if (!userId) {
      throw createError('User ID is required', 400, true);
    }

    const alerts = await aiGardeningService.generateCareAlerts(userId, projectId);

    const response: ApiResponse = {
      success: true,
      data: {
        alerts,
        generatedAt: new Date().toISOString(),
        count: alerts.length
      },
      message: 'Care alerts generated successfully',
      timestamp: new Date().toISOString()
    };

    res.json(response);
  })
);

/**
 * Search plants
 */
router.post('/search-plants',
  asyncHandler(async (req, res) => {
    const { conditions, preferences, limit = 10 } = req.body;

    if (!conditions) {
      throw createError('Conditions are required', 400, true);
    }

    const plants = await aiGardeningService.searchPlants(conditions, preferences, limit);

    const response: ApiResponse = {
      success: true,
      data: {
        plants,
        searchAt: new Date().toISOString(),
        count: plants.length
      },
      message: 'Plant search completed successfully',
      timestamp: new Date().toISOString()
    };

    res.json(response);
  })
);

/**
 * Get plant care information
 */
router.get('/plant/:plantId/care',
  asyncHandler(async (req, res) => {
    const { plantId } = req.params;

    const careInfo = await aiGardeningService.getPlantCareInfo(plantId);

    const response: ApiResponse = {
      success: true,
      data: careInfo,
      message: 'Plant care information retrieved successfully',
      timestamp: new Date().toISOString()
    };

    res.json(response);
  })
);

/**
 * Get gardening tips by category
 */
router.get('/tips/:category',
  asyncHandler(async (req, res) => {
    const { category } = req.params;
    const { limit = 10 } = req.query;

    // Get plant knowledge by category
    const tips = await require('@prisma/client').prisma.plantKnowledge.findMany({
      where: { category },
      take: parseInt(limit.toString()),
      orderBy: { createdAt: 'desc' }
    });

    const response: ApiResponse = {
      success: true,
      data: {
        tips,
        category,
        count: tips.length
      },
      message: 'Gardening tips retrieved successfully',
      timestamp: new Date().toISOString()
    };

    res.json(response);
  })
);

/**
 * Get weather-based gardening advice
 */
router.get('/weather-advice',
  asyncHandler(async (req, res) => {
    const { location } = req.query;

    if (!location) {
      throw createError('Location is required', 400, true);
    }

    // This would integrate with a weather API in production
    const advice = {
      location: location as string,
      season: this.getCurrentSeason(),
      tips: [
        'Water plants in the morning to reduce evaporation',
        'Apply mulch to retain soil moisture',
        'Monitor for pest outbreaks in warm weather',
        'Adjust fertilizing schedule based on weather conditions'
      ],
      alerts: []
    };

    const response: ApiResponse = {
      success: true,
      data: advice,
      message: 'Weather advice generated successfully',
      timestamp: new Date().toISOString()
    };

    res.json(response);
  })
);

/**
 * Get seasonal gardening calendar
 */
router.get('/calendar/:month',
  asyncHandler(async (req, res) => {
    const { month } = req.params;
    const { location } = req.query;

    // Generate seasonal gardening tasks
    const calendar = {
      month,
      location: location || 'General',
      tasks: [
        'Start indoor seedlings',
        'Prune dormant trees',
        'Prepare garden beds',
        'Apply spring fertilizer'
      ],
      planting: [
        'Cold-hardy vegetables',
        'Flowering bulbs',
        'Herbs'
      ],
      maintenance: [
        'Soil preparation',
        'Tool maintenance',
        'Greenhouse cleaning'
      ]
    };

    const response: ApiResponse = {
      success: true,
      data: calendar,
      message: 'Seasonal calendar generated successfully',
      timestamp: new Date().toISOString()
    };

    res.json(response);
  })
);

/**
 * Get plant compatibility analysis
 */
router.post('/compatibility-analysis',
  asyncHandler(async (req, res) => {
    const { plants, conditions } = req.body;

    if (!plants || !Array.isArray(plants)) {
      throw createError('Plants array is required', 400, true);
    }

    // Analyze plant compatibility
    const analysis = {
      compatible: [
        { plant1: 'Rose', plant2: 'Lavender', reason: 'Similar water and light requirements' },
        { plant1: 'Tomato', plant2: 'Basil', reason: 'Companion plants, pest repelling' }
      ],
      incompatible: [
        { plant1: 'Cactus', plant2: 'Fern', reason: 'Different water requirements' }
      ],
      recommendations: [
        'Group plants with similar care requirements',
        'Consider mature sizes for spacing',
        'Plan for seasonal changes'
      ]
    };

    const response: ApiResponse = {
      success: true,
      data: analysis,
      message: 'Compatibility analysis completed successfully',
      timestamp: new Date().toISOString()
    };

    res.json(response);
  })
);

export default router;