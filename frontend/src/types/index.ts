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
  preferences?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Plant {
  id: string;
  name: string;
  scientificName?: string;
  commonNames?: string;
  category: string;
  light: string;
  water: string;
  temperature?: string;
  humidity?: string;
  soil?: string;
  growthRate?: string;
  matureSize?: string;
  difficulty: number;
  description?: string;
  careTips?: string;
  toxicity?: string;
  benefits?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'planning' | 'in-progress' | 'completed';
  balconyJson?: string;
  designJson?: string;
  location?: string;
  area?: number;
  budget?: number;
  startDate?: Date;
  endDate?: Date;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectPlant {
  id: string;
  projectId: string;
  plantId: string;
  quantity: number;
  position?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Activity {
  id: string;
  type: string;
  title: string;
  description?: string;
  data?: string;
  projectId?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Reminder {
  id: string;
  type: 'water' | 'fertilize' | 'prune' | 'repot';
  title: string;
  description?: string;
  dueDate: Date;
  completed: boolean;
  projectId?: string;
  plantId?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AIRecommendation {
  id: string;
  type: 'plant' | 'design' | 'care';
  title: string;
  description: string;
  data?: string;
  confidence: number;
  plantId?: string;
  projectId?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  username?: string;
  name?: string;
  location?: string;
  balconyType?: string;
  balconySize?: number;
  balconyDirection?: string;
}

export interface BalconyInfo {
  type: string;
  size: number;
  direction: string;
  sunlight: string;
  budget: number;
}

export interface PlantRecommendation {
  id: string;
  name: string;
  reason: string;
  difficulty: number;
  benefits: string[];
  imageUrl?: string;
}