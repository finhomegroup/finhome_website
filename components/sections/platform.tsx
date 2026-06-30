import { PLATFORM_SECTION } from "@/content/home";
import { img } from "@/lib/images";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/reveal";

type Feature = (typeof PLATFORM_SECTION.features)[number];

// Bento columns (left → right), measured from the Framer mirror @1440px.
const COLUMNS: [number, number][] = [
  [0, 1],
  [2, 3],
  [4, 5],
];

// Descriptions that break across two lines on the Framer original.
const DESC_LINES: Partial<Record<number, [string, string]>> = {
  0: ["AI phân tích để gợi ý dự án", "phù hợp hơn với bạn"],
  5: ["Biến kết quả tính toán thành nhận định", "dễ hiểu và dễ hành động"],
};

const titleBreak = PLATFORM_SECTION.title.indexOf(" cả ");
const titleLine1 =
  titleBreak === -1
    ? PLATFORM_SECTION.title
    : PLATFORM_SECTION.title.slice(0, titleBreak);
const titleLine2 =
  titleBreak === -1 ? null : PLATFORM_SECTION.title.slice(titleBreak + 1);

function FeatureDescription({ feature, index }: { feature: Feature; index: number }) {
  const lines = DESC_LINES[index];
  if (lines) {
    return (
      <p className="fh-body mt-1.5 max-w-[14.5rem]">
        {lines[0]}
        <br />
        {lines[1]}
      </p>
    );
  }
  return <p className="fh-body mt-1.5 max-w-[14.5rem]">{feature.desc}</p>;
}

function FeatureCard({
  feature,
  index,
  delay,
}: {
  feature: Feature;
  index: number;
  delay: number;
}) {
  return (
    <Reveal delay={delay}>
      <article className="relative w-full">
        <img
          src={img(feature.image)}
          alt=""
          aria-hidden="true"
          className="block w-full rounded-[20px]"
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 px-5 pt-4 md:px-11">
          <h3 className="fh-h3 text-ink">{feature.title}</h3>
          <FeatureDescription feature={feature} index={index} />
        </div>
      </article>
    </Reveal>
  );
}

export function Platform() {
  const { features } = PLATFORM_SECTION;

  return (
    <section id="nentang" className="py-12 md:py-16">
      <Container>
        <Reveal>
          <h2 className="fh-h2 mx-auto max-w-3xl text-center text-balance">
            {titleLine2 ? (
              <>
                <span className="block">{titleLine1}</span>
                <span className="block">{titleLine2}</span>
              </>
            ) : (
              titleLine1
            )}
          </h2>
        </Reveal>

        <div className="mx-auto mt-10 grid max-w-[1120px] grid-cols-1 gap-3 md:grid-cols-3">
          {COLUMNS.map((col, colIndex) => (
            <div key={colIndex} className="flex flex-col gap-3">
              {col.map((featureIndex, rowIndex) => (
                <FeatureCard
                  key={features[featureIndex].title}
                  feature={features[featureIndex]}
                  index={featureIndex}
                  delay={(colIndex + rowIndex) * 0.08}
                />
              ))}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
