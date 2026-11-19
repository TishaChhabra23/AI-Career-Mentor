import { env } from './config/env';
import app from './app';
import { connectDB, closeDB } from './config/db';
import { Server } from 'http';

const PORT = env.PORT;

let server: Server;

const startServer = async () => {
  // Start HTTP listening immediately so cloud proxies (Render) and health checks succeed immediately
  server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Express server started and listening on port ${PORT} in ${env.NODE_ENV} mode`);
  });

  // Connect to database in the background with auto-retry
  connectDB().catch((err) => {
    console.error('Initial DB connection attempt encountered error:', err);
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
