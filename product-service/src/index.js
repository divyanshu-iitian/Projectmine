import express from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import cors from 'cors';
import config from './config/index.js';
import productRoutes from './routes/productRoutes.js';
import { extractUser } from './middlewares/auth.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

// Extract user info from headers (set by API Gateway)
app.use(extractUser);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/products', productRoutes);

app.use(errorHandler);

mongoose.set('strictQuery', true);

mongoose
  .connect(config.mongoUri)
  .then(() => {
    console.log(`[product-service] Connected to MongoDB`);
    app.listen(config.port, () => {
      console.log(`[product-service] Listening on port ${config.port}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
