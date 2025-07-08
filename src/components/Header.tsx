
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Search, Menu, X, Heart, User } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-brand-600 to-brand-800 bg-clip-text text-transparent">
              FundFlow
            </h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-gray-700 hover:text-brand-600 transition-colors font-medium">
              Discover
            </a>
            <a href="#" className="text-gray-700 hover:text-brand-600 transition-colors font-medium">
              Categories
            </a>
            <a href="#" className="text-gray-700 hover:text-brand-600 transition-colors font-medium">
              How it Works
            </a>
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex items-center max-w-md mx-8 flex-1">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search campaigns..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                <Button variant="ghost" size="sm" className="text-gray-700">
                  <Heart className="h-4 w-4 mr-2" />
                  Saved
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-700">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Button>
                <Button 
                  onClick={() => setIsLoggedIn(false)}
                  variant="outline" 
                  size="sm"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button 
                  onClick={() => setIsLoggedIn(true)}
                  variant="ghost" 
                  size="sm"
                >
                  Log in
                </Button>
                <Button 
                  onClick={() => setIsLoggedIn(true)}
                  size="sm"
                  className="bg-brand-600 hover:bg-brand-700"
                >
                  Sign up
                </Button>
              </>
            )}
            <Button className="bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white">
              Start a Campaign
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 animate-fade-in">
            <div className="flex flex-col space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>
              <nav className="flex flex-col space-y-2">
                <a href="#" className="text-gray-700 hover:text-brand-600 transition-colors font-medium py-2">
                  Discover
                </a>
                <a href="#" className="text-gray-700 hover:text-brand-600 transition-colors font-medium py-2">
                  Categories
                </a>
                <a href="#" className="text-gray-700 hover:text-brand-600 transition-colors font-medium py-2">
                  How it Works
                </a>
              </nav>
              <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                {isLoggedIn ? (
                  <>
                    <Button variant="ghost" size="sm" className="justify-start">
                      <Heart className="h-4 w-4 mr-2" />
                      Saved
                    </Button>
                    <Button variant="ghost" size="sm" className="justify-start">
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Button>
                    <Button 
                      onClick={() => setIsLoggedIn(false)}
                      variant="outline" 
                      size="sm"
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      onClick={() => setIsLoggedIn(true)}
                      variant="ghost" 
                      size="sm"
                    >
                      Log in
                    </Button>
                    <Button 
                      onClick={() => setIsLoggedIn(true)}
                      size="sm"
                      className="bg-brand-600 hover:bg-brand-700"
                    >
                      Sign up
                    </Button>
                  </>
                )}
                <Button className="bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white">
                  Start a Campaign
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
