import { NextFunction, Request, Response } from 'express';
import { validationSchemas } from './validation.middleware';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  verifyOTPSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateProfileSchema,
} from '../validation/auth.validation';
import {
  createUserSchema,
  updateUserSchema,
  userQuerySchema,
  userIdSchema,
  userRoleSchema,
  toggleUserStatusSchema,
  userStatsQuerySchema,
} from '../validation/user.validation';
import { APP_CONSTANTS } from '../../shared/constants';

// Validation middleware factory
export const validateRequest = (
  schemaKey: keyof typeof validationSchemas.user | keyof typeof validationSchemas.task
) => {
  return (req: Request, res: Response, next: NextFunction): void | Response => {
    try {
      // Get the appropriate schema based on the key
      let schema: any;
      console.log(schemaKey, 'schemaKey');
      if (schemaKey in validationSchemas.user) {
        schema = validationSchemas.user[schemaKey as keyof typeof validationSchemas.user];
      } else if (schemaKey in validationSchemas.task) {
        schema = validationSchemas.task[schemaKey as keyof typeof validationSchemas.task];
      } else {
        res.status(APP_CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: 'Invalid validation schema',
        });
        return;
      }

      // Validate request body, query, and params based on schema
      const errors: string[] = [];

      // Validate body if schema has body validation
      if (schema.body) {
        // For multipart/form-data requests, the body might be parsed differently
        // Check if this is a multipart request and handle accordingly
        const contentType = req.get('content-type') ?? '';
        const isMultipart = contentType.includes('multipart/form-data');

        let bodyToValidate = req.body;

        // For multipart requests, filter out file fields that shouldn't be in body validation
        if (isMultipart && typeof req.body === 'object' && req.body !== null) {
          bodyToValidate = { ...req.body };
          // Remove common file field names that might appear in body during multipart parsing
          delete bodyToValidate.attachments;
          delete bodyToValidate.files;
          delete bodyToValidate.file;
        }

        const { error: bodyError } = schema.body.validate(bodyToValidate, {
          abortEarly: false,
          allowUnknown: true, // Allow unknown fields for multipart requests
        });
        if (bodyError) {
          const bodyErrors = bodyError.details.map((detail: { message: string }) => detail.message);
          errors.push(...bodyErrors);
        }
      }

      // Validate query if schema has query validation
      if (schema.query) {
        const { error: queryError } = schema.query.validate(req.query, { abortEarly: false });
        if (queryError) {
          const queryErrors = queryError.details.map(
            (detail: { message: string }) => detail.message
          );
          errors.push(...queryErrors);
        }
      }

      // Validate params if schema has params validation
      if (schema.params) {
        const { error: paramsError } = schema.params.validate(req.params, { abortEarly: false });
        if (paramsError) {
          const paramsErrors = paramsError.details.map(
            (detail: { message: string }) => detail.message
          );
          errors.push(...paramsErrors);
        }
      }
      console.log(errors, 'validationRequest errors');
      if (errors.length > 0) {
        return res.status(APP_CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Validation failed',
          errors,
        });
      }

      next();
    } catch (error) {
      console.error('Validation middleware error:', error);
      res.status(APP_CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Internal server error during validation',
      });
    }
  };
};

// Specific validation middleware functions for common use cases (legacy - use specific functions below)
export const validateUserCreation = validateRequest('createUser');
export const validateUserLogin = validateRequest('loginUser');
export const validateUserUpdate = validateRequest('updateUser');

