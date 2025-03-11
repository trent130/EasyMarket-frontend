'use client';

import { useState, useEffect } from 'react';
import { Typography } from '@mui/material';
import Link from 'next/link';
import SearchBar from './search/SearchBar';
import NotificationPopup from './NotificationPopup';
import { useAuth } from '@/contexts/AuthContext';

const Navigation = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Ensure we're mounted before rendering auth-dependent UI
  useEffect(() => {
    setMounted(true);
  }, []);

  // Listen for auth changes from other components
  useEffect(() => {
    const handleAuthChange = () => {
      console.log("Auth state changed event received");
    };
    
    window.addEventListener("authChange", handleAuthChange);
    return () => window.removeEventListener("authChange", handleAuthChange);
  }, []);
  
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Don't render auth-dependent parts until mounted
  if (!mounted) {
    return <nav className="fixed top-0 left-0 w-full text-black bg-white shadow-lg border-gray-200 p-4 z-50 px-4 mb-4">
      <div className="container mx-auto flex justify-between items-center">
        <Typography variant="h6" component={Link} href="/" className="text-lg font-bold hover:text-gray-800">
          EasyMarket
        </Typography>
        <div className="animate-pulse h-10 w-32 bg-gray-200 rounded"></div>
      </div>
    </nav>;
  }

  return (
    <nav className="fixed top-0 left-0 w-full text-black bg-white shadow-lg border-gray-200 p-4 z-50 px-4 mb-4">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Typography
          variant="h6"
          component={Link}
          href="/"
          className="text-lg font-bold hover:text-gray-800"
        >
          EasyMarket
        </Typography>

        {/* Search Bar */}
        <div className="hidden md:block flex-1 mx-[5%]">
          <SearchBar />
        </div>

        {/* Hamburger Menu */}
        <button
          aria-label="Menu"
          className="md:hidden text-black hover:bg-black hover:rounded hover:text-white focus:outline-none"
          onClick={toggleMenu}
        >
          <svg
            className="w-6 h-6"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center space-x-4 text-black">
          <Link href="/">
            <button className="bg-transparent hover:bg-gray-700 hover:text-white font-bold py-2 px-4 rounded duration-300">
              Home
            </button>
          </Link>
          <Link href="/product">
            <button className="bg-transparent hover:bg-gray-700 hover:text-white font-bold py-2 px-4 rounded duration-300">
              Products
            </button>
          </Link>
          {isAuthenticated && (
            <Link href="/dashboard">
              <button className="bg-transparent hover:bg-gray-700 hover:text-white font-bold py-2 px-4 rounded duration-300">
                Dashboard
              </button>
            </Link>
          )}
          <Link href="/cart">
            <button className="bg-transparent hover:bg-gray-700 hover:text-white font-bold py-2 px-4 rounded duration-300">
              Cart
            </button>
          </Link>
          <Link href="/wishlist">
            <button className="bg-transparent hover:bg-gray-700 hover:text-white font-bold py-2 px-4 rounded duration-300">
              Wishlist
            </button>
          </Link>
          <NotificationPopup />
          {isAuthenticated ? (
            <div className="flex items-center">
              <Typography variant="body1" className="mr-2">
                Welcome, <Link href="/user/profile">{user?.name || user?.email || user?.username || 'User'}</Link>
              </Typography>
              <button
                className="bg-transparent hover:bg-gray-700 hover:text-white font-bold py-2 px-4 rounded duration-300"
                onClick={logout}
              >
                Logout
              </button>
            </div>
          ) : (
            <Link href="/auth/signin">
              <button className="bg-transparent hover:bg-gray-700 hover:text-white font-bold py-2 px-4 rounded duration-300">
                Sign In
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white text-black py-4">
          <Link href="/">
            <button className="block w-full text-left bg-transparent hover:bg-gray-700 hover:text-white font-bold py-2 px-4">
              Home
            </button>
          </Link>
          <Link href="/product">
            <button className="block w-full text-left bg-transparent hover:bg-gray-700 hover:text-white font-bold py-2 px-4">
              Products
            </button>
          </Link>
          {isAuthenticated && (
            <Link href="/dashboard">
              <button className="block w-full text-left bg-transparent hover:bg-gray-700 hover:text-white font-bold py-2 px-4">
                Dashboard
              </button>
            </Link>
          )}
          <Link href="/cart">
            <button className="block w-full text-left bg-transparent hover:bg-gray-700 hover:text-white font-bold py-2 px-4">
              Cart
            </button>
          </Link>
          <Link href="/wishlist">
            <button className="block w-full text-left bg-transparent hover:bg-gray-700 hover:text-white font-bold py-2 px-4">
              Wishlist
            </button>
          </Link>
          <div className="block w-full text-left bg-transparent font-bold py-2 px-4">
            <NotificationPopup />
          </div>
          {isAuthenticated ? (
            <>
              <Link href="/user/profile">
                <button className="block w-full text-left bg-transparent hover:bg-gray-700 hover:text-white font-bold py-2 px-4">
                  Profile
                </button>
              </Link>
              <button
                className="block w-full text-left bg-transparent hover:bg-gray-700 hover:text-white font-bold py-2 px-4"
                onClick={logout}
              >
                Logout
              </button>
            </>
          ) : (
            <Link href="/auth/signin">
              <button className="block w-full text-left bg-transparent hover:bg-gray-700 hover:text-white font-bold py-2 px-4">
                Sign In
              </button>
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navigation;

// fix the notification display on mobile devices to stop being and icon and just be a word notifications