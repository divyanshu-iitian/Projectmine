import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import DataTable from '../components/DataTable';
import { getAllProducts, createProduct, updateProduct, deleteProduct } from '../api/products';
import { initInventory, adjustInventory } from '../api/inventory';
import { formatCurrency } from '../utils/formatters';

export default function ProductsManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    imageUrl: '',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await getAllProducts();
      console.log('Products data:', data);
      // Backend returns { products: [...], pagination: {...} }
      const productsList = data.products || data;
      setProducts(Array.isArray(productsList) ? productsList : []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setSubmitting(true);
    
    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        images: formData.imageUrl ? [formData.imageUrl] : [],
      };
      
      const stockQuantity = parseInt(formData.stock);
      
      console.log('Sending product data:', productData);
      
      if (editingProduct) {
        console.log('Updating product:', editingProduct._id);
        const result = await updateProduct(editingProduct._id, productData);
        console.log('Update result:', result);
        
        // Update stock if changed
        if (stockQuantity !== editingProduct.stock) {
          const stockChange = stockQuantity - (editingProduct.stock || 0);
          await adjustInventory(editingProduct._id, stockChange, 'Product update');
        }
        
        // Update the product in state immediately
        setProducts(prevProducts => 
          prevProducts.map(p => 
            p._id === editingProduct._id ? { ...p, ...productData, stock: stockQuantity } : p
          )
        );
      } else {
        console.log('Creating new product');
        const result = await createProduct(productData);
        console.log('Create result:', result);
        
        // Initialize inventory for the new product
        const productId = result._id || result.product?._id;
        if (productId) {
          try {
            await initInventory(productId, stockQuantity);
            console.log('Inventory initialized for product:', productId);
          } catch (invError) {
            console.error('Failed to initialize inventory:', invError);
            // Continue even if inventory init fails
          }
        }
        
        // Add the new product to state immediately
        const newProduct = { 
          ...(result.product || result), 
          stock: stockQuantity,
          stockQuantity: stockQuantity 
        };
        setProducts(prevProducts => [...prevProducts, newProduct]);
      }
      
      handleCloseModal();
      alert('Product saved successfully!');
    } catch (error) {
      console.error('Failed to save product:', error);
      alert(error.response?.data?.message || error.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock,
      imageUrl: product.images?.[0] || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (product) => {
    if (window.confirm(`Delete ${product.name}?`)) {
      try {
        await deleteProduct(product._id);
        
        // Remove the product from state immediately
        setProducts(prevProducts => 
          prevProducts.filter(p => p._id !== product._id)
        );
        
        alert('Product deleted successfully!');
      } catch (error) {
        console.error('Failed to delete product:', error);
        alert('Failed to delete product');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData({ name: '', description: '', price: '', category: '', stock: '', imageUrl: '' });
  };

  const columns = [
    { key: 'name', label: 'Product Name' },
    { key: 'category', label: 'Category' },
    {
      key: 'price',
      label: 'Price',
      render: (price) => formatCurrency(price),
    },
    { key: 'stock', label: 'Stock' },
  ];

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="ml-64 flex-1 p-8 flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-[#d4af37]/30 border-t-[#d4af37] rounded-full animate-spin"></div>
            <p className="text-gray-400 text-lg">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      
      <div className="ml-64 flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Products Management</h1>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#d4af37] to-[#b8860b] text-[#0a0a0f] rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus size={20} />
            Add Product
          </button>
        </div>

        <div className="glass rounded-xl overflow-hidden">
          <DataTable
            columns={columns}
            data={products}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="glass p-8 rounded-2xl max-w-md w-full">
              <h2 className="text-2xl font-bold mb-6">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Product Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    rows="3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  />
                  {formData.imageUrl && (
                    <img 
                      src={formData.imageUrl} 
                      alt="Preview" 
                      className="mt-2 w-full h-32 object-cover rounded-lg"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Stock
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-white/5 text-gray-300 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-[#d4af37] to-[#b8860b] text-[#0a0a0f] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : (editingProduct ? 'Update' : 'Create')}
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
