import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './infrastructure/config/env';
import { logger } from './infrastructure/config/logger';
import { UserController } from './infrastructure/rest/controllers/user.controller';
import { errorMiddleware } from './infrastructure/rest/middlewares/error.middleware';
import {
  authRateLimit,
  generalRateLimit,
  strictRateLimit
} from './infrastructure/rest/middlewares/rate-limit.middleware';
import {
  detectNoSQLInjection,
  detectSQLInjection,
  securityHeaders,
  securityLogger,
  validateRequest,
  validateRequestSize
} from './infrastructure/rest/middlewares/security.middleware';
import { createUserRoutes } from './infrastructure/rest/routes/user.routes';

export class Server {
  private app: express.Application;
  private server: any;

  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    // Trust proxy for accurate IP addresses (important for rate limiting)
    this.app.set('trust proxy', 1);

    // Global security middleware (applied to all routes)
    this.app.use(securityLogger); // Enhanced security logging
    this.app.use(generalRateLimit); // General rate limiting for all routes
    this.app.use(securityHeaders); // Additional security headers

    // Existing helmet configuration (enhanced with custom headers)
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
          fontSrc: ["'self'"],
          connectSrc: ["'self'"],
        },
      },
      crossOriginEmbedderPolicy: false, // Allow embedding for API responses
    }));

    // Enhanced CORS configuration
    this.app.use(cors({
      origin: (origin, callback) => {
        const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    }));

    // Request validation and security middleware
    this.app.use(validateRequestSize); // Check request size limits
    this.app.use(detectSQLInjection); // SQL injection detection
    this.app.use(detectNoSQLInjection); // NoSQL injection detection
    this.app.use(validateRequest); // General request validation

    // Body parsing middleware with security limits
    this.app.use(express.json({
      limit: '1mb', // Reduced from 10mb for better security
      strict: true, // Only accept objects and arrays
    }));
    this.app.use(express.urlencoded({
      extended: true,
      limit: '1mb', // Reduced from 10mb for better security
      parameterLimit: 100, // Limit number of parameters
    }));

    // Enhanced request logging with security context
    this.app.use((req, res, next) => {
      logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        contentType: req.get('Content-Type'),
        contentLength: req.get('Content-Length'),
        referer: req.get('Referer'),
        origin: req.get('Origin'),
      });
      next();
    });
  }

  private setupRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: env.nodeEnv,
      });
    });

    // API routes with specific rate limiting
    const userController = new UserController(null, null); // TODO: Inject dependencies

    // Apply stricter rate limiting for authentication routes
    this.app.use('/api/v1/users/auth', authRateLimit);
    this.app.use('/api/v1/users/login', authRateLimit);
    this.app.use('/api/v1/users/register', strictRateLimit);

    this.app.use('/api/v1/users', createUserRoutes(userController));

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        error: 'Route not found',
      });
    });
  }

  private setupErrorHandling(): void {
    this.app.use(errorMiddleware);
  }

  public async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.server = this.app.listen(env.port, () => {
          logger.info(`Server running on port ${env.port} in ${env.nodeEnv} mode`);
          resolve();
        });

        this.server.on('error', (error: any) => {
          logger.error('Server error:', error);
          reject(error);
        });
      } catch (error) {
        logger.error('Failed to start server:', error);
        reject(error);
      }
    });
  }

  public async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          logger.info('Server stopped');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  public getApp(): express.Application {
    return this.app;
  }
}
