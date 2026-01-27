import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface BankOffer {
  bankName: string;
  bankLogo: string;
  interestRate: string;
  promotion: string;
  promotionColor: string;
}

const bankOffers: BankOffer[] = [
  {
    bankName: 'ACB',
    bankLogo: '/images/slider/acb.jpg',
    interestRate: '6.2%',
    promotion: '5',
    promotionColor: '#3CB550',
  },
  {
    bankName: 'VIB',
    bankLogo: '/images/slider/vib.jpg',
    interestRate: '5.2%',
    promotion: '12',
    promotionColor: '#3CB550',
  },
  {
    bankName: 'Techcombank',
    bankLogo: '/images/slider/techcombank.jpg',
    interestRate: '5.5%',
    promotion: '3',
    promotionColor: '#3CB550',
  },
];

const ArrowIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M15.7888 7.99999C12.2559 7.99999 9.39811 11.1302 9.39811 15M15.7241 8.00001C12.1911 8.00001 9.33333 4.86982 9.33333 1M16 8.00001H0"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
);

export const InteractiveSlider: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className="py-12 md:py-24 bg-white" aria-labelledby="interactive-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900 mb-1 sm:mb-4 animate-fade-in" id="interactive-heading">
            {t.slider.title}
          </h2>
          <div
            className="text-base md:text-lg lg:text-xl text-gray-600 leading-relaxed sm:mt-4 max-w-2xl sm:max-w-3xl mx-auto px-2"
            style={{
              fontFamily: "'Maison Neue', 'Inter', 'Segoe UI', 'Roboto', 'Noto Sans', 'Helvetica Neue', Arial, sans-serif",
              lineHeight: "130%"
            }}
          >
            {t.slider.subtitle}
          </div>
          <div className="mt-6 sm:mt-8">
            <button className="bg-gradient-to-r from-[#3CB550] to-[#2d9a42] hover:from-[#2d9a42] hover:to-[#3CB550] text-white font-bold px-8 py-3 rounded-full text-base sm:text-lg transition-all duration-300 shadow-md hover:shadow-lg">
              {t.slider.cta}
            </button>
          </div>
        </div>

        {/* Bank Cards Container - Compact Layout */}
        <div className="flex md:grid md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 px-0 sm:px-4 md:px-8 overflow-x-auto md:overflow-visible snap-x snap-mandatory">
          {bankOffers.map((offer, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-2xl p-3 sm:p-4 border-2 border-transparent hover:border-[#3CB550] hover:shadow-md transition-all duration-300 flex-none shrink-0 min-w-[220px] sm:min-w-[280px] md:min-w-0 snap-start"
            >
              {/* Bank Logo Header */}
              <div className="mb-3 sm:mb-4">
                <div className="bg-white rounded-xl px-4 sm:px-6 py-2 sm:py-3 shadow-sm flex items-center justify-center">
                  <img 
                    src={offer.bankLogo} 
                    alt={offer.bankName}
                    className="h-6 sm:h-8 w-auto object-contain"
                  />
                </div>
              </div>

              {/* Two Column Layout: Interest Rate & Promotion */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
                {/* Interest Rate Box */}
                <div className="bg-white rounded-lg p-2.5 sm:p-3 text-center">
                  <div className="text-[10px] text-gray-500 uppercase mb-1 tracking-wide">{t.slider.interestRate}</div>
                  <div className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-0.5">{offer.interestRate}</div>
                  <div className="text-[11px] sm:text-xs text-gray-600">{t.slider.year}</div>
                </div>

                {/* Promotion Box */}
                <div className="bg-white rounded-lg p-2.5 sm:p-3 text-center">
                  <div className="text-[10px] text-gray-500 uppercase mb-1 tracking-wide">{t.slider.promotion}</div>
                  <div 
                    className="text-3xl sm:text-4xl font-semibold mb-0.5"
                    style={{ color: offer.promotionColor }}
                  >
                    {offer.promotion}
                  </div>
                  <div className="text-[11px] sm:text-xs text-gray-600">{t.slider.months}</div>
                </div>
              </div>

              {/* View Details Button - Bottom Right */}
              <div className="flex justify-end">
                <button className="py-1 px-3 sm:py-1.5 sm:px-4 border border-gray-300 rounded-full text-[11px] sm:text-xs text-gray-700 hover:bg-white transition-colors duration-200 flex items-center gap-1.5">
                  <span>{t.slider.viewDetails}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InteractiveSlider;

