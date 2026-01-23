import { withPrefix } from 'gatsby';
import React, { useState, useEffect } from 'react';
import styled, { css } from 'styled-components';
import { SceneConfig } from './_case-studies/Scene';
import { AnimatedScene, SceneLayout } from './_case-studies/AnimatedScene';
import { sm, md, lg } from '~/ds/mixins/breakpoints';
import { Container } from '~/elements/Container';
import { Text } from '~/components/Typography';
import { Grid } from '~/elements/Grid';
import { Column } from '~/elements/Column';
import { Flex } from '~/elements/Flex';
import { Icon } from '~/elements/Icon';
import LogoBrex from '~/assets/svg/logos/brex24.svg';
import LogoMercury from '~/assets/svg/logos/mercury.svg';
import LogoRamp from '~/assets/svg/logos/ramp.svg';
import LogoBestEgg from '~/assets/svg/logos/bestegg.svg';
import DotHalftone from '~/components/DotHalftone';
import { useCarouselCardVisibility } from '~/utils/useCarouselCardVisibility';
import { useIsMobile } from '@/hooks/use-mobile';
interface Product {
  name: string;
}

interface CaseStudyData {
  slug: string;
  icon: React.ComponentType;
  title: string;
  description: string;
  products: Product[];
  quote: string;
  author: string;
  activeBgColor: string;
  activeIconColor: string;
  dotColor: string;
}

const Wrapper = styled.section`
  padding: 0;

  @media ${md} {
    padding: 0 12px;
  }
`;

const CaseStudiesWrapper = styled.div`
  overflow: hidden;
  z-index: 6;
  border-radius: 0;
  padding: 24px 0;
  min-height: 720px;
  display: flex;
  flex-direction: column;
  transform: border-radius 0.5s;
  border-radius: 12px;

  @media ${md} {
    background-color: #fbfbfc;
    box-shadow:
      0 0 20px 0 #fff inset,
      0 1px 2px 0 rgba(0, 0, 0, 0.1),
      0 0 0 1px rgba(255, 255, 255, 0.5) inset;
  }
`;

const Testimonial = styled.div`
  &:before {
    content: '“';
    display: block;
    font-size: 48px;
    font-weight: 700;
    line-height: 48px;
    color: rgba(var(--rgb-blue-800), 0.3);
    width: 24px;
    height: 18px;
    margin-bottom: 24px;
  }
`;

const CaseStudy = styled.div<{ $isAnimating: boolean }>`
  padding: 0 24px 24px;
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
  position: relative;

  @media ${sm} {
    padding: 0 40px 40px;
  }

  @media ${md} {
    padding: 0 24px;
  }
`;

const AnimatedContent = styled.div<{
  isAnimating: boolean;
  isExiting: boolean;
  direction: 'left' | 'right';
  entering?: boolean;
}>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 72px 0;
  opacity: ${({ entering, isAnimating, isExiting }) => (entering ? (isAnimating ? 0 : 1) : isExiting ? 0 : 1)};
  transform: ${({ entering, isAnimating, isExiting }) => {
    if (isExiting) {
      return 'translateX(-100px)';
    }
    if (entering && isAnimating) {
      return 'translateX(100px)';
    }
    return 'translateX(0px)';
  }};
  transition: all 0.5s cubic-bezier(0.76, 0, 0.24, 1);
  will-change: transform, opacity;
`;

const ProductList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 20px;
`;

const ProductItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  background-color: rgba(var(--rgb-white), 0.75);
  box-shadow:
    0 1px 2px 0 rgba(0, 0, 0, 0.1),
    0 0 0 1px #fff inset;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-blue-800);

  svg {
    height: 16px;
    width: 16px;
    --icon-base-color: rgba(var(--rgb-blue-800), 1);
    opacity: 0.5;
  }
