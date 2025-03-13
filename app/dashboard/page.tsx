"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ShoppingCart, 
  Inventory, 
  People, 
  TrendingUp, 
  AttachMoney, 
  LocalShipping 
} from '@mui/icons-material';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    pendingOrders: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching dashboard data
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // In a real app, this would be an API call
        // For now, we'll use mock data
        setTimeout(() => {
          setStats({
            totalSales: 12500,
            totalOrders: 150,
            totalProducts: 75,
            totalCustomers: 320,
            pendingOrders: 8,
            revenue: 8750
          });
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    { title: 'Total Sales', value: `$${stats.totalSales.toLocaleString()}`, icon: <AttachMoney className="text-green-500" />, color: 'bg-green-100' },
    { title: 'Total Orders', value: stats.totalOrders, icon: <ShoppingCart className="text-blue-500" />, color: 'bg-blue-100' },
    { title: 'Total Products', value: stats.totalProducts, icon: <Inventory className="text-purple-500" />, color: 'bg-purple-100' },
    { title: 'Total Customers', value: stats.totalCustomers, icon: <People className="text-orange-500" />, color: 'bg-orange-100' },
    { title: 'Pending Orders', value: stats.pendingOrders, icon: <LocalShipping className="text-red-500" />, color: 'bg-red-100' },
    { title: 'Revenue (MTD)', value: `$${stats.revenue.toLocaleString()}`, icon: <TrendingUp className="text-indigo-500" />, color: 'bg-indigo-100' }
  ];

  return (
    <ProtectedRoute>
      <div className="container mx-auto sm:overflow-x-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name || user?.username || 'User'}!</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-10 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {statCards.map((card, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{card.title}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                    </div>
                    <div className={`p-3 rounded-full ${card.color}`}>
                      {card.icon}
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-6 py-3">
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-xs font-medium text-green-500">12% increase</span>
                    <span className="text-xs text-gray-500 ml-1">from last month</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Orders</h2>
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="h-3 bg-gray-200 rounded w-32"></div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {[
                      { id: 'ORD-001', customer: 'John Doe', status: 'Completed', amount: '$120.00' },
                      { id: 'ORD-002', customer: 'Jane Smith', status: 'Processing', amount: '$85.50' },
                      { id: 'ORD-003', customer: 'Robert Johnson', status: 'Pending', amount: '$220.75' },
                      { id: 'ORD-004', customer: 'Emily Davis', status: 'Completed', amount: '$65.25' },
                      { id: 'ORD-005', customer: 'Michael Brown', status: 'Shipped', amount: '$175.00' }
                    ].map((order, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-600">{order.id}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{order.customer}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{order.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="mt-4 text-center">
              <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                View All Orders
              </button>
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Top Products</h2>
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center">
                    <div className="w-12 h-12 bg-gray-200 rounded mr-4"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {[
                  { name: 'Wireless Headphones', category: 'Electronics', sales: 42, image: 'https://unsplash.com/photos/rectangular-brown-cover-VyUdiYH5tiY' },
                  { name: 'Smart Watch', category: 'Electronics', sales: 38, image: 'https://unsplash.com/photos/rectangular-brown-cover-VyUdiYH5tiY' },
                  { name: 'Running Shoes', category: 'Footwear', sales: 35, image: 'https://unsplash.com/photos/rectangular-brown-cover-VyUdiYH5tiY' },
                  { name: 'Coffee Maker', category: 'Kitchen', sales: 31, image: 'https://unsplash.com/photos/rectangular-brown-cover-VyUdiYH5tiY' },
                  { name: 'Backpack', category: 'Accessories', sales: 28, image: 'https://unsplash.com/photos/rectangular-brown-cover-VyUdiYH5tiY' }
                ].map((product, index) => (
                  <div key={index} className="flex items-center">
                    <img src={product.image} alt={product.name} className="w-12 h-12 rounded object-cover mr-4" />
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-800">{product.name}</h3>
                      <p className="text-xs text-gray-500">{product.category}</p>
                    </div>
                    <div className="text-sm font-medium text-gray-900">{product.sales} sold</div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 text-center">
              <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                View All Products
              </button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
