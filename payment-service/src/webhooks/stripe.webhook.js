import Payment from '../models/Payment.js';
import axios from 'axios';

const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://order-service:7000';
const INVENTORY_SERVICE_URL = process.env.INVENTORY_SERVICE_URL || 'http://inventory-service:6000';

/**
 * Handle successful payment
 * Updates order status to CONFIRMED
 */
const handlePaymentSuccess = async (session) => {
  const { orderId, userId } = session.metadata;

  console.log(`[webhook] Processing payment success for order ${orderId}`);

  try {
    // Check if payment already processed (idempotency)
    const existingPayment = await Payment.findOne({
      stripeSessionId: session.id,
      status: 'SUCCESS'
    });

    if (existingPayment) {
      console.log(`[webhook] Payment ${session.id} already processed, skipping`);
      return;
    }

    // Update payment record
    await Payment.findOneAndUpdate(
      { stripeSessionId: session.id },
      { 
        status: 'SUCCESS',
        metadata: {
          paymentIntent: session.payment_intent,
          customerEmail: session.customer_email
        }
      }
    );

    // Update order status to CONFIRMED
    await axios.patch(
      `${ORDER_SERVICE_URL}/orders/${orderId}/status`,
      { status: 'CONFIRMED' },
      {
        headers: {
          'x-user-id': userId,
          'x-internal-service': 'payment-service'
        }
      }
    );

    console.log(`[webhook] Order ${orderId} confirmed successfully`);
  } catch (error) {
    console.error('[webhook] Error handling payment success:', error.message);
    // Don't throw - webhook already succeeded, log for manual review
  }
};

/**
 * Handle failed payment
 * Updates order status to CANCELLED and releases inventory
 */
const handlePaymentFailure = async (session) => {
  const { orderId, userId } = session.metadata;

  console.log(`[webhook] Processing payment failure for order ${orderId}`);

  try {
    // Check if payment already processed (idempotency)
    const existingPayment = await Payment.findOne({
      stripeSessionId: session.id,
      status: 'FAILED'
    });

    if (existingPayment) {
      console.log(`[webhook] Payment ${session.id} already processed as failed, skipping`);
      return;
    }

    // Update payment record
    await Payment.findOneAndUpdate(
      { stripeSessionId: session.id },
      { status: 'FAILED' }
    );

    // Get order details to release inventory
    const orderResponse = await axios.get(
      `${ORDER_SERVICE_URL}/orders/${orderId}/internal`,
      {
        headers: {
          'x-internal-service': 'payment-service'
        }
      }
    );

    const order = orderResponse.data.order;

    // Release inventory for each item
    for (const item of order.items) {
      try {
        await axios.post(
          `${INVENTORY_SERVICE_URL}/release`,
          {
            productId: item.productId,
            quantity: item.quantity
          }
        );
        console.log(`[webhook] Released ${item.quantity} units of product ${item.productId}`);
      } catch (error) {
        console.error(`[webhook] Error releasing inventory for product ${item.productId}:`, error.message);
      }
    }

    // Update order status to CANCELLED
    await axios.patch(
      `${ORDER_SERVICE_URL}/orders/${orderId}/status`,
      { status: 'CANCELLED' },
      {
        headers: {
          'x-user-id': userId,
          'x-internal-service': 'payment-service'
        }
      }
    );

    console.log(`[webhook] Order ${orderId} cancelled and inventory released`);
  } catch (error) {
    console.error('[webhook] Error handling payment failure:', error.message);
    // Don't throw - log for manual review
  }
};

/**
 * Process Stripe webhook events
 */
export const processWebhookEvent = async (event) => {
  const { type, data } = event;
  const session = data.object;

  console.log(`[webhook] Received event: ${type}`);

  switch (type) {
    case 'checkout.session.completed':
      if (session.payment_status === 'paid') {
        await handlePaymentSuccess(session);
      }
      break;

    case 'checkout.session.expired':
    case 'payment_intent.payment_failed':
      await handlePaymentFailure(session);
      break;

    default:
      console.log(`[webhook] Unhandled event type: ${type}`);
  }
};
