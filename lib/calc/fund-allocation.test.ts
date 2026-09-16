// Original row 56's purpose/time allocation. The fixture is the independent
// one from the P3 handoff: a 1 tỷ pot, a 150 triệu reserve, 650 triệu for a
// home needed in 12 months and 150 triệu for another goal needed in 24
// months — leaving 50 triệu UNALLOCATED. Raising the home request to 750
// triệu makes the total requested 1,05 tỷ, i.e. 50 triệu short, and the tool
// must not pretend 1,05 tỷ is funded.
import { describe, expect, it } from "vitest";
import { allocateFunds, type FundAllocationInput } from "./fund-allocation";

const BASE: FundAllocationInput = {
  available: 1_000_000_000,
  reserve: 150_000_000,
  purposes: [
    { key: "home", requested: 650_000_000, monthsUntilNeeded: 12 },
    { key: "other", requested: 150_000_000, monthsUntilNeeded: 24 },
  ],
};

describe("allocateFunds on the handoff fixture", () => {
  const result = allocateFunds(BASE)!;

  it("funds the reserve and both purposes in full", () => {
    expect(result.reserveAllocated).toBe(150_000_000);
    expect(result.purposes[0].allocated).toBe(650_000_000);
    expect(result.purposes[1].allocated).toBe(150_000_000);
    expect(result.purposes.every((p) => p.funded)).toBe(true);
    expect(result.fullyFunded).toBe(true);
  });

  it("leaves 50 triệu UNALLOCATED, which is its own state", () => {
    // Not "spare", not "investable", and not a recommendation.
    expect(result.unallocated).toBe(50_000_000);
    expect(result.shortfall).toBe(0);
  });

  it("adds up: reserve + purposes + unallocated = the pot", () => {
    const sum =
      result.reserveAllocated +
      result.purposes.reduce((total, p) => total + p.allocated, 0) +
      result.unallocated;
    expect(sum).toBe(result.available);
    expect(result.totalAllocated).toBe(950_000_000);
  });

  it("keeps the need times, and notices the order matches them", () => {
    expect(result.purposes.map((p) => p.monthsUntilNeeded)).toEqual([12, 24]);
    expect(result.anyTimeUnknown).toBe(false);
    expect(result.orderMatchesTimeline).toBe(true);
  });

  it("leaves the need DATES null when no anchor was declared", () => {
    // A month count is still usable without an anchor; what is not allowed is
    // inventing a date for it.
    expect(result.start).toBeNull();
    expect(result.purposes.map((p) => p.needDate)).toEqual([null, null]);
  });
});

// The review finding: the field said "kể từ hôm nay" on a page that never
// showed what "hôm nay" was, so the convention could not be checked by a
// reader or pinned by a test. Both are possible now.
describe("allocateFunds with a declared start date", () => {
  const start = { year: 2026, month: 9, day: 15 };
  const result = allocateFunds({ ...BASE, start })!;

  it("anchors every stated month to a real date", () => {
    expect(result.start).toEqual(start);
    expect(result.purposes[0].needDate).toEqual({
      year: 2027,
      month: 9,
      day: 15,
    });
    expect(result.purposes[1].needDate).toEqual({
      year: 2028,
      month: 9,
      day: 15,
    });
  });

  it("follows `addMonths`'s one clamping convention, not a second one", () => {
    // 31 January + 1 month is 28 February, per that module. A date computed
    // here rather than through it would be the beginning of a second calendar.
    const clamped = allocateFunds({
      available: 100,
      reserve: 0,
      purposes: [{ key: "one", requested: 100, monthsUntilNeeded: 1 }],
      start: { year: 2026, month: 1, day: 31 },
    })!;
    expect(clamped.purposes[0].needDate).toEqual({
      year: 2026,
      month: 2,
      day: 28,
    });
  });

  it("keeps an unstated month unanchored rather than guessing one", () => {
    const partial = allocateFunds({
      ...BASE,
      purposes: [
        { key: "home", requested: 650_000_000, monthsUntilNeeded: 12 },
        { key: "other", requested: 150_000_000, monthsUntilNeeded: null },
      ],
      start,
    })!;
    expect(partial.purposes[0].needDate).not.toBeNull();
    expect(partial.purposes[1].needDate).toBeNull();
    expect(partial.purposes[1].timeUnknown).toBe(true);
    // Still allocated: no month is not no money.
    expect(partial.purposes[1].allocated).toBe(150_000_000);
  });

  it("refuses an INVALID anchor rather than dropping it silently", () => {
    // Showing need dates measured from nothing is worse than showing none.
    expect(
      allocateFunds({ ...BASE, start: { year: 2026, month: 2, day: 30 } }),
    ).toBeNull();
    expect(
      allocateFunds({ ...BASE, start: { year: 2026, month: 13, day: 1 } }),
    ).toBeNull();
  });
});

