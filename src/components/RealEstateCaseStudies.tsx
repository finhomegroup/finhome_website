import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { SceneConfig } from './real-estate-cards/Scene';
import { AnimatedScene, SceneLayout } from './real-estate-cards/AnimatedScene';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import DotHalftone from './DotHalftone';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';

interface Project {
  name: string;
  nameVi?: string;
}

interface CaseStudyData {
  slug: string;
  logo: string;
  title: string;
  titleVi?: string;
  description: string;
  projects: Project[];
  quote: string;
  quoteVi?: string;
  author: string;
  authorVi?: string;
  refiScore?: number;
  projectDetail?: string;
  activeBgColor: string;
  activeIconColor: string;
  dotColor: string;
}

const caseStudies: CaseStudyData[] = [
  {
    slug: 'vinhomes',
    logo: 'Vinhomes',
    title: 'Vinhomes uses FinHome to manage premium real estate portfolio',
    titleVi: 'FinHome phân tích các dự án Vinhomes bằng chuẩn dữ liệu tài chính',
    description:
      'Vinhomes integrates FinHome platform to provide smart real estate investment solutions for customers. With FinHome, Vinhomes maintains full control of customer experience for apartment, villa, and shophouse projects.',
    projects: [
      { name: 'Premium Apartments', nameVi: 'Căn hộ cao cấp' },
      { name: 'Villas', nameVi: 'Biệt thự' },
      { name: 'Shophouses', nameVi: 'Nhà phố thương mại' }
    ],
    quote: 'FinHome helps us completely digitize the real estate investment process.',
    quoteVi: 'Dưới góc nhìn REFI, các dự án Vinhomes được chúng tôi đánh giá không chỉ bằng giá bán, mà bằng khả năng chi trả, rủi ro và hiệu quả tài chính dài hạn, hỗ trợ người dùng đưa ra quyết định phù hợp và bền vững.',
    author: 'John Nguyen, CEO, Vinhomes',
    authorVi: 'Thai Vin - Founder & REFI Architect, FinHome',
    refiScore: 8.9,
    projectDetail: 'Premium Apartments · Vinhomes Grand Park',
    activeBgColor: '#3CB550',
    activeIconColor: '#ffffff',
    dotColor: '#5CC76B',
  },
  {
    slug: 'masteri',
    logo: 'Masteri',
    title: 'Masteri builds modern real estate investment platform with FinHome',
    titleVi: 'Masteri xây dựng nền tảng đầu tư bất động sản hiện đại với FinHome',
    description:
      'Masteri partners with FinHome to provide investment and payment products for real estate projects. By building on FinHome\'s API-first infrastructure, Masteri helps investors scale with confidence.',
    projects: [
      { name: 'Premium Apartments', nameVi: 'Căn hộ cao cấp' },
      { name: 'Officetels', nameVi: 'Officetel' },
      { name: 'Shophouses', nameVi: 'Nhà phố thương mại' },
      { name: 'Villas', nameVi: 'Biệt thự' },
    ],
    quote: 'FinHome\'s platform helps us move as fast as the market evolves.',
    quoteVi: 'Nền tảng FinHome giúp chúng tôi di chuyển nhanh như thị trường phát triển.',
    author: 'Sarah Tran, Co-founder & CEO, Masteri',
    authorVi: 'Sarah Tran, Đồng sáng lập & CEO, Masteri',
    activeBgColor: '#256b2f',
    activeIconColor: '#ffffff',
    dotColor: '#3d8f4a',
  },
  {
    slug: 'sungroup',
    logo: 'Sun Group',
    title: 'Sun Group uses FinHome to manage resort real estate portfolio',
    titleVi: 'Sun Group sử dụng FinHome để quản lý danh mục bất động sản nghỉ dưỡng',
    description:
      'Sun Group partners with FinHome to provide resort real estate investment solutions at Vietnam\'s top destinations. With FinHome, Sun Group maintains full control of customer experience and provides a unified platform for global investment.',
    quote: 'It\'s critical that partners move at our pace and FinHome delivers.',
    quoteVi: 'Điều quan trọng là các đối tác di chuyển theo tốc độ của chúng tôi và FinHome đáp ứng được điều đó.',
    author: 'Michael Le, CEO, Sun Group',
    authorVi: 'Michael Le, CEO, Sun Group',
    activeBgColor: '#FFA500',
    activeIconColor: '#1f2937',
    dotColor: '#FFB733',
    projects: [
      { name: 'Resorts & Villas', nameVi: 'Khu nghỉ dưỡng & Biệt thự' },
      { name: 'Condotels', nameVi: 'Condotel' }
    ],
  },
  {
    slug: 'novaland',
    logo: 'Novaland',
    title: 'Novaland partners with FinHome to scale real estate projects',
    titleVi: 'Novaland hợp tác với FinHome để mở rộng các dự án bất động sản',
    description:
      'Novaland partners with FinHome to develop diverse real estate projects, helping customers with limited savings confidently navigate their daily financial lives. By leveraging FinHome\'s modern platform, Novaland can easily expand access to flexible investment solutions nationwide.',
    projects: [
      { name: 'Apartments', nameVi: 'Căn hộ' },
      { name: 'Land Plots', nameVi: 'Đất nền' }
    ],
    quote: 'FinHome\'s modern platform empowers Novaland to scale and better serve consumers.',
    quoteVi: 'Nền tảng hiện đại của FinHome giúp Novaland mở rộng quy mô và phục vụ người tiêu dùng tốt hơn.',
    author: 'David Pham, CEO, Novaland',
    authorVi: 'David Pham, CEO, Novaland',
    activeBgColor: '#092951',
    activeIconColor: '#ffffff',
    dotColor: '#6A7E96',
  },
];

