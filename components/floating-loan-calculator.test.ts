/**
 * Rendered-markup contracts for /cong-cu/lai-suat-tha-noi/.
 *
 * ORIGINAL ROW 11: "Biến thành chế độ nổi bật của công cụ vay; hiện tháng
 * chuyển lãi; nút thử tăng 1/2/3 điểm phần trăm với nhãn kịch bản; chỉ mở chu
 * kỳ/trần khi cần." The percentage-point presets were the missing piece; what
 * is asserted here is that they are on the page, that they are named as
 * scenarios rather than forecasts, that the whole page moves to the selected
 * one, and that the reader's own figures survive the selection.
 *
 * Server-rendered with `renderToStaticMarkup`, which is the right fidelity:
 * the page is prerendered at its defaults and must hydrate byte-identically.
 * Nothing here is a visual check — docs §6's rule stands.
 */
import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { FLOATING_LOAN } from "@/content/calculators/floating-loan";

const CONTENT = "@/content/calculators/floating-loan";

type FormPatch = Partial<Record<keyof typeof FLOATING_LOAN.form, string>>;

/** Render the tool, optionally at a scenario and/or with patched defaults. */
async function render(options?: {
  stressPoints?: number;
  patch?: FormPatch;
}): Promise<string> {
  vi.resetModules();
  if (options?.patch) {
    vi.doMock(CONTENT, async () => {
      const actual = await vi.importActual<
        typeof import("@/content/calculators/floating-loan")
      >(CONTENT);
      return {
        FLOATING_LOAN: {
          ...actual.FLOATING_LOAN,
          form: { ...actual.FLOATING_LOAN.form, ...options.patch },
        },
      };
    });
  }
  try {
    const { FloatingLoanCalculator } = await import(
      "@/components/floating-loan-calculator"
    );
    return renderToStaticMarkup(
      createElement(FloatingLoanCalculator, {
        initialStressPoints: options?.stressPoints ?? 0,
      }),
    );
  } finally {
    vi.doUnmock(CONTENT);
    vi.resetModules();
  }
}

/** The content object as the render above saw it. */
async function copy(patch?: FormPatch) {
  const actual = await vi.importActual<
    typeof import("@/content/calculators/floating-loan")
  >(CONTENT);
  return {
    ...actual.FLOATING_LOAN,
    form: { ...actual.FLOATING_LOAN.form, ...patch },
  };
}

describe("the percentage-point presets are on the page", () => {
  it("offers the baseline and +1/+2/+3, in the primary flow", async () => {
    const C = await copy();
    const html = await render();

    expect(html).toContain(C.form.stressLegend);
    expect(html).toContain(C.form.stressBaselineOption);
    expect(html).toContain(C.form.stressPlusOne);
    expect(html).toContain(C.form.stressPlusTwo);
    expect(html).toContain(C.form.stressPlusThree);

    // In the flow, not inside the collapsed step-up panel: the presets appear
    // BEFORE that panel's own heading in source order.
    expect(html.indexOf(C.form.stressLegend)).toBeLessThan(
      html.indexOf(C.form.scenarioGroupTitle),
    );
    // And after the rate they shift, which is the field they are about.
    expect(html.indexOf(C.form.postRateLabel)).toBeLessThan(
      html.indexOf(C.form.stressLegend),
    );
  });

  it("labels them as percentage POINTS and as hypothetical", async () => {
    const C = await copy();
    // The distinction the audit insisted on: +1 on 11%/năm is 12%/năm, not
    // 11,11%/năm.
    expect(C.form.stressPlusOne).toContain("điểm %");
    expect(C.form.stressPlusTwo).toContain("điểm %");
    expect(C.form.stressPlusThree).toContain("điểm %");
    expect(C.form.stressHelp).toContain("KỊCH BẢN");
    expect(C.form.stressHelp).toContain("ĐIỂM PHẦN TRĂM");
    expect(C.form.stressHelp).toContain("không phải dự báo");
    // No forecast, no bank quote.
    const html = await render();
    expect(html).toContain(C.form.stressHelp);
    expect(html).not.toContain("sẽ tăng lên");
  });

  it("opens on the reader's own figures with nothing added", async () => {
    const C = await copy();
    const html = await render();
    // The default page is the baseline: 11%/năm, the fixture's own instalment.
    expect(html).toContain(C.form.stressBaselineNotice);
    expect(html).toContain(C.form.stressAppliedLabel);
    expect(html).toContain("11,00%");
    expect(html).toContain("20.479.346 ₫");
    // Nothing claims a difference that does not exist yet.
    expect(html).not.toContain(C.form.stressPaymentIncreaseLabel);
    expect(html).not.toContain(C.form.stressBaselinePaymentLabel);
  });
});

