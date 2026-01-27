import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

const FinhomeEcosystem: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <section id="ecosystem" className="relative py-8 sm:py-12 lg:py-16 bg-gray-50 overflow-hidden">
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left text content - Mobile: shown first, Desktop: left side */}
          <div className="mb-8 lg:mb-0 text-center lg:text-left lg:order-2">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900 mb-1 sm:mb-4">
              {t.ecosystem.title}
            </h2>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-900 mb-4 sm:mb-6" style={{
              fontFamily: "'Maison Neue', 'Inter', 'Segoe UI', 'Roboto', 'Noto Sans', 'Helvetica Neue', Arial, sans-serif",
              fontSize: "20px",
              lineHeight: "150%"
            }}>
              {t.ecosystem.subtitle}
            </p>
            <p
              className="text-base md:text-lg text-gray-700 leading-relaxed mb-6 sm:mb-8 max-w-3xl mx-auto lg:mx-0"
              style={{ textAlign: 'justify', textAlignLast: 'left', fontSize: '20px' }}
            >
              {t.ecosystem.description}
            </p>

            {/* Action buttons */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-3 sm:gap-4">
              <button className="px-5 sm:px-6 py-2 sm:py-2.5 rounded-full border border-gray-300 bg-white text-sm sm:text-base text-gray-800 hover:bg-gray-50 transition-all duration-300 shadow-sm hover:shadow-md">
                {t.ecosystem.button1}
              </button>
              <button className="px-5 sm:px-6 py-2 sm:py-2.5 rounded-full border border-gray-300 bg-white text-sm sm:text-base text-gray-800 hover:bg-gray-50 transition-all duration-300 shadow-sm hover:shadow-md">
                {t.ecosystem.button2}
              </button>
              <button className="px-5 sm:px-6 py-2 sm:py-2.5 rounded-full border border-gray-300 bg-white text-sm sm:text-base text-gray-800 hover:bg-gray-50 transition-all duration-300 shadow-sm hover:shadow-md">
                {t.ecosystem.button3}
              </button>
            </div>
          </div>

          {/* Right image - Mobile: shown below, Desktop: right side */}
          <div className="w-full flex justify-center lg:justify-start lg:order-1">
            <img
              src="/2-02.png"
              alt="Finhome ecosystem illustration"
              className="w-full max-w-2xl sm:max-w-3xl lg:max-w-4xl h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinhomeEcosystem;
