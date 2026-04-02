"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const client_1 = require("@prisma/client");
const errorHandler_1 = require("@/middleware/errorHandler");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Configure multer for file uploads
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadType = req.body.type || 'unknown';
        const uploadDir = path_1.default.join('uploads', uploadType);
        // Create directory if it doesn't exist
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path_1.default.extname(file.originalname);
        const filename = `${path_1.default.basename(file.originalname, extension)}-${uniqueSuffix}${extension}`;
        cb(null, filename);
    }
});
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
        files: 1
    },
    fileFilter: (req, file, cb) => {
        const allowedMimes = (process.env.ALLOWED_MIME_TYPES || 'image/jpeg,image/png,image/webp').split(',');
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'), false);
        }
    }
});
/**
 * Upload a single file
 */
router.post('/single', upload.single('file'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.file) {
        throw (0, errorHandler_1.createError)('No file provided', 400, true);
    }
    const userId = req.user?.id;
    const type = req.body.type || 'unknown';
    const projectId = req.body.projectId;
    if (!userId) {
        throw (0, errorHandler_1.createError)('User not authenticated', 401, true);
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
    const result = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: fileUrl
    };
    const response = {
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
}));
/**
 * Upload multiple files
 */
router.post('/multiple', upload.array('files', 5), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
        throw (0, errorHandler_1.createError)('No files provided', 400, true);
    }
    const userId = req.user?.id;
    const type = req.body.type || 'unknown';
    const projectId = req.body.projectId;
    if (!userId) {
        throw (0, errorHandler_1.createError)('User not authenticated', 401, true);
    }
    const files = req.files;
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
    const response = {
        success: true,
        data: {
            files: uploadResults,
            count: uploadResults.length
        },
        message: `${uploadResults.length} files uploaded successfully`,
        timestamp: new Date().toISOString()
    };
    res.status(201).json(response);
}));
/**
 * Get uploaded file by ID
 */
router.get('/:id', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
        throw (0, errorHandler_1.createError)('User not authenticated', 401, true);
    }
    const uploadRecord = await prisma.upload.findFirst({
        where: { id, userId }
    });
    if (!uploadRecord) {
        throw (0, errorHandler_1.createError)('File not found', 404, true);
    }
    // Check if file exists on disk
    const filePath = uploadRecord.path;
    if (!fs_1.default.existsSync(filePath)) {
        throw (0, errorHandler_1.createError)('File not found on disk', 404, true);
    }
    // Send file for download
    res.download(filePath, uploadRecord.originalName);
}));
/**
 * Get user's uploaded files
 */
router.get('/user/list', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    const { type, limit = 20, page = 1 } = req.query;
    if (!userId) {
        throw (0, errorHandler_1.createError)('User not authenticated', 401, true);
    }
    const skip = (parseInt(page.toString()) - 1) * parseInt(limit.toString());
    const where = { userId };
    if (type)
        where.type = type;
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
    const response = {
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
router.delete('/:id', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
        throw (0, errorHandler_1.createError)('User not authenticated', 401, true);
    }
    const uploadRecord = await prisma.upload.findFirst({
        where: { id, userId }
    });
    if (!uploadRecord) {
        throw (0, errorHandler_1.createError)('File not found', 404, true);
    }
    // Delete file from disk
    try {
        if (fs_1.default.existsSync(uploadRecord.path)) {
            fs_1.default.unlinkSync(uploadRecord.path);
        }
    }
    catch (error) {
        console.error('Error deleting file from disk:', error);
    }
    // Delete record from database
    await prisma.upload.delete({
        where: { id }
    });
    const response = {
        success: true,
        message: 'File deleted successfully',
        timestamp: new Date().toISOString()
    };
    res.json(response);
}));
/**
 * Get file URL by ID
 */
router.get('/:id/url', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
        throw (0, errorHandler_1.createError)('User not authenticated', 401, true);
    }
    const uploadRecord = await prisma.upload.findFirst({
        where: { id, userId }
    });
    if (!uploadRecord) {
        throw (0, errorHandler_1.createError)('File not found', 404, true);
    }
    const fileUrl = `/uploads/${uploadRecord.type}/${uploadRecord.filename}`;
    const response = {
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
router.get('/user/stats', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        throw (0, errorHandler_1.createError)('User not authenticated', 401, true);
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
    const response = {
        success: true,
        data: stats,
        message: 'Upload statistics retrieved successfully',
        timestamp: new Date().toISOString()
    };
    res.json(response);
}));
exports.default = router;
//# sourceMappingURL=upload.js.map