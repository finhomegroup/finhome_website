import React from 'react';
import { Button } from "@/components/ui/button";
import { Play, TrendingUp, Users, DollarSign, Radio } from 'lucide-react';
import { TypeAnimation } from 'react-type-animation';

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden min-h-screen -mt-16 pt-16">
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32 xl:py-48">
        <div className="text-center">
          <div className="animate-fade-in">
            {/* Badge with icon and text */}
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1.5 sm:px-4 sm:py-2 mb-4 sm:mb-6 shadow-sm border border-gray-200">
              <Radio className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-gray-600" />
              <span className="text-xs sm:text-sm lg:text-base xl:text-lg font-medium text-gray-700">Van Lang Incubation Center</span>
            </div>
            
            <h1 className="mb-4 sm:mb-6">
              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-demi text-gray-900 leading-tight whitespace-nowrap overflow-hidden">
                <span>
                  The <span className="text-red-600">#1</span> Startup Launchpad
                </span>
              </div>
              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-demi text-gray-900 leading-tight mt-1 sm:mt-2 whitespace-nowrap overflow-hidden">
                <TypeAnimation
                  sequence={[
                    "for Pioneers in South East Asia",
                    2000,
                  ]}
                  speed={50}
                  wrapper="span"
                  repeat={Infinity}
                  cursor={false}
                />
              </div>
              <div className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 leading-relaxed mt-3 sm:mt-4 max-w-2xl sm:max-w-3xl mx-auto px-2">
                <TypeAnimation
                  sequence={[
                    "Build bold ideas with top mentors and real-world projects, all from\nthe heart of Southeast Asia's most dynamic innovation hub",
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
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mt-6 sm:mt-8">
              <Button className="px-6 py-3 text-base sm:text-lg font-semibold bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                Project
              </Button>
              <Button className="px-6 py-3 text-base sm:text-lg font-semibold bg-gray-800 hover:bg-gray-900 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                Mentors
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
