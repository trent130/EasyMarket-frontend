"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Search, 
  FilterList, 
  Add, 
  Edit, 
  Delete, 
  Visibility,
  CloudUpload,
  Sort,
  MoreVert,
  CheckCircle,
  Warning
} from '@mui/icons-material';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  status: 'active' | 'draft' | 'out_of_stock';
  image: string;
  stock: number;
  createdAt: Date;
  lastUpdated: Date;
}

export default function MyProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    // Simulate fetching products
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Mock data
        setTimeout(() => {
          const mockProducts: Product[] = [
            {
              id: 'P001',
              name: 'Introduction to Computer Science',
              description: 'A comprehensive guide to CS fundamentals',
              price: 79.99,
              category: 'Computer Science',
              status: 'active',
              image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765',
              stock: 15,
              createdAt: new Date(2023, 1, 15),
              lastUpdated: new Date(2023, 2, 20)
            },
            {
              id: 'P002',
              name: 'Calculus I Textbook',
              description: 'Essential calculus concepts for beginners',
              price: 89.99,
              category: 'Mathematics',
              status: 'active',
              image: 'https://images.unsplash.com/photo-1576872381149-7847515ce5d8',
              stock: 8,
              createdAt: new Date(2023, 1, 10),
              lastUpdated: new Date(2023, 2, 15)
            },
            {
              id: 'P003',
              name: 'Physics for Engineers',
              description: 'Applied physics for engineering students',
              price: 94.99,
              category: 'Physics',
              status: 'out_of_stock',
              image: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353',
              stock: 0,
              createdAt: new Date(2023, 0, 20),
              lastUpdated: new Date(2023, 2, 1)
            },
            // Add more mock products as needed
          ];
          setProducts(mockProducts);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching products:', error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'active':
        return {
          icon: <CheckCircle className="text-green-500" fontSize="small" />,
          text: 'Active',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800'
        };
      case 'out_of_stock':
        return {
          icon: <Warning className="text-orange-500" fontSize="small" />,
          text: 'Out of Stock',
          bgColor: 'bg-orange-100',
          textColor: 'text-orange-800'
        };
      case 'draft':
        return {
          icon: <Edit className="text-gray-500" fontSize="small" />,
          text: 'Draft',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800'
        };
      default:
        return {
          icon: null,
          text: status,
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800'
        };
    }
  };

  return (
    <ProtectedRoute>
    <DashboardLayout>
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">My Products</h1>
              <p className="text-gray-600">Manage your product listings</p>
            </div>
            <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-2">
              <button 
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center"
              >
                <Add className="mr-2" fontSize="small" />
                Add Product
              </button>
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 flex items-center justify-center">
                <CloudUpload className="mr-2" fontSize="small" />
                Import
              </button>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="text-gray-400" fontSize="small" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <select
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Engineering">Engineering</option>
              </select>

              <select
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="out_of_stock">Out of Stock</option>
                <option value="draft">Draft</option>
              </select>

              <div className="relative">
                <button
                  className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <span className="flex items-center">
                    <Sort className="mr-2" fontSize="small" />
                    Sort by: {sortBy}
                  </span>
                  <span className={`transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                  <div className="w-full h-48 bg-gray-200 rounded-md mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="relative h-48">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <button className="p-1 bg-white rounded-full shadow-md hover:bg-gray-100">
                        <MoreVert className="text-gray-600" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                      <span className="text-lg font-bold text-blue-600">${product.price}</span>
                    </div>
                    
                    <p className="text-sm text-gray-500 mb-4">{product.description}</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-600">Stock: {product.stock}</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        getStatusInfo(product.status).bgColor
                      } ${getStatusInfo(product.status).textColor}`}>
                        {getStatusInfo(product.status).icon}
                        <span className="ml-1">{getStatusInfo(product.status).text}</span>
                      </span>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <button className="p-2 text-gray-600 hover:text-blue-600">
                        <Visibility fontSize="small" />
                      </button>
                      <button className="p-2 text-gray-600 hover:text-green-600">
                        <Edit fontSize="small" />
                      </button>
                      <button className="p-2 text-gray-600 hover:text-red-600">
                        <Delete fontSize="small" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
    </DashboardLayout>
    </ProtectedRoute>
  );
}
