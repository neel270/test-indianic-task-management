# Backend Security Implementation

This document outlines the comprehensive security features implemented in the backend server.

## Security Features Implemented

### 1. Rate Limiting
- **General Rate Limiting**: 100 requests per 15-minute window for all endpoints
- **Authentication Rate Limiting**: 5 attempts per 15-minute window for auth endpoints
- **Strict Rate Limiting**: 20 requests per 15-minute window for sensitive operations
- **In-Memory Storage**: Custom implementation with configurable limits

### 2. Security Headers
- **Helmet Integration**: Enhanced security headers configuration
- **Custom Security Headers**:
  - `X-Frame-Options: DENY` - Prevents clickjacking
  - `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
  - `X-XSS-Protection: 1; mode=block` - Enables XSS filtering
  - `Referrer-Policy: strict-origin-when-cross-origin` - Controls referrer information
  - `Content-Security-Policy` - Basic CSP configuration
  - `Permissions-Policy` - Restricts browser features

### 3. CORS Configuration
- **Enhanced CORS Setup**:
  - Configurable allowed origins via environment variables
  - Support for credentials
  - Specific allowed methods and headers
  - Origin validation callback

### 4. Request Validation & Security
- **Request Size Validation**: 1MB limit (reduced from 10MB for security)
- **SQL Injection Detection**: Pattern-based detection for common SQL injection attempts
- **NoSQL Injection Detection**: Pattern-based detection for NoSQL injection attempts
- **General Request Validation**: Detection of suspicious patterns (XSS, directory traversal, etc.)

### 5. Enhanced Logging
- **Security-Focused Logging**: Detailed logging of security-relevant events
- **Slow Request Detection**: Logs requests taking longer than 5 seconds
- **Error Response Logging**: Logs all 4xx and 5xx responses
- **Request Context Logging**: IP, User-Agent, Content-Type, Referer, Origin

## Middleware Architecture

### Rate Limiting Middleware (`rate-limit.middleware.ts`)
```typescript
// Pre-configured rate limiters
export const generalRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
});

export const authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // Stricter for auth
});

export const strictRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 20,
});
```

### Security Middleware (`security.middleware.ts`)
```typescript
// Security functions
export const securityHeaders = (req, res, next) => { ... };
export const detectSQLInjection = (req, res, next) => { ... };
export const detectNoSQLInjection = (req, res, next) => { ... };
export const validateRequestSize = (req, res, next) => { ... };
```

## Configuration

### Environment Variables
```bash
# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# Rate Limiting (configurable via middleware options)
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
```

### Server Configuration
```typescript
// In server.ts
private setupMiddleware(): void {
  // Trust proxy for accurate IP detection
  this.app.set('trust proxy', 1);

  // Apply security middleware in order
  this.app.use(securityLogger);
  this.app.use(generalRateLimit);
  this.app.use(securityHeaders);
  this.app.use(helmet({...}));
  this.app.use(cors({...}));
  this.app.use(validateRequestSize);
  this.app.use(detectSQLInjection);
  this.app.use(detectNoSQLInjection);
  this.app.use(validateRequest);
}
```

## Security Endpoints

### Authentication Routes (Stricter Limits)
- `/api/v1/users/auth/*` - 5 requests per 15 minutes
- `/api/v1/users/login` - 5 requests per 15 minutes
- `/api/v1/users/register` - 20 requests per 15 minutes

### General API Routes
- All other routes: 100 requests per 15 minutes

## Monitoring & Alerting

### Security Events Logged
- Rate limit violations
- Suspicious request patterns
- SQL/NoSQL injection attempts
- Slow requests (>5 seconds)
- Error responses (4xx, 5xx)
- Authentication attempts

### Response Headers
Rate limiting responses include standard headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1634567890
```

## Best Practices Implemented

1. **Defense in Depth**: Multiple layers of security controls
2. **Fail-Safe Defaults**: Secure configuration by default
3. **Principle of Least Privilege**: Minimal required permissions
4. **Input Validation**: Comprehensive request validation
5. **Logging**: Detailed security event logging
6. **Rate Limiting**: Protection against abuse and DoS attacks

## Testing

Run the security test suite:
```typescript
import { testApp } from './test-security';

// Test endpoints available:
// GET /test - General security test
// POST /test-auth - Authentication rate limiting
// POST /test-strict - Strict rate limiting
// POST /test-sql-injection - SQL injection detection
// POST /test-nosql-injection - NoSQL injection detection
// POST /test-request-size - Request size validation
```

## Future Enhancements

- Redis-based rate limiting for distributed systems
- Advanced threat detection with ML
- Real-time security monitoring dashboard
- Automated security testing in CI/CD pipeline
- Integration with security information and event management (SIEM) systems
