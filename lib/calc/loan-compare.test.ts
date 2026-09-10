import { describe, it, expect } from "vitest";
import { compareLoans, type LoanOption } from "@/lib/calc/loan-compare";
import { computeLoan } from "@/lib/calc/loan";
import { pmt } from "@/lib/calc/finance";

// A realistic Vietnamese mortgage shopping trip: 2 tỷ over 20 years, three
// banks quoting different rates, terms and arrangement fees.
const AMOUNT = 2_000_000_000;

const A: LoanOption = { annualRatePercent: 8.5, termMonths: 240 };
const B: LoanOption = { annualRatePercent: 9.2, termMonths: 240 };
const C: LoanOption = { annualRatePercent: 8.5, termMonths: 300 };

function compare(options: readonly LoanOption[], amount = AMOUNT) {
  const result = compareLoans({ amount, options });
  expect(result).not.toBeNull();
  return result!;
}

/** The row at `index`, asserted to have been computed. */
function row(options: readonly LoanOption[], index: number, amount = AMOUNT) {
  const found = compare(options, amount).rows[index];
  expect(found).not.toBeNull();
  return found!;
}

describe("compareLoans — each option's figures", () => {
  it("agrees with pmt() on the instalment", () => {
    expect(row([A, B], 0).monthlyPayment).toBeCloseTo(
      Math.abs(pmt(8.5 / 100 / 12, 240, AMOUNT)),
      6,
    );
  });

  it("agrees with computeLoan on interest", () => {
    const direct = computeLoan({
      amount: AMOUNT,
      annualRatePercent: 9.2,
      termMonths: 240,
    })!;
    expect(row([A, B], 1).totalInterest).toBeCloseTo(direct.totalInterest, 6);
  });

  it("charges the arrangement fee on the amount drawn, not on the total repaid", () => {
    const withFee = row([{ ...A, feePercent: 1 }, B], 0);
    expect(withFee.upfrontFee).toBeCloseTo(20_000_000, 6);
    expect(withFee.costOfBorrowing).toBeCloseTo(
      withFee.totalInterest + 20_000_000,
      6,
    );
  });

  it("treats an absent fee as zero", () => {
    expect(row([A, B], 0).upfrontFee).toBe(0);
    expect(row([A, B], 0).costOfBorrowing).toBeCloseTo(
      row([A, B], 0).totalInterest,
      6,
    );
  });

  it("keeps the outlay identity: outlay = principal + interest + fee", () => {
    const withFee = row([{ ...A, feePercent: 1.5 }, B], 0);
    expect(withFee.totalOutlay).toBeCloseTo(
      AMOUNT + withFee.totalInterest + withFee.upfrontFee,
      2,
    );
  });

  it("reports the term it actually amortized over", () => {
    expect(row([A, C], 1).months).toBe(300);
  });
});

