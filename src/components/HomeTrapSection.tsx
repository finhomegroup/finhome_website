import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

const HomeTrapSection: React.FC = () => {
  const { t, language } = useLanguage();
  
  // Change image based on language
  const imageSrc = language === 'vi' ? '/Asset_2.png' : '/1-01.png';
  
  return (
    <section id="home-trap" className="relative py-4 bg-white overflow-hidden">
      <div className="relative max-w-6xl mx-auto px-4 pt-4 sm:px-6 lg:px-8  sm:py-16 lg:py-20">
        {/* Header Section - Left aligned */}
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-2 sm:mb-6">
            {t.homeTrap.title}
          </h2>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-900 leading-relaxed max-w-3xl">
            {t.homeTrap.subtitle}
          </p>
        </div>

        {/* Content Section */}
        <div className="relative">
          {/* Description text - shown on mobile above image, on desktop as overlay */}
          <div className="lg:hidden mb-2">
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

          {/* Image Container */}
          <div className="relative w-full">
            <img
              src={imageSrc}
              alt="Home risk map illustration"
              className="w-full max-w-4xl h-auto mx-auto lg:ml-auto lg:mr-0"
            />

            {/* Text overlay on image - Desktop only */}
            <div className="hidden lg:block absolute inset-y-0 left-0 items-center">
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
        </div>
      </div>
    </section>
  );
};

export default HomeTrapSection;
