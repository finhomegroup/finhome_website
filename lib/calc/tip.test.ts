import { describe, it, expect } from "vitest";
import { splitBill, type TipInput } from "@/lib/calc/tip";

const BASE: TipInput = {
  bill: 1_000_000,
  tipPercent: 10,
  servicePercent: 5,
  taxPercent: 8,
  people: 4,
};

function split(input: TipInput) {
  const result = splitBill(input);
  expect(result).not.toBeNull();
  return result!;
}

describe("splitBill — how a Vietnamese receipt stacks up", () => {
  it("charges service on the food and tax on food plus service", () => {
    // 1.000.000 food + 50.000 service = 1.050.000; 8% VAT on that is 84.000;
    // the 10% tip is on the food alone, 100.000. Total 1.234.000.
    const result = split(BASE);
    expect(result.service).toBeCloseTo(50_000, 6);
    expect(result.tax).toBeCloseTo(84_000, 6);
    expect(result.tip).toBeCloseTo(100_000, 6);
    expect(result.total).toBeCloseTo(1_234_000, 6);
  });

  it("does not charge tax on the tip", () => {
    const withTip = split(BASE);
    const withoutTip = split({ ...BASE, tipPercent: 0 });
    expect(withTip.tax).toBeCloseTo(withoutTip.tax, 6);
    expect(withTip.total - withoutTip.total).toBeCloseTo(100_000, 6);
  });

  it("keeps the service charge separate from the tip", () => {
    // They are different money going to different places, and the tool must
    // not let a 5% service charge read as a tip already paid to the server.
    const result = split(BASE);
    expect(result.service).not.toBe(result.tip);
    expect(result.service).toBeCloseTo(50_000, 6);
  });

  it("handles a bill with no extras at all", () => {
    const result = split({ bill: 1_000_000 });
    expect(result.tip).toBe(0);
    expect(result.service).toBe(0);
    expect(result.tax).toBe(0);
    expect(result.total).toBe(1_000_000);
    expect(result.perPerson).toBe(1_000_000);
    expect(result.effectiveExtraPercent).toBe(0);
  });
});

describe("splitBill — splitting", () => {
  it("divides the total by the head count", () => {
    const result = split(BASE);
    expect(result.perPerson).toBeCloseTo(1_234_000 / 4, 6);
    expect(result.perPerson).toBeCloseTo(308_500, 6);
  });

  it("leaves the total to one person by default", () => {
    const result = split({ ...BASE, people: undefined });
    expect(result.perPerson).toBeCloseTo(result.total, 6);
  });

  it("still lands on a whole đồng when not rounding to a note", () => {
    // 427.000 three ways is 142.333,33…, which nobody can pay in cash or by
    // transfer, so the share goes up to the đồng and the 2 ₫ surplus is
    // reported like any other rounding surplus.
    const result = split({ bill: 427_000, people: 3 });
    expect(result.perPerson).toBeCloseTo(142_333.333_33, 4);
    expect(result.perPersonRounded).toBe(142_334);
    expect(result.roundingExtra).toBe(2);
    expect(result.totalPaid).toBe(427_002);
    // The point of the row pair: the share times the head count is exactly
    // what the table hands over. Without it the live region shows
    // 142.333 ₫ × 3 against a 427.000 ₫ total.
    expect(result.perPersonRounded * 3).toBe(result.totalPaid);
  });
});

describe("splitBill — rounding the share, not the total", () => {
  it("rounds each share UP to the nearest step", () => {
    // 142.333,33 → 150.000 each, so the table pays 450.000 on a 427.000 bill.
    const result = split({ bill: 427_000, people: 3, roundTo: 10_000 });
    expect(result.perPersonRounded).toBe(150_000);
    expect(result.totalPaid).toBe(450_000);
    expect(result.roundingExtra).toBeCloseTo(23_000, 6);
  });

  it("always produces a payable share", () => {
    // The point of rounding the share rather than the total: every result is
    // a whole number of notes.
    for (const people of [2, 3, 4, 5, 6, 7]) {
      const result = split({ bill: 427_000, people, roundTo: 10_000 });
      expect(result.perPersonRounded % 10_000).toBe(0);
      expect(result.totalPaid).toBeGreaterThanOrEqual(result.total);
    }
  });

  it("leaves a share that already lands on the step untouched", () => {
    const result = split({ bill: 400_000, people: 4, roundTo: 10_000 });
    expect(result.perPersonRounded).toBe(100_000);
    expect(result.roundingExtra).toBe(0);
  });

  it("hands the rounding surplus to the venue, and says how much", () => {
    const result = split({ ...BASE, roundTo: 50_000 });
    expect(result.perPersonRounded).toBe(350_000);
    expect(result.totalPaid).toBe(1_400_000);
    expect(result.roundingExtra).toBeCloseTo(166_000, 6);
  });
});

describe("splitBill — what it really cost", () => {
  it("states everything above the food bill as a percentage of it", () => {
    const result = split(BASE);
    expect(result.effectiveExtraPercent).toBeCloseTo(23.4, 8);
  });

  it("counts the rounding surplus in that percentage", () => {
    const plain = split({ ...BASE });
    const rounded = split({ ...BASE, roundTo: 50_000 });
    expect(rounded.effectiveExtraPercent).toBeGreaterThan(
      plain.effectiveExtraPercent,
    );
    expect(rounded.effectiveExtraPercent).toBeCloseTo(40, 8);
  });
});

describe("splitBill — rejected inputs", () => {
  it("returns null rather than a guess", () => {
    expect(splitBill({ ...BASE, bill: 0 })).toBeNull();
    expect(splitBill({ ...BASE, bill: -1 })).toBeNull();
    expect(splitBill({ ...BASE, tipPercent: -1 })).toBeNull();
    expect(splitBill({ ...BASE, servicePercent: -1 })).toBeNull();
    expect(splitBill({ ...BASE, taxPercent: -1 })).toBeNull();
    expect(splitBill({ ...BASE, roundTo: -1 })).toBeNull();
    expect(splitBill({ ...BASE, bill: Number.NaN })).toBeNull();
  });

  it("rejects a head count that is not a whole number of people", () => {
    expect(splitBill({ ...BASE, people: 0 })).toBeNull();
    expect(splitBill({ ...BASE, people: 2.5 })).toBeNull();
    expect(splitBill({ ...BASE, people: -2 })).toBeNull();
  });
});
