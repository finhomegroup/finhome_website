import { TESTIMONIALS_SECTION } from "@/content/home";
import { img } from "@/lib/images";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/reveal";

type Item = (typeof TESTIMONIALS_SECTION.items)[number];

function Card({ item, ariaHidden }: { item: Item; ariaHidden?: boolean }) {
  return (
    <div className="w-[340px] shrink-0 pr-5 sm:w-[400px]" aria-hidden={ariaHidden}>
      <figure className="flex h-full flex-col rounded-2xl border border-ink-4/20 bg-gradient-to-b from-[#f3faf0] to-white p-7">
        <blockquote className="fh-body flex-1 text-ink">{item.quote}</blockquote>
        <figcaption className="mt-8 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src={img(item.avatar)}
              alt={item.name}
              className="size-11 shrink-0 rounded-full object-cover"
            />
            <div>
              <div className="font-medium text-ink">{item.name}</div>
              <div className="text-sm text-ink-3">{item.role}</div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1 rounded-full bg-[#e7f6e2] px-3 py-1.5 text-sm font-medium text-brand-green">
            <span>5.0</span>
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
              className="size-3.5"
            >
              <path d="M12 2l2.9 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 7.1-1.01L12 2z" />
            </svg>
          </div>
        </figcaption>
      </figure>
    </div>
  );
}

export function Testimonials() {
  const items = TESTIMONIALS_SECTION.items;
  // Repeat enough times that each half of the track is wider than the viewport,
  // so the -50% loop never exposes a gap. The track is two identical halves
  // ([A B][A B]) → translating by -50% lands on identical content (seamless).
  const half = [...items, ...items];
  const track = [...half, ...half];

  return (
    <section className="py-12 md:py-16">
      <Container>
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="fh-h2 text-ink">{TESTIMONIALS_SECTION.title}</h2>
            <p className="fh-lead mx-auto mt-4 max-w-2xl">
              {TESTIMONIALS_SECTION.subtitle}
            </p>
          </div>
        </Reveal>
      </Container>

      {/* Infinite auto-scrolling marquee (pauses on hover, fades at the edges) */}
      <Reveal delay={0.1}>
        <div className="group mt-10 overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_5%,#000_95%,transparent)]">
          <div className="flex w-max [animation:marquee_45s_linear_infinite] group-hover:[animation-play-state:paused] motion-reduce:[animation:none]">
            {track.map((item, i) => (
              <Card
                key={`${item.name}-${i}`}
                item={item}
                ariaHidden={i >= items.length}
              />
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
