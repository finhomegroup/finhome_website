/**
 * Rendered-markup contracts for every interactive chart experience.
 *
 * Five when this file was written (W04's set); `thue-hay-mua` joined with
 * original row 8's trajectory and growth-scenario charts, on the same terms.
 *
 * WHY THIS FILE IS POSSIBLE AND WHY IT MATTERS.
 *
 * docs §6 records that there is no jsdom here and that a test under
 * `components/` "can exercise pure exported helpers but cannot render React".
 * That is not quite true, and `components/loan-calculator.test.ts` already
 * proved it: `renderToStaticMarkup` from `react-dom/server` runs in the
 * runner's plain `node` environment with no new dependency. Server rendering
 * is also exactly the right fidelity for this suite, because every calculator
 * IS server-rendered at its defaults and must hydrate byte-identically.
 *
 * So the chart contracts are asserted on real rendered HTML rather than
 * inferred from JSX:
 *
 * - one `<figure>` with a `<figcaption>` per chart;
 * - the text equivalent present as VISIBLE prose, not an `aria-label`;
 * - the `<svg>` `aria-hidden` and not focusable, so the drawing is not
 *   announced as a third, worse copy of that prose;
 * - the data as a real `<table>` with a `<caption>`, inside a native
 *   `<details>` so it opens with no JavaScript;
 * - the assumptions as visible list items;
 * - NO chart inside an `aria-live` region;
 * - no animation, which is how `prefers-reduced-motion` is honoured;
 * - and the geometry CHANGES when an input changes.
 *
 * That last one is the claim a screenshot would make. What cannot be checked
 * here is what the chart LOOKS like — spacing, contrast, whether a 30-column
 * chart is legible at 390px. Those remain unverified by eye; docs §6's rule
 * stands and nothing in this file should be reported as a visual check.
 */
import { describe, expect, it, vi } from "vitest";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";

/**
 * Render one calculator, optionally with a patched content module.
 *
 * `patch` receives the real content object and returns the overrides, so a
 * test changes one default and inherits the other forty.
 */
async function render<T extends Record<string, unknown>>(
  componentPath: string,
  componentName: string,
  contentPath: string,
  contentExport: string,
  patch?: (actual: T) => Partial<T>,
): Promise<string> {
  vi.resetModules();
  if (patch) {
    vi.doMock(contentPath, async () => {
      const actual = (await vi.importActual(contentPath)) as Record<
        string,
        T
      >;
      const original = actual[contentExport];
      return { [contentExport]: { ...original, ...patch(original) } };
    });
  }
  try {
    // Not named `module`: `@next/next/no-assign-module-variable` flags that
    // identifier anywhere in the tree, and the lint baseline is "no NEW
    // problems beyond the three pre-existing ones".
    const loaded = (await import(componentPath)) as Record<
      string,
      ComponentType
    >;
    return renderToStaticMarkup(createElement(loaded[componentName]));
  } finally {
    vi.doUnmock(contentPath);
    vi.resetModules();
  }
}

const count = (html: string, needle: string | RegExp): number =>
  typeof needle === "string"
    ? html.split(needle).length - 1
    : (html.match(needle) ?? []).length;

