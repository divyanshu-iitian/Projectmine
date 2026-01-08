import axios from 'axios';

const API_GATEWAY = 'http://localhost:3000';

// Admin credentials
const ADMIN_EMAIL = 'admin@mishop.com';
const ADMIN_PASSWORD = 'admin123';

async function syncInventory() {
  try {
    console.log('🔐 Logging in as admin...');
    const loginRes = await axios.post(`${API_GATEWAY}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });

    const token = loginRes.data.token;
    console.log('✅ Logged in successfully!\n');

    // Get all products
    console.log('📦 Fetching all products...');
    const productsRes = await axios.get(`${API_GATEWAY}/products?limit=100`);
    const products = productsRes.data.products || [];
    console.log(`Found ${products.length} products\n`);

    if (products.length === 0) {
      console.log('❌ No products found to sync');
      return;
    }

    // Sync each product to inventory with default stock of 50
    console.log('🔄 Syncing inventory...\n');
    for (const product of products) {
      try {
        // Set default stock to 50 for all products
        const stockQuantity = 50;

        await axios.post(
          `${API_GATEWAY}/inventory/init`,
          {
            productId: product._id,
            quantity: stockQuantity,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log(`✅ ${product.name.padEnd(30)} → ${stockQuantity} units`);
      } catch (err) {
        if (err.response?.status === 400 && err.response?.data?.message?.includes('already exists')) {
          console.log(`⚠️  ${product.name.padEnd(30)} → Already in inventory`);
        } else {
          console.error(`❌ ${product.name.padEnd(30)} → Error: ${err.response?.data?.message || err.message}`);
        }
      }
    }

    console.log('\n✨ Inventory sync completed!');
    console.log('🔍 Verifying stock levels...\n');

    // Verify by fetching products again
    const verifyRes = await axios.get(`${API_GATEWAY}/products?limit=100`);
    const updatedProducts = verifyRes.data.products || [];

    console.log('Product Name'.padEnd(30) + 'Stock');
    console.log('─'.repeat(45));
    updatedProducts.forEach(p => {
      const stockDisplay = p.stockQuantity > 0 
        ? `${p.stockQuantity} ✅` 
        : '0 ❌';
      console.log(`${p.name.padEnd(30)} ${stockDisplay}`);
    });

  } catch (error) {
    console.error('❌ Sync failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

syncInventory();
