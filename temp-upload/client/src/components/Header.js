import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Mail, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useSocket } from '../contexts/SocketContext';

const Header = () => {
  const { isConnected } = useSocket();
  const location = useLocation();

  const isHomePage = location.pathname === '/' || location.pathname.startsWith('/email/');

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <Link to="/" className="flex items-center space-x-2 text-gray-900 hover:text-blue-600 transition-colors">
            <Mail className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold">Temp Mail</h1>
              <p className="text-xs text-gray-500">Disposable Email Service</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors ${
                isHomePage
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Home
            </Link>
            <a
              href="#features"
              className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
            >
              Features
            </a>
            <a
              href="#about"
              className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
            >
              About
            </a>
          </nav>

          {/* Connection Status and Actions */}
          <div className="flex items-center space-x-4">
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <div className="flex items-center space-x-1 text-green-600">
                  <Wifi className="h-4 w-4" />
                  <span className="text-xs font-medium hidden sm:inline">Connected</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1 text-red-600">
                  <WifiOff className="h-4 w-4" />
                  <span className="text-xs font-medium hidden sm:inline">Disconnected</span>
                </div>
              )}
            </div>

            {/* Refresh Button */}
            <button
              onClick={() => window.location.reload()}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh page"
            >
              <RefreshCw className="h-4 w-4" />
            </button>

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden mt-4 pt-4 border-t border-gray-200">
          <nav className="flex flex-col space-y-2">
            <Link
              to="/"
              className={`text-sm font-medium py-2 px-3 rounded-lg transition-colors ${
                isHomePage
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              Home
            </Link>
            <a
              href="#features"
              className="text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 py-2 px-3 rounded-lg transition-colors"
            >
              Features
            </a>
            <a
              href="#about"
              className="text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 py-2 px-3 rounded-lg transition-colors"
            >
              About
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header; 