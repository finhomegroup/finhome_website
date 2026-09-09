import { describe, it, expect } from "vitest";
import { computeBond, type BondInput } from "@/lib/calc/bond";
import { formatDecimal, formatMoney } from "@/lib/calc/number";

// A 100 triệu face bond, 8%/năm coupon paid semiannually, 5 years to run.
const BASE: BondInput = {
  faceValue: 100_000_000,
  couponRatePercent: 8,
  years: 5,
  paymentsPerYear: 2,
  yieldPercent: 10,
};

function bond(input: BondInput) {
  const result = computeBond(input);
  expect(result).not.toBeNull();
  return result!;
}

describe("computeBond — the coupon and the periods", () => {
  it("splits the annual coupon across the periods", () => {
    const result = bond(BASE);
    expect(result.couponPerYear).toBeCloseTo(8_000_000, 6);
    expect(result.couponPerPeriod).toBeCloseTo(4_000_000, 6);
    expect(result.periods).toBe(10);
  });

  it("pays the whole coupon once a year when told to", () => {
    const result = bond({ ...BASE, paymentsPerYear: 1 });
    expect(result.couponPerPeriod).toBeCloseTo(8_000_000, 6);
    expect(result.periods).toBe(5);
  });

  it("sums the undiscounted cash flows", () => {
    expect(bond(BASE).totalCashFlows).toBeCloseTo(140_000_000, 6);
  });
});

