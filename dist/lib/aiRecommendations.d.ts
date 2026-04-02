/**
 * 智能植物推荐系统
 * 根据用户环境偏好、技能水平和空间条件推荐最适合的植物
 */
export declare function getSmartPlantRecommendations(userPreferences: {
    balconyType?: string;
    balconySize?: number;
    balconyDirection?: string;
    skillLevel?: 'beginner' | 'intermediate' | 'expert';
    careTime?: number;
    budget?: number;
    preferences?: string[];
}): Promise<{
    success: boolean;
    data: {
        recommendations: {
            score: number;
            recommendationReasons: string[];
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
        }[];
        totalCount: number;
        userPreferences: {
            balconyType?: string;
            balconySize?: number;
            balconyDirection?: string;
            skillLevel?: "beginner" | "intermediate" | "expert";
            careTime?: number;
            budget?: number;
            preferences?: string[];
        };
        algorithm: string;
    };
    message: string;
    error?: undefined;
} | {
    success: boolean;
    error: string;
    message: string;
    data?: undefined;
}>;
/**
 * 阳台空间优化设计算法
 * 根据阳台尺寸、朝向、用户偏好生成最优的空间布局方案
 */
export declare function optimizeBalconyDesign(balconyConfig: {
    size: {
        width: number;
        height: number;
        depth: number;
    };
    direction: 'north' | 'south' | 'east' | 'west';
    budget: number;
    userPreferences: {
        style?: 'modern' | 'traditional' | 'natural' | 'minimalist';
        focus?: 'decorative' | 'functional' | 'productive' | 'therapeutic';
        difficulty?: 'easy' | 'medium' | 'hard';
    };
}): Promise<{
    success: boolean;
    data: {
        design: {
            layout: {
                primaryZones: Array<{
                    type: "shade" | "sun" | "transition";
                    plants: Array<{
                        id: string;
                        name: string;
                        quantity: number;
                        position: {
                            x: number;
                            y: number;
                            z?: number;
                        };
                        benefits: string[];
                    }>;
                    area: number;
                }>;
                verticalSpace: Array<{
                    type: "hanging" | "climbing" | "shelf";
                    plants: Array<{
                        id: string;
                        name: string;
                        position: {
                            x: number;
                            y: number;
                            z: number;
                        };
                    }>;
                }>;
                functionalAreas: Array<{
                    type: "seating" | "storage" | "growing";
                    area: number;
                    plants?: Array<{
                        id: string;
                        name: string;
                        quantity: number;
                    }>;
                }>;
            };
            budgetAllocation: {
                plants: number;
                containers: number;
                soil: number;
                tools: number;
                decoration: number;
            };
            maintenanceSchedule: {
                daily: string[];
                weekly: string[];
                monthly: string[];
                seasonal: string[];
            };
        };
        totalCost: number;
        spaceEfficiency: number;
        lightUtilization: number;
    };
    message: string;
    error?: undefined;
} | {
    success: boolean;
    error: string;
    message: string;
    data?: undefined;
}>;
/**
 * 植物健康诊断和问题解决方案
 */
export declare function diagnosePlantHealth(plantId: string, symptoms: string[], environment: {
    light: string;
    water: string;
    temperature: number;
    humidity: number;
    recentChanges?: string[];
}): Promise<{
    success: boolean;
    error: string;
    message: string;
    data?: undefined;
} | {
    success: boolean;
    data: {
        plant: string;
        problemIdentified: string;
        confidence: number;
        possibleCauses: string[];
        solutions: string[];
        preventionTips: string[];
        urgency: string;
    };
    message: string;
    error?: undefined;
}>;
//# sourceMappingURL=aiRecommendations.d.ts.map