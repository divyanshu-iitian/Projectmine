import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import connectDB from './config/db.js';
import paymentRoutes from './routes/payment.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Connect to MongoDB
connectDB();

// Logging middleware
app.use(morgan('tiny'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'payment-service' });
});

// Important: Webhook route must be registered BEFORE express.json()
// because Stripe requires raw body for signature verification
app.use('/webhook', paymentRoutes);

// Body parsing middleware (after webhook route)
app.use(express.json());

// Payment routes
app.use('/', paymentRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[payment-service] Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`[payment-service] Listening on port ${PORT}`);
});
