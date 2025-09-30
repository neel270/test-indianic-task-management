import { mongoConnection } from './mongodb';

export const initializeDatabase = async (): Promise<void> => {
  try {
    await mongoConnection.connect();
    console.log('MongoDB connection established successfully');
  } catch (error) {
    console.error('Error during MongoDB initialization:', error);
    throw error;
  }
};

export const closeDatabase = async (): Promise<void> => {
  try {
    await mongoConnection.disconnect();
    console.log('MongoDB connection closed successfully');
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
    throw error;
  }
};

// Export the connection for use in repositories
export { mongoConnection };
