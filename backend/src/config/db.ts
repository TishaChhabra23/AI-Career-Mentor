import mongoose from 'mongoose';
import { env } from './env';

export const connectDB = async (): Promise<void> => {
  const mongoURI = env.MONGODB_URI;

  // Connection Event Handlers
  mongoose.connection.on('connecting', () => {
    console.log('Mongoose: Attempting connection to MongoDB Atlas...');
  });

  mongoose.connection.on('connected', () => {
    const dbName = mongoose.connection.db?.databaseName || 'default';
    console.log(`Mongoose: Database Connected successfully to: ${dbName}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('Mongoose: Database Connection Disconnected');
  });

  mongoose.connection.on('error', (err) => {
    console.error('Mongoose: Database Connection Error encountered:');
    console.error(err);
  });

  try {
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000 // 5 seconds fail-fast local timeout
    });
  } catch (error) {
    console.error('CRITICAL: Initial database connection failed.');
    console.error(error);
    process.exit(1);
  }
};

export const closeDB = async (): Promise<void> => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log('Mongoose: Database connections closed successfully.');
  }
};
