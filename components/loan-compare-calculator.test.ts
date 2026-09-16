/**
 * Rendered-markup contracts for /cong-cu/so-sanh-khoan-vay/ and the two APR
 * pages, as one loan-selection unit.
 *
 * What this covers is the original-plan requirement the old page could not
 * meet: each offer's promotional and post-promotional rate, its fees, and a
 * COMMON holding horizon, with the debt still owed at that horizon in the
 * comparison rather than omitted. Plus the fee-aware rate view on both APR
 * routes, which keep their own URLs.
 *
 * Server-rendered with `renderToStaticMarkup`: every calculator is prerendered
 * at its defaults and must hydrate byte-identically. Nothing here is a visual
 * check — docs §6's rule stands.
 */
import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { LOAN_COMPARE } from "@/content/calculators/loan-compare";
import { FIXED_VS_FLOATING } from "@/content/calculators/fixed-vs-floating";
import { APR } from "@/content/calculators/apr";
import { APR_ADVANCED } from "@/content/calculators/apr-advanced";
import { MAX_COMPARE_MONTHS } from "@/lib/calc/loan-compare";
import { MAX_APR_MONTHS } from "@/lib/calc/apr";
import { PLACEHOLDER } from "@/lib/calc/number";

const CONTENT = "@/content/calculators/loan-compare";

type FormPatch = Partial<
  Record<keyof typeof LOAN_COMPARE.form, string | unknown>
>;

/** Render the comparison, optionally overriding some of its defaults. */
async function compare(patch?: FormPatch): Promise<string> {
  vi.resetModules();
  if (patch) {
    vi.doMock(CONTENT, async () => {
      const actual = await vi.importActual<
        typeof import("@/content/calculators/loan-compare")
      >(CONTENT);
      return {
        LOAN_COMPARE: {
          ...actual.LOAN_COMPARE,
          form: { ...actual.LOAN_COMPARE.form, ...patch },
        },
      };
    });
  }
  try {
    const loaded = await import("@/components/loan-compare-calculator");
    return renderToStaticMarkup(createElement(loaded.LoanCompareCalculator));
  } finally {
    vi.doUnmock(CONTENT);
    vi.resetModules();
  }
}

const C = LOAN_COMPARE.form;

/** Two offers where the promotional one wins early and loses over the term. */
const PROMO_VS_FLAT: FormPatch = {
  defaultHorizon: "24",
  defaults: [
    {
      rate: "11",
      term: "20",
      fee: "0",
      promoMonths: "24",
      promoRate: "6,5",
      flatFee: "0",
    },
    { rate: "9", term: "20", fee: "0", promoMonths: "", promoRate: "", flatFee: "0" },
    { rate: "", term: "", fee: "", promoMonths: "", promoRate: "", flatFee: "" },
  ],
};

describe("the common holding horizon", () => {
  it("is an input in the primary flow, not a hidden assumption", async () => {
    const html = await compare();
    expect(html).toContain(C.horizonGroup);
    expect(html).toContain(C.horizonLabel);
    expect(html).toContain(C.horizonHelp);
    // The default is a realistic hold, not the full term.
    expect(C.defaultHorizon).toBe("60");
  });

  it("rejects a grouped figure that parseDecimal would silently shrink", async () => {
    // `parseDecimal("1.200")` is 1,2 — a typed 1.200 months became one and a
    // bit with no invalid state shown.
    const html = await compare({ defaultHorizon: "1.200" });
    expect(html).toContain(C.horizonInvalid);
  });

  it("rejects a fractional or over-long horizon and clears the result", async () => {
    for (const horizon of ["60,5", String(MAX_COMPARE_MONTHS + 1), "abc"]) {
      const html = await compare({ defaultHorizon: horizon });
      expect(html, horizon).toContain(C.horizonInvalid);
      expect(html, horizon).toContain(
        LOAN_COMPARE.costChart.unavailableReason,
      );
    }
  });

  it("accepts 0 — fees paid, nothing repaid yet", async () => {
    const html = await compare({ defaultHorizon: "0" });
    expect(html).not.toContain(C.horizonInvalid);
    expect(html).not.toContain(LOAN_COMPARE.costChart.unavailableReason);
  });

  it("recovers on the next valid horizon", async () => {
    const bad = await compare({ defaultHorizon: "abc" });
    expect(bad).toContain(C.horizonInvalid);
    const good = await compare({ defaultHorizon: "36" });
    expect(good).not.toContain(C.horizonInvalid);
    expect(good).toContain(C.bestLabel);
  });

  it("names the horizon in both charts, so they share one scenario", async () => {
    const html = await compare({ defaultHorizon: "36" });
    // The cost chart's summary states the month it measured at, and the
    // timeline marks the same month on its own plot.
    expect(html).toContain("Tại tháng thứ 36");
    expect(html).toContain("Tháng 36: mốc so sánh");
  });
});

