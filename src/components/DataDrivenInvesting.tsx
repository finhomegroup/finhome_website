import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

const DataDrivenInvesting: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <section className="relative  sm:py-16 lg:py-20 bg-white overflow-hidden">
      {/* Subtle dot background */}
      {/* <div
        className="absolute inset-0 opacity-60 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(209,213,219,0.7) 1px, transparent 0)',
          backgroundSize: '10px 10px',
        }}
      /> */}

      <div className="relative py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile: Text overlays image */}
        <div className="relative lg:hidden">
          {/* Chart illustration */}
          <div className="w-full flex justify-center sm:mb-8 relative" style={{ maxHeight: '220px', overflow: 'hidden' }}>
            <img
              src="/chart_2.png"
              alt="Data-driven investing chart"
              className="w-full max-w-4xl sm:max-w-5xl h-auto object-cover"
              style={{ 
                maxHeight: '250px', 
                width: '100%',
                objectPosition: 'top center'
              }}
            />
            {/* Gradient fade overlay ở dưới để làm mờ dần phần dưới */}
            <div 
              className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
              style={{
                background: 'linear-gradient(to bottom, transparent 0%, rgba(255, 255, 255, 0.8) 50%, rgba(255, 255, 255, 1) 100%)'
              }}
            />
          </div>

          {/* Title and Subtitle - Overlay on mobile */}
          <div className="absolute top-[-5%] sm:top-[16%] left-4 sm:left-6 right-4 sm:right-6 text-left">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900  sm:mb-4">
              {t.dataDriven.title}
            </h2>
            <p
              className="text-gray-900"
              style={{
                fontFamily: "'Maison Neue', 'Inter', 'Segoe UI', 'Roboto', 'Noto Sans', 'Helvetica Neue', Arial, sans-serif",
                fontSize: "20px",
                lineHeight: "130%"
              }}
            >
              {t.dataDriven.subtitle}
            </p>
          </div>
        </div>

        {/* Desktop: Original 2-column layout */}
        <div className="hidden lg:grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Left text content */}
          <div className="w-full">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-gray-900 mb-3">
              {t.dataDriven.title}
            </h2>
            <p
              className="text-base md:text-lg text-gray-900 mb-6"
              style={{
                fontFamily: "'Maison Neue', 'Inter', 'Segoe UI', 'Roboto', 'Noto Sans', 'Helvetica Neue', Arial, sans-serif",
                fontSize: '20px',
                lineHeight: '150%'
              }}
            >
              {t.dataDriven.subtitle}
            </p>

            <p
              className="text-base text-gray-700 leading-relaxed mb-4"
              style={{ textAlign: 'justify', textAlignLast: 'left', fontSize: '20px' }}
            >
              {t.dataDriven.description}
            </p>

            <button className="inline-flex items-center px-5 py-2 rounded-full border border-gray-300 bg-white text-xs sm:text-sm md:text-base text-gray-900 shadow-sm hover:border-[#3CB550] hover:text-[#3CB550] transition-colors duration-200">
              {t.dataDriven.cta}
              <span className="ml-1">&#8594;</span>
            </button>
          </div>

          {/* Right chart illustration */}
          <div className="w-full flex justify-center lg:justify-end mt-24 lg:mt-32">
            <img
              src="/3-03.png"
              alt="Data-driven investing chart"
              className="w-full max-w-5xl h-auto lg:scale-150 lg:origin-right"
            />
          </div>
        </div>

        {/* Mobile: CTA Button and Description below image */}
        <div className="lg:hidden">
          <div className="flex justify-end mb-8 sm:mb-10">
            <button className="inline-flex items-center px-5 sm:px-6 py-2.5 sm:py-3 rounded-full border border-gray-300 bg-gray-100 text-sm sm:text-base text-gray-800 hover:bg-gray-200 transition-colors duration-200 shadow-sm">
              {t.dataDriven.cta}
              <span className="ml-2">&#62;</span>
            </button>
          </div>

          <div className="max-w-4xl mx-auto">
            <p
              className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed"
              style={{ textAlign: 'justify', textAlignLast: 'left' }}
            >
              {t.dataDriven.description}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DataDrivenInvesting;
