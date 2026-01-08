import express from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import cors from 'cors';
import config from './config/index.js';
import authRoutes from './routes/authRoutes.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/auth', authRoutes);

app.use(errorHandler);

mongoose.set('strictQuery', true);

mongoose
  .connect(config.mongoUri)
  .then(() => {
    console.log(`[auth-service] Connected to MongoDB`);
    app.listen(config.port, () => {
      console.log(`[auth-service] Listening on port ${config.port}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });