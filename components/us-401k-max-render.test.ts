/**
 * Rendered-markup contracts for `/cong-cu/toi-da-401k/` — plan row 49.
 *
 * WHAT THE ROW ASKED FOR: "Dẫn bằng số tiền mỗi kỳ lương; bảng đối ứng/dồn
 * sớm là phần so sánh mở rộng; tách riêng lý do thiếu giá trị mỗi kỳ."
 *
 * THE THIRD CLAUSE IS THE ONE WITH TEETH, and the evaluated review is
 * explicit that the causes must be REPRODUCED before being worded. They are,
 * below, one test each:
 *
 *   `perPeriodAmount === null`   ⟺ periodsRemaining <= 0  (the year is over)
 *   `perPeriodPercent === null`  additionally when payPerPeriod <= 0 (no pay)
 *   room exhausted WITH paychecks left → amount is 0, NOT null
 *   contributed beyond the limit → a separate state again
 *
 * So a dash on this page never stands unexplained, and a zero is never
 * described as a missing value.
 *
 * WHAT MUST NOT CHANGE: `computeUs401kMax` is untouched, and so is the
 * table's measured `mobileCards` decision.
 *
 * NOT A VISUAL CHECK. `renderToStaticMarkup` in the runner's plain `node`
 * environment; no width, no layout, no browser.
 */
