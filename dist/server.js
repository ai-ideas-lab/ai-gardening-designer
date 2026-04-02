"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
const node_cron_1 = __importDefault(require("node-cron"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        await prisma.$queryRaw `SELECT 1`;
        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            database: 'connected',
            environment: process.env.NODE_ENV
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            timestamp: new Date().toISOString(),
            database: 'disconnected',
            error: error.message
        });
    }
});
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.NODE_ENV === 'production'
        ? process.env.CORS_ORIGIN
        : [process.env.CORS_ORIGIN, process.env.CORS_ORIGIN_DEV],
    credentials: true
}));
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Basic user routes
app.get('/api/users/profile', async (req, res) => {
    try {
        // Mock user data for demo
        const user = {
            id: 'demo-user-id',
            email: 'demo@example.com',
            name: 'Demo User',
            preferences: {
                balconyType: 'small',
                balconySize: 10,
                balconyDirection: 'south'
            }
        };
        res.json({
            success: true,
            data: user,
            message: 'User profile retrieved successfully',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});
// Basic plant routes
app.get('/api/plants', async (req, res) => {
    try {
        // Get plants from database
        const plants = await prisma.plant.findMany();
        // Transform data for frontend
        const formattedPlants = plants.map(plant => ({
            id: plant.id,
            name: plant.name,
            scientificName: plant.scientificName,
            commonNames: plant.commonNames ? JSON.parse(plant.commonNames) : [],
            category: plant.category,
            light: plant.light,
            water: plant.water,
            temperature: plant.temperature ? JSON.parse(plant.temperature) : null,
            humidity: plant.humidity ? JSON.parse(plant.humidity) : null,
            soil: plant.soil,
            growthRate: plant.growthRate,
            matureSize: plant.matureSize ? JSON.parse(plant.matureSize) : null,
            difficulty: plant.difficulty,
            description: plant.description,
            careTips: plant.careTips ? JSON.parse(plant.careTips) : [],
            toxicity: plant.toxicity,
            benefits: plant.benefits ? JSON.parse(plant.benefits) : [],
            imageUrl: plant.imageUrl,
            createdAt: plant.createdAt?.toISOString(),
            updatedAt: plant.updatedAt?.toISOString()
        }));
        res.json({
            success: true,
            data: formattedPlants,
            message: 'Plants retrieved successfully',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Error fetching plants:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});
// Get single plant by ID
app.get('/api/plants/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const plant = await prisma.plant.findUnique({
            where: { id }
        });
        if (!plant) {
            return res.status(404).json({
                success: false,
                error: 'Plant not found',
                timestamp: new Date().toISOString()
            });
        }
        // Transform data for frontend
        const formattedPlant = {
            id: plant.id,
            name: plant.name,
            scientificName: plant.scientificName,
            commonNames: plant.commonNames ? JSON.parse(plant.commonNames) : [],
            category: plant.category,
            light: plant.light,
            water: plant.water,
            temperature: plant.temperature ? JSON.parse(plant.temperature) : null,
            humidity: plant.humidity ? JSON.parse(plant.humidity) : null,
            soil: plant.soil,
            growthRate: plant.growthRate,
            matureSize: plant.matureSize ? JSON.parse(plant.matureSize) : null,
            difficulty: plant.difficulty,
            description: plant.description,
            careTips: plant.careTips ? JSON.parse(plant.careTips) : [],
            toxicity: plant.toxicity,
            benefits: plant.benefits ? JSON.parse(plant.benefits) : [],
            imageUrl: plant.imageUrl,
            createdAt: plant.createdAt?.toISOString(),
            updatedAt: plant.updatedAt?.toISOString()
        };
        res.json({
            success: true,
            data: formattedPlant,
            message: 'Plant retrieved successfully',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Error fetching plant:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});
// Basic project routes
app.get('/api/projects', async (req, res) => {
    try {
        const projects = await prisma.project.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true
                    }
                },
                projectPlants: {
                    include: {
                        plant: true
                    }
                },
                _count: {
                    select: {
                        projectPlants: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        // Transform data for frontend
        const formattedProjects = projects.map(project => ({
            id: project.id,
            name: project.name,
            description: project.description,
            status: project.status,
            balconyJson: project.balconyJson ? JSON.parse(project.balconyJson) : null,
            designJson: project.designJson ? JSON.parse(project.designJson) : null,
            location: project.location,
            area: project.area,
            budget: project.budget,
            startDate: project.startDate,
            endDate: project.endDate,
            userId: project.userId,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
            user: project.user,
            plantCount: project._count.projectPlants,
            projectPlants: project.projectPlants
        }));
        res.json({
            success: true,
            data: formattedProjects,
            message: 'Projects retrieved successfully',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});
app.post('/api/projects', async (req, res) => {
    try {
        const { name, description, balconyJson, designJson, location, area, budget, userId } = req.body;
        const project = await prisma.project.create({
            data: {
                name,
                description,
                status: 'planning',
                balconyJson: balconyJson ? JSON.stringify(balconyJson) : null,
                designJson: designJson ? JSON.stringify(designJson) : null,
                location,
                area: area ? parseFloat(area) : null,
                budget: budget ? parseFloat(budget) : null,
                userId: userId || 'test-user-id' // demo user
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true
                    }
                }
            }
        });
        // Transform data for frontend
        const formattedProject = {
            id: project.id,
            name: project.name,
            description: project.description,
            status: project.status,
            balconyJson: project.balconyJson ? JSON.parse(project.balconyJson) : null,
            designJson: project.designJson ? JSON.parse(project.designJson) : null,
            location: project.location,
            area: project.area,
            budget: project.budget,
            startDate: project.startDate,
            endDate: project.endDate,
            userId: project.userId,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
            user: project.user
        };
        res.status(201).json({
            success: true,
            data: formattedProject,
            message: 'Project created successfully',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});
app.get('/api/projects/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const project = await prisma.project.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true
                    }
                },
                projectPlants: {
                    include: {
                        plant: true
                    }
                },
                _count: {
                    select: {
                        projectPlants: true
                    }
                }
            }
        });
        if (!project) {
            return res.status(404).json({
                success: false,
                error: 'Project not found',
                timestamp: new Date().toISOString()
            });
        }
        // Transform data for frontend
        const formattedProject = {
            id: project.id,
            name: project.name,
            description: project.description,
            status: project.status,
            balconyJson: project.balconyJson ? JSON.parse(project.balconyJson) : null,
            designJson: project.designJson ? JSON.parse(project.designJson) : null,
            location: project.location,
            area: project.area,
            budget: project.budget,
            startDate: project.startDate,
            endDate: project.endDate,
            userId: project.userId,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
            user: project.user,
            plantCount: project._count.projectPlants,
            projectPlants: project.projectPlants
        };
        res.json({
            success: true,
            data: formattedProject,
            message: 'Project retrieved successfully',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Error fetching project:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});
// AI routes
const ai_1 = __importDefault(require("./routes/ai"));
app.use('/api/ai', ai_1.default);
// Auth routes
const auth_1 = __importDefault(require("./routes/auth"));
app.use('/api/auth', auth_1.default);
// Community routes
const community_1 = __importDefault(require("./routes/community"));
app.use('/api/community', community_1.default);
// Plant routes
const plant_1 = __importDefault(require("./routes/plant"));
app.use('/api/plants', plant_1.default);
// Project routes
const project_1 = __importDefault(require("./routes/project"));
app.use('/api/projects', project_1.default);
// Upload routes
const upload_1 = __importDefault(require("./routes/upload"));
app.use('/api/upload', upload_1.default);
// User routes
const user_1 = __importDefault(require("./routes/user"));
app.use('/api/users', user_1.default);
// Legacy AI analysis endpoint (for backward compatibility)
app.post('/api/ai/analyze', async (req, res) => {
    try {
        const { type, data } = req.body;
        // Get plants from database for analysis
        const plants = await prisma.plant.findMany();
        // Mock AI analysis based on input type
        let analysis;
        switch (type) {
            case 'balcony-design':
                analysis = {
                    id: `analysis-${Date.now()}`,
                    type: 'balcony-design',
                    confidence: 0.85,
                    recommendations: [
                        '建议选择耐阴植物',
                        '考虑种植多肉植物',
                        '注意通风和排水'
                    ],
                    insights: {
                        light: '阳台光照充足，适合喜阳植物',
                        space: '空间有限，建议垂直种植',
                        maintenance: '建议选择低维护植物',
                        budget: '根据预算建议选择性价比高的植物'
                    },
                    suggestedPlants: plants.slice(0, 5).map(plant => ({
                        id: plant.id,
                        name: plant.name,
                        category: plant.category,
                        difficulty: plant.difficulty,
                        benefits: plant.benefits ? JSON.parse(plant.benefits) : []
                    }))
                };
                break;
            case 'plant-care':
                analysis = {
                    id: `analysis-${Date.now()}`,
                    type: 'plant-care',
                    confidence: 0.90,
                    recommendations: [
                        '定期浇水，避免积水',
                        '适当施肥，促进生长',
                        '注意光照和通风',
                        '定期检查病虫害'
                    ],
                    insights: {
                        watering: '建议每2-3天浇水一次',
                        fertilizing: '每月施肥一次，使用复合肥',
                        pruning: '定期修剪枯枝败叶',
                        monitoring: '每周检查植物健康状况'
                    }
                };
                break;
            case 'plant-selection':
                analysis = {
                    id: `analysis-${Date.now()}`,
                    type: 'plant-selection',
                    confidence: 0.88,
                    recommendations: [
                        '根据阳台环境选择合适植物',
                        '考虑种植难度和养护成本',
                        '搭配不同类型的植物增加观赏性',
                        '选择具有净化空气功效的植物'
                    ],
                    insights: {
                        environmentMatch: '阳台朝南，适合喜阳植物',
                        difficultyLevel: '建议选择难度2-3级的植物',
                        careTime: '每周需要2-3小时的养护时间',
                        costEstimate: '初始投入约500-1000元'
                    },
                    suggestedPlants: plants.filter(plant => plant.difficulty <= 3).slice(0, 8).map(plant => ({
                        id: plant.id,
                        name: plant.name,
                        category: plant.category,
                        difficulty: plant.difficulty,
                        description: plant.description
                    }))
                };
                break;
            default:
                analysis = {
                    id: `analysis-${Date.now()}`,
                    type: 'general',
                    confidence: 0.75,
                    recommendations: [
                        '建议先了解阳台环境',
                        '选择适合的植物种类',
                        '制定合理的养护计划',
                        '定期记录植物生长情况'
                    ],
                    insights: {
                        general: '良好的园艺需要耐心和细心',
                        planning: '提前规划可以避免很多问题',
                        learning: '不断学习园艺知识很重要'
                    }
                };
        }
        res.json({
            success: true,
            data: analysis,
            message: 'AI analysis completed',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Error in AI analysis:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});
// Reminder system endpoints
// Get all reminders for a user
app.get('/api/reminders', async (req, res) => {
    try {
        const { userId, status, type } = req.query;
        const where = {};
        if (userId)
            where.userId = userId;
        if (status)
            where.completed = status === 'completed';
        if (type)
            where.type = type;
        const reminders = await prisma.reminder.findMany({
            where,
            include: {
                project: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                plant: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: {
                dueDate: 'asc'
            }
        });
        res.json({
            success: true,
            data: reminders,
            message: 'Reminders retrieved successfully',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Error fetching reminders:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});
// Get single reminder by ID
app.get('/api/reminders/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const reminder = await prisma.reminder.findUnique({
            where: { id },
            include: {
                project: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                plant: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
        if (!reminder) {
            return res.status(404).json({
                success: false,
                error: 'Reminder not found',
                timestamp: new Date().toISOString()
            });
        }
        res.json({
            success: true,
            data: reminder,
            message: 'Reminder retrieved successfully',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Error fetching reminder:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});
// Create a new reminder
app.post('/api/reminders', async (req, res) => {
    try {
        const { type, title, description, dueDate, projectId, plantId, userId } = req.body;
        // Validate required fields
        if (!type || !title || !dueDate || !userId) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: type, title, dueDate, userId',
                timestamp: new Date().toISOString()
            });
        }
        const reminder = await prisma.reminder.create({
            data: {
                type,
                title,
                description,
                dueDate: new Date(dueDate),
                projectId,
                plantId,
                userId
            },
            include: {
                project: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                plant: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
        res.status(201).json({
            success: true,
            data: reminder,
            message: 'Reminder created successfully',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Error creating reminder:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});
// Update a reminder
app.put('/api/reminders/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { type, title, description, dueDate, completed, projectId, plantId } = req.body;
        const reminder = await prisma.reminder.update({
            where: { id },
            data: {
                ...(type && { type }),
                ...(title && { title }),
                ...(description && { description }),
                ...(dueDate && { dueDate: new Date(dueDate) }),
                ...(completed !== undefined && { completed }),
                ...(projectId && { projectId }),
                ...(plantId && { plantId })
            },
            include: {
                project: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                plant: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
        res.json({
            success: true,
            data: reminder,
            message: 'Reminder updated successfully',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Error updating reminder:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});
// Delete a reminder
app.delete('/api/reminders/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.reminder.delete({
            where: { id }
        });
        res.json({
            success: true,
            message: 'Reminder deleted successfully',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Error deleting reminder:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});
// Mark reminder as completed
app.patch('/api/reminders/:id/complete', async (req, res) => {
    try {
        const { id } = req.params;
        const reminder = await prisma.reminder.update({
            where: { id },
            data: {
                completed: true
            },
            include: {
                project: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                plant: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
        res.json({
            success: true,
            data: reminder,
            message: 'Reminder marked as completed',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Error completing reminder:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});
// Get upcoming reminders (for notifications)
app.get('/api/reminders/upcoming', async (req, res) => {
    try {
        const { hours = 24 } = req.query; // Default to next 24 hours
        const fromNow = new Date();
        const toNow = new Date(Date.now() + parseInt(hours) * 60 * 60 * 1000);
        const reminders = await prisma.reminder.findMany({
            where: {
                dueDate: {
                    gte: fromNow,
                    lte: toNow
                },
                completed: false
            },
            include: {
                project: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                plant: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: {
                dueDate: 'asc'
            }
        });
        res.json({
            success: true,
            data: reminders,
            count: reminders.length,
            message: 'Upcoming reminders retrieved',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Error fetching upcoming reminders:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});
// Auto-generate care reminders based on plants and projects
app.post('/api/reminders/generate', async (req, res) => {
    try {
        const { plantId, projectId, userId } = req.body;
        let reminders = [];
        if (plantId) {
            // Get plant details
            const plant = await prisma.plant.findUnique({
                where: { id: plantId }
            });
            if (plant) {
                // Generate care reminders based on plant needs
                const today = new Date();
                // Watering reminder (every 2-3 days for most plants)
                reminders.push({
                    type: 'water',
                    title: `给${plant.name}浇水`,
                    description: `${plant.name}需要浇水了。浇水频率：${plant.water === 'frequent' ? '频繁' : plant.water === 'moderate' ? '中等' : '少量'}`,
                    dueDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
                    plantId,
                    userId
                });
                // Fertilizing reminder (monthly)
                reminders.push({
                    type: 'fertilize',
                    title: `给${plant.name}施肥`,
                    description: `${plant.name}需要施肥了。建议使用适合的肥料。`,
                    dueDate: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
                    plantId,
                    userId
                });
            }
        }
        // Create all reminders
        const createdReminders = await prisma.reminder.createMany({
            data: reminders
        });
        res.json({
            success: true,
            data: createdReminders,
            generated: reminders.length,
            message: 'Care reminders generated successfully',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Error generating reminders:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});
// Helper function to get current season
function getCurrentSeason() {
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 5)
        return 'spring';
    if (month >= 6 && month <= 8)
        return 'summer';
    if (month >= 9 && month <= 11)
        return 'autumn';
    return 'winter';
}
// Scheduled task for checking upcoming reminders and sending notifications
// Run every hour at minute 0
node_cron_1.default.schedule('0 * * * *', async () => {
    console.log('🔔 Checking for upcoming reminders...');
    try {
        const fromNow = new Date();
        const toNow = new Date(Date.now() + 24 * 60 * 60 * 1000); // Next 24 hours
        const upcomingReminders = await prisma.reminder.findMany({
            where: {
                dueDate: {
                    gte: fromNow,
                    lte: toNow
                },
                completed: false
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                plant: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                project: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });
        console.log(`📋 Found ${upcomingReminders.length} upcoming reminders`);
        // For each upcoming reminder, create a notification
        for (const reminder of upcomingReminders) {
            const timeUntilDue = reminder.dueDate.getTime() - Date.now();
            const hoursUntilDue = Math.ceil(timeUntilDue / (1000 * 60 * 60));
            console.log(`🔔 Reminder for ${reminder.user.name}: ${reminder.title} (due in ${hoursUntilDue} hours)`);
            // Here you would integrate with your notification service
            // For now, we'll just log it
            await sendNotification(reminder);
        }
    }
    catch (error) {
        console.error('Error in reminder cron job:', error);
    }
});
// Function to send notifications (placeholder for actual notification service)
async function sendNotification(reminder) {
    try {
        // This is where you would integrate with:
        // - Email service (nodemailer is already available)
        // - Push notifications
        // - SMS service
        // - In-app notifications
        const notification = {
            userId: reminder.userId,
            userName: reminder.user.name,
            title: reminder.title,
            description: reminder.description,
            dueDate: reminder.dueDate,
            plantName: reminder.plant?.name,
            projectName: reminder.project?.name,
            type: reminder.type,
            timestamp: new Date().toISOString()
        };
        console.log('📨 Sending notification:', notification);
        // Example: Send email notification using nodemailer
        if (process.env.EMAIL_ENABLED === 'true') {
            await sendEmailNotification(notification);
        }
        // Create notification record in database (if you have a notifications table)
        // await prisma.notification.create({ data: notification });
    }
    catch (error) {
        console.error('Error sending notification:', error);
    }
}
// Function to send email notification
async function sendEmailNotification(notification) {
    try {
        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransporter({
            service: process.env.EMAIL_SERVICE || 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        const mailOptions = {
            from: process.env.EMAIL_FROM || 'noreply@ai-gardening-designer.com',
            to: notification.userId, // In real app, get user's email
            subject: `🌱 AI园艺提醒: ${notification.title}`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2e7d32;">🌱 AI园艺设计师</h2>
          <p>亲爱的 ${notification.userName}，</p>
          <p>您有一个园艺提醒需要处理：</p>
          
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <h3 style="color: #2e7d32; margin-top: 0;">${notification.title}</h3>
            <p><strong>描述：</strong>${notification.description}</p>
            <p><strong>类型：</strong>${getCareTypeLabel(notification.type)}</p>
            <p><strong>截止时间：</strong>${new Date(notification.dueDate).toLocaleString('zh-CN')}</p>
            ${notification.plantName ? `<p><strong>植物：</strong>${notification.plantName}</p>` : ''}
            ${notification.projectName ? `<p><strong>项目：</strong>${notification.projectName}</p>` : ''}
          </div>
          
          <p>祝您园艺愉快！</p>
          <p>AI园艺设计师团队</p>
        </div>
      `
        };
        await transporter.sendMail(mailOptions);
        console.log(`📧 Email sent to ${notification.userId} for reminder: ${notification.title}`);
    }
    catch (error) {
        console.error('Error sending email notification:', error);
    }
}
// Helper function to get care type label in Chinese
function getCareTypeLabel(type) {
    const labels = {
        'water': '浇水',
        'fertilize': '施肥',
        'prune': '修剪',
        'repot': '换盆',
        'monitor': '检查'
    };
    return labels[type] || type;
}
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Route ${req.originalUrl} not found`,
        timestamp: new Date().toISOString()
    });
});
// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...');
    await prisma.$disconnect();
    process.exit(0);
});
process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully...');
    await prisma.$disconnect();
    process.exit(0);
});
const PORT = process.env.PORT || 3000;
const startServer = async () => {
    try {
        // Test database connection
        await prisma.$connect();
        console.log('🌱 AI Gardening Designer server connected to database');
        // Start server
        app.listen(PORT, () => {
            console.log(`🌱 AI Gardening Designer server running on port ${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV}`);
            console.log(`Health check: http://localhost:${PORT}/health`);
            console.log(`API: http://localhost:${PORT}/api`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        await prisma.$disconnect();
        process.exit(1);
    }
};
startServer();
//# sourceMappingURL=server.js.map