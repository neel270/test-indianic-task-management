import path from 'path';
import dotenv from 'dotenv';

export interface EnvironmentConfig {
  port: number;
  nodeEnv: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  jwtRefreshSecret: string;
  jwtRefreshExpiresIn?: string;
  refreshTokenExpiresIn: string;
  mongodbUri: string;
  mongodbDbName?: string;
  redisUrl: string;
  emailServiceApiKey?: string;
  emailServiceUrl?: string;
  maxFileSize: number;
  allowedOrigins: string;
  logLevel: string;
  demoOtp: string;
  uploadDir: string;
  maxProfileImageSize?: number;
  maxTaskFileSize?: number;
  maxMemoryFileSize: number;
  frontendUrl: string;
  baseUrl: string;
  emailHost: string;
  emailPort: number;
  emailUser: string;
  emailPassword: string;
  emailFrom: string;
}
dotenv.config({ path: path.resolve(process.cwd(), '../../../../.env') });

export const env: EnvironmentConfig = {
  port: parseInt(process.env.PORT ?? '5000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  jwtSecret: process.env.JWT_SECRET ?? 'your-secret-key',
  jwtExpiresIn: process.env.JWT_EXPIRE ?? '7d',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? 'your-refresh-secret-key',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  refreshTokenExpiresIn: process.env.JWT_EXPIRE ?? '7d',
  mongodbUri: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/task_management',
  mongodbDbName: process.env.MONGODB_DB_NAME ?? 'task_management',
  redisUrl: process.env.REDIS_URL ?? '',
  emailServiceApiKey: process.env.EMAIL_SERVICE_API_KEY,
  emailServiceUrl: process.env.EMAIL_SERVICE_URL,
  maxFileSize: process.env.MAX_FILE_SIZE ? parseInt(process.env.MAX_FILE_SIZE, 10) : 10485760,
  allowedOrigins: process.env.ALLOWED_ORIGINS ?? '',
  logLevel: process.env.LOG_LEVEL ?? 'info',
  demoOtp: process.env.DEMO_OTP ?? '123456',
  uploadDir: process.env.UPLOAD_DIR ?? 'uploads/',
  baseUrl: process.env.BASE_URL ?? `http://localhost:${process.env.PORT ?? '5000'}`,
  maxProfileImageSize: process.env.MAX_PROFILE_IMAGE_SIZE
    ? parseInt(process.env.MAX_PROFILE_IMAGE_SIZE, 10)
    : 5242880,
  maxTaskFileSize: process.env.MAX_TASK_FILE_SIZE
    ? parseInt(process.env.MAX_TASK_FILE_SIZE, 10)
    : 10485760,
  maxMemoryFileSize: process.env.MAX_MEMORY_FILE_SIZE
    ? parseInt(process.env.MAX_MEMORY_FILE_SIZE, 10)
    : 10485760,
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:8080',
  emailHost: process.env.SMTP_HOST ?? 'smtp.gmail.com',
  emailPort: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587,
  emailUser: process.env.SMTP_USER ?? '',
  emailPassword: process.env.SMTP_PASS ?? '',
  emailFrom: process.env.FROM_EMAIL ?? '',
};
