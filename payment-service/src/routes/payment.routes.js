import express from 'express';
import { createSession, getPaymentStatus } from '../controllers/payment.controller.js';
import { getRevenueAnalytics, getPaymentAnalytics } from '../controllers/analytics.controller.js';
import { verifyWebhookSignature } from '../services/stripe.service.js';
import { processWebhookEvent } from '../webhooks/stripe.webhook.js';

const router = express.Router();

/**
 * Middleware to extract user from headers (forwarded by API Gateway)
 */
const extractUser = (req, res, next) => {
  const userId = req.headers['x-user-id'];
  const userEmail = req.headers['x-user-email'];
  const userRole = req.headers['x-user-role'];

  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  req.user = {
    id: userId,
    email: userEmail,
    role: userRole
  };

  next();
};

/**
 * Middleware to require admin role
 */
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

/**
 * POST /create-session
 * Create Stripe checkout session (authenticated users only)
 */
router.post('/create-session', extractUser, createSession);

/**
 * GET /status/:orderId
 * Get payment status for an order (authenticated users only)
 */
router.get('/status/:orderId', extractUser, getPaymentStatus);

/**
 * GET /admin/analytics/revenue
 * Get revenue analytics (admin only)
 */
router.get('/admin/analytics/revenue', extractUser, requireAdmin, getRevenueAnalytics);

/**
 * GET /admin/analytics/payments
 * Get payment health analytics (admin only)
 */
router.get('/admin/analytics/payments', extractUser, requireAdmin, getPaymentAnalytics);

/**
 * POST /webhook
 * Stripe webhook endpoint (public, but signature-verified)
 * This endpoint MUST be public and NOT go through JWT middleware
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['stripe-signature'];

  if (!signature) {
    console.error('[webhook] Missing stripe-signature header');
    return res.status(400).json({ error: 'Missing signature' });
  }

  try {
    // Verify webhook signature
    const event = verifyWebhookSignature(req.body, signature);

    // Process the event asynchronously
    processWebhookEvent(event).catch(err => {
      console.error('[webhook] Error processing event:', err);
    });

    // Respond immediately to Stripe
    res.json({ received: true });
  } catch (error) {
    console.error('[webhook] Signature verification failed:', error.message);
    return res.status(400).json({ error: 'Invalid signature' });
  }
});

export default router;
