
import React from 'react';

const DesktopNavigation = () => {
  return (
    <nav className="hidden md:flex items-center space-x-8">
      <a href="#" className="text-gray-700 hover:text-brand-600 transition-colors font-medium">
        Investors
      </a>
      <a href="#" className="text-gray-700 hover:text-brand-600 transition-colors font-medium">
        Partners
      </a>
      <a href="#" className="text-gray-700 hover:text-brand-600 transition-colors font-medium">
        Mentors
      </a>
      <a href="#" className="text-gray-700 hover:text-brand-600 transition-colors font-medium">
        Events
      </a>
    </nav>
  );
};

export default DesktopNavigation;
