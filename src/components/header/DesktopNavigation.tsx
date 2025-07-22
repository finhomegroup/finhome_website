
import React from 'react';
import { useNavigate } from 'react-router-dom';

const DesktopNavigation = () => {
  const navigate = useNavigate();

  return (
    <nav className="hidden md:flex items-center space-x-8 ml-12">
      <button 
        onClick={() => navigate('/events')} 
        className="text-gray-700 hover:text-brand-600 transition-colors font-medium"
      >
        Events
      </button>
    </nav>
  );
};

export default DesktopNavigation;
