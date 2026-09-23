/**
 * Rendered-markup contracts for the three United States Social Security
 * routes — plan rows 55, 56 and 57.
 *
 * EXTENDED, not replaced, by the U-group layout pass: the original file
 * covered the three tables and their card fallback, and the blocks at the
 * bottom add the shell contracts (regions, split, CTA, one emphasis) and the
 * nullable/ineligible states each route reaches through its own form. The
 * matrix listing an action as outstanding did not mean the table work here
 * was absent, so the table blocks above are untouched.
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
import { describe, expect, it, vi } from "vitest";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { markupRegion } from "@/lib/markup-region";
import { PLACEHOLDER } from "@/lib/calc/number";
import { TOOL_SHELL } from "@/content/calculators/tool-shell";
import { US_SOCIAL_SECURITY_ESTIMATE } from "@/content/calculators/us-social-security-estimate";
import { US_SOCIAL_SECURITY_ANALYSIS } from "@/content/calculators/us-social-security-analysis";
import { US_SOCIAL_SECURITY_PAYOUT } from "@/content/calculators/us-social-security-payout";
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

/**
 * The same three routes, re-rendered with patched form defaults.
 *
 * `vi.doMock` on the CONTENT module is the only lever this suite has for a
 * non-default state: the components read `form.defaults` through
 * `useCalcFields` and nothing else reaches them from outside. Each route
 * keeps its own literal import so the paths stay statically analysable.
 */
type Defaults = Record<string, string>;

type ShellRoute = {
  slug: string;
  formId: string;
  resultId: string;
  /** Replace `form.defaults` and render, or render as shipped. */
  render: (defaults?: Defaults) => Promise<string>;
  /** How many `emphasis` rows this route is supposed to have. */
  emphasisRows: number;
  /** Whether this form is long enough to pin a short current answer. */
  pins: boolean;
};

function shellRoute(
  slug: string,
  contentPath: string,
  contentExport: string,
  load: () => Promise<ComponentType>,
  emphasisRows: number,
  pins: boolean,
): ShellRoute {
  return {
    slug,
    formId: `${slug}-nhap`,
    resultId: `${slug}-ket-qua`,
    emphasisRows,
    pins,
    render: async (defaults) => {
      vi.resetModules();
      if (defaults !== undefined) {
        vi.doMock(contentPath, async () => {
          const actual = (await vi.importActual(contentPath)) as Record<
            string,
            { form: { defaults: Defaults } }
          >;
          const content = actual[contentExport];
          return {
            [contentExport]: {
              ...content,
              form: {
                ...content.form,
                defaults: { ...content.form.defaults, ...defaults },
              },
            },
          };
        });
      }
      try {
        return renderToStaticMarkup(createElement(await load()));
      } finally {
        vi.doUnmock(contentPath);
        vi.resetModules();
      }
    },
  };
}

const ESTIMATE = shellRoute(
  "uoc-tinh-an-sinh-xa-hoi",
  "@/content/calculators/us-social-security-estimate",
  "US_SOCIAL_SECURITY_ESTIMATE",
  () =>
    import("@/components/us-social-security-estimate-calculator").then(
      (m) => m.UsSocialSecurityEstimateCalculator,
    ),
  1,
  // CORRECTED BY MEASUREMENT. This was `false` on the control-count heuristic
  // — five controls, under the six of the only form measured at the time. An
  // independent pass at 1440×1000 then clicked this route's own last field
  // (claim age, y 529–575) and found the monthly figure AND the chosen age
  // above the viewport, with only the replacement rate and the supporting rows
  // left. A measurement of the route beats a heuristic about it, so it pins,
  // and it pins the amount WITH the age.
  true,
);

