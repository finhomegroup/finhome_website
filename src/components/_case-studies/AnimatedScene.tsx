import React, { useEffect, useState, useMemo, memo } from 'react';
import styled, { css } from 'styled-components';
import { Scene, SceneConfig } from './Scene';
import { useIntersectionTrigger } from '~/utils/useIntersectionTrigger';
import { sm, md } from '~/ds/mixins/breakpoints';

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
  hasTransfers?: boolean;
}

export type SceneLayout = SceneLayoutItem[];

interface AnimatedSceneProps {
  config: SceneConfig;
  layout: SceneLayout;
  mode?: 'enter' | 'exit';
  play?: boolean;
  forcePlay?: boolean; // Override intersection observer for carousel cards
  persistAfterEnter?: boolean; // If true, once enter animation plays, keep final state
}

const Stage = styled.div`
  z-index: 1;
  position: relative;
  isolation: isolate;
  top: calc(-50% + 30px);
  left: 50%;
  width: 0;
  height: 0;
  transform: scale(0.7);

  @media ${sm} {
    transform: scale(1);
  }

  @media ${md} {
    top: 0;
    transform: scale(1);
  }
`;

const CardWrapper = styled.div<{
  $tx: string;
  $ty: string;
  $scale?: number;
  $z?: number;
  $w?: string;
  $mode: 'enter' | 'exit';
}>`
  position: absolute;
  transform-origin: 0 center;
  top: 0;
  left: 0;
  width: ${({ $w }) => $w || 'auto'};
  z-index: ${({ $z }) => $z ?? 0};
  --tx: ${({ $tx }) => $tx};
  --ty: ${({ $ty }) => $ty};
  --scale: ${({ $scale }) => $scale ?? 1};
  --start-tx: 0px;
  --start-ty: 0px;
  --start-scale: 0.85;

  /* GPU acceleration and performance optimizations */
  .anim-target {
    will-change: transform, opacity;
    backface-visibility: hidden;
    perspective: 1000px;
    transform-style: preserve-3d;
    contain: layout style paint;
  }

  /* Enter state baseline */
  ${({ $mode }) =>
    $mode === 'enter' &&
    css`
      .anim-target {
        opacity: 0;
        transform-origin: center center;
        transform: scale3d(var(--start-scale, 0.85), var(--start-scale, 0.85), 1)
          translate3d(var(--start-tx, -50%), var(--start-ty, -50%), 0);
        transition:
          opacity 0.6s cubic-bezier(0.76, 0, 0.24, 1),
          transform 0.6s cubic-bezier(0.76, 0, 0.24, 1);
        transition-delay: var(--delay, 0s);
      }

      .scene.enter.play & .anim-target,
      .scene.enter.play.anim-target {
        opacity: 1;
        transform: scale3d(var(--scale, 1), var(--scale, 1), 1) translate3d(var(--tx), var(--ty), 0);
      }
    `}

  /* Exit state baseline */
  ${({ $mode }) =>
    $mode === 'exit' &&
    css`
      .anim-target {
        opacity: 1;
        transform-origin: center center;
        transform: scale3d(var(--scale, 1), var(--scale, 1), 1) translate3d(var(--tx), var(--ty), 0);
        transition:
          opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1),
          transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        transition-delay: var(--delay, 0s);
      }

      .scene.exit.play & .anim-target,
      .scene.exit.play.anim-target {
        opacity: 0;
        transform: scale3d(var(--start-scale, 0.85), var(--start-scale, 0.85), 1)
          translate3d(var(--start-tx, 0px), var(--start-ty, 0px), 0);
      }
    `}

  /* Elevation shadows based on z-index */
  ${({ $z }) =>
    $z === 0 &&
    css`
      .anim-target {
        filter: drop-shadow(0 2px 2px rgba(30, 30, 44, 0.15));
      }
    `}
  /* Elevation shadows based on z-index */
  ${({ $z }) =>
    $z === 1 &&
    css`
      .anim-target {
        filter: drop-shadow(12px 24px 24px rgba(30, 30, 44, 0.25));
      }
    `}
  ${({ $z }) =>
    $z === 2 &&
    css`
      .anim-target {
        filter: drop-shadow(24px 48px 48px rgba(30, 30, 44, 0.25));
      }
    `}
`;

// Memoized CardWrapper component to prevent unnecessary re-renders
const MemoizedCardWrapper = memo<{
  card: any;
  pos: SceneLayoutItem;
  index: number;
  mode: 'enter' | 'exit';
}>(({ card, pos, index, mode }) => {
  const cardWithVariant = useMemo(() => {
    return card.type === 'account' && (pos as any).hasTransfers !== undefined
      ? ({
          ...card,
          props: { ...card.props, hasTransfers: Boolean((pos as any).hasTransfers) },
        } as typeof card)
      : card;
  }, [card, pos]);

  const style = useMemo<React.CSSProperties>(
    () => ({
      ['--delay' as any]: `${pos.delay ?? 0}s`,
      ['--start-tx' as any]: pos.startTranslateX ?? '0px',
      ['--start-ty' as any]: pos.startTranslateY ?? '0px',
      ['--start-scale' as any]: pos.startScale !== undefined ? String(pos.startScale) : undefined,
    }),
    [pos.delay, pos.startTranslateX, pos.startTranslateY, pos.startScale]
  );

  const sceneConfig = useMemo(() => ({ cards: [cardWithVariant] }), [cardWithVariant]);

  return (
    <CardWrapper
      $tx={pos.translateX}
      $ty={pos.translateY}
      $scale={pos.scale}
      $z={pos.zIndex}
      $w={pos.width}
      $mode={mode}
      style={style}
    >
      <Scene config={sceneConfig} />
    </CardWrapper>
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

    const stageClass = useMemo(() => {
      return `scene ${mode}${playActive ? ' play' : ''}`;
    }, [mode, playActive]);

    // Memoize visible cards to prevent unnecessary recalculations
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

    // Safety check for undefined config
    if (!config || !config.cards) {
      return null;
    }

    return (
      <Stage className={stageClass}>
        <div ref={ref} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
        {visibleCards.map(({ card, pos, index }) => (
          <MemoizedCardWrapper key={`anim-${index}`} card={card} pos={pos} index={index} mode={mode} />
        ))}
      </Stage>
    );
  }
);

AnimatedScene.displayName = 'AnimatedScene';

export default AnimatedScene;