import { describe, expect, it, vi } from "vitest";
import { createElement, type ComponentType, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { markupRegion } from "@/lib/markup-region";
import { US_401K_MAX } from "@/content/calculators/us-401k-max";
import { TOOL_SHELL } from "@/content/calculators/tool-shell";
import { formatMoney, parseDecimal, parseMoney } from "@/lib/calc/number";
import { computeUs401kMax, type Us401kMaxResult } from "@/lib/calc/us-401k-max";

const CONTENT_PATH = "@/content/calculators/us-401k-max";

const FORM_ID = "toi-da-401k-nhap";
const RESULT_ID = "toi-da-401k-ket-qua";

const F = US_401K_MAX.form;

type Defaults = Partial<Record<keyof typeof F.defaults, string>>;

/** Same `vi.doMock` lever as the other U-group render tests. */
async function render(
  defaults?: Defaults,
  props?: { actions?: ReactNode },
): Promise<string> {
  vi.resetModules();
  if (defaults !== undefined) {
    vi.doMock(CONTENT_PATH, async () => {
      const actual = (await vi.importActual(CONTENT_PATH)) as {
        US_401K_MAX: typeof US_401K_MAX;
      };
      return {
        US_401K_MAX: {
          ...actual.US_401K_MAX,
          form: {
            ...actual.US_401K_MAX.form,
            defaults: { ...actual.US_401K_MAX.form.defaults, ...defaults },
          },
        },
      };
    });
  }
  try {
    const loaded = (await import(
      "@/components/us-401k-max-calculator"
    )) as Record<string, ComponentType<{ actions?: ReactNode }>>;
    return renderToStaticMarkup(
      createElement(loaded.Us401kMaxCalculator, props ?? null),
    );
  } finally {
    vi.doUnmock(CONTENT_PATH);
    vi.resetModules();
  }
}

/** The engine, fed exactly what the component feeds it. */
function compute(defaults: Defaults = {}): Us401kMaxResult {
  const v = { ...F.defaults, ...defaults };
  const result = computeUs401kMax({
    year: Number(v.year),
    age: parseMoney(v.age) as number,
    annualSalary: parseMoney(v.salary) as number,
    payPeriodsPerYear: Number(v.periods),
    periodsElapsed: parseMoney(v.elapsed) as number,
    contributedSoFar: parseMoney(v.contributed) as number,
    employerMatchPercent: parseDecimal(v.matchPercent) as number,
    employerMatchLimitPercent: parseDecimal(v.matchLimit) as number,
    frontLoadPercent: parseDecimal(v.frontLoad) as number,
  });
  if (result === null) throw new Error("the engine refused a valid case");
  return result;
}

const usd = (value: number): string => `${formatMoney(value)} USD`;
const usdCents = (value: number): string => `${formatMoney(value, 2)} USD`;

const count = (html: string, needle: string): number =>
  html.split(needle).length - 1;

function regionOrder(html: string): string[] {
  return [...html.matchAll(/data-calc-region="([a-z]+)"/g)].map((m) => m[1]);
}

const resultRegion = (html: string): string =>
  html.slice(
    html.indexOf('data-calc-region="result"'),
    html.indexOf('data-calc-region="detail"'),
  );

const detailRegion = (html: string): string =>
  html.slice(html.indexOf('data-calc-region="detail"'));

describe("row 49 gets the shell contracts it never had", () => {
  it("renders form, result and detail in that order", async () => {
    expect(regionOrder(await render())).toEqual(["form", "result", "detail"]);
  });

  it("takes the grouped two-column split the row asked for", async () => {
    const html = await render();
    expect(html).toContain("lg:col-span-2");
    expect(html).toContain("lg:grid-cols-5");
  });

  it("puts the CTA in the form region, naming the answer", async () => {
    const html = await render();
    const form = html.slice(
      html.indexOf(`id="${FORM_ID}"`),
      html.indexOf('data-calc-region="result"'),
    );
    expect(form).toContain('data-calc-cta="true"');
    expect(form).toContain(`aria-controls="${RESULT_ID}"`);
    expect(html).toContain(TOOL_SHELL.cta.autoNote);
  });

  it("pins a short current answer, this form being a long one", async () => {
    // CORRECTED; the reason and the shelf-wide pinned / unpinned table are in
    // `components/u-long-form-cta.test.ts`. The pinned figure is the
    // per-paycheck amount, so it carries the placeholder whenever the ceiling
    // is out of reach — the same state the emphasised row shows.
    const html = await render();
    expect(html).toContain("fh-cta-pin");
    expect(html).toContain('data-calc-answer="true"');
  });

  it("leads with the per-paycheck amount, emphasised once", async () => {
    const html = await render();
    const r = compute();
    expect(count(html, "md:text-3xl")).toBe(1);
    expect(count(html, 'data-results-live="true"')).toBe(1);
    const result = resultRegion(html);
    expect(result).toContain(usdCents(r.perPeriodAmount!));
    const emphasised = result.slice(
      result.indexOf(F.perPeriodLabel),
      result.indexOf(F.perPeriodPercentLabel),
    );
    expect(emphasised).toContain("md:text-3xl");
    // The percent form of the same number is the second row, not the first:
    // a payroll system asks for one of the two, and the amount is exact.
    expect(result.indexOf(F.perPeriodLabel)).toBeLessThan(
      result.indexOf(F.perPeriodPercentLabel),
    );
  });

  it("keeps the reader's own schedule beside the answer", async () => {
    const html = await render();
    const r = compute();
    const result = resultRegion(html);
    expect(result).toContain(F.yourPlanTitle);
    expect(result).toContain(usdCents(r.planned.matchTrueUpPlan));
    expect(result).toContain(F.evenNotice);
    expect(result).not.toContain(F.lostMatchNotice);
  });
});

describe("the near-answer action slot", () => {
  /**
   * The reciprocal `gop-401k` link used to be `afterCalculator`, below the
   * full-width comparison band: an independently measured 426 px (mobile) and
   * 1288,5 px (desktop) past the end of the result region. A stand-in node
   * stands for it here, because the copy belongs to the route; the POSITION is
   * this component's contract. Same four assertions as the `gop-401k` half.
   */
  const MARKER = 'data-test="near-answer"';
  const actions = () =>
    createElement("div", { "data-test": "near-answer" }, "x");

  it("renders the slot inside the result column, above the detail band", async () => {
    const html = await render(undefined, { actions: actions() });
    expect(count(html, MARKER)).toBe(1);
    expect(resultRegion(html)).toContain(MARKER);
    expect(detailRegion(html)).not.toContain(MARKER);
  });

  it("puts it after the answer it acts on, not before it", async () => {
    const html = await render(undefined, { actions: actions() });
    const result = resultRegion(html);
    expect(result.indexOf(F.perPeriodLabel)).toBeLessThan(
      result.indexOf(MARKER),
    );
  });

  it("keeps it out of the live region, so it announces nothing", async () => {
    const html = await render(undefined, { actions: actions() });
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live).not.toBeNull();
    expect(live!).not.toContain(MARKER);
    expect(count(html, 'data-results-live="true"')).toBe(1);
  });

  it("renders nothing extra when the slot is empty", async () => {
    const html = await render();
    expect(html).not.toContain(MARKER);
    expect(regionOrder(html)).toEqual(["form", "result", "detail"]);
  });
});

describe("the front-load scenario is an expanded comparison", () => {
  it("puts the other schedule and its table behind one summary", async () => {
    const html = await render();
    const r = compute();
    const detail = detailRegion(html);
    expect(detail).toContain(F.comparisonDisclosureTitle);
    expect(detail).toContain(F.frontTitle);
    expect(detail).toContain(String(r.frontLoaded.emptyPeriods));
    expect(detail).toContain(usdCents(r.frontLoaded.matchLostWithoutTrueUp));
    // The table, its assumption line and its measured mobile decision.
    expect(detail).toContain(F.table.caption);
    expect(detail).toContain(F.table.intro);
    expect(detail).toContain("md:hidden");
    // Two summaries: the comparison and the statutory ladder.
    expect(count(detail, "<details")).toBe(2);
    expect(detail).toContain(F.limitsDisclosureTitle);
    expect(detail).toContain(usd(r.limit));
    expect(resultRegion(html)).not.toContain(F.frontTitle);
  });

  it("keeps the most-still-possible row in the answer, not the ladder", async () => {
    // `unreachableNotice` calls it "dòng … ở trên", so it has to be above.
    const html = await render();
    const r = compute();
    expect(resultRegion(html)).toContain(F.maxPossibleLabel);
    expect(resultRegion(html)).toContain(usd(r.maxStillPossible));
    expect(detailRegion(html)).not.toContain(F.maxPossibleLabel);
  });
});