const ANALYSIS = shellRoute(
  "phan-tich-an-sinh-xa-hoi",
  "@/content/calculators/us-social-security-analysis",
  "US_SOCIAL_SECURITY_ANALYSIS",
  () =>
    import("@/components/us-social-security-analysis-calculator").then(
      (m) => m.UsSocialSecurityAnalysisCalculator,
    ),
  // Deliberately zero: two co-equal answers, and an enlarged figure on
  // either one would read as the recommendation row 56 forbids.
  0,
  // CORRECTED BY MEASUREMENT, and the old reason was answered rather than
  // overruled. It said the strip carries ONE figure while this page has two;
  // the fix is a labelled PAIR, the shape `black-scholes` already uses for the
  // same reason, not a promotion of either age. The measurement: at 1440×1000
  // with the last discount-rate field focused (y 529–575) the total-money
  // optimum was above the viewport and the present-value optimum sat on the
  // top edge — while the field being edited is the one that moves the second
  // figure. `emphasisRows` stays 0; a pin is not an emphasis.
  true,
);

const PAYOUT = shellRoute(
  "chi-tra-an-sinh-xa-hoi",
  "@/content/calculators/us-social-security-payout",
  "US_SOCIAL_SECURITY_PAYOUT",
  () =>
    import("@/components/us-social-security-payout-calculator").then(
      (m) => m.UsSocialSecurityPayoutCalculator,
    ),
  1,
  // Nine controls in three groups — larger than the form measured at
  // 1143,75 px, so it pins the household total.
  true,
);

const SHELL_ROUTES: readonly ShellRoute[] = [ESTIMATE, ANALYSIS, PAYOUT];

const regionOrder = (html: string): string[] =>
  [...html.matchAll(/data-calc-region="([a-z]+)"/g)].map((m) => m[1]);

const resultRegion = (html: string): string =>
  html.slice(
    html.indexOf('data-calc-region="result"'),
    html.indexOf('data-calc-region="detail"'),
  );

const detailRegion = (html: string): string =>
  html.slice(html.indexOf('data-calc-region="detail"'));

/** The pinned restatement's own paragraph — its label and its value. */
const pinnedStrip = (html: string): string => {
  const at = html.indexOf('data-calc-answer="true"');
  return at === -1 ? "" : html.slice(at, html.indexOf("</p>", at));
};

/** One `ResultRow`'s markup, from its label to the end of its wrapper. */
const rowOf = (region: string, label: string): string => {
  const at = region.indexOf(label);
  return at === -1 ? "" : region.slice(at, region.indexOf("</div>", at));
};

describe("the three Social Security routes get the shell contracts", () => {
  it.each(SHELL_ROUTES)(
    "$slug renders form, result and detail in that order",
    async (route) => {
      expect(regionOrder(await route.render())).toEqual([
        "form",
        "result",
        "detail",
      ]);
    },
  );

  it.each(SHELL_ROUTES)("$slug takes the two-column split", async (route) => {
    const html = await route.render();
    expect(html).toContain("lg:grid-cols-5");
    expect(html).toContain("lg:col-span-2");
  });

  it.each(SHELL_ROUTES)(
    "$slug puts the CTA in the form region, pointing at the answer",
    async (route) => {
      const html = await route.render();
      const form = html.slice(
        html.indexOf(`id="${route.formId}"`),
        html.indexOf('data-calc-region="result"'),
      );
      expect(form).toContain('data-calc-cta="true"');
      expect(form).toContain(`aria-controls="${route.resultId}"`);
      expect(html).toContain(TOOL_SHELL.cta.autoNote);
    },
  );

  it.each(SHELL_ROUTES)("$slug pins its answer only if its form is long", async (route) => {
    // CORRECTED. This block used to assert no pin on all three, reasoning that
    // `.fh-cta-pin` acts only from 1024x900 up, which is where the split
    // already puts the answer beside the form. That reasoning is refuted:
    // `lg:items-start` holds the result column at the TOP of the grid, and a
    // browser pass on a split, `wide` six-control form measured it at
    // 1143,75 px with the result region at y -382..-140 while the last field
    // was focused (`components/black-scholes-calculator.tsx`). The split does
    // not keep the answer on screen; form height decides.
    const html = await route.render();
    if (!route.pins) {
      expect(html, `${route.slug} gained a pin`).not.toContain("fh-cta-pin");
      expect(html).not.toContain('data-calc-answer="true"');
      return;
    }
    expect(html).toContain("fh-cta-pin");
    expect(html).toContain('data-calc-answer="true"');
    // Decorative by contract: `ResultGroup` owns the page's one live region,
    // so the restatement must not announce the same recomputation twice.
    const at = html.indexOf('data-calc-answer="true"');
    expect(html.slice(html.lastIndexOf("<p", at), at)).toContain(
      'aria-hidden="true"',
    );
  });

  it.each(SHELL_ROUTES)(
    "$slug emphasises exactly the rows it should",
    async (route) => {
      const html = await route.render();
      expect(count(html, "md:text-3xl")).toBe(route.emphasisRows);
      expect(count(html, 'data-results-live="true"')).toBe(1);
    },
  );
});

