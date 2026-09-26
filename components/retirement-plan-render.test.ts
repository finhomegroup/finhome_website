/**
 * Rendered-markup contracts for `/cong-cu/ke-hoach-huu-tri/` (plan row 44).
 *
 * WHY A RENDER TEST AND NOT A MODULE TEST. docs §6 records that three of this
 * suite's five worst defects were invisible to a green test run because they
 * lived in a COMPONENT or in a DEFAULT INPUT rather than in a module — and the
 * funded verdict on this page was exactly that defect. The engine has shipped
 * `fundedAtBoundary()` (see `lib/calc/long-term-plan.ts`) since the model slice
 * landed, with a documented policy for the float residue a closed-form
 * sustainable spend leaves in the final year of a projection. No component
 * consumed it: this page decided funded-ness with a bare
 * `result.depletionAge === null`, so a plan that is funded to within four
 * millionths of one đồng rendered as "Không đủ", with a depletion age and a
 * "kế hoạch này cạn tiền" notice under it. A module test cannot see that; only
 * rendering the component at a chosen default can.
 *
 * `renderToStaticMarkup` in the runner's plain `node` environment, with
 * `vi.doMock` on the content module to change one default — the idiom
 * `components/calc/chart/chart-render.test.ts` established, and the right
 * fidelity here because every calculator is prerendered at its defaults and
 * must hydrate byte-identically.
 *
 * What this file CANNOT check is appearance. Layout, contrast, touch targets
 * and overflow stay unverified by eye; nothing here may be reported as a
 * visual check.
 */
import { describe, expect, it, vi } from "vitest";
import { markupRegion } from "@/lib/markup-region";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { RETIREMENT_PLAN as C } from "@/content/calculators/retirement-plan";
import { LONG_TERM_PLAN } from "@/content/calculators/long-term-plan";
import {
  longTermMoney,
  readRetirement,
} from "@/components/calc/retirement-fields";
import {
  compactMoney,
  compactMoneyPair,
  fill,
} from "@/lib/calc/charts/labels";
import { resolveLongTermPlan } from "@/lib/calc/long-term-plan";
import { formatQuantity } from "@/lib/calc/number";

const CONTENT_PATH = "@/content/calculators/long-term-plan";

/** Render the calculator, optionally on a patched default scenario. */
async function render(
  defaults?: Partial<Record<string, string>>,
): Promise<string> {
  vi.resetModules();
  if (defaults) {
    vi.doMock(CONTENT_PATH, async () => {
      const actual = (await vi.importActual(CONTENT_PATH)) as {
        LONG_TERM_PLAN: typeof LONG_TERM_PLAN;
      };
      return {
        LONG_TERM_PLAN: {
          ...actual.LONG_TERM_PLAN,
          defaults: { ...actual.LONG_TERM_PLAN.defaults, ...defaults },
        },
      };
    });
  }
  try {
    const loaded = (await import("@/components/retirement-plan-calculator")) as
      Record<string, ComponentType>;
    return renderToStaticMarkup(
      createElement(loaded.RetirementPlanCalculator),
    );
  } finally {
    vi.doUnmock(CONTENT_PATH);
    vi.resetModules();
  }
}

const count = (html: string, needle: string | RegExp): number =>
  typeof needle === "string"
    ? html.split(needle).length - 1
    : (html.match(needle) ?? []).length;

/** The live results region, bounded by its own nesting. See `markupRegion`. */
const liveRegion = (html: string) =>
  markupRegion(html, 'data-results-live="true"');

/**
 * The plan the page opens on, resolved the way the component resolves it.
 *
 * The reader-first sentences are FILLED from this at render time, so the
 * tests below compare the markup with the engine rather than with a memory
 * of "82", "3 năm" or "20.942.597 ₫".
 */
function shipped() {
  const read = readRetirement(LONG_TERM_PLAN.defaults);
  if (read.input === null) throw new Error("the shipped defaults do not parse");
  const plan = resolveLongTermPlan(read.input);
  if (plan === null) throw new Error("resolveLongTermPlan refused the defaults");
  return { plan, result: plan.asEntered, input: plan.input };
}

