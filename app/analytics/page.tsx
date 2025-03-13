"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  CalendarToday,
  TrendingUp,
  FilterList,
  Download
} from '@mui/icons-material';
import DashboardLayout from '@/components/DashboardLayout';

export default function Analytics() {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState('month');
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [customerData, setCustomerData] = useState([]);

  useEffect(() => {
    // Simulate fetching analytics data
    const fetchAnalyticsData = async () => {
      setLoading(true);
      try {
        // In a real app, this would be API calls with the timeframe parameter
        setTimeout(() => {
          // Sample sales data
          const sales = [
            { name: 'Jan', sales: 4000, orders: 240, profit: 2400 },
            { name: 'Feb', sales: 3000, orders: 198, profit: 1800 },
            { name: 'Mar', sales: 5000, orders: 300, profit: 3100 },
            { name: 'Apr', sales: 2780, orders: 190, profit: 1500 },
            { name: 'May', sales: 1890, orders: 130, profit: 1000 },
            { name: 'Jun', sales: 2390, orders: 150, profit: 1300 },
            { name: 'Jul', sales: 3490, orders: 210, profit: 2100 },
            { name: 'Aug', sales: 4000, orders: 240, profit: 2400 },
            { name: 'Sep', sales: 3000, orders: 180, profit: 1800 },
            { name: 'Oct', sales: 2000, orders: 120, profit: 1200 },
            { name: 'Nov', sales: 2780, orders: 170, profit: 1500 },
            { name: 'Dec', sales: 3890, orders: 230, profit: 2300 }
          ];

          // Sample category data
          const categories = [
            { name: 'Electronics', value: 35 },
            { name: 'Clothing', value: 25 },
            { name: 'Home & Kitchen', value: 15 },
            { name: 'Books', value: 10 },
            { name: 'Sports', value: 8 },
            { name: 'Other', value: 7 }
          ];

          // Sample customer data
          const customers = [
            { name: 'New', value: 65 },
            { name: 'Returning', value: 35 }
          ];

          setSalesData(sales);
          setCategoryData(categories);
          setCustomerData(customers);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [timeframe]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  return (
    <ProtectedRoute>
    <DashboardLayout>
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Analytics</h1>
              <p className="text-gray-600">Detailed insights into your business performance</p>
            </div>

            <div className="flex items-center space-x-2">
              <div className="bg-white rounded-md shadow-sm">
                <button
                  className={`px-4 py-2 text-sm font-medium rounded-l-md ${timeframe === 'week' ? 'bg-blue-100 text-blue-700' : 'text-gray-700'}`}
                  onClick={() => setTimeframe('week')}
                >
                  Week
                </button>
                <button
                  className={`px-4 py-2 text-sm font-medium ${timeframe === 'month' ? 'bg-blue-100 text-blue-700' : 'text-gray-700'}`}
                  onClick={() => setTimeframe('month')}
                >
                  Month
                </button>
                <button
                  className={`px-4 py-2 text-sm font-medium rounded-r-md ${timeframe === 'year' ? 'bg-blue-100 text-blue-700' : 'text-gray-700'}`}
                  onClick={() => setTimeframe('year')}
                >
                  Year
                </button>
              </div>

              <button className="flex items-center px-3 py-2 bg-white rounded-md shadow-sm text-sm font-medium text-gray-700">
                <CalendarToday fontSize="small" className="mr-1" />
                Custom Range
              </button>

              <button className="flex items-center px-3 py-2 bg-white rounded-md shadow-sm text-sm font-medium text-gray-700">
                <FilterList fontSize="small" className="mr-1" />
                Filter
              </button>

              <button className="flex items-center px-3 py-2 bg-white rounded-md shadow-sm text-sm font-medium text-gray-700">
                <Download fontSize="small" className="mr-1" />
                Export
              </button>
            </div>
                </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-6 animate-pulse">
              <div className="bg-white rounded-lg shadow-md p-6 h-80"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-md p-6 h-64"></div>
                <div className="bg-white rounded-lg shadow-md p-6 h-64"></div>
              </div>
            </div>
          ) : (
            <>
              {/* Sales Performance Chart */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Sales Performance</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={salesData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="sales" stroke="#8884d8" activeDot={{ r: 8 }} name="Sales ($)" />
                      <Line type="monotone" dataKey="profit" stroke="#82ca9d" name="Profit ($)" />
                      <Line type="monotone" dataKey="orders" stroke="#ffc658" name="Orders" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
            </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Product Categories */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Sales by Category</h2>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value}%`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Customer Breakdown */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Customer Breakdown</h2>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={customerData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" name="Customers (%)" fill="#8884d8">
                          {customerData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Key Performance Metrics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-gray-500">Average Order Value</p>
                    <p className="text-2xl font-bold">$85.20</p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-xs text-green-500 ml-1">+5.3% vs last period</span>
                </div>
                      </div>

                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-gray-500">Conversion Rate</p>
                    <p className="text-2xl font-bold">3.2%</p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-xs text-green-500 ml-1">+0.8% vs last period</span>
                    </div>
                </div>

                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-gray-500">Customer Acquisition Cost</p>
                    <p className="text-2xl font-bold">$22.50</p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="h-4 w-4 text-red-500 transform rotate-180" />
                      <span className="text-xs text-red-500 ml-1">+2.1% vs last period</span>
              </div>
            </div>

                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-gray-500">Customer Lifetime Value</p>
                    <p className="text-2xl font-bold">$450.80</p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-xs text-green-500 ml-1">+12.3% vs last period</span>
                    </div>
                  </div>
              </div>
              </div>
            </>
          )}
      </div>
    </DashboardLayout>
    </ProtectedRoute>
  );
}