describe("each offer's own promotional path", () => {
  it("gives every offer a promo pair, a percent fee and a one-off fee", async () => {
    const html = await compare();
    expect(html).toContain(C.promoMonthsLabel);
    expect(html).toContain(C.promoRateLabel);
    expect(html).toContain(C.flatFeeLabel);
    expect(html).toContain(C.exitFeeLabel);
    // Seven fields per offer across three offers, plus amount and horizon.
    // The four optional ones sit inside each offer's own disclosure — see the
    // progressive-entry test below — so they are in the markup but not in the
    // primary flow.
    expect((html.match(/inputMode="decimal"/g) ?? []).length).toBe(23);
  });

  it("puts only the rate and term in the primary flow", async () => {
    // Original row 3 asked for progressive fee entry. Every fee and promo box
    // visible at once was the opposite; each offer now carries its own
    // disclosure, which states what is active inside it.
    const html = await compare();
    expect(html).toContain(C.optionalFeesTitle);
    expect((html.match(/Phí và lãi ưu đãi của báo giá này/g) ?? []).length).toBe(
      3,
    );
    // Collapsed at the defaults, because no optional figure is set.
    expect(html).toContain(C.optionalFeesSummary);
    expect(html).not.toMatch(
      new RegExp(`<details open[^>]*>[^]{0,400}${C.optionalFeesTitle}`),
    );
  });

  it("opens an offer's fee panel when something inside it is active", async () => {
    const html = await compare({
      defaults: [
        {
          rate: "8,5",
          term: "20",
          fee: "1",
          promoMonths: "",
          promoRate: "",
          flatFee: "",
          exitFee: "",
        },
        {
          rate: "9,2",
          term: "20",
          fee: "",
          promoMonths: "",
          promoRate: "",
          flatFee: "",
          exitFee: "",
        },
        {
          rate: "",
          term: "",
          fee: "",
          promoMonths: "",
          promoRate: "",
          flatFee: "",
          exitFee: "",
        },
      ],
    });
    // A fee inside a collapsed panel that is moving the ranking is the thing
    // the disclosure exists to prevent, so the panel opens itself.
    expect(html).toContain("<details open");
    expect(html).toContain("1,00%");
  });

  it("prices the promotional offer's two instalments", async () => {
    const html = await compare(PROMO_VS_FLAT);
    expect(html).toContain(LOAN_COMPARE.table.rows.resetPayment);
    expect(html).toContain(LOAN_COMPARE.table.rows.resetMonth);
    // The timeline says an offer steps, which is the shape of a promo.
    expect(html).toContain("phương án có bậc");
  });

  it("flags half a promotional pair instead of pricing one rate", async () => {
    const html = await compare({
      defaults: [
        {
          rate: "11",
          term: "20",
          fee: "0",
          promoMonths: "24",
          promoRate: "",
          flatFee: "0",
        },
        { rate: "9", term: "20", fee: "0", promoMonths: "", promoRate: "", flatFee: "0" },
        { rate: "", term: "", fee: "", promoMonths: "", promoRate: "", flatFee: "" },
      ],
    });
    expect(html).toContain(C.promoNeedsBoth);
  });

  it("rejects a promo stretch that is not shorter than the term", async () => {
    const html = await compare({
      defaults: [
        {
          rate: "11",
          term: "2",
          fee: "0",
          promoMonths: "24",
          promoRate: "6,5",
          flatFee: "0",
        },
        { rate: "9", term: "20", fee: "0", promoMonths: "", promoRate: "", flatFee: "0" },
        { rate: "", term: "", fee: "", promoMonths: "", promoRate: "", flatFee: "" },
      ],
    });
    expect(html).toContain(C.promoMonthsInvalid);
  });
});

describe("what the comparison refuses to hide", () => {
  it("says so when the horizon changes the winner", async () => {
    // At month 24 the promotional offer is ahead; over 240 months it is not,
    // and the page states both rather than letting one ranking stand for the
    // other. Asserted on the rendered notice, with the two option names
    // substituted the right way round.
    const html = await compare(PROMO_VS_FLAT);
    expect(html).toContain("nhưng nếu giữ đến hết kỳ hạn");
    expect(html).toContain(
      "Tại mốc bạn chọn, Phương án A rẻ hơn; nhưng nếu giữ đến hết kỳ hạn thì Phương án B rẻ hơn.",
    );
    // The same disagreement is stated on the chart that drew it.
    expect(html).toContain(
      "Nếu giữ đến hết kỳ hạn thì Phương án B mới là phương án rẻ nhất",
    );
  });

  it("carries no winner-change notice when the two rankings agree", async () => {
    const html = await compare();
    expect(html).not.toContain("nhưng nếu giữ đến hết kỳ hạn");
  });

  it("excludes an offer with a malformed promotional rate, and never prices it as a constant loan", async () => {
    // THE REPRODUCED DEFECT. `abc` in A's promotional rate used to drop the
    // promotion and price A as a constant 11% loan — first/reset payment
    // 20.643.768, no reset month, H60 cost 1.074.904.755 — then rank it,
    // with the invalid field still on screen.
    const html = await compare({
      defaultHorizon: "60",
      defaults: [
        {
          rate: "11",
          term: "20",
          fee: "",
          promoMonths: "12",
          promoRate: "abc",
          flatFee: "",
          exitFee: "",
        },
        {
          rate: "8,5",
          term: "20",
          fee: "",
          promoMonths: "",
          promoRate: "",
          flatFee: "",
          exitFee: "",
        },
        {
          rate: "",
          term: "",
          fee: "",
          promoMonths: "",
          promoRate: "",
          flatFee: "",
          exitFee: "",
        },
      ],
    });
    // The field says so...
    expect(html).toContain(C.promoRateInvalid);
    // ...and with only one valid offer left, there is NO ranking at all.
    expect(html).toContain(C.unusableBlockedNotice);
    expect(html).not.toContain(C.tooFewNotice);
    // None of the constant-11% figures the old build produced.
    expect(html).not.toContain("20.643.768");
    expect(html).not.toContain("1.074.904.755");
    expect(html).not.toContain(">20,6<");
  });

  it("excludes an offer with a malformed fee, rather than treating it as free", async () => {
    // The second reproduced defect: `abc` in a fee box parsed to null and
    // `?? 0` made it a free fee, so A was ranked with a 0 fee it never had.
    const html = await compare({
      defaultHorizon: "60",
      defaults: [
        {
          rate: "8,5",
          term: "20",
          fee: "",
          promoMonths: "12",
          promoRate: "7,5",
          flatFee: "abc",
          exitFee: "",
        },
        {
          rate: "8,5",
          term: "20",
          fee: "",
          promoMonths: "",
          promoRate: "",
          flatFee: "",
          exitFee: "",
        },
        {
          rate: "9,2",
          term: "20",
          fee: "",
          promoMonths: "",
          promoRate: "",
          flatFee: "",
          exitFee: "",
        },
      ],
    });
    expect(html).toContain(C.flatFeeInvalid);
    // Two valid offers remain, so the comparison survives — and it says the
    // third was excluded rather than ranking it at a fee of 0.
    expect(html).toContain(C.unusableNotice);
    expect(html).toContain(C.bestLabel);
  });

  it("treats a BLANK fee as no fee, which is a legitimate 0", async () => {
    const html = await compare();
    expect(html).not.toContain(C.flatFeeInvalid);
    expect(html).not.toContain(C.unusableNotice);
    expect(html).toContain(C.bestLabel);
  });

  it("prices a settlement fee at the horizon and shows it there", async () => {
    const html = await compare({
      defaultHorizon: "60",
      defaults: [
        {
          rate: "8,5",
          term: "20",
          fee: "",
          promoMonths: "",
          promoRate: "",
          flatFee: "",
          exitFee: "40.000.000",
        },
        {
          rate: "9,2",
          term: "20",
          fee: "",
          promoMonths: "",
          promoRate: "",
          flatFee: "",
          exitFee: "",
        },
        {
          rate: "",
          term: "",
          fee: "",
          promoMonths: "",
          promoRate: "",
          flatFee: "",
          exitFee: "",
        },
      ],
    });
    // Its own row, in the HORIZON block — never folded into the origination
    // fee, which would change the date and therefore the APR.
    expect(html).toContain(LOAN_COMPARE.table.rows.exitFee);
    expect(html).toContain(">40.000.000<");
  });

  it("warns when an offer the reader typed could not be priced", async () => {
    const html = await compare({
      defaults: [
        { rate: "8,5", term: "20", fee: "0", promoMonths: "", promoRate: "", flatFee: "0" },
        { rate: "9,2", term: "20", fee: "0", promoMonths: "", promoRate: "", flatFee: "0" },
        { rate: "abc", term: "20", fee: "0", promoMonths: "", promoRate: "", flatFee: "0" },
      ],
    });
    expect(html).toContain(C.unusableNotice);
  });

  it("carries no warning when the third offer is simply empty", async () => {
    const html = await compare();
    expect(html).not.toContain(C.unusableNotice);
  });

  it("states that an early-settlement fee is unknown, not zero", async () => {
    const html = await compare();
    expect(html).toContain(C.settlementFeeNotice);
    // It is charged AT THE HORIZON, in its own field, and the copy no longer
    // tells readers to fold a future penalty into an origination fee.
    expect(C.settlementFeeNotice).toContain("ĐÚNG THỜI ĐIỂM");
    expect(C.settlementFeeNotice).toContain("không phải khoản bằng 0");
    expect(C.exitFeeHelp).toContain("KHÔNG cộng vào ô phí giải ngân");
    expect(C.flatFeeHelp).not.toContain("trả nợ trước hạn");
  });

  it("shows the debt still owed at the horizon in the table", async () => {
    const html = await compare({ defaultHorizon: "36" });
    expect(html).toContain(LOAN_COMPARE.table.rows.horizonBalance);
    expect(html).toContain(LOAN_COMPARE.table.rows.horizonCost);
    // And the full-term measure, separately labelled.
    expect(html).toContain(LOAN_COMPARE.table.rows.costOfBorrowing);
  });

  it("keeps exactly one live results region", async () => {
    const html = await compare();
    expect((html.match(/data-results-live="true"/g) ?? []).length).toBe(1);
  });
});

