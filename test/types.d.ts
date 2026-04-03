// Test type definitions for Prisma mocks
export const prismaMock = {
  plant: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
    delete: jest.fn(),
  },
  project: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  community: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  post: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  reminder: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  communityMembership: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  report: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  upload: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  activity: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  purchase: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  comment: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  recommendation: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  $connect: jest.fn(),
  $disconnect: jest.fn(),
  $queryRaw: jest.fn(),
  $executeRaw: jest.fn(),
};

export interface PrismaMock {
  plant: {
    findMany: jest.Mock;
    findUnique: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
  user: {
    findUnique: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    findMany: jest.Mock;
    delete: jest.Mock;
  };
  project: {
    findMany: jest.Mock;
    findUnique: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
  community: {
    findMany: jest.Mock;
    findUnique: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
  post: {
    findMany: jest.Mock;
    findUnique: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
  reminder: {
    findMany: jest.Mock;
    findUnique: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
  communityMembership: {
    findMany: jest.Mock;
    findUnique: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
  report: {
    findMany: jest.Mock;
    findUnique: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
  upload: {
    findMany: jest.Mock;
    findUnique: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
  activity: {
    findMany: jest.Mock;
    findUnique: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
  purchase: {
    findMany: jest.Mock;
    findUnique: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
  comment: {
    findMany: jest.Mock;
    findUnique: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
  recommendation: {
    findMany: jest.Mock;
    findUnique: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
  $connect: jest.Mock;
  $disconnect: jest.Mock;
  $queryRaw: jest.Mock;
  $executeRaw: jest.Mock;
}

// Mock utility functions
export const createMockPlant = (overrides: any = {}) => ({
  id: 'test-plant-id',
  name: 'Test Plant',
  scientificName: 'Testus Plantus',
  commonNames: JSON.stringify(['Common Name']),
  category: 'indoor',
  light: 'partial-sun',
  water: 'moderate',
  temperature: JSON.stringify({ min: 18, max: 25 }),
  humidity: JSON.stringify({ min: 40, max: 60 }),
  soil: 'well-draining',
  growthRate: 'medium',
  matureSize: JSON.stringify({ height: 30, width: 20 }),
  difficulty: 'easy',
  description: 'A test plant for testing purposes',
  careTips: JSON.stringify(['Water regularly', 'Place in bright indirect light']),
  toxicity: 'non-toxic',
  benefits: JSON.stringify(['Air purification', 'Easy care']),
  imageUrl: 'https://example.com/plant.jpg',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
});

export const createMockUser = (overrides: any = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  username: 'testuser',
  password: 'hashedpassword',
  name: 'Test User',
  avatar: 'https://example.com/avatar.jpg',
  location: 'Test City',
  balconyType: 'small',
  balconySize: 10,
  balconyDirection: 'south',
  preferences: JSON.stringify({
    skillLevel: 'beginner',
    careTime: 2,
    budget: 100,
    style: 'modern'
  }),
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
});

export const createMockProject = (overrides: any = {}) => ({
  id: 'test-project-id',
  name: 'Test Garden Project',
  description: 'A test garden project',
  status: 'planning',
  balconyJson: JSON.stringify({
    size: 10,
    direction: 'south',
    sunlight: 'partial',
    style: 'modern'
  }),
  designJson: JSON.stringify({
    layout: 'grid',
    plants: [],
    features: []
  }),
  location: 'Test Location',
  area: 10,
  budget: 500,
  startDate: new Date(),
  endDate: null,
  userId: 'test-user-id',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
});