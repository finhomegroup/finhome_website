import { HERO } from "@/content/home";
import { img } from "@/lib/images";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/reveal";

export function Hero() {
  return (
    <section
      id="trangchu"
      className="relative -mt-[87px] overflow-hidden bg-white pt-[119px] pb-0 lg:pt-[162px]"
    >
      {/* Hero background artwork (green gradient + concentric rings), from the Framer original.
          The source is a very wide, short band that sits across the top of the hero. */}
      <img
        src={img(HERO.images.marquee)}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[774px] w-full select-none object-cover object-center lg:h-[668px]"
      />

      <Container className="relative z-10">
        <div className="mx-auto flex w-full max-w-[1060px] flex-col items-center gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
          {/* LEFT COLUMN */}
          <div className="flex w-full flex-col items-start gap-3 pb-4 lg:w-auto lg:pb-24">
            <Reveal>
              <span className="fh-eyebrow">
                <BroadcastIcon />
                FinHome
              </span>
            </Reveal>

            <Reveal delay={0.08}>
              <h1 className="fh-h1 max-w-xl text-balance text-left">
                {HERO.headline}
              </h1>
            </Reveal>

            <Reveal delay={0.12}>
              <p className="fh-lead max-w-md text-left">{HERO.subhead}</p>
            </Reveal>

            <Reveal delay={0.16}>
              <img
                src={img(HERO.images.panel)}
                alt="Tải ứng dụng FinHome trên Google Play và App Store"
                className="h-auto w-[268px] max-w-full"
              />
            </Reveal>
          </div>

          {/* RIGHT COLUMN — phone mockup */}
          <Reveal delay={0.12} className="relative flex w-full justify-center lg:w-auto lg:shrink-0 lg:justify-end">
            <img
              src={img(HERO.images.phone)}
              alt="Ứng dụng FinHome"
              className="pointer-events-none mx-auto h-[378px] w-[329px] max-w-full select-none object-cover object-top sm:h-[420px] sm:w-[366px] lg:mx-0 lg:h-[500px] lg:w-[451px]"
            />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

function BroadcastIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="2" />
      <path d="M8.5 8.5a5 5 0 0 0 0 7" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      <path d="M5.5 5.5a9 9 0 0 0 0 13" />
      <path d="M18.5 5.5a9 9 0 0 1 0 13" />
    </svg>
  );
}
