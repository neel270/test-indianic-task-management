export const APP_CONSTANTS = {
  API_VERSION: 'v1',
  API_PREFIX: '/api/v1',

  // User roles
  USER_ROLES: {
    ADMIN: 'admin',
    USER: 'user',
  } as const,

  // Task statuses
  TASK_STATUSES: {
    PENDING: 'Pending',
    COMPLETED: 'Completed',
  } as const,

  // Pagination defaults
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
  } as const,

  // File upload
  FILE_UPLOAD: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGES: ['image/jpeg', 'image/png', 'image/gif'],
    ALLOWED_DOCUMENTS: ['application/pdf', 'application/msword'],
  } as const,

  // JWT
  JWT: {
    ACCESS_TOKEN_EXPIRES_IN: '15m',
    REFRESH_TOKEN_EXPIRES_IN: '7d',
  } as const,

  // Cache
  CACHE: {
    DEFAULT_TTL: 300, // 5 minutes
    USER_CACHE_TTL: 600, // 10 minutes
  } as const,
} as const;

export type UserRole = typeof APP_CONSTANTS.USER_ROLES[keyof typeof APP_CONSTANTS.USER_ROLES];
export type TaskStatus = typeof APP_CONSTANTS.TASK_STATUSES[keyof typeof APP_CONSTANTS.TASK_STATUSES];
