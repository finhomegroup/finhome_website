// Guards for the financial-ratios page's PRESENTATION layer.
//
// `lib/calc/financials.test.ts` covers the arithmetic, and it passes every
// figure in as a number. That is exactly why it could not see the defect
// guarded here: it lives in the step between the form string and the rendered
// cell — a parser choice. No module test can reach which parser a field used.
//
// The sibling statement-analysis page's presentation guards (the DuPont change
// column's unit) used to live here and now live in
// `components/statement-analysis-calculator.test.ts`, so that a
// `vitest run components/statement-analysis` filter finds them.
//
// Runs in the repo's node environment with no jsdom: it imports the client
// module but only calls PURE exported helpers out of it, never renders.

import { describe, expect, it } from "vitest";

import { readShareFields } from "@/components/financial-ratios-calculator";
import { readStatement } from "@/components/calc/financials-fields";
import { computeRatios } from "@/lib/calc/financials";
import { formatDecimal, formatMoney } from "@/lib/calc/number";
import { FINANCIAL_RATIOS as FR } from "@/content/calculators/financial-ratios";

/**
 * Hand-computed from the prefilled statement, using the published definitions
 * rather than the module:
 *   vốn hóa        = 100.000.000 cp × 20.000 ₫            = 2.000 tỷ ₫
 *   lợi nhuận thuần = 1.000 − 600 − 250 − 30 − 24         =    96 tỷ ₫
 *   tổng tài sản    = 100 + 150 + 200 + 50 + 400          =   900 tỷ ₫
 *   tổng nợ phải trả = 250 + 100 + 50                     =   400 tỷ ₫
 *   vốn chủ         = 900 − 400                           =   500 tỷ ₫
 */
const MARKET_CAP = 2_000e9;
const NET_PROFIT = 96e9;
const EQUITY = 500e9;
const SHARES = 100e6;

describe("readShareFields", () => {
  it("reads the ₫ price with the MONEY grammar, not the decimal one", () => {
    // The whole defect in one assertion: parseDecimal("20.000") is 20, so the
    // prefilled page priced the share at twenty đồng and printed P/E 0,02.
    const read = readShareFields({
      shares: FR.form.defaultShares,
      price: FR.form.defaultPrice,
    });
    expect(read.shares).toBe(100_000_000);
    expect(read.price).toBe(20_000);
    expect(read.sharesInvalid).toBe(false);
    expect(read.priceInvalid).toBe(false);
  });

  it("accepts a two-group price instead of blanking the page", () => {
    // parseDecimal("1.000.000") is null, which made every one of the twenty
    // ratios disappear behind a validation error the user could not fix.
    const million = readShareFields({ shares: "1", price: "1.000.000" });
    expect(million.price).toBe(1_000_000);
    expect(million.priceInvalid).toBe(false);

    // A realistic VN price. parseDecimal read this as 85,5.
    expect(readShareFields({ shares: "1", price: "85.500" }).price).toBe(85_500);
  });

  it("treats an empty field as 'skip the block', a bad one as invalid", () => {
    const empty = readShareFields({ shares: "", price: "" });
    expect(empty.shares).toBeNull();
    expect(empty.price).toBeNull();
    expect(empty.sharesInvalid).toBe(false);
    expect(empty.priceInvalid).toBe(false);

    const bad = readShareFields({ shares: "abc", price: "-5" });
    expect(bad.sharesInvalid).toBe(true);
    expect(bad.priceInvalid).toBe(true);
  });
});

describe("financial-ratios — the prefilled valuation block", () => {
  const statement = readStatement({ ...FR.form.defaults } as Record<
    string,
    string
  >);
  const share = readShareFields({
    shares: FR.form.defaultShares,
    price: FR.form.defaultPrice,
  });
  const ratios = computeRatios({
    ...statement.input!,
    sharesOutstanding: share.shares!,
    sharePrice: share.price!,
  })!;

  it("derives the statement the references above assume", () => {
    expect(ratios.netProfit).toBe(NET_PROFIT);
    expect(ratios.equity).toBe(EQUITY);
  });

  it("matches the published P/E and P/B definitions", () => {
    // Both are a single IEEE division of two exactly-representable magnitudes,
    // so agreement is good to ~1 ulp (~4e-15). 1e-9 absolute is generous
    // against that and still 1e7 times tighter than the 2-dp display.
    expect(Math.abs(ratios.priceToEarnings! - MARKET_CAP / NET_PROFIT)).toBeLessThan(1e-9);
    expect(ratios.priceToBook).toBe(MARKET_CAP / EQUITY);
    expect(ratios.priceToBook).toBe(4);
  });

  it("renders the figures the page's own prose asserts", () => {
    // content/calculators/financial-ratios.ts:202 reads "P/E 20,83 và P/B 4,0".
    // The copy was right and the code was wrong; these pin the agreement.
    expect(formatDecimal(ratios.priceToEarnings!, 2)).toBe("20,83");
    expect(formatDecimal(ratios.priceToBook!, 2)).toBe("4,00");
  });

  it("leaves the price-free per-share figures alone", () => {
    // EPS and BVPS never touched the price, so the fix must not move them.
    expect(ratios.earningsPerShare).toBe(NET_PROFIT / SHARES);
    expect(ratios.earningsPerShare).toBe(960);
    expect(ratios.bookValuePerShare).toBe(EQUITY / SHARES);
    expect(formatMoney(ratios.bookValuePerShare!)).toBe("5.000");
  });
});
