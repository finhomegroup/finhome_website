import { HERO } from "@/content/home";
import { img } from "@/lib/images";
import { Container } from "@/components/ui/container";
import { SectionFrame } from "@/components/ui/section-frame";
import { Reveal } from "@/components/reveal";

/**
 * Hero matches Framer `#trangchu`.
 * Phone (< md): 774px green band, stacked, phones on the wave.
 * iPad only (md–xl): full-viewport stacked layout (same composition as phone).
 * Desktop (xl+): side-by-side row with 668px green band.
 * @see https://finhomegroup.framer.website/
 */
export function Hero() {
  return (
    <SectionFrame
      id="trangchu"
      center={false}
      className="relative -mt-[87px] overflow-hidden bg-white pt-[119px] md:max-xl:h-dvh md:max-xl:max-h-dvh xl:pt-[162px]"
    >
      {/* Phone: fixed band. iPad: fill viewport. xl+: 668px band. */}
      <img
        src={img(HERO.images.marquee)}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[774px] w-full select-none object-cover object-center md:max-xl:h-[calc(50dvh_+_408px)] xl:h-[668px]"
      />

      <Container className="relative z-10 md:max-xl:flex md:max-xl:min-h-0 md:max-xl:flex-1 md:max-xl:flex-col">
        {/* Phone: band − padding. iPad: fill + vertically centered. xl: row. */}
        <div className="relative mx-auto h-[calc(774px-119px)] w-full max-w-[1060px] md:max-xl:flex md:max-xl:h-auto md:max-xl:min-h-0 md:max-xl:flex-1 md:max-xl:flex-col md:max-xl:justify-center md:max-xl:gap-8 xl:flex xl:h-auto xl:flex-none xl:flex-row xl:items-center xl:justify-between xl:gap-10">
          {/* Copy column — left on phone/desktop; centered on iPad to match phones */}
          <div className="relative z-10 flex w-full flex-col items-start gap-2 md:max-xl:items-center md:max-xl:text-center xl:w-auto xl:gap-3 xl:pb-24 xl:items-start xl:text-left">
            <Reveal>
              <span className="fh-eyebrow">
                <BroadcastIcon />
                FinHome
              </span>
            </Reveal>

            <Reveal delay={0.08}>
              <h1 className="fh-h1 max-w-xl text-balance text-left md:max-xl:text-center xl:text-left">
                {HERO.headline}
              </h1>
            </Reveal>

            <Reveal delay={0.12}>
              <p className="fh-lead max-w-md text-left md:max-xl:text-center xl:text-left">
                {HERO.subhead}
              </p>
            </Reveal>

            <Reveal delay={0.16}>
              <img
                src={img(HERO.images.panel)}
                alt="Tải ứng dụng FinHome trên Google Play và App Store"
                className="h-auto w-[268px] max-w-full"
              />
            </Reveal>
          </div>

          {/* RIGHT COLUMN — absolute to wave on phone; in-flow + centered from iPad up */}
          <Reveal
            delay={0.12}
            className="absolute inset-x-0 bottom-0 z-[1] flex justify-center md:static md:inset-auto md:z-auto xl:w-auto xl:shrink-0 xl:justify-end"
          >
            <img
              src={img(HERO.images.phone)}
              alt="Ứng dụng FinHome"
              className="pointer-events-none mx-auto h-auto w-[72vw] max-w-[300px] aspect-[329/378] select-none object-cover object-left-top xl:mx-0 xl:h-[500px] xl:w-[451px] xl:max-w-none xl:aspect-auto"
            />
          </Reveal>
        </div>
      </Container>
    </SectionFrame>
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
