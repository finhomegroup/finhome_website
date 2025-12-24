import React from 'react';
import { Button } from "@/components/ui/button";

interface ServiceCard {
  id: number;
  icon: string;
  title: string;
  description: string;
  buttonText: string;
}

const ServiceCardItem: React.FC<ServiceCard> = ({ icon, title, description, buttonText }) => (
  <div className="group bg-gradient-to-br from-[#010300] to-[#010300] hover:from-green-400 hover:to-green-600 rounded-2xl p-6 transition-all duration-300 cursor-pointer">
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-4 flex-1">
        <div className="w-14 h-14 bg-green-500 group-hover:bg-white rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-300">
          <img src={icon} alt={title} className="w-8 h-8" />
        </div>
        <div className="flex-1">
          <h3 className="text-white text-xl font-bold mb-2 group-hover:text-gray-900 transition-colors duration-300">
            {title}
          </h3>
          <p className="text-gray-300 text-sm group-hover:text-gray-800 transition-colors duration-300">
            {description}
          </p>
        </div>
      </div>
      <button className="text-white text-sm font-medium group-hover:text-gray-900 transition-colors duration-300 flex items-center gap-2 whitespace-nowrap">
        {buttonText}
        <span>→</span>
      </button>
    </div>
  </div>
);

const Benefits: React.FC = () => {
  const services: ServiceCard[] = [
    {
      id: 1,
      icon: '/icons/lighthouse.png',
      title: 'Lighthouse',
      description: 'Portfolio analytics & advanced leverage management.',
      buttonText: 'View Dashboard'
    },
    {
      id: 2,
      icon: '/icons/compass.png',
      title: 'Compass',
      description: 'Navigate your home buying journey with clarity.',
      buttonText: 'Start Searching'
    },
    {
      id: 3,
      icon: '/icons/harbor.png',
      title: 'Harbor',
      description: 'The integrated platform for partners, agents, and contractors.',
      buttonText: 'Learn More'
    }
  ];

  return (
    <section className="py-12 lg:py-16 overflow-hidden" style={{ backgroundColor: '#f0f0f0' }}>
      <div className="max-w-[1600px] mx-auto px-2 sm:px-4 lg:px-6">
        {/* Border container with background image */}
        <div 
          className="relative min-h-[600px] lg:min-h-[700px] rounded-xl border-2 overflow-hidden py-20"
          style={{            
            backgroundImage: 'url(/bg_benefit.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/20"></div>
          
          <div className="relative z-10 container mx-auto px-6">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              {/* Left side - Text content */}
              <div className="w-full lg:w-1/2">
                <h2 className="text-4xl text-white mb-6">Why Choose Our AI Resume Scoring</h2>
                <p className="text-lg text-gray-300 mb-8">
                  Our platform helps thousands of job seekers improve their resumes and increase interview callbacks by up to 65%.
                </p>
                <ul className="space-y-4 text-gray-300">
                  <li className="flex items-start gap-3">
                    <span className="text-green-400 text-xl">✓</span>
                    <span>Increase your interview callback rate by up to 65%</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-400 text-xl">✓</span>
                    <span>Optimize for ATS (Applicant Tracking Systems) with 98% accuracy</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-400 text-xl">✓</span>
                    <span>Receive industry-specific recommendations from 75+ fields</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-400 text-xl">✓</span>
                    <span>Identify and fix critical resume gaps in minutes</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-400 text-xl">✓</span>
                    <span>Access to a database of 10,000+ successful resume templates</span>
                  </li>
                </ul>
              </div>
              
              {/* Right side - Service cards */}
              <div className="w-full lg:w-1/2">
                <div className="space-y-4">
                  {services.map((service) => (
                    <ServiceCardItem key={service.id} {...service} />
                  ))}
                </div>
                
                <div className="mt-8 flex justify-center">
                  <Button 
                    className="bg-[#3CB550] hover:bg-[#2d9a42] text-white px-8 py-3 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Get Started
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;

