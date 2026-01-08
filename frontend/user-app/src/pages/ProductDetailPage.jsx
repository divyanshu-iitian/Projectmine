import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { productsAPI } from '../api/products';
import { useCartStore } from '../store/cartStore';
import { ShoppingCart, Heart, Star, Truck, Shield, RotateCcw, Share2, ChevronLeft, ChevronRight, Check } from 'lucide-react';

export function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [wishlist, setWishlist] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const data = await productsAPI.getById(id);
      setProduct(data.product || data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
      // Show success message
      alert(`Added ${quantity} ${product.name} to cart!`);
    }
  };

  const handleBuyNow = () => {
    if (product) {
      addItem(product, quantity);
      navigate('/cart');
    }
  };

  const nextImage = () => {
    if (product?.images && product.images.length > 0) {
      setSelectedImage((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (product?.images && product.images.length > 0) {
      setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center bg-[#0B0B0F]">
        <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center bg-[#0B0B0F]">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Product not found'}</p>
          <button
            onClick={() => navigate('/products')}
            className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const isInStock = (product.stockQuantity || product.stock || 0) > 0;
  const images = product.images && product.images.length > 0 
    ? product.images 
    : ['https://via.placeholder.com/600x600?text=' + encodeURIComponent(product.name)];

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-[#0B0B0F]">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-muted flex items-center gap-2">
          <button onClick={() => navigate('/products')} className="hover:text-purple-400">
            Products
          </button>
          <span>/</span>
          <span className="text-white">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative aspect-square rounded-2xl overflow-hidden glass group"
            >
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/600x600?text=' + encodeURIComponent(product.name);
                }}
              />
              
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight />
                  </button>
                </>
              )}

              {!isInStock && (
                <div className="absolute top-4 right-4 bg-red-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-full font-semibold">
                  Out of Stock
                </div>
              )}
            </motion.div>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === idx
                        ? 'border-purple-500 scale-105'
                        : 'border-white/10 hover:border-purple-500/50'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/150?text=' + (idx + 1);
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{product.name}</h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className={i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}
                    />
                  ))}
                  <span className="text-muted ml-2">(4.0) 127 reviews</span>
                </div>
              </div>
            </div>

            <div className="flex items-baseline gap-4">
              <span className="text-5xl font-bold gradient-text">
                ${product.price?.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="text-2xl text-muted line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>

            <p className="text-lg text-muted leading-relaxed">
              {product.description}
            </p>

            {/* Stock & Category */}
            <div className="flex items-center gap-6 py-4 border-y border-white/10">
              <div>
                <span className="text-muted">Category:</span>
                <span className="ml-2 text-purple-400 font-medium">{product.category}</span>
              </div>
              <div>
                <span className="text-muted">Stock:</span>
                <span className={`ml-2 font-medium ${isInStock ? 'text-green-400' : 'text-red-400'}`}>
                  {isInStock ? `${product.stockQuantity || product.stock} units` : 'Out of Stock'}
                </span>
              </div>
            </div>

            {/* Quantity Selector */}
            {isInStock && (
              <div className="flex items-center gap-4">
                <span className="text-white font-medium">Quantity:</span>
                <div className="flex items-center gap-3 glass rounded-lg px-4 py-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="text-2xl text-white hover:text-purple-400 transition-colors"
                  >
                    -
                  </button>
                  <span className="text-xl font-bold text-white w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stockQuantity || product.stock || 99, quantity + 1))}
                    className="text-2xl text-white hover:text-purple-400 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={!isInStock}
                className="flex-1 py-4 px-6 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart size={20} />
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                disabled={!isInStock}
                className="flex-1 py-4 px-6 bg-white text-black rounded-xl font-semibold hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Buy Now
              </button>
              <button
                onClick={() => setWishlist(!wishlist)}
                className="p-4 glass rounded-xl hover:bg-white/10 transition-colors"
              >
                <Heart size={24} className={wishlist ? 'fill-red-500 text-red-500' : 'text-white'} />
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-6">
              <div className="text-center p-4 glass rounded-xl">
                <Truck className="mx-auto mb-2 text-purple-400" size={24} />
                <p className="text-sm text-muted">Free Delivery</p>
              </div>
              <div className="text-center p-4 glass rounded-xl">
                <Shield className="mx-auto mb-2 text-purple-400" size={24} />
                <p className="text-sm text-muted">Secure Payment</p>
              </div>
              <div className="text-center p-4 glass rounded-xl">
                <RotateCcw className="mx-auto mb-2 text-purple-400" size={24} />
                <p className="text-sm text-muted">Easy Returns</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-16">
          <div className="flex gap-6 border-b border-white/10 mb-8">
            {['description', 'specifications', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 px-2 font-medium capitalize transition-colors relative ${
                  activeTab === tab ? 'text-purple-400' : 'text-muted hover:text-white'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500"
                  />
                )}
              </button>
            ))}
          </div>

          <div className="glass rounded-2xl p-8">
            {activeTab === 'description' && (
              <div className="prose prose-invert max-w-none">
                <h3 className="text-2xl font-bold text-white mb-4">Product Description</h3>
                <p className="text-muted leading-relaxed">{product.description}</p>
                <div className="mt-6">
                  <h4 className="text-xl font-semibold text-white mb-3">Key Features</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-muted">
                      <Check className="text-green-400 mt-1 flex-shrink-0" size={18} />
                      High quality materials and craftsmanship
                    </li>
                    <li className="flex items-start gap-2 text-muted">
                      <Check className="text-green-400 mt-1 flex-shrink-0" size={18} />
                      Designed for durability and long-lasting performance
                    </li>
                    <li className="flex items-start gap-2 text-muted">
                      <Check className="text-green-400 mt-1 flex-shrink-0" size={18} />
                      Backed by manufacturer warranty
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">Specifications</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-lg">
                    <span className="text-muted">Category</span>
                    <p className="text-white font-medium mt-1">{product.category}</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg">
                    <span className="text-muted">Stock</span>
                    <p className="text-white font-medium mt-1">{product.stockQuantity || product.stock} units</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg">
                    <span className="text-muted">SKU</span>
                    <p className="text-white font-medium mt-1">{product._id?.slice(-8).toUpperCase()}</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg">
                    <span className="text-muted">Weight</span>
                    <p className="text-white font-medium mt-1">1.2 kg</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">Customer Reviews</h3>
                <div className="space-y-6">
                  {[1, 2, 3].map((review) => (
                    <div key={review} className="p-6 bg-white/5 rounded-xl">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="text-white font-semibold">John Doe</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={14}
                                  className={i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-muted">2 days ago</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-muted">
                        Great product! Exactly as described. Fast shipping and excellent quality.
                        Would definitely recommend to others.
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