describe("the whole page follows the selected scenario", () => {
  // The total interest is a TYPED cell in the detail block, so it renders as
  // a compact reading beside an exact one with no per-figure "₫" — the unit
  // line carries it. Asserted on the exact reading, delimited, so a substring
  // of a longer figure cannot pass.
  it.each([
    [1, "12,00%", "21.807.309 ₫", ">3.165.408.920<"],
    [2, "13,00%", "23.166.370 ₫", ">3.475.274.620<"],
    [3, "14,00%", "24.554.087 ₫", ">3.791.674.203<"],
  ])(
    "at +%i point(s) the headline, rate and total interest all move",
    async (points, rate, payment, interest) => {
      const C = await copy();
      const html = await render({ stressPoints: points });

      // The rate actually in use is stated.
      expect(html).toContain(rate);
      // The headline "mức cao nhất phải chịu" is the scenario's instalment,
      // not the baseline's — one scenario drives the answer.
      expect(html).toContain(payment);
      // The detail figures and the phase table come from the same schedule.
      expect(html).toContain(interest);
      expect(html).toContain(C.form.totalInterestLabel);
      // And the baseline is still on screen to compare against.
      expect(html).toContain(C.form.stressBaselinePaymentLabel);
      expect(html).toContain("20.479.346 ₫");
      expect(html).not.toContain(C.form.stressBaselineNotice);
    },
  );

  it("never moves the promotional instalment", async () => {
    const C = await copy();
    for (const points of [0, 1, 2, 3]) {
      const html = await render({ stressPoints: points });
      // 16.111.864 ₫ is what the borrower pays today, in every scenario.
      expect(html, `+${points}`).toContain("16.111.864 ₫");
      expect(html, `+${points}`).toContain(C.form.firstPaymentLabel);
    }
  });

  it("states the increase against the baseline, on its own", async () => {
    const html = await render({ stressPoints: 1 });
    // 21.807.309 − 20.479.346 = 1.327.963 ₫ a month.
    expect(html).toContain("1.327.963 ₫");
    // 3.165.408.920 − 2.862.633.323 = 302.775.597 ₫ over the term.
    expect(html).toContain("302.775.597 ₫");
  });

  it("keeps exactly one live results region", async () => {
    // docs §4. The comparison group is `live={false}`: it is a comparison the
    // reader asked for, not something to re-announce on every keystroke.
    for (const points of [0, 3]) {
      const html = await render({ stressPoints: points });
      const live = html.match(/data-results-live="true"/g) ?? [];
      expect(live.length, `+${points}`).toBe(1);
    }
  });
});

