
import React from 'react';
import HeroSectionWrapper from '@/components/HeroSectionWrapper';
import PortfolioPerformance from '@/components/PortfolioPerformance';
import TestimonialSection from '@/components/TestimonialSection';
import DarkSection from '@/components/DarkSection';
import MentorFeature from '@/components/MentorFeature';
import Benefits from '@/components/Benefits';
import Partners from '@/components/Partners';
import CampaignsGrid from '@/components/CampaignsGrid';
import ThrivingStartups from '@/components/ThrivingStartups';
import RealEstateCaseStudies from '@/components/RealEstateCaseStudies';
import StickyFeatures from '@/components/StickyFeatures';
import InteractiveSlider from '@/components/InteractiveSlider';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <HeroSectionWrapper />
      
      <MentorFeature />
      <PortfolioPerformance />
      <RealEstateCaseStudies />
      <StickyFeatures />
      <InteractiveSlider />
      {/* <TestimonialSection /> */}
      {/* <DarkSection /> */}
      
      
      {/* <Benefits /> */}
      {/* <CampaignsGrid /> */}
      <ThrivingStartups />
      <Partners />
      <Footer />
    </div>
  );
};

export default Index;
