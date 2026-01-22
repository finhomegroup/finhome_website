import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

const DataDrivenInvesting: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <section className="relative py-12 sm:py-16 lg:py-20 bg-white overflow-hidden">
      {/* Subtle dot background */}
      <div
        className="absolute inset-0 opacity-60 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(209,213,219,0.7) 1px, transparent 0)',
          backgroundSize: '10px 10px',
        }}
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile: Text overlays image */}
        <div className="relative lg:hidden">
          {/* Chart illustration */}
          <div className="w-full flex justify-center mb-6 sm:mb-8">
            <img
              src="/3-03.png"
              alt="Data-driven investing chart"
              className="w-full max-w-4xl sm:max-w-5xl h-auto"
            />
          </div>

          {/* Title and Subtitle - Overlay on mobile */}
          <div className="absolute top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-6 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
              {t.dataDriven.title}
            </h2>
            <p className="text-base sm:text-lg text-gray-900">
              {t.dataDriven.subtitle}
            </p>
          </div>
        </div>

        {/* Desktop: Original 2-column layout */}
        <div className="hidden lg:grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Left text content */}
          <div className="w-full">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-gray-900 mb-3 md:whitespace-nowrap">
              {t.dataDriven.title}
            </h2>
            <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-600 mb-6">
              {t.dataDriven.subtitle}
            </p>

            <p className="text-xs sm:text-sm md:text-base text-gray-700 leading-relaxed mb-4">
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
            <button className="inline-flex items-center px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg border border-gray-300 bg-gray-100 text-sm sm:text-base text-gray-800 hover:bg-gray-200 transition-colors duration-200 shadow-sm">
              {t.dataDriven.cta}
              <span className="ml-2">&#62;</span>
            </button>
          </div>

          <div className="max-w-4xl mx-auto">
            <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed text-left">
              {t.dataDriven.description}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DataDrivenInvesting;
