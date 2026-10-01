import Link from "next/link";
import { ArrowRightIcon } from "@/components/education/icons";
import { EDUCATION_COLLECTION as C } from "@/content/education/collection";
import type { EducationChapter } from "@/content/education/chapters";
import { calculatorPath } from "@/content/calculators/registry";
import { collectionHero, webHeroSrcSet } from "@/content/education-web-heroes";
import { cn } from "@/lib/cn";
import { FH_LINK_ARROW, FH_POINTER } from "@/lib/interaction-styles";

/** Focus ring for links on the green block, where brand-green would vanish. */
const FOCUS_ON_GREEN =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

/**
 * Desktop overlay, in % of the HERO width (homepage architecture,
 * `components/sections/hero.tsx`): one horizontal gradient over the whole
 * hero, `--color-brand-green-ink` solid to `solidUntil`, linear to
 * transparent at `clearAt`.
 *
 * WHY (user-reported seam, 2026-10-01): the green block was the section
 * background and the photo box carried its own 14% wash starting at a
 * hardcoded hex. Where the two layers met, at the photo box's fractional-pixel
 * left edge (36%), the photo's anti-aliased edge showed as a thin vertical
 * line, and the steep ramp let the wall's skirting line read low in the fade.
 * Now the photo edge (`photoStart`) lies inside the opaque zone, so no edge
 * can show, and the ramp is ~1.5× wider.
 *
 * `clearAt` is set from the image, not copied from the homepage's 20/60. The
 * AI illustration 03 (2026-10-01) is shown MIRRORED (no text in frame): in
 * mirrored coordinates the leftmost face (the man's hair, ≈37% of the source
 * width) lands at ≈57% of the hero at 1024px, ≈58–59% at 1280 and ≈59% at
 * 1440, so both faces are past the ramp; only the man's shoulder (≈30%)
 * reaches the ramp's last, nearly clear part. Modelled in
 * collection-hero.test.ts. `textEnd` is the text column's width: all copy
 * sits on solid green.
 */
export const COLLECTION_HERO_OVERLAY = { photoStart: 36, solidUntil: 40, clearAt: 56, textEnd: 40 } as const;

const OVERLAY_BACKGROUND = `linear-gradient(to right, var(--color-brand-green-ink) ${COLLECTION_HERO_OVERLAY.solidUntil}%, transparent ${COLLECTION_HERO_OVERLAY.clearAt}%)`;

/**
 * The collection hero, in the social posters' pattern: the page's own title
 * as live HTML on a solid brand-green-ink block (contrast held by the solid
 * colour, never by the photo), the photograph beside it.
 *
 * CROP, CSS only, from the image's own composition (AI illustration 03,
 * content/education-web-heroes.ts), described in MIRRORED coordinates: the
 * man's face sits near 37–43% of the width, the woman's near 70–74%, heads at
 * 12–30% of the height, the woman's back reaches ≈86%.
 *
 * - From `lg` the whole frame shows (object-cover in a box close to 3:2,
 *   focal 50% 30%) at the right 64% of the hero, under ONE full-hero overlay
 *   (see `COLLECTION_HERO_OVERLAY`), as on the homepage hero.
 * - Below `lg` the image stacks ABOVE the text in a 3:2 box — the frame's own
 *   ratio — so the WHOLE mirrored frame shows: no zoom, no negative offset,
 *   both complete heads with the frame's own headroom (heads start ≈12% down).
 *   (2026-10-01: a 143% zoom at −31%/−10% cropped both heads at 390 px.)
 *   Nothing is drawn over it, and the tagline moves into the text block.
 *
 * The reading font is the page's Inter 400/700; no class asks for 500/600.
 */
export function CollectionHero({ start }: { start: EducationChapter }) {
  const H = C.hero;
  const image = collectionHero();
  const [, medium, large] = image.sources;
  return (
    <section
      aria-labelledby="bo-bai-tieu-de"
      data-collection-hero="true"
      className="relative mt-2 overflow-hidden rounded-[28px] bg-brand-green-ink text-white lg:min-h-[480px] xl:min-h-[520px]"
    >
      <div
        data-hero-photo="true"
        className="relative aspect-[3/2] overflow-hidden lg:absolute lg:inset-y-0 lg:right-0 lg:aspect-auto lg:w-[64%]"
      >
        <img
          src={medium.src}
          srcSet={webHeroSrcSet(image)}
          sizes="(min-width: 1024px) 64vw, 100vw"
          width={large.width}
          height={large.height}
          alt={image.alt}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full -scale-x-100 select-none lg:object-cover lg:object-[50%_30%]"
        />
      </div>

      {/* The one overlay, over the WHOLE hero (desktop only; on a phone the
          photo stacks above the text and nothing is drawn over it). */}
      <div
        aria-hidden="true"
        data-hero-overlay="true"
        className="pointer-events-none absolute inset-0 hidden lg:block"
        style={{ backgroundImage: OVERLAY_BACKGROUND }}
      />
      <span className="absolute bottom-3 right-3 hidden rounded bg-black/70 px-2 py-1 text-xs leading-none text-white lg:block">
        {H.photo.label}
      </span>

      <div className="relative px-6 pb-7 pt-6 sm:px-10 sm:pb-9 lg:w-[40%] lg:py-12 lg:pl-12 lg:pr-4 xl:py-14 xl:pl-14">
        <p className="flex items-center gap-2 text-sm font-bold">
          <span aria-hidden="true" className="size-2 rounded-full bg-brand-lime" />
          {H.eyebrow}
        </p>
        <h1
          id="bo-bai-tieu-de"
          className="mt-3 text-[36px] font-bold leading-[1.05] tracking-[-0.03em] sm:text-[44px] lg:text-[44px] xl:text-[56px]"
        >
          {C.pageTitle}
        </h1>
        <p className="mt-3 text-[17px] leading-snug md:text-xl">{C.lede}</p>
        <p className="mt-2 max-w-[30rem] text-[15px] leading-relaxed">{H.body}</p>

        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
          <a
            href={`#${start.anchor}`}
            className={cn(
              "inline-flex min-h-12 items-center rounded-full bg-white px-6 text-base font-bold text-brand-green-ink transition-opacity hover:opacity-90",
              FH_POINTER,
              FOCUS_ON_GREEN,
            )}
          >
            {H.startCta}
            <span className="sr-only">: {start.title}</span>
          </a>
          <Link
            href={`${calculatorPath("kha-nang-mua-nha")}/`}
            className={cn(
              "group/link inline-flex min-h-11 items-center gap-2 text-base font-bold text-white",
              FH_POINTER,
              FOCUS_ON_GREEN,
            )}
          >
            {H.toolCta}
            <ArrowRightIcon className={cn("size-[18px]", FH_LINK_ARROW)} />
          </Link>
        </div>
        <p className="mt-5 text-[13px] leading-snug">
          <span className="lg:hidden">{H.photo.label}. </span>
          {H.photo.note}
        </p>
      </div>
    </section>
  );
}