/** The same resolution on a patched scenario — what `render(defaults)` shows. */
function resolved(defaults: Partial<Record<string, string>>) {
  const read = readRetirement({ ...LONG_TERM_PLAN.defaults, ...defaults });
  if (read.input === null) throw new Error("the fixture does not parse");
  const plan = resolveLongTermPlan(read.input);
  if (plan === null) throw new Error("resolveLongTermPlan refused the fixture");
  return { plan, result: plan.asEntered, input: plan.input };
}

/** The rounding the sentences use; the rows keep the exact figure. */
const rounded = (value: number) => compactMoney(value, LONG_TERM_PLAN.money);
const pct = (value: number) => formatQuantity(value, 4);

/**
 * A plan that is funded, which the projection reports as depleting.
 *
 * Constructed rather than found, so it is reproducible: at a zero REAL return
 * (`returnAfterPercent === inflationPercent`) the annuity-due factor is
 * exactly the retirement span, so a round balance over a round span is a round
 * sustainable spend that a form field can actually hold. 4 tỷ over 25 years is
 * 160.000.000 ₫ a year from the portfolio, plus the 36.000.000 ₫ of other
 * income, so a desired spend of exactly 196.000.000 ₫ is the boundary.
 *
 * `projectRetirement` then reports `depletionAge` 84 against a horizon of 85,
 * with an unpaid 0,0000040531 ₫ — the artefact `fundedAtBoundary`'s docstring
 * describes, at đồng magnitudes. Retiring today (`retirementAge` equal to
 * `currentAge`) keeps the accumulation phase out of it, so the only thing under
 * test is the drawdown verdict.
 */
const FUNDED_BOUNDARY = {
  currentAge: "60",
  retirementAge: "60",
  endAge: "85",
  currentBalance: "4.000.000.000",
  annualContribution: "0",
  contributionGrowthPercent: "0",
  returnBeforePercent: "4",
  returnAfterPercent: "4",
  inflationPercent: "4",
  desiredAnnualSpending: "196.000.000",
  otherAnnualIncome: "36.000.000",
} as const;

describe("ke-hoach-huu-tri, rendered at its shipped defaults", () => {
  it("reads the SHARED đồng scenario, not a scenario of its own", async () => {
    // The merge's whole point: four routes, one set of assumptions. A route
    // holding its own copy of the eleven defaults is how the four came to
    // disagree in the first place.
    const html = await render();
    expect(html).toContain(LONG_TERM_PLAN.defaults.currentBalance);
    expect(html).toContain(LONG_TERM_PLAN.defaults.desiredAnnualSpending);
    // The ₫ unit on a money field, which is the visible half of the currency
    // change. "USD" must appear nowhere on the page.
    expect(html).not.toContain("USD");
    expect(html).toContain("₫");
  });

  it("keeps exactly one live results region, with the table outside it", async () => {
    // docs §4: exactly one live region per page, and never a table inside one.
    // A 50-row schedule inside a polite region re-announces on every keystroke.
    //
    // The bound is `markupRegion`, which counts depth — its own tests cover
    // the three ways the ad-hoc bounds in this repo got it wrong. The
    // not-null check is the guard each of those was missing: a -1 bound
    // silently widens the region to the whole page.
    const html = await render();
    expect(count(html, 'data-results-live="true"')).toBe(1);
    const live = liveRegion(html);
    expect(live).not.toBeNull();
    expect(live).not.toContain("<table");

    // And the page's one table is where it belongs: inside the figure, which
    // is outside the live region. Asserted positively so the check cannot be
    // satisfied by a page that simply has no table at all.
    expect(count(html, "<table")).toBe(1);
    const figure = html.slice(html.indexOf("<figure"), html.indexOf("</figure>"));
    expect(figure).toContain("<table");
  });

  it("draws the trajectory figure the chart module was built for", async () => {
    // `longTermTrajectoryModel` was tested and rendered NOWHERE before this
    // slice. The frame's contracts belong to `ChartFigure`; what is asserted
    // here is that the figure exists at all and carries its text equivalent.
    const html = await render();
    expect(count(html, "<figure")).toBe(1);
    expect(html).toContain("<figcaption");
    expect(html).toContain(C.chart.title);
    // The summary is VISIBLE prose, and the drawing is not announced twice.
    expect(html).toContain(C.chart.readingNote);
    for (const svg of html.match(/<svg[^>]*>/g) ?? []) {
      expect(svg).toContain('aria-hidden="true"');
      expect(svg).toContain('focusable="false"');
    }
    // The exact reading is a real table inside a native <details>.
    expect(html).toContain(C.chart.tableCaption);
    expect(html).toContain("<details");
  });

  it("opens on a plan that is SHORT, and says which year in a sentence", async () => {
    // A planning tool whose default state reports "đủ" demonstrates nothing.
    // The conclusion names the engine's own depletion age and the horizon
    // the reader typed, in one sentence, with what to try after it.
    const html = await render();
    const { result, input } = shipped();
    expect(result.depletionAge).not.toBeNull();
    expect(html).toContain(
      fill(C.form.depletedHeadline, { depletionAge: result.depletionAge! }),
    );
    expect(html).toContain(
      fill(C.form.depletedBody, {
        endAge: input.endAge,
        depletionAge: result.depletionAge!,
        yearsShort: result.yearsShort,
      }),
    );
    expect(html).toContain(C.form.depletedTry);
    // Not the funded sentence, in any filling.
    expect(html).not.toContain("đủ đáp ứng mức chi mong muốn");
    // The depletion year is a PARTIAL payment, so all three figures are shown
    // rather than an age alone — exact in the detail, rounded in the sentence.
    expect(html).toContain(C.form.partialPlannedLabel);
    expect(html).toContain(C.form.partialShortLabel);
    expect(result.lastWithdrawalPaid!).toBeGreaterThan(0);
    expect(html).toContain(
      fill(C.form.depletedPartial, {
        planned: rounded(result.lastWithdrawalPlanned!),
        paid: rounded(result.lastWithdrawalPaid!),
      }),
    );
  });

});

