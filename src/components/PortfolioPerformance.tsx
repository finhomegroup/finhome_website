import React from 'react';
import { AnimatedNumber } from '@/components/ui/animated-number';

const PortfolioPerformance = () => {
  return (
    <section 
      className="py-16 bg-gray-50 relative min-h-[600px] lg:min-h-[600px]"
      style={{
        backgroundImage: 'url(https://cdn.prod.website-files.com/63f3e085b054e9e3120238f1/64467bfae94cbf19454041ab_Growth%20Number%20Background%201.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Optional overlay for better text readability */}
      <div className="absolute inset-0 bg-white/10"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center mb-12">
          <h2 className="text-6xl lg:text-6xl font-extrabold text-gray-900 mb-4 animate-fade-in">
            PORTFOLIO PERFORMANCE
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* First Row */}
          <div className="text-center transform hover:scale-105 transition-transform duration-300">
            <AnimatedNumber
              value={80}
              suffix="+"
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-2"
              duration={2500}
            />
            <div className="text-lg sm:text-xl lg:text-2xl font-semibold text-brand-600">
              Startup Ideas / Year
            </div>
          </div>
          
          <div className="text-center transform hover:scale-105 transition-transform duration-300">
            <AnimatedNumber
              value={5}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-2"
              duration={2000}
            />
            <div className="text-lg sm:text-xl lg:text-2xl font-semibold text-brand-600 whitespace-nowrap">
              Student Startup Launched
            </div>
          </div>
          
          <div className="text-center transform hover:scale-105 transition-transform duration-300">
            <AnimatedNumber
              value={70}
              suffix="+"
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-2"
              duration={2200}
            />
            <div className="text-lg sm:text-xl lg:text-2xl font-semibold text-brand-600">
              Awards & Recognitions
            </div>
          </div>
          
          <div className="text-center transform hover:scale-105 transition-transform duration-300">
            <AnimatedNumber
              value={3}
              suffix="+"
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-2"
              duration={2600}
            />
            <div className="text-lg sm:text-xl lg:text-2xl font-semibold text-brand-600">
              Competitions / Year
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {/* Second Row */}
          <div className="text-center transform hover:scale-105 transition-transform duration-300">
            <AnimatedNumber
              value={1000}
              suffix="+"
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-2"
              duration={2300}
            />
            <div className="text-lg sm:text-xl lg:text-2xl font-semibold text-brand-600">
              Students Engaged / Year
            </div>
          </div>
          
          
          <div className="text-center transform hover:scale-105 transition-transform duration-300">
            <AnimatedNumber
              value={30}
              prefix="$"
              suffix="K+"
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-2"
              duration={1800}
            />
            <div className="text-lg sm:text-xl lg:text-2xl font-semibold text-brand-600">
              Prizes & Seed Funding
            </div>
          </div>
          
          <div className="text-center transform hover:scale-105 transition-transform duration-300">
            <AnimatedNumber
              value={10}
              suffix="+"
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-2"
              duration={3000}
            />
            <div className="text-lg sm:text-xl lg:text-2xl font-semibold text-brand-600">
              Partner
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
          {/* Third Row */}
          <div className="text-center transform hover:scale-105 transition-transform duration-300">
            <AnimatedNumber
              value={47}
              suffix="%"
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-2"
              duration={2400}
            />
            <div className="text-lg sm:text-xl lg:text-2xl font-semibold text-brand-600">
            Female-Led
            </div>
          </div>
          
          <div className="text-center transform hover:scale-105 transition-transform duration-300">
            <AnimatedNumber
              value={20}
              suffix="+"
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-2"
              duration={2700}
            />
            <div className="text-lg sm:text-xl lg:text-2xl font-semibold text-brand-600">
              Mentors
            </div>
          </div>

          <div className="text-center transform hover:scale-105 transition-transform duration-300">
            <AnimatedNumber
              value={10}
              suffix="K+"
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-2"
              duration={2700}
            />
            <div className="text-lg sm:text-xl lg:text-2xl font-semibold text-brand-600">
            Course Graduates
            </div>
          </div>
          
          <div className="text-center transform hover:scale-105 transition-transform duration-300">
            <AnimatedNumber
              value={30}
              suffix="+"
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-2"
              duration={3200}
            />
            <div className="text-lg sm:text-xl lg:text-2xl font-semibold text-brand-600">
            Innovation Course
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PortfolioPerformance;
