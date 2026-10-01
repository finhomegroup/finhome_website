import { cn } from "@/lib/cn";
import { WEB_HERO_TAGLINE, webHeroSrcSet, type EducationWebHero } from "@/content/education-web-heroes";

/**
 * A guide's page hero: the labelled AI illustration across the article column
 * (max-w-3xl, 48rem), directly under the title, meta line and the header's
 * "Tính với số của tôi" button, and before the Markdown body. Only that
 * heading block and the tool action precede it — the guide's first answer
 * paragraph comes after the image.
 *
 * 16:9 box over the 3:2 frame: only height is cropped, at the hero's own
 * `focal`, so no face is cut at 390 px either. A plain <img>: the static export
 * has no image loader. Eager and high priority — it is the page's largest
 * early image.
 */
export function GuideHero({ hero }: { hero: EducationWebHero }) {
  const [, medium, large] = hero.sources;
  return (
    <figure data-guide-hero="true" className="mx-auto mt-8 max-w-3xl">
      <div className="overflow-hidden rounded-3xl">
        <img
          src={medium.src}
          srcSet={webHeroSrcSet(hero)}
          sizes="(min-width: 768px) 48rem, 100vw"
          width={large.width}
          height={large.height}
          alt={hero.alt}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className={cn("block aspect-[16/9] w-full object-cover", hero.mirror && "-scale-x-100")}
          style={{ objectPosition: hero.focal }}
        />
      </div>
      <figcaption className="mt-2 text-xs text-ink-3">{WEB_HERO_TAGLINE}</figcaption>
    </figure>
  );
}

/**
 * A collection article's opening figure: the same full-column treatment as
 * C05/C11's approved illustration (`layout: "full"` in education-article.tsx)
 * — natural 3:2, no crop, one small tagline — placed after the short answer
 * and its early tool link so neither is pushed down. Not lazy: it is near the
 * top of the page.
 */
export function ArticleHero({ hero }: { hero: EducationWebHero }) {
  const [small, , large] = hero.sources;
  return (
    <figure data-article-hero="true" className="w-full">
      <img
        src={small.src}
        srcSet={webHeroSrcSet(hero)}
        sizes="(min-width: 768px) 48rem, 100vw"
        width={large.width}
        height={large.height}
        alt={hero.alt}
        decoding="async"
        className={cn("block h-auto w-full rounded-xl border border-ink-4/15", hero.mirror && "-scale-x-100")}
      />
      <figcaption className="mt-2 text-xs text-ink-3">{WEB_HERO_TAGLINE}</figcaption>
    </figure>
  );
}

/**
 * The same illustration as a discovery thumbnail (the /blog/ guide block and
 * related guide cards). Decorative there — the card's title is the link text —
 * so `alt=""`. The box's aspect comes from the caller; `focal` keeps heads in.
 */
export function WebHeroThumb({
  hero,
  sizes,
  className,
}: {
  hero: EducationWebHero;
  sizes: string;
  className?: string;
}) {
  const [small, , large] = hero.sources;
  return (
    <img
      src={small.src}
      srcSet={webHeroSrcSet(hero)}
      sizes={sizes}
      width={large.width}
      height={large.height}
      alt=""
      loading="lazy"
      decoding="async"
      className={cn("object-cover", hero.mirror && "-scale-x-100", className)}
      style={{ objectPosition: hero.focal }}
    />
  );
}