/**
 * The 2026-09-21 UX pass on this route, which is audit CSV row 46: "Desktop:
 * form trái, kết luận và chart phải; ưu tiên đủ/thiếu, tuổi cạn tiền và khoản
 * cần điều chỉnh."
 *
 * The financial contracts above are untouched by it and are what prove that:
 * the funded verdict, the boundary residue, the one live region and the single
 * figure all still hold, on the same defaults, at the same values. Nothing in
 * this section changes a number.
 *
 * NONE of it is a visual check. The class assertion says a class is emitted.
 */
describe("row 46's layout and CTA", () => {
  it("renders form, then result, then detail", async () => {
    const html = await render();
    expect(
      [...html.matchAll(/data-calc-region="([a-z]+)"/g)].map((m) => m[1]),
    ).toEqual(["form", "result", "detail"]);
  });

  it("asks for the 40/60 split, because this is the suite's longest form", async () => {
    // Eleven fields across four groups. The split is why the verdict can be
    // seen while one of them is edited; `max-w-3xl` could not hold it, which
    // is why the route also opts into the shell's `wide`.
    expect(await render()).toContain("lg:col-span-2");
  });

  it("puts the verdict and the figure in the result region, the ledger below", async () => {
    const html = await render();
    const result = html.slice(
      html.indexOf('data-calc-region="result"'),
      html.indexOf('data-calc-region="detail"'),
    );
    const detail = html.slice(html.indexOf('data-calc-region="detail"'));

    // The answer and its drawing, beside the form.
    expect(result).toContain(C.form.verdictLabel);
    expect(result).toContain("<figure");

    // The ledger groups, full width underneath. Every figure in them was on
    // the page before and none was dropped — they moved, they did not go.
    expect(detail).toContain(C.form.nominalTitle);
    expect(detail).toContain(C.form.flowTitle);
    expect(detail).toContain(C.form.balanceAtRetirementLabel);
    expect(detail).toContain(C.form.totalContributedLabel);
    expect(detail).toContain(C.form.sustainableLabel);
    expect(detail).toContain(C.form.initialRateLabel);
  });

  it("leads with the three figures the CSV action names", async () => {
    // Enough-or-short, the depletion age, and the amount to adjust. The third
    // one MOVED UP: `shortfallLabel` used to be the eighth figure on the page,
    // in the cash-flow group.
    const html = await render();
    const live = liveRegion(html);
    expect(live).not.toBeNull();
    expect(live).toContain(C.form.verdictLabel);
    expect(live).toContain(C.form.depletionLabel);
    expect(live).toContain(C.form.shortfallLabel);
  });

  it("does not render the shortfall twice", async () => {
    // One quantity, one place. Two copies is how a page comes to show the same
    // figure with two different roundings.
    const html = await render();
    expect(count(html, C.form.shortfallLabel)).toBe(1);
  });

  it("emphasises the verdict and only the verdict", async () => {
    const html = await render();
    expect(count(html, "md:text-3xl")).toBe(1);
    // And it is the verdict's row, not some other figure that happens to be
    // first: the emphasised size appears after the verdict label and before
    // the next row's label.
    const emphasisAt = html.indexOf("md:text-3xl");
    expect(html.indexOf(C.form.verdictLabel)).toBeLessThan(emphasisAt);
    expect(emphasisAt).toBeLessThan(html.indexOf(C.form.depletionLabel));
  });

  it("wires the CTA to the region that carries the verdict", async () => {
    const html = await render();
    const anchor = 'aria-controls="ke-hoach-huu-tri-ket-qua"';
    expect(html).toContain(anchor);
    expect(html).toContain('id="ke-hoach-huu-tri-ket-qua"');
    expect(html).toContain('aria-labelledby="ke-hoach-huu-tri-ket-qua-title"');
    // The CTA is in the FORM region, after the inputs — not next to the
    // answer, which would be a control pointing at itself.
    const form = html.slice(
      html.indexOf('data-calc-region="form"'),
      html.indexOf('data-calc-region="result"'),
    );
    expect(form).toContain('data-calc-cta="true"');
  });

  it("names the promoted shortfall as an annual spend in today's money", async () => {
    // A browser pass read `20.942.597 ₫` beside a capital figure as the whole
    // plan's shortfall. Same value, same formula — the label now carries the
    // period and the price basis. The unit words are what is asserted, not the
    // sentence, so the copy can be reworded without this going stale.
    const html = await render();
    expect(C.form.shortfallLabel).toContain("mỗi năm");
    expect(C.form.shortfallLabel).toContain("theo giá hôm nay");
    expect(html).toContain(C.form.shortfallLabel);
  });

  it("puts the years short beside the depletion age, not in the detail", async () => {
    const html = await render();
    const live = liveRegion(html);
    expect(live).not.toBeNull();
    expect(live).toContain(C.form.depletionLabel);
    expect(live).toContain(C.form.yearsShortLabel);
    // `yearsShort` is 3 on the shipped defaults, in years.
    expect(live).toContain(`3 ${C.form.yearsUnit}`);
    // One place only.
    expect(count(html, C.form.yearsShortLabel)).toBe(1);
  });

  it("pins a short current-answer block without a second live region", async () => {
    const html = await render();
    // The verdict, restated on the CTA block for a long form.
    expect(html).toContain('data-calc-answer="true"');
    // Height-gated in `app/globals.css` — see `calculator-layout.test.ts`.
    expect(html).toContain("fh-cta-pin");
    // Hidden from assistive technology: the live region owns the
    // announcement, and a duplicate would report one recomputation twice.
    const block = html.slice(html.indexOf('data-calc-answer="true"') - 200);
    expect(block).toContain('aria-hidden="true"');
    // Still exactly one live region and one id for it.
    expect(count(html, 'data-results-live="true"')).toBe(1);
    expect(count(html, 'id="ke-hoach-huu-tri-ket-qua"')).toBe(1);
  });

  it("says the same thing in the pinned block as in the verdict row", async () => {
    // One formatted string, read twice — never two formattings of one value.
    const html = await render();
    expect(count(html, C.form.verdictNo)).toBe(2);
    expect(html).not.toContain(C.form.verdictYes);
  });

  it("keeps the conditions beside the conclusion, and the method one click down", async () => {
    // 2026-09-26: the < 180-character caps this test held were retired with
    // the reader-first rewrite. What is asserted instead is the contract the
    // caps stood in for: beside the verdict the reader is told it is an
    // estimate on THEIR rates, with those rates named, and how the verdict
    // was computed is disclosed under a label rather than deleted.
    const html = await render();
    const { input } = shipped();
    expect(html).toContain(C.form.estimateNote);
    expect(html).toContain(
      fill(C.form.assumptionsUsed, {
        before: pct(input.returnBeforePercent),
        after: pct(input.returnAfterPercent),
        inflation: pct(input.inflationPercent),
        growth: pct(input.contributionGrowthPercent),
      }),
    );
    expect(html).toContain(C.form.verdictDetailTitle);
    expect(html).toContain(C.form.verdictDetail);
    expect(html.indexOf(C.form.verdictDetailTitle)).toBeLessThan(
      html.indexOf(C.form.verdictDetail),
    );
  });

  it("moves the figure's worked arithmetic out of its caption", async () => {
    const html = await render();
    // All three amounts still reported with the figure, behind its own label.
    expect(html).toContain(C.chart.partialTitle);
    expect(html).toContain(C.form.partialPlannedLabel);
    // The caption keeps the two readings of the capital and the depletion age.
    expect(html).toContain(C.chart.readingNote);
  });

  it("opens by saying what to enter, what comes back and what to try", async () => {
    // The < 110-character cap this test held was retired 2026-09-26: the
    // one-line lede told a beginner nothing they could act on. The lede now
    // names the three things the reader enters, says the answer is the age
    // the money lasts to, and names the three levers to try.
    for (const phrase of ["đang có", "để dành thêm", "chi tiêu", "đến tuổi nào"]) {
      expect(C.lede, phrase).toContain(phrase);
    }
    for (const lever of ["để dành thêm", "nghỉ hưu muộn hơn", "điều chỉnh chi tiêu"]) {
      expect(C.lede, lever).toContain(lever);
    }
    // The labelled detail still says what the tool is not.
    expect(C.ledeDetailTitle.length).toBeGreaterThan(0);
    expect(C.ledeDetail).toContain("không phải dự báo");
  });

  it("positions the next-step node it is handed, and invents none", async () => {
    // `LongTermViews` is passed in from the route, so a bare render gets
    // nothing — which is the assertion: this component adds no next step of
    // its own, no save button, and no handoff. It only places the node.
    const html = await render();
    expect(html).not.toContain("Bước tiếp theo");
    expect(html).not.toContain("Lưu");
  });
});

