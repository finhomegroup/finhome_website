import { PLATFORM_SECTION } from "@/content/home";
import { img } from "@/lib/images";
import { cn } from "@/lib/cn";
import { FH_CARD_IMAGE_ZOOM, FH_CARD_SHADOW } from "@/lib/interaction-styles";
import { Container } from "@/components/ui/container";
import { SectionFrame } from "@/components/ui/section-frame";
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
      <article
        className={cn(
          "group relative w-full overflow-hidden rounded-[20px]",
          FH_CARD_SHADOW,
        )}
      >
        <img
          src={img(feature.image)}
          alt=""
          aria-hidden="true"
          className={cn("block w-full rounded-[20px]", FH_CARD_IMAGE_ZOOM)}
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 px-5 pt-4 lg:px-11">
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
    <SectionFrame id="nentang">
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

        <div className="mx-auto mt-6 grid max-w-[1120px] grid-cols-1 gap-3 sm:grid-cols-2 lg:mt-8 lg:grid-cols-3">
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
    </SectionFrame>
  );
}
