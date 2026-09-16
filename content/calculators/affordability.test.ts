import { describe, it, expect } from "vitest";
import { AFFORDABILITY as C } from "@/content/calculators/affordability";
import { CHART_UI } from "@/content/calculators/chart-ui";
import {
  computeAffordability,
  type AffordabilityMode,
} from "@/lib/calc/affordability";
import {
  monthlyAllocationModel,
  priceCompositionModel,
} from "@/lib/calc/charts/affordability-chart";
import { formatMoney, formatPercent, parseDecimal, parseMoney } from "@/lib/calc/number";

/**
 * The module at its shipped defaults, plus every figure this page's prose
 * quotes, bound to the module's own output.
 *
 * docs §8: "Verify numbers by executing the module, not by re-reading the
 * code. Several figures quoted in content/calculators/*.ts prose were wrong on
 * the first pass and only fixed by running the module."
 *
 * This page is the one most exposed to that: changing the default mode from
 * the credit ceiling to the household budget changed the headline figure, and
 * five sentences of prose quote it.
 */

function fromDefaults(mode: AffordabilityMode = C.form.defaultMode as AffordabilityMode) {
  const netIncome = parseMoney(C.form.defaultNetIncome);
  const essentialsRaw = C.form.defaultEssentials.trim();
  const essentialsKnown = essentialsRaw !== "";
  // Exactly what the component does with a blank field: pass `undefined`, so
  // the module reports an unknown rather than a stated zero.
  const essentials = essentialsKnown ? parseMoney(essentialsRaw) : undefined;
  const buffer = parseMoney(C.form.defaultBuffer);
  const income = parseMoney(C.form.defaultIncome);
  const debts = parseMoney(C.form.defaultDebts);
  const down = parseMoney(C.form.defaultDown);
  const reserve = parseMoney(C.form.defaultReserve);
  const purchaseCost = parseDecimal(C.form.defaultPurchaseCost);
  const rate = parseDecimal(C.form.defaultRate);
  const term = parseDecimal(C.form.defaultTerm);
  const housingCosts = parseMoney(C.form.defaultHousingCosts);
  const housingRatio = parseDecimal(C.form.defaultHousingRatio);
  const totalRatio = parseDecimal(C.form.defaultTotalRatio);

  const ltv = parseDecimal(C.form.defaultLtv);
  const values = {
    netIncome,
    buffer,
    income,
    debts,
    down,
    reserve,
    purchaseCost,
    rate,
    term,
    housingCosts,
    housingRatio,
    totalRatio,
    ltv,
  };
  for (const [key, value] of Object.entries(values)) {
    if (value === null) {
      throw new Error(`default "${key}" does not parse with its own parser`);
    }
  }
  // A blank expenses default is legitimate; a non-empty one that fails to
  // parse is not.
  if (essentialsKnown && essentials === null) {
    throw new Error('default "essentials" does not parse with its own parser');
  }

  return {
    essentialsKnown,
    result: computeAffordability({
      mode,
      monthlyIncome: income!,
      monthlyNetIncome: mode === "household" ? netIncome! : undefined,
      essentialExpenses: essentials ?? undefined,
      monthlyBuffer: buffer!,
      monthlyDebts: debts!,
      downPayment: down!,
      cashReserve: reserve!,
      purchaseCostPercent: purchaseCost!,
      assumedMaxLtvPercent: ltv!,
      annualRatePercent: rate!,
      termMonths: term!,
      monthlyHousingCosts: housingCosts!,
      housingRatioPercent: housingRatio!,
      totalDebtRatioPercent: totalRatio!,
    }),
  };
}

describe("the shipped defaults", () => {
  it("open on the household question, not the lender's", () => {
    // The default mode IS the product decision: a first-home buyer's question
    // is "what can we carry", and the page used to answer only "what will a
    // bank lend".
    expect(C.form.defaultMode).toBe("household");
  });

  it("describe a complete household rather than a half-filled form", () => {
    // A blank expenses field is a legitimate state that the tool flags — but
    // it is the wrong state for a worked EXAMPLE, which should show what the
    // mode is for.
    expect(C.form.defaultEssentials.trim()).not.toBe("");
    expect(fromDefaults().essentialsKnown).toBe(true);
  });

  it("keep every default parseable by the parser its field uses", () => {
    expect(() => fromDefaults()).not.toThrow();
    expect(parseMoney(C.form.defaultNetIncome)).toBe(44_000_000);
    expect(parseMoney(C.form.defaultEssentials)).toBe(18_000_000);
    expect(parseDecimal(C.form.defaultPurchaseCost)).toBe(0);
  });

  it("state a net income below the gross one", () => {
    // Two fields that could be confused, and the example has to make the
    // difference visible rather than setting them equal.
    const net = parseMoney(C.form.defaultNetIncome)!;
    const gross = parseMoney(C.form.defaultIncome)!;
    expect(net).toBeLessThan(gross);
  });
});

