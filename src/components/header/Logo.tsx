
import React from 'react';
import { Link } from 'react-router-dom';

const Logo = () => {
  return (
    <div className="flex-shrink-0 logo-container">
      <Link to="/" className="flex items-center">
        <img 
          src="/vlu_logo.png" 
          alt="VLU Logo" 
          className="hidden sm:block h-6 sm:h-8 md:h-10 lg:h-12 w-auto cursor-pointer transition-all duration-200 hover:scale-105"
          style={{
            maxHeight: '26px',
            minHeight: '12px'
          }}
        />
        <img 
          src="/vlu_logo.png" 
          alt="VLU Logo Mobile" 
          className="block sm:hidden h-6 w-auto cursor-pointer transition-all duration-200 hover:scale-105"
          style={{
            maxHeight: '18px',
            minHeight: '12px'
          }}
        />
      </Link>
    </div>
  );
};

export default Logo;
