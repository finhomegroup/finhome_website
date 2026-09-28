import Link from "next/link";
import { HERO } from "@/content/home";
import { Container } from "@/components/ui/container";

/**
 * The photo's share of the hero's WIDTH, right-aligned, at every breakpoint.
 *
 * 80% puts the mirrored photo's left edge exactly at 20% — where the overlay
 * is still fully opaque, so there is no seam — and so the WHOLE 20→60% ramp
 * runs over the real photo, never green-on-green. The cost: the man's face
 * (46% into the mirrored photo) lands at 0,2 + 0,8 × 0,46 ≈ 56,8%, under ≈8%
 * green; the woman's (≈72%) is clear.
 */
export const HERO_PHOTO = { widthPct: 80 } as const;

/**
 * TABLET framing (`md` → `xl`, 768–1279 px): the desktop pattern — copy left,
 * photo right, the same ONE 20→60% overlay — with the photo scaled to at least
 * the FULL hero width and started at `startPct` (12%, still under solid ink).
 * The overflowing 12% is cropped off the MIRRORED RIGHT: wall and the woman's
 * far knee only. Why: a tablet row is relatively taller than a desktop one;
 * at 80% the natural photo (≈0,49 × width) is shorter than the copy and left
 * a green strip, and a plain `cover` that crops from the left pulls the man's
 * face into the ramp. Cropping from the right does the opposite: if the copy
 * makes the row taller, the photo grows and the man moves RIGHT (clearer).
 * At the minimum scale the man's face is at 58% (≈5% ink), the woman's 77%.
 */
export const HERO_TABLET = { startPct: 12 } as const;

/**
 * PHONE composition (below `md`), one pale portrait instead of a solid green
 * copy block: the section ground is `wall` (the `--color-hero-wall` token),
 * the SAME one 20→60% overlay runs over text and photo at `washOpacity`, the
 * copy is dark (brand-green-ink H1, ink-2 body) and the photo sits full width
 * below it, its top melting into the same wall colour. `cropLeftPct` (16%)
 * trims the mirrored LEFT — sun patch and bare wall only — so the couple
 * reads larger; the man's face gets ≈7% × 0,12 ≈ 0,9% ink, the woman none.
 */
export const HERO_PHONE = { wall: "#e8eee9", washOpacity: 0.12, cropLeftPct: 16 } as const;

/**
 * The user's overlay, in % of the HERO width: solid brand-green-ink to 20%,
 * then a LINEAR fall to transparent at 60% — 20: 1, 30: 0,75, 40: 0,5,
 * 50: 0,25, 60: 0. It visibly lightens from 20%, as asked. (Superseded: a
 * held `1 − smootherstep^7` curve that kept the copy on near-solid green and
 * looked like a 43→58% fade.)
 */
export const HERO_OVERLAY = { solidUntil: 20, clearAt: 60 } as const;

/**
 * Overlay alpha at `xPct` % of the hero width — the tested MODEL of the
 * native two-stop gradient below, which CSS interpolates linearly in alpha
 * (premultiplied, so the colour stays green while it fades).
 */
export function heroOverlayAlpha(xPct: number): number {
  const { solidUntil, clearAt } = HERO_OVERLAY;
  const t = Math.min(1, Math.max(0, (xPct - solidUntil) / (clearAt - solidUntil)));
  return 1 - t;
}

/** The native gradient: exactly solid to 20%, transparent at 60%. */
const OVERLAY_BACKGROUND = `linear-gradient(to right, var(--color-brand-green-ink) ${HERO_OVERLAY.solidUntil}%, transparent ${HERO_OVERLAY.clearAt}%)`;

/**
 * The homepage hero — IMMERSIVE PHOTO PREVIEW, proposed
 * (docs/homepage-photo-preview.md, "CURRENT").
 *
 * ONE horizontal overlay over the whole hero, at every width: brand-green-ink
 * solid to 20% of the hero width, transparent at 60% (the user's exact
 * boundaries), a native two-stop linear gradient.
 *
 * THE PHOTO (Pexels 7593053, 3805×2352, file unmodified) is CSS-mirrored at
 * every width so its empty wall faces the overlay, shown WHOLE at its natural
 * aspect, right-aligned at `HERO_PHOTO.widthPct` (80%) of the width, so it
 * sits behind the entire ramp. The same positions hold at 390 and 1920: the
 * man's face ≈56,8% (≈8% green), his left body from ≈47,2% (up to ≈32%),
 * the woman clear.
 *
 * - `xl`+: a one-cell GRID. The copy and the natural-ratio photo share that
 *   cell, so the row is as tall as the taller of the two: normally the
 *   photo, which is in flow (80% of the real content width, top-aligned,
 *   directly under the header). This replaced a `min-h-[49.5vw]`
 *   approximation that counted the scrollbar and left an ≈8 px strip of
 *   solid green under the photo at 1440. Tall-text fallback: if the copy is
 *   taller, the row grows and green shows BELOW the photo; no crop, no one
 *   moves. The copy crosses the ramp; see `TEXT_SHADOW`.
 * - `md` → `xl` (tablet): the SAME one-cell grid, copy left-aligned and
 *   narrower (20rem / 26rem, ending left of the man's body), the photo
 *   stretched to the row with `HERO_TABLET` framing. No vertical fade.
 * - Below `md` (phone): `HERO_PHONE`. At 390 px the copy spans ≈5–95% of the
 *   width, so the photo cannot sit BESIDE it without text on a face; it sits
 *   below, on one continuous pale ground under one continuous light wash.
 *
 * The hero sits below the homepage header (white shell around the pill);
 * `#trangchu` is the logo's target. The photo is decorative (`alt=""`).
 */
