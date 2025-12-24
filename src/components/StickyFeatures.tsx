import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';

interface FeatureItem {
  label: string;
  title: string;
  description: string;
  linkText: string;
  linkHref: string;
  imageSrc: string;
  imageAlt: string;
}

const features: FeatureItem[] = [
  {
    label: 'SMART INVESTMENT',
    title: 'Grow your wealth easily',
    description:
      'Launch investment campaigns in minutes and drive more revenue. Skip the learning curve with ready-made templates, guided automation and intuitive tools anyone can master.',
    linkText: 'Learn more',
    linkHref: '#',
    imageSrc: '/images/features/multichannel.webp',
    imageAlt: 'SMART INVESTMENT',
  },
  {
    label: 'ALL-IN-ONE SOLUTION',
    title: 'Built to scale with you',
    description:
      'As your business expands, invest more, automate more and engage across new channels. Manage the entire customer journey from one powerful platform—for marketing, sales, CRM and loyalty.',
    linkText: 'Sign up free',
    linkHref: '#',
    imageSrc: '/images/features/all-in-one.webp',
    imageAlt: 'ALL-IN-ONE SOLUTION',
  },
  {
    label: 'AI-FIRST PLATFORM',
    title: 'Accelerate with AI',
    description:
      'Work smarter and faster with FinHome AI. Optimize every campaign with personalized product recommendations, ideal send times, and clear insights into what drives results.',
    linkText: 'Learn more',
    linkHref: '#',
    imageSrc: '/images/features/optimize.webp',
    imageAlt: 'AI PLATFORM',
  },
];

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

export const StickyFeatures: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

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

      setActiveIndex(closestIndex);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="relative py-12 md:py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6" ref={containerRef}>
        <div className="relative">
          {/* Content Section (Left) */}
          <div className="lg:grid lg:grid-cols-2 lg:gap-12">
            {/* Text Content */}
            <div className="lg:col-span-1">
              {features.map((feature, index) => (
                <div
                  key={index}
                  ref={(el) => (itemRefs.current[index] = el)}
                  className={`py-12 md:py-16 transition-opacity duration-500 ${
                    activeIndex === index ? 'opacity-100' : 'opacity-30'
                  }`}
                  data-index={index}
                >
                  <div className="space-y-6">
                    {/* Label */}
                    <span className="inline-block text-sm font-medium tracking-wider text-[#3CB550] uppercase">
                      {feature.label}
                    </span>

                    {/* Title */}
                    <h3 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                      {feature.title}
                    </h3>

                    {/* Description */}
                    <div className="text-lg text-gray-600 leading-relaxed">
                      <p>{feature.description}</p>
                    </div>

                    {/* Link */}
                    <div className="pt-4">
                      <a
                        href={feature.linkHref}
                        className="group inline-flex items-center text-base font-medium text-[#3CB550] hover:text-[#2d9a42] transition-colors duration-300"
                        rel="noreferrer"
                      >
                        <span className="relative">
                          {feature.linkText}
                          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#3CB550] transition-all duration-300 group-hover:w-full" />
                        </span>
                        <ArrowIcon />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Sticky Images Section (Right) */}
            <div className="hidden lg:block lg:col-span-1">
              <div
                className="sticky"
                style={{
                  height: '500px',
                  top: 'calc(50vh - 250px)',
                }}
              >
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-500 ${
                      activeIndex === index ? 'opacity-100 z-10' : 'opacity-0 z-0'
                    }`}
                  >
                    <picture className="block w-full h-full">
                      <img
                        alt={feature.imageAlt}
                        className="w-full h-full object-contain rounded-2xl"
                        loading="lazy"
                        src={feature.imageSrc}
                        title={feature.title}
                      />
                    </picture>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile Images (Below content on mobile) */}
          <div className="lg:hidden space-y-8 mt-8">
            {features.map((feature, index) => (
              <div key={index} className="w-full">
                <picture className="block w-full">
                  <img
                    alt={feature.imageAlt}
                    className="w-full h-auto object-contain rounded-2xl"
                    loading="lazy"
                    src={feature.imageSrc}
                    title={feature.title}
                  />
                </picture>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StickyFeatures;

