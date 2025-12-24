import React from 'react';
import { Button } from "@/components/ui/button";
import { Play, TrendingUp, Users, DollarSign, Radio } from 'lucide-react';
import { TypeAnimation } from 'react-type-animation';
import DotHalftoneHero from './DotHalftoneHero';

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden min-h-screen -mt-16 pt-16">
      {/* DotHalftoneHero Background */}
      <div className="absolute inset-0 z-0">
        <DotHalftoneHero 
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '100%',
            height: '100%',
            maxWidth: 'none',
          }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32 xl:py-48 pointer-events-none">
        <div className="text-left">
          <div className="animate-fade-in">
            {/* Badge with icon and text */}
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1.5 sm:px-4 sm:py-2 mb-4 sm:mb-6 shadow-sm border border-gray-200 pointer-events-auto">
              <Radio className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-gray-600" />
              <span className="text-xs sm:text-sm lg:text-base font-medium text-gray-700">FinHome</span>
            </div>
            
            <h1 className="mb-4 sm:mb-6">
              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl  font-semibold text-gray-900 leading-tight whitespace-nowrap overflow-hidden">
              <TypeAnimation
                  sequence={[
                    "Build wealth with",
                    2000,
                  ]}
                  speed={50}
                  wrapper="span"
                  repeat={Infinity}
                  cursor={false}
                />
              </div>
              <div className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900 leading-tight mt-1 sm:mt-2 whitespace-nowrap overflow-hidden">
                <TypeAnimation
                  sequence={[
                    "intelligent real estate.",
                    2000,
                  ]}
                  speed={50}
                  wrapper="span"
                  repeat={Infinity}
                  cursor={false}
                />
              </div>
              <div className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 leading-relaxed mt-3 sm:mt-4 max-w-2xl sm:max-w-3xl text-left">
                <TypeAnimation
                  sequence={[
                    "The modern platform for fractional ownership. \nAccess institutional-quality commercial and residential deals \nwith as little as $500.",
                    2000,
                  ]}
                  speed={50}
                  wrapper="span"
                  repeat={Infinity}
                  cursor={false}
                  style={{ whiteSpace: 'pre-line' }}
                />
              </div>
            </h1>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-left items-center mt-6 sm:mt-8 pointer-events-auto">
              <Button className="px-6 py-3 text-base sm:text-lg font-semibold bg-[#3CB550] hover:bg-[#2d9a42] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                Get Started
              </Button>
              <Button className="px-6 py-3 text-base sm:text-lg font-semibold bg-gray-800 hover:bg-gray-900 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                Learn More
              </Button>
            </div>
            
            <p className="text-sm sm:text-base lg:text-xl text-gray-600 mb-6 sm:mb-8 leading-relaxed mt-6 sm:mt-8">
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