describe("allocateFunds when the requests exceed the pot", () => {
  // The handoff's second case: the home request rises to 750 triệu.
  const result = allocateFunds({
    ...BASE,
    purposes: [
      { key: "home", requested: 750_000_000, monthsUntilNeeded: 12 },
      { key: "other", requested: 150_000_000, monthsUntilNeeded: 24 },
    ],
  })!;

  it("reports the 50 triệu shortage rather than prorating silently", () => {
    expect(result.totalRequested).toBe(1_050_000_000);
    expect(result.shortfall).toBe(50_000_000);
    expect(result.fullyFunded).toBe(false);
  });

  it("never claims the requested total is funded", () => {
    // The distinction the row exists to protect: what was ASKED for is not
    // what EXISTS.
    expect(result.totalAllocated).toBe(1_000_000_000);
    expect(result.totalAllocated).toBeLessThan(result.totalRequested);
    expect(result.totalAllocated).toBe(result.available);
  });

  it("says exactly which purpose came up short, and by how much", () => {
    expect(result.purposes[0].allocated).toBe(750_000_000);
    expect(result.purposes[0].shortfall).toBe(0);
    expect(result.purposes[0].funded).toBe(true);
    // The later-listed goal is the one the pot ran out on.
    expect(result.purposes[1].allocated).toBe(100_000_000);
    expect(result.purposes[1].shortfall).toBe(50_000_000);
    expect(result.purposes[1].funded).toBe(false);
  });

  it("leaves nothing unallocated when the pot is exhausted", () => {
    expect(result.unallocated).toBe(0);
  });
});

describe("allocateFunds — the reserve is protected and counted once", () => {
  it("takes the reserve before any purpose", () => {
    const tight = allocateFunds({
      available: 200_000_000,
      reserve: 150_000_000,
      purposes: [{ key: "home", requested: 650_000_000, monthsUntilNeeded: 12 }],
    })!;
    expect(tight.reserveAllocated).toBe(150_000_000);
    expect(tight.purposes[0].allocated).toBe(50_000_000);
    expect(tight.purposes[0].shortfall).toBe(600_000_000);
  });

  it("does not let the reserve be spent twice", () => {
    const tight = allocateFunds({
      available: 200_000_000,
      reserve: 150_000_000,
      purposes: [{ key: "home", requested: 650_000_000, monthsUntilNeeded: 12 }],
    })!;
    expect(
      tight.reserveAllocated + tight.purposes[0].allocated,
    ).toBe(tight.available);
  });

  it("reports a reserve the pot cannot even cover", () => {
    const poor = allocateFunds({
      available: 100_000_000,
      reserve: 150_000_000,
      purposes: [{ key: "home", requested: 10_000_000, monthsUntilNeeded: 6 }],
    })!;
    expect(poor.reserveAllocated).toBe(100_000_000);
    expect(poor.reserveShortfall).toBe(50_000_000);
    expect(poor.purposes[0].allocated).toBe(0);
    expect(poor.fullyFunded).toBe(false);
    expect(poor.unallocated).toBe(0);
  });
});

describe("allocateFunds — a purpose with no stated month", () => {
  const result = allocateFunds({
    ...BASE,
    purposes: [
      { key: "home", requested: 650_000_000, monthsUntilNeeded: 12 },
      { key: "other", requested: 150_000_000, monthsUntilNeeded: null },
    ],
  })!;

  it("still allocates the money", () => {
    // Not knowing WHEN does not mean the money is not set aside.
    expect(result.purposes[1].allocated).toBe(150_000_000);
    expect(result.purposes[1].funded).toBe(true);
  });

  it("flags it, so no page can imply a horizon it does not have", () => {
    expect(result.purposes[1].timeUnknown).toBe(true);
    expect(result.anyTimeUnknown).toBe(true);
  });

  it("is ignored when checking the order against the timeline", () => {
    // Nothing is known about where an undated purpose belongs.
    expect(result.orderMatchesTimeline).toBe(true);
  });
});

