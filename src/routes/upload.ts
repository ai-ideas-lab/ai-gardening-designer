import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, createError } from '@/middleware/errorHandler';
import { AuthRequest, UploadRequest, FileUploadResult, ApiResponse } from '@/types';

const router = Router();
const prisma = new PrismaClient();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadType = req.body.type || 'unknown';
    const uploadDir = path.join('uploads', uploadType);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const filename = `${path.basename(file.originalname, extension)}-${uniqueSuffix}${extension}`;
    cb(null, filename);
  }
});

const upload = multer({
  storage,
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
 * Upload a single file
 */
router.post('/single', 
  upload.single('file'),
  asyncHandler(async (req: AuthRequest, res) => {
    if (!req.file) {
      throw createError('No file provided', 400, true);
    }

    const userId = req.user?.id;
    const type = req.body.type || 'unknown';
    const projectId = req.body.projectId;

    if (!userId) {
      throw createError('User not authenticated', 401, true);
    }

    // Create database record
    const uploadRecord = await prisma.upload.create({
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path,
        mimetype: req.file.mimetype,
        size: req.file.size,
        type,
        userId,
        projectId: projectId || null
      }
    });

    const fileUrl = `/uploads/${type}/${req.file.filename}`;

    const result: FileUploadResult = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      url: fileUrl
    };

    const response: ApiResponse = {
      success: true,
      data: {
        ...result,
        uploadId: uploadRecord.id,
        uploadedAt: uploadRecord.createdAt
      },
      message: 'File uploaded successfully',
      timestamp: new Date().toISOString()
    };

    res.status(201).json(response);
  })
);

/**
 * Upload multiple files
 */
router.post('/multiple', 
  upload.array('files', 5),
  asyncHandler(async (req: AuthRequest, res) => {
    if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
      throw createError('No files provided', 400, true);
    }

    const userId = req.user?.id;
    const type = req.body.type || 'unknown';
    const projectId = req.body.projectId;

    if (!userId) {
      throw createError('User not authenticated', 401, true);
    }

    const files = req.files as Express.Multer.File[];
    const uploadResults = [];

    for (const file of files) {
      // Create database record
      const uploadRecord = await prisma.upload.create({
        data: {
          filename: file.filename,
          originalName: file.originalname,
          path: file.path,
          mimetype: file.mimetype,
          size: file.size,
          type,
          userId,
          projectId: projectId || null
        }
      });

      const fileUrl = `/uploads/${type}/${file.filename}`;

      uploadResults.push({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype,
        url: fileUrl,
        uploadId: uploadRecord.id,
        uploadedAt: uploadRecord.createdAt
      });
    }

    const response: ApiResponse = {
      success: true,
      data: {
        files: uploadResults,
        count: uploadResults.length
      },
      message: `${uploadResults.length} files uploaded successfully`,
      timestamp: new Date().toISOString()
    };

    res.status(201).json(response);
  })
);

/**
 * Get uploaded file by ID
 */
router.get('/:id', asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    throw createError('User not authenticated', 401, true);
  }

  const uploadRecord = await prisma.upload.findFirst({
    where: { id, userId }
  });

  if (!uploadRecord) {
    throw createError('File not found', 404, true);
  }

  // Check if file exists on disk
  const filePath = uploadRecord.path;
  if (!fs.existsSync(filePath)) {
    throw createError('File not found on disk', 404, true);
  }

  // Send file for download
  res.download(filePath, uploadRecord.originalName);
}));

/**
 * Get user's uploaded files
 */
router.get('/user/list', asyncHandler(async (req: AuthRequest, res) => {
  const userId = req.user?.id;
  const { type, limit = 20, page = 1 } = req.query;

  if (!userId) {
    throw createError('User not authenticated', 401, true);
  }

  const skip = (parseInt(page.toString()) - 1) * parseInt(limit.toString());

  const where: any = { userId };
  if (type) where.type = type;

  const [files, total] = await Promise.all([
    prisma.upload.findMany({
      where,
      skip,
      take: parseInt(limit.toString()),
      orderBy: { createdAt: 'desc' }
    }),
    prisma.upload.count({ where })
  ]);

  const totalPages = Math.ceil(total / parseInt(limit.toString()));

  const response: PaginatedResponse = {
    data: files,
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

/**
 * Delete uploaded file
 */
router.delete('/:id', asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    throw createError('User not authenticated', 401, true);
  }

  const uploadRecord = await prisma.upload.findFirst({
    where: { id, userId }
  });

  if (!uploadRecord) {
    throw createError('File not found', 404, true);
  }

  // Delete file from disk
  try {
    if (fs.existsSync(uploadRecord.path)) {
      fs.unlinkSync(uploadRecord.path);
    }
  } catch (error) {
    console.error('Error deleting file from disk:', error);
  }

  // Delete record from database
  await prisma.upload.delete({
    where: { id }
  });

  const response: ApiResponse = {
    success: true,
    message: 'File deleted successfully',
    timestamp: new Date().toISOString()
  };

  res.json(response);
}));

/**
 * Get file URL by ID
 */
router.get('/:id/url', asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    throw createError('User not authenticated', 401, true);
  }

  const uploadRecord = await prisma.upload.findFirst({
    where: { id, userId }
  });

  if (!uploadRecord) {
    throw createError('File not found', 404, true);
  }

  const fileUrl = `/uploads/${uploadRecord.type}/${uploadRecord.filename}`;

  const response: ApiResponse = {
    success: true,
    data: {
      id: uploadRecord.id,
      url: fileUrl,
      filename: uploadRecord.filename,
      originalName: uploadRecord.originalName,
      size: uploadRecord.size,
      mimetype: uploadRecord.mimetype,
      type: uploadRecord.type,
      uploadedAt: uploadRecord.createdAt
    },
    message: 'File URL generated successfully',
    timestamp: new Date().toISOString()
  };

  res.json(response);
}));

/**
 * Get upload statistics
 */
router.get('/user/stats', asyncHandler(async (req: AuthRequest, res) => {
  const userId = req.user?.id;

  if (!userId) {
    throw createError('User not authenticated', 401, true);
  }

  const [totalCount, totalSize, typeStats] = await Promise.all([
    prisma.upload.count({ where: { userId } }),
    prisma.upload.aggregate({
      where: { userId },
      _sum: { size: true }
    }),
    prisma.upload.groupBy({
      by: ['type'],
      where: { userId },
      _count: { id: true },
      _sum: { size: true }
    })
  ]);

  const stats = {
    totalFiles: totalCount,
    totalSize: totalSize._sum.size || 0,
    averageFileSize: totalCount > 0 ? (totalSize._sum.size || 0) / totalCount : 0,
    fileTypeStats: typeStats.map(stat => ({
      type: stat.type,
      count: stat._count.id,
      totalSize: stat._sum.size || 0
    }))
  };

  const response: ApiResponse = {
    success: true,
    data: stats,
    message: 'Upload statistics retrieved successfully',
    timestamp: new Date().toISOString()
  };

  res.json(response);
}));

export default router;