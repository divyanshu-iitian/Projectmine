# Payment Service - Stripe Integration Guide

## Overview

The Payment Service handles secure payment processing using Stripe Checkout. It coordinates with the Order Service to confirm or cancel orders based on payment status and manages inventory rollback on payment failures.

## Architecture

```
User → API Gateway → Payment Service → Stripe
                          ↓
                    Order Service ← Stripe Webhooks
                          ↓
                    Inventory Service
```

## Key Features

- ✅ **Stripe Checkout Sessions**: Secure hosted payment pages
- ✅ **Webhook Handling**: Processes Stripe events (success/failure)
- ✅ **Order Orchestration**: Updates order status based on payment outcome
- ✅ **Inventory Rollback**: Releases inventory on payment failure
- ✅ **Idempotency**: Prevents duplicate webhook processing
- ✅ **Payment Auditing**: MongoDB persistence for financial records

## API Endpoints

### 1. Create Checkout Session (Authenticated)
```http
POST /payments/create-session
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "orderId": "6958e1369235ba086d317435"
}
```

**Response (200 OK):**
```json
{
  "checkoutUrl": "https://checkout.stripe.com/pay/cs_test_...",
  "sessionId": "cs_test_a1b2c3d4e5f6"
}
```

**Validation:**
- Order must exist
- Order status must be `PENDING`
- User must be authenticated
- No duplicate payment for same order

### 2. Get Payment Status (Authenticated)
```http
GET /payments/status/:orderId
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK):**
```json
{
  "orderId": "6958e1369235ba086d317435",
  "status": "INITIATED",
  "amount": 199.98,
  "currency": "usd",
  "createdAt": "2026-01-03T10:15:30.000Z"
}
```

### 3. Stripe Webhook (Public, Signature-Verified)
```http
POST /payments/webhook
Stripe-Signature: t=1609459200,v1=abc123...
Content-Type: application/json

[Stripe Event Payload]
```

**Handled Events:**
- `checkout.session.completed` → Order CONFIRMED
- `checkout.session.expired` → Order CANCELLED + Inventory Released
- `payment_intent.payment_failed` → Order CANCELLED + Inventory Released

## Setup Instructions

### 1. Get Stripe API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Copy your **Publishable key** and **Secret key** (use test keys for development)
3. Update `.env` file:

```env
STRIPE_SECRET_KEY=sk_test_51QcqwlP38n9KZLVv... (your actual key)
STRIPE_WEBHOOK_SECRET=whsec_test_abcdef...     (from webhook setup)
```

### 2. Configure Stripe Webhooks (for local testing)

#### Option A: Using Stripe CLI (Recommended)
```bash
# Install Stripe CLI
# Download from: https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Forward webhooks to local payment service
stripe listen --forward-to http://localhost:8000/webhook

# Copy the webhook signing secret starting with "whsec_..."
# Update .env with: STRIPE_WEBHOOK_SECRET=whsec_...
```

#### Option B: ngrok (for public webhook endpoint)
```bash
# Install ngrok: https://ngrok.com/
ngrok http 8000

# Use the ngrok URL in Stripe Dashboard:
# https://dashboard.stripe.com/test/webhooks
# Add endpoint: https://your-ngrok-url.ngrok.io/webhook
# Select events: checkout.session.completed, checkout.session.expired
```

### 3. Restart Services
```bash
docker-compose up -d --build payment-service
```

## Testing Payment Flow

### End-to-End Test

```powershell
# 1. Login as user
$body = @{ email = 'testuser@example.com'; password = 'password123' } | ConvertTo-Json
$response = Invoke-RestMethod -Uri 'http://localhost:3000/auth/login' -Method Post -Body $body -ContentType 'application/json'
$userToken = $response.token

# 2. Create an order (assuming product exists with inventory)
$headers = @{ Authorization = "Bearer $userToken" }
$body = @{ items = @(@{ productId = '<PRODUCT_ID>'; quantity = 2 }) } | ConvertTo-Json -Depth 3
$response = Invoke-RestMethod -Uri 'http://localhost:3000/orders' -Method Post -Headers $headers -Body $body -ContentType 'application/json'
$orderId = $response.order._id
Write-Host "Order created: $orderId with status $($response.order.status)"

# 3. Create payment session
$body = @{ orderId = $orderId } | ConvertTo-Json
$response = Invoke-RestMethod -Uri 'http://localhost:3000/payments/create-session' -Method Post -Headers $headers -Body $body -ContentType 'application/json'
Write-Host "Payment URL: $($response.checkoutUrl)"

