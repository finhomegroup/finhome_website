
import React from 'react';
import { Link } from 'react-router-dom';

const Logo = () => {
  return (
    <div className="flex-shrink-0 logo-container">
      <Link to="/" className="flex items-center">
        <img 
          src="/vlu_logo.png" 
          alt="VLU Logo" 
          className="h-6 sm:h-8 md:h-10 lg:h-12 w-auto cursor-pointer transition-all duration-200 hover:scale-105"
          style={{
            maxHeight: '48px',
            minHeight: '24px'
          }}
        />
      </Link>
    </div>
  );
};

export default Logo;
