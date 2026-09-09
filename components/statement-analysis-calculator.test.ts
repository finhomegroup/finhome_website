// Guards for the statement-analysis page's PRESENTATION layer.
//
// `lib/calc/financials.test.ts` covers the arithmetic, and it passes every
// figure in as a number. That is exactly why it could not see the defect
// guarded here: it lives in the step between the computed percent and the
// rendered cell — a unit suffix on a delta between two percents. No module
// test can reach a formatting choice.
//
// Placement: these two tests were first written into
// `components/financial-ratios-calculator.test.ts` because this file was
// outside that change's edit set. `vitest run components/statement-analysis`
// then matched zero files, so the obvious targeted suite for this page gave a
// false all-clear to anyone editing `statement-analysis-calculator.tsx`. Split
// out here; the sibling file keeps the financial-ratios parser guards.
//
// Runs in the repo's node environment with no jsdom: it imports the client
// module but only calls PURE exported helpers out of it, never renders.

import { describe, expect, it } from "vitest";

import { readStatement } from "@/components/calc/financials-fields";
import {
  duPontRows,
  signedPoints,
} from "@/components/statement-analysis-calculator";
import { computeAnalysis } from "@/lib/calc/financials";
import { STATEMENT_ANALYSIS as SA } from "@/content/calculators/statement-analysis";

/**
 * Band for "the DuPont product reproduces the ROE row above it".
 *
 * The two sides are different floating-point routes to the same quantity:
 * `currentDuPont.returnOnEquityPercent` is the PRODUCT route (three divisions,
 * then three multiplications) while `returnOnEquityChangePoints` comes off the
 * DIRECT route (one division, then one multiplication). They agree to a couple
 * of ulp RELATIVELY, never bit-for-bit. Measured: the prefilled statement with
 * each of its 26 fields replaced in turn by each of 18 small integers — 468
 * statements, 936 per-period route pairs — leaves 155 pairs unequal, worst
 * relative gap 3,8e-16 (≈1,7 ulp); on the change quantity itself the worst
 * absolute gap was 5,7e-14, on a change of −193,86 points. The shipped
 * defaults happen to land on a gap of exactly 0, which is the only reason a
 * `toBe` here was green; `lib/calc/financials.test.ts` promises this agreement
 * at `toBeCloseTo(…, 6)`, i.e. ~1e-6, not equality.
 *
 * 1e-10 điểm % is >4 orders of magnitude above the ~2e-15 that 1,7 ulp comes
 * to at this row's 6,14-point magnitude, and still ~5e7 times tighter than the
 * 0,005-point rounding of the 2-dp cell the number is printed into.
 */
const ROE_ROUTE_BAND_POINTS = 1e-10;

/**
 * Band for "the module reproduces the hand-computed reference".
 *
 * Also two float routes to one number — the module scales each period to a
 * percent and then subtracts, the reference subtracts the two ratios and
 * scales once — so a band, not equality. Measured gap for the shipped
 * defaults is exactly 0 for both the margin and the ROE delta; 1e-12 leaves
 * nearly three decades over the ~1,4e-15 ulp of a 6-point figure without
 * letting a real arithmetic change through, being ~5e9 times tighter than the
 * 2-dp cell.
 */
const HAND_REFERENCE_BAND_POINTS = 1e-12;

function prefixed(defaults: Record<string, string>, prefix: string) {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(defaults)) {
    out[`${prefix}${key}`] = value;
  }
  return out;
}

describe("statement-analysis — the DuPont change column", () => {
  it("labels a delta between two percents as percentage POINTS", () => {
    expect(signedPoints(6.138775510204081)).toBe(`+6,14 ${SA.form.pointsUnit}`);
    expect(signedPoints(6.138775510204081)).not.toBe("+6,14%");
    expect(signedPoints(-2.5)).toBe(`−2,50 ${SA.form.pointsUnit}`);
    expect(signedPoints(0)).toBe(`0,00 ${SA.form.pointsUnit}`);
    expect(signedPoints(null)).toBe("—");
  });

  it("prints the prefilled two periods' deltas in points", () => {
    const values = {
      ...prefixed(SA.form.currentDefaults, "cur_"),
      ...prefixed(SA.form.priorDefaults, "pri_"),
    };
    const current = readStatement(values, "cur_");
    const prior = readStatement(values, "pri_");
    const result = computeAnalysis({
      current: current.input!,
      prior: prior.input!,
    })!;

    // Hand-computed, published definitions:
    //   biên thuần: 96/1.000 = 9,60% now vs 64/900 = 7,111…% before
    //     -> +2,4888… điểm %, while the RELATIVE change is +35,00%
    //   ROE:        96/500  = 19,20% now vs 64/490 = 13,0612…% before
    //     -> +6,1387… điểm %, while the RELATIVE change is +47,00%
    // The old bare "%" suffix printed the points figure as if it were the
    // relative one, understating the ROE move by a factor of ~7,7.
    const marginPoints =
      result.currentDuPont.netMargin! * 100 -
      result.priorDuPont.netMargin! * 100;
    const roePoints =
      result.currentDuPont.returnOnEquityPercent! -
      result.priorDuPont.returnOnEquityPercent!;

    expect(
      Math.abs(marginPoints - (96 / 1000 - 64 / 900) * 100),
    ).toBeLessThan(HAND_REFERENCE_BAND_POINTS);
    expect(Math.abs(roePoints - (96 / 500 - 64 / 490) * 100)).toBeLessThan(
      HAND_REFERENCE_BAND_POINTS,
    );

    expect(signedPoints(marginPoints)).toBe(`+2,49 ${SA.form.pointsUnit}`);
    expect(signedPoints(roePoints)).toBe(`+6,14 ${SA.form.pointsUnit}`);

    // The headline row above the table already read "điểm %"; the table cell
    // must now say the same thing about the same number. Product route vs
    // direct route, so a band — see ROE_ROUTE_BAND_POINTS.
    expect(
      Math.abs(roePoints - result.returnOnEquityChangePoints!),
    ).toBeLessThan(ROE_ROUTE_BAND_POINTS);
    // Same claim where it actually reaches the reader: at 2 dp the two routes
    // print the identical cell, which is the property the page depends on.
    expect(signedPoints(roePoints)).toBe(
      signedPoints(result.returnOnEquityChangePoints),
    );

    // The wiring, not just the helper: which formatter each row reaches for.
    // The two percent rows carry the points unit; the two multiple rows stay
    // unitless. This is the assertion that fails if anyone reintroduces
    // signedPercent on the DuPont change column.
    const change = duPontRows(result).map((row) => row[3]);
    expect(change).toEqual([
      `+2,49 ${SA.form.pointsUnit}`, // biên lợi nhuận thuần — percent -> points
      "+0,05", // vòng quay tài sản — a multiple, no unit
      "+0,07", // hệ số nhân vốn chủ — a multiple, no unit
      `+6,14 ${SA.form.pointsUnit}`, // nhân lại thành ROE — percent -> points
    ]);
    // No cell may end in a digit glued to "%" — that is the bare-percent form
    // the defect produced. "6,14 điểm %" ends in "%" too, but with the unit
    // word in front of it, so the digit-then-% shape is the discriminator.
    for (const cell of change) {
      expect(/\d\s*%$/.test(cell)).toBe(false);
    }
  });
});
