"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Person, 
  Notifications, 
  Security, 
  CreditCard, 
  Language, 
  Palette, 
  Store, 
  Save,
  Check
} from '@mui/icons-material';

export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('account');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = () => {
    // Simulate saving settings
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const tabs = [
    { id: 'account', label: 'Account', icon: <Person /> },
    { id: 'notifications', label: 'Notifications', icon: <Notifications /> },
    { id: 'security', label: 'Security & Privacy', icon: <Security /> },
    { id: 'payment', label: 'Payment Methods', icon: <CreditCard /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette /> },
    { id: 'language', label: 'Language & Region', icon: <Language /> },
    { id: 'store', label: 'Store Settings', icon: <Store /> },
  ];

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="container mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
            <p className="text-gray-600">Manage your account and preferences</p>
          </div>

          {saveSuccess && (
            <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center">
              <Check className="mr-2" />
              Settings saved successfully!
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="flex flex-col md:flex-row">
              {/* Sidebar */}
              <div className="w-full md:w-64 bg-gray-50 border-r border-gray-200">
                <nav className="p-4">
                  <ul className="space-y-1">
                    {tabs.map((tab) => (
                      <li key={tab.id}>
                        <button
                          onClick={() => setActiveTab(tab.id)}
                          className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                            activeTab === tab.id
                              ? 'bg-blue-50 text-blue-700'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <span className="mr-3">{tab.icon}</span>
                          {tab.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>

              {/* Content */}
              <div className="flex-1 p-6">
                {activeTab === 'account' && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Account Settings</h2>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture</label>
                        <div className="flex items-center">
                          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-xl mr-4">
                            {user?.name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                          </div>
                          <button className="px-3 py-1 bg-gray-200 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-300">
                            Change
                          </button>
                          <button className="px-3 py-1 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 ml-2">
                            Remove
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            defaultValue={user?.name || ''}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            defaultValue={user?.username || ''}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                          <input
                            type="email"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            defaultValue={user?.email || ''}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                          <input
                            type="tel"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            defaultValue=""
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                        <textarea
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={4}
                          defaultValue=""
                        ></textarea>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'notifications' && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Notification Preferences</h2>
                    
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                        <div>
                          <h3 className="font-medium text-gray-800">Email Notifications</h3>
                          <p className="text-sm text-gray-500">Receive order updates and promotional offers via email</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={emailNotifications}
                            onChange={() => setEmailNotifications(!emailNotifications)}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                        <div>
                          <h3 className="font-medium text-gray-800">Push Notifications</h3>
                          <p className="text-sm text-gray-500">Receive real-time updates on your device</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={pushNotifications}
                            onChange={() => setPushNotifications(!pushNotifications)}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="font-medium text-gray-800">Notification Types</h3>
                        
                        <div className="flex items-center">
                          <input 
                            id="orders" 
                            type="checkbox" 
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                            defaultChecked
                          />
                          <label htmlFor="orders" className="ml-2 text-sm font-medium text-gray-700">Order updates</label>
                        </div>
                        
                        <div className="flex items-center">
                          <input 
                            id="marketing" 
                            type="checkbox" 
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                            defaultChecked
                          />
                          <label htmlFor="marketing" className="ml-2 text-sm font-medium text-gray-700">Marketing and promotions</label>
                        </div>
                        
                        <div className="flex items-center">
                          <input 
                            id="security" 
                            type="checkbox" 
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                            defaultChecked
                          />
                          <label htmlFor="security" className="ml-2 text-sm font-medium text-gray-700">Security alerts</label>
                        </div>
                        
                        <div className="flex items-center">
                          <input 
                            id="system" 
                            type="checkbox" 
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                            defaultChecked
                          />
                          <label htmlFor="system" className="ml-2 text-sm font-medium text-gray-700">System updates</label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'appearance' && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Appearance Settings</h2>
                    
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                        <div>
                          <h3 className="font-medium text-gray-800">Dark Mode</h3>
                          <p className="text-sm text-gray-500">Use dark theme for the application</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={isDarkMode}
                            onChange={() => setIsDarkMode(!isDarkMode)}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      
                      <div>
                        <h3 className="font-medium text-gray-800 mb-3">Theme Color</h3>
                        <div className="flex space-x-3">
                          <button className="w-8 h-8 rounded-full bg-blue-600 ring-2 ring-offset-2 ring-blue-600"></button>
                          <button className="w-8 h-8 rounded-full bg-purple-600"></button>
                          <button className="w-8 h-8 rounded-full bg-green-600"></button>
                          <button className="w-8 h-8 rounded-full bg-red-600"></button>
                          <button className="w-8 h-8 rounded-full bg-yellow-500"></button>
                          <button className="w-8 h-8 rounded-full bg-gray-800"></button>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-medium text-gray-800 mb-3">Font Size</h3>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">A</span>
                          <input 
                            type="range" 
                            min="1" 
                            max="5" 
                            defaultValue="3"
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                          <span className="text-lg">A</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Add other tab contents as needed */}
                
                <div className="mt-8 flex justify-end">
                  <button 
                    className="px-4 py-2 bg-gray-200 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-300 mr-2"
                  >
                    Cancel
                  </button>
                  <button 
                    className="px-4 py-2 bg-blue-600 rounded-md text-sm font-medium text-white hover:bg-blue-700 flex items-center"
                    onClick={handleSave}
                  >
                    <Save className="mr-1" fontSize="small" />
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