`;

// slug is now explicit on each case study

const getProductIcon = (productName: string): React.ReactNode => {
  const iconMap: Record<string, React.ReactNode> = {
    'Bank Accounts': <Icon.Product.BankAccounts />,
    ACH: <Icon.Product.ACH />,
    Wire: <Icon.Product.Wire />,
    'Book Transfers': <Icon.Product.BookTransfers />,
    'International Payments': <Icon.Product.InternationalWires />,
    Realtime: <Icon.Product.Realtime />,
    'Card Programs': <Icon.Product.CardPrograms />,
    Checks: <Icon.Product.Checks />,
    'Domestic Payments': <Icon.Product.DomesticPayments />,
    'Loan Origination': <Icon.Product.LoanOrigination />,
    'Loan Purchase': <Icon.Product.LoanPurchase />,
    'Debt Financing': <Icon.Product.DebtFinancing />,
  };
  return iconMap[productName] || <Icon.Product.BankAccounts />;
};

const caseStudies: CaseStudyData[] = [
  {
    slug: 'brex',
    icon: LogoBrex,
    title: 'Brex uses Column as the banking layer behind a business spend platform',
    description:
      'Brex integrates Column’s payments and deposits infrastructure into banking solutions trusted by 1 in every 3 startups. With Column, Brex maintains full control of their customer experience for insured checking accounts, real-time transfers, and automated reimbursements.',
    products: [{ name: 'Bank Accounts' }, { name: 'Domestic Payments' }, { name: 'International Payments' }],
    quote:
      'No one comes close to Column’s level of technical infrastructure.',
    author: 'Pedro Franceschi, Founder and CEO, Brex',
    activeBgColor: '#EC652B',
    activeIconColor: 'var(--color-white)',
    dotColor: '#F2936B',
  },
  {
    slug: 'mercury',
    icon: LogoMercury,
    title: 'Mercury uses Column to build modern personal and business banking',
    description:
      "Mercury partners with Column to offer a suite of deposit and payment products to companies. By building on Column's API-first infrastructure, Mercury helps businesses scale with confidence: moving money instantly, automating financial operations, and seamlessly paying global vendors in over 130 currencies.",
    products: [
      { name: 'Bank Accounts' },
      { name: 'Domestic Payments' },
      { name: 'International Payments' },
      { name: 'Card Programs' },
    ],
    quote:
      'Our engineers love their platform. It’s great to have a partner like Column that moves and ships as fast as us.',
    author: 'Immad Akhund, Co-founder & CEO, Mercury',
    activeBgColor: '#5366EB',
    activeIconColor: 'var(--color-white)',
    dotColor: '#7585EF',
  },
  {
    slug: 'ramp',
    icon: LogoRamp,
    title: 'Ramp uses Column to issue and manage corporate cards in certain international markets',
    description:
      'Ramp partners with Column to offer a commercial charge card that works across borders. With Column, Ramp keeps total control of the customer experience and gives American companies a unified platform for global spend: offering cards, controls, and reporting to employees around the world',
    products: [{ name: 'International Payments' }, { name: 'Card Programs' }],
    quote: 'It’s mission critical that partners move at our speed and Column has delivered.',
    author: 'Eric Glyman, CEO, Ramp',
    activeBgColor: '#E4F223',
    activeIconColor: 'var(--color-blue-800)',
    dotColor: '#CBD820',
  },
  {
    slug: 'bestegg',
    icon: LogoBestEgg,
    title: 'Best Egg partners with Column to scale personal loans',
    description:
      'Best Egg partners with Column to originate personal loans, helping people with limited savings confidently navigate their everyday financial lives. By leveraging Column’s national bank charter and balance sheet, Best Egg can easily expand access to its flexible lending solutions across the U.S.',
    products: [{ name: 'Lending' }, { name: 'Credit Origination' }],
    quote:
      'Column’s modern platform empowers Best Egg to scale and better serve consumers seeking flexible financial solutions.',
    author: 'Paul Ricci, CEO, Best Egg',
    activeBgColor: '#092951',
    activeIconColor: 'var(--color-white)',
    dotColor: '#6A7E96',
  },
];

const TabsWrapper = styled.div<{ showFade: boolean; isAtEnd: boolean }>`
  position: relative;
  display: flex;
  width: 100%;
  flex: 0 0 auto;
  gap: 16px;
  padding: 0 24px 24px 24px;
  justify-content: center;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  z-index: 1;

  &::-webkit-scrollbar {
    display: none;
  }

  mask: ${({ showFade, isAtEnd }) =>
    showFade && !isAtEnd ? 'linear-gradient(to right, black calc(100% - 24px), transparent)' : 'none'};
  -webkit-mask: ${({ showFade, isAtEnd }) =>
    showFade && !isAtEnd ? 'linear-gradient(to right, black calc(100% - 24px), transparent)' : 'none'};
`;

const TabButton = styled.button<{
  active: boolean;
  activeBgColor?: string;
  activeIconColor?: string;
}>`
  background: ${({ active, activeBgColor }) => (active && activeBgColor ? activeBgColor : 'none')};
  border: none;
  display: flex;
  flex-shrink: 0;
  flex-grow: 1;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  padding: 12px 32px;
  color: var(--color-blue-800);
  box-shadow: ${({ active }) =>
    active
      ? '0 0 0 1px rgba(0, 0, 0, 0.05) inset, 0 -1px 0 rgba(0, 0, 0, 0.1) inset, 0px -48px 24px -24px rgba(0, 0, 0, 0.02) inset, 0px 4px 8px 0px rgba(0, 0, 0, 0.05), 0px 2px 4px 0px rgba(0, 0, 0, 0.05), 0px 1px 1px 0px rgba(0, 0, 0, 0.05)'
      : 'none'};
  cursor: pointer;
  transition:
    color 0.2s,
    border 0.2s,
    box-shadow 0.1s;
  &:hover {
    ${({ active }) =>
    !active
      ? css`
            background: rgba(var(--rgb-blue-800), 0.05);
          `
      : null}
  }
  svg {
    height: 24px;
    max-width: 100%;
    transition: color 0.2s;
    fill: ${({ active, activeIconColor }) => (active && activeIconColor ? activeIconColor : 'currentColor')};
    color: ${({ active, activeIconColor }) => (active && activeIconColor ? activeIconColor : 'currentColor')};
  }
`;

const ClassicLayout = styled.div`
  display: none;

  @media ${md} {
    display: flex;
    flex-direction: column;
    flex: 1;
  }
`;

const CarouselLayout = styled.div`
  display: block;
  @media ${md} {
    display: none;
  }
`;

const CardsScroller = styled.div`
  display: flex;
  gap: 20px;
  padding: 0 20px 24px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scroll-padding-left: 20px;
  scrollbar-width: none;
  -ms-overflow-style: none;
  mask: linear-gradient(90deg, black calc(100% - 40px), transparent);
  &::-webkit-scrollbar {
    display: none;
  }
  @media ${md} {
    display: none;
  }
`;

const CaseCard = styled.div`
  scroll-snap-align: start;
  flex: 0 0 calc(100% - 24px);
  max-width: 920px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  position: relative;
  min-height: 800px;
