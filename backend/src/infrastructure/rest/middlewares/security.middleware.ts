import { NextFunction, Request, Response } from 'express';
import { logger } from '../../config/logger';

// Security headers middleware
export const securityHeaders = (_req: Request, res: Response, next: NextFunction) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Content Security Policy (basic)
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'"
  );

  // Permissions policy (restrict features)
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=(), payment=(), usb=()'
  );

  next();
};

// Request validation middleware
export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  // Skip validation for Swagger UI assets and main docs page
  const swaggerUiPaths = [
    '/api-docs/',
    '/api-docs/swagger-ui.css',
    '/api-docs/swagger-ui-bundle.js',
    '/api-docs/swagger-ui-standalone-preset.js',
    '/api-docs/swagger-ui-init.js',
  ];

  if (swaggerUiPaths.some(path => req.url === path || req.url.startsWith(path))) {
    return next();
  }

  // Check for suspicious patterns in request body and query parameters only
  // (excluding headers to avoid false positives from User-Agent and other legitimate headers)
  const suspiciousPatterns = [
    /(\.\.|\/\*|\*\/)/, // Directory traversal in request data
    /<script[^>]*>.*?<\/script>/gi, // Script tags in request body
    /javascript:/gi, // JavaScript protocol in request data
    /vbscript:/gi, // VBScript protocol in request data
    /onload\s*=/gi, // Event handlers in request data
    /onerror\s*=/gi, // Error handlers in request data
  ];

  // Only check body, query, and params - not headers to avoid false positives
  const requestData = JSON.stringify({
    body: req.body,
    query: req.query,
    params: req.params,
  });

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(requestData)) {
      logger.warn('Suspicious request pattern detected', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.url,
        method: req.method,
        pattern: pattern.source,
        matchedContent: 'Request body/query contains potentially malicious content',
      });

      return res.status(400).json({
        success: false,
        error: 'Invalid request format detected',
      });
    }
  }
  next();
};

// Request size validation middleware
export const validateRequestSize = (req: Request, res: Response, next: NextFunction) => {
  const contentLength = parseInt(req.get('content-length') || '0');
  const maxSize = 10 * 1024 * 1024; // 10MB limit

  if (contentLength > maxSize) {
    logger.warn('Request size exceeded limit', {
      ip: req.ip,
      contentLength,
      maxSize,
      url: req.url,
    });

    return res.status(413).json({
      success: false,
      error: 'Request entity too large',
    });
  }

  next();
};

// SQL injection detection middleware
export const detectSQLInjection = (req: Request, res: Response, next: NextFunction) => {
  // Skip validation for Swagger UI assets and main docs page
  const swaggerUiPaths = [
    '/api-docs/',
    '/api-docs/swagger-ui.css',
    '/api-docs/swagger-ui-bundle.js',
    '/api-docs/swagger-ui-standalone-preset.js',
    '/api-docs/swagger-ui-init.js',
  ];

  if (swaggerUiPaths.some(path => req.url === path || req.url.startsWith(path))) {
    return next();
  }

  const sqlPatterns = [
    /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)/gi,
    /(--|#|\/\*|\*\/)/g,
    /(\bor\b\s+\d+\s*=\s*\d+)/gi,
    /(\band\b\s+\d+\s*=\s*\d+)/gi,
    /('|(\\')|(;))/g,
  ];

  const checkValue = (value: any): boolean => {
    if (typeof value === 'string') {
      return sqlPatterns.some(pattern => pattern.test(value));
    }
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(checkValue);
    }
    return false;
  };

  const requestData = {
    body: req.body,
    query: req.query,
    params: req.params,
  };

  if (checkValue(requestData)) {
    logger.warn('Potential SQL injection detected', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
      method: req.method,
    });

    return res.status(400).json({
      success: false,
      error: 'Invalid request parameters',
    });
  }

  next();
};

// NoSQL injection detection middleware
export const detectNoSQLInjection = (req: Request, res: Response, next: NextFunction) => {
  // Skip validation for Swagger UI assets and main docs page
  const swaggerUiPaths = [
    '/api-docs/',
    '/api-docs/swagger-ui.css',
    '/api-docs/swagger-ui-bundle.js',
    '/api-docs/swagger-ui-standalone-preset.js',
    '/api-docs/swagger-ui-init.js',
  ];

  if (swaggerUiPaths.some(path => req.url === path || req.url.startsWith(path))) {
    return next();
  }

  const nosqlPatterns = [
    /(\$where|\$ne|\$gt|\$lt|\$gte|\$lte)/gi,
    /(\$regex|\$or|\$and|\$exists|\$type)/gi,
    /(\$nin|\$in|\$all|\$size|\$elemMatch)/gi,
  ];

  const checkValue = (value: any): boolean => {
    if (typeof value === 'string') {
      return nosqlPatterns.some(pattern => pattern.test(value));
    }
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(checkValue);
    }
    return false;
  };

  const requestData = {
    body: req.body,
    query: req.query,
    params: req.params,
  };

  if (checkValue(requestData)) {
    logger.warn('Potential NoSQL injection detected', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
      method: req.method,
    });

    return res.status(400).json({
      success: false,
      error: 'Invalid request parameters',
    });
  }

  next();
};

// Enhanced logging middleware for security events
export const securityLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  // Log security-relevant request details
  const securityInfo = {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    method: req.method,
    url: req.url,
    referer: req.get('Referer'),
    origin: req.get('Origin'),
    contentType: req.get('Content-Type'),
    contentLength: req.get('Content-Length'),
  };

  // Log suspicious activities
  if (req.path.includes('admin') || req.path.includes('login')) {
    logger.info('Security-sensitive endpoint accessed', securityInfo);
  }

  // Store original send method for logging
  const originalSend = res.send.bind(res);
  res.send = function (body: any) {
    const responseTime = Date.now() - startTime;

    if (responseTime > 5000) {
      // Log slow requests
      logger.warn('Slow request detected', {
        ...securityInfo,
        responseTime,
        statusCode: res.statusCode,
      });
    }

    if (res.statusCode >= 400) {
      // Log error responses
      logger.warn('Error response', {
        ...securityInfo,
        responseTime,
        statusCode: res.statusCode,
      });
    }

    return originalSend(body);
  };

  next();
};