describe("the fee-aware rate view", () => {
  it("shows a modelled APR per offer, labelled as modelled", async () => {
    const html = await compare();
    expect(html).toContain(C.aprDetailTitle);
    expect(html).toContain(C.aprLabel);
    expect(html).toContain(C.aprEffectiveLabel);
    expect(html).toContain(C.aprNote);
    expect(C.aprNote).toContain("KHÔNG phải mức công bố theo quy định");
  });

  it("never scales a rate into the table's money unit", async () => {
    const html = await compare({ defaultHorizon: "60" });
    // Two offers at 8,5% and 9,2% with no fees: the modelled APR is the
    // contract rate, and it renders as a percentage in both display modes.
    expect(html).toContain("8,50%");
    expect(html).toContain("9,20%");
  });
});

/**
 * ORIGINAL ROW 12 — the fixed/floating route as a PERSPECTIVE of this tool.
 *
 * "Gộp thành góc nhìn của so sánh khoản vay; chỉ cho so sản phẩm thực có;
 * hiện giả định ngay cạnh kết luận." The old page was a second form with its
 * own inputs and a full-term-only verdict. What is asserted here is that both
 * routes now run the same engine at the same common horizon, that the two
 * sides are NAMED rather than lettered, and that the prefilled twenty-year
 * fixed rate says it is an example.
 */
