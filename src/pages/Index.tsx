
import React from 'react';
import HeroSectionWrapper from '@/components/HeroSectionWrapper';
import PortfolioPerformance from '@/components/PortfolioPerformance';
import TestimonialSection from '@/components/TestimonialSection';
import MentorFeature from '@/components/MentorFeature';
import Partners from '@/components/Partners';
import CampaignsGrid from '@/components/CampaignsGrid';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <HeroSectionWrapper />
      <TestimonialSection />
      <PortfolioPerformance />
      <MentorFeature />
      <Partners />
      <CampaignsGrid />
      <Footer />
    </div>
  );
};

export default Index;
