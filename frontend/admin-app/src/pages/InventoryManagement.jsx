import { useEffect, useState } from 'react';
import { Package } from 'lucide-react';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import DataTable from '../components/DataTable';
import { getAllProducts } from '../api/products';
import { getInventoryStatus, adjustInventory } from '../api/inventory';

export default function InventoryManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adjustData, setAdjustData] = useState({ quantity: '', reason: '' });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await getAllProducts();
      console.log('Inventory data:', data);
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustClick = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    try {
      await adjustInventory(
        selectedProduct._id,
        parseInt(adjustData.quantity),
        adjustData.reason
      );
      fetchProducts();
      setShowModal(false);
      setSelectedProduct(null);
      setAdjustData({ quantity: '', reason: '' });
    } catch (error) {
      console.error('Failed to adjust inventory:', error);
      alert(error.response?.data?.message || 'Failed to adjust inventory');
    }
  };

  const columns = [
    { key: 'name', label: 'Product Name' },
    { key: 'category', label: 'Category' },
    {
      key: 'stock',
      label: 'Current Stock',
      render: (stock) => (
        <span className={stock < 10 ? 'text-red-400' : 'text-green-400'}>
          {stock}
        </span>
      ),
    },
    {
      key: '_id',
      label: 'Actions',
      render: (_, product) => (
        <button
          onClick={() => handleAdjustClick(product)}
          className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded hover:bg-purple-500/30 transition-colors"
        >
          Adjust Stock
        </button>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="ml-64 flex-1 p-8 flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
            <p className="text-gray-400 text-lg">Loading inventory...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      
      <div className="ml-64 flex-1 p-8 min-h-screen">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold mb-8"
        >
          <span className="gradient-text">Inventory Management</span>
        </motion.h1>

        <div className="glass rounded-xl overflow-hidden">
          <DataTable columns={columns} data={products} />
        </div>

        {/* Adjust Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="glass p-8 rounded-2xl max-w-md w-full">
              <h2 className="text-2xl font-bold mb-6">Adjust Stock</h2>
              <p className="text-gray-400 mb-4">
                Product: <span className="text-white font-medium">{selectedProduct.name}</span>
              </p>
              <p className="text-gray-400 mb-6">
                Current Stock: <span className="text-white font-medium">{selectedProduct.stock}</span>
              </p>
              
              <form onSubmit={handleAdjustSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Adjustment Quantity (+ to add, - to remove)
                  </label>
                  <input
                    type="number"
                    required
                    value={adjustData.quantity}
                    onChange={(e) => setAdjustData({ ...adjustData, quantity: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    placeholder="e.g., 10 or -5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Reason
                  </label>
                  <select
                    required
                    value={adjustData.reason}
                    onChange={(e) => setAdjustData({ ...adjustData, reason: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="">Select reason</option>
                    <option value="restock">Restock</option>
                    <option value="damaged">Damaged</option>
                    <option value="returned">Returned</option>
                    <option value="adjustment">Manual Adjustment</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setSelectedProduct(null);
                      setAdjustData({ quantity: '', reason: '' });
                    }}
                    className="flex-1 px-4 py-2 bg-white/5 text-gray-300 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Adjust Stock
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
