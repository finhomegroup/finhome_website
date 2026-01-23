import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import DotHalftone, { FillDefinition } from '@/components/DotHalftone';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';

interface FeatureItem {
  label: string;
  title: string;
  description: string;
  sub_title?: string;
  sub_description?: string;
  linkText: string;
  linkHref: string;
  imageSrc: string;
  imageAlt: string;
}

const ArrowIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    className="ml-2 transition-transform duration-300 group-hover:translate-x-1"
    aria-hidden="true"
  >
    <path
      d="M15.7888 7.99999C12.2559 7.99999 9.39811 11.1302 9.39811 15M15.7241 8.00001C12.1911 8.00001 9.33333 4.86982 9.33333 1M16 8.00001H0"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
);

const CornerDotSVG = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="2" cy="2" r="2" fill="#3CB550" />
    <circle cx="10" cy="2" r="2" fill="#3CB550" />
    <circle cx="10" cy="10" r="2" fill="#3CB550" />
  </svg>
);

export const StickyFeatures: React.FC = () => {
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const [activeIndex, setActiveIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isTransitioningRef = useRef(false);
  const [nextVisualIndex, setNextVisualIndex] = useState<number | undefined>(undefined);

  // Generate features from translations
  const features: FeatureItem[] = [
    {
      label: t.features.compass.label,
      title: t.features.compass.title,
      description: t.features.compass.description,
      linkText: t.features.compass.linkText,
      sub_title: t.features.compass.subTitle,
      sub_description: t.features.compass.subDescription,
      linkHref: '#',
      imageSrc: '/images/features/Compass.png',
      imageAlt: t.features.compass.label,
    },
    {
      label: t.features.lighthouse.label,
      title: t.features.lighthouse.title,
      description: t.features.lighthouse.description,
      linkText: t.features.lighthouse.linkText,
      sub_title: t.features.lighthouse.subTitle,
      sub_description: t.features.lighthouse.subDescription,
      linkHref: '#',
      imageSrc: '/images/features/Lighthouse.png',
      imageAlt: t.features.lighthouse.label,
    },
    {
      label: t.features.harbor.label,
      title: t.features.harbor.title,
      description: t.features.harbor.description,
      linkText: t.features.harbor.linkText,
      sub_title: t.features.harbor.subTitle,
      sub_description: t.features.harbor.subDescription,
      linkHref: '#',
      imageSrc: '/images/features/Harbour.png',
      imageAlt: t.features.harbor.label,
    },
  ];

  // Định nghĩa màu gradient cho từng feature
  const fillsByIndex: FillDefinition[] = [
    {
      type: 'radial',
      colorA: '#a9f153',
      colorB: 'rgba(169, 241, 83, 0.1)',
      center: { x: 0.5, y: 0.5 },
      radius: 0.6,
    },
    {
      type: 'radial',
      colorA: '#a9f153',
      colorB: 'rgba(169, 241, 83, 0.1)',
      center: { x: 0.5, y: 0.5 },
      radius: 0.6,
    },
    {
      type: 'radial',
      colorA: '#a9f153',
      colorB: 'rgba(169, 241, 83, 0.1)',
      center: { x: 0.5, y: 0.5 },
      radius: 0.6,
    },
  ];

  const handleHalftoneTransitionComplete = () => {
    if (nextVisualIndex !== undefined) {
      setPrevIndex(nextVisualIndex);
      setNextVisualIndex(undefined);
    }
    isTransitioningRef.current = false;
  };

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const containerTop = containerRef.current.getBoundingClientRect().top;
      const viewportCenter = window.innerHeight / 2;

      // Find which item is closest to the center
      let closestIndex = 0;
      let closestDistance = Infinity;

      itemRefs.current.forEach((item, index) => {
        if (!item) return;
        const itemRect = item.getBoundingClientRect();
        const itemCenter = itemRect.top + itemRect.height / 2;
        const distance = Math.abs(itemCenter - viewportCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      if (closestIndex !== activeIndex) {
        setActiveIndex(closestIndex);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeIndex]);

  // Handle image transition when activeIndex changes
  useEffect(() => {
    if (activeIndex === prevIndex) return;

    const schedule = () => {
      if (!isTransitioningRef.current && nextVisualIndex === undefined) {
        setNextVisualIndex(activeIndex);
        isTransitioningRef.current = true;
      }
    };

    Promise.resolve().then(schedule);
  }, [activeIndex, prevIndex, nextVisualIndex]);

  return (
    <section className="relative py-8 md:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={containerRef}>
        <div className="relative">
          <div className="px-0 md:px-6">
            {/* Content Section (Left) */}
            <div className="grid grid-cols-12 gap-5 md:gap-10 lg:gap-5">
              {/* Text Content */}
              <div className="col-span-12 md:col-span-6 lg:col-span-5 lg:col-start-2">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    ref={(el) => (itemRefs.current[index] = el)}
                    className={`py-8 md:py-16 transition-opacity duration-500 ${activeIndex === index ? 'opacity-100' : 'opacity-30'
                      }`}
                    data-index={index}
                  >
                    <div >
                      {/* Label */}
                      <span className="inline-block text-sm font-medium tracking-wider text-[#3CB550] uppercase">
                        {feature.label}
                      </span>

                      {/* Title */}
                      <h3 className="text-3xl mb-4 md:text-4xl font-bold text-gray-900 mt-2 leading-tight">
                        {feature.title}
                      </h3>

                      {/* Description */}
                      <div className="text-base text-gray-700 leading-relaxed">
                        <p>{feature.description}</p>
                      </div>

                      {feature.sub_title && (
                        <div className="mb-4">
                          <button className="inline-flex items-center px-5 py-2 rounded-full border border-gray-300 bg-white text-xs sm:text-sm text-gray-800 shadow-sm hover:border-[#3CB550] transition-colors duration-200">
                            {feature.sub_title}
                          </button>
                        </div>
                      )}

                      {feature.sub_description && (
                        <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-4">
                          {feature.sub_description}
                        </p>
                      )}

                      {/* Link */}
                      <div className="pt-4">
                        <a
                          href={feature.linkHref}
                          className="inline-flex items-center px-5 py-2 rounded-full bg-[#3CB550] hover:bg-[#2d9a42] text-white text-sm sm:text-base font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                          rel="noreferrer"
                        >
                          <span>{feature.linkText}</span>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Sticky Images Section (Right) - With DotHalftone */}
              <div className="hidden lg:block col-span-12 md:col-span-6 lg:col-span-6 md:col-start-7 lg:col-start-7">
                <div
                  className="sticky flex items-center justify-center"
                  style={{
                    height: '600px',
                    top: 'calc(50vh - 300px)',
                  }}
                >
                  <div className="relative w-full max-w-[500px] h-full mx-auto">
                    {/* Corner Dots - Outer Frame */}
                    <div className="absolute inset-0 pointer-events-none z-10 transition-all duration-1000">
                      <div className="absolute -top-6 -left-6 w-3 h-3 rotate-90">
                        <CornerDotSVG />
                      </div>
                      <div className="absolute -top-6 -right-6 w-3 h-3 rotate-180">
                        <CornerDotSVG />
                      </div>
                      <div className="absolute -bottom-6 -left-6 w-3 h-3">
                        <CornerDotSVG />
                      </div>
                      <div className="absolute -bottom-6 -right-6 w-3 h-3 -rotate-90">
                        <CornerDotSVG />
                      </div>
                    </div>

                    {/* Dot Grid Background */}
                    <div
                      className="absolute -inset-48 z-0"
                      style={{
                        backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(209 213 219) 1px, transparent 1px)',
                        backgroundSize: '8px 8px',
                        backgroundRepeat: 'repeat',
                        backgroundPosition: '3px 3px',
                        mask: 'radial-gradient(ellipse at center, black 0%, black 25%, rgba(0,0,0,0.8) 35%, rgba(0,0,0,0.4) 50%, transparent 70%)',
                        WebkitMask: 'radial-gradient(ellipse at center, black 0%, black 25%, rgba(0,0,0,0.8) 35%, rgba(0,0,0,0.4) 50%, transparent 70%)',
                      }}
                    />

                    {/* DotHalftone Effect - Centered between corner dots */}
                    <div className="absolute inset-0 flex items-center justify-center p-6">
                      {!isMobile && (
                        <DotHalftone
                          src={features[prevIndex].imageSrc}
                          nextSrc={nextVisualIndex !== undefined ? features[nextVisualIndex].imageSrc : undefined}
                          columns={56}
                          rows={75}
                          cellSize={8}
                          transitionDuration={750}
                          rippleEffect
                          rippleIntensity={0.12}
                          rippleFrequency={12.0}
                          objectFit="contain"
                          fill={fillsByIndex[prevIndex]}
                          nextFill={nextVisualIndex !== undefined ? fillsByIndex[nextVisualIndex] : undefined}
                          fillTransitionDuration={500}
                          onTransitionComplete={handleHalftoneTransitionComplete}
                          className="w-full h-full"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StickyFeatures;

