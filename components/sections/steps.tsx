import { STEPS_SECTION } from "@/content/home";
import { CTA_HREF, CTA_HOVER_LABEL } from "@/content/site";
import { img } from "@/lib/images";
import { cn } from "@/lib/cn";
import { FH_CARD_IMAGE_ZOOM, FH_CARD_SHADOW } from "@/lib/interaction-styles";
import { Container } from "@/components/ui/container";
import { SectionFrame } from "@/components/ui/section-frame";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";

// Overlay positions from Framer mirror @1120×444.
const LEAD_OVERLAY = {
  titleTop: 47.41,
  bodyTop: 58.75,
  bodyWidth: 34.1,
} as const;

type Step = (typeof STEPS_SECTION.steps)[number];

// Framer "How it works" card @360×326 — illustration clipped in a 210px header.
function StepCard({ step, index, delay }: { step: Step; index: number; delay: number }) {
  const imageOffset = index === 0 ? -9 : 0;

  return (
    <Reveal delay={delay}>
      <article
        className={cn(
          "group overflow-hidden rounded-[20px] bg-white",
          FH_CARD_SHADOW,
        )}
      >
        <div className="h-[min(210px,22dvh)] overflow-hidden">
          <img
            src={img(step.icon)}
            alt=""
            aria-hidden="true"
            className={cn("block h-full w-full object-cover", FH_CARD_IMAGE_ZOOM)}
            style={imageOffset ? { marginTop: imageOffset } : undefined}
          />
        </div>
        <div className="px-5 pb-2.5 pt-5 md:pt-[29px]">
          <h3 className="fh-h3">{step.title}</h3>
          <p className="fh-body mt-2">{step.desc}</p>
        </div>
      </article>
    </Reveal>
  );
}

export function Steps() {
  return (
    <SectionFrame id="tinhnang">
      <Container>
        <Reveal>
          <h2 className="fh-h2 mx-auto max-w-2xl text-center text-balance">
            <span className="xl:hidden">
              {STEPS_SECTION.titleMobileLines.map((line) => (
                <span
                  key={line}
                  className="block max-sm:text-[25px] max-sm:leading-[1.1] sm:whitespace-nowrap"
                >
                  {line}
                </span>
              ))}
            </span>
            <span className="hidden xl:block">{STEPS_SECTION.title}</span>
          </h2>
        </Reveal>

        {/* Lead folder — desktop: artwork + text/CTA overlays; mobile: stacked flow */}
        <Reveal delay={0.1}>
          <div className="mx-auto w-full max-w-[1120px]">
            {/* Stacked layout below xl — Framer uses short copy until ~1200px */}
            <div className="flex flex-col items-center gap-6 text-center xl:hidden">
              <img
                src={img("W9DPNIyHaEmP2Cj7bG3UxiMbg.png")}
                alt=""
                aria-hidden="true"
                className="mx-auto block h-auto max-h-[min(280px,32dvh)] w-full select-none rounded-[20px] object-contain"
              />
              <div className="w-full">
                <p className="font-display text-xl font-medium leading-[1.2] text-ink">
                  {STEPS_SECTION.leadTitle}
                </p>
                <div className="mt-3 font-display-book text-base leading-[1.2] text-[#5c5c5c]">
                  {STEPS_SECTION.leadBodyMobileLines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
                <div className="mt-6 flex justify-center">
                  <Button
                    href={CTA_HREF}
                    size="lg"
                    hoverLabel={CTA_HOVER_LABEL}
                    className="rounded-[21px] px-5 py-2.5 shadow-none"
                  >
                    {STEPS_SECTION.cta}
                  </Button>
                </div>
              </div>
            </div>

            {/* Desktop xl+: Framer artwork with percentage-based overlays */}
            <div className="relative mx-auto hidden w-full max-h-[444px] xl:block">
              <img
                src={img("W9DPNIyHaEmP2Cj7bG3UxiMbg.png")}
                alt=""
                aria-hidden="true"
                className="block h-auto max-h-[444px] w-full select-none object-contain"
              />

              <div className="pointer-events-none absolute inset-0">
                <p
                  className="absolute left-1/2 w-full -translate-x-1/2 whitespace-nowrap text-center font-display text-[22px] font-medium leading-[1.2] text-ink"
                  style={{ top: `${LEAD_OVERLAY.titleTop}%` }}
                >
                  {STEPS_SECTION.leadTitle}
                </p>
                <div
                  className="absolute left-1/2 -translate-x-1/2 text-center font-display-book text-base leading-[1.2] text-[#5c5c5c]"
                  style={{
                    top: `${LEAD_OVERLAY.bodyTop}%`,
                    width: `${LEAD_OVERLAY.bodyWidth}%`,
                  }}
                >
                  {STEPS_SECTION.leadBodyLines.map((line) => (
                    <p key={line} className="whitespace-nowrap">
                      {line}
                    </p>
                  ))}
                </div>
              </div>

              <div className="absolute inset-x-0 bottom-[6.5%] z-10 flex justify-center">
                <Button
                  href={CTA_HREF}
                  size="lg"
                  hoverLabel={CTA_HOVER_LABEL}
                  className="rounded-[21px] px-5 py-2.5 shadow-none"
                >
                  {STEPS_SECTION.cta}
                </Button>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Three step cards — Framer "How it works" @360×326. */}
        <div className="mx-auto mt-8 grid max-w-[1120px] grid-cols-1 gap-6 md:mt-6 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
          {STEPS_SECTION.steps.map((step, i) => (
            <StepCard key={step.title} step={step} index={i} delay={0.1 * i} />
          ))}
        </div>
      </Container>
    </SectionFrame>
  );
}
