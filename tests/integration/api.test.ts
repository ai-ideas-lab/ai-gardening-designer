import request from 'supertest';
import app from '../src/server';

describe('AI Gardening Designer API', () => {
  test('Health check should return 200', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);
    
    expect(response.body.status).toBe('ok');
    expect(response.body.database).toBe('connected');
  });

  test('Plants endpoint should return data', async () => {
    const response = await request(app)
      .get('/api/plants')
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
  });

  test('User profile endpoint should return data', async () => {
    const response = await request(app)
      .get('/api/users/profile')
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe('Demo User');
  });
});