describe("computeBond — price from yield", () => {
  it("matches a hand-computed reference", () => {
    // 4 triệu × annuity(5%, 10) + 100 triệu / 1,05^10
    const annuity = (1 - 1.05 ** -10) / 0.05;
    const expected = 4_000_000 * annuity + 100_000_000 / 1.05 ** 10;
    expect(bond(BASE).price).toBeCloseTo(expected, 4);
    expect(bond(BASE).price).toBeCloseTo(92_278_265, 0);
  });

  it("prices at par whenever the yield equals the coupon, ulp residue and all", () => {
    // The bare `===` fallthrough made "par" unreachable for the
    // yield = coupon inputs that carry a float residue — 11,0% of the grid
    // swept below, not the 17% an earlier draft of this comment claimed. The
    // coupon arrives via faceValue × rate/100 ÷ paymentsPerYear and the
    // discount via yield/100 ÷ paymentsPerYear, so the cancellation leaves
    // ±1–2 ulp. [2,2,1] and [3,3,1] land on 99999999.99999999 and used to
    // read "discount" under a money row that said 100.000.000 ₫; [2,1,1]
    // lands on 100000000.00000001 and read "premium". [8,5,2], [2.5,10,2]
    // and [4,5,4] land on face exactly and were always "par".
    for (const [couponRatePercent, years, paymentsPerYear] of [
      [8, 5, 2],
      [2, 2, 1],
      [2, 1, 1],
      [3, 3, 1],
      [2.5, 10, 2],
      [4, 5, 4],
    ] as const) {
      const result = bond({
        ...BASE,
        couponRatePercent,
        years,
        paymentsPerYear,
        yieldPercent: couponRatePercent,
      });
      expect(result.price).toBeCloseTo(100_000_000, 4);
      expect(result.pricePercentOfFace).toBeCloseTo(100, 6);
      expect(result.quote).toBe("par");
    }
  });

  it("par is reachable across the whole offered grid", () => {
    // The grid PAR_BAND_DONG's why-comment quotes, spelled out here so its
    // "949 of 8.640 (11,0%)" is reproducible instead of second-hand: the four
    // face decades the form spans, the three payment frequencies it offers,
    // coupon 0,25%…20,00% in 0,25 steps, 1…9 năm, yield set equal to coupon.
    // Every combination is at par BY CONSTRUCTION, so every "premium" or
    // "discount" here is a float artefact. This is the assertion that would
    // have caught the original bare-`===` verdict.
    const faces = [100_000, 1_000_000, 10_000_000, 100_000_000];
    const frequencies = [1, 2, 4];
    const coupons = Array.from({ length: 80 }, (_, i) => (i + 1) * 0.25);
    const terms = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    let combinations = 0;
    let withResidue = 0;
    for (const faceValue of faces)
      for (const paymentsPerYear of frequencies)
        for (const couponRatePercent of coupons)
          for (const years of terms) {
            const result = bond({
              faceValue,
              couponRatePercent,
              years,
              paymentsPerYear,
              yieldPercent: couponRatePercent,
            });
            combinations += 1;
            // The verdict has to be "par" for all 8.640 of them.
            expect(result.quote).toBe("par");
            if (result.price !== faceValue) {
              withResidue += 1;
              // …and the two rows the band is sized from must agree with it,
              // which is what made the old verdict a visible contradiction.
              expect(formatMoney(result.price)).toBe(formatMoney(faceValue));
              expect(formatDecimal(result.pricePercentOfFace, 3)).toBe(
                "100,000",
              );
            }
          }
    expect(combinations).toBe(8_640);
    // 949 exactly on this repo's engine (Node 25.2.1 / V8 14.1). Not pinned
    // with toBe: `**` is implementation-approximated in ECMAScript, so a V8
    // upgrade can move a handful of the boundary cases and would block the
    // deploy gate for no reason. The band is wide enough to survive that and
    // narrow enough that the "11,0%" in PAR_BAND_DONG's why-comment stays the
    // right order of magnitude; the exact-count assertion above — all 8.640
    // read "par" — is the one that carries the fix.
    expect(withResidue).toBeGreaterThan(800);
    expect(withResidue).toBeLessThan(1_100);
  });

  it("still calls a bond a hair below par a discount", () => {
    // The band must not become sloppy: a yield one ten-thousandth of a point
    // above the coupon is 779 ₫ below par on this bond, which the page renders
    // as "99.999.221 ₫" / "99,999%" — visibly not par.
    const result = bond({
      ...BASE,
      couponRatePercent: 5,
      years: 10,
      yieldPercent: 5.0001,
    });
    expect(result.price).toBeCloseTo(99_999_220.55, 2);
    expect(result.quote).toBe("discount");
  });

  it("trades at a discount when the yield exceeds the coupon", () => {
    const result = bond(BASE);
    expect(result.price).toBeLessThan(100_000_000);
    expect(result.quote).toBe("discount");
  });

  it("trades at a premium when the yield is below the coupon", () => {
    const result = bond({ ...BASE, yieldPercent: 6 });
    expect(result.price).toBeGreaterThan(100_000_000);
    expect(result.quote).toBe("premium");
  });

  it("falls monotonically as the yield rises", () => {
    let previous = Number.POSITIVE_INFINITY;
    for (const yieldPercent of [2, 4, 6, 8, 10, 15, 25]) {
      const price = bond({ ...BASE, yieldPercent }).price;
      expect(price).toBeLessThan(previous);
      previous = price;
    }
  });

  it("is the undiscounted total at a 0% yield", () => {
    expect(bond({ ...BASE, yieldPercent: 0 }).price).toBeCloseTo(
      140_000_000,
      6,
    );
  });

  it("prices a zero-coupon bond off the face value alone", () => {
    const result = bond({ ...BASE, couponRatePercent: 0 });
    expect(result.couponPerPeriod).toBe(0);
    expect(result.price).toBeCloseTo(100_000_000 / 1.05 ** 10, 4);
    expect(result.currentYieldPercent).toBe(0);
  });
});

