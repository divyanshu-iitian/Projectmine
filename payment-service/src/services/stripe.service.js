import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Create a Stripe Checkout Session
 * @param {Object} params - Session parameters
 * @param {string} params.orderId - Order ID
 * @param {number} params.amount - Amount in cents
 * @param {string} params.currency - Currency code
 * @param {string} params.userId - User ID for metadata
 * @returns {Promise<Object>} Stripe session object
 */
export const createCheckoutSession = async ({ orderId, amount, currency, userId }) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: currency || 'usd',
            product_data: {
              name: `Order ${orderId}`,
              description: 'E-commerce order payment'
            },
            unit_amount: amount // amount in cents
          },
          quantity: 1
        }
      ],
      metadata: {
        orderId: orderId.toString(),
        userId: userId.toString()
      },
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/cancel?order_id=${orderId}`
    });

    return session;
  } catch (error) {
    console.error('[stripe.service] Error creating checkout session:', error);
    throw new Error('Failed to create Stripe checkout session');
  }
};

/**
 * Verify Stripe webhook signature
 * @param {string} payload - Raw request body
 * @param {string} signature - Stripe signature header
 * @returns {Object} Verified event object
 */
export const verifyWebhookSignature = (payload, signature) => {
  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    return event;
  } catch (error) {
    console.error('[stripe.service] Webhook signature verification failed:', error.message);
    throw new Error('Invalid webhook signature');
  }
};

/**
 * Retrieve a checkout session by ID
 * @param {string} sessionId - Stripe session ID
 * @returns {Promise<Object>} Session object
 */
export const retrieveSession = async (sessionId) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return session;
  } catch (error) {
    console.error('[stripe.service] Error retrieving session:', error);
    throw new Error('Failed to retrieve Stripe session');
  }
};