describe("each missing per-paycheck value gets its own cause", () => {
  it("blanks both rows when the year has no paycheck left", async () => {
    // periodsRemaining <= 0 is the ONLY thing that nulls the amount.
    const d = { elapsed: "26" };
    const r = compute(d);
    expect(r.periodsRemaining).toBe(0);
    expect(r.perPeriodAmount).toBe(null);
    expect(r.perPeriodPercent).toBe(null);
    expect(r.alreadyAtLimit).toBe(false);
    const html = await render(d);
    expect(html).toContain(F.noPeriodsNotice);
    expect(html).not.toContain(F.noPayPercentNotice);
    expect(html).not.toContain(F.atLimitNotice);
    expect(html).not.toContain(F.unreachableNotice);
    // A finished year is not an invalid entry.
    expect(html).not.toContain('aria-invalid="true"');
    expect(html).not.toContain(F.invalidNotice);
    // The room is still a real figure beside the two dashes.
    expect(resultRegion(html)).toContain(usd(r.remainingRoom));
  });

  it("blanks only the percent when there is no paycheck to be a percent of", async () => {
    const d = { salary: "0" };
    const r = compute(d);
    expect(r.payPerPeriod).toBe(0);
    expect(r.perPeriodAmount).not.toBe(null);
    expect(r.perPeriodPercent).toBe(null);
    const html = await render(d);
    expect(html).toContain(F.noPayPercentNotice);
    expect(html).not.toContain(F.noPeriodsNotice);
    // The amount above survives, and the ceiling is out of reach for a
    // separate and stated reason.
    expect(resultRegion(html)).toContain(usdCents(r.perPeriodAmount!));
    expect(r.exceedsPay).toBe(true);
    expect(html).toContain(F.unreachableNotice);
    expect(html).not.toContain('aria-invalid="true"');
  });

  it("answers zero — not a dash — when the room is gone mid-year", async () => {
    // The distinction the evaluated review insisted on: exhausted room with
    // paychecks left is an INSTRUCTION TO STOP, not a missing value.
    const d = { elapsed: "13", contributed: "24.500" };
    const r = compute(d);
    expect(r.periodsRemaining).toBe(13);
    expect(r.remainingRoom).toBe(0);
    expect(r.perPeriodAmount).toBe(0);
    expect(r.perPeriodPercent).toBe(0);
    expect(r.alreadyAtLimit).toBe(true);
    expect(r.overLimit).toBe(0);
    const html = await render(d);
    expect(html).toContain(F.atLimitNotice);
    expect(html).not.toContain(F.noPeriodsNotice);
    expect(html).not.toContain(F.noPayPercentNotice);
    expect(html).not.toContain(F.overLimitNotice);
    expect(resultRegion(html)).toContain("0,00 USD");
    expect(resultRegion(html)).toContain("0,00%");
    expect(html).not.toContain('aria-invalid="true"');
  });

  it("separates having gone over the limit from having reached it", async () => {
    const d = { contributed: "30.000" };
    const r = compute(d);
    expect(r.overLimit).toBeGreaterThan(0);
    expect(r.alreadyAtLimit).toBe(true);
    const html = await render(d);
    expect(html).toContain(F.overLimitNotice);
    expect(html).not.toContain(F.atLimitNotice);
    expect(html).not.toContain('aria-invalid="true"');
  });

  it("says the ceiling is out of reach with one paycheck left", async () => {
    const d = { elapsed: "25" };
    const r = compute(d);
    expect(r.exceedsPay).toBe(true);
    expect(r.perPeriodAmount).not.toBe(null);
    const html = await render(d);
    expect(resultRegion(html)).toContain(F.unreachableNotice);
    // And the honest ceiling is the row the notice points at.
    expect(resultRegion(html)).toContain(usd(r.maxStillPossible));
    expect(html).not.toContain(F.noPeriodsNotice);
  });

  it("says nothing extra on the shipped defaults", async () => {
    const html = await render();
    expect(html).not.toContain(F.noPeriodsNotice);
    expect(html).not.toContain(F.noPayPercentNotice);
    expect(html).not.toContain(F.unreachableNotice);
    expect(html).not.toContain(F.atLimitNotice);
    expect(html).not.toContain(F.overLimitNotice);
    expect(html).not.toContain(F.invalidNotice);
  });

  it("withholds every figure when elapsed periods exceed the year", async () => {
    // An elapsed count above the year's periods IS an input error, unlike
    // every state above it.
    const html = await render({ elapsed: "40" });
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain(F.elapsedInvalid);
    expect(html).toContain(F.invalidNotice);
    expect(html).toContain(TOOL_SHELL.cta.invalidNote);
    expect(html).not.toContain(F.table.caption);
    expect(regionOrder(html)).toEqual(["form", "result", "detail"]);
    expect(html).toContain("—");
  });
});

