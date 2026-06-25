import { PLATFORM_SECTION } from "@/content/home";
import { img } from "@/lib/images";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/reveal";

export function Platform() {
  return (
    <section id="nentang" className="py-16 md:py-24">
      <Container>
        <Reveal>
          <h2 className="font-display text-3xl md:text-4xl text-ink text-center max-w-2xl mx-auto">
            {PLATFORM_SECTION.title}
          </h2>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {PLATFORM_SECTION.features.map((feature) => (
              <div
                key={feature.title}
                className="bg-bg-soft rounded-2xl p-5 transition-transform duration-300 hover:-translate-y-1"
              >
                <img
                  src={img(feature.image)}
                  alt={feature.title}
                  className="h-44 w-full rounded-xl object-cover"
                />
                <h3 className="font-medium text-ink mt-4">{feature.title}</h3>
                <p className="text-ink-2 text-sm mt-1">{feature.desc}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
