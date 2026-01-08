import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { productsAPI } from '../api/products';
import { useCartStore } from '../store/cartStore';
import { ShoppingCart, Loader2 } from 'lucide-react';

export function ProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productsAPI.getAll();
      setProducts(data.products || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    addItem(product, 1);
    // Optional: Show toast notification
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchProducts}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-[#0B0B0F]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white">
            Premium <span className="gradient-text">Collection</span>
          </h1>
          <p className="text-lg text-muted">
            Curated products powered by real-time microservices
          </p>
        </motion.div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-20 glass rounded-2xl">
            <p className="text-muted text-lg mb-2">No products available</p>
            <p className="text-sm text-[#d4af37]">Start backend: docker-compose up -d</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <ProductCard
                key={product._id}
                product={product}
                onAddToCart={handleAddToCart}
                onViewDetails={() => navigate(`/products/${product._id}`)}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({ product, onAddToCart, onViewDetails, index }) {
  const isInStock = product.stockQuantity > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      className="group relative bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden hover:border-[#d4af37]/30 transition-all duration-500 cursor-pointer"
      onClick={onViewDetails}
    >
      {/* Product Image */}
      <div className="relative h-56 bg-gradient-to-br from-[#d4af37]/10 via-[#b8860b]/10 to-[#ffd700]/10 overflow-hidden">
        {product.images && product.images.length > 0 ? (
          <img 
            src={product.images[0]} 
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{ display: product.images && product.images.length > 0 ? 'none' : 'flex' }}
        >
          <div className="text-7xl font-bold text-white/5 group-hover:text-white/10 transition-colors">
            {product.name.charAt(0)}
          </div>
        </div>
        {!isInStock && (
          <div className="absolute top-3 right-3 bg-red-500/90 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">
            Out of Stock
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-[#faf8f3] mb-2 line-clamp-1">
          {product.name}
        </h3>
        <p className="text-sm text-muted mb-4 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between mb-5">
          <span className="text-3xl font-bold gradient-text">
            ${product.price.toFixed(2)}
          </span>
          <span className="text-sm text-muted">
            {product.stockQuantity} in stock
          </span>
        </div>

        <button
          onClick={() => onAddToCart(product)}
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
          disabled={!isInStock}
          className={`w-full py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
            isInStock
              ? 'bg-gradient-to-r from-[#d4af37] to-[#b8860b] text-[#0a0a0f] hover:shadow-lg hover:shadow-[#d4af37]/30'
              : 'bg-white/5 text-muted cursor-not-allowed'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          {isInStock ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </motion.div>
  );
}
