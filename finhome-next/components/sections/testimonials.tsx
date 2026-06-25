"use client";

import { useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { TESTIMONIALS_SECTION } from "@/content/home";
import { img } from "@/lib/images";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/reveal";

export function Testimonials() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  return (
    <section className="py-16 md:py-24">
      <Container>
        <Reveal>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <h2 className="font-display text-3xl text-ink md:text-4xl">
                {TESTIMONIALS_SECTION.title}
              </h2>
              <p className="mt-4 text-ink-2">{TESTIMONIALS_SECTION.subtitle}</p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <button
                type="button"
                onClick={scrollPrev}
                aria-label="Trước"
                className="flex size-11 items-center justify-center rounded-full border border-ink-4/40 bg-white transition-colors hover:bg-ink/5"
              >
                <img
                  src={img(TESTIMONIALS_SECTION.arrows.left)}
                  alt=""
                  className="size-4"
                />
              </button>
              <button
                type="button"
                onClick={scrollNext}
                aria-label="Sau"
                className="flex size-11 items-center justify-center rounded-full border border-ink-4/40 bg-white transition-colors hover:bg-ink/5"
              >
                <img
                  src={img(TESTIMONIALS_SECTION.arrows.right)}
                  alt=""
                  className="size-4"
                />
              </button>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-12 overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {TESTIMONIALS_SECTION.items.map((item) => (
                <div
                  key={item.name}
                  className="flex-[0_0_100%] px-3 md:flex-[0_0_50%] lg:flex-[0_0_33.333%]"
                >
                  <figure className="flex h-full flex-col rounded-2xl border border-ink-4/30 bg-white p-6">
                    <blockquote className="flex-1 leading-relaxed text-ink">
                      {item.quote}
                    </blockquote>
                    <figcaption className="mt-6 flex items-center gap-3">
                      <img
                        src={img(item.avatar)}
                        alt={item.name}
                        className="size-12 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-medium text-ink">{item.name}</div>
                        <div className="text-sm text-ink-3">{item.role}</div>
                      </div>
                    </figcaption>
                  </figure>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
