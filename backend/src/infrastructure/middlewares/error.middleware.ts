import { NextFunction, Request, Response } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
  errors?: any[];
}

export class ErrorMiddleware {
  // Global error handler
  handle = (error: AppError, req: Request, res: Response, next: NextFunction): void => {
    let statusCode = error.statusCode || 500;
    let message = error.message || 'Internal Server Error';
    let isOperational = error.isOperational || false;

    // Mongoose validation error
    if (error.name === 'ValidationError') {
      statusCode = 400;
      message = 'Validation Error';
      isOperational = true;
    }

    // Mongoose duplicate key error
    if ((error as any).code === 11000) {
      statusCode = 400;
      message = 'Duplicate field value';
      isOperational = true;
    }

    // JWT errors
    if (error.name === 'JsonWebTokenError') {
      statusCode = 401;
      message = 'Invalid token';
      isOperational = true;
    }

    if (error.name === 'TokenExpiredError') {
      statusCode = 401;
      message = 'Token expired';
      isOperational = true;
    }

    // Development vs Production error response
    const errorResponse = {
      success: false,
      message,
      ...(process.env.NODE_ENV === 'development' && {
        error: error.message,
        stack: error.stack
      }),
      ...(error.errors && { errors: error.errors })
    };

    // Log error for monitoring (in production, use proper logging service)
    if (process.env.NODE_ENV === 'production') {
      console.error('Production Error:', {
        message: error.message,
        statusCode,
        isOperational,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
    }

    res.status(statusCode).json(errorResponse);
  };

  // 404 handler
  notFound = (req: Request, res: Response, next: NextFunction): void => {
    const error: AppError = new Error(`Not found - ${req.originalUrl}`);
    error.statusCode = 404;
    error.isOperational = true;
    next(error);
  };

  // Async error wrapper
  catchAsync = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  };

  // Create operational error
  createError = (message: string, statusCode: number = 500): AppError => {
    const error: AppError = new Error(message);
    error.statusCode = statusCode;
    error.isOperational = true;
    return error;
  };
}

export const errorMiddleware = new ErrorMiddleware();
