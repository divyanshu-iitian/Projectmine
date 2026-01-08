import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import DataTable from '../components/DataTable';
import { getOrderAnalytics } from '../api/analytics';
import { formatCurrency, formatDateTime } from '../utils/formatters';

export default function OrdersManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await getOrderAnalytics();
      console.log('Orders data:', data);
      const ordersArray = data.recentOrders || data || [];
      setOrders(Array.isArray(ordersArray) ? ordersArray : []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-500/20 text-yellow-400',
      completed: 'bg-green-500/20 text-green-400',
      cancelled: 'bg-red-500/20 text-red-400',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-500/20 text-gray-400'}`}>
        {status}
      </span>
    );
  };

  const columns = [
    {
      key: '_id',
      label: 'Order ID',
      render: (id) => `#${id.slice(-6)}`,
    },
    {
      key: 'user',
      label: 'Customer',
      render: (user) => user?.name || 'N/A',
    },
    {
      key: 'totalAmount',
      label: 'Amount',
      render: (amount) => formatCurrency(amount),
    },
    {
      key: 'status',
      label: 'Status',
      render: (status) => getStatusBadge(status),
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (date) => formatDateTime(date),
    },
  ];

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="ml-64 flex-1 p-8 flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
            <p className="text-gray-400 text-lg">Loading orders...</p>
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
          <span className="gradient-text">Orders Management</span>
        </motion.h1>

        <div className="glass rounded-xl overflow-hidden">
          <DataTable columns={columns} data={orders} />
        </div>
      </div>
    </div>
  );
}
