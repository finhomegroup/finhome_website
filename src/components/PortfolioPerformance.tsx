
import React from 'react';

const PortfolioPerformance = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            PORTFOLIO PERFORMANCE
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* First Row */}
          <div className="text-center">
            <div className="text-5xl lg:text-6xl font-bold text-gray-900 mb-2">
              1600
            </div>
            <div className="text-xl lg:text-2xl font-semibold text-brand-600">
              Startups
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-5xl lg:text-6xl font-bold text-gray-900 mb-2">
              150
            </div>
            <div className="text-xl lg:text-2xl font-semibold text-brand-600">
              Cohorts
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-5xl lg:text-6xl font-bold text-gray-900 mb-2">
              76%
            </div>
            <div className="text-xl lg:text-2xl font-semibold text-brand-600">
              Active
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-5xl lg:text-6xl font-bold text-gray-900 mb-2">
              42%
            </div>
            <div className="text-xl lg:text-2xl font-semibold text-brand-600">
              Female-Led
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {/* Second Row */}
          <div className="text-center">
            <div className="text-5xl lg:text-6xl font-bold text-gray-900 mb-2">
              76%
            </div>
            <div className="text-xl lg:text-2xl font-semibold text-brand-600">
              Funded Post-Accelerator
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-5xl lg:text-6xl font-bold text-gray-900 mb-2">
              £1.7M
            </div>
            <div className="text-xl lg:text-2xl font-semibold text-brand-600">
              Average Funding
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-5xl lg:text-6xl font-bold text-gray-900 mb-2">
              £5.6B
            </div>
            <div className="text-xl lg:text-2xl font-semibold text-brand-600">
              Total Portfolio Valuation
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PortfolioPerformance;