describe("the default result, and the prose that quotes it", () => {
  const { result } = fromDefaults();
  if (result === null) throw new Error("the shipped defaults do not compute");

  it("lets the household bind below the assumed ratio ceiling", () => {
    // The whole point of the rebuild, at the defaults where a reader meets it.
    expect(result.bindingLimit).toBe("household");
    expect(formatMoney(result.householdResidual!)).toBe("18.000.000");
    expect(formatMoney(result.assumedRatioCeiling)).toBe("20.000.000");
  });

  it("lets the payment, not the cash, set the price at the defaults", () => {
    // 100% assumed financing and no purchase costs, so the financing bound is
    // inert and the price is the payment's.
    expect(result.priceBinding).toBe("payment");
    expect(result.financingBlocked).toBe(false);
    expect(result.maxLoan).toBeCloseTo(result.paymentSupportedLoan, 4);
  });

  it("produces exactly the figures the prose quotes", () => {
    // Each of these strings appears verbatim in `C.formula.body`. Binding them
    // here is what stops the prose drifting from the module.
    expect(formatMoney(result.maxLoan)).toBe("2.074.155.117");
    expect(formatMoney(result.maxPrice)).toBe("2.674.155.117");
    expect(formatPercent(result.downPaymentPercent!, 1)).toBe("22,4%");
  });

  it("has the prose actually contain those figures", () => {
    const prose = C.formula.body.join(" ");
    expect(prose).toContain(formatMoney(result.maxLoan));
    expect(prose).toContain(formatMoney(result.maxPrice));
    expect(prose).toContain(formatPercent(result.downPaymentPercent!, 1));
  });

  it("quotes the ceiling-mode comparison correctly too", () => {
    const ceiling = fromDefaults("ceiling").result!;
    expect(formatMoney(ceiling.maxPrice)).toBe("2.904.616.796");
    expect(formatMoney(ceiling.maxLoan)).toBe("2.304.616.796");
    const gap = ceiling.maxPrice - result.maxPrice;
    expect(formatMoney(gap)).toBe("230.461.680");
    const prose = C.formula.body.join(" ");
    expect(prose).toContain("2.904.616.796");
    // The gap is quoted in round triệu in the prose, so the claim is that it
    // rounds to 230 triệu rather than that the string appears.
    expect(Math.round(gap / 1_000_000)).toBe(230);
  });

  it("does not claim a limited conclusion, because the example is complete", () => {
    expect(result.conclusionLimited).toBe(false);
    expect(result.infeasible).toBe(false);
  });

  it("excludes purchase costs by default, and the page has copy to say so", () => {
    expect(result.purchaseCosts).toBe(0);
    expect(C.form.purchaseCostsExcludedNotice).toContain("CHƯA");
  });

  it("deducts no reserve by default, so the cash ledger is the simple one", () => {
    expect(result.usableCash).toBe(600_000_000);
    expect(result.cashToPrice).toBeCloseTo(600_000_000, 6);
  });
});

describe("clearing the expenses field", () => {
  it("flags the conclusion and does not treat the blank as zero spending", () => {
    // The state the default no longer demonstrates, so it is tested directly.
    // `essentialExpenses` is simply absent — which is what the component sends
    // for a cleared field.
    const result = computeAffordability({
      mode: "household",
      monthlyIncome: 50_000_000,
      monthlyNetIncome: 44_000_000,
      monthlyBuffer: 3_000_000,
      monthlyDebts: 5_000_000,
      downPayment: 600_000_000,
      annualRatePercent: 8.5,
      termMonths: 240,
    })!;
    expect(result.conclusionLimited).toBe(true);
    // And with no expenses the household stops binding, which is exactly why
    // the flag has to exist: household mode would otherwise silently become
    // ceiling mode under a friendlier label.
    expect(result.bindingLimit).not.toBe("household");
  });

  it("has copy that calls the answer an upper bound, not a budget", () => {
    expect(C.form.essentialsUnknownNotice).toContain("GIỚI HẠN TRÊN");
    expect(C.form.essentialsUnknownNotice).toContain("không phải ngân sách");
  });
});

