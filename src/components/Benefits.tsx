import React from 'react';
import { Button } from "@/components/ui/button";

interface ServiceCard {
  id: number;
  icon: string;
  title: string;
  description: string;
  buttonText: string;
  sub_title?: string;
  sub_description?: string;
  label?: string;
}

const ServiceCardItem: React.FC<ServiceCard> = ({
  icon,
  title,
  description,
  buttonText,
  sub_title,
  sub_description,
  label,
}) => (
  <div className="group bg-white/95 rounded-2xl p-6 sm:p-8 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer">
    <div className="flex items-start gap-4">
      <div className="hidden sm:flex w-12 h-12 bg-[#E6F7EC] rounded-full items-center justify-center flex-shrink-0">
        <img src={icon} alt={title} className="w-7 h-7" />
      </div>
      <div className="flex-1">
        {label && (
          <p className="text-[11px] font-semibold tracking-[0.16em] text-[#3CB550] uppercase mb-1">
            {label}
          </p>
        )}
        <h3 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">
          {title}
        </h3>
        <p className="text-gray-600 text-sm sm:text-base mb-4">
          {description}
        </p>

        {sub_title && (
          <div className="mb-4">
            <button className="inline-flex items-center px-5 py-2 rounded-full border border-gray-300 bg-white text-xs sm:text-sm text-gray-800 shadow-sm hover:border-[#3CB550] transition-colors duration-200">
              {sub_title}
            </button>
          </div>
        )}

        {sub_description && (
          <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-4">
            {sub_description}
          </p>
        )}

        <button
          className={
            buttonText === 'Find your safe zone'
              ? 'inline-flex items-center px-6 py-2.5 rounded-full bg-[#3CB550] hover:bg-[#2d9a42] text-white text-sm sm:text-base font-medium shadow-lg hover:shadow-xl transition-all duration-300'
              : 'inline-flex items-center px-6 py-2.5 rounded-full border border-gray-300 bg-white text-gray-800 text-sm sm:text-base font-medium shadow-sm hover:border-[#3CB550] transition-colors duration-200'
          }
        >
          {buttonText}
        </button>
      </div>
    </div>
  </div>
);

const Benefits: React.FC = () => {
  const services: ServiceCard[] = [
    {
      id: 1,
      icon: '/icons/lighthouse.png',
      title: 'Lighthouse',
      description: 'A guiding light that reveals where real estate opportunity is rising, so every move is made with clarity, not guesswork.',
      buttonText: 'See your portfolio',
      label: 'OPPORTUNITY RADAR',
      sub_title: 'Find your safe zone before you find a home',
      sub_description: "Compass analyzes your income, debts, spending, and goals to map out what's truly safe, from price range and borrowing power to which homes fit your financial reality, like a financial compass guiding you with no sales, no guesswork, just clear boundaries that protect you.",
    },
    {
      id: 2,
      icon: '/icons/compass.png',
      title: 'Compass',
      description: 'A personal compass that turns your finances into a clear path, where home decisions feel grounded, safe, and certain.',
      buttonText: 'Find your safe zone',
      label: 'FINANCIAL CLARITY',
      sub_title:'A steady light that reveals the real story behind your properties',
      sub_description: "Lighthouse maps your entire real estate portfolio and turns it into a living financial picture, showing how cashflow, debt, market shifts, and refinancing risk interact across everything you own.",
    },
    {
      id: 3,
      icon: '/icons/harbor.png',
      title: 'Harbor',
      description: 'Harbor brings verified buyers, investors, and lenders into a safe harbor, where capital flows smoothly and deals close cleanly.',
      buttonText: 'Enter our harbor',
      label: 'CAPITAL CONNECT',
      sub_title:'A safe harbor where verified capital meets real estate',
      sub_description: "Harbor connects only financially verified buyers, investors, banks, and developers, using FinHome's data to make sure every deal begins with real financial readiness, not promises.",
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

