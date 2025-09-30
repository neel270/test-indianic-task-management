// Express validation middleware wrapper
// NOTE: This requires 'express-validation' package to be installed

import { NextFunction, Request, Response } from 'express';
import { validationSchemas } from './validation.middleware';

// Validation middleware factory
export const validateRequest = (schemaKey: keyof typeof validationSchemas.user | keyof typeof validationSchemas.task) => {
  return (req: Request, res: Response, next: NextFunction): void | Response => {
    try {
      // Get the appropriate schema based on the key
      let schema: any;

      if (schemaKey in validationSchemas.user) {
        schema = validationSchemas.user[schemaKey as keyof typeof validationSchemas.user];
      } else if (schemaKey in validationSchemas.task) {
        schema = validationSchemas.task[schemaKey as keyof typeof validationSchemas.task];
      } else {
        res.status(500).json({
          success: false,
          message: 'Invalid validation schema'
        });
        return;
      }

      // Validate request body, query, and params based on schema
      const errors: string[] = [];

      // Validate body if schema has body validation
      if (schema.body) {
        const { error: bodyError } = schema.body.validate(req.body, { abortEarly: false });
        if (bodyError) {
          const bodyErrors = bodyError.details.map((detail: any) => detail.message);
          errors.push(...bodyErrors);
        }
      }

      // Validate query if schema has query validation
      if (schema.query) {
        const { error: queryError } = schema.query.validate(req.query, { abortEarly: false });
        if (queryError) {
          const queryErrors = queryError.details.map((detail: any) => detail.message);
          errors.push(...queryErrors);
        }
      }

      // Validate params if schema has params validation
      if (schema.params) {
        const { error: paramsError } = schema.params.validate(req.params, { abortEarly: false });
        if (paramsError) {
          const paramsErrors = paramsError.details.map((detail: any) => detail.message);
          errors.push(...paramsErrors);
        }
      }

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors
        });
      }

      next();
    } catch (error) {
      console.error('Validation middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during validation'
      });
    }
  };
};

// Specific validation middleware functions for common use cases
export const validateUserCreation = validateRequest('createUser');
export const validateUserLogin = validateRequest('loginUser');
export const validateUserUpdate = validateRequest('updateUser');
export const validateChangePassword = validateRequest('changePassword');
export const validateForgotPassword = validateRequest('forgotPassword');
export const validateVerifyOtp = validateRequest('verifyOtp');
export const validateSetNewPassword = validateRequest('setNewPassword');

export const validateTaskCreation = validateRequest('createTask');
export const validateTaskUpdate = validateRequest('updateTask');
export const validateGetTasks = validateRequest('getTasks');
export const validateGetTaskById = validateRequest('getTaskById');
export const validateDeleteTask = validateRequest('deleteTask');
export const validateGetTasksByStatus = validateRequest('getTasksByStatus');
export const validateExportTasksToCSV = validateRequest('exportTasksToCSV');

// Combined middleware for routes that need multiple validations
export const validateTaskWithFileUpload = [
  validateGetTaskById,
  // File upload validation would be handled by multer middleware
];

export const validateTaskUpdateWithFile = [
  validateTaskUpdate,
  // File upload validation would be handled by multer middleware
];
