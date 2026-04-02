import request from 'supertest';
import app from '../src/server';

describe('API Health Endpoints', () => {
  test('GET /health should return 200 with status ok', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);
    
    expect(response.body.status).toBe('ok');
    expect(response.body.database).toBe('connected');
    expect(response.body.timestamp).toBeDefined();
    expect(typeof response.body.timestamp).toBe('string');
  });

  test('GET /health should include environment info', async () => {
    process.env.NODE_ENV = 'test';
    
    const response = await request(app)
      .get('/health')
      .expect(200);
    
    expect(response.body.environment).toBe('test');
    
    // Reset environment
    delete process.env.NODE_ENV;
  });
});

describe('API Plants Endpoints', () => {
  let testPlantId: string;

  test('GET /api/plants should return plants array', async () => {
    const response = await request(app)
      .get('/api/plants')
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.message).toBe('Plants retrieved successfully');
    
    // Check if plants have required fields
    if (response.body.data.length > 0) {
      const plant = response.body.data[0];
      expect(plant).toHaveProperty('id');
      expect(plant).toHaveProperty('name');
      expect(plant).toHaveProperty('scientificName');
      expect(plant).toHaveProperty('category');
      expect(plant).toHaveProperty('difficulty');
    }
  });

  test('GET /api/plants should accept query filters', async () => {
    const response = await request(app)
      .get('/api/plants')
      .query({ category: 'indoor', difficulty: '1' })
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    
    // Filtered plants should match the criteria
    response.body.data.forEach((plant: any) => {
      expect(plant.category).toBe('indoor');
      expect(plant.difficulty).toBe(1);
    });
  });

  test('GET /api/plants/:id should return specific plant', async () => {
    // First get a plant to use its ID
    const plantsResponse = await request(app)
      .get('/api/plants')
      .expect(200);
    
    const testPlant = plantsResponse.body.data[0];
    testPlantId = testPlant.id;

    const response = await request(app)
      .get(`/api/plants/${testPlantId}`)
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
    expect(response.body.data.id).toBe(testPlantId);
    expect(response.body.data.name).toBe(testPlant.name);
    expect(response.body.message).toBe('Plant retrieved successfully');
  });

  test('GET /api/plants/:id should return 404 for non-existent plant', async () => {
    const response = await request(app)
      .get('/api/plants/non-existent-id')
      .expect(404);
    
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('Plant not found');
  });
});

describe('API Projects Endpoints', () => {
  let testProjectId: string;

  test('GET /api/projects should return projects array', async () => {
    const response = await request(app)
      .get('/api/projects')
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.message).toBe('Projects retrieved successfully');
    
    // Check if projects have required fields
    if (response.body.data.length > 0) {
      const project = response.body.data[0];
      expect(project).toHaveProperty('id');
      expect(project).toHaveProperty('name');
      expect(project).toHaveProperty('description');
      expect(project).toHaveProperty('status');
      expect(project).toHaveProperty('createdAt');
    }
  });

  test('POST /api/projects should create new project', async () => {
    const newProject = {
      name: 'Test Project',
      description: 'A test project for unit testing',
      location: 'Test Location',
      area: 10,
      userId: 'test-user-id'
    };

    const response = await request(app)
      .post('/api/projects')
      .send(newProject)
      .expect(201);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
    expect(response.body.data.name).toBe(newProject.name);
    expect(response.body.data.description).toBe(newProject.description);
    expect(response.body.message).toBe('Project created successfully');
    
    testProjectId = response.body.data.id;
  });

  test('GET /api/projects/:id should return specific project', async () => {
    const response = await request(app)
      .get(`/api/projects/${testProjectId}`)
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
    expect(response.body.data.id).toBe(testProjectId);
    expect(response.body.data.name).toBe('Test Project');
    expect(response.body.message).toBe('Project retrieved successfully');
  });

  test('PUT /api/projects/:id should update project', async () => {
    const updateData = {
      name: 'Updated Test Project',
      description: 'Updated description',
      status: 'in-progress'
    };

    const response = await request(app)
      .put(`/api/projects/${testProjectId}`)
      .send(updateData)
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe(updateData.name);
    expect(response.body.data.description).toBe(updateData.description);
    expect(response.body.data.status).toBe(updateData.status);
  });

  test('DELETE /api/projects/:id should delete project', async () => {
    const response = await request(app)
      .delete(`/api/projects/${testProjectId}`)
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Project deleted successfully');
  });

  test('GET /api/projects/:id should return 404 for deleted project', async () => {
    const response = await request(app)
      .get(`/api/projects/${testProjectId}`)
      .expect(404);
    
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('Project not found');
  });
});

