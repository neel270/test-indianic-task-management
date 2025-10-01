import mongoose from 'mongoose';
import { env } from '../config/env';
import { UserSchema } from './schemas/user.schema';
import { TaskSchema } from './schemas/task.schema';

export class MongoDBConnection {
  private static instance: MongoDBConnection;
  private isConnected = false;

  private constructor() {}

  public static getInstance(): MongoDBConnection {
    if (!MongoDBConnection.instance) {
      MongoDBConnection.instance = new MongoDBConnection();
    }
    return MongoDBConnection.instance;
  }
  private async createCollections(): Promise<void> {
    try {
      const User = UserSchema;
      const Task = TaskSchema;
      await User.createCollection();
      await Task.createCollection();
      console.log('All collections are created or already exist');
    } catch (error) {
      console.error('Error creating collections:', error);
    }
  }
  public async connect(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    try {
      const mongoUri = env.mongodbUri;

      await mongoose.connect(mongoUri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        dbName: env.mongodbDbName,
      });

      this.isConnected = true;
      console.log('MongoDB connected successfully');
      // Create collections for all your models
      await this.createCollections();
      mongoose.connection.on('error', (error: Error) => {
        console.error('MongoDB connection error:', error);
      });

      mongoose.connection.on('disconnected', () => {
        console.log('MongoDB disconnected');
        this.isConnected = false;
      });
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (this.isConnected) {
      await mongoose.connection.close();
      this.isConnected = false;
      console.log('MongoDB disconnected successfully');
    }
  }

  public getConnection(): mongoose.Connection {
    return mongoose.connection;
  }

  public isConnectionReady(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }
}

export const mongoConnection = MongoDBConnection.getInstance();
