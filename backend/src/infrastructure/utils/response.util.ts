import { Response } from 'express';
import { APP_CONSTANTS } from '../../shared/constants/app.constants';

export interface SuccessResponse<T = any> {
  success: true;
  message: string;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ErrorResponse {
  success: false;
  message: string;
  error?: string;
}

export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse;

/**
 * Common utility class for handling API responses
 */
export class ResponseUtil {
  /**
   * Send a success response
   */
  static success<T = any>(
    res: Response,
    data: T,
    message: string = 'Operation successful',
    statusCode: number = APP_CONSTANTS.HTTP_STATUS.OK,
    pagination?: SuccessResponse['pagination']
  ): void {
    const response: SuccessResponse<T> = {
      success: true,
      message,
      data,
    };

    if (pagination) {
      response.pagination = pagination;
    }

    res.status(statusCode).json(response);
  }

  /**
   * Send an error response
   */
  static error(
    res: Response,
    message: string = 'An error occurred',
    statusCode: number = APP_CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR,
    error?: string
  ): void {
    const response: ErrorResponse = {
      success: false,
      message,
    };

    if (error) {
      response.error = error;
    }

    res.status(statusCode).json(response);
  }

  /**
   * Send a created response
   */
  static created<T = any>(
    res: Response,
    data: T,
    message: string = 'Resource created successfully'
  ): void {
    this.success(res, data, message, APP_CONSTANTS.HTTP_STATUS.CREATED);
  }

  /**
   * Send a not found response
   */
  static notFound(res: Response, message: string = 'Resource not found'): void {
    this.error(res, message, APP_CONSTANTS.HTTP_STATUS.NOT_FOUND);
  }

  /**
   * Send an unauthorized response
   */
  static unauthorized(res: Response, message: string = 'Unauthorized access'): void {
    this.error(res, message, APP_CONSTANTS.HTTP_STATUS.UNAUTHORIZED);
  }

  /**
   * Send a forbidden response
   */
  static forbidden(res: Response, message: string = 'Access forbidden'): void {
    this.error(res, message, APP_CONSTANTS.HTTP_STATUS.FORBIDDEN);
  }

  /**
   * Send a bad request response
   */
  static badRequest(res: Response, message: string = 'Bad request'): void {
    this.error(res, message, APP_CONSTANTS.HTTP_STATUS.BAD_REQUEST);
  }

  /**
   * Send a paginated response
   */
  static paginated<T = any>(
    res: Response,
    data: T[],
    pagination: {
      page: number;
      limit: number;
      total: number;
    },
    message: string = 'Data retrieved successfully'
  ): void {
    const totalPages = Math.ceil(pagination.total / pagination.limit);

    this.success(res, data, message, APP_CONSTANTS.HTTP_STATUS.OK, {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages,
    });
  }
}