describe("the budget line comes from the reader or not at all", () => {
  it("states no gap when the budget field is empty", async () => {
    const C = await copy();
    const html = await render({ stressPoints: 3 });
    expect(html).not.toContain(C.form.stressBudgetGapLabel);
    expect(html).not.toContain(C.form.stressBudgetOverNotice);
  });

  it("states a signed gap and warns when the scenario overruns it", async () => {
    const patch = { defaultBudget: "21.000.000" };
    const C = await copy(patch);
    // The audit's own budget column: +520.654 ₫ at the baseline, −807.309 ₫ at
    // +1 point. The label names the month it is about — month 13 here — because
    // it is the RESET month's gap and not scenario-wide headroom.
    const baseline = await render({ patch });
    expect(baseline).toContain("Ngân sách trừ khoản trả ở tháng 13");
    expect(baseline).toContain("520.654 ₫");
    expect(baseline).not.toContain(C.form.stressBudgetOverNotice);
    // With no recurring step the peak IS the reset, so there is no second row.
    expect(baseline).not.toContain("Ngân sách trừ khoản trả cao nhất");

    const stressed = await render({ stressPoints: 1, patch });
    expect(stressed).toContain("-807.309 ₫");
    expect(stressed).toContain(C.form.stressBudgetOverNotice);
  });

  /**
   * The case a single gap hides, from the supervisor's stepped fixture: at a
   * 22 triệu budget with +1 point and a 0,5-point step every 12 months, the
   * reset fits by 192.691 ₫ and the peak misses by 7.707.822 ₫. One "ngân sách
   * trừ khoản trả" row would have read as scenario-wide headroom.
   */
  it("surfaces a later peak that overruns a budget the reset fits", async () => {
    const patch = { defaultBudget: "22.000.000", defaultAdjustStep: "0,5" };
    const C = await copy(patch);
    const html = await render({ stressPoints: 1, patch });

    // The reset month's gap, positive.
    expect(html).toContain("Ngân sách trừ khoản trả ở tháng 13");
    expect(html).toContain("192.691 ₫");
    // The peak's gap, negative, at its own month — a different row.
    expect(html).toContain("Ngân sách trừ khoản trả cao nhất (tháng 229)");
    expect(html).toContain("-7.707.822 ₫");
    // And the page says which is which rather than leaving the reader to read
    // the first row as a verdict.
    expect(html).toContain("Tại tháng 229, khoản trả cao nhất vượt ngân sách");
    expect(html).toContain("7.707.822 ₫ mỗi tháng");
    // AT the peak, never FROM it: the peak is the HIGHEST instalment, not the
    // first one over the budget. On this fixture the budget is first exceeded
    // in month 25, so "từ tháng 229" would be wrong in the reader's favour —
    // and this tool does not compute a first-overrun month.
    expect(html).not.toContain("từ tháng 229");
    // NOT the "already over budget at the reset" notice: that is a different
    // state and this fixture is not in it.
    expect(html).not.toContain(C.form.stressBudgetOverNotice);
  });

  /**
   * The wording carryover, decided by a counterexample.
   *
   * At a 22 triệu budget the payment first passes it in month 25 while the
   * peak is month 229 — so the notice must not point at 229 as the start. But
   * at a 29,7 triệu budget the PEAK MONTH IS the first month over, so the
   * notice must not assert an earlier overrun either. It says the budget MAY
   * have been passed earlier and that the tool does not compute which month,
   * which is true in both fixtures.
   */
  it("does not assert an overrun before the peak, because there may be none", async () => {
    const patch = { defaultBudget: "29.700.000", defaultAdjustStep: "0,5" };
    const C = await copy(patch);
    const html = await render({ stressPoints: 1, patch });

    // The peak still overruns, so the notice is on screen.
    expect(html).toContain("Tại tháng 229, khoản trả cao nhất vượt ngân sách");
    expect(html).toContain("7.822 ₫");
    // Stated as a possibility, and the limit is named.
    expect(C.form.stressBudgetOverLaterNotice).toContain("CÓ THỂ đã bị vượt");
    expect(C.form.stressBudgetOverLaterNotice).toContain(
      "không tính tháng đầu tiên vượt ngân sách",
    );
    // No definite earlier-overrun claim, and no jargon.
    expect(C.form.stressBudgetOverLaterNotice).not.toContain("TRƯỚC mốc này");
    expect(C.form.stressBudgetOverLaterNotice).not.toContain("gap");
    // It points at the figures that CAN answer the question.
    expect(C.form.stressBudgetOverLaterNotice).toContain("bảng từng giai đoạn");
  });

  it("keeps the copy free of untranslated jargon", () => {
    // "gap" was the only English word that had reached this page's copy.
    const strings = JSON.stringify(FLOATING_LOAN);
    expect(strings).not.toContain("gap");
  });
});

describe("the reader's own step and cap survive a scenario", () => {
  it("says the recurring step still applies, from the shifted rate", async () => {
    const patch = { defaultAdjustStep: "0,5" };
    const C = await copy(patch);
    const html = await render({ stressPoints: 2, patch });
    expect(html).toContain(C.form.stressStepNotice);
    // 13% then 13,5% then 14%: the step runs from the scenario's rate, and it
    // is applied once.
    expect(html).toContain("13,00%");
    expect(html).toContain("13,50%");
  });

  it("says when a cap the reader set absorbed the shift", async () => {
    const patch = { defaultRateCap: "11,5" };
    const C = await copy(patch);
    const html = await render({ stressPoints: 3, patch });
    expect(html).toContain(C.form.stressCapNotice);
    // Both figures, so it is visible that the cap is what stopped it.
    expect(html).toContain(C.form.stressRequestedLabel);
    expect(html).toContain("14,00%");
    expect(html).toContain("11,50%");
  });

  it("makes no cap claim when the cap is not binding", async () => {
    const patch = { defaultRateCap: "20" };
    const C = await copy(patch);
    const html = await render({ stressPoints: 3, patch });
    expect(html).not.toContain(C.form.stressCapNotice);
    expect(html).not.toContain(C.form.stressRequestedLabel);
  });
});