describe("compareLoans — the comparison", () => {
  it("picks the lower rate at an equal term", () => {
    expect(compare([A, B]).bestIndex).toBe(0);
    expect(compare([B, A]).bestIndex).toBe(1);
  });

  it("picks the shorter term at an equal rate", () => {
    // The longer term has the smaller instalment and the larger total cost;
    // ranking on cost of borrowing must prefer the shorter one.
    const result = compare([C, A]);
    expect(result.bestIndex).toBe(1);
    expect(row([C, A], 0).monthlyPayment).toBeLessThan(
      row([C, A], 1).monthlyPayment,
    );
  });

  it("lets the fee overturn a lower headline rate", () => {
    // The whole reason this tool prices the fee. Over 240 months on 2 tỷ,
    // 0,1 điểm phần trăm of rate is worth ~30,43 triệu of interest — so a
    // 2% fee (40 triệu) on the cheaper rate more than eats the saving…
    const nearby: LoanOption = { annualRatePercent: 8.6, termMonths: 240 };
    expect(compare([{ ...A, feePercent: 2 }, nearby]).bestIndex).toBe(1);
    // …while a 0,5% fee (10 triệu) does not.
    expect(compare([{ ...A, feePercent: 0.5 }, nearby]).bestIndex).toBe(0);
  });

  it("zeroes extraVsBest on the winner and nowhere else", () => {
    const result = compare([A, B, C]);
    const winner = result.rows[result.bestIndex]!;
    expect(winner.extraVsBest).toBe(0);
    for (const candidate of result.rows) {
      if (candidate && candidate.index !== result.bestIndex) {
        expect(candidate.extraVsBest).toBeGreaterThan(0);
      }
    }
  });

  it("measures extraVsBest against the cheapest option", () => {
    const result = compare([A, B]);
    const [first, second] = result.rows;
    expect(second!.extraVsBest).toBeCloseTo(
      second!.costOfBorrowing - first!.costOfBorrowing,
      6,
    );
  });

  it("reports the spread as dearest minus cheapest", () => {
    const result = compare([A, B, C]);
    const costs = result.rows
      .filter((candidate) => candidate !== null)
      .map((candidate) => candidate!.costOfBorrowing);
    expect(result.spread).toBeCloseTo(
      Math.max(...costs) - Math.min(...costs),
      6,
    );
  });

  it("resolves a tie toward the first option", () => {
    const result = compare([A, { ...A }]);
    expect(result.bestIndex).toBe(0);
    expect(result.spread).toBe(0);
    expect(result.rows[1]!.extraVsBest).toBe(0);
  });

  it("handles a 0% rate without dividing by zero", () => {
    const free: LoanOption = { annualRatePercent: 0, termMonths: 240 };
    const result = compare([free, A]);
    expect(result.bestIndex).toBe(0);
    expect(result.rows[0]!.totalInterest).toBeCloseTo(0, 6);
    expect(result.rows[0]!.monthlyPayment).toBeCloseTo(AMOUNT / 240, 6);
  });
});

describe("compareLoans — alignment and rejection", () => {
  it("keeps rows positionally aligned, with null where an option failed", () => {
    // The middle option has no term; it must not shift C into B's place.
    const broken: LoanOption = { annualRatePercent: 9, termMonths: 0 };
    const result = compare([A, broken, C]);
    expect(result.rows[1]).toBeNull();
    expect(result.rows[0]!.index).toBe(0);
    expect(result.rows[2]!.index).toBe(2);
    expect(result.bestIndex).toBe(0);
  });

  it("returns null with fewer than two computable options", () => {
    expect(compareLoans({ amount: AMOUNT, options: [A] })).toBeNull();
    expect(compareLoans({ amount: AMOUNT, options: [] })).toBeNull();
    expect(
      compareLoans({
        amount: AMOUNT,
        options: [A, { annualRatePercent: 9, termMonths: -1 }],
      }),
    ).toBeNull();
  });

  it("returns null rather than a guess on a bad amount", () => {
    expect(compareLoans({ amount: 0, options: [A, B] })).toBeNull();
    expect(compareLoans({ amount: -1, options: [A, B] })).toBeNull();
    expect(compareLoans({ amount: Number.NaN, options: [A, B] })).toBeNull();
  });

  it("rejects an option with a negative rate, term or fee", () => {
    const bad: LoanOption[] = [
      { annualRatePercent: -1, termMonths: 240 },
      { annualRatePercent: 9, termMonths: 240.5 },
      { annualRatePercent: 9, termMonths: 240, feePercent: -1 },
      { annualRatePercent: Number.NaN, termMonths: 240 },
    ];
    for (const option of bad) {
      // Paired with two good options so only the bad one can be the null row.
      expect(compare([A, B, option]).rows[2]).toBeNull();
    }
  });

  it("survives a realistic 30-year term", () => {
    // Pinned because solveRate's bracket once overflowed past ~24 years and
    // every long mortgage came back as "no solution". See the design record.
    const long: LoanOption = { annualRatePercent: 8.5, termMonths: 360 };
    expect(row([A, long], 1).months).toBe(360);
    expect(row([A, long], 1).totalInterest).toBeGreaterThan(
      row([A, long], 0).totalInterest,
    );
  });
});