describe("the funded boundary, on the rendered page", () => {
  it("calls a float-residue depletion FUNDED, as fundedAtBoundary decides", async () => {
    // THE DEFECT THIS FILE EXISTS FOR. `depletionAge` is 84 here and the plan
    // is funded: the unpaid part is 0,0000040531 ₫ of a 1,5e9 ₫ need in the
    // final year of the horizon. A verdict read straight off `depletionAge`
    // tells the reader their plan fails by four millionths of one đồng.
    const html = await render(FUNDED_BOUNDARY);
    expect(html).toContain(
      fill(C.form.fundedHeadline, {
        retirementAge: Number(FUNDED_BOUNDARY.retirementAge),
        endAge: Number(FUNDED_BOUNDARY.endAge),
      }),
    );
    expect(html).not.toContain("có thể không đáp ứng đủ");
    // And the shortfall sentence is the funded one: nothing is "còn thiếu".
    expect(html).toContain(C.form.shortfallNone);
  });

  it("states the residue it forgave instead of hiding it", async () => {
    // `fundedAtBoundary` returns the residue precisely so a consumer can say
    // it. A verdict that silently forgives a shortfall is one the reader
    // cannot check — and the same policy must never forgive a real shortfall,
    // which the default scenario above proves it does not.
    const html = await render(FUNDED_BOUNDARY);
    expect(html).toContain("0,000004");
  });
});

