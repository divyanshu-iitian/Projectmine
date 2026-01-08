import Redis from 'ioredis';
import config from './index.js';

const redis = new Redis(config.redisUrl, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on('connect', () => {
  console.log('[inventory-service] Connected to Redis');
});

redis.on('error', (err) => {
  console.error('[inventory-service] Redis connection error:', err);
});

export default redis;
