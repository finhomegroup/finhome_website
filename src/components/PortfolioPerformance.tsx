import React from 'react';
import { AnimatedNumber } from '@/components/ui/animated-number';

const PortfolioPerformance = () => {
  return (
    <section className="py-16  bg-gray-50 overflow-hidden relative min-h-[600px] lg:min-h-[600px]">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
                <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900 mb-3 sm:mb-4 animate-fade-in">
            Insight To Impact
          </h2>
          <div className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 leading-relaxed mt-3 sm:mt-4 max-w-2xl sm:max-w-3xl mx-auto px-2">
            Where real-time insight becomes real-world financial confidence
          </div>
        </div>
        
        <div className="bg-gray-120 border border-gray-200 rounded-lg p-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* First Row */}
            <div className="group text-center transform hover:scale-105 transition-transform duration-300">
              <div className="bg-transparent group-hover:bg-white border border-transparent group-hover:border-gray-200 rounded-lg shadow-sm px-4 py-2 transition-colors duration-300">
                <AnimatedNumber
                  value={5}
                  suffix="K+"
                  className="text-4xl font-semibold sm:text-4xl text-black mb-2 group-hover:text-[#3CB550] transition-colors duration-300"
                  duration={2500}
                />
                <div className="text-lg sm:text-xl text-black">
                  Homes Analyzed
                </div>
              </div>
            </div>
            
            <div className="group text-center transform hover:scale-105 transition-transform duration-300">
              <div className="bg-transparent group-hover:bg-white border border-transparent group-hover:border-gray-200 rounded-lg shadow-sm px-4 py-2 transition-colors duration-300">
                <AnimatedNumber
                  value={2.4}
                  decimals={1}
                  suffix="M+"
                  className="text-4xl font-semibold sm:text-4xl text-black mb-2 group-hover:text-[#3CB550] transition-colors duration-300"
                  duration={2000}
                />
                <div className="text-lg sm:text-xl text-black whitespace-nowrap">
                  Risk Signals Processed
                </div>
              </div>
            </div>
            
            <div className="group text-center transform hover:scale-105 transition-transform duration-300">
              <div className="bg-transparent group-hover:bg-white border border-transparent group-hover:border-gray-200 rounded-lg shadow-sm px-4 py-2 transition-colors duration-300">
                <AnimatedNumber
                  value={48}
                  suffix="K+"
                  className="text-4xl font-semibold sm:text-4xl text-black mb-2 group-hover:text-[#3CB550] transition-colors duration-300"
                  duration={2200}
                />
                <div className="text-lg sm:text-xl text-black">
                  Active Portfolios
                </div>
              </div>
            </div>
            
            <div className="group text-center transform hover:scale-105 transition-transform duration-300">
              <div className="bg-transparent group-hover:bg-white border border-transparent group-hover:border-gray-200 rounded-lg shadow-sm px-4 py-2 transition-colors duration-300">
                <AnimatedNumber
                  value={81}
                  suffix="%"
                  className="text-4xl font-semibold sm:text-4xl text-black mb-2 group-hover:text-[#3CB550] transition-colors duration-300"
                  duration={2600}
                />
                <div className="text-lg sm:text-xl text-black">
                  Profitable Homes
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16 lg:gap-32 mt-12">
            {/* Second Row */}
            <div className="group text-center transform hover:scale-105 transition-transform duration-300">
              <div className="bg-transparent group-hover:bg-white border border-transparent group-hover:border-gray-200 rounded-lg shadow-sm px-4 py-2 transition-colors duration-300">
                <AnimatedNumber
                  value={3.8}
                  decimals={1}
                  prefix="$"
                  suffix="B+"
                  className="text-4xl font-semibold sm:text-4xl text-black mb-2 group-hover:text-[#3CB550] transition-colors duration-300"
                  duration={2300}
                />
                <div className="text-lg sm:text-xl text-black">
                  Capital Tracked
                </div>
              </div>
            </div>
            
            
            <div className="group flex justify-center items-center transform hover:scale-105 transition-transform duration-300">
              <div className="bg-transparent group-hover:bg-white border border-transparent group-hover:border-gray-200 rounded-lg shadow-sm px-4 py-2 text-center transition-colors duration-300">
                <AnimatedNumber
                  value={97}
                  suffix="%"
                  className="text-4xl font-semibold sm:text-4xl text-black mb-2 group-hover:text-[#3CB550] transition-colors duration-300"
                  duration={1800}
                />
                <div className="text-lg sm:text-xl text-black">
                  Safe-Zone Decisions
                </div>
              </div>
            </div>
            
            <div className="group text-center transform hover:scale-105 transition-transform duration-300">
              <div className="bg-transparent group-hover:bg-white border border-transparent group-hover:border-gray-200 rounded-lg shadow-sm px-4 py-2 transition-colors duration-300">
                <AnimatedNumber
                  value={93}
                  suffix="%"
                  className="text-4xl font-semibold sm:text-4xl text-black mb-2 group-hover:text-[#3CB550] transition-colors duration-300"
                  duration={3200}
                />
                <div className="text-lg sm:text-xl text-black">
                Verified Capital Matches
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PortfolioPerformance;
