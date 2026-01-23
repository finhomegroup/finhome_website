import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

const Partners = () => {
  const { t } = useLanguage();
  
  // Generate 32 icons
  const icons = Array.from({ length: 32 }, (_, i) => ({
    id: i + 1,
    image: `/icons/image${(i + 1).toString().padStart(2, '0')}.webp`,
    imageFallback: `/icons/image${(i + 1).toString().padStart(2, '0')}.png`,
    name: `Icon ${i + 1}`,
  }));

  // Split into two rows: 16 icons each
  const topRow = icons.slice(0, 16);
  const bottomRow = icons.slice(16, 32);

  const renderIcons = (iconsList: typeof icons, prefix = "") =>
    iconsList.map((icon) => (
      <div
        key={`${prefix}${icon.id}`}
        className="flex-shrink-0 group"
      >
        <div className="w-16 h-16 md:w-20 md:h-20 mx-2 md:mx-3 bg-white rounded-xl border-2 border-gray-200 group-hover:border-[#2d9a42] flex items-center justify-center p-2 md:p-3 transition-colors duration-150">
          <img
            src={icon.image}
            alt={icon.name}
            className="w-full h-full object-contain"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              // Try fallback to PNG
              if (target.src.includes('.webp')) {
                target.src = icon.imageFallback;
              } else {
                target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"%3E%3Crect width="60" height="60" fill="%23f3f4f6"/%3E%3Ctext x="30" y="30" text-anchor="middle" dy=".3em" fill="%236b7280" font-size="10"%3E' + icon.id + '%3C/text%3E%3C/svg%3E';
              }
            }}
          />
        </div>
      </div>
    ));

  return (
    <section 
      className="py-8 lg:py-12 relative overflow-hidden w-full bg-white"
      // style={{ backgroundColor: '#f0f0f0' }}
    >
      <div
        className="absolute inset-0 opacity-60 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(209,213,219,0.7) 1px, transparent 0)',
          backgroundSize: '10px 10px',
        }}
      />
      {/* Gradient overlay để làm mờ dần ở top và bottom */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 65%, rgba(255, 255, 255, 0) 85%, rgba(255, 255, 255, 1) 100%)'
        }}
      />
      <div className="w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900 mb-1 sm:mb-4 animate-fade-in">
            {t.partners.title}
          </h2>
          <div
            className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 leading-relaxed sm:mt-4 max-w-2xl sm:max-w-3xl mx-auto px-2"
            style={{
              fontFamily: "'Maison Neue', 'Inter', 'Segoe UI', 'Roboto', 'Noto Sans', 'Helvetica Neue', Arial, sans-serif",
              fontSize: "14px",
              lineHeight: "130%"
            }}
          >
            {t.partners.description}
          </div>
        </div>

        <div className="mt-12 space-y-6">
          
          {/* ==================== DÒNG TRÊN: PHẢI → TRÁI ==================== */}
          <div className="relative">
            <div className="top-row-container">
              <div className="top-row-track">
                <div className="top-row-content">{renderIcons(topRow)}</div>
                <div className="top-row-content">{renderIcons(topRow, "dup-top-")}</div>
              </div>
            </div>
          </div>

          {/* ==================== DÒNG DƯỚI: TRÁI → PHẢI ==================== */}
          <div className="relative">
            <div className="bottom-row-container">
              <div className="bottom-row-track">
                <div className="bottom-row-content">{renderIcons(bottomRow)}</div>
                <div className="bottom-row-content">{renderIcons(bottomRow, "dup-bottom-")}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
          /* ==================== DÒNG TRÊN: PHẢI → TRÁI ==================== */
          .top-row-container {
            width: 100%;
            overflow: hidden;
            position: relative;
          }

          .top-row-track {
            display: flex;
            width: fit-content;
            will-change: transform;
            animation: moveRightToLeft 60s linear infinite;
          }

          .top-row-content {
            display: flex;
            align-items: center;
          }

          @keyframes moveRightToLeft {
            0% {
              transform: translateX(0%);
            }
            100% {
              transform: translateX(-50%);
            }
          }

          /* ==================== DÒNG DƯỚI: TRÁI → PHẢI ==================== */
          .bottom-row-container {
            width: 100%;
            overflow: hidden;
            position: relative;
          }

          .bottom-row-track {
            display: flex;
            width: fit-content;
            will-change: transform;
            animation: moveLeftToRight 60s linear infinite;
          }

          .bottom-row-content {
            display: flex;
            align-items: center;
          }

          @keyframes moveLeftToRight {
            0% {
              transform: translateX(-50%);
            }
            100% {
              transform: translateX(0%);
            }
          }
        `,
        }}
      />
    </section>
  );
};

export default Partners;