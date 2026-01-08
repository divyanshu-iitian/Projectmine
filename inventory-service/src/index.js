import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import config from './config/index.js';
import { connectDB } from './config/db.js';
import redis from './config/redis.js';
import inventoryRoutes from './routes/inventory.routes.js';
import { extractUser } from './middlewares/auth.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

// Extract user info from headers (set by API Gateway)
app.use(extractUser);

app.get('/health', async (req, res) => {
  try {
    await redis.ping();
    res.json({ status: 'ok', redis: 'connected' });
  } catch (err) {
    res.status(503).json({ status: 'degraded', redis: 'disconnected' });
  }
});

app.use('/inventory', inventoryRoutes);

app.use(errorHandler);

// Connect to MongoDB and start server
connectDB().then(() => {
  app.listen(config.port, () => {
    console.log(`[inventory-service] Listening on port ${config.port}`);
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[inventory-service] SIGTERM received, closing connections...');
  await redis.quit();
  process.exit(0);
});
