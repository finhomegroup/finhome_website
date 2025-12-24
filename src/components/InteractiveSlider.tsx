import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SliderItem {
  title: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
}

const sliderItems: SliderItem[] = [
  {
    title: 'Đầu tư căn hộ',
    href: '#',
    imageSrc: '/images/slider/apartment-investment.webp',
    imageAlt: 'Đầu tư căn hộ',
  },
  {
    title: 'Đầu tư biệt thự',
    href: '#',
    imageSrc: '/images/slider/villa-investment.webp',
    imageAlt: 'Đầu tư biệt thự',
  },
  {
    title: 'Đầu tư shophouse',
    href: '#',
    imageSrc: '/images/slider/shophouse-investment.webp',
    imageAlt: 'Đầu tư shophouse',
  },
  {
    title: 'Đầu tư condotel',
    href: '#',
    imageSrc: '/images/slider/condotel-investment.webp',
    imageAlt: 'Đầu tư condotel',
  },
  {
    title: 'Đầu tư đất nền',
    href: '#',
    imageSrc: '/images/slider/land-investment.webp',
    imageAlt: 'Đầu tư đất nền',
  },
  {
    title: 'Đầu tư resort',
    href: '#',
    imageSrc: '/images/slider/resort-investment.webp',
    imageAlt: 'Đầu tư resort',
  },
  {
    title: 'Đầu tư officetel',
    href: '#',
    imageSrc: '/images/slider/officetel-investment.webp',
    imageAlt: 'Đầu tư officetel',
  },
  {
    title: 'Đầu tư căn hộ dịch vụ',
    href: '#',
    imageSrc: '/images/slider/service-apartment.webp',
    imageAlt: 'Đầu tư căn hộ dịch vụ',
  },
  {
    title: 'Đầu tư nhà phố',
    href: '#',
    imageSrc: '/images/slider/townhouse-investment.webp',
    imageAlt: 'Đầu tư nhà phố',
  },
  {
    title: 'Đầu tư cao ốc văn phòng',
    href: '#',
    imageSrc: '/images/slider/office-building.webp',
    imageAlt: 'Đầu tư cao ốc văn phòng',
  },
  {
    title: 'Đầu tư trung tâm thương mại',
    href: '#',
    imageSrc: '/images/slider/shopping-mall.webp',
    imageAlt: 'Đầu tư trung tâm thương mại',
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
  const sliderRef = useRef<HTMLUListElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollButtons = () => {
    if (!sliderRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScrollButtons();
    const slider = sliderRef.current;
    if (!slider) return;

    slider.addEventListener('scroll', checkScrollButtons, { passive: true });
    window.addEventListener('resize', checkScrollButtons);

    return () => {
      slider.removeEventListener('scroll', checkScrollButtons);
      window.removeEventListener('resize', checkScrollButtons);
    };
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (!sliderRef.current) return;

    const scrollAmount = sliderRef.current.clientWidth * 0.8;
    const newScrollLeft =
      direction === 'left'
        ? sliderRef.current.scrollLeft - scrollAmount
        : sliderRef.current.scrollLeft + scrollAmount;

    sliderRef.current.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth',
    });
  };

  return (
    <section className="py-12 md:py-24 bg-white" aria-labelledby="interactive-heading">
      <div className="container mx-auto px-4 md:px-6">
        {/* Heading */}
        <div className="mb-8 md:mb-12 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900" id="interactive-heading">
            Invest your way
          </h2>
        </div>

        {/* Slider Container */}
        <div className="relative" aria-roledescription="carousel" aria-label="Interactive Feature slider">
          {/* Slider */}
          <ul
            ref={sliderRef}
            id="slider-container"
            aria-describedby="slider-instructions"
            className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-none scroll-smooth pb-4"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {sliderItems.map((item, index) => (
              <li key={index} className="flex-shrink-0 w-[280px] md:w-[320px]">
                <div className="relative overflow-hidden rounded-2xl group">
                  {/* Border overlay */}
                  <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-[#2d9a42] pointer-events-none z-10 transition-colors duration-150" />
                  
                  {/* Image Container */}
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <img
                      alt={item.imageAlt}
                      src={item.imageSrc}
                      className="w-full h-full object-scale-down"
                      loading="lazy"
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* Left Button */}
          <button
            onClick={() => scroll('left')}
            className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-lg border border-gray-200 transition-all duration-300 ${
              canScrollLeft ? 'opacity-100 hover:scale-110' : 'opacity-0 pointer-events-none'
            }`}
            aria-label="Scroll left"
            aria-controls="slider-container"
            data-testid="interactive-icon-slider-button-left"
          >
            <ChevronLeft className="w-5 h-5 text-gray-900" />
          </button>

          {/* Right Button */}
          <button
            onClick={() => scroll('right')}
            className={`absolute right-4 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-lg border border-gray-200 transition-all duration-300 ${
              canScrollRight ? 'opacity-100 hover:scale-110' : 'opacity-0 pointer-events-none'
            }`}
            aria-label="Scroll right"
            aria-controls="slider-container"
            data-testid="interactive-icon-slider-button-right"
          >
            <ChevronRight className="w-5 h-5 text-gray-900" />
          </button>

          {/* Screen reader instructions */}
          <div id="slider-instructions" className="sr-only">
            Use arrow keys to navigate between slider cards
          </div>
          <div className="sr-only" aria-live="polite"></div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveSlider;

