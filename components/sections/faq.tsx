import { FAQ_SECTION } from "@/content/home";
import { Accordion } from "@/components/ui/accordion";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/reveal";

const SUBTITLE_LINE1 = "Những thông tin cần thiết";
const SUBTITLE_LINE2 = "giúp bạn hiểu rõ FinHome trước khi trải nghiệm";

export function Faq() {
  return (
    <section id="hotro" className="py-12 md:py-[50px]">
      <Container className="max-w-[1104px]">
        <Reveal>
          <div className="text-center">
            <h2 className="fh-h2 text-ink">{FAQ_SECTION.title}</h2>
            <p className="fh-lead mt-4">
              <span className="block">{SUBTITLE_LINE1}</span>
              <span className="block">{SUBTITLE_LINE2}</span>
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-[800px]">
            <Accordion items={FAQ_SECTION.items} />
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
