/**
 * Rendered-markup contracts for /cong-cu/kha-nang-mua-nha/.
 *
 * ORIGINAL ROW 7: "Tách khả năng theo giới hạn vay và ngân sách sinh hoạt;
 * cho nhập thu nhập thực nhận, chi phí, dự phòng; công khai giả định và không
 * gắn nhãn an toàn nếu thiếu dữ liệu", with a visual that includes "so kịch
 * bản". The modes, the unknown-expense guard and the allocation visuals were
 * already in place; the missing piece was a real baseline-versus-changed
 * comparison, which is most of what this file covers.
 *
 * The comparison view is rendered through the PRODUCTION engine — two
 * `computeAffordability` results and the real `compareAffordabilityScenarios`
 * — so a figure asserted here is a figure the page shows, not one re-derived
 * in the test.
 *
 * Nothing here is a visual check. docs §6's rule stands.
 */
import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  AffordabilityCalculator,
  AffordabilityScenarioComparison,
} from "@/components/affordability-calculator";
import { AFFORDABILITY as C } from "@/content/calculators/affordability";
import {
  computeAffordability,
  type AffordabilityInput,
} from "@/lib/calc/affordability";
import { compareAffordabilityScenarios } from "@/lib/calc/affordability-compare";

const BASE: AffordabilityInput = {
  mode: "household",
  monthlyIncome: 55_000_000,
  monthlyNetIncome: 45_000_000,
  essentialExpenses: 20_000_000,
  monthlyDebts: 3_000_000,
  monthlyBuffer: 5_000_000,
  monthlyHousingCosts: 2_000_000,
  downPayment: 900_000_000,
  cashReserve: 150_000_000,
  purchaseCostPercent: 3,
  assumedMaxLtvPercent: 70,
  termMonths: 240,
  housingRatioPercent: 40,
  totalDebtRatioPercent: 50,
  annualRatePercent: 8.5,
};

/** A scenario from the real engine. Throws rather than asserting a null away. */
function scenario(patch: Partial<AffordabilityInput>) {
  const input = { ...BASE, ...patch };
  const result = computeAffordability(input);
  if (result === null) throw new Error("fixture does not compute");
  return { input, result };
}

/** The comparison view, with both sides from the engine. */
function renderComparison(
  patch: Partial<AffordabilityInput>,
  options?: { currentBroken?: boolean },
) {
  const baseline = scenario({});
  const current = scenario(patch);
  return renderToStaticMarkup(
    createElement(AffordabilityScenarioComparison, {
      snapshot: baseline,
      // A broken current side has no readable assumptions either, which is
      // what `null` says.
      currentInput: options?.currentBroken ? null : current.input,
      result: options?.currentBroken ? null : current.result,
      comparison: options?.currentBroken
        ? null
        : compareAffordabilityScenarios(baseline, current),
    }),
  );
}

describe("the comparison is offered, and says it is not saved", () => {
  const html = renderToStaticMarkup(createElement(AffordabilityCalculator));

  it("offers a capture control at the defaults", () => {
    expect(html).toContain(C.form.compareCaptureAction);
    expect(html).toContain(C.form.compareCaptureHint);
    expect(html).toContain('type="button"');
  });

  it("shows no comparison before one has been taken", () => {
    expect(html).not.toContain(C.form.compareTitle);
    expect(html).not.toContain(C.form.compareClearAction);
    expect(html).not.toContain(C.form.compareChangedIntro);
  });

  it("claims no storage, no transfer and no bank decision", () => {
    // The honest-handoff contract: this is a mốc in an open page.
    expect(C.form.compareCaptureHint).toContain("không được lưu");
    expect(C.form.compareCaptureHint).toContain("không được gửi đi");
    for (const forbidden of [
      "Lưu kế hoạch",
      "đăng nhập",
      "ngân hàng đã đồng ý cho vay",
      "được duyệt",
    ]) {
      expect(C.form.compareCaptureHint, forbidden).not.toContain(forbidden);
      expect(C.form.compareTitle, forbidden).not.toContain(forbidden);
    }
  });

  it("keeps exactly one live results region with the comparison on screen", () => {
    // docs §4. The comparison group is `live={false}`.
    const withComparison =
      html + renderComparison({ annualRatePercent: 10.5 });
    const live = withComparison.match(/data-results-live="true"/g) ?? [];
    expect(live.length).toBe(1);
  });
});