// Auth validation middleware functions
export const validateRegister = (
  req: Request,
  res: Response,
  next: NextFunction
): void | Response => {
  const { error } = registerSchema.validate(req.body, {
    abortEarly: false,
    allowUnknown: true,
  });
  if (error) {
    const errors = error.details.map((detail: { message: string }) => detail.message);
    console.log(errors, 'validateRegister errors');

    return res.status(APP_CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }
  next();
};

export const validateLogin = (req: Request, res: Response, next: NextFunction): void | Response => {
  const { error } = loginSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map((detail: { message: string }) => detail.message);
    console.log(errors, 'validateLogin errors');
    return res.status(APP_CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }
  next();
};

export const validateRefreshToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void | Response => {
  const { error } = refreshTokenSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map((detail: { message: string }) => detail.message);
    console.log(errors, 'validateRefreshToken errors');
    return res.status(APP_CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }
  next();
};

export const validateForgotPassword = (
  req: Request,
  res: Response,
  next: NextFunction
): void | Response => {
  const { error } = forgotPasswordSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map((detail: { message: string }) => detail.message);
    console.log(errors, 'validateForgotPassword errors');
    return res.status(APP_CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }
  next();
};

export const validateVerifyOTP = (
  req: Request,
  res: Response,
  next: NextFunction
): void | Response => {
  const { error } = verifyOTPSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map((detail: { message: string }) => detail.message);
    console.log(errors, 'validateVerifyOTP errors');
    return res.status(APP_CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }
  next();
};

export const validateResetPassword = (
  req: Request,
  res: Response,
  next: NextFunction
): void | Response => {
  const { error } = resetPasswordSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map((detail: { message: string }) => detail.message);
    console.log(errors, 'validateResetPassword errors');
    return res.status(APP_CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }
  next();
};

export const validateChangePassword = (
  req: Request,
  res: Response,
  next: NextFunction
): void | Response => {
  const { error } = changePasswordSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map((detail: { message: string }) => detail.message);
    console.log(errors, 'validateChangePassword errors');
    return res.status(APP_CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }
  next();
};

export const validateUpdateProfile = (
  req: Request,
  res: Response,
  next: NextFunction
): void | Response => {
  const { error } = updateProfileSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map((detail: { message: string }) => detail.message);
    console.log(errors, 'validateUpdateProfile errors');
    return res.status(APP_CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }
  next();
};

// User validation middleware functions
export const validateCreateUser = (
  req: Request,
  res: Response,
  next: NextFunction
): void | Response => {
  const { error } = createUserSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map((detail: { message: string }) => detail.message);
    return res.status(APP_CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }
  next();
};

export const validateUpdateUser = (
  req: Request,
  res: Response,
  next: NextFunction
): void | Response => {
  const { error } = updateUserSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map((detail: { message: string }) => detail.message);
    return res.status(APP_CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }
  next();
};

export const validateUserQuery = (
  req: Request,
  res: Response,
  next: NextFunction
): void | Response => {
  const { error } = userQuerySchema.validate(req.query, { abortEarly: false });
  if (error) {
    const errors = error.details.map((detail: { message: string }) => detail.message);
    return res.status(APP_CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }
  next();
};

export const validateUserId = (
  req: Request,
  res: Response,
  next: NextFunction
): void | Response => {
  const { error } = userIdSchema.validate(req.params, { abortEarly: false });
  if (error) {
    const errors = error.details.map((detail: { message: string }) => detail.message);
    return res.status(APP_CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }
  next();
};

export const validateUserRole = (
  req: Request,
  res: Response,
  next: NextFunction
): void | Response => {
  const { error } = userRoleSchema.validate(req.params, { abortEarly: false });
  if (error) {
    const errors = error.details.map((detail: { message: string }) => detail.message);
    return res.status(APP_CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }
  next();
};

export const validateToggleUserStatus = (
  req: Request,
  res: Response,
  next: NextFunction
): void | Response => {
  const { error } = toggleUserStatusSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map((detail: { message: string }) => detail.message);
    return res.status(APP_CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }
  next();
};

export const validateUserStatsQuery = (
  req: Request,
  res: Response,
  next: NextFunction
): void | Response => {
  const { error } = userStatsQuerySchema.validate(req.query, { abortEarly: false });
  if (error) {
    const errors = error.details.map((detail: { message: string }) => detail.message);
    return res.status(APP_CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }
  next();
};

export const validateTaskCreation = validateRequest('createTask');
export const validateTaskUpdate = validateRequest('updateTask');
export const validateGetTasks = validateRequest('getTasks');
export const validateGetTaskById = validateRequest('getTaskById');
export const validateDeleteTask = validateRequest('deleteTask');
export const validateExportTasksToCSV = validateRequest('exportTasksToCSV');
export const validateMarkTaskComplete = validateRequest('markTaskComplete');
export const validateMarkTaskPending = validateRequest('markTaskPending');
export const validateDeleteTaskFile = validateRequest('deleteTaskFile');

// Combined middleware for routes that need multiple validations
export const validateTaskWithFileUpload = [
  validateGetTaskById,
  // File upload validation would be handled by multer middleware
];

export const validateTaskUpdateWithFile = [
  validateTaskUpdate,
  // File upload validation would be handled by multer middleware
];
