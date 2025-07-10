
import React from 'react';

const DesktopNavigation = () => {
  return (
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
  );
};

export default DesktopNavigation;
