
import React from 'react';
import { Link } from 'react-router-dom';

const Logo = () => {
  return (
    <div className="flex-shrink-0">
      <Link to="/">
        <img 
          src="/vlu_logo.png" 
          alt="VLU Logo" 
          className="h-12 w-auto cursor-pointer"
        />
      </Link>
    </div>
  );
};

export default Logo;
