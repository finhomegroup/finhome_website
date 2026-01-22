import React from 'react';
import { AnimatedNumber } from '@/components/ui/animated-number';
import { useLanguage } from '@/contexts/LanguageContext';

const PortfolioPerformance = () => {
  const { t } = useLanguage();

  return (
    <section className="py-4  overflow-hidden relative lg:min-h-[600px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900 mb-3 sm:mb-4 animate-fade-in">
            {t.portfolio.title}
          </h2>
          <div className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 leading-relaxed mt-3 sm:mt-4 max-w-2xl sm:max-w-3xl mx-auto px-2">
            {t.portfolio.subtitle}
          </div>
        </div>
        
        <div className="bg-gray-50 border border-gray-200  rounded-lg p-6 sm:p-8 shadow-sm">
          {/* Mobile: 2 columns, 3 rows | Desktop: 4 columns, 1 row + 3 columns centered */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Row 1: 5N+ and 2.4T+ */}
            <div className="group text-center  transform hover:scale-105 transition-transform duration-300">
              <AnimatedNumber
                value={5}
                suffix="N+"
                className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 group-hover:text-[#3CB550] transition-colors duration-300"
                duration={2500}
              />
              <div className="text-sm sm:text-base text-gray-600">
                {t.portfolio.metrics.homesAnalyzed}
              </div>
            </div>
            
            <div className="group text-center transform hover:scale-105 transition-transform duration-300">
              <AnimatedNumber
                value={2.4}
                decimals={1}
                suffix="T+"
                className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 group-hover:text-[#3CB550] transition-colors duration-300"
                duration={2000}
              />
              <div className="text-sm sm:text-base text-gray-600">
                {t.portfolio.metrics.riskSignals}
              </div>
            </div>
            
            {/* Row 2: 81% and 48N+ */}
            <div className="group text-center transform hover:scale-105 transition-transform duration-300">
              <AnimatedNumber
                value={81}
                suffix="%"
                className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 group-hover:text-[#3CB550] transition-colors duration-300"
                duration={2600}
              />
              <div className="text-sm sm:text-base text-gray-600">
                {t.portfolio.metrics.profitableHomes}
              </div>
            </div>
            
            <div className="group text-center transform hover:scale-105 transition-transform duration-300">
              <AnimatedNumber
                value={48}
                suffix="N+"
                className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 group-hover:text-[#3CB550] transition-colors duration-300"
                duration={2200}
              />
              <div className="text-sm sm:text-base text-gray-600">
                {t.portfolio.metrics.activePortfolios}
              </div>
            </div>
          </div>
          
          {/* Row 3: 97% and 93% - Centered on mobile, part of grid on desktop */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mt-6 lg:mt-8 lg:max-w-3xl lg:mx-auto">
            <div className="group text-center transform hover:scale-105 transition-transform duration-300">
              <div className="border-2 border-gray-300 rounded-lg px-4 py-3">
                <AnimatedNumber
                  value={97}
                  suffix="%"
                  className="text-3xl sm:text-4xl font-bold text-[#3CB550] mb-2 transition-colors duration-300"
                  duration={1800}
                />
                <div className="text-sm sm:text-base text-gray-600">
                  {t.portfolio.metrics.safeDecisions}
                </div>
              </div>
            </div>
            
            <div className="group text-center transform hover:scale-105 transition-transform duration-300">
              <AnimatedNumber
                value={93}
                suffix="%"
                className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 group-hover:text-[#3CB550] transition-colors duration-300"
                duration={3200}
              />
              <div className="text-sm sm:text-base text-gray-600">
                {t.portfolio.metrics.verifiedMatches}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PortfolioPerformance;
