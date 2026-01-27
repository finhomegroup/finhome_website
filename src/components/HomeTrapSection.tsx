import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

const HomeTrapSection: React.FC = () => {
  const { t, language } = useLanguage();
  
  // Change image based on language
  const imageSrc = language === 'vi' ? '/Asset_2.png' : '/1-01.png';
  
  return (
    <section id="home-trap" className="relative py-4 bg-white overflow-hidden">
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8  sm:py-16 lg:py-20">
        {/* Header Section - Left aligned */}
        <div className="relative text-center mb-8 sm:mb-10 lg:mb-12">
          <div
            className="absolute -inset-x-6 -top-6 h-[170px] sm:h-[190px] lg:h-[220px] pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, rgba(209,213,219,0.55) 1px, transparent 0)',
              backgroundSize: '10px 10px',
              opacity: 0.5
            }}
          />

          <h2 className="relative text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-gray-900 mb-2 sm:mb-3 tracking-tight leading-[1.08]">
            {t.homeTrap.title}
          </h2>
          <p
            className="relative text-base md:text-lg lg:text-xl text-gray-600 max-w-xl sm:max-w-2xl mx-auto px-[0.38rem] leading-relaxed sm:mt-4"
            style={{
              fontFamily: "'Maison Neue', 'Inter', 'Segoe UI', 'Roboto', 'Noto Sans', 'Helvetica Neue', Arial, sans-serif",
            }}
          >
            {t.homeTrap.subtitle}
          </p>
        </div>

        {/* Content Section */}
        <div className="relative">
          {/* Image Container */}
          <div className="relative w-full lg:flex lg:justify-end">
            <img
              src={imageSrc}
              alt="Home risk map illustration"
              className="w-full max-w-4xl lg:max-w-3xl xl:max-w-4xl h-auto mx-auto lg:mx-0 lg:translate-x-8"
            />

            {/* Text overlay on image - Desktop only */}
            <div className="hidden lg:block absolute inset-y-0 left-0 items-center lg:translate-y-28">
              <div className="max-w-lg px-6 sm:px-8 py-6 sm:py-8 m-6 sm:m-8">
                <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed mb-6">
                  {t.homeTrap.description1}
                </p>
                {t.homeTrap.description2 && (
                  <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed mb-6">
                    {t.homeTrap.description2}
                  </p>
                )}
                {/* <button className="inline-flex items-center px-6 py-3 rounded-full bg-[#3CB550] hover:bg-[#2d9a42] text-white text-sm sm:text-base font-medium shadow-lg hover:shadow-xl transition-all duration-300">
                  {t.homeTrap.cta}
                </button> */}
              </div>
            </div>
          </div>

          {/* Description text - below image */}
          <div className="mt-6 lg:hidden">
            <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed mb-6">
              {t.homeTrap.description1}
            </p>
            {t.homeTrap.description2 && (
              <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed mb-6">
                {t.homeTrap.description2}
              </p>
            )}
            {/* <button className="inline-flex items-center px-6 py-3 rounded-full bg-[#3CB550] hover:bg-[#2d9a42] text-white text-sm sm:text-base font-medium shadow-lg hover:shadow-xl transition-all duration-300">
              {t.homeTrap.cta}
            </button> */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeTrapSection;
