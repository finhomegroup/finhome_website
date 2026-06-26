import { STEPS_SECTION } from "@/content/home";
import { CTA_HREF } from "@/content/site";
import { img } from "@/lib/images";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";

export function Steps() {
  return (
    <section className="py-12 md:py-16">
      <Container>
        <Reveal>
          <h2 className="fh-h2 mx-auto max-w-3xl text-center">
            {STEPS_SECTION.title}
          </h2>
        </Reveal>

        {/* Card centered over the node-network artwork */}
        <Reveal delay={0.1}>
          <div className="relative mt-10 flex justify-center md:mt-14">
            <img
              src={img("jvkUqoHRnEVcOwyGhBPCxnUNU.png")}
              alt=""
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 w-[1100px] max-w-none -translate-x-1/2 -translate-y-1/2 select-none"
            />
            <div className="relative z-10 mx-auto w-full max-w-[520px] rounded-2xl border border-ink-4/30 bg-white px-8 py-9 text-center shadow-[0_20px_60px_-20px_rgba(0,0,0,0.12)]">
              <h3 className="fh-h3">{STEPS_SECTION.leadTitle}</h3>
              <p className="fh-body mx-auto mt-3 max-w-md text-center">
                {STEPS_SECTION.leadBody}
              </p>
              <div className="mt-6 flex justify-center">
                <Button href={CTA_HREF}>{STEPS_SECTION.cta}</Button>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Three illustration cards */}
        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3 md:mt-16">
          {STEPS_SECTION.steps.map((step, i) => (
            <Reveal key={step.title} delay={0.1 * i}>
              <div className="h-full rounded-2xl border border-ink-4/30 bg-white p-4">
                <img
                  src={img(step.icon)}
                  alt={step.title}
                  className="w-full rounded-xl"
                />
                <h3 className="fh-h3 mt-4 text-[17px]">{step.title}</h3>
                <p className="fh-body mt-2 text-sm">{step.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