describe("row 55: the estimate says what it is and where it cannot compare", () => {
  const F = US_SOCIAL_SECURITY_ESTIMATE.form;

  it("keeps the estimate warning beside the figure, not after the table", async () => {
    const html = await ESTIMATE.render();
    expect(resultRegion(html)).toContain(F.estimateNotice);
    expect(detailRegion(html)).not.toContain(F.estimateNotice);
  });

  it.each([62, 70])(
    "answers for a claiming age of %i without flagging a field",
    async (age) => {
      const html = await ESTIMATE.render({ claimAge: String(age) });
      expect(html).not.toContain('aria-invalid="true"');
      expect(html).not.toContain(F.invalidNotice);
      // The chosen age is the first row of the answer group, so a reader
      // cannot read the monthly figure without it.
      expect(resultRegion(html)).toContain(`${age} ${F.yearsUnitShort}`);
    },
  );

  it.each([61, 71])("refuses a claiming age of %i by the field", async (age) => {
    const html = await ESTIMATE.render({ claimAge: String(age) });
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain(F.claimAgeInvalid);
    expect(resultRegion(html)).toContain(F.invalidNotice);
    expect(html).not.toContain(F.table.caption);
  });

  it("pins the monthly amount WITH the chosen age, both from the rows", async () => {
    // The repair for the measured defect: at 1440×1000 with the last
    // claim-age field focused (y 529–575), the monthly figure and the chosen
    // age had both scrolled above the viewport and only the replacement rate
    // and supporting rows were left. A monthly amount alone would not restore
    // the answer — the nine ages differ by a factor of 1,77, so the same
    // number means a different decision at 62 than at 70.
    const html = await ESTIMATE.render({ claimAge: "70" });
    const strip = pinnedStrip(html);
    expect(strip).toContain(F.pinnedLabel);

    const age = `70 ${F.yearsUnitShort}`;
    const amount = strip.match(/([\d.]+ USD)/)?.[1];
    expect(amount, "pinned strip carries no monthly amount").toBeTruthy();
    expect(strip, "the amount is not marked as a monthly one").toContain(
      F.pinnedMonthlySuffix,
    );
    expect(strip, "the age is not attached to the amount").toContain(
      `${F.pinnedAgePrefix} ${age}`,
    );

    // `ResultCta`'s `answer` contract: the SAME formatted strings the rows
    // render. Both halves are formatted once in the component and shared.
    const result = resultRegion(html);
    expect(rowOf(result, F.claimAgeLabel)).toContain(age);
    expect(rowOf(result, F.monthlyLabel)).toContain(amount!);
    expect(rowOf(result, F.monthlyLabel)).toContain("md:text-3xl");
  });

  it("pins the placeholder, not half a pair, when a field is unusable", async () => {
    const html = await ESTIMATE.render({ claimAge: "71" });
    const strip = pinnedStrip(html);
    expect(strip).toContain(F.pinnedLabel);
    expect(strip).toContain(PLACEHOLDER);
    // Neither half survives on its own: an amount with no age, or an age with
    // no amount, would read as an answer this state does not have.
    expect(strip).not.toContain(F.pinnedMonthlySuffix);
    expect(strip).not.toContain(F.pinnedAgePrefix);
  });

  it("names the missing replacement rate instead of a dash", async () => {
    // A zero career average is a valid zero, not a bad field: there is no
    // income to compare the benefit against, so the ratio has no denominator.
    const html = await ESTIMATE.render({ earnings: "0" });
    expect(html).not.toContain('aria-invalid="true"');
    const result = resultRegion(html);
    expect(result).toContain(F.noReplacementValue);
    expect(result).toContain(F.noReplacementNotice);
  });
});

