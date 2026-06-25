import { HERO } from "@/content/home";
import { CTA_HREF } from "@/content/site";
import { Button } from "@/components/ui/button";
import { img } from "@/lib/images";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/reveal";

export function Hero() {
  return (
    <section
      id="trangchu"
      className="relative overflow-hidden bg-gradient-to-b from-white to-bg-soft pt-24 pb-0 md:pt-32"
    >
      <Container className="text-center">
        <Reveal>
          <h1 className="mx-auto max-w-4xl text-balance font-display text-3xl leading-[1.12] tracking-tight text-ink sm:text-4xl md:text-6xl">
            {HERO.headline}
          </h1>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-8 flex justify-center">
            <Button href={CTA_HREF} className="px-7 py-3 text-base">
              {HERO.cta}
            </Button>
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="relative mx-auto mt-14 flex max-w-md items-end justify-center">
            <img
              src={img(HERO.images.panel)}
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-4 left-1/2 w-[120%] max-w-none -translate-x-1/2 opacity-90"
            />
            <img
              src={img(HERO.images.phone)}
              alt="Ứng dụng FinHome"
              className="relative w-full max-w-md"
            />
          </div>
        </Reveal>
      </Container>

      <Reveal delay={0.1}>
        <div className="mt-12 w-full overflow-hidden md:mt-16">
          <img
            src={img(HERO.images.marquee)}
            alt=""
            aria-hidden="true"
            className="h-auto w-full min-w-[1200px] max-w-none object-cover"
          />
        </div>
      </Reveal>
    </section>
  );
}