describe("the two charts, at the shipped copy and defaults", () => {
  const { result } = fromDefaults();
  const priceLabels = { ...CHART_UI.money, ...C.priceChart };
  const monthlyLabels = { ...CHART_UI.money, ...C.monthlyChart };

  it("leave no placeholder unsubstituted", () => {
    const price = priceCompositionModel(result, priceLabels);
    const monthly = monthlyAllocationModel(
      result,
      {
        netIncome: 44_000_000,
        essentialExpenses: 18_000_000,
        monthlyBuffer: 3_000_000,
        monthlyDebts: 5_000_000,
      },
      monthlyLabels,
    );
    for (const model of [price, monthly]) {
      expect(model.summary).not.toMatch(/\{[a-z]+\}/i);
      expect(model.axis.label).not.toMatch(/\{[a-z]+\}/i);
    }
  });

  it("make the monthly ledger add up to net income on the chart itself", () => {
    const monthly = monthlyAllocationModel(
      result,
      {
        netIncome: 44_000_000,
        essentialExpenses: 18_000_000,
        monthlyBuffer: 3_000_000,
        monthlyDebts: 5_000_000,
      },
      monthlyLabels,
    );
    expect(monthly.bars[0].total).toBeCloseTo(44_000_000, 6);
  });

  it("say on the chart that the ceiling is not a budget", () => {
    const monthly = monthlyAllocationModel(result, {}, monthlyLabels);
    expect(monthly.summary).toContain(C.monthlyChart.ceilingIsNotBudgetNote);
  });

  it("frames the financing share as the reader's assumption, with no range", () => {
    // The earlier copy asserted banks lend 70–80% of an appraised value. This
    // task verified no such figure, so the chart states the mechanism and
    // asks the reader for their own number instead of quoting a range.
    const text = C.priceChart.assumptions.join(" ");
    expect(text).toContain("GIẢ ĐỊNH");
    expect(text).toContain("thẩm định");
    expect(text).not.toContain("70–80%");
  });

  it("tell the reader the rate should be the post-promotional one", () => {
    const text = C.priceChart.assumptions.join(" ");
    expect(text).toContain("sau ưu đãi");
    expect(C.form.rateHelp).toContain("sau ưu đãi");
  });
});

describe("no unverified claim about lenders anywhere in this page's copy", () => {
  // Finding 3. Every visitor-facing string on this page, checked at once, so a
  // future copy edit cannot reintroduce a population claim in a corner.
  const everyString = (value: unknown): string[] => {
    if (typeof value === "string") return [value];
    if (Array.isArray(value)) return value.flatMap(everyString);
    if (value && typeof value === "object") {
      return Object.values(value).flatMap(everyString);
    }
    return [];
  };
  const copy = everyString(C).join(" ");

  it("quotes no underwriting ratio range", () => {
    for (const range of ["35–40", "45–55", "35-40", "45-55", "70–80", "70-80"]) {
      expect(copy, `copy quotes "${range}"`).not.toContain(range);
    }
  });

  it("quotes no prepayment-fee range", () => {
    expect(copy).not.toContain("1–3%");
    expect(copy).not.toContain("1-3%");
  });

  it("never says a bank publishes or does not publish a cap", () => {
    expect(copy).not.toContain("Ngân hàng Nhà nước không công bố");
    expect(copy).not.toContain("thông lệ thẩm định");
  });

  it("calls the ratios and the financing share assumptions", () => {
    expect(C.form.housingRatioHelp).toContain("giả định");
    expect(C.form.totalRatioHelp).toContain("giả định");
    expect(C.form.ltvHelp).toContain("giả định của bạn");
    expect(C.ratioNotice).toContain("GIẢ ĐỊNH");
  });

  it("never says a bank lends, approves or allows an amount", () => {
    // The ceiling is an illustration under the reader's own ratios. Naming a
    // lender as its author is the claim this page is not entitled to make.
    for (const phrase of [
      "Ngân hàng cho vay tối đa",
      "ngân hàng cho phép",
      "Ngân hàng cho phép",
      "được ngân hàng cam kết",
    ]) {
      expect(copy, `copy claims "${phrase}"`).not.toContain(phrase);
    }
    // And it says the opposite where it matters.
    expect(C.form.modeHelp).toContain("mức ngân hàng đã đồng ý");
  });
});

describe("the page's labels", () => {
  it("no longer tell the reader what price to aim for", () => {
    // "Giá nhà nên nhắm tới" read as advice a bank had agreed to. The label is
    // now a starting point for viewings, and the words that made the stronger
    // claim are banned here.
    expect(C.form.maxPriceLabel).not.toContain("nên");
    expect(C.form.resultTitle).not.toContain("nên");
    for (const phrase of ["an toàn", "được duyệt", "cam kết"]) {
      expect(
        `${C.form.resultTitle} ${C.form.maxPriceLabel}`.toLowerCase(),
      ).not.toContain(phrase);
    }
  });

  it("keep the notice that the ratios are not a rule and not an approval", () => {
    expect(C.ratioNotice).toContain("không phải quy định");
    expect(C.ratioNotice).toContain("không phải mức ngân hàng đã đồng ý");
  });

  it("tell the reader not to pre-deduct the reserve themselves", () => {
    // The double-counting trap: the old help text said "sau khi đã giữ lại quỹ
    // dự phòng", and there is now a field for exactly that.
    expect(C.form.downHelp).toContain("Đừng tự trừ");
    expect(C.form.reserveHelp).toContain("đúng một lần");
  });

  it("name three distinct binding limits", () => {
    const labels = [
      C.form.bindingHousing,
      C.form.bindingTotal,
      C.form.bindingHousehold,
    ];
    expect(new Set(labels).size).toBe(3);
  });
});
