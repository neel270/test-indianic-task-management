import { createClient, RedisClientType } from 'redis';
import { env } from '../config';

export interface SessionData {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export class RedisService {
  private client: RedisClientType;
  private isConnected: boolean = false;

  constructor() {
    this.client = createClient({
      url: env.redisUrl || 'redis://localhost:6379',
    });

    this.client.on('error', err => {
      console.error('Redis Client Error:', err);
      this.isConnected = false;
    });

    this.client.on('connect', () => {
      console.log('Connected to Redis');
      this.isConnected = true;
    });

    this.client.on('disconnect', () => {
      console.log('Disconnected from Redis');
      this.isConnected = false;
    });
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.client.disconnect();
    } catch (error) {
      console.error('Failed to disconnect from Redis:', error);
    }
  }

  // Session management methods
  async setSession(
    sessionId: string,
    sessionData: SessionData,
    ttl: number = 24 * 60 * 60
  ): Promise<void> {
    try {
      const key = `session:${sessionId}`;
      await this.client.setEx(key, ttl, JSON.stringify(sessionData));
    } catch (error) {
      console.error('Failed to set session in Redis:', error);
      throw error;
    }
  }

  async getSession(sessionId: string): Promise<SessionData | null> {
    try {
      const key = `session:${sessionId}`;
      const sessionData = await this.client.get(key);

      if (!sessionData) {
        return null;
      }

      return JSON.parse(sessionData) as SessionData;
    } catch (error) {
      console.error('Failed to get session from Redis:', error);
      return null;
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    try {
      const key = `session:${sessionId}`;
      await this.client.del(key);
    } catch (error) {
      console.error('Failed to delete session from Redis:', error);
      throw error;
    }
  }

  async extendSession(sessionId: string, additionalTime: number = 24 * 60 * 60): Promise<void> {
    try {
      const sessionData = await this.getSession(sessionId);
      if (sessionData) {
        await this.setSession(sessionId, sessionData, additionalTime);
      }
    } catch (error) {
      console.error('Failed to extend session in Redis:', error);
      throw error;
    }
  }

  // Cache methods for general use
  async setCache(key: string, value: any, ttl: number = 60 * 60): Promise<void> {
    try {
      await this.client.setEx(`cache:${key}`, ttl, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to set cache in Redis:', error);
      throw error;
    }
  }

  async getCache(key: string): Promise<any | null> {
    try {
      const cachedData = await this.client.get(`cache:${key}`);
      if (!cachedData) {
        return null;
      }

      return JSON.parse(cachedData);
    } catch (error) {
      console.error('Failed to get cache from Redis:', error);
      return null;
    }
  }

  async deleteCache(key: string): Promise<void> {
    try {
      await this.client.del(`cache:${key}`);
    } catch (error) {
      console.error('Failed to delete cache from Redis:', error);
      throw error;
    }
  }

  // Task reminder tracking methods
  async setReminderSent(taskId: string, hoursBefore: number): Promise<void> {
    try {
      const key = `reminder_sent:${taskId}:${hoursBefore}h`;
      // Set with a long TTL to avoid sending duplicate reminders
      await this.client.setEx(key, 30 * 24 * 60 * 60, 'sent'); // 30 days
      console.log(`Reminder marked as sent for task ${taskId} (${hoursBefore}h before)`);
    } catch (error) {
      console.error('Failed to set reminder sent in Redis:', error);
      throw error;
    }
  }

  async wasReminderSent(taskId: string, hoursBefore: number): Promise<boolean> {
    try {
      const key = `reminder_sent:${taskId}:${hoursBefore}h`;
      const result = await this.client.get(key);
      return result === 'sent';
    } catch (error) {
      console.error('Failed to check reminder sent in Redis:', error);
      return false;
    }
  }

  // Health check method
  async ping(): Promise<boolean> {
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      console.error('Redis ping failed:', error);
      return false;
    }
  }

  // Get connection status
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  // Clear all data (useful for testing)
  async clearAll(): Promise<void> {
    try {
      await this.client.flushAll();
    } catch (error) {
      console.error('Failed to clear Redis data:', error);
      throw error;
    }
  }
}
