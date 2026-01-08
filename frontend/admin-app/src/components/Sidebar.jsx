import { Home, Package, ShoppingCart, BarChart3, LogOut, ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAdminAuthStore } from '../store/adminAuthStore';
import { motion } from 'framer-motion';

export default function Sidebar() {
  const location = useLocation();
  const { logout, user } = useAdminAuthStore();

  const menuItems = [
    { name: 'Dashboard', icon: Home, path: '/' },
    { name: 'Products', icon: Package, path: '/products' },
    { name: 'Inventory', icon: BarChart3, path: '/inventory' },
    { name: 'Orders', icon: ShoppingCart, path: '/orders' },
  ];

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <div className="w-64 h-screen fixed left-0 top-0 glass border-r border-white/10 flex flex-col shadow-2xl">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-bold gradient-text mb-1"
        >
          MiShop Admin
        </motion.h1>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-2 mt-2"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-sm font-bold">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div>
            <p className="text-sm font-medium text-white">{user?.name || 'Admin'}</p>
            <p className="text-xs text-gray-400">Administrator</p>
          </div>
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <motion.li
                key={item.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={item.path}
                  className={`group flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-white border border-purple-500/30 shadow-lg shadow-purple-500/10'
                      : 'text-gray-400 hover:text-white hover:bg-white/5 hover:translate-x-1'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={20} className={isActive ? 'text-purple-400' : ''} />
                    <span className="font-medium">{item.name}</span>
                  </div>
                  {isActive && <ChevronRight size={16} className="text-purple-400" />}
                </Link>
              </motion.li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all group"
        >
          <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