describe("the comparison names the change and shows both sides", () => {
  it("puts the snapshot's figure beside the current one", () => {
    const html = renderComparison({ annualRatePercent: 10.5 });
    expect(html).toContain(C.form.compareTitle);
    // 2.272.727.273 ₫ → 2.186.829.236 ₫ on the audit's own fixture.
    expect(html).toContain("2.272.727.273 ₫ → 2.186.829.236 ₫");
    // And the signed move, which is what the reader is looking for.
    expect(html).toContain("-85.898.037 ₫");
  });

  it("names which assumption moved, with its value before and after", () => {
    // Naming only the FIELD left the reader to remember what they had typed a
    // moment ago, which is what a comparison exists to spare them.
    const html = renderComparison({ annualRatePercent: 10.5 });
    expect(html).toContain(`${C.form.compareChangedIntro}:`);
    expect(html).toContain(
      `${C.form.compareKeyLabels.annualRatePercent}: 8,50% → 10,50%`,
    );
    // Only the one that moved.
    expect(html).not.toContain(C.form.compareKeyLabels.termMonths);
    expect(html).not.toContain(C.form.compareUnchangedNote);
  });

  it("formats each changed value by what the field means", () => {
    // A money amount, a rate and a count of months are three grammars, and
    // "10,5" beside "10.500.000 ₫" is the 1000× trap in reverse.
    const html = renderComparison({
      annualRatePercent: 10.5,
      downPayment: 1_200_000_000,
      termMonths: 300,
    });
    expect(html).toContain(
      `${C.form.compareKeyLabels.downPayment}: 900.000.000 ₫ → 1.200.000.000 ₫`,
    );
    expect(html).toContain(
      `${C.form.compareKeyLabels.annualRatePercent}: 8,50% → 10,50%`,
    );
    expect(html).toContain(
      `${C.form.compareKeyLabels.termMonths}: 240 ${C.form.compareMonthsUnit} → 300 ${C.form.compareMonthsUnit}`,
    );
    // In the model's order, not insertion or alphabetical order.
    expect(html.indexOf(C.form.compareKeyLabels.downPayment)).toBeLessThan(
      html.indexOf(`${C.form.compareKeyLabels.annualRatePercent}: 8,50%`),
    );
  });

  it("names the changed question, not a raw mode key", () => {
    const html = renderComparison({ mode: "ceiling" });
    expect(html).toContain(
      `${C.form.compareKeyLabels.mode}: ${C.form.compareModeHousehold} → ${C.form.compareModeCeiling}`,
    );
    expect(html).not.toContain("household →");
  });

  it("says an unsupplied figure is unsupplied, not zero", () => {
    const html = renderComparison({ essentialExpenses: undefined });
    expect(html).toContain(
      `${C.form.compareKeyLabels.essentialExpenses}: 20.000.000 ₫ → ${C.form.compareUnset}`,
    );
  });

  it("names both sides' binding reason in a row of its own", () => {
    // The note used to point at "hai dòng" in the detail panel, which holds
    // only the current scenario's row.
    const html = renderComparison({ annualRatePercent: 10.5 });
    expect(html).toContain(C.form.compareBindingLabel);
    expect(html).toContain(
      `${C.form.priceBindingFinancing} → ${C.form.priceBindingPayment}`,
    );
    expect(C.form.compareBindingChangedNote).not.toContain("hai dòng");
  });

  it("says nothing has changed rather than inventing a comparison", () => {
    const html = renderComparison({});
    expect(html).toContain(C.form.compareUnchangedNote);
    expect(html).not.toContain(C.form.compareChangedIntro);
    // Both sides are the same figure, and the change reads as a real zero.
    expect(html).toContain("2.272.727.273 ₫ → 2.272.727.273 ₫");
    expect(html).toContain("0 ₫");
  });

  it("keeps capacity and the financeable loan as separate rows", () => {
    // Original row 7's "distinguish payment capacity from actual financeable
    // price": at 8,5% the payment services 1,73 tỷ while 1,59 tỷ is usable.
    const html = renderComparison({ annualRatePercent: 10.5 });
    expect(html).toContain(C.form.compareCapacityLabel);
    expect(html).toContain(C.form.compareLoanLabel);
    expect(html).toContain("1.728.462.597 ₫ → 1.502.434.113 ₫");
    expect(html).toContain("1.590.909.091 ₫ → 1.502.434.113 ₫");
  });

  it("says when the ceiling capping the price changed hands", () => {
    const html = renderComparison({ annualRatePercent: 10.5 });
    expect(html).toContain(C.form.compareBindingChangedNote);
  });
});

describe("what the comparison refuses to present as one question", () => {
  it("names the changed question when the mode differs", () => {
    const html = renderComparison({ mode: "ceiling" });
    expect(html).toContain(C.form.compareModeChangedNote);
    expect(C.form.compareModeChangedNote).toContain("HAI CÂU HỎI");
    expect(html).toContain(C.form.compareKeyLabels.mode);
    // On this fixture the cash binds both sides, so the PRICE is identical
    // while the question is not — nothing in the figures could carry that.
    expect(html).toContain("2.272.727.273 ₫ → 2.272.727.273 ₫");
  });

  it("carries the unknown-expense qualification into the comparison", () => {
    const html = renderComparison({ essentialExpenses: undefined });
    expect(html).toContain(C.form.compareLimitedNote);
    expect(html).toContain(C.form.compareKeyLabels.essentialExpenses);
  });

  it("keeps the snapshot when the current side has a broken field", () => {
    const html = renderComparison(
      { annualRatePercent: 10.5 },
      { currentBroken: true },
    );
    expect(html).toContain(C.form.compareStaleNote);
    // The mốc is not deleted, and no figure is invented for the current side.
    expect(html).toContain(C.form.compareTitle);
    expect(html).not.toContain("2.186.829.236 ₫");
  });
});

