const mongoose = require('mongoose');
const env = require('./env');
const logger = require('../utils/logger');

async function connectDB() {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    logger.info('MongoDB connected successfully', {
      host: conn.connection.host,
      name: conn.connection.name,
    });
    return conn;
  } catch (err) {
    if (env.NODE_ENV === 'development') {
      try {
        logger.warn('Local MongoDB not found. Starting in-memory MongoDB for development...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const memoryServer = await MongoMemoryServer.create();
        const memUri = memoryServer.getUri();
        const conn = await mongoose.connect(memUri);
        logger.info('In-memory MongoDB connected successfully for development', {
          uri: memUri,
        });
        return conn;
      } catch (memErr) {
        logger.error('Failed to start in-memory MongoDB fallback', { error: memErr.message });
      }
    }
    logger.error(`Failed to connect to MongoDB: ${err.message}`, {
      error: err.message,
    });
    console.error('--------------------------------------------------');
    console.error(`FATAL: Could not connect to MongoDB at ${env.MONGODB_URI}`);
    console.error('Please verify your MONGODB_URI environment variable and database status.');
    console.error('--------------------------------------------------');
    process.exit(1);
  }
}

mongoose.connection.on('error', (err) => {
  logger.error('MongoDB runtime connection error', { error: err.message });
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});

module.exports = connectDB;
