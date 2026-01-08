// Quick script to initialize inventory for all existing products
import Redis from 'ioredis';
import mongoose from 'mongoose';

const redis = new Redis({
  host: 'localhost',
  port: 6379,
});

const MONGO_URI = 'mongodb://localhost:27017/productdb';

async function initializeAllStock() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    
    console.log('📦 Fetching all products...');
    const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
    const products = await Product.find({ isActive: true });
    
    console.log(`✅ Found ${products.length} products\n`);
    
    for (const product of products) {
      const key = `inventory:${product._id}`;
      const existingStock = await redis.get(key);
      
      if (existingStock === null) {
        // Initialize with 50 units
        await redis.set(key, 50);
        console.log(`✅ Initialized: ${product.name} → 50 units`);
      } else {
        console.log(`⏭️  Skipped: ${product.name} → Already has ${existingStock} units`);
      }
    }
    
    console.log('\n🎉 All done!');
    await mongoose.disconnect();
    await redis.quit();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

initializeAllStock();
