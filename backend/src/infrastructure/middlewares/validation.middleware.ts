import Joi from 'joi';

// Common validation schemas
export const commonSchemas = {
  objectId: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .message('Invalid ID format'),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required',
  }),
  name: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name cannot exceed 50 characters',
    'any.required': 'Name is required',
  }),
  role: Joi.string().valid('admin', 'user').default('user'),
  isActive: Joi.boolean(),
  positiveInteger: Joi.number().integer().positive(),
  isoDate: Joi.date().iso().messages({
    'date.format': 'Date must be in ISO format (YYYY-MM-DDTHH:mm:ss.sssZ)',
  }),
  futureDate: Joi.date().greater('now').messages({
    'date.greater': 'Due date must be in the future',
  }),
  status: Joi.string().valid('Pending', 'Completed', 'In Progress', 'Cancelled'),
};

// User validation schemas
export const userValidationSchemas = {
  createUser: {
    body: Joi.object({
      name: commonSchemas.name,
      email: commonSchemas.email,
      password: commonSchemas.password,
      role: commonSchemas.role,
      profileImage: Joi.string().uri().optional(),
    }),
  },

  loginUser: {
    body: Joi.object({
      email: commonSchemas.email,
      password: commonSchemas.password,
    }),
  },

  updateUser: {
    body: Joi.object({
      name: commonSchemas.name.optional(),
      email: commonSchemas.email.optional(),
      role: commonSchemas.role.optional(),
      isActive: commonSchemas.isActive.optional(),
      profileImage: Joi.string().uri().optional(),
    }),
    params: Joi.object({
      id: commonSchemas.objectId.required(),
    }),
  },

  changePassword: {
    body: Joi.object({
      currentPassword: Joi.string().required().messages({
        'any.required': 'Current password is required',
      }),
      newPassword: Joi.string().min(6).required().messages({
        'string.min': 'New password must be at least 6 characters long',
        'any.required': 'New password is required',
      }),
    }),
  },

  forgotPassword: {
    body: Joi.object({
      email: commonSchemas.email,
    }),
  },

  verifyOtp: {
    body: Joi.object({
      email: commonSchemas.email,
      otp: Joi.string()
        .length(6)
        .pattern(/^\d{6}$/)
        .required()
        .messages({
          'string.length': 'OTP must be exactly 6 digits',
          'string.pattern': 'OTP must contain only numbers',
          'any.required': 'OTP is required',
        }),
    }),
  },
};

// Task validation schemas
export const taskValidationSchemas = {
  createTask: {
    body: Joi.object({
      title: Joi.string().min(1).max(200).required().messages({
        'string.min': 'Title cannot be empty',
        'string.max': 'Title cannot exceed 200 characters',
        'any.required': 'Title is required',
      }),
      description: Joi.string().max(1000).optional().messages({
        'string.max': 'Description cannot exceed 1000 characters',
      }),
      dueDate: Joi.date().iso().required().messages({
        'date.format': 'Due date must be in ISO format',
        'any.required': 'Due date is required',
      }),
      status: Joi.string()
        .valid('Pending', 'In Progress', 'Completed', 'Cancelled')
        .default('Pending'),
      priority: Joi.string().valid('Low', 'Medium', 'High').default('Medium'),
      assignedTo: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
          'string.pattern': 'Assigned user ID must be a valid MongoDB ObjectId',
          'any.required': 'Assigned user is required',
        }),
      tags: Joi.array().items(Joi.string().min(1).max(50)).max(10).optional().messages({
        'array.max': 'Cannot have more than 10 tags',
        'string.min': 'Tag cannot be empty',
        'string.max': 'Tag cannot exceed 50 characters',
      }),
    }),
  },

  updateTask: {
    body: Joi.object({
      title: Joi.string().min(1).max(200).optional().messages({
        'string.min': 'Title cannot be empty',
        'string.max': 'Title cannot exceed 200 characters',
      }),
      description: Joi.string().max(1000).optional().messages({
        'string.max': 'Description cannot exceed 1000 characters',
      }),
      dueDate: Joi.date().iso().optional().messages({
        'date.format': 'Due date must be in ISO format',
      }),
      status: Joi.string().valid('Pending', 'In Progress', 'Completed', 'Cancelled').optional(),
      priority: Joi.string().valid('Low', 'Medium', 'High').optional(),
      assignedTo: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .optional()
        .messages({
          'string.pattern': 'Assigned user ID must be a valid MongoDB ObjectId',
        }),
      tags: Joi.array().items(Joi.string().min(1).max(50)).max(10).optional().messages({
        'array.max': 'Cannot have more than 10 tags',
        'string.min': 'Tag cannot be empty',
        'string.max': 'Tag cannot exceed 50 characters',
      }),
    }),
    params: Joi.object({
      id: commonSchemas.objectId.required(),
    }),
  },

  getTasks: {
    query: Joi.object({
      page: commonSchemas.positiveInteger.optional(),
      limit: commonSchemas.positiveInteger.optional(),
      sortBy: Joi.string()
        .valid('createdAt', 'updatedAt', 'dueDate', 'title', 'status')
        .default('createdAt'),
      sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
      status: commonSchemas.status.optional(),
      startDate: Joi.date().iso().optional().messages({
        'date.format': 'Start date must be in ISO format',
      }),
      endDate: Joi.date().iso().optional().messages({
        'date.format': 'End date must be in ISO format',
      }),
    }),
  },

  getTaskById: {
    params: Joi.object({
      id: commonSchemas.objectId.required(),
    }),
  },

  deleteTask: {
    params: Joi.object({
      id: commonSchemas.objectId.required(),
    }),
  },

  uploadTaskFile: {
    params: Joi.object({
      id: commonSchemas.objectId.required(),
    }),
    // File validation handled by multer
  },

  removeTaskFile: {
    params: Joi.object({
      id: commonSchemas.objectId.required(),
    }),
  },

  exportTasksToCSV: {
    query: Joi.object({
      status: Joi.string().valid('Pending', 'In Progress', 'Completed', 'Cancelled').optional(),
      startDate: Joi.date().iso().optional().messages({
        'date.format': 'Start date must be in ISO format',
      }),
      endDate: Joi.date().iso().optional().messages({
        'date.format': 'End date must be in ISO format',
      }),
    }),
  },

  markTaskComplete: {
    params: Joi.object({
      id: commonSchemas.objectId.required(),
    }),
  },

  markTaskPending: {
    params: Joi.object({
      id: commonSchemas.objectId.required(),
    }),
  },

  deleteTaskFile: {
    params: Joi.object({
      id: commonSchemas.objectId.required(),
      fileId: Joi.string().required().messages({
        'any.required': 'File ID is required',
      }),
    }),
  },

  assignTask: {
    params: Joi.object({
      id: commonSchemas.objectId.required(),
    }),
    body: Joi.object({
      userId: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
          'string.pattern': 'User ID must be a valid MongoDB ObjectId',
          'any.required': 'User ID is required',
        }),
    }),
  },
};

// Export all schemas for use in routes
export const validationSchemas = {
  user: userValidationSchemas,
  task: taskValidationSchemas,
};
