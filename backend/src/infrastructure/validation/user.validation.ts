import Joi from 'joi';

// User validation schemas
export const createUserSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name cannot exceed 100 characters',
    'any.required': 'Name is required',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(8).max(128).required().messages({
    'string.min': 'Password must be at least 8 characters long',
    'string.max': 'Password cannot exceed 128 characters',
    'any.required': 'Password is required',
  }),
  role: Joi.string().valid('admin', 'user').required().messages({
    'any.only': 'Role must be either admin or user',
    'any.required': 'Role is required',
  }),
  isActive: Joi.boolean().optional(),
});

export const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional().messages({
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name cannot exceed 100 characters',
  }),
  email: Joi.string().email().optional().messages({
    'string.email': 'Please provide a valid email address',
  }),
  role: Joi.string().valid('admin', 'user').optional().messages({
    'any.only': 'Role must be either admin or user',
  }),
  isActive: Joi.boolean().optional(),
});

export const userQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  role: Joi.string().valid('admin', 'user').optional(),
  isActive: Joi.boolean().optional(),
  search: Joi.string().min(1).max(100).optional(),
  sortBy: Joi.string().valid('name', 'email', 'role', 'createdAt', 'isActive').optional(),
  sortOrder: Joi.string().valid('asc', 'desc').optional(),
});

export const userIdSchema = Joi.object({
  id: Joi.string().required().messages({
    'any.required': 'User ID is required',
  }),
});

export const userRoleSchema = Joi.object({
  role: Joi.string().valid('admin', 'user').required().messages({
    'any.only': 'Role must be either admin or user',
    'any.required': 'Role is required',
  }),
});

export const toggleUserStatusSchema = Joi.object({
  // No body required for status toggle
});

export const userStatsQuerySchema = Joi.object({
  // No parameters required for stats
});
