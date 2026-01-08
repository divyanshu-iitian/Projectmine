import dotenv from 'dotenv';
dotenv.config();

const config = {
  port: process.env.PORT || 6000,
  redisUrl: process.env.REDIS_URL || 'redis://redis:6379',
  mongoUri: process.env.MONGO_URI || 'mongodb://mongodb:27017/inventorydb',
};

export default config;
