import { TESTIMONIALS_SECTION } from "@/content/home";
import { img } from "@/lib/images";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/reveal";

const SUBTITLE_LINE1 = "Góc nhìn từ người dùng sau khi hiểu rõ hơn";
const SUBTITLE_LINE2 =
  "về khả năng tài chính và quyết định mua nhà với FinHome";

// 352px × 3 cards + 24px × 2 gaps = 1104px track width.
type Item = (typeof TESTIMONIALS_SECTION.items)[number];

function Card({
  item,
  ariaHidden,
  className,
}: {
  item: Item;
  ariaHidden?: boolean;
  className?: string;
}) {
  return (
    <div
      className={className ?? "w-[352px] shrink-0 pr-6"}
      aria-hidden={ariaHidden}
    >
      <figure className="flex h-full flex-col rounded-2xl bg-gradient-to-b from-white to-[#f3faf0] p-7 shadow-[0_1px_20px_rgba(0,0,0,0.05)]">
        <blockquote className="flex-1 text-left font-display-book text-base leading-relaxed text-ink-2">
          {item.quote}
        </blockquote>
        <figcaption className="mt-8 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src={img(item.avatar)}
              alt={item.name}
              className="size-11 shrink-0 rounded-full object-cover"
            />
            <div className="text-left">
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
  const half = [...items, ...items];
  const track = [...half, ...half];

  return (
    <section className="overflow-x-clip py-12 md:py-16">
      <Container className="max-w-[1104px]">
        <Reveal>
          <div className="text-center">
            <h2 className="fh-h2 text-ink">{TESTIMONIALS_SECTION.title}</h2>
            <p className="fh-lead mt-4">
              <span className="block">{SUBTITLE_LINE1}</span>
              <span className="block">{SUBTITLE_LINE2}</span>
            </p>
          </div>
        </Reveal>

        {/* Mobile: static stack — marquee cards clip awkwardly on narrow screens */}
        <Reveal delay={0.1} className="mt-10 flex flex-col gap-4 md:hidden">
          {items.map((item) => (
            <Card key={item.name} item={item} className="w-full" />
          ))}
        </Reveal>

        <Reveal delay={0.1} className="mt-10 hidden md:block">
          <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_4%,#000_96%,transparent)]">
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
      </Container>
    </section>
  );
}
