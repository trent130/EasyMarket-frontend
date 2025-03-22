"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { Search, Book, SwapHoriz, School, LocalOffer, BookmarkBorder, Share, Message, FilterList, Sort, Add } from '@mui/icons-material';
import { textbookExchangeApi } from '@/services/api/textbook-exchange';
import { Product } from '@/types/product';

interface Textbook {
  id: string;
  title: string;
  author: string;
  isbn: string;
  condition: 'New' | 'Like New' | 'Very Good' | 'Good' | 'Fair';
  price: number;
  exchangeOption: 'Sell' | 'Exchange' | 'Both';
  course: string;
  subject: string;
  edition: string;
  image: string;
  owner: {
    name: string;
    avatar: string;
    rating: number;
  };
  postedDate: Date;
}

export default function TextbookExchange() {
  const { user } = useAuth();
  const [textbooks, setTextbooks] = useState<Textbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [conditionFilter, setConditionFilter] = useState('all');
  const [exchangeFilter, setExchangeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    const fetchTextbooks = async () => {
      setLoading(true);
      try {
        const params = {
          title: searchTerm,
          subject: subjectFilter === 'all' ? undefined : subjectFilter,
          condition: conditionFilter === 'all' ? undefined : conditionFilter,
          exchangeOption: exchangeFilter === 'all' ? undefined : exchangeFilter,
          sortBy,
        };

        const response = await textbookExchangeApi.searchTextbooks(params);
        const fetchedTextbooks: Textbook[] = response.results.map((product: Product) => ({
          id: product.id,
          title: product.title,
          author: product.student_name,
          isbn: product.isbn,
          condition: product.condition === 'new' ? 'New' : product.condition === 'like_new' ? 'Like New' : 'Good', // Adjust as needed
          price: product.price,
          exchangeOption: product.exchangeOption,
          course: product.course_code || 'N/A',
          subject: product.subject || 'N/A',
          edition: product.edition || 'N/A',
          image: product.images[0] || '', // Assuming the first image is the main image
          owner: {
            name: product.owner.name,
            avatar: product.owner.avatar,
            rating: product.owner.rating,
          },
          postedDate: new Date(product.postedDate),
        }));

        setTextbooks(fetchedTextbooks);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching textbooks:', error);
        setLoading(false);
      }
    };

    fetchTextbooks();
  }, [searchTerm, subjectFilter, conditionFilter, exchangeFilter, sortBy]);

  const getConditionBadgeColor = (condition: string) => {
    const colors = {
      'New': 'bg-green-100 text-green-800',
      'Like New': 'bg-blue-100 text-blue-800',
      'Very Good': 'bg-purple-100 text-purple-800',
      'Good': 'bg-yellow-100 text-yellow-800',
      'Fair': 'bg-orange-100 text-orange-800',
    };
    return colors[condition] || 'bg-gray-100 text-gray-800';
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Textbook Exchange</h1>
              <p className="text-gray-600">Find, sell, or exchange textbooks with other students</p>
            </div>
            <div className="mt-4 md:mt-0">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
              >
                <Add className="mr-2" fontSize="small" />
                List a Textbook
              </button>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative col-span-2">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="text-gray-400" fontSize="small" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Search by title, author, ISBN, or course..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <select
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
              >
                <option value="all">All Subjects</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Engineering">Engineering</option>
              </select>

              <select
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={exchangeFilter}
                onChange={(e) => setExchangeFilter(e.target.value)}
              >
                <option value="all">All Options</option>
                <option value="Sell">For Sale</option>
                <option value="Exchange">For Exchange</option>
                <option value="Both">Both</option>
              </select>

              <select
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="date">Latest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="condition">Condition</option>
              </select>
            </div>
          </div>

          {/* Textbooks Grid */}
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
              {textbooks.map((textbook) => (
                <div key={textbook.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-48">
                    <img
                      src={textbook.image}
                      alt={textbook.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 flex space-x-2">
                      <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100">
                        <BookmarkBorder className="text-gray-600" fontSize="small" />
                      </button>
                      <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100">
                        <Share className="text-gray-600" fontSize="small" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">{textbook.title}</h3>
                        <p className="text-sm text-gray-600">{textbook.author}</p>
                      </div>
                      <span className="text-lg font-bold text-blue-600">${textbook.price}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionBadgeColor(textbook.condition)}`}>
                        {textbook.condition}
                      </span>
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                        {textbook.course}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                        {textbook.edition}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <img
                          src={textbook.owner.avatar}
                          alt={textbook.owner.name}
                          className="w-8 h-8 rounded-full mr-2"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{textbook.owner.name}</p>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className={`text-xs ${i < Math.floor(textbook.owner.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <button className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        <Message className="mr-1" fontSize="small" />
                        Contact
                      </button>
                      {textbook.exchangeOption !== 'Sell' && (
                        <button className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                          <SwapHoriz className="mr-1" fontSize="small" />
                          Exchange
                        </button>
                      )}
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
