/** /cong-cu/giam-gia-va-thue/'s price-tag path, pure half, against `adjustPrice`'s own ledger. */
import { describe, expect, it } from "vitest";
import {
  ledgerTableRows,
  makePriceTrial,
  nextPriceValue,
  priceAdjustFormState,
  priceAvailability,
  priceImpact,
  priceLesson,
  priceSnapshot,
} from "@/components/price-adjust-learning";
import { initialTrialState, trialReducer } from "@/components/calc/learning-trials";
import { renderTableCell, tableMoneyUnit, type TableCell } from "@/lib/calc/table-cell";
import { PLACEHOLDER } from "@/lib/calc/number";
import { TABLE_UI } from "@/content/calculators/table-ui";
import { PRICE_ADJUST as C } from "@/content/calculators/price-adjust";
import { PRICE_ADJUST_LEARNING as L } from "@/content/calculators/price-adjust-learning";

const F = C.form;
const DEFAULTS: Record<string, string> = {
  price: F.defaultPrice,
  tax: F.defaultTax,
  taxIncluded: F.defaultTaxIncluded,
  discountPercent: F.defaultDiscountPercent,
  secondDiscountPercent: F.defaultSecondDiscountPercent,
  discountAmount: F.defaultDiscountAmount,
};
const at = (patch: Record<string, string> = {}) => priceAdjustFormState({ ...DEFAULTS, ...patch });
const ready = (patch: Record<string, string> = {}) => {
  const l = priceLesson(at(patch));
  if (l.kind !== "ready") throw new Error(l.kind);
  return l;
};

describe("the engine's ledger, in order", () => {
  it("1M / 20 / 10 / voucher 0 / tax 8 included: 720.000 ₫, tax 53.333, net 666.667; tax INSIDE is a composition", () => {
    const s = at();
    expect(s.result!.finalPrice).toBe(720_000);
    expect(s.result!.tax).toBeCloseTo(53_333.33, 2);
    expect(s.result!.netPrice).toBeCloseTo(666_666.67, 2);
    const l = ready();
    expect(l.steps.map((x) => x.key)).toEqual(["list", "firstPercent", "secondPercent", "taxInside"]);
    expect(l.steps.map((x) => x.balance)).toEqual(["1.000.000 ₫", "800.000 ₫", "720.000 ₫", "720.000 ₫"]);
    const inside = l.steps[3];
    expect(inside.delta).toBe("0 ₫");
    expect(inside.percent).toBeNull();
    expect(inside.composition!.net + inside.composition!.tax).toBeCloseTo(72, 9);
    expect(l.compositionText).toBe("Giá cuối 720.000 ₫ = giá trước thuế 666.667 ₫ + thuế 53.333 ₫");
    expect(l.modeText).toBe(L.modeIncluded);
    expect(l.successive).toContain("28,00%");
    expect(l.successive).toContain("30,00%");
  });

  it("excluded: 777.600 ₫ with 57.600 ₫ of tax ADDED as the last step", () => {
    const s = at({ taxIncluded: "no" });
    expect(s.result!.finalPrice).toBeCloseTo(777_600, 6);
    const l = ready({ taxIncluded: "no" });
    expect(l.steps.at(-1)).toMatchObject({ key: "taxAdded", delta: "+57.600 ₫", balance: "777.600 ₫" });
    expect(l.modeText).toBe(L.modeExcluded);
  });

  it("voucher 50.000: 670.000 ₫ included, 723.600 ₫ excluded", () => {
    expect(at({ discountAmount: "50.000" }).result!.finalPrice).toBe(670_000);
    expect(at({ discountAmount: "50.000", taxIncluded: "no" }).result!.finalPrice).toBeCloseTo(723_600, 6);
  });

  it("the second step's base is what the first LEFT, and the reading says so", () => {
    const l = ready();
    expect(l.steps[2].reading).toContain("CÒN LẠI");
    expect(l.steps[2].reading).toContain("800.000 ₫");
    expect(l.steps[2].reading).toContain("-80.000 ₫");
  });
});

describe("edges", () => {
  it("100% off, no voucher: 0 paid, no fabricated zero steps, a valid scale", () => {
    const l = ready({ discountPercent: "100", secondDiscountPercent: "0" });
    expect(l.steps.map((x) => x.key)).toEqual(["list", "firstPercent"]);
    expect(l.steps[1].balance).toBe("0 ₫");
    expect(l.withheld).toBe(false);
  });

  it("no reductions and tax 0: only the list line, no tax line, no composition", () => {
    const l = ready({ discountPercent: "0", secondDiscountPercent: "0", tax: "0" });
    expect(l.steps.map((x) => x.key)).toEqual(["list"]);
    expect(l.compositionText).toBeNull();
    expect(l.successive).toBeNull();
  });

  it("a voucher larger than what is left is REFUSED, not clamped, and the tries say why", () => {
    const values = { ...DEFAULTS, discountAmount: "800.000" };
    const s = priceAdjustFormState(values);
    expect(s.tooMuch).toBe(true);
    expect(priceLesson(s).kind).toBe("refused");
    expect(priceAvailability("discountAmount", values, s)).toEqual({ enabled: false, reason: L.refused });
  });

  it("an invalid field is 'empty', distinct from a refused combination", () => {
    const s = at({ tax: "101" });
    expect(s.tooMuch).toBe(false);
    expect(priceLesson(s).kind).toBe("empty");
  });
});

