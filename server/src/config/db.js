const mongoose = require('mongoose');
const env = require('./env');
const logger = require('../utils/logger');

async function connectDB() {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    logger.info('MongoDB connected successfully', {
      host: conn.connection.host,
      name: conn.connection.name,
    });
    return conn;
  } catch (err) {
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
