import { env } from './config/env';
import app from './app';
import { connectDB, closeDB } from './config/db';
import { Server } from 'http';

const PORT = env.PORT;

let server: Server;

const startServer = async () => {
  // Connect to database first
  await connectDB();

  // Start listening
  server = app.listen(PORT, () => {
    console.log(`Express server started and listening on port ${PORT} in ${env.NODE_ENV} mode`);
  });

  // Graceful Shutdown Handler
  const shutdown = async (signal: string) => {
    console.log(`Received signal ${signal}. Starting graceful shutdown process...`);
    
    if (server) {
      server.close(() => {
        console.log('HTTP: Express server stopped accepting new requests.');
      });
    }

    try {
      await closeDB();
      console.log('Shutdown process completed. Exiting process.');
      process.exit(0);
    } catch (err) {
      console.error('Error encountered during database connection close:', err);
      process.exit(1);
    }
  };

  // Register signal listeners
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

startServer().catch((error) => {
  console.error('CRITICAL: Server failed to start due to unhandled error.');
  console.error(error);
  process.exit(1);
});