`;

const CarouselCard: React.FC<{
  cs: CaseStudyData;
  index: number;
  getSceneDefinition: (
    index: number,
    cs: CaseStudyData,
    activeBgColor: string
  ) => { config: SceneConfig; layout: SceneLayout };
}> = ({ cs, index, getSceneDefinition }) => {
  const { ref, isVisible, isSnapped } = useCarouselCardVisibility({ threshold: 0.6 });
  const isFirstCard = index === 0;
  const [hasEverSnapped, setHasEverSnapped] = useState<boolean>(isFirstCard);
  useEffect(() => {
    if (isSnapped && !hasEverSnapped) setHasEverSnapped(true);
  }, [isSnapped, hasEverSnapped]);
  const forceNow = isFirstCard || isSnapped || hasEverSnapped;
  const imageSrc = withPrefix(`/images/index/case-studies/bg-${cs.slug}.png`);
  const def = getSceneDefinition(index, cs, cs.activeBgColor);

  return (
    <CaseCard key={`card-${index}`} ref={ref}>
      <CaseStudy $isAnimating={false}>
        <Grid gridTemplateColumns={12} gap={{ _: '24px', sm: '40px', md: '20px' }} height="100%" flex="1">
          <Column
            gridColumn={{ _: 12, md: 6, lg: 4 }}
            gridColumnStart={{ _: 1, md: 8, lg: 8 }}
            display="flex"
            flexDirection="column"
            justifyContent="center"
            position="relative"
            mx={{ _: '-24px', sm: '-40px' }}
          >
            <CaseStudyVisual aria-hidden $dotColor={cs.dotColor}>
              <CaseStudyIcon>
                {(() => {
                  const IconComponent = cs.icon;
                  return <IconComponent />;
                })()}
              </CaseStudyIcon>

              <BlurredBG $dotColor={cs.dotColor} />
              <img src={imageSrc} alt={cs.title} />
            </CaseStudyVisual>

            <AnimatedScene
              key={`scene-${index}`}
              config={def.config}
              layout={def.layout}
              mode="enter"
              persistAfterEnter
              forcePlay={forceNow}
            />
          </Column>

          <Column
            gridColumn={{ _: 12, md: 6, lg: 5 }}
            gridColumnStart={{ _: 1, lg: 2 }}
            display="flex"
            flexDirection="column"
            minHeight="0"
            flex="1"
            position="relative"
          >
            <Flex flexDirection="column" gap="48px" flex="1" minHeight="0" height="100%">
              <Column flex="auto">
                <Text
                  as="h3"
                  size={{ _: 24, sm: 28 }}
                  weight="medium"
                  color="blue-800"
                  letterSpacing="tight"
                  maxWidth="425px"
                >
                  {cs.title}
                </Text>
                {cs.products && (
                  <ProductList>
                    {cs.products.map((product, idx) => (
                      <ProductItem key={idx}>
                        {getProductIcon(product.name)}
                        {product.name}
                      </ProductItem>
                    ))}
                  </ProductList>
                )}
              </Column>
              <Column>
                <Testimonial>
                  <Text as="blockquote" lineHeight="22px" size={{ _: 16, sm: 18 }} p={0}>
                    {cs.quote}
                  </Text>
                  <Flex gap="8px" alignItems="center" mt="24px">
                    <Text as="p" size={{ _: 14, sm: 16 }} color="blue-800" opacity={0.6}>
                      {cs.author}
                    </Text>
                  </Flex>
                </Testimonial>
              </Column>
            </Flex>
          </Column>
        </Grid>
      </CaseStudy>
    </CaseCard>
  );
};

const CaseStudyIcon = styled.div`
  position: absolute;
  top: 24px;
  left: 24px;
  z-index: 2;

  @media ${sm} {
    top: 40px;
    left: 40px;
  }

  svg {
    height: 32px;
    width: auto;
  }
