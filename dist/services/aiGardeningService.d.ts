import { PlantRecognitionResult, DesignRecommendation, BalconyAnalysis, CareAlert } from '@/types';
export declare class AIGardeningService {
    private static instance;
    static getInstance(): AIGardeningService;
    /**
     * Recognize plant from image using OpenAI Vision API
     */
    recognizePlant(imageBuffer: Buffer): Promise<PlantRecognitionResult>;
    /**
     * Analyze balcony conditions from image
     */
    analyzeBalcony(imageBuffer: Buffer, userId: string): Promise<BalconyAnalysis>;
    /**
     * Generate plant design recommendations
     */
    generateDesignRecommendations(userId: string, balconyConditions: any, preferences: any, projectId?: string): Promise<DesignRecommendation[]>;
    /**
     * Generate plant care alerts
     */
    generateCareAlerts(userId: string, projectId?: string): Promise<CareAlert[]>;
    /**
     * Search for plants based on conditions and preferences
     */
    searchPlants(conditions: any, preferences: any, limit?: number): Promise<{
        id: string;
        name: string;
        scientificName: string | null;
        commonNames: string | null;
        category: string;
        light: string;
        water: string;
        temperature: string | null;
        humidity: string | null;
        soil: string | null;
        growthRate: string | null;
        matureSize: string | null;
        difficulty: number;
        description: string | null;
        careTips: string | null;
        toxicity: string | null;
        benefits: string | null;
        imageUrl: string | null;
    }[]>;
    /**
     * Get plant care information
     */
    getPlantCareInfo(plantId: string): Promise<{
        plant: {
            knowledge: {
                id: string;
                category: string;
                difficulty: number | null;
                plantId: string;
                title: string;
                content: string;
                tags: string | null;
                createdAt: Date;
                updatedAt: Date;
            }[];
        } & {
            id: string;
            name: string;
            scientificName: string | null;
            commonNames: string | null;
            category: string;
            light: string;
            water: string;
            temperature: string | null;
            humidity: string | null;
            soil: string | null;
            growthRate: string | null;
            matureSize: string | null;
            difficulty: number;
            description: string | null;
            careTips: string | null;
            toxicity: string | null;
            benefits: string | null;
            imageUrl: string | null;
        };
        careTips: string;
        knowledge: {
            id: string;
            category: string;
            difficulty: number | null;
            plantId: string;
            title: string;
            content: string;
            tags: string | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        problems: {
            id: string;
            name: string;
            description: string;
            imageUrl: string | null;
            plantId: string;
            createdAt: Date;
            updatedAt: Date;
            symptoms: string | null;
            causes: string | null;
            solutions: string | null;
            severity: number;
        }[];
    }>;
    /**
     * Determine care type based on plant and current conditions
     */
    private determineCareType;
    /**
     * Create care alert
     */
    private createCareAlert;
    private getAlertTitle;
    private getAlertDescription;
    private getAlertSolutions;
    /**
     * Smart Plant Problem Diagnosis
     * Analyzes user's plant problem description and provides AI-powered diagnosis
     */
    diagnosePlantProblem(plantId: string, problemDescription: string, imageUrl?: Buffer): Promise<{
        diagnosis: {
            problemType: string;
            confidence: number;
            severity: 'low' | 'medium' | 'high';
            likelyCauses: string[];
            recommendedActions: string[];
            prognosis: string;
        };
        similarProblems: any[];
        learningInsights: {
            commonPatterns: string[];
            preventionTips: string[];
        };
    }>;
    /**
     * Personalized Plant Care Learning System
     * Learns from user feedback and plant performance to improve care recommendations
    */
    getPersonalizedCareRecommendations(userId: string, plantId?: string): Promise<{
        optimizedCare: {
            watering: {
                frequency: string;
                timing: string;
                seasonalAdjustments: Record<string, string>;
            };
            fertilizing: {
                schedule: string;
                type: string;
                dosage: string;
            };
            pruning: {
                schedule: string;
                techniques: string[];
            };
        };
        learningInsights: {
            userPatterns: string[];
            improvementAreas: string[];
            successFactors: string[];
        };
        confidence: number;
    }>;
    /**
     * Analyze user care patterns for personalized recommendations
     */
    private analyzeCarePatterns;
    /**
     * Extract common issues from user activities
     */
    private extractCommonIssues;
    /**
     * Extract preferred care timing from user activities
     */
    private extractPreferredTiming;
    /**
     * Generate learning insights for plant problems
     */
    private generateLearningInsights;
    /**
     * Generate personalized insights based on user patterns
     */
    private generatePersonalizedInsights;
    /**
     * Save diagnosis insights for future learning
     */
    private saveDiagnosisInsights;
    /**
     * Save personalized recommendations for future learning
     */
    private savePersonalizedRecommendations;
}
export declare const aiGardeningService: AIGardeningService;
//# sourceMappingURL=aiGardeningService.d.ts.map