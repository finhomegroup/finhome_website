import { describe, it, expect } from "vitest";
import { computeFundFees, type FundFeesInput } from "@/lib/calc/fund-fees";

// 100 triệu in, 5 triệu a month for 20 years, 10%/năm gross, with the fee
// schedule a Vietnamese open-ended fund typically charges.
const BASE: FundFeesInput = {
  initial: 100_000_000,
  monthlyContribution: 5_000_000,
  months: 240,
  grossReturnPercent: 10,
  entryFeePercent: 1,
  managementFeePercent: 2,
  exitFeePercent: 0,
};

function fund(input: FundFeesInput) {
  const result = computeFundFees(input);
  expect(result).not.toBeNull();
  return result!;
}

describe("computeFundFees — the fee-free baseline", () => {
  it("charges nothing when every rate is zero", () => {
    const result = fund({
      ...BASE,
      entryFeePercent: 0,
      managementFeePercent: 0,
      exitFeePercent: 0,
    });
    expect(result.totalFees).toBeCloseTo(0, 6);
    expect(result.netValue).toBeCloseTo(result.grossValue, 4);
    expect(result.valueLost).toBeCloseTo(0, 4);
    expect(result.profitLostPercent).toBeCloseTo(0, 6);
  });

  it("converts the annual return geometrically, not by dividing by 12", () => {
    // A lump sum with no contributions must grow by exactly the annual rate
    // over twelve months.
    const result = fund({
      initial: 100_000_000,
      monthlyContribution: 0,
      months: 12,
      grossReturnPercent: 10,
      entryFeePercent: 0,
      managementFeePercent: 0,
    });
    expect(result.grossValue).toBeCloseTo(110_000_000, 2);
  });

  it("counts every contribution, before entry fees", () => {
    const result = fund(BASE);
    expect(result.totalContributed).toBe(
      100_000_000 + 5_000_000 * 240,
    );
  });
});

describe("computeFundFees — how each charge behaves", () => {
  it("takes the entry fee off every amount paid in", () => {
    const result = fund({ ...BASE, managementFeePercent: 0 });
    expect(result.totalEntryFees).toBeCloseTo(
      (100_000_000 + 5_000_000 * 240) * 0.01,
      4,
    );
  });

  it("accrues a full year of management fee to the stated annual rate", () => {
    // (1 − f)^(1/12) each month, so twelve months costs exactly f. Using
    // f/12 monthly would undercharge.
    const result = fund({
      initial: 100_000_000,
      monthlyContribution: 0,
      months: 12,
      grossReturnPercent: 0,
      entryFeePercent: 0,
      managementFeePercent: 2,
    });
    expect(result.netValue).toBeCloseTo(98_000_000, 2);
    expect(result.totalManagementFees).toBeCloseTo(2_000_000, 2);
  });

  it("charges the exit fee once, on the final balance", () => {
    const withExit = fund({ ...BASE, exitFeePercent: 1.5 });
    const withoutExit = fund(BASE);
    expect(withExit.exitFee).toBeCloseTo(
      withoutExit.netValue * 0.015,
      0,
    );
    expect(withExit.netValue).toBeLessThan(withoutExit.netValue);
  });

  it("keeps the fee total consistent with its parts", () => {
    const result = fund({ ...BASE, exitFeePercent: 1.5 });
    expect(result.totalFees).toBeCloseTo(
      result.totalEntryFees +
        result.totalManagementFees +
        result.exitFee,
      4,
    );
  });
});