describe('API Users Endpoints', () => {
  test('GET /api/users/profile should return user profile', async () => {
    const response = await request(app)
      .get('/api/users/profile')
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
    expect(response.body.data.name).toBe('Demo User');
    expect(response.body.data.email).toBe('demo@example.com');
    expect(response.body.data.preferences).toBeDefined();
    expect(response.body.message).toBe('User profile retrieved successfully');
  });
});

describe('API AI Analysis Endpoints', () => {
  test('POST /api/ai/analyze should return analysis for balcony-design', async () => {
    const requestBody = {
      type: 'balcony-design',
      data: {
        balconySize: 10,
        balconyDirection: 'south',
        location: 'Beijing'
      }
    };

    const response = await request(app)
      .post('/api/ai/analyze')
      .send(requestBody)
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
    expect(response.body.data.type).toBe('balcony-design');
    expect(response.body.data.confidence).toBeDefined();
    expect(response.body.data.recommendations).toBeDefined();
    expect(Array.isArray(response.body.data.recommendations)).toBe(true);
    expect(response.body.data.suggestedPlants).toBeDefined();
    expect(response.body.message).toBe('AI analysis completed');
  });

  test('POST /api/ai/analyze should return analysis for plant-care', async () => {
    const requestBody = {
      type: 'plant-care',
      data: {
        plantId: 'test-plant-id',
        careType: 'watering'
      }
    };

    const response = await request(app)
      .post('/api/ai/analyze')
      .send(requestBody)
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.type).toBe('plant-care');
    expect(response.body.data.recommendations).toBeDefined();
    expect(response.body.data.insights).toBeDefined();
  });

  test('POST /api/ai/analyze should return analysis for plant-selection', async () => {
    const requestBody = {
      type: 'plant-selection',
      data: {
        experience: 'beginner',
        space: 'balcony',
        budget: 'medium'
      }
    };

    const response = await request(app)
      .post('/api/ai/analyze')
      .send(requestBody)
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.type).toBe('plant-selection');
    expect(response.body.data.suggestedPlants).toBeDefined();
    expect(Array.isArray(response.body.data.suggestedPlants)).toBe(true);
  });

  test('POST /api/ai/analyze should handle unknown type gracefully', async () => {
    const requestBody = {
      type: 'unknown-type',
      data: {}
    };

    const response = await request(app)
      .post('/api/ai/analyze')
      .send(requestBody)
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.type).toBe('general');
  });
});

describe('API Error Handling', () => {
  test('Should return 404 for non-existent endpoints', async () => {
    const response = await request(app)
      .get('/api/non-existent-endpoint')
      .expect(404);
    
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('Not Found');
    expect(response.body.message).toContain('not found');
  });

  test('Should handle invalid JSON body', async () => {
    const response = await request(app)
      .post('/api/projects')
      .set('Content-Type', 'application/json')
      .send('invalid json content')
      .expect(400);
  });

  test('Should handle missing required fields', async () => {
    const incompleteProject = {
      name: 'Test Project'
      // Missing required fields
    };

    const response = await request(app)
      .post('/api/projects')
      .send(incompleteProject)
      .expect(500); // Prisma will throw error for missing required fields
    
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBeDefined();
  });
});

describe('API Response Format Consistency', () => {
  test('All successful responses should have consistent structure', async () => {
    const endpoints = [
      { method: 'get', url: '/health' },
      { method: 'get', url: '/api/plants' },
      { method: 'get', url: '/api/projects' },
      { method: 'get', url: '/api/users/profile' }
    ];

    for (const endpoint of endpoints) {
      const response = await request(app)[endpoint.method](endpoint.url).expect(200);
      
      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('timestamp');
      expect(typeof response.body.timestamp).toBe('string');
      expect(response.body.success).toBe(true);
    }
  });

  test('All error responses should have consistent structure', async () => {
    const endpoints = [
      { method: 'get', url: '/api/plants/non-existent' },
      { method: 'post', url: '/api/ai/analyze', send: { type: 'invalid' } }
    ];

    for (const endpoint of endpoints) {
      const response = await request(app)[endpoint.method](endpoint.url)
        .send(endpoint.send || {})
        .expect(400);
      
      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('error');
    }
  });
});