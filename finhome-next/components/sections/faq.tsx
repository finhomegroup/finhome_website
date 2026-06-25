import { FAQ_SECTION } from "@/content/home";
import { Accordion } from "@/components/ui/accordion";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/reveal";

export function Faq() {
  return (
    <section id="hotro" className="py-16 md:py-24">
      <Container>
        <Reveal>
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="lg:pt-2">
              <h2 className="font-display text-3xl text-ink md:text-4xl">
                {FAQ_SECTION.title}
              </h2>
              <p className="mt-4 max-w-md text-ink-2">{FAQ_SECTION.subtitle}</p>
            </div>
            <div>
              <Accordion items={FAQ_SECTION.items} />
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
