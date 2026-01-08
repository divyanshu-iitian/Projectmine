import dotenv from 'dotenv';
dotenv.config();

const config = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI || 'mongodb://mongodb:27017/productdb',
  inventoryServiceUrl: process.env.INVENTORY_SERVICE_URL || 'http://inventory-service:5002',
};

export default config;
