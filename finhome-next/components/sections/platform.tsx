import { PLATFORM_SECTION } from "@/content/home";
import { img } from "@/lib/images";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/reveal";

// Display order differs from content order (left->right, top->bottom in the
// original). Reorder by index here without touching content/home.ts.
const ORDER = [0, 2, 4, 1, 3, 5];

export function Platform() {
  const features = ORDER.map((i) => PLATFORM_SECTION.features[i]);

  return (
    <section id="nentang" className="py-12 md:py-16">
      <Container>
        <Reveal>
          <h2 className="fh-h2 text-center max-w-2xl mx-auto">
            {PLATFORM_SECTION.title}
          </h2>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <Reveal key={feature.title} delay={(i % 3) * 0.08}>
              <div className="flex h-[268px] flex-col overflow-hidden rounded-2xl border border-black/[0.06] bg-gradient-to-b from-white to-[#eef7e8] p-6 transition-transform duration-300 hover:-translate-y-1">
                <h3 className="fh-h3 text-ink">{feature.title}</h3>
                <p className="fh-body mt-1.5">{feature.desc}</p>
                <div className="relative mt-auto flex flex-1 items-end justify-center pt-4">
                  <img
                    src={img(feature.image)}
                    alt={feature.title}
                    className="max-h-full w-auto max-w-full object-contain"
                  />
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
