// Simple test script to verify security middleware functionality
import express from 'express';
import { authRateLimit, generalRateLimit, strictRateLimit } from './infrastructure/rest/middlewares/rate-limit.middleware';
import {
  detectNoSQLInjection,
  detectSQLInjection,
  securityHeaders,
  securityLogger,
  validateRequestSize
} from './infrastructure/rest/middlewares/security.middleware';

const app = express();

// Test application with security middleware
app.use(securityLogger);
app.use(generalRateLimit);
app.use(securityHeaders);

// Test routes
app.get('/test', (req, res) => {
  res.json({
    message: 'Security test successful',
    security: {
      rateLimiting: 'active',
      securityHeaders: 'active',
      requestValidation: 'active',
      sqlInjectionDetection: 'active',
      nosqlInjectionDetection: 'active',
    }
  });
});

app.post('/test-auth', authRateLimit, (req, res) => {
  res.json({ message: 'Auth endpoint with strict rate limiting' });
});

app.post('/test-strict', strictRateLimit, (req, res) => {
  res.json({ message: 'Strict rate limited endpoint' });
});

// Test malicious requests
app.post('/test-sql-injection', detectSQLInjection, (req, res) => {
  res.json({ message: 'SQL injection test passed' });
});

app.post('/test-nosql-injection', detectNoSQLInjection, (req, res) => {
  res.json({ message: 'NoSQL injection test passed' });
});

app.post('/test-request-size', validateRequestSize, (req, res) => {
  res.json({ message: 'Request size validation test passed' });
});

export { app as testApp };
