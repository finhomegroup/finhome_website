// Metadata contract for the calculator suite's <head>.
//
// Both halves of this file exist because of a real shipped defect, and both
// come from the same Next behaviour: `openGraph` is REPLACED by a child route,
// not merged field by field, while `alternates.canonical` is simply inherited
// when a route sets none.
//
//  1. `calculatorMetadata` used to set only type/url/title/description, so all
//     62 live calculator pages shipped a share card with no image, no
//     og:site_name and no og:locale — the root layout's values were dropped the
//     moment the helper's own `openGraph` object existed.
//  2. The 13 planned placeholder routes set NO canonical and NO openGraph, so
//     each one inherited the root layout's and declared the HOMEPAGE to be its
//     own canonical URL and og:url, next to a `noindex` directive.
//  3. `calculatorMetadata` set `openGraph` but no `twitter`, so every page it
//     drives shipped a per-page `og:title` beside the HOMEPAGE's
//     `twitter:title`. Next's openGraph -> twitter back-fill does not save
//     this: it only fills fields `twitter` lacks, and the root layout's
//     inherited `twitter` already has title, description and images.
//     out/cong-cu/quy-tac-72/index.html is the shipped evidence.
//
// No React is rendered here: both functions under test are pure and this runs
// in the suite's node environment with no jsdom.
import { describe, expect, it } from "vitest";
import { calculatorMetadata } from "@/components/calc/calculator-page";
import { generateMetadata } from "@/app/cong-cu/[slug]/page";
import {
  calculatorPath,
  liveCalculators,
  plannedCalculators,
} from "@/content/calculators/registry";
import { CALCULATOR_PLACEHOLDER as C } from "@/content/calculators/placeholder";
import { SITE } from "@/content/site";

describe("calculatorMetadata", () => {
  it("keeps twitter:title / twitter:description in step with og:title / og:description", () => {
    const meta = calculatorMetadata({
      slug: "quy-tac-72",
      metaTitle: "Quy tắc 72",
      metaDescription: "Bao lâu để tiền tăng gấp đôi.",
    });
    const og = meta.openGraph as Record<string, unknown>;
    const tw = meta.twitter as Record<string, unknown>;
    expect(tw.title).toBe(og.title);
    expect(tw.description).toBe(og.description);
    expect(tw.title).toBe("Quy tắc 72 — FinHome");
  });

  it("is self-canonical, with the trailing slash `trailingSlash: true` requires", () => {
    const meta = calculatorMetadata({
      slug: "quy-tac-72",
      metaTitle: "Quy tắc 72",
      metaDescription: "d",
    });
    const og = meta.openGraph as Record<string, unknown>;
    expect(meta.alternates?.canonical).toBe("/cong-cu/quy-tac-72/");
    expect(og.url).toBe("/cong-cu/quy-tac-72/");
    // Resolved against `metadataBase` by Next; asserted here so a change to
    // SITE.url or to canonicalPath cannot silently move the advertised URL.
    expect(
      new URL(String(meta.alternates?.canonical), SITE.url).toString(),
    ).toBe("https://www.finhome.group/cong-cu/quy-tac-72/");
  });

  it("holds for every live slug: canonical == og:url == that slug's own route", () => {
    for (const calc of liveCalculators()) {
      const meta = calculatorMetadata({
        slug: calc.slug,
        metaTitle: calc.title,
        metaDescription: calc.summary,
      });
      const og = meta.openGraph as Record<string, unknown>;
      const tw = meta.twitter as Record<string, unknown>;
      const own = `${calculatorPath(calc.slug)}/`;
      expect(meta.alternates?.canonical, calc.slug).toBe(own);
      expect(og.url, calc.slug).toBe(own);
      expect(tw.title, calc.slug).toBe(og.title);
      expect(tw.title, calc.slug).not.toBe(SITE.title);
    }
  });
});

describe("generateMetadata for the planned placeholder route", () => {
  it("gives every planned slug its OWN canonical and og:url, never the homepage", async () => {
    const planned = plannedCalculators();
    // Guard that the net covers something, without pinning the suite's size:
    // an exact count fails the deploy gate the day a calculator ships, which
    // is a false alarm about an unrelated change.
    expect(planned.length).toBeGreaterThan(0);
    for (const calc of planned) {
      const meta = await generateMetadata({
        params: Promise.resolve({ slug: calc.slug }),
      });
      const og = meta.openGraph as Record<string, unknown>;
      const own = `${calculatorPath(calc.slug)}/`;
      expect(meta.alternates?.canonical, calc.slug).toBe(own);
      expect(meta.alternates?.canonical, calc.slug).not.toBe("/");
      expect(og.url, calc.slug).toBe(own);
      expect(og.title, calc.slug).toBe(
        `${calc.title} — ${C.metaTitleSuffix} — ${SITE.name}`,
      );
      expect(og.description, calc.slug).toBe(calc.summary);
      expect(og.images, calc.slug).toEqual([
        { url: SITE.ogImage, width: 1200, height: 630, alt: SITE.name },
      ]);
      // The 13 placeholders go through the same helper, so their X card must
      // agree with their og tags rather than inheriting the homepage's.
      const tw = meta.twitter as Record<string, unknown>;
      expect(tw, calc.slug).toBeDefined();
      expect(tw.card, calc.slug).toBe("summary_large_image");
      expect(tw.title, calc.slug).toBe(og.title);
      expect(tw.description, calc.slug).toBe(calc.summary);
      expect(tw.images, calc.slug).toEqual([SITE.ogImage]);
      expect(tw.title, calc.slug).not.toBe(SITE.title);
      // A self-referential canonical does NOT make these pages indexable, and
      // they stay out of app/sitemap.ts, which maps liveCalculators() only.
      expect(meta.robots, calc.slug).toEqual({ index: false, follow: true });
      // <title> is unchanged by the switch to the shared helper: the root
      // layout's "%s — FinHome" template still appends the site name.
      expect(meta.title, calc.slug).toBe(
        `${calc.title} — ${C.metaTitleSuffix}`,
      );
    }
  });

  it("returns an empty object for an unregistered slug rather than inventing a canonical", async () => {
    await expect(
      generateMetadata({ params: Promise.resolve({ slug: "khong-ton-tai" }) }),
    ).resolves.toEqual({});
  });
});
