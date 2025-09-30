export interface EnvironmentConfig {
  port: number;
  nodeEnv: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  refreshTokenExpiresIn: string;
  databaseUrl: string;
  mongodbUri: string;
  redisUrl?: string;
  emailServiceApiKey?: string;
  emailServiceUrl?: string;
}

export const env: EnvironmentConfig = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://localhost:5432/mydb',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/taskmanagement',
  redisUrl: process.env.REDIS_URL,
  emailServiceApiKey: process.env.EMAIL_SERVICE_API_KEY,
  emailServiceUrl: process.env.EMAIL_SERVICE_URL,
};
