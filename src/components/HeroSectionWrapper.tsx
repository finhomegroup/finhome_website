import React from 'react';
import Header from './Header';
import HeroSection from './HeroSection';

const HeroSectionWrapper = () => {
  return (
    <div className="relative" style={{ backgroundImage: 'url(/bg_hero.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
      <Header />
      <HeroSection />
    </div>
  );
};

export default HeroSectionWrapper;