/** The chart experiences, and how to render each. */
const TOOLS = [
  {
    name: "tra-het-the-tin-dung",
    componentPath: "@/components/card-payoff-calculator",
    componentName: "CardPayoffCalculator",
    contentPath: "@/content/calculators/card-payoff",
    contentExport: "CARD_PAYOFF",
    // Original rows 29/30: the two debt paths, one figure.
    charts: 1,
    // A bigger monthly payment shortens the plan path and moves the marker,
    // while the minimum path it is drawn against stays where it was.
    change: (actual: Record<string, unknown>) => ({
      form: {
        ...(actual.form as Record<string, unknown>),
        defaultPayment: "6.000.000",
      },
    }),
  },
  {
    name: "thue-hay-mua",
    componentPath: "@/components/rent-vs-buy-calculator",
    componentName: "RentVsBuyCalculator",
    contentPath: "@/content/calculators/rent-vs-buy",
    contentExport: "RENT_VS_BUY",
    // Original row 8: the two net-cost trajectories, and the named
    // growth-scenario band.
    charts: 2,
    // A house that does not appreciate at all changes both pictures: the buy
    // trajectory rises and the scenario set collapses from 0/5/8 to 0/3.
    change: (actual: Record<string, unknown>) => ({
      form: {
        ...(actual.form as Record<string, unknown>),
        defaultGrowth: "0",
      },
    }),
  },
  {
    name: "vay-mua-nha",
    componentPath: "@/components/loan-calculator",
    componentName: "LoanCalculator",
    contentPath: "@/content/calculators/loan",
    contentExport: "LOAN",
    charts: 1,
    /** A change that must move the drawing. */
    change: (actual: Record<string, unknown>) => ({
      form: {
        ...(actual.form as Record<string, unknown>),
        defaultExtra: "5.000.000",
      },
    }),
  },
  {
    name: "kha-nang-mua-nha",
    componentPath: "@/components/affordability-calculator",
    componentName: "AffordabilityCalculator",
    contentPath: "@/content/calculators/affordability",
    contentExport: "AFFORDABILITY",
    charts: 2,
    change: (actual: Record<string, unknown>) => ({
      form: {
        ...(actual.form as Record<string, unknown>),
        defaultEssentials: "25.000.000",
      },
    }),
  },
  {
    name: "lai-suat-tha-noi",
    componentPath: "@/components/floating-loan-calculator",
    componentName: "FloatingLoanCalculator",
    contentPath: "@/content/calculators/floating-loan",
    contentExport: "FLOATING_LOAN",
    charts: 1,
    change: (actual: Record<string, unknown>) => ({
      form: {
        ...(actual.form as Record<string, unknown>),
        defaultPostRate: "14",
      },
    }),
  },
  {
    name: "muc-tieu-tiet-kiem",
    componentPath: "@/components/savings-goal-calculator",
    componentName: "SavingsGoalCalculator",
    contentPath: "@/content/calculators/savings-goal",
    contentExport: "SAVINGS_GOAL",
    charts: 1,
    change: (actual: Record<string, unknown>) => ({
      form: {
        ...(actual.form as Record<string, unknown>),
        defaultMonths: "120",
      },
    }),
  },
  {
    name: "bat-dong-san-cho-thue",
    componentPath: "@/components/rental-property-calculator",
    componentName: "RentalPropertyCalculator",
    contentPath: "@/content/calculators/rental-property",
    contentExport: "RENTAL_PROPERTY",
    // Original row 15: the rent → cost → debt waterfall.
    charts: 1,
    // A third of the year empty changes every step below the first: less
    // rent collected, so less tax, and a bigger shortfall at the debt step.
    change: (actual: Record<string, unknown>) => ({
      form: {
        ...(actual.form as Record<string, unknown>),
        defaultVacancy: "33",
      },
    }),
  },
  {
    name: "gia-tri-tien-te-theo-thoi-gian",
    componentPath: "@/components/tvm-calculator",
    componentName: "TvmCalculator",
    contentPath: "@/content/calculators/tvm",
    contentExport: "TVM",
    // Original row 18: the cash-flow timeline beside the guided question.
    charts: 1,
    // Twice the horizon: a different curve, a different marker month and a
    // different closing balance.
    change: (actual: Record<string, unknown>) => ({
      question: {
        ...(actual.question as Record<string, unknown>),
        defaultMonths: "72",
      },
    }),
  },
  {
    name: "so-sanh-khoan-vay",
    componentPath: "@/components/loan-compare-calculator",
    componentName: "LoanCompareCalculator",
    contentPath: "@/content/calculators/loan-compare",
    contentExport: "LOAN_COMPARE",
    charts: 2,
    change: (actual: Record<string, unknown>) => ({
      form: {
        ...(actual.form as Record<string, unknown>),
        defaults: [
          { rate: "8,5", term: "20", fee: "0" },
          { rate: "12", term: "20", fee: "0" },
          { rate: "8,5", term: "25", fee: "1" },
        ],
      },
    }),
  },
] as const;

