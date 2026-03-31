// Core Types
export interface User {
  id: string;
  email: string;
  username?: string;
  name?: string;
  avatar?: string;
  location?: string;
  balconyType?: string;
  balconySize?: number;
  balconyDirection?: string;
  preferences?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Plant {
  id: string;
  name: string;
  scientificName?: string;
  commonNames: string[];
  category: string;
  light: string;
  water: string;
  temperature?: Record<string, number>;
  humidity?: Record<string, number>;
  soil?: string;
  growthRate?: string;
  matureSize?: Record<string, number>;
  difficulty: number;
  description?: string;
  careTips: string[];
  toxicity?: string;
  benefits: string[];
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  balconyJson: Record<string, any>;
  designJson: Record<string, any>;
  location?: string;
  area?: number;
  budget?: number;
  startDate?: Date;
  endDate?: Date;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  user: User;
  projectPlants: ProjectPlant[];
}

export interface ProjectPlant {
  id: string;
  projectId: string;
  plantId: string;
  quantity: number;
  position: Record<string, any>;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  plant: Plant;
}

export interface Upload {
  id: string;
  filename: string;
  originalName: string;
  path: string;
  mimetype: string;
  size: number;
  type: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  user: User;
}

export interface Activity {
  id: string;
  type: string;
  title: string;
  description?: string;
  data?: Record<string, any>;
  projectId?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  user: User;
  project?: Project;
}

export interface Reminder {
  id: string;
  type: string;
  title: string;
  description?: string;
  dueDate: Date;
  completed: boolean;
  projectId?: string;
  plantId?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  user: User;
  project?: Project;
  plant?: Plant;
}

// API Request/Response Types
export interface AuthRequest extends Request {
  user?: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username?: string;
  password: string;
  name?: string;
  location?: string;
  balconyType?: string;
  balconySize?: number;
  balconyDirection?: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  balconyJson: Record<string, any>;
  designJson?: Record<string, any>;
  location?: string;
  area?: number;
  budget?: number;
}

export interface PlantAnalysisRequest {
  image: File;
  userId: string;
  projectId?: string;
}

export interface RecommendationRequest {
  userId: string;
  projectId?: string;
  preferences?: Record<string, any>;
  balconyConditions?: Record<string, any>;
  plantCount?: number;
  budget?: number;
}

export interface UploadRequest {
  file: File;
  type: string;
  projectId?: string;
}

// AI Service Types
export interface PlantRecognitionResult {
  plantId: string;
  confidence: number;
  suggestions: string[];
  careInfo: {
    water: string;
    light: string;
    temperature: string;
    humidity: string;
  };
}

export interface DesignRecommendation {
  id: string;
  type: 'plant' | 'design' | 'care';
  title: string;
  description: string;
  data: Record<string, any>;
  confidence: number;
  plantId?: string;
  projectId?: string;
}

export interface BalconyAnalysis {
  size: number;
  direction: string;
  lightConditions: {
    morning: number;
    afternoon: number;
    evening: number;
  };
  existingPlants: any[];
  recommendations: any[];
}

export interface CareAlert {
  id: string;
  plantId: string;
  type: 'water' | 'fertilize' | 'prune' | 'repot' | 'disease';
  title: string;
  description: string;
  urgency: 'low' | 'medium' | 'high';
  dueDate: Date;
  solutions: string[];
}

// Community Types
export interface Community {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  rules?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  members: CommunityMembership[];
  posts: Post[];
}

export interface CommunityMembership {
  id: string;
  userId: string;
  communityId: string;
  role: string;
  joinedAt: Date;
  user: User;
  community: Community;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  communityId: string;
  authorId: string;
  isPinned: boolean;
  views: number;
  createdAt: Date;
  updatedAt: Date;
  community: Community;
  author: User;
  comments: Comment[];
}

export interface Comment {
  id: string;
  content: string;
  postId?: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  author: User;
  reports: Report[];
}

export interface Report {
  id: string;
  type: string;
  reason: string;
  description?: string;
  targetId: string;
  reporterId: string;
  status: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  action?: string;
  createdAt: Date;
  updatedAt: Date;
  reporter: User;
}

// Utility Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  timestamp: string;
}

export interface FileUploadResult {
  filename: string;
  originalName: string;
  path: string;
  size: number;
  mimetype: string;
  url: string;
}

// Weather Types
export interface WeatherData {
  location: string;
  date: Date;
  temperature: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  weatherCondition: string;
  uvIndex?: number;
}

// Configuration Types
export interface GardeningPreferences {
  style: 'modern' | 'traditional' | 'minimalist' | 'tropical';
  maintenance: 'low' | 'medium' | 'high';
  preferredPlants: string[];
  budgetRange: 'low' | 'medium' | 'high';
  experience: 'beginner' | 'intermediate' | 'expert';
}

export interface BalconyConditions {
  direction: 'north' | 'south' | 'east' | 'west';
  size: number;
  floor: number;
  enclosure: 'open' | 'glass' | 'screen';
  shading: 'none' | 'partial' | 'full';
}

export interface PlantCareInfo {
  water: {
    frequency: string;
    amount: string;
    tips: string[];
  };
  light: {
    requirement: string;
    duration: string;
    tips: string[];
  };
  temperature: {
    ideal: string;
    tolerance: string;
    seasonal: string;
  };
  humidity: {
    ideal: string;
    tolerance: string;
  };
  soil: {
    type: string;
    ph: string;
    drainage: string;
  };
}