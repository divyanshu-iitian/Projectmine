import dotenv from 'dotenv';
dotenv.config();

const config = {
  port: process.env.PORT || 7000,
  mongoUri: process.env.MONGO_URI || 'mongodb://mongodb:27017/orderdb',
  productServiceUrl: process.env.PRODUCT_SERVICE_URL || 'http://product-service:5000',
  inventoryServiceUrl: process.env.INVENTORY_SERVICE_URL || 'http://inventory-service:6000',
};

export default config;