/**
 * THE TRUE-UP SENTENCE MAY NOT OUTRUN WHAT THE ROWS REPORT.
 *
 * Two states an independent review read on the shipped export:
 *
 * - elapsed 26: per-period amount and percent correctly unavailable, room
 *   24.500, 0 periods — and the sentence under the schedule group said the
 *   division earns the whole match and is safe for every plan document, when
 *   there is no period to divide into at all;
 * - elapsed 13 with 24.500 already contributed: 0/0 per period, room 0, 13
 *   periods, match 3.900 against 7.800, loss 3.900 — and "số kỳ góp dưới
 *   ngưỡng" displayed 0 while the sentence asserted there were such periods.
 *
 * Both are dynamic-copy corrections scoped to this tool. The engine, the
 * matching rules and every figure are untouched, which is why each case below
 * pins the numbers from `compute` before it reads the prose.
 */
describe("the true-up reading names only what the calculation reports", () => {
  it("judges no division when there is no period to divide into", async () => {
    const d = { elapsed: "26" };
    const r = compute(d);
    expect(r.perPeriodAmount).toBe(null);
    expect(r.periodsRemaining).toBe(0);
    expect(r.remainingRoom).toBe(24_500);
    const html = await render(d);
    expect(html).toContain(F.noDivisionMatchNotice);
    // The claim the review rejected: a schedule called safe for every plan
    // document when no schedule exists.
    expect(html).not.toContain(F.evenNotice);
    expect(html).not.toContain(F.lostMatchNotice);
    expect(html).not.toContain(F.lostMatchNoUnderPeriodsNotice);
    // The cause of the two dashes is still explained, separately, above.
    expect(html).toContain(F.noPeriodsNotice);
  });

  it("describes the loss without naming a cause the rows report as zero", async () => {
    const d = { elapsed: "13", contributed: "24.500" };
    const r = compute(d);
    expect(r.periodsRemaining).toBe(13);
    expect(r.planned.matchPerPeriodPlan).toBeCloseTo(3_900, 2);
    expect(r.planned.matchTrueUpPlan).toBeCloseTo(7_800, 2);
    expect(r.planned.matchLostWithoutTrueUp).toBeCloseTo(3_900, 2);
    // THE PREMISE of the correction: the displayed count is 0, so the old
    // sentence's "những kỳ lương góp dưới ngưỡng đối ứng" was unsupported.
    expect(r.planned.underThresholdPeriods).toBe(0);
    const html = await render(d);
    expect(html).toContain(F.lostMatchNoUnderPeriodsNotice);
    expect(html).not.toContain(F.lostMatchNotice);
    expect(html).not.toContain(F.evenNotice);
    // And the figures it reads are still the engine's own.
    expect(html).toContain(usdCents(r.planned.matchLostWithoutTrueUp));
  });

  it("keeps the original sentence where the cause IS reported", async () => {
    // Elapsed periods that really did defer below the per-period threshold:
    // the state the original wording describes, which must not be lost.
    const d = { elapsed: "13", contributed: "1.000" };
    const r = compute(d);
    expect(r.planned.underThresholdPeriods).toBeGreaterThan(0);
    expect(r.planned.matchLostWithoutTrueUp).toBeGreaterThan(0);
    const html = await render(d);
    expect(html).toContain(F.lostMatchNotice);
    expect(html).not.toContain(F.lostMatchNoUnderPeriodsNotice);
    expect(html).not.toContain(F.noDivisionMatchNotice);
  });

  it("still calls an even division safe on the shipped defaults", async () => {
    const r = compute();
    expect(r.perPeriodAmount).not.toBe(null);
    expect(r.planned.matchLostWithoutTrueUp).toBe(0);
    const html = await render();
    expect(html).toContain(F.evenNotice);
    expect(html).not.toContain(F.noDivisionMatchNotice);
    expect(html).not.toContain(F.lostMatchNoUnderPeriodsNotice);
  });
});
