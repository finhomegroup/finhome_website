import { STEPS_SECTION } from "@/content/home";
import { CTA_HREF } from "@/content/site";
import { img } from "@/lib/images";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";

export function Steps() {
  return (
    <section className="py-16 md:py-24">
      <Container>
        <Reveal>
          <h2 className="mx-auto max-w-3xl text-center font-display text-3xl text-ink md:text-4xl">
            {STEPS_SECTION.title}
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-12 rounded-3xl bg-bg-soft p-8 md:p-10">
            <h3 className="font-display text-2xl text-ink md:text-3xl">
              {STEPS_SECTION.leadTitle}
            </h3>
            <p className="mt-4 max-w-2xl text-ink-2">
              {STEPS_SECTION.leadBody}
            </p>
            <div className="mt-6">
              <Button href={CTA_HREF}>{STEPS_SECTION.cta}</Button>
            </div>
          </div>
        </Reveal>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {STEPS_SECTION.steps.map((step, i) => (
            <Reveal key={step.title} delay={0.1 * i}>
              <div className="h-full rounded-2xl bg-bg-soft p-6">
                <img
                  src={img(step.icon)}
                  alt={step.title}
                  className="w-full rounded-2xl"
                />
                <h4 className="mt-5 font-medium text-ink">{step.title}</h4>
                <p className="mt-2 text-ink-2">{step.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
