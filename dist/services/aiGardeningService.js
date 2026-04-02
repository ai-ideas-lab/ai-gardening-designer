"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiGardeningService = exports.AIGardeningService = void 0;
const openai_1 = __importDefault(require("openai"));
const client_1 = require("@prisma/client");
const errorHandler_1 = require("@/middleware/errorHandler");
const prisma = new client_1.PrismaClient();
// Initialize OpenAI client
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY,
});
class AIGardeningService {
    static getInstance() {
        if (!AIGardeningService.instance) {
            AIGardeningService.instance = new AIGardeningService();
        }
        return AIGardeningService.instance;
    }
    /**
     * Recognize plant from image using OpenAI Vision API
     */
    async recognizePlant(imageBuffer) {
        try {
            const response = await openai.chat.completions.create({
                model: "gpt-4-vision-preview",
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: `Analyze this plant image and provide:
1. Plant name (try to identify the species)
2. Confidence level (0-1)
3. Care suggestions
4. Water requirements
5. Light requirements
6. Temperature requirements
7. Humidity requirements

Please provide the response in JSON format with the following structure:
{
  "plantName": "string",
  "confidence": 0.8,
  "careSuggestions": ["tip1", "tip2"],
  "water": "frequency + amount",
  "light": "requirement",
  "temperature": "range",
  "humidity": "range"
}`
                            },
                            {
                                type: "image_url",
                                image_url: {
                                    url: `data:image/jpeg;base64,${imageBuffer.toString('base64')}`
                                }
                            }
                        ]
                    }
                ],
                max_tokens: 500
            });
            const result = JSON.parse(response.choices[0].message.content);
            // Find or create plant in database
            const plant = await prisma.plant.upsert({
                where: {
                    name: result.plantName
                },
                update: {
                    description: result.careSuggestions.join(' '),
                    careTips: result.careSuggestions,
                    water: result.water,
                    light: result.light,
                    temperature: { ideal: result.temperature },
                    humidity: { ideal: result.humidity }
                },
                create: {
                    name: result.plantName,
                    commonNames: [result.plantName],
                    category: 'indoor', // Default category
                    light: result.light,
                    water: result.water,
                    temperature: { ideal: result.temperature },
                    humidity: { ideal: result.humidity },
                    careTips: result.careSuggestions,
                    difficulty: 3, // Default difficulty
                    benefits: []
                }
            });
            return {
                plantId: plant.id,
                confidence: result.confidence,
                suggestions: result.careSuggestions,
                careInfo: {
                    water: result.water,
                    light: result.light,
                    temperature: result.temperature,
                    humidity: result.humidity
                }
            };
        }
        catch (error) {
            console.error('Plant recognition error:', error);
            throw (0, errorHandler_1.createError)('Failed to recognize plant image', 400, true);
        }
    }
    /**
     * Analyze balcony conditions from image
     */
    async analyzeBalcony(imageBuffer, userId) {
        try {
            const response = await openai.chat.completions.create({
                model: "gpt-4-vision-preview",
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: `Analyze this balcony image and provide:
1. Size estimation in square meters
2. Direction (north, south, east, west)
3. Light conditions (morning, afternoon, evening ratings 0-10)
4. Existing plants detected
5. Enclosure type (open, glass, screen)
6. Shading level (none, partial, full)
7. Floor level

Please provide the response in JSON format:
{
  "size": 10.5,
  "direction": "south",
  "light": {"morning": 8, "afternoon": 9, "evening": 6},
  "existingPlants": ["plant1", "plant2"],
  "enclosure": "glass",
  "shading": "partial",
  "floor": 3
}`
                            },
                            {
                                type: "image_url",
                                image_url: {
                                    url: `data:image/jpeg;base64,${imageBuffer.toString('base64')}`
                                }
                            }
                        ]
                    }
                ],
                max_tokens: 500
            });
            const analysis = JSON.parse(response.choices[0].message.content);
            // Save balcony analysis to user preferences
            await prisma.user.update({
                where: { id: userId },
                data: {
                    balconySize: analysis.size,
                    balconyDirection: analysis.direction
                }
            });
            return analysis;
        }
        catch (error) {
            console.error('Balcony analysis error:', error);
            throw (0, errorHandler_1.createError)('Failed to analyze balcony conditions', 400, true);
        }
    }
    /**
     * Generate plant design recommendations
     */
    async generateDesignRecommendations(userId, balconyConditions, preferences, projectId) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId }
            });
            const prompt = `
Based on the following balcony and user preferences, generate personalized plant design recommendations:

User Profile:
- Location: ${user?.location || 'Unknown'}
- Experience Level: ${preferences?.experience || 'intermediate'}
- Style Preference: ${preferences?.style || 'modern'}
- Maintenance Level: ${preferences?.maintenance || 'medium'}
- Budget Range: ${preferences?.budgetRange || 'medium'}

Balcony Conditions:
- Size: ${balconyConditions.size} m²
- Direction: ${balconyConditions.direction}
- Light: Morning ${balconyConditions.light.morning}/10, Afternoon ${balconyConditions.light.afternoon}/10, Evening ${balconyConditions.light.evening}/10
- Enclosure: ${balconyConditions.enclosure}
- Shading: ${balconyConditions.shading}
- Floor: ${balconyConditions.floor}

Generate 3-5 design recommendations with:
1. Plant suggestions suitable for these conditions
2. Layout recommendations
3. Care tips for the design
4. Estimated costs
5. Timeline for implementation

Return in JSON format with plant IDs from our database if available.
`;
            const response = await openai.chat.completions.create({
                model: "gpt-4",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 800
            });
            const recommendations = JSON.parse(response.choices[0].message.content);
            // Save recommendations to database
            const savedRecommendations = await Promise.all(recommendations.map(async (rec) => {
                return prisma.recommendation.create({
                    data: {
                        type: 'design',
                        title: rec.title,
                        description: rec.description,
                        data: rec,
                        confidence: rec.confidence || 0.8,
                        userId,
                        projectId
                    }
                });
            }));
            return savedRecommendations.map(rec => ({
                id: rec.id,
                type: 'design',
                title: rec.title,
                description: rec.description,
                data: rec.data,
                confidence: rec.confidence,
                projectId: rec.projectId
            }));
        }
        catch (error) {
            console.error('Design recommendation error:', error);
            throw (0, errorHandler_1.createError)('Failed to generate design recommendations', 400, true);
        }
    }
    /**
     * Generate plant care alerts
     */
    async generateCareAlerts(userId, projectId) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId }
            });
            // Get user's plants and projects
            const projects = await prisma.project.findMany({
                where: { userId },
                include: {
                    projectPlants: {
                        include: { plant: true }
                    }
                }
            });
            const alerts = [];
            for (const project of projects) {
                for (const projectPlant of project.projectPlants) {
                    // Generate care alert based on plant type and current date
                    const alertType = this.determineCareType(projectPlant.plant);
                    if (alertType) {
                        const alert = await this.createCareAlert(userId, projectPlant.plantId, alertType, projectPlant, project);
                        alerts.push(alert);
                    }
                }
            }
            return alerts;
        }
        catch (error) {
            console.error('Care alert generation error:', error);
            throw (0, errorHandler_1.createError)('Failed to generate care alerts', 400, true);
        }
    }
    /**
     * Search for plants based on conditions and preferences
     */
    async searchPlants(conditions, preferences, limit = 10) {
        try {
            const plants = await prisma.plant.findMany({
                where: {
                    AND: [
                        { light: conditions.light },
                        { water: conditions.water },
                        { difficulty: { lte: preferences.experience === 'beginner' ? 2 : 5 } }
                    ]
                },
                take: limit,
                orderBy: { difficulty: 'asc' }
            });
            return plants;
        }
        catch (error) {
            console.error('Plant search error:', error);
            throw (0, errorHandler_1.createError)('Failed to search plants', 400, true);
        }
    }
    /**
     * Get plant care information
     */
    async getPlantCareInfo(plantId) {
        try {
            const plant = await prisma.plant.findUnique({
                where: { id: plantId },
                include: {
                    knowledge: {
                        orderBy: { createdAt: 'desc' }
                    }
                }
            });
            if (!plant) {
                throw (0, errorHandler_1.createError)('Plant not found', 404, true);
            }
            return {
                plant,
                careTips: plant.careTips,
                knowledge: plant.knowledge,
                problems: await prisma.plantProblem.findMany({
                    where: { plantId }
                })
            };
        }
        catch (error) {
            console.error('Plant care info error:', error);
            throw error;
        }
    }
    /**
     * Determine care type based on plant and current conditions
     */
    determineCareType(plant) {
        // This is a simplified logic - in production, you'd want more sophisticated AI
        const today = new Date();
        const dayOfWeek = today.getDay();
        // Sample logic: generate different alerts based on plant type
        if (plant.category === 'herb') {
            return dayOfWeek === 1 ? 'water' : 'fertilize'; // Water on Mondays, fertilize rest of week
        }
        else if (plant.category === 'flower') {
            return dayOfWeek === 3 ? 'prune' : 'water';
        }
        else if (plant.category === 'vegetable') {
            return 'water';
        }
        return null;
    }
    /**
     * Create care alert
     */
    async createCareAlert(userId, plantId, type, projectPlant, project) {
        const alertTitle = this.getAlertTitle(type);
        const alertDescription = this.getAlertDescription(type, projectPlant.plant);
        return {
            id: '', // Will be generated by Prisma
            plantId,
            type,
            title: alertTitle,
            description: alertDescription,
            urgency: 'medium',
            dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
            solutions: this.getAlertSolutions(type)
        };
    }
    getAlertTitle(type) {
        const titles = {
            water: 'Water Reminder',
            fertilize: 'Fertilization Needed',
            prune: 'Pruning Time',
            repot: 'Repotting Reminder',
            disease: 'Health Check Needed'
        };
        return titles[type] || 'Care Reminder';
    }
    getAlertDescription(type, plant) {
        const descriptions = {
            water: `${plant.name} needs watering. Check soil moisture before watering.`,
            fertilize: `${plant.name} needs fertilization to maintain healthy growth.`,
            prune: `${plant.name} needs pruning to maintain shape and encourage new growth.`,
            repot: `${plant.name} may need repotting as it's outgrowing its current container.`,
            disease: `${plant.name} shows signs of stress. Check for pests or diseases.`
        };
        return descriptions[type] || 'Regular care needed for your plant.';
    }
    getAlertSolutions(type) {
        const solutions = {
            water: [
                'Check soil moisture with finger test',
                'Water thoroughly until drainage appears',
                'Avoid overwatering - let soil dry between waterings'
            ],
            fertilize: [
                'Use balanced fertilizer diluted to half strength',
                'Fertilize during growing season',
                'Stop fertilizing in winter'
            ],
            prune: [
                'Use clean, sharp pruning shears',
                'Prune just above leaf nodes',
                'Remove dead or yellowing leaves'
            ],
            repot: [
                'Choose next size up container',
                'Use well-draining potting mix',
                'Water thoroughly after repotting'
            ],
            disease: [
                'Isolate affected plant',
                'Remove affected leaves',
                'Apply appropriate treatment'
            ]
        };
        return solutions[type] || ['Follow standard care guidelines'];
    }
    /**
     * Smart Plant Problem Diagnosis
     * Analyzes user's plant problem description and provides AI-powered diagnosis
     */
    async diagnosePlantProblem(plantId, problemDescription, imageUrl) {
        try {
            const plant = await prisma.plant.findUnique({
                where: { id: plantId },
                include: {
                    problems: true,
                    knowledge: {
                        where: { category: 'disease' }
                    }
                }
            });
            if (!plant) {
                throw (0, errorHandler_1.createError)('Plant not found', 404, true);
            }
            // Build comprehensive prompt for AI diagnosis
            const prompt = `
Analyze the following plant problem and provide detailed diagnosis:

Plant Information:
- Name: ${plant.name}
- Category: ${plant.category}
- Light Requirements: ${plant.light}
- Water Requirements: ${plant.water}
- Difficulty Level: ${plant.difficulty}

Problem Description:
${problemDescription}

${imageUrl ? `
Image Analysis Required:
- Analyze the uploaded plant image for visual symptoms
- Look for discoloration, spots, wilting, pests, or other abnormalities
` : ''}

Provide diagnosis in JSON format:
{
  "problemType": "identified problem category",
  "confidence": 0.85,
  "severity": "low|medium|high",
  "likelyCauses": ["cause1", "cause2"],
  "recommendedActions": ["action1", "action2"],
  "prognosis": "expected outcome with proper care"
}
`;
            const response = await openai.chat.completions.create({
                model: "gpt-4",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 600
            });
            const aiDiagnosis = JSON.parse(response.choices[0].message.content);
            // Find similar problems from database
            const similarProblems = await prisma.plantProblem.findMany({
                where: {
                    plantId: plantId,
                    OR: [
                        { name: { contains: aiDiagnosis.problemType.toLowerCase() } },
                        { symptoms: { contains: problemDescription.toLowerCase() } }
                    ]
                },
                take: 5
            });
            // Generate learning insights
            const learningInsights = await this.generateLearningInsights(plantId, problemDescription);
            // Save diagnosis to database for future learning
            await this.saveDiagnosisInsights(plantId, problemDescription, aiDiagnosis);
            return {
                diagnosis: aiDiagnosis,
                similarProblems,
                learningInsights
            };
        }
        catch (error) {
            console.error('Plant diagnosis error:', error);
            throw (0, errorHandler_1.createError)('Failed to diagnose plant problem', 400, true);
        }
    }
    /**
     * Personalized Plant Care Learning System
     * Learns from user feedback and plant performance to improve care recommendations
    */
    async getPersonalizedCareRecommendations(userId, plantId) {
        try {
            // Get user's plants and care history
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: {
                    plants: {
                        include: {
                            projectPlants: {
                                include: { project: true }
                            }
                        }
                    },
                    activities: {
                        where: { type: 'care_completed' },
                        orderBy: { createdAt: 'desc' },
                        take: 20
                    }
                }
            });
            if (!user) {
                throw (0, errorHandler_1.createError)('User not found', 404, true);
            }
            // Get specific plant if provided
            let targetPlants = user.plants;
            if (plantId) {
                const specificPlant = await prisma.plant.findUnique({
                    where: { id: plantId },
                    include: {
                        projectPlants: {
                            include: { project: true }
                        }
                    }
                });
                if (specificPlant) {
                    targetPlants = [specificPlant];
                }
            }
            // Analyze care patterns and success rate
            const carePatterns = await this.analyzeCarePatterns(user, targetPlants);
            // Generate personalized recommendations
            const personalizedPrompt = `
Based on the following user care history and plant performance patterns, generate optimized care recommendations:

User Profile:
- Location: ${user.location || 'Unknown'}
- Experience Level: ${user.preferences?.experience || 'intermediate'}
- Care Style: ${user.preferences?.style || 'modern'}

Care History Analysis:
${carePatterns.successRate ? `Success Rate: ${carePatterns.successRate}%` : 'Limited data available'}
${carePatterns.commonIssues.length > 0 ? `Common Issues: ${carePatterns.commonIssues.join(', ')}` : 'No major issues detected'}
${carePatterns.preferredTiming ? `Preferred Care Timing: ${carePatterns.preferredTiming}` : 'No timing preferences detected'}

Plant Information:
${targetPlants.map(plant => `
- ${plant.name}: ${plant.category}, difficulty ${plant.difficulty}
  Current care: water ${plant.water}, light ${plant.light}
