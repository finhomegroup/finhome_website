import React from 'react';
import Header from './Header';
import HeroSection from './HeroSection';

const HeroSectionWrapper = () => {
  return (
    <div className="relative">
      <Header />
      <HeroSection />
    </div>
  );
};

export default HeroSectionWrapper;
