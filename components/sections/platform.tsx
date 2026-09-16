import { PLATFORM_SECTION } from "@/content/home";
import { img } from "@/lib/images";
import { cn } from "@/lib/cn";
import { FH_CARD_IMAGE_ZOOM, FH_CARD_SHADOW } from "@/lib/interaction-styles";
import { Container } from "@/components/ui/container";
import { SectionFrame } from "@/components/ui/section-frame";
import { Reveal } from "@/components/reveal";

type Feature = (typeof PLATFORM_SECTION.features)[number];

// Bento columns (left → right), measured from the Framer mirror @1440px.
//
// THE PAIRINGS ARE LOAD-BEARING, not an arbitrary reading order. Measured at a
// 374px card width: the cards are 336, 220, 406, 151, 238 and 318 tall, and
// each pair here sums to the same number — 556, 557, 556. A tall card is
// deliberately matched with a short one so all three columns end level. Keep
// that property if these are ever reordered, and note that it is why the cards
// cannot be laid out as grid ROWS: a row would align to max(336, 406) and
// strand 70px of dead space inside the shorter card.
//
// THERE ARE THREE GROUPS AND THE GRID BELOW IS NOT ALWAYS THREE TRACKS WIDE.
// That mismatch was the bug: at `sm` the grid has two tracks, so this third
// group wrapped onto a second row, took the left cell and left the right cell
// empty — a measured 374x567 hole, with four cards stacked on the left against
// two on the right. Anything that changes this array's length has to be
// reconciled with the breakpoints on the grid, and
// `platform-bento.test.ts` is what keeps the two honest.
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
  className,
}: {
  feature: Feature;
  index: number;
  delay: number;
  /** Applied to the reveal wrapper — the flex child, not the card surface. */
  className?: string;
}) {
  return (
    <Reveal delay={delay} className={className}>
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
          {COLUMNS.map((col, colIndex) => {
            // Three groups do not divide into the two tracks `sm` provides, so
            // the last one is turned sideways there: it spans the row and lays
            // its own two cards out horizontally, which fills the cell that
            // used to be empty and keeps every card the same 374px width as
            // the ones above. At `lg` there is a third track for it and every
            // override below is reverted, leaving the Framer bento untouched.
            const spansRow = colIndex === COLUMNS.length - 1;

            return (
              <div
                key={colIndex}
                className={cn(
                  "flex flex-col gap-3",
                  spansRow &&
                    // `items-start` matters: without it the row stretches both
                    // cards to the taller one's height, and since the card
                    // surface is the image, the shadow would outline empty
                    // space below the shorter one.
                    "sm:col-span-2 sm:flex-row sm:items-start lg:col-span-1 lg:flex-col lg:items-stretch",
                )}
              >
                {col.map((featureIndex, rowIndex) => (
                  <FeatureCard
                    key={features[featureIndex].title}
                    feature={features[featureIndex]}
                    index={featureIndex}
                    delay={(colIndex + rowIndex) * 0.08}
                    // Half the row each once turned sideways. `flex-1` has to
                    // be dropped again at `lg`, where the group is a COLUMN
                    // and growing would stretch the cards vertically.
                    className={
                      spansRow ? "sm:min-w-0 sm:flex-1 lg:flex-none" : undefined
                    }
                  />
                ))}
              </div>
            );
          })}
        </div>
      </Container>
    </SectionFrame>
  );
}