describe("the budget and the instalment are two labelled rows", () => {
  it("calls the budget a budget and shows the instalment beside it", () => {
    // The reproduced label defect: 15.000.000 ₫ presented as "trả gốc và lãi
    // mỗi tháng" when the 1.590.909.091 ₫ loan charges 13.806.279 ₫.
    const html = renderToStaticMarkup(
      createElement(AffordabilityScenarioComparison, {
        snapshot: scenario({}),
        currentInput: scenario({}).input,
        result: scenario({}).result,
        comparison: compareAffordabilityScenarios(scenario({}), scenario({})),
      }),
    );
    expect(html).toContain(C.form.compareExpectedPaymentLabel);
    expect(html).toContain("13.806.279 ₫");
    expect(C.form.paymentLabel).toContain("Ngân sách");
    expect(C.form.paymentLabel).not.toBe("Trả gốc và lãi mỗi tháng");
  });

  it("puts both figures on the page at the shipped defaults", () => {
    const html = renderToStaticMarkup(createElement(AffordabilityCalculator));
    expect(html).toContain(C.form.paymentLabel);
    expect(html).toContain(C.form.expectedPaymentLabel);
  });

  it("explains the gap only when the two figures differ", () => {
    // The shipped defaults assume a 100% financing share and no purchase
    // costs, so the payment is what binds, the two monthly figures coincide,
    // and there is nothing to explain.
    const defaults = renderToStaticMarkup(
      createElement(AffordabilityCalculator),
    );
    expect(defaults).not.toContain(C.form.expectedPaymentBelowBudgetNotice);

    // The audit's fixture assumes a 70% share against 750 triệu of usable
    // cash: the cash binds, the gap is 1.193.721 ₫ a month, and that is the
    // state the notice exists for.
    const bound = computeAffordability(BASE);
    expect(bound).not.toBeNull();
    if (bound === null) return;
    expect(bound.priceBinding).toBe("financing");
    expect(
      bound.affordablePrincipalInterest - bound.expectedPrincipalInterest,
    ).toBeGreaterThan(0.5);
    expect(C.form.expectedPaymentBelowBudgetNotice).toContain(
      "tiền tự có và giả định vay được",
    );
  });
});

describe("the stale bank-acceptance copy is gone", () => {
  it("no longer says the tool computes what a bank accepts", () => {
    const strings = JSON.stringify(C);
    // The exact sentence the audit flagged, which predated the two modes.
    expect(strings).not.toContain(
      "Công cụ tính mức tối đa ngân hàng chấp nhận",
    );
    expect(strings).not.toContain("không tính mức khiến bạn ngủ được");
  });

  it("no longer calls the reader's own ratios a bank ceiling", () => {
    const prose = C.formula.body.join(" ");
    expect(prose).not.toContain("TRẦN CỦA NGÂN HÀNG");
    expect(prose).not.toContain("ngân hàng sẵn sàng cho vay nhiều hơn");
    expect(prose).toContain("TRẦN THEO TỶ LỆ BẠN GIẢ ĐỊNH");
  });

  it("states the financing-share ceiling the model actually applies", () => {
    // The price formula used to show only `(loan + cash) / (1 + cost)`, which
    // is the ceiling that let an earlier version report negative equity.
    const prose = C.formula.body.join(" ");
    expect(prose).toContain("tỷ lệ chi phí − tỷ lệ vay được");
    expect(prose).toContain("HAI trần trên giá");
    // And it says the two monthly figures can differ, and when.
    expect(prose).toContain("NHỎ HƠN khoản vay mà ngân sách gánh được");
  });

  it("qualifies which costs the page actually models", () => {
    // The shared disclaimer says fees are excluded; the entered purchase-cost
    // percentage is modelled and funded from the same cash as the deposit.
    expect(C.disclaimer.startsWith("Công cụ này chỉ mang tính minh họa")).toBe(
      true,
    );
    expect(
      C.disclaimer.split("Công cụ này chỉ mang tính minh họa").length - 1,
    ).toBe(1);
    expect(C.disclaimer).toContain("Đã tính");
    expect(C.disclaimer).toContain("chi phí mua nhà ngoài giá");
    expect(C.disclaimer).toContain("Chưa tính");
    expect(C.disclaimer).toContain("không phải cam kết cho vay");
  });

  it("still tells the reader where the comfort question lives", () => {
    const ratioFaq = C.faq.items.find((item) =>
      item.q.includes("40% thu nhập"),
    );
    expect(ratioFaq).toBeDefined();
    expect(ratioFaq?.a).toContain("giả định của BẠN");
    expect(ratioFaq?.a).toContain("ngân sách của hộ");
  });
});