describe("row 56: two answers, and no break-even left unexplained", () => {
  const F = US_SOCIAL_SECURITY_ANALYSIS.form;

  it("names both objectives and merges neither", async () => {
    const html = await ANALYSIS.render();
    const result = resultRegion(html);
    expect(result).toContain(F.bestNominalLabel);
    expect(result).toContain(F.bestPvLabel);
    expect(result).toContain(F.twoMeasuresHint);
    // The shipped defaults are the disagreeing case — 70 on total money, 68
    // on present value — and the notice that says so sits beside the pair
    // rather than after the nine-row table.
    expect(result).toContain(F.disagreeNotice);
    expect(result).not.toContain(F.agreeNotice);
    expect(result).toContain(F.interiorNotice);
    expect(detailRegion(html)).not.toContain(F.disagreeNotice);
  });

  it("labels the age-62 row as the baseline rather than a dash", async () => {
    const html = await ANALYSIS.render();
    const detail = detailRegion(html);
    // One row lacks a break-even on the defaults and it is the comparison
    // baseline, rendered once in the table and once in the mobile card.
    expect(count(detail, F.breakEvenBaselineValue)).toBe(2);
    expect(detail).not.toContain(">—<");
  });

  it("explains a tie instead of blanking the headline row", async () => {
    // A zero basic benefit is a valid zero: every claiming age pays nothing,
    // so no age overtakes age 62 and there is no crossing to report.
    const html = await ANALYSIS.render({ pia: "0" });
    expect(html).not.toContain('aria-invalid="true"');
    const result = resultRegion(html);
    expect(result).toContain(F.breakEvenTieValue);
    expect(result).toContain(F.breakEvenTieNotice);
    // Both measures now pick the same age, so the page says so.
    expect(result).toContain(F.agreeNotice);
  });

  it("pins BOTH optima, with neither promoted over the other", async () => {
    // The measured defect: at 1440×1000 with the last discount-rate field
    // focused (y 529–575), the total-money optimum was above the viewport and
    // the present-value optimum sat on the top edge — while that field is
    // exactly the one that moves the second figure. The pin restates both,
    // because a pin carrying one of them would manufacture the recommendation
    // `twoMeasuresHint` refuses.
    const html = await ANALYSIS.render();
    const strip = pinnedStrip(html);
    expect(strip).toContain(F.pinnedPairLabel);

    const ages = [
      ...strip.matchAll(new RegExp(`(\\d+) ${F.endAgeUnit}`, "g")),
    ].map((m) => m[1]);
    expect(ages, "the pin does not carry two ages").toHaveLength(2);
    // The shipped defaults are the disagreeing case, so a collapse to one
    // figure would be visible here rather than silent.
    expect(new Set(ages).size).toBe(2);

    // Each half named inline, in the rows' order, and each the same value its
    // row renders.
    expect(strip.indexOf(F.pinnedNominalPrefix)).toBeLessThan(
      strip.indexOf(F.pinnedPvPrefix),
    );
    const result = resultRegion(html);
    expect(rowOf(result, F.bestNominalLabel)).toContain(ages[0]);
    expect(rowOf(result, F.bestPvLabel)).toContain(ages[1]);
    // A pin is not an emphasis: still no enlarged figure anywhere.
    expect(count(html, "md:text-3xl")).toBe(0);
  });

  it("pins the placeholder rather than one optimum when the horizon is unusable", async () => {
    const html = await ANALYSIS.render({ endAge: "62" });
    const strip = pinnedStrip(html);
    expect(strip).toContain(F.pinnedPairLabel);
    expect(strip).toContain(PLACEHOLDER);
    expect(strip).not.toContain(F.pinnedNominalPrefix);
    expect(strip).not.toContain(F.pinnedPvPrefix);
  });

  it("explains a group-level refusal with no field flagged", async () => {
    const html = await ANALYSIS.render({ endAge: "62" });
    expect(resultRegion(html)).toContain(F.invalidNotice);
    expect(html).not.toContain(F.table.caption);
  });
});

