import dotenv from 'dotenv';
dotenv.config();

const config = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET,
  authServiceUrl: process.env.AUTH_SERVICE_URL || 'http://auth-service:4000',
  productServiceUrl: process.env.PRODUCT_SERVICE_URL || 'http://product-service:5000',
  inventoryServiceUrl: process.env.INVENTORY_SERVICE_URL || 'http://inventory-service:6000',
  orderServiceUrl: process.env.ORDER_SERVICE_URL || 'http://order-service:7000',
  paymentServiceUrl: process.env.PAYMENT_SERVICE_URL || 'http://payment-service:8000',
};

if (!config.jwtSecret) {
  console.warn('[api-gateway] Warning: JWT_SECRET is not set; JWT validation disabled.');
}

export default config;