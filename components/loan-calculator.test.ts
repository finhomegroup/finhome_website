/**
 * Markup test for the loan calculator's live regions.
 *
 * §4 of docs/calculator-suite-status.md allows exactly ONE live results region
 * per page, and the loan page has two `ResultGroup`s: the summary and the
 * extra-payment view. The second one mounts only when the extra payment is
 * above 0, and `form.defaultExtra` is "0" — so the prerendered HTML never
 * contains it and the built-HTML `aria-live` grep passes with the breach
 * present. That is why this has to be a render test and not a grep on `out/`.
 *
 * Server-rendered with `react-dom/server` in the runner's existing `node`
 * environment: no jsdom, no @testing-library, no new dependency (vitest.config.ts
 * pins the dependency surface at one package). `.test.ts`, not `.test.tsx`,
 * because that is what the vitest glob picks up — hence `createElement` instead
 * of JSX.
 */
import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const CONTENT = "@/content/calculators/loan";

/** Every `aria-live="polite"` in the markup, results-level and field-level. */
function countPolite(html: string): number {
  return (html.match(/aria-live="polite"/g) ?? []).length;
}

/**
 * The result blocks, in document order, with whether each announces.
 *
 * Two primitives render one: `ResultGroup` an `h2` followed by its live
 * wrapper, and `DetailFigures` an `h3` followed by its unit line or its `<dl>`.
 * Nothing else in the tree does — `FieldGroup` uses a real `legend` and
 * `ResultTable` a `caption`. Matching on that shape rather than on the
 * wrappers' Tailwind classes keeps the test off their styling.
 */
function resultGroups(html: string): { title: string; live: boolean }[] {
  return [
    ...html.matchAll(/<h([23])[^>]*>(.*?)<\/h\1>\s*<(?:div|dl)\b([^>]*)>/g),
  ].map((match) => ({
    title: match[2],
    live: match[3].includes('aria-live="polite"'),
  }));
}

/**
 * Render the calculator, optionally overriding only `form.defaultExtra` so the
 * extra-payment group mounts. Leaves the module registry clean either way.
 */
async function render(defaultExtra?: string): Promise<string> {
  vi.resetModules();
  if (defaultExtra !== undefined) {
    vi.doMock(CONTENT, async () => {
      const actual = await vi.importActual<typeof import("@/content/calculators/loan")>(
        CONTENT,
      );
      return {
        LOAN: {
          ...actual.LOAN,
          form: { ...actual.LOAN.form, defaultExtra },
        },
      };
    });
  }
  try {
    const { LoanCalculator } = await import("@/components/loan-calculator");
    return renderToStaticMarkup(createElement(LoanCalculator));
  } finally {
    vi.doUnmock(CONTENT);
    vi.resetModules();
  }
}

