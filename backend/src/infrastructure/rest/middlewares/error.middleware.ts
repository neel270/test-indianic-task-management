import { NextFunction, Request, Response } from 'express';
import { logger } from '../../config/logger';

export const errorMiddleware = (
  error: Error & { status?: number },
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error('Unhandled error:', error);

  res.status(error.status || 500).json({
    success: false,
    error: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
};
