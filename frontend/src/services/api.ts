import axios from 'axios';
import { AuthResponse, LoginCredentials, RegisterData } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/user/profile');
    return response.data;
  },

  updateProfile: async (userData: any) => {
    const response = await api.put('/user/profile', userData);
    return response.data;
  },
};

// Plants API
export const plantsAPI = {
  getAll: async () => {
    const response = await api.get('/plants');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/plants/${id}`);
    return response.data;
  },

  search: async (query: string) => {
    const response = await api.get(`/plants/search?q=${query}`);
    return response.data;
  },

  getCategories: async () => {
    const response = await api.get('/plants/categories');
    return response.data;
  },
};

// Projects API
export const projectsAPI = {
  getAll: async () => {
    const response = await api.get('/projects');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  create: async (project: any) => {
    const response = await api.post('/projects', project);
    return response.data;
  },

  update: async (id: string, project: any) => {
    const response = await api.put(`/projects/${id}`, project);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  },

  addPlant: async (projectId: string, plantData: any) => {
    const response = await api.post(`/projects/${projectId}/plants`, plantData);
    return response.data;
  },

  removePlant: async (projectId: string, plantId: string) => {
    const response = await api.delete(`/projects/${projectId}/plants/${plantId}`);
    return response.data;
  },
};

// AI API
export const aiAPI = {
  analyzeBalcony: async (balconyInfo: any) => {
    const response = await api.post('/ai/analyze', balconyInfo);
    return response.data;
  },

  getRecommendations: async (params: any) => {
    const response = await api.get('/ai/recommendations', { params });
    return response.data;
  },

  diagnosePlant: async (plantData: any) => {
    const response = await api.post('/ai/diagnose', plantData);
    return response.data;
  },
};

// Community API
export const communityAPI = {
  getPosts: async (params?: any) => {
    const response = await api.get('/community/posts', { params });
    return response.data;
  },

  createPost: async (postData: any) => {
    const response = await api.post('/community/posts', postData);
    return response.data;
  },

  getComments: async (postId: string) => {
    const response = await api.get(`/community/posts/${postId}/comments`);
    return response.data;
  },

  createComment: async (postId: string, commentData: any) => {
    const response = await api.post(`/community/posts/${postId}/comments`, commentData);
    return response.data;
  },
};

export default api;