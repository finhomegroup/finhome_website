
import React from 'react';
import { AnimatedNumber } from '@/components/ui/animated-number';

const PortfolioPerformance = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 animate-fade-in">
            PORTFOLIO PERFORMANCE
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* First Row */}
          <div className="text-center transform hover:scale-105 transition-transform duration-300">
            <AnimatedNumber
              value={1600}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-2"
              duration={2500}
            />
            <div className="text-lg sm:text-xl lg:text-2xl font-semibold text-brand-600">
              Startups
            </div>
          </div>
          
          <div className="text-center transform hover:scale-105 transition-transform duration-300">
            <AnimatedNumber
              value={150}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-2"
              duration={2000}
            />
            <div className="text-lg sm:text-xl lg:text-2xl font-semibold text-brand-600">
              Cohorts
            </div>
          </div>
          
          <div className="text-center transform hover:scale-105 transition-transform duration-300">
            <AnimatedNumber
              value={76}
              suffix="%"
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-2"
              duration={2200}
            />
            <div className="text-lg sm:text-xl lg:text-2xl font-semibold text-brand-600">
              Active
            </div>
          </div>
          
          <div className="text-center transform hover:scale-105 transition-transform duration-300">
            <AnimatedNumber
              value={42}
              suffix="%"
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-2"
              duration={1800}
            />
            <div className="text-lg sm:text-xl lg:text-2xl font-semibold text-brand-600">
              Female-Led
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {/* Second Row */}
          <div className="text-center transform hover:scale-105 transition-transform duration-300">
            <AnimatedNumber
              value={76}
              suffix="%"
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-2"
              duration={2300}
            />
            <div className="text-lg sm:text-xl lg:text-2xl font-semibold text-brand-600">
              Funded Post-Accelerator
            </div>
          </div>
          
          <div className="text-center transform hover:scale-105 transition-transform duration-300">
            <AnimatedNumber
              value={1.7}
              prefix="£"
              suffix="M"
              decimals={1}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-2"
              duration={2600}
            />
            <div className="text-lg sm:text-xl lg:text-2xl font-semibold text-brand-600">
              Average Funding
            </div>
          </div>
          
          <div className="text-center transform hover:scale-105 transition-transform duration-300">
            <AnimatedNumber
              value={5.6}
              prefix="£"
              suffix="B"
              decimals={1}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-2"
              duration={3000}
            />
            <div className="text-lg sm:text-xl lg:text-2xl font-semibold text-brand-600">
              Total Portfolio Valuation
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PortfolioPerformance;
