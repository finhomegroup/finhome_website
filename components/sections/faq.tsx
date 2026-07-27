import { FAQ_SECTION } from "@/content/home";
import { Accordion } from "@/components/ui/accordion";
import { Container } from "@/components/ui/container";
import { SectionFrame } from "@/components/ui/section-frame";
import { Reveal } from "@/components/reveal";
import { Signup } from "@/components/sections/signup";

const SUBTITLE_LINE1 = "Những thông tin cần thiết";
const SUBTITLE_LINE2 = "giúp bạn hiểu rõ FinHome trước khi trải nghiệm";

/** FAQ + signup share one homepage viewport (`#hotro`; signup keeps `#dangky`). */
export function Faq() {
  return (
    <SectionFrame id="hotro">
      <Container className="max-w-[1104px]">
        <Reveal>
          <div className="text-center">
            <h2 className="fh-h2 text-ink">{FAQ_SECTION.title}</h2>
            <p className="fh-lead mx-auto mt-2 max-w-2xl text-balance text-[15px] leading-snug md:text-base">
              <span className="inline lg:block">{SUBTITLE_LINE1}{" "}</span>
              <span className="inline lg:block">{SUBTITLE_LINE2}</span>
            </p>
          </div>

          <div className="mx-auto mt-4 max-w-[800px]">
            <Accordion items={FAQ_SECTION.items} />
          </div>
        </Reveal>

        <div className="mt-6 md:mt-7">
          <Signup />
        </div>
      </Container>
    </SectionFrame>
  );
}