export function Hero() {
  return (
    <section
      id="trangchu"
      className="relative overflow-hidden bg-hero-wall text-ink md:grid md:grid-cols-1 md:bg-brand-green-ink md:text-white"
    >
      <Container className="relative z-20 pb-8 pt-10 md:col-start-1 md:row-start-1 md:self-center xl:py-16">
        <div className="max-w-[28rem] md:max-lg:max-w-[20rem] lg:max-xl:max-w-[26rem]">
          <h1 className={`fh-h1 text-balance !text-brand-green-ink md:!text-white ${TEXT_SHADOW}`}>{HERO.headline}</h1>
          <p className={`mt-4 font-display-book text-[17px] leading-relaxed text-ink-2 md:text-white xl:text-lg ${TEXT_SHADOW}`}>
            {HERO.subhead}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href={HERO.primaryCta.href}
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-cta px-6 font-display text-base font-medium text-white transition hover:bg-cta-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green-ink md:bg-white md:text-brand-green-ink md:hover:bg-bg-soft md:focus-visible:outline-white"
            >
              {HERO.primaryCta.label}
            </Link>
            <Link
              href={HERO.secondaryCta.href}
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-brand-green-ink bg-white px-6 font-display text-base font-medium text-brand-green-ink transition hover:bg-bg-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green-ink md:border-white md:bg-brand-green-ink/70 md:text-white md:hover:bg-cta md:focus-visible:outline-white"
            >
              {HERO.secondaryCta.label}
            </Link>
          </div>
          <p className={`mt-4 text-sm text-ink-2 md:text-white ${TEXT_SHADOW}`}>{HERO.reassurance}</p>
        </div>
      </Container>

      <div
        data-hero-photo="true"
        className="relative ml-auto w-full md:z-0 md:col-start-1 md:row-start-1 md:w-[80%] md:max-xl:w-[88%] md:max-xl:self-stretch xl:self-start"
      >
        <img
          src={HERO.photo}
          alt=""
          width={HERO.photoSource.width}
          height={HERO.photoSource.height}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="block h-auto w-full select-none -scale-x-100 max-md:aspect-[3196/2352] max-md:object-cover max-md:object-left md:max-xl:aspect-[3348/2352] md:max-xl:h-full md:max-xl:object-cover md:max-xl:object-right"
        />
        {/* Phone only: the photo's wall melts into the matching pale base; ends above the hair. */}
        <div
          aria-hidden="true"
          data-hero-fade="vertical"
          className="pointer-events-none absolute inset-x-0 top-0 h-[12%] bg-gradient-to-b from-hero-wall to-transparent md:hidden"
        />
      </div>

      {/* The one overlay: solid to 20%, clear at 60% of the hero width — a light wash on phone. */}
      <div
        aria-hidden="true"
        data-hero-fade="horizontal"
        className="pointer-events-none absolute inset-0 z-10 opacity-[0.12] md:opacity-100"
        style={{ backgroundImage: OVERLAY_BACKGROUND }}
      />
    </section>
  );
}
/**
 * White text over the thinning overlay reaches the pale wall from ≈30%. A
 * restrained glyph-local shadow (a soft dark edge plus a green halo) keeps it
 * readable WITHOUT a card or a broad underlay. It is not a contrast pass:
 * plain white-on-background there is ≈2,1–2,4:1 at 40–43% (estimated with
 * the wall at L≈0,84) — see the docs. From `md` only: the phone copy is dark
 * on the pale base and needs no shadow.
 */
const TEXT_SHADOW = "md:[text-shadow:0_1px_2px_rgb(0_0_0/0.35),0_0_18px_rgb(17_127_54/0.6)]";
