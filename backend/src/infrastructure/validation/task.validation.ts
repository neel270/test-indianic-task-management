import Joi from 'joi';

// Task creation schema
export const createTaskSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().max(1000).allow('').optional(),
  dueDate: Joi.date().optional(),
  status: Joi.string().valid('Pending', 'Completed').optional(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
  tags: Joi.array().items(Joi.string().min(1).max(50)).max(10).optional(),
});

// Task update schema
export const updateTaskSchema = Joi.object({
  title: Joi.string().min(3).max(100).optional(),
  description: Joi.string().max(1000).allow('').optional(),
  dueDate: Joi.date().optional(),
  status: Joi.string().valid('Pending', 'Completed').optional(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
  tags: Joi.array().items(Joi.string().min(1).max(50)).max(10).optional(),
});

// Task query parameters schema
export const taskQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  status: Joi.string().valid('Pending', 'Completed').optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  sortBy: Joi.string().valid('createdAt', 'dueDate', 'title', 'status', 'priority').optional(),
  sortOrder: Joi.string().valid('asc', 'desc').optional(),
});

// Task ID parameter schema
export const taskIdSchema = Joi.object({
  id: Joi.string().required(),
});

// Task status update schema
export const updateTaskStatusSchema = Joi.object({
  status: Joi.string().valid('Pending', 'Completed').required(),
});

// File upload schema
export const uploadFileSchema = Joi.object({
  file: Joi.any().required(),
});

// Task assignment schema
export const assignTaskSchema = Joi.object({
  userId: Joi.string().required(),
});