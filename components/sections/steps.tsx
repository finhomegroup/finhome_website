import { STEPS_SECTION } from "@/content/home";
import { CTA_HREF } from "@/content/site";
import { img } from "@/lib/images";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";

const LEAD_BODY_LINES = [
  "Nhập thông tin cơ bản, FinHome sẽ xác định",
  "vùng mua nhà an toàn, đánh giá khả năng vay",
  "và mở khóa la bàn định hướng tài chính cho bạn",
] as const;

const TITLE_LINE1 = "Các bước đơn giản để hiểu";
const TITLE_LINE2 = "khả năng mua nhà của bạn";

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
      <article className="overflow-hidden rounded-[20px] bg-white shadow-[0_1px_20px_rgba(0,0,0,0.05)]">
        <div className="h-[210px] overflow-hidden">
          <img
            src={img(step.icon)}
            alt=""
            aria-hidden="true"
            className="block w-full"
            style={imageOffset ? { marginTop: imageOffset } : undefined}
          />
        </div>
        <div className="px-5 pb-2.5 pt-[29px]">
          <h3 className="fh-h3">{step.title}</h3>
          <p className="fh-body mt-2">{step.desc}</p>
        </div>
      </article>
    </Reveal>
  );
}

export function Steps() {
  return (
    <section id="tinhnang" className="scroll-mt-32 py-12 md:py-16">
      <Container>
        <Reveal>
          <h2 className="fh-h2 mx-auto max-w-2xl text-center">
            <span className="block max-md:text-balance md:whitespace-nowrap">
              {TITLE_LINE1}
            </span>
            <span className="block">{TITLE_LINE2}</span>
          </h2>
        </Reveal>

        {/* Lead folder — artwork + text/CTA overlays (Framer #170hfxr @1120×444). */}
        <Reveal delay={0.1}>
          <div className="mx-auto w-full max-w-[1120px]">
            <div className="relative w-full">
              <img
                src={img("W9DPNIyHaEmP2Cj7bG3UxiMbg.png")}
                alt=""
                aria-hidden="true"
                className="block w-full select-none"
              />

              {/* Text overlay — pill frame is baked into the PNG. */}
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
                  {LEAD_BODY_LINES.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              </div>

              {/* CTA — Framer anchors 29px from artwork bottom (≈6.5%). */}
              <div className="absolute inset-x-0 bottom-[6.5%] z-10 flex justify-center">
                <Button
                  href={CTA_HREF}
                  size="lg"
                  className="rounded-[21px] px-5 py-2.5 shadow-none"
                >
                  {STEPS_SECTION.cta}
                </Button>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Three step cards — Framer "How it works" @360×326. */}
        <div className="mx-auto mt-14 grid max-w-[1120px] grid-cols-1 gap-8 md:mt-[33px] md:grid-cols-3 md:gap-6">
          {STEPS_SECTION.steps.map((step, i) => (
            <StepCard key={step.title} step={step} index={i} delay={0.1 * i} />
          ))}
        </div>
      </Container>
    </section>
  );
}
