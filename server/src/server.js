const app = require('./app');
const env = require('./config/env');
const connectDB = require('./config/db');
const logger = require('./utils/logger');

async function startServer() {
  // Connect to persistent MongoDB database
  await connectDB();

  const server = app.listen(env.PORT, () => {
    logger.info(`Career Lens server running on port ${env.PORT}`, {
      port: env.PORT,
      env: env.NODE_ENV,
    });
  });

  const shutdown = async (signal) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
      logger.info('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

startServer().catch((err) => {
  logger.error('Failed to start server', { error: err.message });
  process.exit(1);
});
