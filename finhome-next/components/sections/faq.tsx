import { FAQ_SECTION } from "@/content/home";
import { Accordion } from "@/components/ui/accordion";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/reveal";

export function Faq() {
  return (
    <section id="hotro" className="py-12 md:py-16">
      <Container>
        <Reveal>
          <div className="text-center">
            <h2 className="fh-h2">{FAQ_SECTION.title}</h2>
            <p className="fh-lead mx-auto mt-4 max-w-xl">
              {FAQ_SECTION.subtitle}
            </p>
          </div>
          <div className="mx-auto mt-10 max-w-[820px]">
            <Accordion items={FAQ_SECTION.items} />
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