# 4. Visit the checkout URL in browser, complete test payment
# Use test card: 4242 4242 4242 4242, any future expiry, any CVC

# 5. Check order status after payment
$response = Invoke-RestMethod -Uri "http://localhost:3000/orders/$orderId" -Method Get -Headers $headers
Write-Host "Order status: $($response.order.status)"  # Should be CONFIRMED
```

## Webhook Event Flow

### Payment Success
```
1. User completes payment on Stripe Checkout
2. Stripe sends checkout.session.completed webhook
3. Payment Service verifies signature
4. Updates Payment record → status = SUCCESS
5. Calls Order Service → order status = CONFIRMED
6. Inventory remains reserved (permanent sale)
```

### Payment Failure
```
1. Payment fails or session expires
2. Stripe sends payment_intent.payment_failed or checkout.session.expired
3. Payment Service verifies signature
4. Updates Payment record → status = FAILED
5. Fetches order details (internal API)
6. Releases inventory for each item
7. Calls Order Service → order status = CANCELLED
```

## Security Features

### 1. Webhook Signature Verification
```javascript
// Verifies authenticity of Stripe webhooks
const event = stripe.webhooks.constructEvent(
  rawBody,
  signature,
  process.env.STRIPE_WEBHOOK_SECRET
);
```

### 2. Idempotency
```javascript
// Prevents duplicate processing
const existingPayment = await Payment.findOne({
  stripeSessionId: session.id,
  status: 'SUCCESS'
});
if (existingPayment) {
  console.log('Payment already processed, skipping');
  return;
}
```

### 3. Internal Service Authentication
```javascript
// Only payment-service can call internal order endpoints
if (internalService !== 'payment-service') {
  return res.status(403).json({ error: 'Forbidden' });
}
```

## Database Schema

### Payment Model
```javascript
{
  _id: ObjectId,
  orderId: ObjectId,              // Reference to Order
  stripeSessionId: String,        // Unique Stripe session ID
  amount: Number,                 // Amount in dollars (e.g., 199.98)
  currency: String,               // 'usd' (default)
  status: 'INITIATED' | 'SUCCESS' | 'FAILED',
  metadata: {
    paymentIntent: String,        // Added on success
    customerEmail: String,        // Added on success
    userId: String,               // User who created payment
    userEmail: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

## Environment Variables

```env
PORT=8000
MONGODB_URI=mongodb://mongodb:27017/paymentdb
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
ORDER_SERVICE_URL=http://order-service:7000
INVENTORY_SERVICE_URL=http://inventory-service:6000
```

## Error Handling

| Error | Status | Cause |
|-------|--------|-------|
| `orderId is required` | 400 | Missing orderId in request |
| `User not authenticated` | 401 | Missing JWT token |
| `Order not found` | 404 | Invalid orderId |
| `Cannot create payment for order with status: CONFIRMED` | 400 | Order already paid |
| `Payment already completed` | 400 | Duplicate payment attempt |
| `Failed to create payment session` | 500 | Stripe API error (check logs) |
| `Invalid signature` | 400 | Webhook signature verification failed |

## Logs & Monitoring

```bash
# View payment service logs
docker-compose logs payment-service -f

# Check webhook processing
docker-compose logs payment-service | grep webhook

# Check Stripe errors
docker-compose logs payment-service | grep stripe.service
```

## Testing with Stripe Test Cards

```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
Auth Required: 4000 0027 6000 3184

Expiry: Any future date (e.g., 12/34)
CVC: Any 3 digits (e.g., 123)
```

## Production Deployment Notes

1. **Switch to Live Keys**: Replace `sk_test_...` with `sk_live_...` in production
2. **Configure Production Webhooks**: Add your production domain in Stripe Dashboard
3. **Enable HTTPS**: Stripe requires HTTPS for production webhooks
4. **Set Proper Success/Cancel URLs**: Update `FRONTEND_URL` environment variable
5. **Monitor Webhook Delivery**: Use Stripe Dashboard to track webhook events

## Troubleshooting

### "Invalid API Key provided"
→ Update `.env` with real Stripe test keys from dashboard

### "No webhook signature"
→ Ensure Stripe CLI is forwarding webhooks or ngrok is configured

### "Order not found" when creating payment
→ Verify order exists and status is PENDING

### Webhook not triggering order status update
→ Check `docker-compose logs payment-service` for signature verification errors

---

**Next Steps**: Once Stripe keys are configured, test the complete flow from order creation → payment → order confirmation!