/**
 * The 2026-09-26 reader-first rewrite, on the rendered page.
 *
 * Every sentence below is FILLED from the same plan the rows are computed
 * from, so what is asserted is agreement between the prose and the engine —
 * the ages, the rounded amounts, the exact rows — not a memory of the default
 * scenario's numbers. Appearance is still not checked here.
 */
describe("the reader-first reading of the result", () => {
  it("says what the annual shortfall is, and what it is not, beside the row", async () => {
    const html = await render();
    const { result } = shipped();
    expect(result.spendingShortfall).toBeGreaterThan(0);
    const sentence = fill(C.form.shortfallMeaning, {
      shortfall: rounded(result.spendingShortfall),
    });
    expect(html).toContain(sentence);
    // The two readings the sentence must rule out — a browser pass read the
    // figure as the whole plan's shortfall, and the review as a contribution.
    expect(sentence).toContain("không phải số tiền cần để dành thêm");
    expect(sentence).toContain("không phải tổng số vốn còn thiếu");
    // The exact figure is still the row, and still once.
    expect(html).toContain(longTermMoney(result.spendingShortfall));
    expect(count(html, C.form.shortfallLabel)).toBe(1);
  });

  it("explains purchasing power AFTER the result, with the reader's own figures", async () => {
    const html = await render();
    const { result, input } = shipped();
    const [capital, realCapital] = compactMoneyPair(
      result.balanceAtRetirement,
      result.realBalanceAtRetirement,
      LONG_TERM_PLAN.money,
    );
    const first = result.years.find((row) => !row.accumulating)!;
    expect(first.withdrawal).toBeGreaterThan(0);
    const block = [
      fill(C.form.purchasingPower, {
        inflation: pct(input.inflationPercent),
        retirementAge: input.retirementAge,
        capital,
        realCapital,
      }),
      fill(C.form.purchasingPowerDraw, {
        nominalDraw: rounded(first.withdrawal),
        realDraw: rounded(first.realWithdrawal),
      }),
      C.form.purchasingPowerClose,
    ].join(" ");
    expect(html).toContain(block);
    // Rounded in the sentence, exact in the detail rows — both on the page.
    expect(capital).not.toBe(longTermMoney(result.balanceAtRetirement));
    expect(html).toContain(longTermMoney(result.balanceAtRetirement));
    expect(html).toContain(longTermMoney(result.realBalanceAtRetirement));
    // After the result, not above the form: the block follows the live region.
    expect(html.indexOf(C.form.purchasingPowerTitle)).toBeGreaterThan(
      html.indexOf('data-results-live="true"'),
    );
  });

  it("does not describe a pension-funded plan as a funded portfolio", async () => {
    // Other income at the whole desired spend: the savings are never drawn,
    // `fundedByOtherIncome` is true, and the sentence has to say THAT rather
    // than crediting the savings for what the pension did.
    const html = await render({ otherAnnualIncome: "240.000.000" });
    expect(html).toContain(
      fill(C.form.fundedHeadline, {
        retirementAge: Number(LONG_TERM_PLAN.defaults.retirementAge),
        endAge: Number(LONG_TERM_PLAN.defaults.endAge),
      }),
    );
    expect(html).toContain(C.form.otherIncomeNote);
    expect(html).not.toContain("có thể duy trì mức chi khoảng");
  });

  it("labels the figure in ages, and names the moment of retirement by age", async () => {
    const html = await render();
    const { input } = shipped();
    expect(html).toContain(C.chart.xAxis);
    expect(html).toContain(
      fill(C.chart.retirementMarker, { age: input.retirementAge }),
    );
    // The old axis title is gone: nobody adds their age to "năm thứ 13".
    expect(html).not.toContain("Năm kể từ hôm nay");
  });

  it("leaves no template placeholder unfilled, in any state", async () => {
    // Every sentence here is a `{placeholder}` template filled at render
    // time. `fill` deliberately leaves an unknown key visible rather than
    // printing "undefined", so a renamed key would ship as literal braces —
    // this is the check that turns that into a red test, on the short plan,
    // the funded boundary and the pension-funded case alike.
    for (const html of [
      await render(),
      await render(FUNDED_BOUNDARY),
      await render({ otherAnnualIncome: "240.000.000" }),
    ]) {
      expect(html).not.toMatch(/\{[a-zA-Z]+\}/);
      expect(html).not.toContain("undefined");
      expect(html).not.toContain(">null<");
    }
  });
});

