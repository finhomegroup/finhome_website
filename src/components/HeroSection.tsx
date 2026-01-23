import React from 'react';
import { Button } from "@/components/ui/button";
import { Play, TrendingUp, Users, DollarSign, Radio } from 'lucide-react';
import { TypeAnimation } from 'react-type-animation';
import DotHalftoneHero from './DotHalftoneHero';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';

const HeroSection = () => {
  const { t } = useLanguage();
  const isMobile = useIsMobile();

  return (
    <section className="relative overflow-hidden -mt-16 pt-16" style={{ minHeight: 350 }}>
      {/* Background: Image on mobile, DotHalftoneHero on desktop */}
      <div className="absolute inset-0 z-0">
        {/* Mobile: Show image */}
        <img
          src="/map_hero.png"
          alt="Southeast Asia Map"
          className="md:hidden w-full "

        />
        {/* Desktop: Show DotHalftoneHero */}
        {!isMobile && (
          <div className="hidden md:block">
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
        )}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-24 lg:py-32 xl:py-48 pointer-events-none">
        <div className="text-left">
          <div className="animate-fade-in">
            {/* Badge with icon and text */}
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1.5 sm:px-4 sm:py-2 mb-1 sm:mb-6 shadow-sm border border-gray-200 pointer-events-auto">
              <Radio className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-gray-600" />
              <span className="text-xs sm:text-sm lg:text-base font-medium text-gray-700">{t.hero.badge}</span>
            </div>

            <h1 className="mb-4 sm:mb-6">
              <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                <TypeAnimation
                  sequence={[
                    t.hero.title1,
                    2000,
                  ]}
                  speed={50}
                  wrapper="span"
                  repeat={Infinity}
                  cursor={false}
                />
              </div>
              <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight sm:mt-2">
                <TypeAnimation
                  sequence={[
                    t.hero.title2,
                    2000,
                  ]}
                  speed={50}
                  wrapper="span"
                  repeat={Infinity}
                  cursor={false}
                />
              </div>
              <div className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed mt-1 sm:mt-6 max-w-2xl sm:max-w-3xl text-left">
                <TypeAnimation
                  sequence={[
                    t.hero.description,
                    2000,
                  ]}
                  speed={50}
                  wrapper="span"
                  repeat={Infinity}
                  cursor={false}
                />
              </div>
            </h1>

            {/* Action Buttons */}
            {/* <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-left items-center mt-6 sm:mt-8 pointer-events-auto">
              <Button className="px-6 py-3 text-base sm:text-lg font-semibold bg-[#3CB550] hover:bg-[#2d9a42] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                {t.common.getStarted}
              </Button>
              <Button className="px-6 py-3 text-base sm:text-lg font-semibold bg-gray-800 hover:bg-gray-900 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                {t.common.learnMore}
              </Button>
            </div> */}

            <p className="text-sm sm:text-base lg:text-xl text-gray-600 mb-6 sm:mb-8 leading-relaxed mt-6 sm:mt-8">
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
