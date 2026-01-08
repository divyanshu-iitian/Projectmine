import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { ordersAPI } from '../api/orders';
import { paymentsAPI } from '../api/payments';
import { Loader2, CreditCard } from 'lucide-react';

export function CheckoutPage() {
  const navigate = useNavigate();
  const { items, getTotal, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      // Step 1: Create order
      const orderItems = items.map((item) => ({
        productId: item.product._id,
        quantity: item.quantity,
        price: item.product.price,
      }));

      const orderResponse = await ordersAPI.create({ items: orderItems });
      const orderId = orderResponse.order._id;

      // Step 2: Create Stripe checkout session
      const paymentResponse = await paymentsAPI.createCheckout(orderId);

      // Clear cart
      clearCart();

      // Redirect to Stripe
      if (paymentResponse.url) {
        window.location.href = paymentResponse.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Checkout failed. Please try again.');
      setLoading(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold mb-8 text-center">
            <span className="gradient-text">Checkout</span>
          </h1>

          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-6">
              {items.map((item) => (
                <div key={item.product._id} className="flex justify-between text-gray-700">
                  <span>
                    {item.product.name} x {item.quantity}
                  </span>
                  <span>${(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between text-2xl font-bold">
                <span>Total</span>
                <span className="text-primary">${getTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Payment Method</h2>
            
            <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <CreditCard className="w-6 h-6 text-primary" />
                <h3 className="font-semibold text-gray-800">Secure Payment with Stripe</h3>
              </div>
              <p className="text-sm text-gray-600">
                You will be redirected to Stripe's secure payment page to complete your purchase.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full py-4 bg-primary text-white rounded-lg font-semibold text-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Pay ${getTotal().toFixed(2)} with Stripe
                </>
              )}
            </button>

            <button
              onClick={() => navigate('/cart')}
              className="w-full mt-3 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Back to Cart
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