describe("row 57: household and individual stay separate", () => {
  const F = US_SOCIAL_SECURITY_PAYOUT.form;

  it("splits the household total from the two personal amounts", async () => {
    const html = await PAYOUT.render();
    const result = resultRegion(html);
    expect(result).toContain(F.resultTitle);
    expect(result).toContain(F.individualTitle);
    expect(result).toContain(F.spouseTitle);
    // The emphasised figure is the household one, and it is the only one.
    const household = result.slice(
      result.indexOf(F.householdMonthlyLabel),
      result.indexOf(F.householdAnnualLabel),
    );
    expect(household).toContain("md:text-3xl");
    // Own record, spousal top-up and the survivor figure each keep a row:
    // the survivor asymmetry is the page's lesson and cannot be summarised
    // away.
    for (const label of [
      F.spouseOwnLabel,
      F.spousalLabel,
      F.spouseReceivesLabel,
      F.survivorLabel,
    ]) {
      expect(result).toContain(label);
    }
  });

  it("puts the record notice under the group that shows both records", async () => {
    const html = await PAYOUT.render();
    const result = resultRegion(html);
    // On the defaults the spouse is paid the spousal top-up, not their own
    // record, so waiting past full retirement age buys them nothing.
    expect(result).toContain(F.spousalTopUpNotice);
    expect(result).not.toContain(F.ownRecordNotice);
    expect(detailRegion(html)).not.toContain(F.spousalTopUpNotice);
  });

  it("switches to the own-record notice when the record is higher", async () => {
    const html = await PAYOUT.render({ spousePia: "3.000" });
    const result = resultRegion(html);
    expect(result).toContain(F.ownRecordNotice);
    expect(result).not.toContain(F.spousalTopUpNotice);
  });

  it("says the earnings test does not apply instead of leaving a dash", async () => {
    // Claiming after the full retirement age year: the test stops, so there
    // is no exempt amount to show and the full benefit is paid.
    const html = await PAYOUT.render({ claimAge: "68", earnings: "40.000" });
    expect(html).not.toContain('aria-invalid="true"');
    const detail = detailRegion(html);
    expect(detail).toContain(F.exemptNotApplicableValue);
    expect(detail).toContain(F.exemptNotApplicableNotice);
    expect(detail).not.toContain(F.withheldNotice);
  });

  it("explains the withholding when there is some", async () => {
    const html = await PAYOUT.render({ claimAge: "62", earnings: "40.000" });
    const detail = detailRegion(html);
    expect(detail).toContain(F.withheldNotice);
    expect(detail).not.toContain(F.exemptNotApplicableNotice);
    expect(detail).toContain(F.exemptNotice);
  });

  it("treats the zero-earnings default as a valid zero", async () => {
    const html = await PAYOUT.render();
    expect(html).not.toContain('aria-invalid="true"');
    expect(html).not.toContain(F.invalidNotice);
  });

  it("marks a claiming age outside 62 to 70 on its own field", async () => {
    const html = await PAYOUT.render({ spouseClaimAge: "61" });
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain(F.claimAgeInvalid);
    expect(resultRegion(html)).toContain(F.invalidNotice);
  });
});
