import { useEffect, useState } from 'react';
import { DollarSign, ShoppingBag, Package, Users, TrendingUp, RefreshCw } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import StatsCard from '../components/StatsCard';
import { getAnalyticsSummary, getRevenueAnalytics, getOrderAnalytics } from '../api/analytics';
import { getAllProducts } from '../api/products';
import { formatCurrency } from '../utils/formatters';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [orderData, setOrderData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const [summaryRes, revenueRes, orderRes, productsRes] = await Promise.all([
        getAnalyticsSummary(),
        getRevenueAnalytics(),
        getOrderAnalytics(),
        getAllProducts(),
      ]);

      console.log('Dashboard data:', { summaryRes, revenueRes, orderRes, productsRes });
      
      // Get actual product count
      const productCount = productsRes?.products?.length || productsRes?.length || 0;
      
      // Merge summary with real product count
      const summaryWithProducts = {
        ...summaryRes,
        totalProducts: productCount
      };
      
      setSummary(summaryWithProducts);
      setRevenueData(Array.isArray(revenueRes?.dailyRevenue) ? revenueRes.dailyRevenue : (Array.isArray(revenueRes) ? revenueRes : []));
      setOrderData(Array.isArray(orderRes?.ordersByStatus) ? orderRes.ordersByStatus : (Array.isArray(orderRes) ? orderRes : []));
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="ml-64 flex-1 p-8 flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-[#d4af37]/30 border-t-[#d4af37] rounded-full animate-spin"></div>
            <p className="text-gray-400 text-lg">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      
      <div className="ml-64 flex-1 p-8 min-h-screen">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold mb-2">
              <span className="gradient-text">Dashboard</span>
            </h1>
            <p className="text-gray-400">Welcome back! Here's what's happening today.</p>
          </div>
          <button
            onClick={fetchData}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all disabled:opacity-50"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Revenue"
            value={formatCurrency(summary?.totalRevenue || 0)}
            icon={DollarSign}
            trend="up"
            trendValue="12.5%"
          />
          <StatsCard
            title="Total Orders"
            value={summary?.totalOrders || 0}
            icon={ShoppingBag}
            trend="up"
            trendValue="8.2%"
          />
          <StatsCard
            title="Total Products"
            value={summary?.totalProducts || 0}
            icon={Package}
          />
          <StatsCard
            title="Total Users"
            value={summary?.totalUsers || 0}
            icon={Users}
            trend="up"
            trendValue="5.1%"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass p-6 rounded-xl border border-white/10 shadow-xl"
          >
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="text-[#d4af37]" size={24} />
              <h2 className="text-xl font-semibold">Revenue Trend</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A855F7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#A855F7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.3} />
                <XAxis dataKey="date" stroke="#888" fontSize={12} />
                <YAxis stroke="#888" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    padding: '12px'
                  }}
                  labelStyle={{ color: '#fff', marginBottom: '8px' }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#A855F7"
                  strokeWidth={3}
                  dot={{ fill: '#A855F7', r: 4 }}
                  activeDot={{ r: 6, fill: '#6366F1' }}
                  fill="url(#colorRevenue)"
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Orders Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass p-6 rounded-xl border border-white/10 shadow-xl"
          >
            <div className="flex items-center gap-2 mb-6">
              <ShoppingBag className="text-indigo-400" size={24} />
              <h2 className="text-xl font-semibold">Orders by Status</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={orderData}>
                <defs>
                  <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={1}/>
                    <stop offset="95%" stopColor="#A855F7" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.3} />
                <XAxis dataKey="status" stroke="#888" fontSize={12} />
                <YAxis stroke="#888" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    padding: '12px'
                  }}
                  labelStyle={{ color: '#fff', marginBottom: '8px' }}
                />
                <Bar
                  dataKey="count"
                  fill="url(#colorBar)"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={60}
                />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
