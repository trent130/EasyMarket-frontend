import React, { useEffect, useState } from 'react';
import { MapPin, Phone, Mail } from 'lucide-react';
import { footerApi, FooterData } from '@/services/api/footerApi';

const Footer = () => {
  const [footerData, setFooterData] = useState<FooterData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await footerApi.getFooterData();
        setFooterData(data);
      } catch (err) {
        setError('Failed to load footer data');
        console.error('Error fetching footer data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFooterData();
  }, []);

  if (isLoading) {
    return (
      <footer className="bg-white dark:bg-gray-900 mt-auto">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-8">
                <div className="h-6 w-32 bg-gray-200 rounded"></div>
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="h-4 w-48 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </footer>
    );
  }

  if (error) {
    return (
      <footer className="bg-white dark:bg-gray-900 mt-auto">
        <div className="container mx-auto px-6 py-12 text-center text-red-500">
          {error}
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-white dark:bg-gray-900 mt-auto">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Quick Links */}
          <div className="space-y-8">
            <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Quick Links</h4>
            <ul className="space-y-4">
              {footerData?.quickLinks.map((link) => (
                <li key={link.id}>
                  <a
                    href={link.url}
                    className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors text-lg"
                  >
                    {link.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-8">
            <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Categories</h4>
            <ul className="space-y-4">
              {footerData?.categories.map((category) => (
                <li key={category.id}>
                  <a
                    href={category.url}
                    className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors text-lg"
                  >
                    {category.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Us */}
          <div className="space-y-8">
            <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Contact Us</h4>
            <ul className="space-y-6">
              <li className="flex items-start space-x-4">
                <MapPin className="h-6 w-6 text-gray-400 flex-shrink-0 mt-1" />
                <span className="text-gray-600 dark:text-gray-400 text-lg">
                  {footerData?.contactInfo.address.street},
                  <br />
                  {footerData?.contactInfo.address.city}, {footerData?.contactInfo.address.state} {footerData?.contactInfo.address.postalCode}
                </span>
              </li>
              <li className="flex items-center space-x-4">
                <Phone className="h-6 w-6 text-gray-400 flex-shrink-0" />
                <span className="text-gray-600 dark:text-gray-400 text-lg">
                  {footerData?.contactInfo.phone}
                </span>
              </li>
              <li className="flex items-center space-x-4">
                <Mail className="h-6 w-6 text-gray-400 flex-shrink-0" />
                <span className="text-gray-600 dark:text-gray-400 text-lg">
                  {footerData?.contactInfo.email}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-8 mt-12">
          <p className="text-center text-gray-600 dark:text-gray-400 text-lg">
            © {new Date().getFullYear()} EasyMarket. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