describe("computeBond — yield from price", () => {
  it("inverts the pricing exactly", () => {
    // The round trip that ties the two modes together.
    const priced = bond(BASE);
    const solved = bond({
      ...BASE,
      yieldPercent: undefined,
      price: priced.price,
    });
    expect(solved.yieldPercent).toBeCloseTo(10, 6);
  });

  it("returns the coupon rate at par", () => {
    const result = bond({
      ...BASE,
      yieldPercent: undefined,
      price: 100_000_000,
    });
    expect(result.yieldPercent).toBeCloseTo(8, 6);
  });

  it("gives a yield above the coupon at a discount", () => {
    const result = bond({
      ...BASE,
      yieldPercent: undefined,
      price: 90_000_000,
    });
    expect(result.yieldPercent!).toBeGreaterThan(8);
    expect(result.quote).toBe("discount");
  });

  it("gives a yield below the coupon at a premium", () => {
    const result = bond({
      ...BASE,
      yieldPercent: undefined,
      price: 110_000_000,
    });
    expect(result.yieldPercent!).toBeLessThan(8);
    expect(result.quote).toBe("premium");
  });

  it("round-trips at every price it is given", () => {
    for (const price of [70_000_000, 90_000_000, 100_000_000, 130_000_000]) {
      const solved = bond({ ...BASE, yieldPercent: undefined, price });
      const repriced = bond({ ...BASE, yieldPercent: solved.yieldPercent! });
      expect(repriced.price).toBeCloseTo(price, 0);
    }
  });

  it("keeps the par band at display precision", () => {
    const at = (price: number) =>
      bond({ ...BASE, yieldPercent: undefined, price }).quote;
    expect(at(100_000_000)).toBe("par");
    // 0,4 ₫ below par still renders as "100.000.000 ₫", so "par" is the only
    // verdict consistent with the row above it…
    expect(at(99_999_999.6)).toBe("par");
    expect(at(100_000_000.4)).toBe("par");
    // …but a whole đồng is visible, and stays a discount or a premium.
    expect(at(99_999_999)).toBe("discount");
    expect(at(100_000_001)).toBe("premium");
  });

  it("gives up at BOTH ends of the bracket, not just the high-price end", () => {
    // The module docstring used to say the only unsolvable prices were ones
    // ABOVE the bond's value at the derived lower bound. The 1000%/năm upper
    // bound is evaluated too, and a price below the value there is just as
    // unsolvable — the end a fat-fingered price or a face/price unit mix-up
    // actually reaches. This locks both directions so the docstring cannot
    // drift back to "only".
    const ceiling = bond({ ...BASE, yieldPercent: 1000 }).price;
    // Hand reference: 4 triệu × (1 − 6^−10) ÷ 5 + 100 triệu ÷ 6^10.
    const expected = 4_000_000 * ((1 - 6 ** -10) / 5) + 100_000_000 / 6 ** 10;
    expect(ceiling).toBeCloseTo(expected, 6);
    expect(ceiling).toBeCloseTo(800_001.64, 2);

    // At the ceiling exactly, `bisect` returns the endpoint.
    const atCeiling = bond({
      ...BASE,
      yieldPercent: undefined,
      price: ceiling,
    });
    expect(atCeiling.yieldPercent).toBe(1000);

    // Below it — the auditor's 500.000 ₫ unit mix-up — every yield-dependent
    // field is null while price and coupon stay valid.
    const tooLow = bond({ ...BASE, yieldPercent: undefined, price: 500_000 });
    expect(tooLow.yieldPercent).toBeNull();
    expect(tooLow.effectiveYieldPercent).toBeNull();
    expect(tooLow.macaulayDurationYears).toBeNull();
    expect(tooLow.modifiedDurationYears).toBeNull();
    expect(tooLow.priceChangePerPointRise).toBeNull();
    expect(tooLow.price).toBe(500_000);
    expect(tooLow.couponPerPeriod).toBeCloseTo(4_000_000, 6);
    expect(tooLow.quote).toBe("discount");

    // And the high-price end the docstring already named: above the bond's
    // value at the lowest searched yield, which at 10 kỳ clamps to
    // −0,999999 per period and puts the bound around 1,04e68 ₫.
    const tooHigh = bond({ ...BASE, yieldPercent: undefined, price: 1e70 });
    expect(tooHigh.yieldPercent).toBeNull();
    expect(tooHigh.macaulayDurationYears).toBeNull();
  });
});

