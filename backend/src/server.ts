import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './infrastructure/config/env';
import { logger } from './infrastructure/config/logger';
import { errorMiddleware } from './infrastructure/rest/middlewares/error.middleware';
import { generalRateLimit } from './infrastructure/rest/middlewares/rate-limit.middleware';
import {
  detectNoSQLInjection,
  detectSQLInjection,
  securityHeaders,
  securityLogger,
  validateRequest,
  validateRequestSize,
} from './infrastructure/rest/middlewares/security.middleware';
import { createAuthRoutes } from './infrastructure/rest/routes/auth.routes';
import { createTaskRoutes } from './infrastructure/rest/routes/task.routes';
import { createUserRoutes } from './infrastructure/rest/routes/user.routes';
import { TaskSocket } from './infrastructure/sockets/task.socket';
import { TaskReminderJob } from './infrastructure/jobs/task-reminder.job';
import path from 'path';

export class Server {
  private app: express.Application;
  private server: any;
  private io: SocketIOServer | null = null;
  private taskSocket: TaskSocket | null = null;
  private taskReminderJob: TaskReminderJob | null = null;

  constructor() {
    this.app = express();
  }

  private setupMiddleware(): void {
    // Trust proxy for accurate IP addresses (important for rate limiting)
    this.app.set('trust proxy', 1);

    // Global security middleware (applied to all routes)
    this.app.use(securityLogger); // Enhanced security logging
    this.app.use(generalRateLimit); // General rate limiting for all routes
    this.app.use(securityHeaders); // Additional security headers
    this.app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
    this.app.use(morgan('combined')); // Existing helmet configuration (enhanced with custom headers)
    this.app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:', 'https:'],
            fontSrc: ["'self'"],
            connectSrc: ["'self'"],
          },
        },
        crossOriginEmbedderPolicy: false, // Allow embedding for API responses
      })
    );

    // Enhanced CORS configuration
    this.app.use(
      cors({
        origin: (origin, callback) => {
          const allowedOrigins = env.allowedOrigins?.split(',');
          console.log('CORS check for origin:', origin, 'Allowed origins:', allowedOrigins);
          if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
          } else {
            callback(new Error('Not allowed by CORS'));
          }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      })
    );

    // Request validation and security middleware
    this.app.use(validateRequestSize); // Check request size limits
    this.app.use(detectSQLInjection); // SQL injection detection
    this.app.use(detectNoSQLInjection); // NoSQL injection detection
    this.app.use(validateRequest); // General request validation

    // Body parsing middleware with security limits
    this.app.use(
      express.json({
        limit: '512mb', // Reduced from 10mb for better security
        strict: true, // Only accept objects and arrays
      })
    );
    this.app.use(
      express.urlencoded({
        extended: true,
        limit: '512mb', // Reduced from 10mb for better security
        parameterLimit: 100, // Limit number of parameters
      })
    );

    // Enhanced request logging with security context
    this.app.use((req, _res, next) => {
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

  private setupSwaggerRoutes(): void {
    // Swagger configuration
    const swaggerOptions = {
      definition: {
        openapi: '3.0.0',
        info: {
          title: 'Task Management API',
          version: '1.0.0',
          description:
            'A comprehensive task management system API with authentication, file uploads, email notifications, and real-time updates.',
        },
        servers: [
          {
            url: `http://localhost:${env.port}/api`,
            description: 'Development server',
          },
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
            },
          },
        },
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
      apis: [
        './src/infrastructure/rest/routes/*.ts',
        './src/infrastructure/rest/controllers/*.ts',
        './src/infrastructure/documentation/*.ts',
      ],
    };

    const swaggerSpec = swaggerJsdoc(swaggerOptions);

    // Swagger UI endpoint - set up before global middleware to avoid interference
    this.app.use(
      '/api-docs',
      swaggerUi.serve,
      swaggerUi.setup(swaggerSpec, {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'Task Management API Documentation',
      })
    );
  }

  private setupRoutes(): void {
    // Initialize Socket.IO server
    this.server = createServer(this.app);
    console.log('Server: Creating SocketIO server...');

    try {
      this.io = new SocketIOServer(this.server, {
        cors: {
          origin: (origin, callback) => {
            console.log('SocketIO CORS check for origin:', origin);
            const allowedOrigins = env.allowedOrigins?.split(',') ?? [
              'http://localhost:8080',
              'http://localhost:3000',
              'http://localhost:5000',
            ];
            if (!origin || allowedOrigins.includes(origin)) {
              callback(null, true);
            } else {
              callback(new Error('Not allowed by CORS'));
            }
          },
          credentials: true,
        },
        pingTimeout: 60000,
        pingInterval: 25000,
      });

      console.log('Server: SocketIO server created successfully');
      console.log('Server: SocketIO server type:', this.io?.constructor?.name);
      console.log('Server: SocketIO server methods:', {
        hasOn: typeof this.io?.on === 'function',
        hasEmit: typeof this.io?.emit === 'function',
        hasTo: typeof this.io?.to === 'function',
        hasIn: typeof this.io?.in === 'function',
      });
    } catch (error) {
      console.error('Server: Failed to create SocketIO server:', error);
      this.io = null;
    }

    // Initialize TaskSocket with Socket.IO server
    if (this.io) {
      this.taskSocket = new TaskSocket(this.io);
    } else {
      console.error('Server: Cannot initialize TaskSocket - SocketIO server is null');
      this.taskSocket = new TaskSocket(); // Initialize without SocketIO server
    }

    // Initialize Task Reminder Job
    this.taskReminderJob = new TaskReminderJob(this.taskSocket);

    // Health check endpoint
    this.app.get('/health', (_req, res) => {
      res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: env.nodeEnv,
        docs: '/api-docs',
        socketConnected: this.taskSocket?.getOnlineUsersCount() ?? 0,
        reminderJobRunning: this.taskReminderJob?.getStatus().isRunning ?? false,
      });
    });
    this.app.use('/api/v1/auth', createAuthRoutes());
    this.app.use('/api/v1/tasks', createTaskRoutes());
    this.app.use('/api/v1/users', createUserRoutes());
    // 404 handler
    this.app.use('*', (_req, res) => {
      res.status(404).send({ message: 'Not found', data: {} });
    });
  }

  private setupErrorHandling(): void {
    this.app.use(errorMiddleware);
  }

  public async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.setupMiddleware();
        this.setupSwaggerRoutes(); // Set up Swagger UI after middleware
        this.setupRoutes();
        this.setupErrorHandling();

        this.server.listen(env.port, () => {
          logger.info(`Server running on port ${env.port} in ${env.nodeEnv} mode`);

          // Start the task reminder job
          if (this.taskReminderJob) {
            this.taskReminderJob.start();
            logger.info('Task reminder job started');
          }

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
    return new Promise(resolve => {
      // Stop the task reminder job
      if (this.taskReminderJob) {
        this.taskReminderJob.stop();
        logger.info('Task reminder job stopped');
      }

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