describe("computeFundFees — the compounding cost", () => {
  it("costs far more than the fee rate suggests", () => {
    // The page's whole claim: a 2%/năm fee over 20 years takes roughly a
    // third of the gain, not 2% of it.
    const result = fund(BASE);
    expect(result.profitLostPercent!).toBeGreaterThan(25);
    expect(result.profitLostPercent!).toBeLessThan(50);
  });

  it("loses less of the balance than of the profit", () => {
    // Fees look small measured against assets and large against the gain,
    // which is exactly why both are reported.
    const result = fund(BASE);
    expect(result.valueLostPercent).toBeLessThan(result.profitLostPercent!);
  });

  it("grows with the holding period at the same fee rate", () => {
    let previous = 0;
    for (const months of [60, 120, 240, 360]) {
      const value = fund({ ...BASE, months }).profitLostPercent!;
      expect(value).toBeGreaterThan(previous);
      previous = value;
    }
  });

  it("grows with the management fee", () => {
    let previous = 0;
    for (const managementFeePercent of [0.5, 1, 2, 3]) {
      const value = fund({ ...BASE, managementFeePercent })
        .profitLostPercent!;
      expect(value).toBeGreaterThan(previous);
      previous = value;
    }
  });

  it("reports the drag in percentage points of annual return", () => {
    const result = fund(BASE);
    expect(result.annualDragPoints!).toBeCloseTo(
      result.grossAnnualReturnPercent! - result.netAnnualReturnPercent!,
      10,
    );
    expect(result.annualDragPoints!).toBeGreaterThan(0);
    // The drag on the achieved annual return is roughly the fee itself.
    expect(result.annualDragPoints!).toBeGreaterThan(1.5);
    expect(result.annualDragPoints!).toBeLessThan(3.5);
  });

  it("gives the gross input straight back when nothing is charged", () => {
    // The invariant the money-weighted definition exists for, and the test
    // that would have caught the old money-multiple version: that one raised
    // finalValue/totalContributed to 12/months, pricing 1,3 tỷ of monthly
    // instalments as if every đồng arrived on day one, and reported
    // 6,119%/năm for this plan at a 10%/năm input.
    //
    // Six places, not more: `bisect` stops at a 1e-12 bracket on the MONTHLY
    // rate, which is ~1e-9 once scaled to an annual percentage (measured
    // residue 7,8e-10). That is the solver's precision, not an error in the
    // cash flows.
    const result = fund({
      ...BASE,
      entryFeePercent: 0,
      managementFeePercent: 0,
      exitFeePercent: 0,
    });
    expect(result.grossAnnualReturnPercent!).toBeCloseTo(10, 6);
    expect(result.netAnnualReturnPercent!).toBeCloseTo(10, 6);
    expect(result.annualDragPoints!).toBeCloseTo(0, 6);
  });

  it("reports the gross input back whatever the fees are", () => {
    // grossValue never sees a fee, so the money-weighted rate of the fee-free
    // side is always the input the user typed. Same 6 dp, same reason.
    for (const grossReturnPercent of [0, 5, 10, 15]) {
      expect(
        fund({ ...BASE, grossReturnPercent }).grossAnnualReturnPercent!,
      ).toBeCloseTo(grossReturnPercent, 6);
    }
  });

  it("prices a management fee alone at exactly the closed-form net rate", () => {
    // CLOSED FORM, and the sharpest check in the file. A management fee is a
    // constant multiplicative haircut on every month's balance, so the net
    // side grows at (1 + gross) × (1 − fee) every year no matter WHEN the
    // money went in: 1,10 × 0,98 = 1,078, i.e. 7,8%/năm net and a drag of
    // exactly 2,2 points. The timing of the contributions cannot move it.
    //
    // The old money-multiple version could not produce 7,8 for this plan
    // under any fee schedule — it reported a 6,119% fee-free rate for a 10%
    // input, so the whole pair was wrong before the drag was subtracted.
    const result = fund({ ...BASE, entryFeePercent: 0 });
    expect(result.netAnnualReturnPercent!).toBeCloseTo(
      (1.1 * 0.98 - 1) * 100,
      6,
    );
    expect(result.annualDragPoints!).toBeCloseTo(2.2, 6);
  });

  it("prices an entry fee alone as a small fraction of a point", () => {
    // A 1% haircut on every amount paid in scales the whole net side by
    // exactly 0,99 (closed form below), so it costs the same 1% of terminal
    // value however long the plan runs — which spread over 20 years is worth
    // well under a tenth of a point of annual return, unlike the management
    // fee above.
    const result = fund({ ...BASE, managementFeePercent: 0 });
    expect(result.netValue).toBeCloseTo(result.grossValue * 0.99, 4);
    expect(result.annualDragPoints!).toBeGreaterThan(0);
    expect(result.annualDragPoints!).toBeLessThan(0.1);
  });

  it("charges more than the management fee once both fees are on", () => {
    // The page's claim about the default schedule. Reference solved outside
    // this module by bisecting the NPV of the actual flows (−100.000.000 at
    // t0, −5.000.000 at t=1..240, +netValue at t=240) with an independent
    // implementation at a 1e-15 bracket: 7,719304217829448%/năm net against
    // 10%/năm gross, a 2,280695782-point drag. 6 dp for the solver's own
    // precision, as above.
    const result = fund(BASE);
    expect(result.netAnnualReturnPercent!).toBeCloseTo(7.719304218, 6);
    expect(result.annualDragPoints!).toBeCloseTo(2.280695782, 6);
    // Strictly MORE than the 2%/năm management fee, because the 1% entry fee
    // sits on top of it. The copy at content/calculators/fund-fees.ts:117
    // rests on this.
    expect(result.annualDragPoints!).toBeGreaterThan(2);
    // And more than the two fees measured on their own add up to, which is
    // the direction the copy at :118 claims: charging the entry fee first
    // leaves a smaller balance, so each point of management fee bites into a
    // lower net return. Both fees on costs 2,281 against 2,279 apart.
    const separately =
      fund({ ...BASE, entryFeePercent: 0 }).annualDragPoints! +
      fund({ ...BASE, managementFeePercent: 0 }).annualDragPoints!;
    expect(result.annualDragPoints!).toBeGreaterThan(separately);
    expect(result.annualDragPoints! - separately).toBeLessThan(0.01);
  });

  it("declines rather than guessing when the plan is wiped out", () => {
    // A 100% exit fee leaves nothing, so there is no annual return to report
    // and 0% would be a lie — which is what the old code returned, because
    // `annualised` short-circuited to 0 on a non-positive value.
    const result = fund({ ...BASE, exitFeePercent: 100 });
    expect(result.netValue).toBe(0);
    expect(result.netAnnualReturnPercent).toBeNull();
    expect(result.annualDragPoints).toBeNull();
    expect(result.grossAnnualReturnPercent!).toBeCloseTo(10, 6);
  });

  it("keeps the value identity", () => {
    const result = fund({ ...BASE, exitFeePercent: 1.5 });
    expect(result.valueLost).toBeCloseTo(
      result.grossValue - result.netValue,
      4,
    );
    expect(result.netProfit).toBeCloseTo(
      result.netValue - result.totalContributed,
      4,
    );
    expect(result.grossProfit).toBeCloseTo(
      result.grossValue - result.totalContributed,
      4,
    );
  });
});

