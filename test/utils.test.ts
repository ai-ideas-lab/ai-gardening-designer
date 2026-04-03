import { prismaMock, createMockPlant, createMockUser, createMockProject } from './types';
import { Request, Response, NextFunction } from 'express';

// Test utility functions for common test scenarios
export const createMockRequest = (body: any = {}, params: any = {}, query: any = {}): Request => {
  return {
    body,
    params,
    query,
    headers: {
      'content-type': 'application/json',
    },
  } as unknown as Request;
};

export const createMockResponse = (): Response => {
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    end: jest.fn(),
    locals: {},
  };
  return res as Response;
};

export const createMockNext = (): NextFunction => {
  return jest.fn() as NextFunction;
};

// Mock Prisma utilities for testing
export const setupPrismaMocks = () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Clean up after tests
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Common mock data setup
  const setupPlantMocks = (plants: any[] = []) => {
    prismaMock.plant.findMany.mockResolvedValue(plants);
    prismaMock.plant.findUnique.mockImplementation((args: any) => {
      return Promise.resolve(plants.find(p => p.id === args.where.id));
    });
  };

  const setupUserMocks = (users: any[] = []) => {
    prismaMock.user.findMany.mockResolvedValue(users);
    prismaMock.user.findUnique.mockImplementation((args: any) => {
      return Promise.resolve(users.find(u => u.id === args.where.id || u.email === args.where.email));
    });
  };

  const setupProjectMocks = (projects: any[] = []) => {
    prismaMock.project.findMany.mockResolvedValue(projects);
    prismaMock.project.findUnique.mockImplementation((args: any) => {
      return Promise.resolve(projects.find(p => p.id === args.where.id));
    });
  };

  return {
    setupPlantMocks,
    setupUserMocks,
    setupProjectMocks,
    prismaMock,
  };
};

// Test assertion helpers
export const assertSuccessResponse = (response: any, expectedKeys: string[] = ['success', 'data', 'message']) => {
  expect(response.success).toBe(true);
  expect(response.message).toBeDefined();
  expectedKeys.forEach(key => {
    expect(response.data).toHaveProperty(key);
  });
};

export const assertErrorResponse = (response: any, expectedStatus: number = 500) => {
  expect(response.success).toBe(false);
  expect(response.error).toBeDefined();
  expect(response.status).toBe(expectedStatus);
};

// AI recommendation testing helpers
export const createTestPreferences = (overrides: any = {}) => ({
  balconySize: 10,
  balconyDirection: 'south',
  balconyType: 'small',
  skillLevel: 'beginner',
  careTime: 2,
  budget: 100,
  style: 'modern',
  ...overrides
});

// Error testing helpers
export const createTestError = (message: string, status: number = 500) => {
  const error = new Error(message);
  (error as any).status = status;
  return error;
};

// Database testing helpers
export const createTestDatabaseRecord = (type: 'plant' | 'user' | 'project', overrides: any = {}) => {
  switch (type) {
    case 'plant':
      return createMockPlant(overrides);
    case 'user':
      return createMockUser(overrides);
    case 'project':
      return createMockProject(overrides);
    default:
      throw new Error(`Unknown record type: ${type}`);
  }
};

// Integration testing helpers
export const createTestAuthHeaders = (token: string = 'test-token') => ({
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
});

export const createTestFormData = (data: Record<string, any>) => {
  const form = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    form.append(key, typeof value === 'string' ? value : JSON.stringify(value));
  });
  return form;
};

// Performance testing helpers
export const measureExecutionTime = async (fn: () => Promise<any>) => {
  const start = Date.now();
  const result = await fn();
  const end = Date.now();
  return {
    result,
    executionTime: end - start,
  };
};

export const assertExecutionTime = (executionTime: number, maxTime: number) => {
  expect(executionTime).toBeLessThan(maxTime);
};