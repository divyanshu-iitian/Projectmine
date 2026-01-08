import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import config from './config/index.js';
import { verifyJwt, verifyAndForwardUser } from './middlewares/jwt.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Example of gateway-side JWT validation for a protected route
// Applies to /auth/verify while still forwarding the request
app.use(
  '/auth/verify',
  verifyJwt,
  createProxyMiddleware({
    target: config.authServiceUrl,
    changeOrigin: true,
    pathRewrite: { '^/auth': '/auth' },
  })
);

// Forward all /auth/* routes to the auth-service
app.use(
  '/auth',
  createProxyMiddleware({
    target: config.authServiceUrl,
    changeOrigin: true,
    pathRewrite: { '^/auth': '/auth' },
    onProxyReq: (proxyReq, req, res) => {
      if (req.body && Object.keys(req.body).length) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },
  })
);

// Forward all /products/* routes to the product-service
// User info extracted from JWT and forwarded as headers
app.use(
  '/products',
  verifyAndForwardUser,
  createProxyMiddleware({
    target: config.productServiceUrl,
    changeOrigin: true,
    pathRewrite: { '^/products': '/products' },
    onProxyReq: (proxyReq, req, res) => {
      // Forward user headers if present
      if (req.headers['x-user-id']) {
        proxyReq.setHeader('x-user-id', req.headers['x-user-id']);
        proxyReq.setHeader('x-user-email', req.headers['x-user-email']);
        proxyReq.setHeader('x-user-role', req.headers['x-user-role']);
      }
      if (req.body && Object.keys(req.body).length) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },
  })
);

// Forward all /inventory/* routes to the inventory-service
// User info extracted from JWT and forwarded as headers
app.use(
  '/inventory',
  verifyAndForwardUser,
  createProxyMiddleware({
    target: config.inventoryServiceUrl,
    changeOrigin: true,
    pathRewrite: { '^/inventory': '/inventory' },
    onProxyReq: (proxyReq, req, res) => {
      // Forward user headers if present
      if (req.headers['x-user-id']) {
        proxyReq.setHeader('x-user-id', req.headers['x-user-id']);
        proxyReq.setHeader('x-user-email', req.headers['x-user-email']);
        proxyReq.setHeader('x-user-role', req.headers['x-user-role']);
      }
      if (req.body && Object.keys(req.body).length) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },
  })
);

// Forward all /orders/* routes to the order-service
// User info extracted from JWT and forwarded as headers
app.use(
  '/orders',
  verifyAndForwardUser,
  createProxyMiddleware({
    target: config.orderServiceUrl,
    changeOrigin: true,
    pathRewrite: { '^/orders': '/orders' },
    onProxyReq: (proxyReq, req, res) => {
      // Forward user headers if present
      if (req.headers['x-user-id']) {
        proxyReq.setHeader('x-user-id', req.headers['x-user-id']);
        proxyReq.setHeader('x-user-email', req.headers['x-user-email']);
        proxyReq.setHeader('x-user-role', req.headers['x-user-role']);
      }
      if (req.body && Object.keys(req.body).length) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },
  })
);

// Forward /payments/webhook to payment-service WITHOUT JWT verification
// Stripe webhooks need to reach the service directly for signature verification
app.use(
  '/payments/webhook',
  createProxyMiddleware({
    target: config.paymentServiceUrl,
    changeOrigin: true,
    pathRewrite: { '^/payments': '' },
    onProxyReq: (proxyReq, req, res) => {
      // Forward Stripe signature header
      if (req.headers['stripe-signature']) {
        proxyReq.setHeader('stripe-signature', req.headers['stripe-signature']);
      }
      // Don't parse body - payment service needs raw body for signature verification
    },
  })
);

// Forward all other /payments/* routes to the payment-service
// User info extracted from JWT and forwarded as headers
app.use(
  '/payments',
  verifyAndForwardUser,
  createProxyMiddleware({
    target: config.paymentServiceUrl,
    changeOrigin: true,
    pathRewrite: { '^/payments': '' },
    onProxyReq: (proxyReq, req, res) => {
      // Forward user headers if present
      if (req.headers['x-user-id']) {
        proxyReq.setHeader('x-user-id', req.headers['x-user-id']);
        proxyReq.setHeader('x-user-email', req.headers['x-user-email']);
        proxyReq.setHeader('x-user-role', req.headers['x-user-role']);
      }
      if (req.body && Object.keys(req.body).length) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },
  })
);

// Basic error handler to avoid leaking internal details
app.use((err, req, res, next) => {
  console.error('[api-gateway] Error:', err);
  res.status(500).json({ error: { message: 'Gateway error' } });
});

app.listen(config.port, () => {
  console.log(`[api-gateway] Listening on port ${config.port}`);
});