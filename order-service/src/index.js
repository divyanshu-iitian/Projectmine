import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import config from './config/index.js';
import { connectDB } from './config/db.js';
import orderRoutes from './routes/order.routes.js';
import { extractUser } from './middlewares/auth.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

// Extract user info from headers (set by API Gateway)
app.use(extractUser);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/orders', orderRoutes);

app.use(errorHandler);

// Connect to MongoDB and start server
connectDB().then(() => {
  app.listen(config.port, () => {
    console.log(`[order-service] Listening on port ${config.port}`);
  });
});
