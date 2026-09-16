/**
 * Rendered-markup contracts for the three United States Social Security
 * routes — plan rows 53, 54 and 55.
 *
 * `/cong-cu/uoc-tinh-an-sinh-xa-hoi/`, `/cong-cu/phan-tich-an-sinh-xa-hoi/`
 * and `/cong-cu/chi-tra-an-sinh-xa-hoi/`.
 *
 * WHY A RENDER TEST. docs §6 records that three of this suite's five worst
 * defects were invisible to a green run because they lived in a COMPONENT
 * rather than in a module, and the defect this file exists for is exactly
 * that shape: all three tables shipped without `mobileCards`, which is a prop
 * on a component and appears in no content module and no engine.
 *
 * THE MEASUREMENT, from an independent browser review at a verified 390x844
 * viewport (`innerWidth` 390, DPR 2). On the six-column analysis table the
 * `<table>` measured `scrollWidth` 596 px inside the 300 px `overflow-x-auto`
 * frame — a ratio of 1,99, so two screens of sideways travel — with header
 * widths 136 / 92 / 56 / 112 / 112 / 88 and a 69 px `thead`.
 * `documentElement.scrollWidth` stayed 390, so the page itself never
 * overflowed: the scroll was contained exactly as `result-table.tsx` intends.
 *
 * Containment was not the problem. Only THREE of the six columns were on
 * screen, and the three that were off to the right — "Tổng danh nghĩa",
 * "Giá trị hiện tại", "Hòa vốn so với 62" — are the three the page exists to
 * compare, while the paragraph immediately below the table explains the
 * comparison between two of them as though the reader could see both. The
 * page's lesson was invisible at the viewport most readers use.
 *
 * WHY NOT SHORTER HEADERS. Six numeric columns do not fit 300 px at any label
 * length, so shortening cannot fix it — and "Tổng danh nghĩa" versus "Giá trị
 * hiện tại" carries the nominal-versus-present-value distinction that IS the
 * lesson. The card layout is what removes the pressure, because it gives each
 * label its own line.
 *
 * What this file CANNOT check is appearance. Nothing here may be reported as
 * a visual check; the 390 px figures above are the browser review's, quoted.
 */
import { describe, expect, it } from "vitest";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { markupRegion } from "@/lib/markup-region";
import { UsSocialSecurityEstimateCalculator } from "@/components/us-social-security-estimate-calculator";
import { UsSocialSecurityAnalysisCalculator } from "@/components/us-social-security-analysis-calculator";
import { UsSocialSecurityPayoutCalculator } from "@/components/us-social-security-payout-calculator";

/**
 * The column count from which a table must fall back to cards.
 *
 * docs §3, verbatim: "Set it from five columns up; four fit at 390 px
 * compacted." Taken as a CONSTANT here rather than restated per route, so a
 * seventh column added to any of the three is checked by the same bound and a
 * revision to the rule moves one line.
 */
const MOBILE_CARD_MIN_COLUMNS = 5;

/** The card list `ResultTable` renders below `md`. Unique to that branch. */
const CARD_LIST = '<ul class="md:hidden"';

/**
 * The three routes, and NOT their column counts.
 *
 * An earlier draft of this file pinned each route's count with
 * `expect(rendered).toBe(6)`, copying `retirement-target-render.test.ts`,
 * where the count IS the contract because that route was deliberately reduced
 * from six columns to four. Here it is not: the contract is the RULE, so a
 * legitimate seventh column would have turned this red for the wrong reason —
 * the "never pin the suite's own size" mistake docs §8 lists twice. The count
 * is read from the markup and the rule is applied to whatever it finds.
 */
const ROUTES: readonly { slug: string; component: ComponentType }[] = [
  {
    slug: "uoc-tinh-an-sinh-xa-hoi",
    component: UsSocialSecurityEstimateCalculator,
  },
  {
    slug: "phan-tich-an-sinh-xa-hoi",
    component: UsSocialSecurityAnalysisCalculator,
  },
  {
    slug: "chi-tra-an-sinh-xa-hoi",
    component: UsSocialSecurityPayoutCalculator,
  },
];

const render = (component: ComponentType) =>
  renderToStaticMarkup(createElement(component));

const count = (haystack: string, needle: string) =>
  haystack.split(needle).length - 1;

