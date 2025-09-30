import request from 'supertest';
import { Server } from '../../src/server';

describe('User API Integration Tests', () => {
  let server: Server;

  beforeAll(async () => {
    server = new Server();
    await server.start();
  });

  afterAll(async () => {
    await server.stop();
  });

  describe('POST /api/v1/users/register', () => {
    it('should register a new user', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'user'
      };

      const response = await request(server.getApp())
        .post('/api/v1/users/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.email).toBe(userData.email);
    });

    it('should return error for invalid data', async () => {
      const invalidData = {
        name: '',
        email: 'invalid-email',
        password: '123'
      };

      const response = await request(server.getApp())
        .post('/api/v1/users/register')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/users/login', () => {
    it('should login user successfully', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(server.getApp())
        .post('/api/v1/users/login')
        .send(credentials)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
    });

    it('should return error for invalid credentials', async () => {
      const invalidCredentials = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const response = await request(server.getApp())
        .post('/api/v1/users/login')
        .send(invalidCredentials)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