export const RealEstateCaseStudies: React.FC = () => {
  const { t, language } = useLanguage();
  const isMobile = useIsMobile();
  const [activeIndex, setActiveIndex] = useState(0);
  const [showFade, setShowFade] = useState(false);
  const [isAtEnd, setIsAtEnd] = useState(false);
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [displayIndex, setDisplayIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [isExitingContent, setIsExitingContent] = useState(false);
  const [fillTick, setFillTick] = useState(0);
  const [colorIndex, setColorIndex] = useState(0);
  const [nextVisualIndex, setNextVisualIndex] = useState<number | undefined>(undefined);
  const isHTTransitioningRef = useRef(false);
  const transitionQueueRef = useRef<number[]>([]);
  const tabsRef = useRef<HTMLDivElement>(null);

  const csActive = caseStudies[activeIndex];
  const csCurrent = caseStudies[displayIndex];
  const csColor = caseStudies[colorIndex];
  const csPrev = prevIndex !== null ? caseStudies[prevIndex] : null;

  // Helper functions to get localized text
  const getTitle = (cs: CaseStudyData) => (language === 'vi' && cs.titleVi ? cs.titleVi : cs.title);
  const getQuote = (cs: CaseStudyData) => (language === 'vi' && cs.quoteVi ? cs.quoteVi : cs.quote);
  const getAuthor = (cs: CaseStudyData) => (language === 'vi' && cs.authorVi ? cs.authorVi : cs.author);
  const getProjectName = (project: Project) => (language === 'vi' && project.nameVi ? project.nameVi : project.name);

  const currentImageSrc = `/images/case-studies/${caseStudies[displayIndex].slug}.jpg`;
  const nextImageSrc =
    nextVisualIndex !== undefined
      ? `/images/case-studies/${caseStudies[nextVisualIndex].slug}.jpg`
      : undefined;

  const currentFill = { type: 'solid' as const, colorA: csColor.dotColor };
  const nextFill =
    activeIndex !== colorIndex ? ({ type: 'solid' as const, colorA: csActive.dotColor } as const) : undefined;

  const getSceneDefinition = (
    index: number,
    cs: CaseStudyData,
    activeBgColor: string
  ): { config: SceneConfig; layout: SceneLayout } => {
    const config: SceneConfig = {
      cards: [
        {
          type: 'property',
          props: {
            price: '$2,500,000',
            currency: 'USD',
            propertyName: cs.projects[0]?.name || 'Property',
            propertyId: '001',
            activeBgColor,
          },
        },
        {
          type: 'transfer',
          props: {
            amount: '500,000',
            fromPropertyName: 'Investor Account',
            fromPropertyId: '101',
            toPropertyName: cs.projects[0]?.name || 'Property',
            toPropertyId: '001',
            activeBgColor,
          },
        },
        {
          type: 'intl',
          props: {
            fromAmount: '500,000',
            toAmount: '11,500,000,000',
            fromCurrency: 'USD',
            toCurrency: 'VND',
            fromCurrencySymbol: '$',
            toCurrencySymbol: '₫',
            fromPropertyName: 'International Account',
            fromPropertyId: '201',
            toPropertyName: 'Vietnam Property',
            toPropertyId: '002',
            activeBgColor,
          },
        },
      ],
    };

    const layout: SceneLayout = [
      {
        translateX: '-42%',
        translateY: '-50%',
        startTranslateX: '-42%',
        startTranslateY: '-50%',
        delay: 0,
        zIndex: 1,
        width: '360px',
      },
      {
        translateX: '-55%',
        translateY: '10%',
        startTranslateX: '-55%',
        startTranslateY: '-40%',
        delay: 0.05,
        zIndex: 0,
        width: '360px',
      },
      {
        translateX: '-55%',
        translateY: '-100%',
        startTranslateX: '-55%',
        startTranslateY: '-100%',
        delay: 0.1,
        zIndex: 0,
        width: '360px',
      },
    ];

    return { config, layout };
  };

  const handleTabChange = (newIndex: number) => {
    if (newIndex === activeIndex) return;

    setPrevIndex(activeIndex);
    setIsExiting(true);
    setIsExitingContent(false);
    setActiveIndex(newIndex);
    setFillTick((t) => t + 1);
    setIsAnimating(true);

    if (!isHTTransitioningRef.current && nextVisualIndex === undefined) {
      setNextVisualIndex(newIndex);
      isHTTransitioningRef.current = true;
    } else {
      const q = transitionQueueRef.current;
      q.length = 0;
      q.push(newIndex);
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsAnimating(false);
        setIsExitingContent(true);
      });
    });

    setTimeout(() => {
      setIsExiting(false);
      setIsExitingContent(false);
      setPrevIndex(null);
    }, 380);
  };

  const handleHalftoneTransitionComplete = () => {
    if (nextVisualIndex !== undefined) {
      setDisplayIndex(nextVisualIndex);
      setNextVisualIndex(undefined);
    }
    isHTTransitioningRef.current = false;
    const queue = transitionQueueRef.current;
    while (queue.length > 0 && queue[0] === displayIndex) {
      queue.shift();
    }
    if (queue.length > 0) {
      const nextTarget = queue.shift()!;
      setTimeout(() => {
        setNextVisualIndex(nextTarget);
        isHTTransitioningRef.current = true;
      }, 0);
    }
  };

  useEffect(() => {
    if (activeIndex !== colorIndex) {
      const timer = setTimeout(() => {
        setColorIndex(activeIndex);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [fillTick, activeIndex, colorIndex]);

  useEffect(() => {
    if (activeIndex === displayIndex) return;
    if (!isHTTransitioningRef.current && nextVisualIndex === undefined) {
      setNextVisualIndex(activeIndex);
      isHTTransitioningRef.current = true;
    } else {
      transitionQueueRef.current.push(activeIndex);
    }
  }, [activeIndex, displayIndex, nextVisualIndex]);

  const handleScroll = useCallback(() => {
    if (!tabsRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = tabsRef.current;
    const hasOverflow = scrollWidth > clientWidth + 1;
    const scrollThreshold = 2;
    const atEnd = scrollLeft + clientWidth >= scrollWidth - scrollThreshold;
    const atStart = scrollLeft <= scrollThreshold;

    setShowFade(hasOverflow);
    setIsAtEnd(atEnd);
    setIsAtStart(atStart);
  }, []);

  const scrollTabsToEnd = useCallback(() => {
    const el = tabsRef.current;
    if (!el) return;
    const target = Math.max(0, el.scrollWidth - el.clientWidth);
    el.scrollTo({ left: target, behavior: 'smooth' });
  }, []);

  const scrollTabsToStart = useCallback(() => {
    const el = tabsRef.current;
    if (!el) return;
    el.scrollTo({ left: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const tabsElement = tabsRef.current;
    if (!tabsElement) return;

    const checkScroll = () => {
      if (tabsElement.offsetWidth > 0 && tabsElement.offsetHeight > 0) {
        handleScroll();
      }
    };

    requestAnimationFrame(checkScroll);
    const timeoutIds = [
      setTimeout(checkScroll, 50),
      setTimeout(checkScroll, 120),
      setTimeout(checkScroll, 300),
    ];

    tabsElement.addEventListener('scroll', handleScroll, { passive: true });
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleScroll, { passive: true });
    }

    return () => {
      timeoutIds.forEach(clearTimeout);
      tabsElement.removeEventListener('scroll', handleScroll);
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleScroll);
      }
    };
  }, [handleScroll]);

  return (
    <section className="py-0 md:py-0">
      <div className="max-w-7xl mx-auto  sm:px-6 lg:px-8  md:pt-36">
        <div className="overflow-hidden z-[6] rounded-none md:rounded-xl md:bg-[#fbfbfc] md:shadow-[0_0_20px_0_#fff_inset,0_1px_2px_0_rgba(0,0,0,0.1),0_0_0_1px_rgba(255,255,255,0.5)_inset] p-4 md:p-0 min-h-[720px] flex flex-col transition-[border-radius] duration-500">
          {/* Tabs */}
          <div className="relative flex-shrink-0">
            <div
              ref={tabsRef}
              className="relative flex w-full gap-2 md:gap-4 p-0 md:px-6  justify-center overflow-x-auto scrollbar-none z-[1]"
              style={{
                mask: showFade && !isAtEnd ? 'linear-gradient(to right, black calc(100% - 24px), transparent)' : 'none',
                WebkitMask: showFade && !isAtEnd ? 'linear-gradient(to right, black calc(100% - 24px), transparent)' : 'none',
              }}
            >
              {caseStudies.map((c, i) => (
                <button
                  key={i}
                  className={`border-none flex flex-shrink-0 flex-grow-0 md:flex-grow items-center justify-center rounded-full px-2.5 sm:px-4 md:px-8 py-1.5 md:py-3 text-xs sm:text-sm md:text-lg text-gray-800 cursor-pointer transition-all duration-200 ${i === activeIndex
                    ? 'shadow-[0_0_0_1px_rgba(0,0,0,0.05)_inset,0_-1px_0_rgba(0,0,0,0.1)_inset,0px_-48px_24px_-24px_rgba(0,0,0,0.02)_inset,0px_4px_8px_0px_rgba(0,0,0,0.05),0px_2px_4px_0px_rgba(0,0,0,0.05),0px_1px_1px_0px_rgba(0,0,0,0.05)]'
                    : 'hover:bg-gray-800/5'
                    }`}
                  style={{
                    backgroundColor: i === activeIndex ? c.activeBgColor : 'transparent',
                    color: i === activeIndex ? c.activeIconColor : 'inherit',
                  }}
                  onClick={() => handleTabChange(i)}
                  aria-label={c.title}
                  title={c.title}
                >
                  <span className="font-semibold whitespace-nowrap">{c.logo}</span>
                </button>
              ))}
            </div>

            {/* Scroll Buttons */}
            {showFade && !isAtEnd && (
              <button
                className="absolute top-1 right-4 hidden md:flex items-center justify-center w-9 h-9 rounded-full border-none bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.05),0_2px_8px_rgba(0,0,0,0.15)] cursor-pointer z-[2] transition-all duration-200"
                onClick={scrollTabsToEnd}
                aria-label="Scroll tabs right"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
            {showFade && !isAtStart && (
              <button
                className="absolute top-1 left-4 hidden md:flex items-center justify-center w-9 h-9 rounded-full border-none bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.05),0_2px_8px_rgba(0,0,0,0.15)] cursor-pointer z-[2] transition-all duration-200"
                onClick={scrollTabsToStart}
                aria-label="Scroll tabs left"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Content */}
          <div className="px-0 md:px-6 pb-0 md:pb-6 flex-1 flex flex-col min-h-0 relative">
            <div className="grid grid-cols-12 gap-3 sm:gap-5 md:gap-10 lg:gap-5 h-full flex-1">
              {/* Text Content */}
              <div className="col-span-12 md:col-span-6 lg:col-span-5 lg:col-start-2 flex flex-col min-h-0 flex-1 relative">
                {/* Mobile Layout */}
                <div className="md:hidden space-y-6 py-6 px-4">
                  {/* DotHalftone and AnimatedScene for Mobile */}
                  <div className="relative w-full h-[300px] rounded-xl overflow-hidden">
                    {/* Mobile-only simplified background */}
                    <div
                      className="absolute inset-0 z-0 overflow-hidden rounded-xl"
                      style={{
                        background: `radial-gradient(circle at center, ${csColor.dotColor}15 0%, transparent 70%)`,
                      }}
                    />
                    {/* DotHalftone Background for Mobile */}
                    <div
                      className="absolute z-0 items-center justify-center inset-0 overflow-hidden"
                      style={{
                        mask: 'radial-gradient(circle, black 30%, transparent 70%)',
                        WebkitMask: 'radial-gradient(circle, black 30%, transparent 70%)',
                      }}
                    >
                      {/* Gradient Background Layer */}
                      <div
                        className="absolute inset-0 transition-colors duration-500"
                        style={{
                          background: `radial-gradient(circle at center, ${csColor.dotColor}40 0%, ${csColor.dotColor}20 30%, ${csColor.dotColor}10 50%, transparent 70%)`,
                        }}
                      />
                      {/* Dot Pattern Overlay */}
                      <div
                        className="absolute inset-0 opacity-40 transition-colors duration-500"
                        style={{
                          backgroundColor: csColor.dotColor,
                          maskImage: 'radial-gradient(circle at 1px 1px, #000 1px, transparent 1px)',
                          maskSize: '8px 8px',
                          maskPosition: 'center',
                          maskRepeat: 'repeat',
                          WebkitMaskImage: 'radial-gradient(circle at 1px 1px, #000 1px, transparent 1px)',
                          WebkitMaskSize: '8px 8px',
                          WebkitMaskPosition: 'center',
                          WebkitMaskRepeat: 'repeat',
                        }}
                      />
                      {!isMobile && (
                        <DotHalftone
                          src={currentImageSrc}
                          nextSrc={nextVisualIndex !== undefined ? nextImageSrc : undefined}
                          rows={100}
                          columns={100}
                          cellSize={8}
                          transitionDuration={750}
                          rippleEffect
                          rippleIntensity={0.12}
                          rippleFrequency={12.0}
                          objectFit="contain"
                          fill={currentFill}
                          nextFill={nextFill}
                          fillTransitionDuration={500}
                          fillTrigger={fillTick}
                          style={{ pointerEvents: 'none' }}
                          className="logo-dots"
                          onTransitionComplete={handleHalftoneTransitionComplete}
                        />
                      )}
                    </div>
                    {/* Cards Container */}
                    <div className="relative z-10 h-full flex flex-col items-center justify-center">
                      <div className="scale-[0.7] sm:scale-[0.85] origin-center">
                        {prevIndex !== null && isExiting && csPrev ? (
                          <AnimatedScene
                            key={`scene-exit-${prevIndex}-${activeIndex}`}
                            {...getSceneDefinition(prevIndex, csPrev, csPrev.activeBgColor)}
                            mode="exit"
                            play
                          />
                        ) : (
                          <AnimatedScene
                            key={`scene-enter-${activeIndex}`}
                            {...getSceneDefinition(activeIndex, caseStudies[activeIndex], csActive.activeBgColor)}
                            mode="enter"
                            play
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Title - Mobile */}
                  <h3 className="text-2xl font-semibold text-gray-900 leading-tight">
                    {getTitle(csActive)}
                  </h3>

                  {/* Project Buttons - Mobile */}
                  {csActive.projects && (
                    <div className="flex flex-wrap gap-3">
                      {csActive.projects.map((project, idx) => (
                        <button
                          key={idx}
                          className={`px-4 py-2 border border-gray-300 rounded-full text-sm font-medium transition-colors ${idx === 0
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                          {getProjectName(project)}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Quote - Mobile */}
                  <div className="relative">
                    <div className="text-6xl font-bold text-gray-300 leading-none mb-2">"</div>
                    <p
                      className="text-[20px] leading-[130%] font-manue text-gray-600 -mt-4 "
                      style={{
                        fontFamily: "'Maison Neue', 'Inter', 'Segoe UI', 'Roboto', 'Noto Sans', 'Helvetica Neue', Arial, sans-serif",
                        fontSize: "20px",
                        lineHeight: "130%"
                      }}
                    >
                      {getQuote(csActive)}
                    </p>
                    <p className="text-sm text-gray-500 mt-4">
                      {getAuthor(csActive)}
                    </p>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden md:block">
                  {/* Previous Content (Exiting) */}
                  {prevIndex !== null && csPrev && (
                    <div
                      className={`relative md:absolute md:inset-0 py-10 sm:py-14 md:py-[72px] transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${isExitingContent ? 'opacity-0 -translate-x-[100px]' : 'opacity-100 translate-x-0'
                        }`}
                    >
                      <div className="flex flex-col gap-12 flex-1 min-h-0 h-full">
                        <div className="flex-auto">
                          <h3 className="text-[28px] font-medium text-gray-800 tracking-tight max-w-[425px]">
                            {getTitle(csPrev)}
                          </h3>
                          {csPrev.projects && (
                            <div className="flex flex-wrap gap-2 mt-5">
                              {csPrev.projects.map((project, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-2 px-2 py-1 bg-white/75 shadow-[0_1px_2px_0_rgba(0,0,0,0.1),0_0_0_1px_#fff_inset] rounded-full text-sm font-medium text-gray-800"
                                >
                                  {getProjectName(project)}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div>
                          <blockquote className="before:content-['\201C'] before:block before:text-5xl before:font-bold before:leading-[48px] before:text-gray-800/30 before:w-6 before:h-[18px] before:mb-6">
                            <p className="text-xl leading-[26px] p-0">{getQuote(csPrev)}</p>
                            <div className="flex gap-2 items-center mt-6">
                              <p className="text-base text-gray-800 opacity-60">{getAuthor(csPrev)}</p>
                            </div>
                          </blockquote>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Current Content (Entering) */}
                  <div
                    className={`relative md:absolute md:inset-0 py-10 sm:py-14 md:py-[72px] transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${isAnimating ? 'opacity-0 translate-x-[100px]' : 'opacity-100 translate-x-0'
                      }`}
                  >
                    <div className="flex flex-col gap-12 flex-1 min-h-0 h-full">
                      <div className="flex-auto">
                        <h3 className="text-[28px] font-medium text-gray-800 tracking-tight max-w-[425px]">
                          {getTitle(csActive)}
                        </h3>
                        {csActive.projects && (
                          <div className="flex flex-wrap gap-2 mt-5">
                            {csActive.projects.map((project, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-2 px-2 py-1 bg-white/75 shadow-[0_1px_2px_0_rgba(0,0,0,0.1),0_0_0_1px_#fff_inset] rounded-full text-sm font-medium text-gray-800"
                              >
                                {getProjectName(project)}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div>
                        <blockquote className="before:content-['\201C'] before:block before:text-5xl before:font-bold before:leading-[48px] before:text-gray-800/30 before:w-6 before:h-[18px] before:mb-6">
                          <p className="text-xl leading-[26px] p-0">{getQuote(csActive)}</p>
                          <div className="flex gap-2 items-center mt-6">
                            <p className="text-base text-gray-800 opacity-60">{getAuthor(csActive)}</p>
                          </div>
                        </blockquote>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Visual Content - Desktop only */}
              <div className="hidden md:block col-span-12 md:col-span-6 lg:col-span-4 md:col-start-7 lg:col-start-8 relative mt-0 md:mt-0">
                {/* DotHalftone Background - Hidden on mobile, visible on tablet+ */}
                <div
                  className="absolute z-0 items-center justify-center md:inset-[-96px_0_-24px_0] md:pt-24 md:w-[1200px] md:h-auto md:-ml-[50%] lg:-ml-[100%] overflow-hidden"
                  style={{
                    mask: 'radial-gradient(circle, black 30%, transparent 70%)',
                    WebkitMask: 'radial-gradient(circle, black 30%, transparent 70%)',
                  }}
                >
                  {/* Gradient Background Layer */}
                  <div
                    className="absolute inset-0 transition-colors duration-500"
                    style={{
                      background: `radial-gradient(circle at center, ${csColor.dotColor}40 0%, ${csColor.dotColor}20 30%, ${csColor.dotColor}10 50%, transparent 70%)`,
                    }}
                  />

                  {/* Dot Pattern Overlay */}
                  <div
                    className="absolute inset-0 opacity-40 transition-colors duration-500"
                    style={{
                      backgroundColor: csColor.dotColor,
                      maskImage: 'radial-gradient(circle at 1px 1px, #000 1px, transparent 1px)',
                      maskSize: '8px 8px',
                      maskPosition: 'center',
                      maskRepeat: 'repeat',
                      WebkitMaskImage: 'radial-gradient(circle at 1px 1px, #000 1px, transparent 1px)',
                      WebkitMaskSize: '8px 8px',
                      WebkitMaskPosition: 'center',
                      WebkitMaskRepeat: 'repeat',
                    }}
                  />

                  <DotHalftone
                    src={currentImageSrc}
                    nextSrc={nextVisualIndex !== undefined ? nextImageSrc : undefined}
                    rows={100}
                    columns={100}
                    cellSize={8}
                    transitionDuration={750}
                    rippleEffect
                    rippleIntensity={0.12}
                    rippleFrequency={12.0}
                    objectFit="contain"
                    fill={currentFill}
                    nextFill={nextFill}
                    fillTransitionDuration={500}
                    fillTrigger={fillTick}
                    style={{ pointerEvents: 'none' }}
                    className="logo-dots md:top-[97px] md:left-[33px]"
                    onTransitionComplete={handleHalftoneTransitionComplete}
                  />
                </div>

                {/* Cards Container */}
                <div className="relative z-10 h-full flex flex-col items-center justify-center">
                  <div className="scale-100 origin-top">
                    {prevIndex !== null && isExiting && csPrev ? (
                      <AnimatedScene
                        key={`scene-exit-${prevIndex}-${activeIndex}`}
                        {...getSceneDefinition(prevIndex, csPrev, csPrev.activeBgColor)}
                        mode="exit"
                        play
                      />
                    ) : (
                      <AnimatedScene
                        key={`scene-enter-${activeIndex}`}
                        {...getSceneDefinition(activeIndex, caseStudies[activeIndex], csActive.activeBgColor)}
                        mode="enter"
                        play
                      />
                    )}
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

export default RealEstateCaseStudies;