/**
 * The bounded repair pass on the rewrite
 * (`artifacts/finhome-retirement-reader-first-repair-2026-09-26.md`). Each
 * item is a wording or financial-semantics fix; none moves a number, and the
 * numeric fixtures are pinned separately in `long-term-plan.test.ts`.
 */
describe("the repair pass: boundaries, the portfolio, and neutral teaching", () => {
  it("says the plan lasts TO the end age, not through it", async () => {
    // The engine runs the years up to `endAge − 1`: a horizon of 85 covers
    // spending until the reader turns 85. "đến hết tuổi 85" would claim the
    // age-85 year too.
    expect(C.form.fundedHeadline).not.toContain("hết tuổi");
    expect(C.chart.summaryFunded).not.toContain("hết tuổi");
    expect(C.form.fundedHeadline).toContain("đến tuổi {endAge}");
    expect(C.chart.summaryFunded).toContain("đến tuổi {endAge}");
    // And the funded sentence names the last year actually counted.
    const html = await render(FUNDED_BOUNDARY);
    const { result, input } = resolved(FUNDED_BOUNDARY);
    expect(result.years.at(-1)!.age).toBe(input.endAge - 1);
    expect(html).toContain(
      fill(C.form.fundedBody, {
        sustainable: rounded(result.sustainableSpending!),
        desired: rounded(input.desiredAnnualSpending),
        endAge: input.endAge,
        lastAge: input.endAge - 1,
      }),
    );
  });

  it("names the PORTFOLIO's draw in the depletion year, never total spending", async () => {
    // `lastWithdrawalPlanned` / `lastWithdrawalPaid` are the savings' figures
    // after other income. A sentence reading them as the household's whole
    // spend, or as "no money to spend at all", would be wrong whenever other
    // income exists — which it does on the defaults.
    for (const text of [
      C.form.depletedPartial,
      C.form.depletedNothingLeft,
      C.form.partialTitle,
      C.form.partialPlannedLabel,
      C.form.partialPaidLabel,
      C.chart.partialTitle,
      C.chart.partialNote,
    ]) {
      // Case-insensitive: a label starts the phrase with a capital.
      expect(text.toLowerCase(), text).toContain("khoản dành dụm");
    }
    expect(C.form.depletedPartial).toContain("thu nhập khác");
    expect(C.form.depletedNothingLeft).toContain("thu nhập khác");
    expect(C.form.depletedNothingLeft).not.toContain("không còn tiền để chi");
    // On the page, the depletion year's own figures sit under the portfolio
    // labels.
    const html = await render();
    const { result } = shipped();
    expect(html).toContain(C.form.partialPlannedLabel);
    expect(html).toContain(longTermMoney(result.lastWithdrawalPlanned!));
    expect(html).toContain(longTermMoney(result.lastWithdrawalPaid!));
  });

  it("teaches the two readings without assuming prices rise", async () => {
    // Static copy is read by every reader, including one who typed 0% or a
    // negative inflation. It may say what happens WHEN prices rise; the
    // claim about this reader's own purchasing power is the dynamic block's.
    expect(C.realNotice).toContain("Khi giá cả tăng");
    expect(C.chart.assumptions[1]).toContain("Khi giá cả tăng");
    expect(C.chart.readingNote).toContain("lạm phát bạn nhập");
    expect(C.chart.readingNote).toContain("trùng nhau");
    expect(C.chart.readingNote).not.toContain("đã lấy đi");
    // At 0% inflation the page uses the neutral branch with equal readings.
    const html = await render({ inflationPercent: "0" });
    const { result, input } = resolved({ inflationPercent: "0" });
    expect(result.balanceAtRetirement).toBeCloseTo(
      result.realBalanceAtRetirement,
      6,
    );
    const [capital, realCapital] = compactMoneyPair(
      result.balanceAtRetirement,
      result.realBalanceAtRetirement,
      LONG_TERM_PLAN.money,
    );
    expect(html).toContain(
      fill(C.form.purchasingPowerFlat, {
        inflation: pct(input.inflationPercent),
        retirementAge: input.retirementAge,
        capital,
        realCapital,
      }),
    );
    expect(html).not.toContain("mua được ít đồ hơn theo thời gian");
  });

  it("does not compare the capital with itself when retirement is today", async () => {
    // No accumulation year: `balanceAtRetirement` equals its real reading,
    // so "chỉ mua được lượng hàng mà X mua được hôm nay" would name X twice.
    const html = await render(FUNDED_BOUNDARY);
    const { result, input } = resolved(FUNDED_BOUNDARY);
    expect(input.retirementAge).toBe(input.currentAge);
    expect(result.balanceAtRetirement).toBe(result.realBalanceAtRetirement);
    expect(html).toContain(
      fill(C.form.purchasingPowerToday, {
        inflation: pct(input.inflationPercent),
        capital: rounded(result.balanceAtRetirement),
      }),
    );
    expect(html).not.toContain("chỉ mua được lượng hàng");
  });

  it("explains an age label as the balance on REACHING that age", () => {
    // An engine row for age 35 is the end of the age-35 year, drawn at the
    // age-36 date. "cuối năm đó" beside the label 36 read as the end of the
    // age-36 year — one year late. The data and markers did not move.
    expect(C.chart.assumptions[0]).toContain("vừa tròn tuổi đó");
    expect(C.chart.assumptions[0]).toContain("sau khi đã tính xong năm trước");
    expect(C.chart.assumptions[0]).not.toContain("cuối năm đó");
  });
});