describe("tries", () => {
  it("second discount +5 points: 10 → 15, bills 680.000 ₫ (15% of the 800.000 left, not of the list)", () => {
    expect(nextPriceValue("secondDiscountPercent", DEFAULTS)).toBe("15");
    const t = makePriceTrial("secondDiscountPercent", DEFAULTS, 0, at())!;
    const after = priceSnapshot(priceAdjustFormState(t.after))!;
    expect(after.final).toBe(680_000);
    const impact = priceImpact(t, after);
    expect(impact.lines[0]).toBe("Giá cuối phải trả: 720.000 ₫ → 680.000 ₫ (đổi -40.000 ₫).");
  });

  it("voucher +50.000 and the tax-reading toggle", () => {
    expect(nextPriceValue("discountAmount", DEFAULTS)).toBe("50.000");
    expect(nextPriceValue("taxIncluded", DEFAULTS)).toBe("no");
    const t = makePriceTrial("taxIncluded", DEFAULTS, 0, at())!;
    const impact = priceImpact(t, priceSnapshot(priceAdjustFormState(t.after))!);
    expect(impact.fieldLine).toBe(`${L.trials.taxIncluded.field}: ${L.included.yes} → ${L.included.no}`);
    expect(impact.tradeoff).toBe(L.impact.tradeoff.taxIncluded);
  });

  it("second discount at 97 cannot take +5", () => {
    const values = { ...DEFAULTS, secondDiscountPercent: "97" };
    expect(priceAvailability("secondDiscountPercent", values, priceAdjustFormState(values))).toEqual({ enabled: false, reason: L.blockedSecond });
  });

  it("undo and manual-edit retirement", () => {
    let st = initialTrialState<"secondDiscountPercent" | "discountAmount" | "taxIncluded", NonNullable<ReturnType<typeof priceSnapshot>>>();
    const t1 = makePriceTrial("discountAmount", DEFAULTS, st.revision, at())!;
    st = trialReducer(st, { type: "apply", trial: t1 });
    st = trialReducer(st, { type: "undo" });
    expect(st.trials).toHaveLength(0);
    st = trialReducer(st, { type: "apply", trial: makePriceTrial("discountAmount", DEFAULTS, st.revision, at())! });
    st = trialReducer(st, { type: "edit" });
    expect(st.trials).toHaveLength(0);
  });
});

describe("the detail ledger table: ONE unit for both money columns (root P6)", () => {
  const render = (rows: TableCell[][], mode: "compact" | "exact") => {
    const unit = tableMoneyUnit(rows);
    return { unit, text: rows.map((row) => row.map((cell) => renderTableCell(cell, mode, unit, TABLE_UI))) };
  };

  it("default bill: deltas and balances are typed money cells; the tax-inside line moves nothing", () => {
    const rows = ledgerTableRows(at().result);
    expect(rows.map((r) => r[0])).toEqual([F.ledgerSteps.list, F.ledgerSteps.firstPercent, F.ledgerSteps.secondPercent, F.ledgerSteps.taxInside]);
    expect(rows[1][1]).toEqual({ kind: "money", value: -200_000 });
    expect(rows[2][1]).toEqual({ kind: "money", value: -80_000 });
    expect(rows[3][1]).toBe(PLACEHOLDER);
    expect(rows[3][2]).toEqual({ kind: "money", value: 720_000 });
  });

  it("compact: both columns in triệu under the same unit; exact: both in đồng", () => {
    const rows = ledgerTableRows(at().result);
    const compact = render(rows, "compact");
    expect(compact.unit).toBe("trieu");
    expect(compact.text.map((r) => r.slice(1))).toEqual([
      ["1,0", "1,0"],
      ["-0,2", "0,8"],
      ["-0,1", "0,7"],
      [PLACEHOLDER, "0,7"],
    ]);
    const exact = render(rows, "exact");
    expect(exact.text.map((r) => r.slice(1))).toEqual([
      ["1.000.000", "1.000.000"],
      ["-200.000", "800.000"],
      ["-80.000", "720.000"],
      [PLACEHOLDER, "720.000"],
    ]);
  });

  it("excluded: the added tax is a positive typed cell in the same unit", () => {
    const rows = ledgerTableRows(at({ taxIncluded: "no" }).result);
    expect(rows.at(-1)![1]).toEqual({ kind: "money", value: 57_600 });
    expect(render(rows, "exact").text.at(-1)!.slice(1)).toEqual(["57.600", "777.600"]);
  });

  it("a tiny reduction keeps its sign in compact mode instead of rounding to 0", () => {
    // 0,1% of 1.000.000 ₫ is 1.000 ₫ — far under 0,1 triệu beside a 1 triệu list line.
    const rows = ledgerTableRows(at({ discountPercent: "0,1", secondDiscountPercent: "0", tax: "0" }).result);
    expect(render(rows, "compact").text[1][1]).toBe(`${TABLE_UI.aboveNegative} -0,1`);
    expect(render(rows, "exact").text[1][1]).toBe("-1.000");
  });

  it("a refused or invalid bill has no rows", () => {
    expect(ledgerTableRows(at({ discountAmount: "800.000" }).result)).toEqual([]);
    expect(ledgerTableRows(null)).toEqual([]);
  });
});