describe("the fixed/floating perspective", () => {
  /** The comparison at a perspective, at its shipped defaults. */
  async function render(perspective: "offers" | "fixedFloating") {
    vi.resetModules();
    const loaded = await import("@/components/loan-compare-calculator");
    return renderToStaticMarkup(
      createElement(loaded.LoanCompareCalculator, { perspective }),
    );
  }

  it("describes each side by the structure actually entered", async () => {
    const html = await render("fixedFloating");
    // Side A opens with no promotional pair: one rate for the whole term.
    expect(html).toContain(
      `${FIXED_VS_FLOATING.compare.sideNames[0]} — ${FIXED_VS_FLOATING.compare.structureConstant}`,
    );
    // Side B opens with 12 months at the promotional rate, and the label says
    // twelve rather than asserting a structure the reader did not type.
    expect(html).toContain(
      `${FIXED_VS_FLOATING.compare.sideNames[1]} — giữ một mức lãi 12 tháng rồi đổi`,
    );
    expect(html).not.toContain("Phương án A");
    expect(html).not.toContain("Phương án B");
    expect(html).not.toContain("{n}");
  });

  it("stops calling a side fixed once it becomes phased", async () => {
    // The reproduced seam: a reader follows the hint, enters a three-year
    // fixed period followed by a different rate, and the column kept calling
    // itself "lãi cố định cả kỳ hạn" while the schedule was phased.
    vi.resetModules();
    vi.doMock("@/content/calculators/fixed-vs-floating", async () => {
      const actual = await vi.importActual<
        typeof import("@/content/calculators/fixed-vs-floating")
      >("@/content/calculators/fixed-vs-floating");
      const [a, ...rest] = actual.FIXED_VS_FLOATING.compare.defaults;
      return {
        FIXED_VS_FLOATING: {
          ...actual.FIXED_VS_FLOATING,
          compare: {
            ...actual.FIXED_VS_FLOATING.compare,
            // 36 months at 9,5%, then 11%.
            defaults: [{ ...a, promoMonths: "36", promoRate: "9,5" }, ...rest],
          },
        },
      };
    });
    try {
      const loaded = await import("@/components/loan-compare-calculator");
      const html = renderToStaticMarkup(
        createElement(loaded.LoanCompareCalculator, {
          perspective: "fixedFloating",
        }),
      );
      expect(html).toContain(
        `${FIXED_VS_FLOATING.compare.sideNames[0]} — giữ một mức lãi 36 tháng rồi đổi`,
      );
      expect(html).not.toContain(
        `${FIXED_VS_FLOATING.compare.sideNames[0]} — ${FIXED_VS_FLOATING.compare.structureConstant}`,
      );
    } finally {
      vi.doUnmock("@/content/calculators/fixed-vs-floating");
      vi.resetModules();
    }
  });

  it("keeps the two sides distinguishable when their structures match", async () => {
    // Both constant-rate: the descriptors are identical and the stable side
    // name is what stops two columns sharing one label.
    vi.resetModules();
    vi.doMock("@/content/calculators/fixed-vs-floating", async () => {
      const actual = await vi.importActual<
        typeof import("@/content/calculators/fixed-vs-floating")
      >("@/content/calculators/fixed-vs-floating");
      const [a, b, c] = actual.FIXED_VS_FLOATING.compare.defaults;
      return {
        FIXED_VS_FLOATING: {
          ...actual.FIXED_VS_FLOATING,
          compare: {
            ...actual.FIXED_VS_FLOATING.compare,
            defaults: [a, { ...b, promoMonths: "", promoRate: "" }, c],
          },
        },
      };
    });
    try {
      const loaded = await import("@/components/loan-compare-calculator");
      const html = renderToStaticMarkup(
        createElement(loaded.LoanCompareCalculator, {
          perspective: "fixedFloating",
        }),
      );
      for (const side of [0, 1]) {
        expect(html).toContain(
          `${FIXED_VS_FLOATING.compare.sideNames[side]} — ${FIXED_VS_FLOATING.compare.structureConstant}`,
        );
      }
    } finally {
      vi.doUnmock("@/content/calculators/fixed-vs-floating");
      vi.resetModules();
    }
  });

  it("keeps the offers perspective exactly as it was", async () => {
    const html = await render("offers");
    expect(html).toContain("Phương án A");
    expect(html).toContain("Phương án B");
    expect(html).not.toContain(FIXED_VS_FLOATING.compare.sideNames[0]);
    // The third offer is still one disclosure away.
    expect(html).toContain(LOAN_COMPARE.form.thirdOptionTitle);
  });

  it("offers no third column for a two-sided question", async () => {
    const html = await render("fixedFloating");
    expect(html).not.toContain(LOAN_COMPARE.form.thirdOptionTitle);
    expect(html).not.toContain(LOAN_COMPARE.form.thirdOptionUnused);
  });

  it("says the twenty-year fixed rate is hypothetical, with no market claim", async () => {
    const html = await render("fixedFloating");
    expect(html).toContain(FIXED_VS_FLOATING.compare.exampleNotice);
    expect(FIXED_VS_FLOATING.compare.exampleNotice).toContain(
      "SỐ GIẢ ĐỊNH",
    );
    expect(FIXED_VS_FLOATING.compare.exampleNotice).toContain(
      "không phải báo giá của ngân hàng nào",
    );
    // And it tells the reader how to enter the quote they actually have.
    expect(html).toContain(FIXED_VS_FLOATING.compare.fixedSideHint);
    expect(FIXED_VS_FLOATING.compare.fixedSideHint).toContain("cố định vài năm");
  });

  it("makes no unverified claim about what the market offers", () => {
    // docs: no unverified population claim in copy. An earlier version of this
    // notice and of the FAQ asserted that most Vietnamese banks fix the rate
    // for only 1–5 years; no source for that was verified here, and the
    // reader's actionable question — how long is YOUR quote fixed for — needs
    // no market claim at all.
    const strings = JSON.stringify(FIXED_VS_FLOATING);
    for (const forbidden of [
      "Phần lớn ngân hàng",
      "phần lớn ngân hàng",
      "1–5 năm",
      "hầu như không tồn tại",
      "dạng phổ biến ở Việt Nam",
    ]) {
      expect(strings, forbidden).not.toContain(forbidden);
    }
    // What replaced it: the three questions to ask.
    expect(FIXED_VS_FLOATING.faq.items[0].a).toContain("bằng văn bản");
    expect(FIXED_VS_FLOATING.faq.items[0].a).toContain("bao nhiêu tháng");
  });

  it("prices a constant rate against a promotional path at one horizon", async () => {
    const html = await render("fixedFloating");
    // The shared horizon field is in the primary flow, as on the other route.
    expect(html).toContain(LOAN_COMPARE.form.horizonLabel);
    expect(html).toContain('value="60"');
    // 2 tỷ at 9,5% over 240 months is 18.642.624 ₫ a month; the floating side
    // opens at 7,5% for 12 months, which is 16.111.864 ₫.
    expect(html).toContain("18.642.624");
    expect(html).toContain("16.111.864");
    // Both trajectories are drawn, and the cost bars rank at the horizon.
    expect(html).toContain(LOAN_COMPARE.paymentChart.title);
    expect(html).toContain(LOAN_COMPARE.costChart.title);
    expect(html).toContain(LOAN_COMPARE.form.bestLabel);
  });

  it("keeps one live region and the shared invalid-offer behaviour", async () => {
    const html = await render("fixedFloating");
    expect((html.match(/data-results-live="true"/g) ?? []).length).toBe(1);
    // The settlement-fee qualification travels with the model, not the route.
    expect(html).toContain(LOAN_COMPARE.form.settlementFeeNotice);
  });

  it("no longer promises a break-even figure the page does not show", () => {
    // The old headline quoted a full-term break-even fixed rate of 10,7177%.
    // The page now leads with a comparison at the reader's own horizon, and
    // the break-even framing lives in the education article whose table draws
    // it.
    const strings = JSON.stringify(FIXED_VS_FLOATING);
    expect(strings).not.toContain("10,7177");
    expect(strings).not.toContain("Lãi cố định hòa vốn");
    expect(FIXED_VS_FLOATING.reframeNotice).toContain("rẻ nhất tại mốc bạn chọn");
  });
});

