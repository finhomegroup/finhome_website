import React, { useEffect, useState, useMemo, memo, useRef } from 'react';
import { Scene, SceneConfig } from './Scene';

export interface SceneLayoutItem {
  translateX: string;
  translateY: string;
  delay: number;
  scale?: number;
  zIndex?: number;
  width?: string;
  startTranslateX?: string;
  startTranslateY?: string;
  startScale?: number;
  hidden?: boolean;
  hasTransactions?: boolean;
}

export type SceneLayout = SceneLayoutItem[];

interface AnimatedSceneProps {
  config: SceneConfig;
  layout: SceneLayout;
  mode?: 'enter' | 'exit';
  play?: boolean;
  forcePlay?: boolean;
  persistAfterEnter?: boolean;
}

// Custom intersection observer hook
const useIntersectionTrigger = (options: {
  threshold?: number;
  triggerOnce?: boolean;
  resetWhenOutOfView?: boolean;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasTriggered(true);
          if (options.triggerOnce) {
            observer.disconnect();
          }
        } else if (options.resetWhenOutOfView) {
          setHasTriggered(false);
        }
      },
      { threshold: options.threshold || 0.3 }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [options.threshold, options.triggerOnce, options.resetWhenOutOfView]);

  return { ref, hasTriggered };
};

// Memoized CardWrapper component
const MemoizedCardWrapper = memo<{
  card: any;
  pos: SceneLayoutItem;
  index: number;
  mode: 'enter' | 'exit';
}>(({ card, pos, index, mode }) => {
  const cardWithVariant = useMemo(() => {
    return card.type === 'property' && (pos as any).hasTransactions !== undefined
      ? ({
          ...card,
          props: { ...card.props, hasTransactions: Boolean((pos as any).hasTransactions) },
        } as typeof card)
      : card;
  }, [card, pos]);

  const sceneConfig = useMemo(() => ({ cards: [cardWithVariant] }), [cardWithVariant]);

  const getDropShadow = (z?: number) => {
    if (z === 0) return 'drop-shadow-[0_2px_2px_rgba(30,30,44,0.15)]';
    if (z === 1) return 'drop-shadow-[12px_24px_24px_rgba(30,30,44,0.25)]';
    if (z === 2) return 'drop-shadow-[24px_48px_48px_rgba(30,30,44,0.25)]';
    return '';
  };

  return (
    <div
      className={`absolute top-0 left-0 ${pos.width ? '' : 'w-auto'} ${getDropShadow(pos.zIndex)}`}
      style={{
        transformOrigin: '0 center',
        zIndex: pos.zIndex ?? 0,
        width: pos.width || 'auto',
        ['--tx' as any]: pos.translateX,
        ['--ty' as any]: pos.translateY,
        ['--scale' as any]: pos.scale ?? 1,
        ['--start-tx' as any]: pos.startTranslateX ?? '0px',
        ['--start-ty' as any]: pos.startTranslateY ?? '0px',
        ['--start-scale' as any]: pos.startScale !== undefined ? String(pos.startScale) : '0.85',
        ['--delay' as any]: `${pos.delay ?? 0}s`,
      }}
    >
      <Scene config={sceneConfig} />
    </div>
  );
});

MemoizedCardWrapper.displayName = 'MemoizedCardWrapper';

export const AnimatedScene: React.FC<AnimatedSceneProps> = memo(
  ({ config, layout, mode = 'enter', play = true, forcePlay = false, persistAfterEnter = false }) => {
    const { ref, hasTriggered } = useIntersectionTrigger({
      threshold: 0.3,
      triggerOnce: true,
      resetWhenOutOfView: !persistAfterEnter,
    });
    const [armed, setArmed] = useState(false);
    const [hasPlayedOnce, setHasPlayedOnce] = useState(false);

    useEffect(() => {
      const raf = requestAnimationFrame(() => setArmed(true));
      return () => cancelAnimationFrame(raf);
    }, [config, layout, mode]);

    const shouldPlay = useMemo(() => {
      if (forcePlay) {
        return play && armed;
      }
      return mode === 'exit' ? play && armed : hasTriggered && play && armed;
    }, [mode, play, armed, hasTriggered, forcePlay]);

    useEffect(() => {
      if (persistAfterEnter && mode === 'enter' && shouldPlay) {
        setHasPlayedOnce(true);
      }
    }, [persistAfterEnter, mode, shouldPlay]);

    const playActive = useMemo(() => {
      if (persistAfterEnter && hasPlayedOnce) return true;
      return shouldPlay;
    }, [persistAfterEnter, hasPlayedOnce, shouldPlay]);

    const visibleCards = useMemo(() => {
      if (!config || !config.cards) return [];

      return config.cards
        .map((card, index) => {
          const pos = layout?.[index] ?? { translateX: '0px', translateY: '0px', delay: 0.1 * index };
          if ((pos as any).hidden) return null;
          return { card, pos, index };
        })
        .filter(Boolean) as Array<{ card: any; pos: SceneLayoutItem; index: number }>;
    }, [config, layout]);

    if (!config || !config.cards) {
      return null;
    }

    return (
      <div 
        className={`relative isolate top-[calc(-50%+30px)] left-1/2 w-0 h-0 scale-[0.7] sm:scale-100 md:top-0 md:scale-100 z-[1] scene ${mode} ${playActive ? 'play' : ''}`}
      >
        <div ref={ref} className="absolute inset-0 pointer-events-none" />
        {visibleCards.map(({ card, pos, index }) => (
          <MemoizedCardWrapper key={`anim-${index}`} card={card} pos={pos} index={index} mode={mode} />
        ))}
        
        <style jsx>{`
          .scene .anim-target {
            will-change: transform, opacity;
            backface-visibility: hidden;
            perspective: 1000px;
            transform-style: preserve-3d;
            contain: layout style paint;
          }

          /* Enter animation */
          .scene.enter .anim-target {
            opacity: 0;
            transform-origin: center center;
            transform: scale3d(var(--start-scale, 0.85), var(--start-scale, 0.85), 1)
              translate3d(var(--start-tx, -50%), var(--start-ty, -50%), 0);
            transition: opacity 0.6s cubic-bezier(0.76, 0, 0.24, 1),
                        transform 0.6s cubic-bezier(0.76, 0, 0.24, 1);
            transition-delay: var(--delay, 0s);
          }

          .scene.enter.play .anim-target {
            opacity: 1;
            transform: scale3d(var(--scale, 1), var(--scale, 1), 1) 
                      translate3d(var(--tx), var(--ty), 0);
          }

          /* Exit animation */
          .scene.exit .anim-target {
            opacity: 1;
            transform-origin: center center;
            transform: scale3d(var(--scale, 1), var(--scale, 1), 1) 
                      translate3d(var(--tx), var(--ty), 0);
            transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1),
                        transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            transition-delay: var(--delay, 0s);
          }

          .scene.exit.play .anim-target {
            opacity: 0;
            transform: scale3d(var(--start-scale, 0.85), var(--start-scale, 0.85), 1)
                      translate3d(var(--start-tx, 0px), var(--start-ty, 0px), 0);
          }
        `}</style>
      </div>
    );
  }
);

AnimatedScene.displayName = 'AnimatedScene';

export default AnimatedScene;

