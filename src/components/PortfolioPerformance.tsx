import React from 'react';
import { AnimatedNumber } from '@/components/ui/animated-number';

const PortfolioPerformance = () => {
  return (
    <section className="py-16  bg-gray-50 overflow-hidden relative min-h-[600px] lg:min-h-[600px]">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
                <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900 mb-3 sm:mb-4 animate-fade-in">
            Platform Performance
          </h2>
          <div className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 leading-relaxed mt-3 sm:mt-4 max-w-2xl sm:max-w-3xl mx-auto px-2">
          Connecting investors to premium real estate assets
          </div>
        </div>
        
        <div className="bg-gray-120 border border-gray-200 rounded-lg p-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* First Row */}
            <div className="text-center transform hover:scale-105 transition-transform duration-300">
              <AnimatedNumber
                value={500}
                suffix="+"
                className="text-4xl font-semibold sm:text-4xl text-gray-900 mb-2"
                duration={2500}
              />
              <div className="text-lg sm:text-xl text-gray-600">
                Property Listings
              </div>
            </div>
            
            <div className="text-center transform hover:scale-105 transition-transform duration-300">
              <AnimatedNumber
                value={250}
                suffix="M+"
                className="text-4xl font-semibold sm:text-4xl text-gray-900 mb-2"
                duration={2000}
              />
              <div className="text-lg sm:text-xl text-gray-600 whitespace-nowrap">
                Total Transaction Value
              </div>
            </div>
            
            <div className="text-center transform hover:scale-105 transition-transform duration-300">
              <AnimatedNumber
                value={98}
                suffix="%"
                className="text-4xl font-semibold sm:text-4xl text-gray-900 mb-2"
                duration={2200}
              />
              <div className="text-lg sm:text-xl text-gray-600">
                Customer Satisfaction
              </div>
            </div>
            
            <div className="text-center transform hover:scale-105 transition-transform duration-300">
              <AnimatedNumber
                value={15}
                suffix="+"
                className="text-4xl font-semibold sm:text-4xl text-gray-900 mb-2"
                duration={2600}
              />
              <div className="text-lg sm:text-xl text-gray-600">
                Years in Business
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16 lg:gap-32 mt-12">
            {/* Second Row */}
            <div className="text-center transform hover:scale-105 transition-transform duration-300">
              <AnimatedNumber
                value={50000}
                suffix="+"
                className="text-4xl font-semibold sm:text-4xl text-gray-900 mb-2"
                duration={2300}
              />
              <div className="text-lg sm:text-xl text-gray-600">
                Active Investors
              </div>
            </div>
            
            
                         <div className="flex justify-center items-center transform hover:scale-105 transition-transform duration-300">
               <div className="bg-white border border-gray-200 rounded-lg shadow-sm px-4 py-0 text-center">
                 <AnimatedNumber
                   value={12}
                   suffix="%"
                   className="text-4xl sm:text-5xl font-semibold text-[#3CB550] mb-2"
                   duration={1800}
                 />
                 <div className="text-lg sm:text-xl lg:text-2xl text-gray-600">
                   Average ROI
                 </div>
               </div>
             </div>
            
            <div className="text-center transform hover:scale-105 transition-transform duration-300">
              <AnimatedNumber
                value={99}
                suffix="%"
                className="text-4xl font-semibold sm:text-4xl text-gray-900 mb-2"
                duration={3200}
              />
              <div className="text-lg sm:text-xl text-gray-600">
              Loan Approval Rate
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PortfolioPerformance;
