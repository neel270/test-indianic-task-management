import dotenv from 'dotenv';
import path from 'path';
import { logger } from './infrastructure/config';
import { initializeDatabase } from './infrastructure/database';
import { Server } from './server';

// Load environment variables from root .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function bootstrap(): Promise<void> {
  try {
    // Initialize database
    await initializeDatabase();

    // Start server
    const server = new Server();
    await server.start();

    logger.info('Application started successfully');
  } catch (error) {
    logger.error('Failed to start application:', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', error => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start the application
bootstrap().catch(error => {
  logger.error('Failed to start application:', error);
  process.exit(1);
});
