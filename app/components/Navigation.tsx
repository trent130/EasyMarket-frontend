'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SearchBar from './search/SearchBar';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ShoppingCart, 
  Favorite, 
  Notifications, 
  Person, 
  Dashboard, 
  Menu, 
  Close, 
  Home, 
  Inventory 
} from '@mui/icons-material';

const Navigation = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // Ensure we're mounted before rendering auth-dependent UI
  useEffect(() => {
    setMounted(true);
  }, []);

  // Listen for auth changes from other components
  useEffect(() => {
    const handleAuthChange = () => {
      console.log("Auth state changed event received");
      // Force a re-render when auth state changes
      setMounted(false);
      setTimeout(() => setMounted(true), 0);
    };
    
    window.addEventListener("authChange", handleAuthChange);
    return () => window.removeEventListener("authChange", handleAuthChange);
  }, []);
  
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Close menu after logout
      setMenuOpen(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Active link style helper
  const isActive = (path: string) => {
    return pathname === path ? 'bg-blue-100 text-blue-700' : '';
  };

  // Don't render auth-dependent parts until mounted
  if (!mounted) {
    return (
      <nav className="fixed top-0 left-0 w-full text-black bg-white shadow-lg border-gray-200 p-4 z-50 px-4 mb-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="text-lg font-bold hover:text-gray-800">
            EasyMarket
          </Link>
          <div className="animate-pulse h-10 w-32 bg-gray-200 rounded"></div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed top-0 left-0 w-full text-black bg-white shadow-lg border-gray-200 p-4 z-50 px-4 mb-4">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-lg font-bold hover:text-gray-800 flex items-center">
          <span className="text-blue-600 mr-2">
            <ShoppingCart fontSize="medium" />
          </span>
          EasyMarket
        </Link>

        {/* Search Bar */}
        <div className="hidden md:block flex-1 mx-[5%] max-w-md">
          <SearchBar />
        </div>

        {/* Hamburger Menu */}
        <button
          aria-label="Menu"
          className="md:hidden text-black hover:bg-gray-100 hover:rounded p-2 focus:outline-none transition-colors"
          onClick={toggleMenu}
        >
          {menuOpen ? <Close /> : <Menu />}
        </button>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center space-x-2 text-black">
          <Link href="/" className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-gray-100 ${isActive('/')}`}>
            <Home className="mr-1" fontSize="small" />
            Home
          </Link>
          
          <Link href="/product" className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-gray-100 ${isActive('/product')}`}>
            <Inventory className="mr-1" fontSize="small" />
              Products
          </Link>
          
          {isAuthenticated && (
            <Link href="/dashboard" className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-gray-100 ${isActive('/dashboard')}`}>
              <Dashboard className="mr-1" fontSize="small" />
              Dashboard
            </Link>
          )}
          
          <Link href="/cart" className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-gray-100 ${isActive('/cart')}`}>
            <ShoppingCart className="mr-1" fontSize="small" />
            Cart
          </Link>
          
          <Link href="/wishlist" className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-gray-100 ${isActive('/wishlist')}`}>
            <Favorite className="mr-1" fontSize="small" />
            Wishlist
          </Link>
          
          <button className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-gray-100`}>
            <Notifications className="text-gray-700" fontSize="small" />
            </button>
          
          {isAuthenticated ? (
            <div className="flex items-center ml-2">
              <Link href="/user/profile" className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold mr-2 border border-blue-200">
                  {user?.name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                </div>
                <span className="hidden lg:inline text-sm font-medium mr-2">{user?.name || user?.username || 'User'}</span>
              </Link>
              <button
                className="ml-1 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          ) : (
            <Link href="/auth/signin" className="ml-2 px-4 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                Sign In
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white text-black py-2 mt-2 rounded-md shadow-lg border border-gray-100">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link href="/" className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${isActive('/')}`}>
              <Home className="mr-2" fontSize="small" />
              Home
          </Link>
            
            <Link href="/product" className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${isActive('/product')}`}>
              <Inventory className="mr-2" fontSize="small" />
              Products
          </Link>
            
            {isAuthenticated && (
              <Link href="/dashboard" className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${isActive('/dashboard')}`}>
                <Dashboard className="mr-2" fontSize="small" />
              Dashboard
          </Link>
            )}
            
            <Link href="/cart" className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${isActive('/cart')}`}>
              <ShoppingCart className="mr-2" fontSize="small" />
              Cart
          </Link>
            
            <Link href="/wishlist" className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${isActive('/wishlist')}`}>
              <Favorite className="mr-2" fontSize="small" />
              Wishlist
          </Link>
            
            <div className="flex items-center px-3 py-2 rounded-md text-base font-medium">
              <Notifications className="mr-2" fontSize="small" />
              Notifications
          </div>
            
          {isAuthenticated ? (
            <>
                <Link href="/user/profile" className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${isActive('/user/profile')}`}>
                  <Person className="mr-2" fontSize="small" />
                  Profile
              </Link>
              <button
                  className="flex items-center w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                  onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
              <Link href="/auth/signin" className="block px-3 py-2 rounded-md text-base font-medium bg-blue-600 text-white hover:bg-blue-700 mx-2 text-center">
                Sign In
            </Link>
          )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;

// fix the notification display on mobile devices to stop being and icon and just be a word notifications