`).join('')}

Generate optimized care recommendations in JSON format:
{
  "watering": {
    "frequency": "optimized frequency",
    "timing": "best timing",
    "seasonalAdjustments": {"spring": "...", "summer": "...", etc.}
  },
  "fertilizing": {
    "schedule": "optimized schedule",
    "type": "recommended fertilizer type",
    "dosage": "proper dosage"
  },
  "pruning": {
    "schedule": "optimal pruning schedule",
    "techniques": ["technique1", "technique2"]
  }
}
`;
            const response = await openai.chat.completions.create({
                model: "gpt-4",
                messages: [{ role: "user", content: personalizedPrompt }],
                max_tokens: 700
            });
            const optimizedCare = JSON.parse(response.choices[0].message.content);
            // Generate learning insights
            const learningInsights = await this.generatePersonalizedInsights(user, targetPlants, carePatterns);
            // Calculate confidence based on data availability
            const confidence = Math.min(carePatterns.dataConfidence, 0.95);
            // Save recommendations for future learning
            await this.savePersonalizedRecommendations(userId, plantId, optimizedCare);
            return {
                optimizedCare,
                learningInsights,
                confidence
            };
        }
        catch (error) {
            console.error('Personalized care recommendations error:', error);
            throw (0, errorHandler_1.createError)('Failed to generate personalized care recommendations', 400, true);
        }
    }
    /**
     * Analyze user care patterns for personalized recommendations
     */
    async analyzeCarePatterns(user, plants) {
        // Simplified pattern analysis - in production, this would be more sophisticated
        const activities = user.activities || [];
        const completedCare = activities.filter(act => act.type === 'care_completed');
        const successRate = completedCare.length > 0 ?
            Math.min(completedCare.length / Math.max(activities.length, 1) * 100, 100) : 0;
        const commonIssues = this.extractCommonIssues(activities);
        const preferredTiming = this.extractPreferredTiming(activities);
        const dataConfidence = plants.length > 0 && activities.length > 5 ? 0.8 : 0.4;
        return {
            successRate,
            commonIssues,
            preferredTiming,
            dataConfidence
        };
    }
    /**
     * Extract common issues from user activities
     */
    extractCommonIssues(activities) {
        // Simplified extraction - in production, this would use NLP
        const issueKeywords = ['disease', 'problem', 'issue', 'dead', 'wilting', 'yellowing'];
        const issues = activities
            .filter(activity => issueKeywords.some(keyword => activity.description?.toLowerCase().includes(keyword)))
            .map(activity => activity.description);
        return [...new Set(issues)].slice(0, 3);
    }
    /**
     * Extract preferred care timing from user activities
     */
    extractPreferredTiming(activities) {
        const careActivities = activities.filter(act => act.type === 'care_completed');
        if (careActivities.length === 0)
            return 'morning';
        // Analyze timing patterns
        const hours = careActivities.map(act => {
            const date = new Date(act.createdAt);
            return date.getHours();
        });
        const averageHour = hours.reduce((sum, hour) => sum + hour, 0) / hours.length;
        if (averageHour < 12)
            return 'morning';
        if (averageHour < 18)
            return 'afternoon';
        return 'evening';
    }
    /**
     * Generate learning insights for plant problems
     */
    async generateLearningInsights(plantId, problemDescription) {
        // Simplified insight generation
        const insights = {
            commonPatterns: [
                'Most plant issues are related to watering problems',
                'Environmental changes often cause stress',
                'Regular monitoring prevents major problems'
            ],
            preventionTips: [
                'Maintain consistent watering schedule',
                'Monitor plant health weekly',
                'Adjust care based on seasonal changes'
            ]
        };
        return insights;
    }
    /**
     * Generate personalized insights based on user patterns
     */
    async generatePersonalizedInsights(user, plants, patterns) {
        return {
            userPatterns: [
                'User prefers morning care routines',
                'Consistent watering schedule maintained',
                'Active plant monitoring'
            ],
            improvementAreas: [
                'Consider seasonal adjustments',
                'Implement more proactive disease prevention',
                'Optimize fertilizing schedule'
            ],
            successFactors: [
                'Regular care routine established',
                'Good attention to plant needs',
                'Willingness to adjust based on feedback'
            ]
        };
    }
    /**
     * Save diagnosis insights for future learning
     */
    async saveDiagnosisInsights(plantId, problemDescription, diagnosis) {
        try {
            // Save to plant knowledge database for future reference
            await prisma.plantKnowledge.create({
                data: {
                    plantId,
                    title: `AI Diagnosis: ${diagnosis.problemType}`,
                    content: `
Problem: ${diagnosis.problemType}
Description: ${problemDescription}
Likely Causes: ${diagnosis.likelyCauses.join(', ')}
Recommended Actions: ${diagnosis.recommendedActions.join(', ')}
Prognosis: ${diagnosis.prognosis}
          `,
                    category: 'disease',
                    difficulty: diagnosis.severity === 'high' ? 5 : diagnosis.severity === 'medium' ? 3 : 1
                }
            });
        }
        catch (error) {
            console.error('Failed to save diagnosis insights:', error);
        }
    }
    /**
     * Save personalized recommendations for future learning
     */
    async savePersonalizedRecommendations(userId, plantId, recommendations) {
        try {
            await prisma.recommendation.create({
                data: {
                    type: 'personalized_care',
                    title: 'Personalized Care Optimization',
                    description: 'AI-optimized care recommendations based on your patterns',
                    data: {
                        plantId,
                        recommendations,
                        generatedAt: new Date().toISOString()
                    },
                    confidence: 0.85,
                    userId,
                    plantId
                }
            });
        }
        catch (error) {
            console.error('Failed to save personalized recommendations:', error);
        }
    }
}
exports.AIGardeningService = AIGardeningService;
// Export singleton instance
exports.aiGardeningService = AIGardeningService.getInstance();
//# sourceMappingURL=aiGardeningService.js.map