`;

const CaseStudyVisual = styled.div<{ $dotColor: string }>`
  position: relative;
  z-index: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 360px;
  border-radius: 12px 12px 0 0;
  overflow: hidden;
  mask: radial-gradient(circle, black 100%, transparent 100%);

  @media ${sm} {
    height: 480px;
  }

  @media ${md} {
    position: absolute;
    inset: -96px 0 -24px 0;
    padding-top: 96px;
    width: 1200px;
    height: auto;
    margin-left: -50%;
    mask: radial-gradient(circle, black 30%, transparent 70%);
  }

  @media ${lg} {
    margin-left: -100%;
  }

  &:after {
    content: '';
    position: absolute;
    inset: 0;
    opacity: 0.4;
    background-color: ${({ $dotColor }) => $dotColor};
    mask-image: radial-gradient(circle at 1px 1px, #000 1px, transparent 1px);
    mask-size: 8px 8px;
    mask-position: center;
    mask-repeat: repeat;
    -webkit-mask-image: radial-gradient(circle at 1px 1px, #000 1px, transparent 1px);
    -webkit-mask-size: 8px 8px;
    -webkit-mask-position: center;
    -webkit-mask-repeat: repeat;
  }

  .logo-dots {
    top: calc(50% + 1px);
    left: 5px;

    @media ${sm} {
      top: calc(50% + 5px);
    }

    @media ${md} {
      top: 97px;
      left: 33px;
    }
  }

  ${CarouselLayout} & {
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    &:after {
      display: none;
    }
  }
`;

const BlurredBG = styled.div<{ $dotColor: string }>`
  position: absolute;
  width: 800px;
  height: 800px;
  border-radius: 50%;
  background-color: ${({ $dotColor }) => $dotColor};
  mask: radial-gradient(closest-side at 50% 50%, #000 0%, transparent 100%);
  -webkit-mask: radial-gradient(closest-side at 50% 50%, #000 0%, transparent 100%);
  z-index: -1;
  opacity: 0.15;
  transition: background-color 0.5s ease;

  @media ${md} {
    width: 100%;
    height: 700px;
    left: 10%;
  }
`;

const TabsContainer = styled.div`
  position: relative;
`;

const ScrollButton = styled.button<{ side: 'left' | 'right'; $visible: boolean }>`
  position: absolute;
  top: 4px;
  ${({ side }) => (side === 'right' ? 'right: 16px;' : 'left: 16px;')}
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 18px;
  border: none;
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05), 0 2px 8px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  z-index: 2;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transform: scale(${({ $visible }) => ($visible ? 1 : 0.8)});
  visibility: ${({ $visible }) => ($visible ? 'visible' : 'hidden')};
  pointer-events: ${({ $visible }) => ($visible ? 'auto' : 'none')};
  transition:
    opacity 200ms ease,
    visibility 200ms ease,
    transform 200ms ease;

  svg {
    height: 20px;
    width: 20px;
  }
`;

const useLayoutMode = () => {
  const [isClassicLayout, setIsClassicLayout] = useState(false);
  const [isCarouselLayout, setIsCarouselLayout] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // md is a styled-components css template: "(min-width: 768px)"
    const query = md.join('');
    const mql = window.matchMedia(query);

    const apply = (matches: boolean) => {
      setIsClassicLayout(matches);
      setIsCarouselLayout(!matches);
    };

    // Initial state
    apply(mql.matches);

    // Listen to changes
    const onChange = (e: MediaQueryListEvent) => apply(e.matches);
    if (mql.addEventListener) mql.addEventListener('change', onChange);
    else (mql as any).addListener?.(onChange);

    return () => {
      if (mql.removeEventListener) mql.removeEventListener('change', onChange);
      else (mql as any).removeListener?.(onChange);
    };
  }, []);

  return { isClassicLayout, isCarouselLayout };
};

export const SectionCaseStudies: React.FC = () => {
  const { isClassicLayout, isCarouselLayout } = useLayoutMode();
  const isMobile = useIsMobile();
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [showFade, setShowFade] = React.useState(false);
  const [isAtEnd, setIsAtEnd] = React.useState(false);
  const [isAtStart, setIsAtStart] = React.useState(true);
  const [isAnimating, setIsAnimating] = React.useState(false);
  const [isExiting, setIsExiting] = React.useState(false);
  const [exitDirection, setExitDirection] = React.useState<'left' | 'right'>('left');
  const [displayIndex, setDisplayIndex] = React.useState(0);
  const [prevIndex, setPrevIndex] = React.useState<number | null>(null);
  const [isExitingContent, setIsExitingContent] = React.useState(false);
  const [fillTick, setFillTick] = React.useState(0);
  const [colorIndex, setColorIndex] = React.useState(0); // separate state for immediate color changes
  const [nextVisualIndex, setNextVisualIndex] = React.useState<number | undefined>(undefined);
  const isHTTransitioningRef = React.useRef(false);
  const transitionQueueRef = React.useRef<number[]>([]);
  const tabsRef = React.useRef<HTMLDivElement>(null);
  const csActive = caseStudies[activeIndex];
  const csCurrent = caseStudies[displayIndex];
  const csColor = caseStudies[colorIndex]; // for immediate color transitions
  const csPrev = prevIndex !== null ? caseStudies[prevIndex] : null;
  const currentImageSrc = withPrefix(`/images/index/case-studies/${caseStudies[displayIndex].slug}.jpg`);
  const nextImageSrc =
    nextVisualIndex !== undefined
      ? withPrefix(`/images/index/case-studies/${caseStudies[nextVisualIndex].slug}.jpg`)
      : undefined;
  // Halftone dots fade from current to active color - trigger immediately on activeIndex change
  const currentFill = { type: 'solid' as const, colorA: csColor.dotColor };
  const nextFill =
    activeIndex !== colorIndex ? ({ type: 'solid' as const, colorA: csActive.dotColor } as const) : undefined;

  const sceneConfigOverrides: Record<string, (activeBgColor: string) => SceneConfig> = {
    brex: (activeBgColor) => ({
      cards: [
        {
          type: 'account',
          props: {
            amount: '$12,340,111.89',
            currency: 'USD',
            accountName: 'Operating Account',
            accountNumberLast4: '9921',
            activeBgColor,
          },
        },
        {
          type: 'transfer',
          props: {
            amount: '48,920.21',
            fromAccountName: 'Operating Account',
            fromAccountLast4: '9921',
            toAccountName: 'Payroll Clearing',
            toAccountLast4: '7310',
            activeBgColor,
          },
        },
        {
          type: 'intl',
          props: {
            fromAmount: '4,250.00',
            toAmount: '4,240.00',
            fromCurrency: 'USD',
            toCurrency: 'EUR',
            fromCurrencySymbol: '$',
            toCurrencySymbol: '€',
            fromAccountName: 'Operating Account',
            fromAccountLast4: '9921',
            toAccountName: 'Reserve Account',
            toAccountLast4: '5580',
            activeBgColor,
          },
        },
      ],
    }),
  };

  const getSceneDefinition = (
    index: number,
    cs: CaseStudyData,
    activeBgColor: string
  ): { config: SceneConfig; layout: SceneLayout } => {
    const slug = cs.slug;
    const productNames = cs.products.map((p) => p.name);
    const uniqueProductCount = new Set(productNames).size;
    const has = (name: string) => cs.products.some((p) => p.name === name);

    const layoutBySlug: Record<string, SceneLayout> = {
      brex: [
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
      ],
      mercury: [
        {
          translateX: 'calc(50px - 50%)',
          translateY: '-100px',
          startTranslateX: '-50%',
          startTranslateY: '0',
          delay: 0,
          zIndex: 0,
          width: '360px',
          hidden: true,
        },
        {
          translateX: '-55%',
          translateY: '-105%',
          startTranslateX: '-50%',
          startTranslateY: '-95%',
          delay: 0,
          zIndex: 1,
          width: '360px',
        },
        {
          translateX: '-55%',
          translateY: '10%',
          startTranslateX: '-50%',
          startTranslateY: '10%',
          delay: 0.05,
          zIndex: 1,
          width: '360px',
        },
        {
          translateX: '-38%',
          translateY: '-50%',
          startTranslateX: '-50%',
          startTranslateY: '-50%',
          delay: 0.05,
          zIndex: 0,
          width: '360px',
        },
      ],
      ramp: [
        {
          translateX: '-55%',
          translateY: '10%',
          startTranslateX: '-50%',
          startTranslateY: '10%',
          delay: 0,
          zIndex: 1,
          width: '360px',
        },
        {
          translateX: '-45%',
          translateY: '-60%',
          startTranslateX: '-50%',
          startTranslateY: '-50%',
          delay: 0.05,
          zIndex: 0,
          width: '360px',
        },
      ],
    };

    const singleProductLayoutBySlug: Record<string, SceneLayout> = {
      bestegg: [
        {
          translateX: '-38%',
          translateY: '-50%',
          startTranslateX: '-50%',
          startTranslateY: '-50%',
          delay: 0,
          zIndex: 1,
          width: '300px',
        },
        {
          translateX: '-55%',
          translateY: '5%',
          startTranslateX: '-55%',
          startTranslateY: '5%',
          delay: 0.05,
          zIndex: 0,
          width: '300px',
        },
        {
          translateX: '-55%',
          translateY: '-105%',
          startTranslateX: '-50%',
          startTranslateY: '-105%',
          delay: 0.1,
          zIndex: 0,
          width: '300px',
        },
      ],
    };

    const isSpecialSingle = slug === 'bestegg';
    const isSingle = uniqueProductCount === 1 || isSpecialSingle;

    const buildCards = (): SceneConfig['cards'] => {
      if (isSingle) {
        if (isSpecialSingle)
          return [
            {
              type: 'loan',
              props: {
                loanName: 'Linda Hawthorne',
                amount: '$20,203.23',
                date: '5-year term',
                tag: 'Debt consolidation',
                activeBgColor,
              },
            },
            {
              type: 'loan',
              props: {
                loanName: 'Jacob Raye',
                amount: '$20,203.23',
                date: 'Jun 10, 2025',
                tag: 'Credit card refinancing',
                activeBgColor,
              },
            },
            {
              type: 'loan',
              props: {
                loanName: 'Audrey Martell',
                amount: '$8,871.72',
                date: '3-year term',
                tag: 'Home improvement',
                activeBgColor,
              },
            },
          ];
        const only = productNames[0];
        if (only === 'Bank Accounts')
          return [
            {
              type: 'account',
              props: {
                amount: '$21,234,982.56',
                currency: 'USD',
                accountName: 'Operating Account',
                accountNumberLast4: '1057',
                activeBgColor,
              },
            },
            {
              type: 'account',
              props: {
                amount: '$12,345,678.90',
                currency: 'USD',
                accountName: 'Reserve Account',
                accountNumberLast4: '6211',
                activeBgColor,
              },
            },
            {
              type: 'account',
              props: {
                amount: '$98,765.43',
                currency: 'USD',
                accountName: 'Payroll Clearing',
                accountNumberLast4: '4291',
                activeBgColor,
              },
            },
          ];
        if (only === 'Domestic Payments')
          return [
            {
              type: 'transfer',
              props: {
                amount: '4,920.21',
                fromAccountName: 'Operating Account',
                fromAccountLast4: '9957',
                toAccountName: 'Payroll Clearing',
                toAccountLast4: '7310',
                activeBgColor,
              },
            },
            {
              type: 'transfer',
              props: {
                amount: '2,410.00',
                fromAccountName: 'Operating Account',
                fromAccountLast4: '9410',
                toAccountName: 'Vendor Payouts',
                toAccountLast4: '5809',
                activeBgColor,
              },
            },
            {
              type: 'transfer',
              props: {
                amount: '350.00',
                fromAccountName: 'Reimbursements',
                fromAccountLast4: '4401',
                toAccountName: 'Operating Account',
                toAccountLast4: '9957',
                activeBgColor,
              },
            },
          ];
        if (only === 'International Payments')
          return [
            {
              type: 'intl',
              props: {
                fromAmount: '8,450.00',
                toAmount: '8,210.00',
                fromCurrency: 'USD',
                toCurrency: 'EUR',
                fromCurrencySymbol: '$',
                toCurrencySymbol: '€',
                fromAccountName: 'Operating Account',
                fromAccountLast4: '9957',
                toAccountName: 'Vendor (EUR)',
                toAccountLast4: '4421',
                activeBgColor,
              },
            },
            {
              type: 'intl',
              props: {
                fromAmount: '2,980.75',
                toAmount: '2,951.00',
                fromCurrency: 'USD',
                toCurrency: 'GBP',
                fromCurrencySymbol: '$',
                toCurrencySymbol: '£',
                fromAccountName: 'Operating Account',
                fromAccountLast4: '2210',
                toAccountName: 'GBP Payout',
                toAccountLast4: '1176',
                activeBgColor,
              },
            },
            {
              type: 'intl',
              props: {
                fromAmount: '1,100.00',
                toAmount: '120,000',
                fromCurrency: 'USD',
                toCurrency: 'JPY',
                fromCurrencySymbol: '$',
                toCurrencySymbol: '¥',
                fromAccountName: 'Operating Account',
                fromAccountLast4: '4401',
                toAccountName: 'JPY Payout',
                toAccountLast4: '9021',
                activeBgColor,
              },
            },
          ];
        if (only === 'Card Programs')
          return [
            { type: 'credit', props: { cardholderName: 'Mace Montana', activeBgColor } },
            { type: 'credit', props: { cardholderName: 'J Wu', activeBgColor } },
            { type: 'credit', props: { cardholderName: 'A Smith', activeBgColor } },
          ];
        if (['Lending', 'Loan Origination', 'Loan Purchase', 'Debt Financing', 'Credit Origination'].includes(only))
          return [
            {
              type: 'loan',
              props: { loanName: 'Loan A', amount: '$120,000.00', date: 'May 15, 2025', tag: 'Term', activeBgColor },
            },
            {
              type: 'loan',
              props: {
                loanName: 'Loan B',
                amount: '$20,203.23',
                date: 'Jun 10, 2025',
                tag: 'Revolving',
                activeBgColor,
              },
            },
            {
              type: 'loan',
              props: {
                loanName: 'Loan C',
                amount: '$2,500,000.00',
                date: 'Jul 01, 2025',
                tag: 'Bridge',
                activeBgColor,
              },
            },
          ];
        return [
          {
            type: 'account',
            props: {
              amount: '$21,234,982.56',
              currency: 'USD',
              accountName: 'Operating Account',
              accountNumberLast4: '9957',
              activeBgColor,
            },
          },
        ];
      }

      const cards: SceneConfig['cards'] = [];
      if (has('Bank Accounts'))
        cards.push({
          type: 'account',
          props: {
            amount: '$21,234,982.56',
            currency: 'USD',
            accountName: 'Operating Account',
            accountNumberLast4: '9957',
            activeBgColor,
          },
        });
      if (has('Domestic Payments'))
        cards.push({
          type: 'transfer',
          props: {
            amount: '12,291.00',
            fromAccountName: 'Operating Account',
            fromAccountLast4: '9957',
            toAccountName: 'Settlement Account',
            toAccountLast4: '4124',
            activeBgColor,
          },
        });
      if (has('International Payments'))
        cards.push({
          type: 'intl',
          props: {
            toCurrencySymbol: '€',
            fromAmount: '8,450.00',
            fromCurrency: 'USD',
            toAmount: '8,210.00',
            toCurrency: 'EUR',
            fromCurrencySymbol: '$',
            fromAccountName: 'Operating Account',
            fromAccountLast4: '9957',
            toAccountName: 'Vendor (EUR)',
            toAccountLast4: '4421',
            activeBgColor,
          },
        });
      if (
        cs.products.some((p) =>
          ['Lending', 'Loan Origination', 'Loan Purchase', 'Debt Financing', 'Credit Origination'].includes(p.name)
        )
      )
        cards.push({
          type: 'loan',
          props: { loanName: 'New Loan', amount: '$20,203.23', date: 'May 15, 2025', tag: 'Revolving', activeBgColor },
        });
      if (has('Card Programs'))
        cards.push({ type: 'credit', props: { cardholderName: 'Mace Montana', activeBgColor } });
      return cards;
    };

    const hasOverride = slug in sceneConfigOverrides;
    const config: SceneConfig =
      hasOverride && !isSpecialSingle
        ? sceneConfigOverrides[slug as keyof typeof sceneConfigOverrides](activeBgColor)
        : { cards: buildCards() };

    if (isSingle) {
      const singleLayout = singleProductLayoutBySlug[slug];
      return { config, layout: singleLayout };
    }

    const multiLayout = layoutBySlug[slug];
    return { config, layout: multiLayout };
  };

  const handleTabChange = (newIndex: number) => {
    if (newIndex === activeIndex) return;

    const direction = newIndex > activeIndex ? 'right' : 'left';
    setExitDirection(direction);
    setPrevIndex(activeIndex);
    setIsExiting(true);
    setIsExitingContent(false);
    setActiveIndex(newIndex);
    setFillTick((t) => t + 1);
    setIsAnimating(true);
    // Kick off halftone transition immediately when idle; otherwise coalesce to latest target
    if (!isHTTransitioningRef.current && nextVisualIndex === undefined) {
      setNextVisualIndex(newIndex);
      isHTTransitioningRef.current = true;
    } else {
      const q = transitionQueueRef.current;
      q.length = 0;
      q.push(newIndex);
    }
    if (typeof window !== 'undefined') {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(false);
          setIsExitingContent(true);
        });
      });
    } else {
      setTimeout(() => {
        setIsAnimating(false);
        setIsExitingContent(true);
      }, 20);
    }
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

  // Handle color transition completion separately from image transition
  React.useEffect(() => {
    if (activeIndex !== colorIndex) {
      const timer = setTimeout(() => {
        setColorIndex(activeIndex);
      }, 500); // Match fillTransitionDuration
      return () => clearTimeout(timer);
    }
  }, [fillTick, activeIndex, colorIndex]);

  React.useEffect(() => {
    if (activeIndex === displayIndex) return;
    if (!isHTTransitioningRef.current && nextVisualIndex === undefined) {
      setNextVisualIndex(activeIndex);
      isHTTransitioningRef.current = true;
    } else {
      transitionQueueRef.current.push(activeIndex);
    }
  }, [activeIndex, displayIndex, nextVisualIndex]);

  const handleScroll = React.useCallback(() => {
    if (!tabsRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = tabsRef.current;

    // More reliable overflow detection with better threshold
    // Check if there's actual content overflow, not just sub-pixel differences
    const hasOverflow = scrollWidth > clientWidth + 1;

    // More precise scroll position detection
    const scrollThreshold = 2; // Small threshold to account for sub-pixel scrolling
    const atEnd = scrollLeft + clientWidth >= scrollWidth - scrollThreshold;
    const atStart = scrollLeft <= scrollThreshold;

    // Always update state to ensure buttons show when needed
    setShowFade(hasOverflow);
    setIsAtEnd(atEnd);
    setIsAtStart(atStart);
  }, []);

  // Additional effect to check scroll state when layout changes
  React.useEffect(() => {
    if (isClassicLayout) {
      // Check scroll state when switching to classic layout
      const checkScroll = () => {
        if (tabsRef.current) {
          handleScroll();
        }
      };

      // Multiple checks to ensure we catch the state after layout change
      setTimeout(checkScroll, 0);
      setTimeout(checkScroll, 100);
      setTimeout(checkScroll, 300);
    }
  }, [isClassicLayout, handleScroll]);

  // Force check scroll state on every render when in classic layout
  React.useEffect(() => {
    if (isClassicLayout && tabsRef.current) {
      // Use a small delay to ensure DOM has updated
      const timeoutId = setTimeout(() => {
        handleScroll();
      }, 0);

      return () => clearTimeout(timeoutId);
    }
  });

  const scrollTabsToEnd = React.useCallback(() => {
    const el = tabsRef.current;
    if (!el) return;
    const target = Math.max(0, el.scrollWidth - el.clientWidth);
    el.scrollTo({ left: target, behavior: 'smooth' });
  }, []);

  const scrollTabsToStart = React.useCallback(() => {
    const el = tabsRef.current;
    if (!el) return;
    el.scrollTo({ left: 0, behavior: 'smooth' });
  }, []);

  // Debounced resize handler
  const debouncedHandleScroll = React.useCallback(() => {
    let timeoutId: NodeJS.Timeout;
    return () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, 50);
    };
  }, [handleScroll]);

  // Immediate resize handler for critical viewport changes
  const immediateResizeHandler = React.useCallback(() => {
    if (tabsRef.current && isClassicLayout) {
      // Immediate check
      handleScroll();
      // Also check after a short delay to catch any layout shifts
      setTimeout(handleScroll, 10);
      setTimeout(handleScroll, 100);
    }
  }, [handleScroll, isClassicLayout]);

  React.useEffect(() => {
    const tabsElement = tabsRef.current;
    if (tabsElement) {
      // Initial check with multiple attempts to ensure DOM is fully rendered
      const initialCheck = () => {
        // Only check if element is visible and has dimensions
        if (tabsElement.offsetWidth > 0 && tabsElement.offsetHeight > 0) {
          handleScroll();
        }
      };

      // Run immediately and with multiple delays to catch different render states
      if (typeof requestAnimationFrame !== 'undefined') {
        requestAnimationFrame(initialCheck);
        requestAnimationFrame(() => requestAnimationFrame(initialCheck));
      } else {
        initialCheck();
      }

      // Multiple timeout checks to ensure we catch the scroll state after all rendering
      const timeoutIds = [
        setTimeout(initialCheck, 50),
        setTimeout(initialCheck, 120),
        setTimeout(initialCheck, 300),
        setTimeout(initialCheck, 500), // Additional check for slower rendering
        setTimeout(initialCheck, 1000), // Even longer delay for complex layouts
      ];

      const debouncedScroll = debouncedHandleScroll();

      tabsElement.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('resize', debouncedScroll, { passive: true });
      window.addEventListener('resize', immediateResizeHandler, { passive: true });

      let ro: ResizeObserver | undefined;
      if (typeof ResizeObserver !== 'undefined') {
        ro = new ResizeObserver(() => {
          // Immediate check for resize observer
          handleScroll();
        });
        ro.observe(tabsElement);
      }

      // MutationObserver to watch for changes in the tabs container
      let mo: MutationObserver | undefined;
      if (typeof MutationObserver !== 'undefined') {
        mo = new MutationObserver(() => {
          // Check scroll state when DOM changes
          setTimeout(handleScroll, 0);
        });
        mo.observe(tabsElement, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['style', 'class'],
        });
      }

      return () => {
        timeoutIds.forEach(clearTimeout);
        tabsElement.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', debouncedScroll);
        window.removeEventListener('resize', immediateResizeHandler);
        ro?.disconnect();
        mo?.disconnect();
      };
    }
  }, [handleScroll, debouncedHandleScroll, immediateResizeHandler]);

  return (
    <Wrapper>
      <Container pt={{ _: '72px', md: '144px' }} px={0}>
        <CaseStudiesWrapper>
          {isClassicLayout && (
            <ClassicLayout>
              <TabsContainer>
                <TabsWrapper ref={tabsRef} showFade={showFade} isAtEnd={isAtEnd}>
                  {caseStudies.map((c, i) => {
                    const LogoIcon = c.icon;
                    return (
                      <TabButton
                        key={i}
                        active={i === activeIndex}
                        activeBgColor={c.activeBgColor}
                        activeIconColor={c.activeIconColor}
                        onClick={() => handleTabChange(i)}
                        aria-label={c.title}
                        title={c.title}
                      >
                        <LogoIcon />
                      </TabButton>
                    );
                  })}
                </TabsWrapper>
                <ScrollButton
                  side="right"
                  onClick={scrollTabsToEnd}
                  aria-label="Scroll tabs right"
                  $visible={showFade && !isAtEnd}
                >
                  <Icon.ChevronRight />
                </ScrollButton>
                <ScrollButton
                  side="left"
                  onClick={scrollTabsToStart}
                  aria-label="Scroll tabs left"
                  $visible={showFade && !isAtStart}
                >
                  <Icon.ChevronLeft />
                </ScrollButton>
              </TabsContainer>
              <CaseStudy $isAnimating={isAnimating}>
                <Grid gridTemplateColumns={12} gap={{ _: '20px', md: '40px', lg: '20px' }} height="100%" flex="1">
                  <Column
                    gridColumn={{ _: 12, md: 6, lg: 5 }}
                    gridColumnStart={{ _: 1, lg: 2 }}
                    display="flex"
                    flexDirection="column"
                    minHeight="0"
                    flex="1"
                    position="relative"
                  >
                    {prevIndex !== null && (
                      <AnimatedContent
                        key={`exit-${prevIndex}`}
                        entering={false}
                        isAnimating={false}
                        isExiting={isExitingContent}
                        direction="left"
                      >
                        <Flex flexDirection="column" gap="48px" flex="1" minHeight="0" height="100%">
                          <Column flex="auto">
                            <Text
                              as="h3"
                              size={28}
                              weight="medium"
                              color="blue-800"
                              letterSpacing="tight"
                              maxWidth="425px"
                            >
                              {caseStudies[prevIndex].title}
                            </Text>

                            {caseStudies[prevIndex].products && (
                              <ProductList>
                                {caseStudies[prevIndex].products.map((product, index) => (
                                  <ProductItem key={index}>
                                    {getProductIcon(product.name)}
                                    {product.name}
                                  </ProductItem>
                                ))}
                              </ProductList>
                            )}
                          </Column>
                          <Column>
                            <Testimonial>
                              <Text as="blockquote" lineHeight="26px" size={20} p={0}>
                                {caseStudies[prevIndex].quote}
                              </Text>
                              <Flex gap="8px" alignItems="center" mt="24px">
                                <Text as="p" size={16} color="blue-800" opacity={0.6}>
                                  {caseStudies[prevIndex].author}
                                </Text>
                              </Flex>
                            </Testimonial>
                          </Column>
                        </Flex>
                      </AnimatedContent>
                    )}

                    <AnimatedContent
                      key={`enter-${activeIndex}`}
                      entering
                      isAnimating={isAnimating}
                      isExiting={false}
                      direction="left"
                    >
                      <Flex flexDirection="column" gap="48px" flex="1" minHeight="0" height="100%">
                        <Column flex="auto">
                          <Text
                            as="h3"
                            size={28}
                            weight="medium"
                            color="blue-800"
                            letterSpacing="tight"
                            maxWidth="425px"
                          >
                            {caseStudies[activeIndex].title}
                          </Text>

                          {caseStudies[activeIndex].products && (
                            <ProductList>
                              {caseStudies[activeIndex].products.map((product, index) => (
                                <ProductItem key={index}>
                                  {getProductIcon(product.name)}
                                  {product.name}
                                </ProductItem>
                              ))}
                            </ProductList>
                          )}
                        </Column>
                        <Column>
                          <Testimonial>
                            <Text as="blockquote" lineHeight="26px" size={20} p={0}>
                              {caseStudies[activeIndex].quote}
                            </Text>
                            <Flex gap="8px" alignItems="center" mt="24px">
                              <Text as="p" size={16} color="blue-800" opacity={0.6}>
                                {caseStudies[activeIndex].author}
                              </Text>
                            </Flex>
                          </Testimonial>
                        </Column>
                      </Flex>
                    </AnimatedContent>
                  </Column>

                  <Column
                    gridColumn={{ _: 12, md: 6, lg: 4 }}
                    gridColumnStart={{ _: 1, md: 7, lg: 8 }}
                    position="relative"
                  >
                    <CaseStudyVisual aria-hidden $dotColor={csColor.dotColor}>
                      <BlurredBG $dotColor={csColor.dotColor} />
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
                    </CaseStudyVisual>

                    <Flex height="100%" flexDirection="column" justifyContent="center">
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
                    </Flex>
                  </Column>
                </Grid>
              </CaseStudy>
            </ClassicLayout>
          )}

          {isCarouselLayout && (
            <CarouselLayout>
              <CardsScroller>
                {caseStudies.map((cs, i) => (
                  <CarouselCard key={`card-${i}`} cs={cs} index={i} getSceneDefinition={getSceneDefinition} />
                ))}
              </CardsScroller>
            </CarouselLayout>
          )}
        </CaseStudiesWrapper>
      </Container>
    </Wrapper>
  );
};

export default SectionCaseStudies;