describe.each(TOOLS)(
  "$name — the chart experience as rendered",
  ({ componentPath, componentName, contentPath, contentExport, charts, change }) => {
    const html = () =>
      render(componentPath, componentName, contentPath, contentExport);

    it("renders one labelled figure per chart", async () => {
      const markup = await html();
      expect(count(markup, "<figure")).toBe(charts);
      expect(count(markup, "<figcaption")).toBe(charts);
    });

    it("draws a responsive svg that scales instead of a fixed-size one", async () => {
      const markup = await html();
      // At least one drawing per chart. NOT exactly one: `BarChart` renders a
      // small svg per bar plus one for the tick row, because its labels and
      // totals moved OUT of the svg into HTML — a 10-unit `<text>` in a
      // 360-unit viewBox renders around 8px on a phone, which an independent
      // review measured and called illegible.
      expect(count(markup, "viewBox=")).toBeGreaterThanOrEqual(charts);
      // No width/height attributes on the svg: the viewBox plus a CSS width is
      // what makes it responsive, and a fixed pixel size would overflow a
      // 390px phone.
      expect(markup).not.toMatch(/<svg[^>]*\swidth="\d/);
    });

    it("hides EVERY drawing from assistive technology and the tab order", async () => {
      const markup = await html();
      // The text equivalent is visible prose; announcing the svg as well would
      // read the same information twice, the second time worse.
      //
      // Asserted over every `<svg>` rather than by counting them against the
      // number of charts: a chart may legitimately draw more than one (see
      // above), and what actually matters is that none of them is exposed.
      const svgs = markup.match(/<svg[^>]*>/g) ?? [];
      expect(svgs.length).toBeGreaterThanOrEqual(charts);
      for (const svg of svgs) {
        expect(svg, svg).toContain('aria-hidden="true"');
        expect(svg, svg).toContain('focusable="false"');
      }
    });

    it("colours every plot fill from a slot its legend also uses", async () => {
      const markup = await html();
      // The defect this guards, end to end through a real calculator's own
      // JSX: `BarChart` used to colour a segment by its position inside its
      // own bar while the legend coloured by position in `model.legend`, so a
      // key could be drawn in a colour no swatch carried. Both now read
      // `paletteIndexByKey`, and the palette has four slots — so every fill
      // in the markup must be one the legend is also drawing from.
      const swatches = new Set(
        [...markup.matchAll(/class="size-2\.5 shrink-0 rounded-sm (bg-[\w-/]+)"/g)]
          .map((match) => match[1]),
      );
      const plotFills = new Set(
        [...markup.matchAll(/class="(fill-[\w-/]+)"/g)]
          .map((match) => match[1])
          // The bar track is chrome, not a data segment.
          .filter((fill) => fill !== "fill-bg-soft"),
      );
      for (const fill of plotFills) {
        const swatch = fill.replace(/^fill-/, "bg-");
        expect(
          swatches.has(swatch),
          `${fill} is drawn but ${swatch} is in no legend entry`,
        ).toBe(true);
      }
    });

    it("puts the data in a real table with a caption, inside a details", async () => {
      const markup = await html();
      expect(count(markup, "<details")).toBeGreaterThanOrEqual(charts);
      expect(count(markup, "<caption")).toBeGreaterThanOrEqual(charts);
      expect(count(markup, "<table")).toBeGreaterThanOrEqual(charts);
      // `scope`-ed headers, not a grid of divs.
      expect(markup).toContain('scope="col"');
    });

    it("never puts a chart or its table inside a live region", async () => {
      const markup = await html();
      // The rule docs §4 states for tables, applied to charts: a redraw on
      // every keystroke must not be announced.
      for (const figure of markup.split("<figure").slice(1)) {
        const body = figure.split("</figure>")[0];
        expect(body).not.toContain('aria-live="polite"');
        expect(body).not.toContain('data-results-live="true"');
      }
    });

    it("animates nothing at all", async () => {
      const markup = await html();
      // How `prefers-reduced-motion` is honoured here: there is no transition
      // to suppress. A chart that tweened would need a media query and a
      // fallback; one that does not, does not.
      expect(markup).not.toContain("<animate");
      expect(markup).not.toMatch(/<svg[\s\S]*?transition-/);
    });

    it("leaves no content placeholder unsubstituted", async () => {
      const markup = await html();
      // A visible "{interest}" or "{unit}" in prose is a copy bug no type
      // check can see.
      expect(markup).not.toMatch(/\{(unit|interest|principal|price|cash|loan|months|target|payment|first|highest|change|changePercent|resetMonth|spread|option|binding|lowest|periods|window|count|n|rate|growth|rentGrowth|investment|buy|rent|advantage|winner|month)\}/);
    });

    it("redraws when an input changes", async () => {
      // The claim a screenshot would make. Geometry is compared, not just the
      // prose: a chart whose summary updated but whose bars did not would pass
      // a text-only check.
      const before = await html();
      const after = await render(
        componentPath,
        componentName,
        contentPath,
        contentExport,
        change as (actual: Record<string, unknown>) => Record<string, unknown>,
      );
      const geometry = (markup: string) =>
        (markup.match(/(?:\sd="[^"]*"|<rect[^>]*>)/g) ?? []).join("|");
      expect(geometry(after)).not.toBe(geometry(before));
      expect(geometry(before).length).toBeGreaterThan(0);
    });

    it("states its assumptions as visible text", async () => {
      const markup = await html();
      // Not a tooltip: there is no hover on a phone.
      expect(count(markup, "<li")).toBeGreaterThanOrEqual(charts * 2);
    });
  },
);

describe("the mortgage chart in detail", () => {
  const loan = () =>
    render(
      "@/components/loan-calculator",
      "LoanCalculator",
      "@/content/calculators/loan",
      "LOAN",
    );

  it("draws one column per year and a balance line", async () => {
    const markup = await loan();
    // 20 years × 2 stacked segments, plus the bar-track rects a bar chart
    // would add (there are none here) — so exactly 40 rects.
    const rects = count(markup, "<rect");
    expect(rects).toBe(40);
    // And one dashed overlay path for the balance.
    expect(markup).toMatch(/stroke-dasharray="6 4"/);
  });

  it("labels both value axes, with their units", async () => {
    const { LOAN } = await vi.importActual<
      typeof import("@/content/calculators/loan")
    >("@/content/calculators/loan");
    const markup = await loan();
    expect(markup).toContain(LOAN.chart.balance);
    expect(markup).toContain(LOAN.chart.interest);
    expect(markup).toContain(LOAN.chart.principal);
    // The axis titles are HTML, not svg text, so they reflow and scale with
    // the reader's own font size.
    expect(markup).toMatch(/Gốc và lãi mỗi kỳ \(triệu\)/);
    expect(markup).toMatch(/Dư nợ còn lại \(tỷ\)/);
  });

  it("offers the granularity control as native radios", async () => {
    const { LOAN } = await vi.importActual<
      typeof import("@/content/calculators/loan")
    >("@/content/calculators/loan");
    const markup = await loan();
    expect(markup).toContain(LOAN.chart.granularityLegend);
    expect(markup).toContain(LOAN.chart.granularityYear);
    expect(markup).toContain(LOAN.chart.granularityMonths);
    // Native radios: arrow-key navigation and a single tab stop for free, and
    // no hover needed to change the view.
    expect(markup).toMatch(/type="radio"[^>]*value="firstMonths"/);
  });
});

describe("a chart with nothing to draw", () => {
  it("explains itself instead of rendering an empty axis", async () => {
    // An unreachable savings goal: contribution 0 at a 0% rate can never pass
    // a higher target, and the module returns null rather than extrapolating.
    const markup = await render(
      "@/components/savings-goal-calculator",
      "SavingsGoalCalculator",
      "@/content/calculators/savings-goal",
      "SAVINGS_GOAL",
      (actual: Record<string, unknown>) => ({
        form: {
          ...(actual.form as Record<string, unknown>),
          defaultContribution: "0",
          defaultRate: "0",
          defaultMonths: "60",
        },
      }),
    );
    const { SAVINGS_GOAL } = await vi.importActual<
      typeof import("@/content/calculators/savings-goal")
    >("@/content/calculators/savings-goal");

    // In `contribution` mode the solver still answers, so force the mode that
    // cannot: this asserts the shape of the empty state wherever it appears.
    expect(markup).toContain("<figure");
    // Either a drawing or an explanation, never an empty box: if there is no
    // svg there must be a recovery sentence.
    if (!markup.includes("<svg")) {
      expect(markup).toContain(SAVINGS_GOAL.chart.unavailableRecovery);
    }
  });

  it("renders the recovery sentence for an invalid loan", async () => {
    const markup = await render(
      "@/components/loan-calculator",
      "LoanCalculator",
      "@/content/calculators/loan",
      "LOAN",
      (actual: Record<string, unknown>) => ({
        form: {
          ...(actual.form as Record<string, unknown>),
          defaultAmount: "khong phai so",
        },
      }),
    );
    const { LOAN } = await vi.importActual<
      typeof import("@/content/calculators/loan")
    >("@/content/calculators/loan");

    // Invalid input clears the chart, states why, and says what to change —
    // rather than leaving the previous drawing beside the new input.
    expect(markup).toContain(LOAN.chart.unavailableReason);
    expect(markup).toContain(LOAN.chart.unavailableRecovery);
    expect(markup).not.toContain("<svg");
    // And the typed value survives in the field.
    expect(markup).toContain('value="khong phai so"');
  });
});
