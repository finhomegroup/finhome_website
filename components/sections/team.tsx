"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react";
import { TEAM_SECTION } from "@/content/partners-team";
import { cn } from "@/lib/cn";
import { FH_POINTER } from "@/lib/interaction-styles";
import { Container } from "@/components/ui/container";
import { SectionFrame } from "@/components/ui/section-frame";
import { Reveal } from "@/components/reveal";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

// The 320px desktop width matches the measured default-slide rect (320×400 @
// 1440/768px, see task-1-measurements.md §2). Task 1 could not reliably
// capture per-slide pixel widths/gaps for this Framer filmstrip at other
// breakpoints (its caveat explicitly recommends re-deriving a responsive
// strategy here) — the 84vw/42vw widths and 16/24px gap below are this
// component's own mobile/tablet sizing, not a measurement, chosen so ~1
// slide (mobile) / ~2 slides (tablet) are visible with a "next slide" peek.
const SLIDE_WIDTH_CLASS =
  "w-[84vw] md:w-[42vw] [@media(min-width:1200px)]:w-[320px]";

const NO_SNAPS: number[] = [];

/** Mirrors Embla's internal selection state into React via useSyncExternalStore
 * (Embla is an external system; this avoids setState-in-effect entirely). */
function useEmblaSelection(emblaApi: UseEmblaCarouselType[1]) {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (!emblaApi) return () => {};
      emblaApi.on("select", onStoreChange);
      emblaApi.on("reInit", onStoreChange);
      return () => {
        emblaApi.off("select", onStoreChange);
        emblaApi.off("reInit", onStoreChange);
      };
    },
    [emblaApi],
  );

  const selectedIndex = useSyncExternalStore(
    subscribe,
    () => emblaApi?.selectedScrollSnap() ?? 0,
    () => 0,
  );
  const scrollSnaps = useSyncExternalStore(
    subscribe,
    () => emblaApi?.scrollSnapList() ?? NO_SNAPS,
    () => NO_SNAPS,
  );
  const canScrollPrev = useSyncExternalStore(
    subscribe,
    () => emblaApi?.canScrollPrev() ?? false,
    () => false,
  );
  const canScrollNext = useSyncExternalStore(
    subscribe,
    () => emblaApi?.canScrollNext() ?? false,
    () => false,
  );

  return { selectedIndex, scrollSnaps, canScrollPrev, canScrollNext };
}

function ChevronLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5">
      <path
        d="M15 5l-7 7 7 7"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5">
      <path
        d="M9 5l7 7-7 7"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowButton({
  direction,
  label,
  onClick,
  disabled,
}: {
  direction: "prev" | "next";
  label: string;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "flex size-11 shrink-0 items-center justify-center rounded-full bg-white text-ink shadow-[0_1px_20px_rgba(0,0,0,0.08)] transition-[opacity,box-shadow]",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green",
        disabled
          ? "cursor-not-allowed opacity-40"
          : cn(FH_POINTER, "hover:shadow-[0_4px_24px_rgba(0,0,0,0.14)]"),
      )}
    >
      {direction === "prev" ? <ChevronLeftIcon /> : <ChevronRightIcon />}
    </button>
  );
}

export function Team() {
  // `trimSnaps` drops unreachable trailing snaps when multiple portraits fit
  // in view, so the progress dots match how many positions you can actually
  // scroll to (not one phantom dot per portrait past the end).
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    loop: false,
  });
  const { selectedIndex, scrollSnaps, canScrollPrev, canScrollNext } =
    useEmblaSelection(emblaApi);
  const prefersReducedMotion = usePrefersReducedMotion();

  // Reduced motion: re-init with a near-zero snap duration so drag-release
  // settling loses its easing too, not just button/dot navigation.
  useEffect(() => {
    emblaApi?.reInit({ duration: prefersReducedMotion ? 1 : 25 });
  }, [emblaApi, prefersReducedMotion]);

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev(prefersReducedMotion);
  }, [emblaApi, prefersReducedMotion]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext(prefersReducedMotion);
  }, [emblaApi, prefersReducedMotion]);

  const scrollTo = useCallback(
    (index: number) => {
      emblaApi?.scrollTo(index, prefersReducedMotion);
    },
    [emblaApi, prefersReducedMotion],
  );

  return (
    <SectionFrame id="doingu">
      <Container>
        <Reveal>
          <div className="text-center">
            <h2 className="fh-h2 text-ink">{TEAM_SECTION.title}</h2>
            <p className="fh-lead mx-auto mt-4 max-w-2xl text-balance">
              {TEAM_SECTION.subtitle}
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="mt-6 md:mt-8">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-4 md:gap-6">
              {TEAM_SECTION.portraits.map((portrait) => (
                <div
                  key={portrait.src}
                  className={cn(
                    "relative shrink-0 overflow-hidden rounded-2xl bg-ink-4/10 aspect-[1234/1528] max-h-[min(400px,52dvh)]",
                    SLIDE_WIDTH_CLASS,
                  )}
                >
                  <img
                    src={portrait.src}
                    alt={portrait.alt}
                    width={portrait.width}
                    height={portrait.height}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {scrollSnaps.length > 1 && (
            <div className="mt-6 flex items-center justify-center gap-4">
              <ArrowButton
                direction="prev"
                label="Xem thành viên trước"
                onClick={scrollPrev}
                disabled={!canScrollPrev}
              />

              <div className="flex items-center gap-2">
                {scrollSnaps.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => scrollTo(index)}
                    aria-label={`Đến thành viên ${index + 1}`}
                    aria-current={index === selectedIndex}
                    className={cn(
                      // Painted dot stays 8px/11px; before:-inset-[18px] pads the
                      // clickable/tappable area out to >=44x44 without affecting
                      // layout (absolutely positioned, so siblings keep their gap-2).
                      "relative rounded-full transition-[width,height,background-color] before:absolute before:-inset-[18px] before:content-[''] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green",
                      FH_POINTER,
                      index === selectedIndex
                        ? "size-[11px] bg-brand-green"
                        : "size-2 bg-ink-4",
                    )}
                  />
                ))}
              </div>

              <ArrowButton
                direction="next"
                label="Xem thành viên tiếp theo"
                onClick={scrollNext}
                disabled={!canScrollNext}
              />
            </div>
          )}
        </Reveal>
      </Container>
    </SectionFrame>
  );
}
