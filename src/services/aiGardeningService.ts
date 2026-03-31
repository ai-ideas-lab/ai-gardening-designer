import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';
import { PlantRecognitionResult, DesignRecommendation, BalconyAnalysis, CareAlert } from '@/types';
import { createError } from '@/middleware/errorHandler';

const prisma = new PrismaClient();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class AIGardeningService {
  private static instance: AIGardeningService;

  static getInstance(): AIGardeningService {
    if (!AIGardeningService.instance) {
      AIGardeningService.instance = new AIGardeningService();
    }
    return AIGardeningService.instance;
  }

  /**
   * Recognize plant from image using OpenAI Vision API
   */
  async recognizePlant(imageBuffer: Buffer): Promise<PlantRecognitionResult> {
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
    } catch (error) {
      console.error('Plant recognition error:', error);
      throw createError('Failed to recognize plant image', 400, true);
    }
  }

  /**
   * Analyze balcony conditions from image
   */
  async analyzeBalcony(imageBuffer: Buffer, userId: string): Promise<BalconyAnalysis> {
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
    } catch (error) {
      console.error('Balcony analysis error:', error);
      throw createError('Failed to analyze balcony conditions', 400, true);
    }
  }

  /**
   * Generate plant design recommendations
   */
  async generateDesignRecommendations(
    userId: string,
    balconyConditions: any,
    preferences: any,
    projectId?: string
  ): Promise<DesignRecommendation[]> {
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
      const savedRecommendations = await Promise.all(
        recommendations.map(async (rec: any) => {
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
        })
      );

      return savedRecommendations.map(rec => ({
        id: rec.id,
        type: 'design',
        title: rec.title,
        description: rec.description,
        data: rec.data,
        confidence: rec.confidence,
        projectId: rec.projectId
      }));
    } catch (error) {
      console.error('Design recommendation error:', error);
      throw createError('Failed to generate design recommendations', 400, true);
    }
  }

  /**
   * Generate plant care alerts
   */
  async generateCareAlerts(userId: string, projectId?: string): Promise<CareAlert[]> {
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

      const alerts: CareAlert[] = [];

      for (const project of projects) {
        for (const projectPlant of project.projectPlants) {
          // Generate care alert based on plant type and current date
          const alertType = this.determineCareType(projectPlant.plant);
          if (alertType) {
            const alert = await this.createCareAlert(
              userId,
              projectPlant.plantId,
              alertType,
              projectPlant,
              project
            );
            alerts.push(alert);
          }
        }
      }

      return alerts;
    } catch (error) {
      console.error('Care alert generation error:', error);
      throw createError('Failed to generate care alerts', 400, true);
    }
  }

  /**
   * Search for plants based on conditions and preferences
   */
  async searchPlants(conditions: any, preferences: any, limit: number = 10) {
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
    } catch (error) {
      console.error('Plant search error:', error);
      throw createError('Failed to search plants', 400, true);
    }
  }

  /**
   * Get plant care information
   */
  async getPlantCareInfo(plantId: string) {
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
        throw createError('Plant not found', 404, true);
      }

      return {
        plant,
        careTips: plant.careTips,
        knowledge: plant.knowledge,
        problems: await prisma.plantProblem.findMany({
          where: { plantId }
        })
      };
    } catch (error) {
      console.error('Plant care info error:', error);
      throw error;
    }
  }

  /**
   * Determine care type based on plant and current conditions
   */
  private determineCareType(plant: any): string | null {
    // This is a simplified logic - in production, you'd want more sophisticated AI
    const today = new Date();
    const dayOfWeek = today.getDay();
    
    // Sample logic: generate different alerts based on plant type
    if (plant.category === 'herb') {
      return dayOfWeek === 1 ? 'water' : 'fertilize'; // Water on Mondays, fertilize rest of week
    } else if (plant.category === 'flower') {
      return dayOfWeek === 3 ? 'prune' : 'water';
    } else if (plant.category === 'vegetable') {
      return 'water';
    }
    
    return null;
  }

  /**
   * Create care alert
   */
  private async createCareAlert(
    userId: string,
    plantId: string,
    type: string,
    projectPlant: any,
    project: any
  ): Promise<CareAlert> {
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

  private getAlertTitle(type: string): string {
    const titles: Record<string, string> = {
      water: 'Water Reminder',
      fertilize: 'Fertilization Needed',
      prune: 'Pruning Time',
      repot: 'Repotting Reminder',
      disease: 'Health Check Needed'
    };
    return titles[type] || 'Care Reminder';
  }

  private getAlertDescription(type: string, plant: any): string {
    const descriptions: Record<string, string> = {
      water: `${plant.name} needs watering. Check soil moisture before watering.`,
      fertilize: `${plant.name} needs fertilization to maintain healthy growth.`,
      prune: `${plant.name} needs pruning to maintain shape and encourage new growth.`,
      repot: `${plant.name} may need repotting as it's outgrowing its current container.`,
      disease: `${plant.name} shows signs of stress. Check for pests or diseases.`
    };
    return descriptions[type] || 'Regular care needed for your plant.';
  }

  private getAlertSolutions(type: string): string[] {
    const solutions: Record<string, string[]> = {
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
}

// Export singleton instance
export const aiGardeningService = AIGardeningService.getInstance();