import request from 'supertest';
import { Server } from '../../src/server';

describe('User Flow E2E Tests', () => {
  let server: Server;
  let accessToken: string;
  let refreshToken: string;
  let userId: string;

  beforeAll(async () => {
    server = new Server();
    await server.start();
  });

  afterAll(async () => {
    await server.stop();
  });

  describe('Complete User Flow', () => {
    it('should complete full user registration and login flow', async () => {
      // Step 1: Register a new user
      const registerData = {
        name: 'E2E Test User',
        email: 'e2e@example.com',
        password: 'password123',
        role: 'user'
      };

      const registerResponse = await request(server.getApp())
        .post('/api/v1/users/register')
        .send(registerData)
        .expect(201);

      expect(registerResponse.body.success).toBe(true);
      expect(registerResponse.body.data).toHaveProperty('id');
      expect(registerResponse.body.data.email).toBe(registerData.email);

      userId = registerResponse.body.data.id;

      // Step 2: Login with the registered user
      const loginData = {
        email: registerData.email,
        password: registerData.password
      };

      const loginResponse = await request(server.getApp())
        .post('/api/v1/users/login')
        .send(loginData)
        .expect(200);

      expect(loginResponse.body.success).toBe(true);
      expect(loginResponse.body.data).toHaveProperty('accessToken');
      expect(loginResponse.body.data).toHaveProperty('refreshToken');
      expect(loginResponse.body.data.user).toHaveProperty('id');

      accessToken = loginResponse.body.data.accessToken;
      refreshToken = loginResponse.body.data.refreshToken;

      // Step 3: Access protected route with token
      const profileResponse = await request(server.getApp())
        .get('/api/v1/users/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(profileResponse.body.success).toBe(true);
      expect(profileResponse.body.data).toHaveProperty('id');

      // Step 4: Test token refresh
      const refreshResponse = await request(server.getApp())
        .post('/api/v1/users/refresh')
        .set('Authorization', `Bearer ${refreshToken}`)
        .expect(200);

      expect(refreshResponse.body.success).toBe(true);
      expect(refreshResponse.body.data).toHaveProperty('accessToken');
    });

    it('should handle invalid token gracefully', async () => {
      const response = await request(server.getApp())
        .get('/api/v1/users/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid or expired token');
    });
  });
});