describe("LoanCalculator — one live results region", () => {
  it("renders the summary live and the detail views not, at the defaults", async () => {
    const { LOAN } = await vi.importActual<typeof import("@/content/calculators/loan")>(
      CONTENT,
    );
    const html = await render();
    const groups = resultGroups(html);

    // The summary is live and everything else is not. The two detail groups
    // live inside a collapsed `<details>`, and they are two rather than one
    // because a month's COMPONENTS and the SCHEDULE are different scopes —
    // the browser check found "Tháng cuối 9.549.208" directly above "Trong đó
    // gốc và lãi 17.356.465", which read as a part bigger than its whole.
    //
    // The extra-payment group needs a non-zero `defaultExtra`, which is "0".
    expect(groups).toEqual([
      { title: LOAN.form.resultTitle, live: true },
      { title: LOAN.form.breakdownTitle, live: false },
      { title: LOAN.form.scheduleTitle, live: false },
    ]);
  });

  it("keeps the final-month row away from the monthly components", async () => {
    // The specific contradiction, asserted on rendered order: the actual final
    // month belongs to the schedule group, and the slice of the monthly bill
    // belongs to the breakdown group. They must not be adjacent rows.
    const { LOAN } = await vi.importActual<typeof import("@/content/calculators/loan")>(
      CONTENT,
    );
    const html = await render("2.000.000");

    const breakdownAt = html.indexOf(LOAN.form.breakdownTitle);
    const scheduleAt = html.indexOf(LOAN.form.scheduleTitle);
    // Searched FROM the breakdown heading: "Gốc và lãi" is also a substring of
    // the chart's y-axis title ("Gốc và lãi mỗi kỳ (triệu)"), which is earlier
    // in the document.
    const componentAt = html.indexOf(
      LOAN.form.principalInterestLabel,
      breakdownAt,
    );
    const finalMonthAt = html.indexOf("Tháng cuối (tháng 187)");

    expect(breakdownAt).toBeGreaterThan(-1);
    expect(scheduleAt).toBeGreaterThan(breakdownAt);
    // The component row sits in the breakdown group...
    expect(componentAt).toBeGreaterThan(breakdownAt);
    expect(componentAt).toBeLessThan(scheduleAt);
    // ...and the final month in the schedule group, after it.
    expect(finalMonthAt).toBeGreaterThan(scheduleAt);
  });

  it("names the reference instalment as a reference, not as a component", async () => {
    const { LOAN } = await vi.importActual<typeof import("@/content/calculators/loan")>(
      CONTENT,
    );
    const html = await render("2.000.000");
    // Both figures are present, each labelled with the schedule it belongs to.
    expect(html).toContain(LOAN.form.actualFinalLabel);
    expect(html).toContain(LOAN.form.referenceFinalLabel);
    expect(LOAN.form.referenceFinalLabel).toContain("lịch gốc");
    // The detail panel is compact by default with the exact reading beside it,
    // so the figure appears twice at two precisions and carries no per-cell
    // "₫" — the unit is stated once for the block.
    expect(html).toContain(">9,5<");
    expect(html).toContain(">9.549.208<");
    expect(html).not.toContain("9.549.208 ₫");
  });

  it("sums the first year from real rows rather than annualising a month", async () => {
    // Finding 4. Under flat principal the instalment falls every month, so a
    // first-year label may not multiply one month by twelve. Both figures are
    // shown, each saying which it is.
    const { LOAN } = await vi.importActual<typeof import("@/content/calculators/loan")>(
      CONTENT,
    );
    vi.resetModules();
    vi.doMock(CONTENT, async () => {
      const actual = await vi.importActual<typeof import("@/content/calculators/loan")>(
        CONTENT,
      );
      return {
        LOAN: {
          ...actual.LOAN,
          form: { ...actual.LOAN.form, defaultMethod: "flatPrincipal" },
        },
      };
    });
    let html: string;
    try {
      const { LoanCalculator } = await import("@/components/loan-calculator");
      html = renderToStaticMarkup(createElement(LoanCalculator));
    } finally {
      vi.doUnmock(CONTENT);
      vi.resetModules();
    }

    // 12 months of a constant 8.333.333,33 slice plus falling interest.
    expect(html).toContain("Tiền ra trong 12 tháng đầu");
    expect(html).toContain(LOAN.form.annualisedLabel);

    // The annualised figure is the dearest month × 12 = 270.000.000 ₫; the real
    // first year is less. Both appear, and the annualised one belongs to the
    // annualised ROW — asserted by slicing between the two labels rather than
    // by a character-distance regex, which the detail markup now exceeds.
    const firstYearAt = html.indexOf("Tiền ra trong 12 tháng đầu");
    const annualisedAt = html.indexOf(LOAN.form.annualisedLabel, firstYearAt);
    expect(annualisedAt).toBeGreaterThan(firstYearAt);
    expect(html.slice(firstYearAt, annualisedAt)).not.toContain("270.000.000");
    expect(html.slice(annualisedAt)).toContain(">270.000.000<");
  });

  it("keeps the summary live region small", () => {
    // The ratchet in `live-region.test.ts` is a ceiling at the suite's widest.
    // This is the stronger, page-specific claim: four rows, which is what a
    // borrower actually came for — what the bank collects, what they add, the
    // sum, and the total interest.
    const source = readFileSync("components/loan-calculator.tsx", "utf8");
    const summaryBlock = source
      .split("<ResultGroup")[1]
      .split("</ResultGroup>")[0];
    expect((summaryBlock.match(/<ResultRow/g) ?? []).length).toBe(4);
  });

  it("leaves the extra-payment group out of the live region", async () => {
    const { LOAN } = await vi.importActual<typeof import("@/content/calculators/loan")>(
      CONTENT,
    );
    const baseline = await render();
    const html = await render("5.000.000");
    const groups = resultGroups(html);

    // All four groups really are on the page in this state...
    expect(groups.map((group) => group.title)).toEqual([
      LOAN.form.resultTitle,
      LOAN.form.extraResultTitle,
      LOAN.form.breakdownTitle,
      LOAN.form.scheduleTitle,
    ]);
    // ...and it is the summary, alone, that announces.
    expect(groups.filter((group) => group.live).map((group) => group.title)).toEqual([
      LOAN.form.resultTitle,
    ]);
    // No extra polite region appeared anywhere on the page: the field-level help
    // paragraphs are unchanged and the new groups added none. (Before the fix this
    // count went up by one, from 10 to 11.)
    expect(countPolite(html)).toBe(countPolite(baseline));
  });

  it("puts the extra payment, the sum and the final month on the page", async () => {
    // The cash-out correction, asserted on rendered HTML rather than on the
    // module: 2 tỷ at 8,5% over 240 months with 2 triệu extra is 17.356.465 ₫
    // collected, 19.356.465 ₫ leaving the account, and a 187th month that is
    // neither.
    const { LOAN } = await vi.importActual<typeof import("@/content/calculators/loan")>(
      CONTENT,
    );
    const html = await render("2.000.000");

    expect(html).toContain(LOAN.form.monthlyPaymentLabel);
    expect(html).toContain("17.356.465 ₫");
    expect(html).toContain(LOAN.form.extraRowLabel);
    expect(html).toContain("2.000.000 ₫");
    expect(html).toContain(LOAN.form.plannedOutflowLabel);
    expect(html).toContain("19.356.465 ₫");
    // The final month is named by its own number, from the placeholder.
    expect(html).toContain("Tháng cuối (tháng 187)");
    expect(html).not.toContain("{n}");
  });

  it("hides the extra and the sum when there is no extra payment", async () => {
    // Two identical lines would be noise; the whole point is that they CAN
    // differ. With no extra the page shows one monthly figure.
    const html = await render();
    expect(html).toContain("17.356.465 ₫");
    expect(html).not.toContain("19.356.465 ₫");
  });
});

