import mongoose from 'mongoose';
import { env } from './env';

export const connectDB = async (retries = 30, delayMs = 5000): Promise<void> => {
  const mongoURI = env.MONGODB_URI;

  // Connection Event Handlers (register once)
  if (mongoose.connection.listenerCount('connecting') === 0) {
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
      console.error('Mongoose: Database Connection Error encountered:', err);
    });
  }

  try {
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000 // 5 seconds timeout per attempt
    });
  } catch (error: any) {
    console.warn(`Mongoose: Connection attempt failed: ${error.message}`);
    if (retries > 0) {
      console.log(`Mongoose: Retrying database connection in ${delayMs / 1000}s... (${retries} retries remaining)`);
      setTimeout(() => {
        connectDB(retries - 1, delayMs).catch((e) => {
          console.error('Mongoose: Background reconnect failed:', e.message);
        });
      }, delayMs);
    } else {
      console.warn('Mongoose: Max retries reached. Server continues running; will reconnect when database resumes.');
    }
  }
};

export const closeDB = async (): Promise<void> => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log('Mongoose: Database connections closed successfully.');
  }
};
