import Payment from '../models/Payment.js';
import { createCheckoutSession } from '../services/stripe.service.js';
import axios from 'axios';

const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://order-service:7000';

/**
 * Create Stripe checkout session for an order
 * POST /create-session
 */
export const createSession = async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.headers['x-user-id'];
    const userEmail = req.headers['x-user-email'];

    if (!orderId) {
      return res.status(400).json({ error: 'orderId is required' });
    }

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Validate order exists and is PENDING
    let order;
    try {
      const orderResponse = await axios.get(
        `${ORDER_SERVICE_URL}/orders/${orderId}/internal`,
        {
          headers: {
            'x-internal-service': 'payment-service'
          }
        }
      );
      order = orderResponse.data.order;
    } catch (error) {
      if (error.response?.status === 404) {
        return res.status(404).json({ error: 'Order not found' });
      }
      throw error;
    }

    // Check order status
    if (order.status !== 'PENDING') {
      return res.status(400).json({ 
        error: `Cannot create payment for order with status: ${order.status}. Order must be PENDING.` 
      });
    }

    // Check if payment already exists for this order
    const existingPayment = await Payment.findOne({ 
      orderId,
      status: { $in: ['INITIATED', 'SUCCESS'] }
    });

    if (existingPayment) {
      if (existingPayment.status === 'SUCCESS') {
        return res.status(400).json({ error: 'Payment already completed for this order' });
      }
      
      // Return existing checkout session if still valid
      return res.json({ 
        checkoutUrl: `https://checkout.stripe.com/pay/${existingPayment.stripeSessionId}`,
        sessionId: existingPayment.stripeSessionId
      });
    }

    // Convert amount to cents (Stripe expects smallest currency unit)
    const amountInCents = Math.round(order.totalAmount * 100);

    // Create Stripe checkout session
    const session = await createCheckoutSession({
      orderId: order._id,
      amount: amountInCents,
      currency: 'usd',
      userId
    });

    // Save payment record
    const payment = new Payment({
      orderId: order._id,
      stripeSessionId: session.id,
      amount: order.totalAmount,
      currency: 'usd',
      status: 'INITIATED',
      metadata: {
        userEmail,
        userId
      }
    });

    await payment.save();

    console.log(`[payment] Created checkout session ${session.id} for order ${orderId}`);

    res.status(200).json({
      checkoutUrl: session.url,
      sessionId: session.id
    });
  } catch (error) {
    console.error('[payment] Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create payment session' });
  }
};

/**
 * Get payment status for an order
 * GET /status/:orderId
 */
export const getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.headers['x-user-id'];

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const payment = await Payment.findOne({ orderId }).sort({ createdAt: -1 });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found for this order' });
    }

    res.json({
      orderId: payment.orderId,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      createdAt: payment.createdAt
    });
  } catch (error) {
    console.error('[payment] Error fetching payment status:', error);
    res.status(500).json({ error: 'Failed to fetch payment status' });
  }
};