describe("computeBond — long-dated bonds", () => {
  it("solves the yield of a long-dated bond, not just its price", () => {
    // §8 defect 1 recurring: the bisection bracket's lower bound is EVALUATED,
    // and at a per-period rate of exactly −0,999999 the discount factor is
    // (1e-6)^periods, so faceValue ÷ growth overflowed to Infinity at 51
    // periods and `bisect` bailed at its finiteness guard. Every bond past
    // 25 năm bán niên — and 13 năm hằng quý — reported no yield at all. The
    // previous version of this test spread BASE, which carries
    // yieldPercent: 10, so it only ever exercised the closed-form direction.
    //
    // Hand reference: 2,5 triệu × (1 − 1,03^−60) ÷ 0,03 + 100 triệu × 1,03^−60.
    const annuity = (1 - 1.03 ** -60) / 0.03;
    const expected = 2_500_000 * annuity + 100_000_000 / 1.03 ** 60;
    const priced = bond({
      ...BASE,
      couponRatePercent: 5,
      years: 30,
      yieldPercent: 6,
    });
    expect(priced.periods).toBe(60);
    expect(priced.price).toBeCloseTo(expected, 4);
    expect(priced.price).toBeCloseTo(86_162_218.167, 3);

    const solved = bond({
      ...BASE,
      couponRatePercent: 5,
      years: 30,
      yieldPercent: undefined,
      price: priced.price,
    });
    // `bisect` stops at a 1e-10 bracket on the decimal yield, which is 1e-8
    // percentage points; the measured error here is 8,2e-9 pp. An absolute
    // bound with a stated reason, per §8 — not toBeCloseTo(6, 8), which the
    // solver's own tolerance cannot honour.
    expect(Math.abs(solved.yieldPercent! - 6)).toBeLessThan(1e-6);
    expect(solved.effectiveYieldPercent).toBeCloseTo(1.03 ** 2 * 100 - 100, 6);

    // Macaulay closed form in periods, from the coupon-bond identity
    // D = (1+i)/i − [1 + i + n(c − i)] ÷ [c((1+i)^n − 1) + i]. The "+ i" in
    // that numerator is easy to drop, and dropping it gives 14,8684 năm.
    const i = 0.03;
    const c = 0.025;
    const n = 60;
    const durationPeriods =
      (1 + i) / i - (1 + i + n * (c - i)) / (c * ((1 + i) ** n - 1) + i);
    expect(solved.macaulayDurationYears).toBeCloseTo(durationPeriods / 2, 6);
    expect(solved.macaulayDurationYears).toBeCloseTo(14.769_924_83, 6);
    expect(solved.modifiedDurationYears).toBeCloseTo(
      durationPeriods / 2 / (1 + i),
      6,
    );
    expect(solved.modifiedDurationYears).toBeCloseTo(14.339_732_85, 6);
    // ΔP ≈ −modified duration × P × 0,01, to within a đồng of the hand figure.
    expect(
      Math.abs(solved.priceChangePerPointRise! + 12_355_431.9),
    ).toBeLessThan(1);
  });

  it.each([
    [25.5, 2, 51],
    [26, 2, 52],
    [30, 2, 60],
    [13, 4, 52],
    [50, 4, 200],
  ])(
    "round-trips the yield at %s năm × %s lần/năm (%s kỳ)",
    (years, paymentsPerYear, periods) => {
      // 51 periods is where the old bracket first overflowed; 4 lần/năm
      // reaches it at 13 năm, well inside what the page offers.
      const priced = bond({
        ...BASE,
        couponRatePercent: 5,
        years,
        paymentsPerYear,
        yieldPercent: 6,
      });
      expect(priced.periods).toBe(periods);
      const solved = bond({
        ...BASE,
        couponRatePercent: 5,
        years,
        paymentsPerYear,
        yieldPercent: undefined,
        price: priced.price,
      });
      expect(Math.abs(solved.yieldPercent! - 6)).toBeLessThan(1e-6);
      expect(solved.macaulayDurationYears).not.toBeNull();
      expect(solved.modifiedDurationYears).not.toBeNull();
      expect(solved.priceChangePerPointRise).not.toBeNull();
    },
  );
});

describe("computeBond — the three yields are different numbers", () => {
  it("keeps current yield between the coupon rate and the YTM at a discount", () => {
    const result = bond({
      ...BASE,
      yieldPercent: undefined,
      price: 90_000_000,
    });
    expect(result.currentYieldPercent!).toBeGreaterThan(8);
    expect(result.currentYieldPercent!).toBeLessThan(result.yieldPercent!);
  });

  it("computes current yield off the price, not the face value", () => {
    const result = bond(BASE);
    expect(result.currentYieldPercent).toBeCloseTo(
      (8_000_000 / result.price) * 100,
      8,
    );
  });

  it("reports an effective yield above the nominal one when paid twice a year", () => {
    const result = bond(BASE);
    // (1,05)² − 1 = 10,25%, not 10%.
    expect(result.effectiveYieldPercent).toBeCloseTo(10.25, 8);
    expect(result.effectiveYieldPercent!).toBeGreaterThan(
      result.yieldPercent!,
    );
  });

  it("has the two coincide on an annual-pay bond", () => {
    const result = bond({ ...BASE, paymentsPerYear: 1 });
    expect(result.effectiveYieldPercent).toBeCloseTo(10, 8);
  });
});