describe("the two APR routes keep their own scope and their own URLs", () => {
  it("leads the basic page with the contract rate beside the modelled one", async () => {
    vi.resetModules();
    const loaded = await import("@/components/apr-calculator");
    const html = renderToStaticMarkup(createElement(loaded.AprCalculator));
    expect(html).toContain(APR.form.nominalLabel);
    expect(html).toContain(APR.form.aprLabel);
    expect(html).toContain(APR.form.spreadLabel);
    expect(html).toContain(APR.form.modeledNote);
    // 8,5% on the contract, 8,7081% once a 30 triệu fee is counted — the
    // supervisor's own fixture, at this page's shipped defaults.
    expect(html).toContain("8,5000%");
    expect(html).toContain("8,7081%");
  });

  it("is ONE tool at two modes, not two tools with a link", async () => {
    // Original row 4. The advanced route renders the same component at its
    // detailed mode, so the mode is a control ON the page and a reader does
    // not retype their loan to reach the itemised fees.
    vi.resetModules();
    const basic = renderToStaticMarkup(
      createElement((await import("@/components/apr-calculator")).AprCalculator),
    );
    // The mode control is in the basic view, with both options.
    expect(basic).toContain(APR.form.modeLegend);
    expect(basic).toContain(APR.form.modeBasic);
    expect(basic).toContain(APR.form.modeAdvanced);
    expect(basic).toContain(APR.form.modeNoteBasic);
    // Basic mode shows ONE fee box and no payoff/itemised INPUTS. It may
    // still NAME a retained payoff month in its disclosure block — that is
    // the repair for the mode regression, not a leak of the advanced form —
    // so the check is on each field's own help text, which only the input
    // renders.
    expect(basic).toContain(APR.form.upfrontLabel);
    expect(basic).not.toContain(APR_ADVANCED.form.payoffHelp);
    expect(basic).not.toContain(APR_ADVANCED.form.appraisalHelp);
    expect(basic).not.toContain(APR_ADVANCED.form.financedHelp);

    vi.resetModules();
    const advanced = renderToStaticMarkup(
      createElement(
        (await import("@/components/apr-advanced-calculator"))
          .AprAdvancedCalculator,
      ),
    );
    // The advanced route starts at the detailed mode and keeps the control.
    expect(advanced).toContain(APR.form.modeLegend);
    expect(advanced).toContain(APR.form.modeNoteAdvanced);
    expect(advanced).toContain(APR_ADVANCED.form.payoffLabel);
    expect(advanced).toContain(APR_ADVANCED.form.appraisalLabel);
    expect(advanced).toContain(APR_ADVANCED.form.financedLabel);
  });

  it("keeps every fee, the financed amount and the payoff month across modes", async () => {
    // THE REPRODUCED REGRESSION. With 30m arrangement + 5m appraisal + 30m
    // financed at H60 the advanced view showed full APR 8,9503% / H-APR
    // 9,3461%; switching only to `Gọn` gave 8,7433% — the financed 30m was
    // dropped and the visible box said TOTAL while a hidden 5m was still
    // counted. The mode reads nothing out of the model now.
    const patch = {
      defaultUpfront: "30.000.000",
      defaultPoints: "0",
    } as Record<string, string>;
    const advancedPatch = {
      defaultAppraisal: "5.000.000",
      defaultFinanced: "30.000.000",
      defaultPayoff: "60",
    } as Record<string, string>;

    vi.resetModules();
    vi.doMock("@/content/calculators/apr", async () => {
      const actual = await vi.importActual<
        typeof import("@/content/calculators/apr")
      >("@/content/calculators/apr");
      return {
        APR: { ...actual.APR, form: { ...actual.APR.form, ...patch } },
      };
    });
    vi.doMock("@/content/calculators/apr-advanced", async () => {
      const actual = await vi.importActual<
        typeof import("@/content/calculators/apr-advanced")
      >("@/content/calculators/apr-advanced");
      return {
        APR_ADVANCED: {
          ...actual.APR_ADVANCED,
          form: { ...actual.APR_ADVANCED.form, ...advancedPatch },
        },
      };
    });
    try {
      const loaded = await import("@/components/apr-calculator");
      const basic = renderToStaticMarkup(
        createElement(loaded.AprCalculator, { initialMode: "basic" }),
      );
      const advanced = renderToStaticMarkup(
        createElement(loaded.AprCalculator, { initialMode: "advanced" }),
      );

      // The supervisor's independent references, in BOTH modes.
      for (const [label, markup] of [
        ["basic", basic],
        ["advanced", advanced],
      ] as const) {
        expect(markup, label).toContain("8,9503%");
        expect(markup, label).toContain("9,3461%");
        // And never the figure the dropped financed fee produced.
        expect(markup, label).not.toContain("8,7433%");
      }

      // The compact view's displayed total is the MODELLED total, 35 triệu —
      // not the 30 triệu first line labelled as a total.
      expect(basic).toContain("35.000.000 ₫");
      // It is a derived read-only figure, not an editable box claiming to be
      // the total.
      const { APR } = await import("@/content/calculators/apr");
      expect(basic).toContain(APR.form.derivedTotalLabel);
      expect(basic).toContain(APR.form.derivedTotalHelp);
      // And the retained assumptions the compact view cannot edit are named.
      expect(basic).toContain(APR.form.retainedTitle);
      expect(basic).toContain(APR.form.retainedEditAction);
      expect(basic).toContain("30.000.000 ₫");
    } finally {
      vi.doUnmock("@/content/calculators/apr");
      vi.doUnmock("@/content/calculators/apr-advanced");
      vi.resetModules();
    }
  });

  it("clears the result and says where, when a hidden advanced field is malformed", async () => {
    vi.resetModules();
    vi.doMock("@/content/calculators/apr-advanced", async () => {
      const actual = await vi.importActual<
        typeof import("@/content/calculators/apr-advanced")
      >("@/content/calculators/apr-advanced");
      return {
        APR_ADVANCED: {
          ...actual.APR_ADVANCED,
          form: { ...actual.APR_ADVANCED.form, defaultFinanced: "abc" },
        },
      };
    });
    try {
      const loaded = await import("@/components/apr-calculator");
      const basic = renderToStaticMarkup(
        createElement(loaded.AprCalculator, { initialMode: "basic" }),
      );
      const { APR } = await import("@/content/calculators/apr");
      // The model reads it in both modes, so the result clears — and the
      // compact view says the offending box is not on this screen.
      expect(basic).toContain(APR.form.hiddenInvalidNotice);
      expect(basic).not.toContain("8,7081%");
    } finally {
      vi.doUnmock("@/content/calculators/apr-advanced");
      vi.resetModules();
    }
  });

  it("names the hidden arrangement fee when a breakdown makes the total read-only", async () => {
    // The remaining hidden-recovery gap. `hiddenInvalid` checked
    // `feeInvalid.slice(1)`, so it could not see the FIRST fee line — and
    // that line is hidden too once a second fee exists and the compact total
    // becomes a derived read-only figure. Reproduced combination: arrangement
    // `abc`, appraisal 5 triệu, compact mode. The result cleared correctly and
    // the retained list named only the appraisal, so the reader saw dashes
    // with nothing on screen to explain them.
    vi.resetModules();
    vi.doMock("@/content/calculators/apr", async () => {
      const actual = await vi.importActual<
        typeof import("@/content/calculators/apr")
      >("@/content/calculators/apr");
      return {
        APR: {
          ...actual.APR,
          form: { ...actual.APR.form, defaultUpfront: "abc" },
        },
      };
    });
    vi.doMock("@/content/calculators/apr-advanced", async () => {
      const actual = await vi.importActual<
        typeof import("@/content/calculators/apr-advanced")
      >("@/content/calculators/apr-advanced");
      return {
        APR_ADVANCED: {
          ...actual.APR_ADVANCED,
          form: {
            ...actual.APR_ADVANCED.form,
            defaultAppraisal: "5.000.000",
          },
        },
      };
    });
    try {
      const loaded = await import("@/components/apr-calculator");
      const basic = renderToStaticMarkup(
        createElement(loaded.AprCalculator, { initialMode: "basic" }),
      );
      const { APR } = await import("@/content/calculators/apr");
      const { APR_ADVANCED } = await import(
        "@/content/calculators/apr-advanced"
      );

      // The derived total cannot be stated, and the result clears.
      expect(basic).toContain(APR.form.derivedTotalLabel);
      expect(basic).toContain(PLACEHOLDER);
      expect(basic).not.toContain("8,7081%");
      // AND the notice now exists and names the box that is offscreen.
      expect(basic).toContain(APR.form.hiddenInvalidNotice);
      expect(basic).toContain(
        `${APR.form.hiddenInvalidFields}: ${APR_ADVANCED.form.arrangementLabel}.`,
      );
      // The recovery route out of compact mode is untouched.
      expect(basic).toContain(APR.form.retainedEditAction);

      // In the detailed mode the box IS on screen, so there is nothing hidden
      // to announce — the field's own error carries it.
      const advanced = renderToStaticMarkup(
        createElement(loaded.AprCalculator, { initialMode: "advanced" }),
      );
      expect(advanced).not.toContain(APR.form.hiddenInvalidNotice);
      expect(advanced).toContain(APR_ADVANCED.form.feeInvalid);
    } finally {
      vi.doUnmock("@/content/calculators/apr");
      vi.doUnmock("@/content/calculators/apr-advanced");
      vi.resetModules();
    }
  });

  it("leaves the visible first fee box out of the hidden-field notice", async () => {
    // The mirror of the case above, and why the condition is `index > 0 ||
    // breakdownActive` rather than a blanket include: with no breakdown the
    // compact fee box is an ordinary editable field, its own error is on
    // screen, and a "the box is not on this screen" notice would be false.
    vi.resetModules();
    vi.doMock("@/content/calculators/apr", async () => {
      const actual = await vi.importActual<
        typeof import("@/content/calculators/apr")
      >("@/content/calculators/apr");
      return {
        APR: {
          ...actual.APR,
          form: { ...actual.APR.form, defaultUpfront: "abc" },
        },
      };
    });
    try {
      const loaded = await import("@/components/apr-calculator");
      const basic = renderToStaticMarkup(
        createElement(loaded.AprCalculator, { initialMode: "basic" }),
      );
      const { APR } = await import("@/content/calculators/apr");
      expect(basic).toContain(APR.form.upfrontInvalid);
      expect(basic).not.toContain(APR.form.hiddenInvalidNotice);
    } finally {
      vi.doUnmock("@/content/calculators/apr");
      vi.resetModules();
    }
  });

  /**
   * ORIGINAL ROW 4 — the monetary cost at the chosen payoff month.
   *
   * An APR is a rate. The supervisor's reference fixture on this route: 2 tỷ
   * in hand, 30 triệu financed, 35 triệu of cash fees, 8,5%/năm over 240
   * months. At H=60 the loan has cost 880.990.515 ₫ (815.990.515 ₫ of
   * interest plus 65.000.000 ₫ of fees) and 1.788.981.817 ₫ of principal is
   * still owed — against 2.263.034.793 ₫ over the full term.
   */
  describe("the money at the chosen payoff month", () => {
    const patch = { defaultUpfront: "35.000.000", defaultPoints: "0" };
    const advancedPatch = {
      defaultAppraisal: "",
      defaultFinanced: "30.000.000",
      defaultPayoff: "60",
    };

    /** The shared component at a mode, with the reference fixture prefilled. */
    async function render(initialMode: "basic" | "advanced") {
      vi.resetModules();
      vi.doMock("@/content/calculators/apr", async () => {
        const actual = await vi.importActual<
          typeof import("@/content/calculators/apr")
        >("@/content/calculators/apr");
        return {
          APR: { ...actual.APR, form: { ...actual.APR.form, ...patch } },
        };
      });
      vi.doMock("@/content/calculators/apr-advanced", async () => {
        const actual = await vi.importActual<
          typeof import("@/content/calculators/apr-advanced")
        >("@/content/calculators/apr-advanced");
        return {
          APR_ADVANCED: {
            ...actual.APR_ADVANCED,
            form: { ...actual.APR_ADVANCED.form, ...advancedPatch },
          },
        };
      });
      try {
        const loaded = await import("@/components/apr-calculator");
        return renderToStaticMarkup(
          createElement(loaded.AprCalculator, { initialMode }),
        );
      } finally {
        vi.doUnmock("@/content/calculators/apr");
        vi.doUnmock("@/content/calculators/apr-advanced");
        vi.resetModules();
      }
    }

    it("puts interest, cost and remaining principal beside the full term", async () => {
      const html = await render("advanced");
      expect(html).toContain(APR_ADVANCED.form.horizonTitle);
      // Interest: through month 60 → over the whole term.
      expect(html).toContain("815.990.515 ₫ → 2.198.034.793 ₫");
      // Cost: the same plus 65 triệu of fees, on both sides.
      expect(html).toContain("880.990.515 ₫ → 2.263.034.793 ₫");
      // Principal still owed — its own row, never added into the cost.
      expect(html).toContain("1.788.981.817 ₫");
      // The month is named in every label rather than left implicit.
      expect(html).toContain("đến tháng 60");
      expect(html).not.toContain("{n}");
    });

    it("says principal is not a cost, and each fee counts once", async () => {
      const html = await render("advanced");
      expect(html).toContain(APR_ADVANCED.form.horizonNote);
      expect(APR_ADVANCED.form.horizonNote).toContain("không phải chi phí");
      expect(APR_ADVANCED.form.horizonNote).toContain("chỉ tính một lần");
    });

    it("excludes an unentered early-settlement fee explicitly", async () => {
      const html = await render("advanced");
      expect(html).toContain(APR_ADVANCED.form.horizonExcludesNote);
      expect(APR_ADVANCED.form.horizonExcludesNote).toContain("LOẠI TRỪ");
      // Not treated as zero, and the reader is sent to the tool that charges
      // it at the horizon.
      expect(APR_ADVANCED.form.horizonExcludesNote).toContain("So sánh khoản vay");
    });

    it("leaves the full-term figures untouched by the mode", async () => {
      // MODE IS PRESENTATION. The compact view computes the identical loan —
      // it reads every field, including the retained payoff month — so the
      // full-term APR and cost must be byte-identical across modes. Only
      // which blocks are on screen differs.
      const basic = await render("basic");
      const advanced = await render("advanced");
      for (const [label, markup] of [
        ["basic", basic],
        ["advanced", advanced],
      ] as const) {
        // 8,9503% is the reference full APR for this fixture.
        expect(markup, label).toContain("8,9503%");
        expect(markup, label).toContain(">2.263.034.793<");
        expect(markup, label).toContain(">2.198.034.793<");
      }
      // The horizon BLOCK is detailed-mode only, and the compact view says the
      // payoff month is retained rather than dropping it silently.
      expect(basic).not.toContain(APR_ADVANCED.form.horizonTitle);
      expect(basic).toContain(APR.form.retainedTitle);
      expect(basic).toContain(APR_ADVANCED.form.payoffLabel);
    });

    it("shows no horizon block when the reader holds to term", async () => {
      // A blank payoff month is "I'll hold it to term", not a bad entry, and
      // a cost-at-horizon block for a horizon nobody chose would be inventing
      // the question.
      vi.resetModules();
      vi.doMock("@/content/calculators/apr-advanced", async () => {
        const actual = await vi.importActual<
          typeof import("@/content/calculators/apr-advanced")
        >("@/content/calculators/apr-advanced");
        return {
          APR_ADVANCED: {
            ...actual.APR_ADVANCED,
            form: { ...actual.APR_ADVANCED.form, defaultPayoff: "" },
          },
        };
      });
      try {
        const loaded = await import("@/components/apr-calculator");
        const html = renderToStaticMarkup(
          createElement(loaded.AprCalculator, { initialMode: "advanced" }),
        );
        expect(html).not.toContain(APR_ADVANCED.form.horizonTitle);
        // The full-term answer is still there.
        expect(html).toContain(APR.form.aprLabel);
      } finally {
        vi.doUnmock("@/content/calculators/apr-advanced");
        vi.resetModules();
      }
    });

    it("clears the horizon block on an unreadable payoff month", async () => {
      vi.resetModules();
      vi.doMock("@/content/calculators/apr-advanced", async () => {
        const actual = await vi.importActual<
          typeof import("@/content/calculators/apr-advanced")
        >("@/content/calculators/apr-advanced");
        return {
          APR_ADVANCED: {
            ...actual.APR_ADVANCED,
            form: { ...actual.APR_ADVANCED.form, defaultPayoff: "3.0" },
          },
        };
      });
      try {
        const loaded = await import("@/components/apr-calculator");
        const html = renderToStaticMarkup(
          createElement(loaded.AprCalculator, { initialMode: "advanced" }),
        );
        // docs §4: `parseMoney("3.0")` is 30 and `parseDecimal("1.200")` is
        // 1,2 — the field is rejected on the typed value.
        expect(html).toContain('value="3.0"');
        expect(html).toContain(APR_ADVANCED.form.payoffInvalid);
        expect(html).not.toContain(APR_ADVANCED.form.horizonTitle);
        expect(html).not.toContain("880.990.515 ₫");
      } finally {
        vi.doUnmock("@/content/calculators/apr-advanced");
        vi.resetModules();
      }
    });

    it("keeps exactly one live results region with the block on screen", async () => {
      // docs §4: the horizon group is `live={false}`.
      const html = await render("advanced");
      expect((html.match(/data-results-live="true"/g) ?? []).length).toBe(1);
    });

    it("pins the route's own SHIPPED defaults, not just the fixture", async () => {
      // docs §6's highest-value substitute: assert the module at the defaults
      // the page actually ships, because a default that moves is invisible to
      // a test that patches its own. 2 tỷ, 8,5%, 240 tháng, 30 triệu of cash
      // fees, no financed fee, payoff month 60.
      //
      // Every figure below is independently corroborated by references the
      // supervisor established in earlier rounds for the same loan: the H60
      // balance 1.762.543.662 ₫ and the full-term interest 2.165.551.520 ₫
      // both come from the loan-comparison work, where option B is this exact
      // constant-rate loan with no fees.
      vi.resetModules();
      const loaded = await import(
        "@/components/apr-advanced-calculator"
      );
      const html = renderToStaticMarkup(
        createElement(loaded.AprAdvancedCalculator),
      );
      expect(html).toContain("803.931.542 ₫ → 2.165.551.520 ₫");
      // Cost is the same plus the 30 triệu fee, on BOTH sides of the arrow.
      expect(html).toContain("833.931.542 ₫ → 2.195.551.520 ₫");
      expect(html).toContain("1.762.543.662 ₫");
    });
  });

  it("reports the same total fee in both modes", async () => {
    // One set of fee fields backs both modes: the basic total IS the
    // advanced `arrangement` line, so switching cannot change the answer.
    vi.resetModules();
    const basic = renderToStaticMarkup(
      createElement((await import("@/components/apr-calculator")).AprCalculator),
    );
    vi.resetModules();
    const advanced = renderToStaticMarkup(
      createElement(
        (await import("@/components/apr-advanced-calculator"))
          .AprAdvancedCalculator,
      ),
    );
    // 30 triệu of cash fees at the shipped defaults, and 8,7081% in both.
    expect(basic).toContain("8,7081%");
    expect(advanced).toContain("8,7081%");
    expect(basic).toContain(">30.000.000<");
    expect(advanced).toContain(">30.000.000<");
  });

  it("says that a cross-ROUTE link carries nothing over", async () => {
    vi.resetModules();
    const basic = renderToStaticMarkup(
      createElement((await import("@/components/apr-calculator")).AprCalculator),
    );
    expect(basic).toContain(APR.form.crossRouteNote);
    expect(APR.form.crossRouteNote).toContain("KHÔNG được chuyển sang");
  });

  it("draws the nominal rate beside the modelled APR", async () => {
    // Original row 3's visual: two bars of the same kind, so the fee is the
    // gap between them.
    vi.resetModules();
    const basic = renderToStaticMarkup(
      createElement((await import("@/components/apr-calculator")).AprCalculator),
    );
    expect(basic).toContain(APR.form.chartTitle);
    expect(basic).toContain(APR.chart.nominalBar);
    expect(basic).toContain(APR.chart.aprBar);
    // A rate axis, not a money one.
    expect(basic).toContain("%/năm, danh nghĩa");
    // The short fee breakdown lives in the figure's own table.
    expect(basic).toContain(APR.chart.upfrontRow);
    expect(basic).toContain(APR.chart.netProceedsRow);
    // And it is a real figure with a caption, outside the live region.
    expect(basic).toContain("<figure");
    expect(basic).toContain(APR.chart.tableCaption);
  });

  it("links each APR route to the other and to the comparison", async () => {
    vi.resetModules();
    const basic = renderToStaticMarkup(
      createElement((await import("@/components/apr-calculator")).AprCalculator),
    );
    // `Link` normalises the trailing slash away in the rendered href.
    expect(basic).toContain(`href="${APR_ADVANCED.slug}"`);
    expect(basic).toContain(`href="${LOAN_COMPARE.slug}"`);
    expect(basic).toContain(APR.form.advancedLinkLabel);

    vi.resetModules();
    const advanced = renderToStaticMarkup(
      createElement(
        (await import("@/components/apr-advanced-calculator"))
          .AprAdvancedCalculator,
      ),
    );
    expect(advanced).toContain(`href="${APR.slug}"`);
    expect(advanced).toContain(`href="${LOAN_COMPARE.slug}"`);
    expect(advanced).toContain(APR_ADVANCED.form.basicLinkLabel);
  });

  it("nests the fee allocation and discloses what is active inside it", async () => {
    vi.resetModules();
    const html = renderToStaticMarkup(
      createElement(
        (await import("@/components/apr-advanced-calculator"))
          .AprAdvancedCalculator,
      ),
    );
    expect(html).toContain(APR_ADVANCED.form.feeAllocationTitle);
    // A collapsed panel must state what it is doing to the answer: the
    // shipped defaults put 30 triệu of cash fees inside it.
    expect(html).toContain("<details");
    expect(html).toContain("30.000.000 ₫");
    // The payoff month stays in the primary flow — it is why this page exists.
    const payoffAt = html.indexOf(APR_ADVANCED.form.payoffLabel);
    const feePanelAt = html.indexOf(APR_ADVANCED.form.feeAllocationTitle);
    expect(payoffAt).toBeGreaterThan(-1);
    expect(feePanelAt).toBeGreaterThan(payoffAt);
  });

  it("no longer tells readers to put an exit penalty in an upfront fee box", () => {
    // The same fee-timing error already repaired in the comparison tool,
    // which had reappeared in the shared APR copy. A month-60 payment is not
    // a drawdown payment; putting it there overstates the APR.
    expect(APR_ADVANCED.form.settlementFeeNotice).not.toContain("cộng vào ô");
    expect(APR_ADVANCED.form.settlementFeeNotice).toContain("KHÔNG được tính");
    expect(APR_ADVANCED.form.settlementFeeNotice).toContain(
      "So sánh khoản vay",
    );
    // The chart no longer implies that choosing a payoff month brings a
    // penalty into the figure; this model has no exit-fee field at all.
    const exclusion = APR.chart.assumptions.find((text) =>
      text.includes("phí trả nợ trước hạn"),
    );
    expect(exclusion).toBeDefined();
    expect(exclusion!).toContain("KHÔNG tính");
    expect(exclusion!).not.toContain("trừ khi");
  });

  it("says which fees change the payment and which do not", () => {
    const payment = APR.formula.body.find((text) => text.includes("A = P × r"));
    expect(payment).toBeDefined();
    expect(payment!).toContain("KHÔNG làm thay đổi");
    expect(payment!).toContain("Phí gộp vào gốc thì có");
    // The chart assumption says the same thing, so the two cannot drift.
    const feeAssumption = APR.chart.assumptions.find((text) =>
      text.includes("thực nhận"),
    );
    expect(feeAssumption!).toContain("KHÔNG đổi khoản trả");
  });

  it("does not present the modelled APR as a regulatory standard", () => {
    const nominal = APR.formula.body.find((text) =>
      text.includes("DANH NGHĨA"),
    );
    expect(nominal).toBeDefined();
    expect(nominal!).not.toContain("theo đúng thông lệ công bố");
    expect(nominal!).toContain("KHÔNG phải mức công bố theo quy định");
  });

  it("states that the payoff model excludes an unknown settlement fee", async () => {
    vi.resetModules();
    const html = renderToStaticMarkup(
      createElement(
        (await import("@/components/apr-advanced-calculator"))
          .AprAdvancedCalculator,
      ),
    );
    expect(html).toContain(APR_ADVANCED.form.settlementFeeNotice);
    expect(APR_ADVANCED.form.settlementFeeNotice).toContain("CHỈ gồm dư nợ");
  });

  it("bounds both pages' month fields on the typed value", () => {
    // No silent clamping: the field says what it will accept.
    expect(APR.form.termInvalid).toContain("1.200");
    expect(APR.form.termHelp).toContain("1.200");
    expect(APR_ADVANCED.form.termInvalid).toContain("1.200");
    expect(MAX_APR_MONTHS).toBe(1200);
    expect(MAX_COMPARE_MONTHS).toBe(1200);
  });
});