describe("whole-month fields use the count grammar and the stated bound", () => {
  it.each([
    ["term", "defaultTerm" as const, "termInvalid" as const],
    ["promo months", "defaultPromoMonths" as const, "promoMonthsInvalid" as const],
    ["review cycle", "defaultAdjustEvery" as const, "adjustEveryInvalid" as const],
  ])("rejects a grouped figure in the %s field", async (_name, key, error) => {
    // docs §4: `parseDecimal("1.200")` is 1,2, so the dot was eaten before any
    // integer guard could run and the field's own message was unreachable.
    // `parseCount` is digits only, so the typed value is rejected as typed.
    const patch = { [key]: "1.200" } as FormPatch;
    const C = await copy(patch);
    const html = await render({ patch });
    expect(html).toContain('value="1.200"');
    expect(html).toContain(C.form[error]);
    expect(html).toContain('aria-invalid="true"');
    // No schedule is built from an unreadable count.
    expect(html).not.toContain("16.111.864 ₫");
  });

  it.each([
    ["3,5", "defaultTerm" as const],
    ["3.0", "defaultTerm" as const],
    ["-12", "defaultTerm" as const],
  ])("rejects %s as a month count", async (typed, key) => {
    const patch = { [key]: typed } as FormPatch;
    const C = await copy(patch);
    const html = await render({ patch });
    expect(html).toContain(C.form.termInvalid);
    expect(html).not.toContain("16.111.864 ₫");
  });

  it("accepts the supported horizon and refuses one month past it", async () => {
    const atBound = await render({ patch: { defaultTerm: "1200" } });
    // A real schedule: the phase table's last row ends at month 1200.
    expect(atBound).toContain("13–1200");
    const C = await copy({ defaultTerm: "1201" });
    const past = await render({ patch: { defaultTerm: "1201" } });
    expect(past).toContain(C.form.termInvalid);
    expect(past).toContain('value="1201"');
    expect(past).toContain(C.chart.unavailableRecovery);
  });

  it("keeps a promotion of 0 months legitimate", async () => {
    const C = await copy({ defaultPromoMonths: "0" });
    const html = await render({ patch: { defaultPromoMonths: "0" } });
    expect(html).not.toContain(C.form.promoMonthsInvalid);
    // One phase, starting at month 1, at the post-promotional rate.
    expect(html).toContain("1–240");
    expect(html).toContain("11,00%");
  });
});

describe("the page's own disclaimer matches the model", () => {
  it("does not claim a constant rate on the page about rates changing", () => {
    // The shared text says "giả định lãi suất không đổi". This engine changes
    // the rate at every phase boundary, so the tool owns its own wording.
    expect(FLOATING_LOAN.disclaimer).not.toContain(
      "giả định lãi suất không đổi",
    );
    expect(FLOATING_LOAN.disclaimer).toContain("KHÔNG được giả định không đổi");
    expect(FLOATING_LOAN.disclaimer).toContain("không phải dự báo");
  });

  it("keeps the mandatory opening the built-markup check asserts", () => {
    // `scripts/check-built-markup.mjs` requires exactly one
    // "Công cụ này chỉ mang tính minh họa" per calculator page. Overriding the
    // text must not weaken that contract.
    expect(FLOATING_LOAN.disclaimer.startsWith("Công cụ này chỉ mang tính minh họa")).toBe(
      true,
    );
    const occurrences =
      FLOATING_LOAN.disclaimer.split("Công cụ này chỉ mang tính minh họa")
        .length - 1;
    expect(occurrences).toBe(1);
  });
});

describe("invalid input clears the scenario too", () => {
  it("clears the comparison and the chart, and keeps the typed value", async () => {
    const patch = { defaultPostRate: "abc" };
    const C = await copy(patch);
    const html = await render({ stressPoints: 2, patch });
    // The typed value survives, the field explains itself...
    expect(html).toContain('value="abc"');
    expect(html).toContain(C.form.postRateInvalid);
    expect(html).toContain('aria-invalid="true"');
    // ...and no scenario figure is invented from an unreadable rate.
    expect(html).not.toContain("23.166.370 ₫");
    expect(html).toContain(C.chart.unavailableRecovery);
  });
});