describe("the Social Security tables fall back to cards at 390 px", () => {
  it.each(ROUTES)(
    "$slug applies the five-column rule in BOTH directions",
    ({ component }) => {
      // Bidirectional on purpose, which is the shape docs §8 defect 21 says a
      // guard needs: a wide table that forgot the fallback fails, and a table
      // narrowed below the bound that kept a fallback it no longer needs also
      // fails. Either way the failure demands a decision instead of being
      // silently correct in one direction only.
      const html = render(component);
      const columns = count(html, '<th scope="col"');
      expect(columns, "no table rendered at the shipped defaults").toBeGreaterThan(
        0,
      );
      const wide = columns >= MOBILE_CARD_MIN_COLUMNS;
      expect(
        html.includes(CARD_LIST),
        wide
          ? `${columns} columns is at or past the ${MOBILE_CARD_MIN_COLUMNS}-column ` +
            `bound docs §3 sets, so this table must pass mobileCards`
          : `${columns} columns fits 390 px compacted, so mobileCards is extra ` +
            `scrolling for no gain — docs §3`,
      ).toBe(wide);
      // And when the cards are on, the scrolling table is the one hidden
      // below `md`, so exactly one presentation is in the accessibility tree.
      if (wide) expect(html).toContain("overflow-x-auto hidden md:block");
    },
  );

  it.each(ROUTES)(
    "$slug builds both presentations from the same cells",
    ({ component }) => {
      // `result-table.tsx` promises the card list and the table cannot
      // disagree because both map the same `rows`. Checked by counting rather
      // than by comparing text: one block per row, and one label/value pair
      // per column after the first.
      const html = render(component);
      const columns = count(html, '<th scope="col"');
      const cards = markupRegion(html, CARD_LIST, "ul");
      expect(cards, "the card list was not found").not.toBeNull();
      const blocks = count(cards!, "<li");
      expect(blocks).toBeGreaterThan(0);
      // Nine whole claiming ages, 62 to 70, on all three routes.
      expect(blocks).toBe(count(html, "<tr") - 1);
      expect(count(cards!, "<dt")).toBe(blocks * (columns - 1));
      expect(count(cards!, "<dd")).toBe(blocks * (columns - 1));
      // The first cell is the block's own heading, not a label/value pair —
      // a bare "62" has lost what it counts.
      expect(count(cards!, "<dl")).toBe(blocks);
    },
  );

  it.each(ROUTES)("$slug keeps the table out of the live region", ({
    component,
  }) => {
    // docs §4: exactly one live results region, and never a table inside it.
    // Turning on `mobileCards` puts a `<dl>` on these pages for the first
    // time, which is precisely what broke four hand-rolled containment
    // bounds — `lib/markup-region.ts`'s docstring records that one of them
    // passed only because a `mobileCards` `<dl>` happened to close before the
    // `<table>` opened. So the bound is `markupRegion`, depth-counted, with
    // the non-null guard those four were each missing.
    const html = render(component);
    expect(count(html, 'data-results-live="true"')).toBe(1);
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live, "the live region was not found or never closed").not.toBeNull();
    expect(live!).not.toContain("<table");
    expect(live!).not.toContain(CARD_LIST);
    expect(live!).not.toContain("<dl");
  });
});

describe("the Social Security card labels do not starve beside a figure", () => {
  /**
   * Geometry, from the same 390x844 review, and the same calibration
   * `content/calculators/retirement-savings-analysis.test.ts` derived and
   * docs §8 defect 23 records — per-character rates rounded UP, so the bound
   * is conservative.
   *
   * `mobileCards` renders each pair as a `grid-cols-[1fr_auto] gap-x-3` about
   * 300 px wide. The value track is `whitespace-nowrap` and sized to its own
   * content; the LABEL track takes what is left and wraps. That priority is
   * deliberate and shared by every consumer of the primitive — a money figure
   * must never break across lines — so the label is what has to fit.
   *
   * These three routes are the comfortable case and the assertion says why:
   * their cells are USD through `formatMoney`, about 9 to 11 characters
   * ("624.960 USD"), not the 233 px exact-đồng-plus-suffix string
   * ("Thêm 10.007.403 ₫ mỗi năm") that starved a 24-character heading into
   * four ragged lines on route 48. That is what leaves "Giá trị hiện tại" and
   * "So với tuổi hưởng đủ" room on their own line, and it is why the fix here
   * was the layout rather than the words. Pinned as ARITHMETIC over the
   * rendered cells rather than as a character ceiling, so it reacts if a
   * value template grows — which is the failure mode the fixed-12 form in
   * `retirement-target-render.test.ts` cannot see.
   */
  const ROW_PX = 300;
  const GAP_PX = 12;
  const LABEL_PX_PER_CHAR = 7.5;
  const VALUE_PX_PER_CHAR = 10;

  /** Every label/value pair the card list actually renders. */
  function pairs(component: ComponentType): { label: string; value: string }[] {
    const cards = markupRegion(render(component), CARD_LIST, "ul");
    if (cards === null) throw new Error("the card list was not found");
    const text = (html: string) =>
      html
        .replace(/<[^>]*>/g, "")
        .replace(/&#x27;|&#39;/g, "'")
        .replace(/&amp;/g, "&")
        .trim()
        // NFC so a Vietnamese diacritic counts as one character, whichever
        // normalisation the source file happens to be saved in.
        .normalize("NFC");
    const out: { label: string; value: string }[] = [];
    const pair = /<dt[^>]*>([\s\S]*?)<\/dt>\s*<dd[^>]*>([\s\S]*?)<\/dd>/g;
    for (const m of cards.matchAll(pair)) {
      out.push({ label: text(m[1]), value: text(m[2]) });
    }
    return out;
  }

  it.each(ROUTES)("$slug leaves every label room on its own line", ({
    component,
  }) => {
    const rendered = pairs(component);
    // Nine claiming ages times the columns after the first, so this is not a
    // vacuous pass.
    expect(rendered.length).toBeGreaterThan(0);
    for (const { label, value } of rendered) {
      const available =
        ROW_PX - GAP_PX - value.length * VALUE_PX_PER_CHAR;
      expect(
        label.length * LABEL_PX_PER_CHAR,
        `"${label}" (${label.length} chars) beside "${value}" ` +
          `(${value.length} chars) has only ${available} px of label track`,
      ).toBeLessThanOrEqual(available);
    }
  });
});
