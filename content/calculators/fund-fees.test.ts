// /cong-cu/phi-quy-dau-tu/ — original row 27.
//
// The module-at-its-shipped-defaults pattern docs §6 recommends: parse the
// content file's own default strings with the same parsers the component
// uses, run the module, format with the same formatter, and pin the result.
//
// What this file guards beyond that: WHICH FEES a figure is attributed to. An
// independent review found the method paragraph and a FAQ answer assigning the
// whole 1.066.857.503 ₫ wealth gap to the 515.853.900 ₫ management fee, while
// the default plan also pays 13.000.000 ₫ of entry fee. The arithmetic was
// right and the attribution was not.
import { describe, expect, it } from "vitest";
import { computeFundFees } from "@/lib/calc/fund-fees";
import { formatMoney, parseCount, parseDecimal, parseMoney } from "@/lib/calc/number";
import { FUND_FEES as C } from "@/content/calculators/fund-fees";

const F = C.form;

/** The plan exactly as the page ships it, parsed the way the component does. */
function shipped() {
  const result = computeFundFees({
    initial: parseMoney(F.defaultInitial)!,
    monthlyContribution: parseMoney(F.defaultContribution)!,
    // A whole count of months: `parseMoney("240")` would be right by luck
    // here and wrong on "3.0" (docs §4).
    months: parseCount(F.defaultMonths)!,
    grossReturnPercent: parseDecimal(F.defaultGrossReturn)!,
    entryFeePercent: parseDecimal(F.defaultEntryFee)!,
    managementFeePercent: parseDecimal(F.defaultManagementFee)!,
    exitFeePercent: parseDecimal(F.defaultExitFee)!,
  });
  expect(result).not.toBeNull();
  return result!;
}

const ALL_PROSE = [
  C.lede,
  C.compoundNotice,
  ...C.formula.body,
  ...C.faq.items.flatMap((item) => [item.q, item.a]),
].join(" ");

describe("the figures the copy quotes are the module's own", () => {
  const r = shipped();

  it("pins the default plan's own output", () => {
    expect(r.totalContributed).toBe(1_300_000_000);
    expect(formatMoney(r.netValue)).toBe("3.197.188.632");
    expect(formatMoney(r.grossValue)).toBe("4.264.046.135");
    expect(formatMoney(r.valueLost)).toBe("1.066.857.503");
    expect(formatMoney(r.totalManagementFees)).toBe("515.853.900");
    expect(formatMoney(r.totalEntryFees)).toBe("13.000.000");
    // No exit fee in the shipped defaults, so the two endpoint figures
    // coincide — which is why the table hint may not call them different.
    expect(r.exitFee).toBe(0);
  });

  it("quotes those figures in the prose", () => {
    for (const figure of [
      formatMoney(r.valueLost),
      formatMoney(r.totalManagementFees),
      formatMoney(r.totalEntryFees),
    ]) {
      expect(ALL_PROSE, `prose does not quote ${figure}`).toContain(figure);
    }
  });
});

describe("the wealth gap is attributed to the fees that caused it", () => {
  const r = shipped();

  it("is bigger than the management fee ALONE, so it cannot be its effect", () => {
    // The arithmetic that makes the old sentence wrong: the gap is driven by
    // every fee charged, and the default plan charges two.
    expect(r.totalFees).toBeCloseTo(
      r.totalManagementFees + r.totalEntryFees + r.exitFee,
      6,
    );
    expect(formatMoney(r.totalFees)).toBe("528.853.900");
    expect(r.totalFees).toBeGreaterThan(r.totalManagementFees);
    expect(r.valueLost).toBeGreaterThan(r.totalFees);
  });

  it("names the COMBINED effect wherever the gap is explained", () => {
    const sentence = C.formula.body.find((p) =>
      p.includes(formatMoney(r.valueLost)),
    );
    expect(sentence, "no method paragraph explains the gap").toBeDefined();
    // The total, and the word that stops it reading as one fee's effect.
    expect(sentence!).toContain(formatMoney(r.totalFees));
    expect(sentence!).toContain("tác động CHUNG");
    // The removed claim, in the asserted form it used to have.
    expect(ALL_PROSE).not.toContain(
      `Nhưng ${formatMoney(r.totalManagementFees)} ₫ phí quản lý lại làm mất`,
    );
  });

  it("says how to isolate the management fee instead of guessing", () => {
    const sentence = C.formula.body.find((p) => p.includes("tác động CHUNG"))!;
    expect(sentence).toContain("đặt hai ô phí còn lại về 0");
    // And the isolation really does work: management alone loses less.
    const managementOnly = computeFundFees({
      initial: parseMoney(F.defaultInitial)!,
      monthlyContribution: parseMoney(F.defaultContribution)!,
      months: parseCount(F.defaultMonths)!,
      grossReturnPercent: parseDecimal(F.defaultGrossReturn)!,
      entryFeePercent: 0,
      managementFeePercent: parseDecimal(F.defaultManagementFee)!,
      exitFeePercent: 0,
    })!;
    expect(managementOnly.valueLost).toBeLessThan(r.valueLost);
    expect(managementOnly.totalFees).toBeCloseTo(
      managementOnly.totalManagementFees,
      6,
    );
  });

  it("never tells a reader to gross up by ADDING the management fee", () => {
    // The engine retains multiplicatively, so addition does not invert it.
    // Executed here rather than asserted from the prose: 10% gross with a 2%
    // annual retention nets 7,8%, and 7,8 + 2 is 9,8.
    const net = (1.1 * 0.98 - 1) * 100;
    expect(net).toBeCloseTo(7.8, 9);
    expect(net + 2).toBeCloseTo(9.8, 9);
    expect(net + 2).not.toBeCloseTo(10, 6);

    const answer = C.faq.items.find((item) =>
      item.q.includes("trước hay sau phí"),
    )!;
    expect(answer.a).not.toContain("cộng lại phí quản lý vào lợi nhuận công bố");
    // The safe route is still offered, and the arithmetic is shown.
    expect(answer.a).toContain("để ô phí quản lý bằng 0");
    expect(answer.a).toContain("7,8%");
    expect(answer.a).toContain("9,8%");
    // And the whole page never suggests the shortcut anywhere else.
    expect(ALL_PROSE).not.toContain("cộng lại phí quản lý");
  });

  it("agrees with the engine on that net figure", () => {
    // The same 10%/2% plan through the module: one year, one lump, no other
    // fees. The net money-weighted return is the 7,8% the copy quotes.
    const oneYear = computeFundFees({
      initial: 100_000_000,
      monthlyContribution: 0,
      months: 12,
      grossReturnPercent: 10,
      entryFeePercent: 0,
      managementFeePercent: 2,
      exitFeePercent: 0,
    })!;
    expect(oneYear.netAnnualReturnPercent!).toBeCloseTo(7.8, 6);
    expect(oneYear.grossAnnualReturnPercent!).toBeCloseTo(10, 6);
  });

  it("keeps the FAQ question off the single-fee framing too", () => {
    const answer = C.faq.items.find((item) =>
      item.q.includes("làm mất hơn 1 tỷ"),
    );
    expect(answer, "no FAQ explains the gap").toBeDefined();
    expect(answer!.q).not.toContain("phí quản lý 515");
    expect(answer!.a).toContain("TỔNG phí thực trả");
    expect(answer!.a).toContain("không phải của riêng phí quản lý");
  });
});
