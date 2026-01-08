import mongoose from 'mongoose';
import config from './index.js';

mongoose.set('strictQuery', true);

export async function connectDB() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('[order-service] Connected to MongoDB');
  } catch (err) {
    console.error('[order-service] MongoDB connection error:', err);
    process.exit(1);
  }
}