describe("computeFundFees — edges and rejection", () => {
  it("has no profit share to report when the gross return is zero", () => {
    const result = fund({ ...BASE, grossReturnPercent: 0 });
    expect(result.grossProfit).toBeCloseTo(0, 2);
    expect(result.profitLostPercent).toBeNull();
    // The fees are still real money.
    expect(result.totalFees).toBeGreaterThan(0);
    expect(result.netValue).toBeLessThan(result.totalContributed);
  });

  it("handles a lump sum with no contributions", () => {
    const result = fund({ ...BASE, monthlyContribution: 0 });
    expect(result.totalContributed).toBe(100_000_000);
    expect(result.netValue).toBeGreaterThan(0);
  });

  it("handles contributions with no lump sum", () => {
    const result = fund({ ...BASE, initial: 0 });
    expect(result.totalContributed).toBe(5_000_000 * 240);
    expect(result.netValue).toBeGreaterThan(0);
  });

  it("returns null rather than a guess", () => {
    expect(
      computeFundFees({ ...BASE, initial: 0, monthlyContribution: 0 }),
    ).toBeNull();
    expect(computeFundFees({ ...BASE, months: 0 })).toBeNull();
    expect(computeFundFees({ ...BASE, months: 240.5 })).toBeNull();
    expect(computeFundFees({ ...BASE, initial: -1 })).toBeNull();
    expect(computeFundFees({ ...BASE, entryFeePercent: -1 })).toBeNull();
    expect(computeFundFees({ ...BASE, entryFeePercent: 101 })).toBeNull();
    expect(
      computeFundFees({ ...BASE, managementFeePercent: 101 }),
    ).toBeNull();
    expect(computeFundFees({ ...BASE, exitFeePercent: 101 })).toBeNull();
    expect(
      computeFundFees({ ...BASE, grossReturnPercent: -100 }),
    ).toBeNull();
    expect(computeFundFees({ ...BASE, initial: Number.NaN })).toBeNull();
  });

  it("allows a negative gross return above −100%", () => {
    const result = fund({ ...BASE, grossReturnPercent: -5 });
    expect(result.netValue).toBeLessThan(result.totalContributed);
    expect(result.profitLostPercent).toBeNull();
  });
});

