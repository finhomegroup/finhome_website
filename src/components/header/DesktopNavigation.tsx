
import React from 'react';
import { useNavigate } from 'react-router-dom';

const DesktopNavigation = () => {
  const navigate = useNavigate();

  return (
    <nav className="flex items-center space-x-8 ml-4">
      <button 
        className="text-gray-700 hover:text-brand-600 transition-colors font-medium"
      >
        Features
      </button>
      <button 
        className="text-gray-700 hover:text-brand-600 transition-colors font-medium"
      >
        About Us
      </button>
    </nav>
  );
};

export default DesktopNavigation;