/**
 * ORIGINAL ROW 0 — the first screen, and the optional question behind it.
 *
 * The audit's remaining requirement on this tool: "First screen still includes
 * extra payment at `UI/loan:254`, beyond the original amount/rate/term-first
 * structure. Move optional extra contribution behind progressive disclosure
 * while retaining method choice."
 */
describe("LoanCalculator — the extra payment is progressive disclosure", () => {
  /** The source order of a set of markers, as indexes, for ordering claims. */
  const at = (html: string, marker: string) => html.indexOf(marker);

  it("opens with amount, rate, term and method, and nothing else", async () => {
    const { LOAN } = await vi.importActual<typeof import("@/content/calculators/loan")>(
      CONTENT,
    );
    const html = await render();

    // The four things the original row puts first are all in the entry group,
    // ahead of either disclosure.
    const firstPanel = at(html, LOAN.form.extraPanelTitle);
    expect(firstPanel).toBeGreaterThan(-1);
    for (const label of [
      LOAN.form.amountLabel,
      LOAN.form.rateLabel,
      LOAN.form.termLabel,
      LOAN.form.methodLegend,
    ]) {
      expect(at(html, label), label).toBeGreaterThan(-1);
      expect(at(html, label), label).toBeLessThan(firstPanel);
    }
    // The extra-payment INPUT is no longer in that group: its help text only
    // renders with the field, and the field now lives inside the panel.
    expect(at(html, LOAN.form.extraHelp)).toBeGreaterThan(firstPanel);
    // Method stayed in the entry form rather than moving with it.
    expect(at(html, LOAN.form.methodHelp)).toBeLessThan(firstPanel);
  });

  it("stays collapsed and says so while there is no extra payment", async () => {
    const { LOAN } = await vi.importActual<typeof import("@/content/calculators/loan")>(
      CONTENT,
    );
    const html = await render();
    expect(html).toContain(LOAN.form.extraPanelTitle);
    expect(html).toContain(LOAN.form.extraPanelSummary);
    // The field is MOUNTED inside the closed panel, so nothing typed is lost
    // when the reader collapses it again.
    expect(html).toContain(LOAN.form.extraLabel);
  });

  it("forces itself open and names the amount once one is set", async () => {
    const { LOAN } = await vi.importActual<typeof import("@/content/calculators/loan")>(
      CONTENT,
    );
    const html = await render("2.000.000");
    // `<details open>` — a panel moving the headline may not be collapsed and
    // silent, which is the contract AdvancedFields exists to keep.
    const panelAt = at(html, LOAN.form.extraPanelTitle);
    const openAt = html.lastIndexOf("<details open", panelAt);
    expect(openAt).toBeGreaterThan(-1);
    // And the summary line carries the active figure, not the empty sentence.
    expect(html).toContain(`${LOAN.form.extraLabel} 2.000.000 ₫`);
    expect(html).not.toContain(LOAN.form.extraPanelSummary);
    // The schedule really is shorter than the 240 months typed above, which is
    // why a silent panel would have been a defect rather than a tidiness
    // preference.
    expect(html).toContain("Tháng cuối (tháng 187)");
  });

  it("names a malformed extra payment on the collapsed summary line", async () => {
    const { LOAN } = await vi.importActual<typeof import("@/content/calculators/loan")>(
      CONTENT,
    );
    const html = await render("abc");
    // The result clears, so the reader must be able to find the box without
    // opening the panel to guess where the dashes came from.
    expect(html).toContain(LOAN.form.extraLabel);
    expect(html).not.toContain(LOAN.form.extraPanelSummary);
    expect(html).toContain(LOAN.form.extraInvalid);
    expect(html).not.toContain("17.356.465 ₫");
  });
});