describe("allocateFunds — the order is the reader's", () => {
  it("reports an order that does not match the need dates", () => {
    const result = allocateFunds({
      ...BASE,
      purposes: [
        { key: "other", requested: 150_000_000, monthsUntilNeeded: 24 },
        { key: "home", requested: 650_000_000, monthsUntilNeeded: 12 },
      ],
    })!;
    expect(result.orderMatchesTimeline).toBe(false);
  });

  it("still allocates in the listed order, not by date", () => {
    // Re-ordering for the reader would be this tool deciding whose goal gets
    // cut. It reports the mismatch and leaves the decision alone.
    const result = allocateFunds({
      available: 700_000_000,
      reserve: 0,
      purposes: [
        { key: "later", requested: 400_000_000, monthsUntilNeeded: 36 },
        { key: "sooner", requested: 400_000_000, monthsUntilNeeded: 6 },
      ],
    })!;
    expect(result.purposes[0].allocated).toBe(400_000_000);
    expect(result.purposes[1].allocated).toBe(300_000_000);
    expect(result.orderMatchesTimeline).toBe(false);
  });

  it("treats equal months as matching", () => {
    const result = allocateFunds({
      available: 1_000_000_000,
      reserve: 0,
      purposes: [
        { key: "a", requested: 100_000_000, monthsUntilNeeded: 12 },
        { key: "b", requested: 100_000_000, monthsUntilNeeded: 12 },
      ],
    })!;
    expect(result.orderMatchesTimeline).toBe(true);
  });
});

describe("allocateFunds — real starting and edge states", () => {
  it("treats an empty purpose list as all-unallocated", () => {
    const empty = allocateFunds({
      available: 1_000_000_000,
      reserve: 150_000_000,
      purposes: [],
    })!;
    expect(empty.unallocated).toBe(850_000_000);
    expect(empty.totalRequested).toBe(150_000_000);
    expect(empty.shortfall).toBe(0);
    // Nothing was requested, so nothing is unfunded.
    expect(empty.fullyFunded).toBe(true);
    expect(empty.orderMatchesTimeline).toBe(true);
  });

  it("handles a zero pot without inventing money", () => {
    const none = allocateFunds({
      available: 0,
      reserve: 150_000_000,
      purposes: [{ key: "home", requested: 650_000_000, monthsUntilNeeded: 12 }],
    })!;
    expect(none.reserveAllocated).toBe(0);
    expect(none.totalAllocated).toBe(0);
    expect(none.unallocated).toBe(0);
    expect(none.shortfall).toBe(800_000_000);
  });

  it("accepts a purpose needed this month", () => {
    const now = allocateFunds({
      available: 100_000_000,
      reserve: 0,
      purposes: [{ key: "now", requested: 50_000_000, monthsUntilNeeded: 0 }],
    })!;
    expect(now.purposes[0].monthsUntilNeeded).toBe(0);
    expect(now.purposes[0].timeUnknown).toBe(false);
  });

  it("accepts a zero request, which allocates nothing", () => {
    const zero = allocateFunds({
      available: 100_000_000,
      reserve: 0,
      purposes: [{ key: "idle", requested: 0, monthsUntilNeeded: 12 }],
    })!;
    expect(zero.purposes[0].allocated).toBe(0);
    expect(zero.purposes[0].funded).toBe(true);
    expect(zero.unallocated).toBe(100_000_000);
  });
});

describe("allocateFunds — refusals", () => {
  it("refuses negative money", () => {
    expect(allocateFunds({ ...BASE, available: -1 })).toBeNull();
    expect(allocateFunds({ ...BASE, reserve: -1 })).toBeNull();
    expect(
      allocateFunds({
        ...BASE,
        purposes: [{ key: "a", requested: -1, monthsUntilNeeded: 12 }],
      }),
    ).toBeNull();
  });

  it("refuses a fractional or negative number of months", () => {
    for (const months of [12.5, -1]) {
      expect(
        allocateFunds({
          ...BASE,
          purposes: [{ key: "a", requested: 1, monthsUntilNeeded: months }],
        }),
      ).toBeNull();
    }
  });

  it("refuses duplicate purpose keys", () => {
    // Two purposes under one key would collapse into one bar segment and one
    // table row, silently hiding a request.
    expect(
      allocateFunds({
        ...BASE,
        purposes: [
          { key: "home", requested: 100_000_000, monthsUntilNeeded: 12 },
          { key: "home", requested: 200_000_000, monthsUntilNeeded: 24 },
        ],
      }),
    ).toBeNull();
  });

  it("refuses non-finite figures", () => {
    expect(allocateFunds({ ...BASE, available: Number.NaN })).toBeNull();
    expect(
      allocateFunds({ ...BASE, reserve: Number.POSITIVE_INFINITY }),
    ).toBeNull();
    expect(
      allocateFunds({
        ...BASE,
        purposes: [{ key: "a", requested: Number.NaN, monthsUntilNeeded: 12 }],
      }),
    ).toBeNull();
  });
});
