// Metadata contract for the calculator suite's <head>.
//
// Both halves of this file exist because of a real shipped defect, and both
// come from the same Next behaviour: `openGraph` is REPLACED by a child route,
// not merged field by field, while `alternates.canonical` is simply inherited
// when a route sets none.
//
//  1. `calculatorMetadata` used to set only type/url/title/description, so
//     every live calculator page shipped a share card with no image, no
//     og:site_name and no og:locale — the root layout's values were dropped the
//     moment the helper's own `openGraph` object existed.
//  2. The planned placeholder routes set NO canonical and NO openGraph, so
//     each one inherited the root layout's and declared the HOMEPAGE to be its
//     own canonical URL and og:url, next to a `noindex` directive. That route
//     is gone now that every registered slug is built — an empty
//     `generateStaticParams()` is what `output: "export"` rejects — so its
//     half of this file went with it. `registry.test.ts` fails loudly if a
//     `planned` entry is ever added again without restoring the route.
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
import { calculatorPath, liveCalculators } from "@/content/calculators/registry";
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
