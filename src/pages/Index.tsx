
import React from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import CampaignsGrid from '@/components/CampaignsGrid';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <CampaignsGrid />
      <Footer />
    </div>
  );
};

export default Index;