describe("computeFundFees — where the money-weighted rate has no root", () => {
  // The two null modes of `moneyWeightedAnnual`, pinned because prose
  // elsewhere quotes their boundaries: the docstring on that function and the
  // comment above the rate rows in `components/fund-fees-calculator.tsx`.
  // Both previously stated a boundary that is not the boundary — a fixed
  // "983 months" for a cutoff that moves with the plan, and "a 100% fee that
  // wipes the plan out" for a band that opens far short of a wipe-out.
  //
  // MODE 1, the bracket floor, has a closed form. `bisect` runs the monthly
  // rate over [−0,5, +1]. npv(+1) is essentially −initial − contribution and
  // so is always negative here, which means the rate is unsolvable exactly
  // when npv(−0,5) is negative too. At rate = −0,5 every discount factor is
  // 2^m, so
  //   npv(−0,5) = −initial − contribution·(2^(months+1) − 2) + terminal·2^months
  // and dividing through by 2^months leaves a threshold on the terminal
  // value alone. Named because the assertions below compare a computed
  // balance against it.
  const floorThreshold = (
    initial: number,
    contribution: number,
    months: number,
  ) => initial * 2 ** -months + contribution * (2 - 2 ** (1 - months));

  it("puts the floor threshold at twice the monthly contribution", () => {
    // `toBe`, not `toBeCloseTo`: on a 240-month plan both correction terms
    // vanish EXACTLY in double precision rather than merely nearly. 2^−239
    // is 1,1e−72, far under ulp(2) = 2,2e−16, so 2 − 2^−239 rounds to 2; and
    // initial·2^−240 is 5,7e−65, far under ulp(1e7) = 1,9e−9. So the
    // threshold is 2 × 5.000.000 to the last bit, and the initial lump has
    // no say in it at all on any realistic horizon.
    expect(floorThreshold(100_000_000, 5_000_000, 240)).toBe(10_000_000);
  });

  it("nulls the net rate well short of a wiped-out plan", () => {
    // What the page's comment used to deny. The threshold is a TERMINAL
    // VALUE, so an exit fee nowhere near 100% — and inside the 0–100 the
    // field documents and accepts — crosses it while millions of đồng remain.
    const threshold = floorThreshold(100_000_000, 5_000_000, 240);

    // 99,6%: still above the threshold, so the rate is still reported. Being
    // reportable this deep is the point — −99,74%/năm is a real answer.
    const solvable = fund({ ...BASE, exitFeePercent: 99.6 });
    expect(solvable.netValue).toBeGreaterThan(threshold);
    expect(solvable.netAnnualReturnPercent).not.toBeNull();
    expect(solvable.netAnnualReturnPercent!).toBeLessThan(-99);

    // 99,7%: below the threshold, so both the rate and the drag go blank.
    const nulled = fund({ ...BASE, exitFeePercent: 99.7 });
    expect(nulled.netValue).toBeLessThan(threshold);
    expect(nulled.netAnnualReturnPercent).toBeNull();
    expect(nulled.annualDragPoints).toBeNull();
    // The fee-free leg never sees a fee, so it still answers — the page shows
    // one populated rate row beside two blank ones.
    expect(nulled.grossAnnualReturnPercent!).toBeCloseTo(10, 6);

    // And the plan is emphatically NOT wiped out. Cross-checked against the
    // exit fee's own linearity rather than pinned to this module's output:
    // the fee takes 99,7% of the pre-exit balance, so 0,3% must survive. 6 dp
    // because the module computes `b − b·0,997` and not `b·0,003`, which
    // differ by 1,9e−8 ₫ in double precision.
    const balance = fund({ ...BASE, exitFeePercent: 0 }).netValue;
    expect(nulled.netValue).toBeCloseTo(balance * 0.003, 6);
    // 9.591.565,90 ₫. The calculator comment quotes this figure; 1 dp keeps
    // it honest to the đồng it is written to.
    expect(nulled.netValue).toBeCloseTo(9_591_565.9, 1);
  });

  it("nulls after a 100%/năm management fee without zeroing the plan", () => {
    // The other in-range route into the band. A 100%/năm fee retains
    // (1 − 1)^(1/12) = 0 of the balance every month, so the only survivor is
    // the LAST month's contribution, which lands after that month's fee is
    // taken: 5.000.000 net of the 1% entry fee. Exact, so `toBe`.
    const result = fund({ ...BASE, managementFeePercent: 100 });
    expect(result.netValue).toBe(5_000_000 * 0.99);
    expect(result.netValue).toBe(4_950_000);
    // Real money left, and still below the 10.000.000 ₫ threshold.
    expect(result.netValue).toBeLessThan(
      floorThreshold(100_000_000, 5_000_000, 240),
    );
    expect(result.netAnnualReturnPercent).toBeNull();
    expect(result.annualDragPoints).toBeNull();
    expect(result.grossAnnualReturnPercent!).toBeCloseTo(10, 6);
  });

  it("nulls above the bracket ceiling, where the floor threshold does not apply", () => {
    // MODE 2, the mirror of mode 1, and the reason mode 1's closed form has
    // to be conditioned on npv(+1) < 0 rather than stated flatly. A monthly
    // return over the bracket's +1 ceiling — (1 + 1)^12 − 1 = 409.500%/năm —
    // puts BOTH ends of the bracket on the same side of zero, so there is no
    // sign change even though a rate plainly exists. 1.000.000%/năm over a
    // single month is a monthly 115,4%, which clears the ceiling.
    const result = fund({
      initial: 1_000_000,
      monthlyContribution: 0,
      months: 1,
      grossReturnPercent: 1_000_000,
      entryFeePercent: 0,
      managementFeePercent: 0,
      exitFeePercent: 0,
    });
    // A one-month lump with no fees, so the implied monthly rate is just the
    // money multiple less one — no solver needed for the reference.
    expect(result.netValue / 1_000_000 - 1).toBeGreaterThan(1);
    expect(result.netAnnualReturnPercent).toBeNull();
    expect(result.grossAnnualReturnPercent).toBeNull();
    // And NOT because the terminal value is small: it sits far ABOVE the
    // mode-1 floor threshold, which is what makes this a separate mode and
    // not a second route into the same one.
    expect(result.netValue).toBeGreaterThan(floorThreshold(1_000_000, 0, 1));
  });

  it("tracks the overflow cutoff to the terminal value, not to a month count", () => {
    // MODE 2. `terminal / (1 + rate)^months` is terminal·2^months at the
    // floor, so the cutoff is wherever the terminal MAGNITUDE runs out of
    // exponent. It therefore differs between the two legs of one plan and
    // between two plans with identical fees and return — which is why the
    // docstring's old fixed "983 months" was wrong in both directions, and
    // why a guard or a test written against a constant would be too.
    //
    // Default plan at 984 months: the fee-free leg (terminal ~1,80e12)
    // overflows, the net leg (terminal ~4,19e11) does not.
    const at984 = fund({ ...BASE, months: 984 });
    expect(Number.isFinite(at984.grossValue * 2 ** 984)).toBe(false);
    expect(at984.grossAnnualReturnPercent).toBeNull();
    expect(at984.annualDragPoints).toBeNull();
    expect(Number.isFinite(at984.netValue * 2 ** 984)).toBe(true);
    expect(at984.netAnnualReturnPercent).not.toBeNull();
    // 3 dp: this is a solved rate, and 984 months past the old quoted
    // boundary it is still a perfectly ordinary 7,78%/năm.
    expect(at984.netAnnualReturnPercent!).toBeCloseTo(7.7846, 3);
    // 983 is not the cutoff for either leg: at 983 BOTH still answer.
    expect(fund({ ...BASE, months: 983 }).grossAnnualReturnPercent).not.toBeNull();
    expect(fund({ ...BASE, months: 983 }).netAnnualReturnPercent).not.toBeNull();
    // The net leg holds out two months longer than the fee-free one.
    expect(fund({ ...BASE, months: 985 }).netAnnualReturnPercent).not.toBeNull();
    expect(fund({ ...BASE, months: 986 }).netAnnualReturnPercent).toBeNull();

    // A larger plan overflows 14 months EARLIER on the same fees and return.
    const big = { ...BASE, initial: 1e12, monthlyContribution: 1e11 };
    expect(fund({ ...big, months: 969 }).grossAnnualReturnPercent).not.toBeNull();
    expect(fund({ ...big, months: 970 }).grossAnnualReturnPercent).toBeNull();

    // A 1 ₫ lump with no contributions holds out 29 months LATER.
    const tiny = { ...BASE, initial: 1, monthlyContribution: 0 };
    expect(fund({ ...tiny, months: 1012 }).grossAnnualReturnPercent).not.toBeNull();
    expect(fund({ ...tiny, months: 1013 }).grossAnnualReturnPercent).toBeNull();
  });
});