describe("computeBond — duration", () => {
  it("is shorter than the term for a coupon bond", () => {
    const result = bond(BASE);
    expect(result.macaulayDurationYears!).toBeLessThan(5);
    expect(result.macaulayDurationYears!).toBeGreaterThan(3);
  });

  it("equals the term exactly for a zero-coupon bond", () => {
    // The defining property, and the check that the period-to-year division
    // is right: getting it wrong would report 10 years, not 5.
    const result = bond({ ...BASE, couponRatePercent: 0 });
    expect(result.macaulayDurationYears).toBeCloseTo(5, 8);
  });

  it("keeps modified duration just below Macaulay", () => {
    const result = bond(BASE);
    expect(result.modifiedDurationYears!).toBeLessThan(
      result.macaulayDurationYears!,
    );
    expect(result.modifiedDurationYears).toBeCloseTo(
      result.macaulayDurationYears! / 1.05,
      8,
    );
  });

  it("lengthens with the term and shortens with the coupon", () => {
    const short = bond({ ...BASE, years: 2 }).macaulayDurationYears!;
    const long = bond({ ...BASE, years: 20 }).macaulayDurationYears!;
    expect(long).toBeGreaterThan(short);
    const lowCoupon = bond({ ...BASE, couponRatePercent: 2 })
      .macaulayDurationYears!;
    const highCoupon = bond({ ...BASE, couponRatePercent: 15 })
      .macaulayDurationYears!;
    expect(lowCoupon).toBeGreaterThan(highCoupon);
  });

  it("estimates the price fall for a one-point rise in yield", () => {
    const result = bond(BASE);
    expect(result.priceChangePerPointRise!).toBeLessThan(0);
    // Duration is a first-order estimate, so it should be within a few
    // percent of repricing at the higher yield — and slightly overstate the
    // fall, because the price/yield curve is convex.
    const actual =
      bond({ ...BASE, yieldPercent: 11 }).price - result.price;
    expect(result.priceChangePerPointRise!).toBeLessThan(actual);
    expect(Math.abs(result.priceChangePerPointRise! - actual)).toBeLessThan(
      Math.abs(actual) * 0.05,
    );
  });
});

describe("computeBond — rejected inputs", () => {
  it("rejects a term that is not whole coupon periods", () => {
    // Pricing between coupon dates needs accrued interest, which is out of
    // scope — reject rather than round.
    expect(
      computeBond({ ...BASE, years: 5.25, paymentsPerYear: 2 }),
    ).toBeNull();
    // …but half-years are fine on a semiannual bond.
    expect(
      computeBond({ ...BASE, years: 5.5, paymentsPerYear: 2 }),
    ).not.toBeNull();
  });

  it("returns null when neither a yield nor a price is given", () => {
    expect(
      computeBond({ ...BASE, yieldPercent: undefined, price: undefined }),
    ).toBeNull();
  });

  it("returns null rather than a guess", () => {
    expect(computeBond({ ...BASE, faceValue: 0 })).toBeNull();
    expect(computeBond({ ...BASE, faceValue: -1 })).toBeNull();
    expect(computeBond({ ...BASE, couponRatePercent: -1 })).toBeNull();
    expect(computeBond({ ...BASE, years: 0 })).toBeNull();
    expect(computeBond({ ...BASE, paymentsPerYear: 0 })).toBeNull();
    expect(computeBond({ ...BASE, paymentsPerYear: 2.5 })).toBeNull();
    expect(computeBond({ ...BASE, yieldPercent: Number.NaN })).toBeNull();
    expect(
      computeBond({ ...BASE, yieldPercent: undefined, price: 0 }),
    ).toBeNull();
    expect(
      computeBond({ ...BASE, yieldPercent: undefined, price: -1 }),
    ).toBeNull();
    expect(computeBond({ ...BASE, faceValue: Number.NaN })).toBeNull();
  });
});
