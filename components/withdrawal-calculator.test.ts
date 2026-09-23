/**
 * Rendered-markup contracts for /cong-cu/thu-nhap-dau-tu/ (original row 26).
 *
 * `renderToStaticMarkup` in the runner's plain `node` environment — the
 * pattern `components/calc/chart/chart-render.test.ts` documents. It is the
 * right fidelity here because this page is prerendered at its defaults and
 * must hydrate byte-identically.
 *
 * WHAT THIS FILE EXISTS FOR. The convention clause under the perpetual figure
 * is chosen from the inflation SIGN, and it was unconditional before: the page
 * claimed the monthly-real convention is always lower than the exact
 * year-end-preserving amount, i.e. always conservative. An independent check
 * on 2 tỷ / lợi nhuận 8% / lạm phát −4% got 19.727.161,11 against
 * 19.302.090,33 — higher. The oracle is recomputed below from a closed form
 * with no production import, and then the RENDERED page is asserted to carry
 * the matching sentence. A defect in the clause selection lives in the
 * component, which is exactly the place docs §6 says three of this suite's
 * five worst defects lived.
 */
import { describe, expect, it, vi } from "vitest";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { markupRegion } from "@/lib/markup-region";
import { WITHDRAWAL } from "@/content/calculators/withdrawal";

type Loose = Record<string, unknown>;

/**
 * Render the calculator, optionally overriding some of its FORM defaults.
 *
 * The content object is `as const`, so its values are literal types and a
 * `Partial<typeof WITHDRAWAL>` patch cannot hold a different default string.
 * The mock is therefore typed loosely — the same reason
 * `chart-render.test.ts` takes a generic there — and the overrides are
 * merged into `form` so every other default is inherited.
 */
async function render(formOverrides?: Record<string, string>) {
  const contentPath = "@/content/calculators/withdrawal";
  vi.resetModules();
  if (formOverrides) {
    vi.doMock(contentPath, async () => {
      const actual = (await vi.importActual(contentPath)) as {
        WITHDRAWAL: Loose;
      };
      const original = actual.WITHDRAWAL;
      return {
        WITHDRAWAL: {
          ...original,
          form: { ...(original.form as Loose), ...formOverrides },
        },
      };
    });
  }
  try {
    const loaded = (await import("@/components/withdrawal-calculator")) as Record<
      string,
      ComponentType
    >;
    return renderToStaticMarkup(createElement(loaded.WithdrawalCalculator));
  } finally {
    vi.doUnmock(contentPath);
    vi.resetModules();
  }
}

/**
 * The exact amount that preserves real capital at each YEAR END, under this
 * page's own once-a-year step-up schedule: P × (G − H) / A(12), where
 * g = G^(1/12) and A(12) = (g^12 − 1)/(g − 1). Independent of the module.
 */
function exactYearEndPreserving(
  balance: number,
  returnPercent: number,
  inflationPercent: number,
): number {
  const G = 1 + returnPercent / 100;
  const H = 1 + inflationPercent / 100;
  const g = G ** (1 / 12);
  const a12 = (g ** 12 - 1) / (g - 1);
  return (balance * (G - H)) / a12;
}

/** What the page reports: the REAL return, converted to a monthly rate. */
function conventionFigure(
  balance: number,
  returnPercent: number,
  inflationPercent: number,
): number {
  const real = (1 + returnPercent / 100) / (1 + inflationPercent / 100) - 1;
  return balance * ((1 + real) ** (1 / 12) - 1);
}

const TWO_BILLION = "2.000.000.000";

describe("the convention clause follows the inflation sign", () => {
  it("is LOWER with rising prices, and says so", async () => {
    expect(conventionFigure(2e9, 8, 4)).toBeCloseTo(6_299_956.238245752, 4);
    expect(exactYearEndPreserving(2e9, 8, 4)).toBeCloseTo(
      6_434_030.110003466,
      4,
    );
    expect(conventionFigure(2e9, 8, 4)).toBeLessThan(
      exactYearEndPreserving(2e9, 8, 4),
    );

    const html = await render({
      defaultBalance: TWO_BILLION,
      defaultInflation: "4",
    });
    expect(html).toContain(WITHDRAWAL.form.perpetualConventionLower);
    expect(html).not.toContain(WITHDRAWAL.form.perpetualConventionHigher);
  });

  it("COINCIDES at zero inflation, where the two are one quantity", async () => {
    expect(conventionFigure(2e9, 8, 0)).toBeCloseTo(
      exactYearEndPreserving(2e9, 8, 0),
      6,
    );

    const html = await render({
      defaultBalance: TWO_BILLION,
      defaultInflation: "0",
    });
    expect(html).toContain(WITHDRAWAL.form.perpetualConventionEqual);
    expect(html).not.toContain(WITHDRAWAL.form.perpetualConventionLower);
  });

  it("is HIGHER with falling prices, so the page drops the safety claim", async () => {
    // The counterexample that made the old sentence a defect.
    expect(conventionFigure(2e9, 8, -4)).toBeCloseTo(19_727_161.1064234, 4);
    expect(exactYearEndPreserving(2e9, 8, -4)).toBeCloseTo(
      19_302_090.3300104,
      4,
    );
    expect(conventionFigure(2e9, 8, -4)).toBeGreaterThan(
      exactYearEndPreserving(2e9, 8, -4),
    );

    const html = await render({
      defaultBalance: TWO_BILLION,
      defaultInflation: "-4",
    });
    expect(html).toContain(WITHDRAWAL.form.perpetualConventionHigher);
    expect(html).not.toContain(WITHDRAWAL.form.perpetualConventionLower);
    // The no-guarantee sentence is not what was qualified; it stays.
    expect(html).toContain("KHÔNG phải mức rút được bảo đảm");
  });
});

describe("no unqualified perpetual promise on the page", () => {
  it("never states a draw that lasts forever", async () => {
    const html = await render();
    for (const phrase of ["duy trì mãi", "duy trì được mãi", "vĩnh viễn"]) {
      expect(html.includes(phrase), `page says "${phrase}"`).toBe(false);
    }
  });

  it("keeps the label's own qualification beside the figure", async () => {
    const html = await render();
    expect(html).toContain(WITHDRAWAL.form.perpetualLabel);
    expect(WITHDRAWAL.form.perpetualLabel).toContain("theo giả định của bạn");
  });

  it("explains a zero inflation entry as an assumption about PRICES", async () => {
    // Not as an acceptance of a falling income, which is what the field's
    // help used to say — the model's 0% is stable prices.
    const help = WITHDRAWAL.form.inflationHelp;
    expect(help).toContain("giá cả không đổi");
    expect(help).toContain("số âm");
    expect(help).not.toContain("chấp nhận thu nhập giảm");
    expect(await render()).toContain(help);
  });
});

/**
 * CSV row 28 — "nhấn khoản rút, thời điểm cạn và sức mua; không được lẫn danh
 * nghĩa với thực".
 *
 * Structure and DOM order only, which is all `renderToStaticMarkup` can see.
 * Whether the split grid ever becomes two columns, and whether the chart is
 * legible at any width, remain unverified here.
 */
describe("the three figures the row names share one region", () => {
  /** The `emphasis` treatment `ResultRow` owns. */
  const HEADLINE = "md:text-3xl";

  const F = WITHDRAWAL.form;

  it("keeps depletion, sustainable draw and real return in the live region", async () => {
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"')!;
    expect(live).toContain(F.lastsLabel);
    expect(live).toContain(F.perpetualLabel);
    expect(live).toContain(F.realReturnLabel);
    // The documented figures for the shipped defaults.
    expect(live).toContain("245 tháng (20,4 năm)");
    expect(live).toContain("15.749.891 ₫");
    expect(live).toContain("3,8462%");
  });

  it("gives the headline to the sustainable draw and to nothing else", async () => {
    // Not to "Danh mục cạn sau": its value is a two-part phrase, which in
    // display type reads as a sentence rather than an answer. The row's
    // "nhấn" is carried by the region; `emphasis` picks the one figure that
    // works as a headline, and it is the side of the gap the reader did not
    // already type in.
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"')!;
    expect(live.split(HEADLINE).length - 1).toBe(1);
    const beforeHeadline = live.slice(0, live.indexOf(HEADLINE));
    expect(beforeHeadline).toContain(F.perpetualLabel);
    expect(beforeHeadline).not.toContain(F.realReturnLabel);
  });

  it("explains a blank sustainable draw beside that blank", async () => {
    // Inflation equal to the return leaves a real return of 0, so no draw
    // preserves purchasing power. The dash and its explanation are the same
    // fact, and the reader must not have to open a disclosure for the second.
    const html = await render({ defaultInflation: "8" });
    const result = markupRegion(html, 'data-calc-region="result"')!;
    expect(result).toContain(F.noPerpetualNotice);
    expect(result).toContain("—");
    // The convention caveat is about a figure that is not there.
    expect(result).not.toContain(F.perpetualCaveat);
  });

  it("explains a depletion date that never arrives, in the same region", async () => {
    const html = await render({ defaultWithdrawal: "1.000.000" });
    const result = markupRegion(html, 'data-calc-region="result"')!;
    expect(result).toContain(F.neverRunsOut);
    expect(result).toContain(F.survivesNotice);
  });
});

describe("nominal is never left standing for real", () => {
  const F = WITHDRAWAL.form;

  it("names the scale in the final-year withdrawal's own label", async () => {
    // 65.733.694 ₫ beside a 30.000.000 ₫ entry says "your income grew"
    // unless something says which prices each is in.
    expect(F.lastWithdrawalLabel).toContain("danh nghĩa");
    const detail = markupRegion(
      await render(),
      'data-calc-region="detail"',
    )!;
    expect(detail).toContain(F.lastWithdrawalLabel);
    expect(detail).toContain("65.733.694 ₫");
  });

  it("puts the note with the two rows that mix the scales", async () => {
    const html = await render();
    const detail = markupRegion(html, 'data-calc-region="detail"')!;
    expect(detail).toContain(F.nominalVsRealNote);
    expect(detail).toContain(F.totalWithdrawnLabel);
    expect(detail).toContain("10.997.292.511 ₫");
    // And not in the live region, which holds the answer, not its caveats.
    const live = markupRegion(html, 'data-results-live="true"')!;
    expect(live).not.toContain(F.nominalVsRealNote);
  });

  it("states the equal-purchasing-power claim as the model's own", async () => {
    // The claim is exact by construction — the withdrawal is stepped up by
    // exactly the rate entered — so it is stated as following from that
    // assumption, not as a fact about prices.
    expect(F.nominalVsRealNote).toContain("theo đúng giả định lạm phát bạn nhập");
    expect(F.nominalVsRealNote).toContain("không phải vì thu nhập của bạn thay đổi");
  });

  it("makes no comparison between two figures, in any wording", async () => {
    // TWO defects, both found in a browser and both repaired here. First the
    // sentence asserted the final withdrawal and the nominal total are
    // LARGER — false at inflation 0, inverted below it. Then the direction
    // was picked from the inflation SIGN, and that is not enough either: a
    // plan can deplete before its first annual adjustment, which leaves the
    // final planned withdrawal equal to the first at ANY inflation. So the
    // note states the mechanism and compares nothing.
    for (const comparison of [
      "lớn hơn",
      "nhỏ hơn",
      "cao hơn",
      "thấp hơn",
      "tăng theo lạm phát",
    ]) {
      expect(
        F.nominalVsRealNote,
        `the note compares with "${comparison}"`,
      ).not.toContain(comparison);
    }
    // The sign clauses are gone rather than unused: a dead key gets rewired.
    for (const key of ["nominalScaleRising", "nominalScaleFlat", "nominalScaleFalling"])
      expect(F, `${key} survived the repair`).not.toHaveProperty(key);
    // And the distinction it exists for is still stated, scoped to the
    // PLANNED schedule — the last payment can be a fraction of it.
    expect(F.nominalVsRealNote).toContain("danh nghĩa");
    expect(F.nominalVsRealNote).toContain("THEO KẾ HOẠCH");
    expect(F.nominalVsRealNote).toContain("chỉ trả được một phần");
    // The close used to assert the total is "không cùng thước với giá hôm
    // nay", which is false at inflation 0 — where the two scales coincide.
    // It now says what to DO to compare, which holds at every entry.
    expect(F.nominalVsRealNote).toContain("cùng một thời điểm");
    expect(F.nominalVsRealNote).not.toContain("không cùng thước");
  });

  /**
   * Every state the two falsified versions of this note got wrong.
   *
   * The three signs are the first version's counter-examples; the last two
   * rows are the second's. `defaultWithdrawal` is 30.000.000 ₫, which is why
   * the equal-to-initial cases are the interesting ones.
   */
  const STATES = [
    ["inflation 4", { defaultInflation: "4" }, "65.733.694 ₫"],
    ["inflation 0", { defaultInflation: "0" }, "30.000.000 ₫"],
    ["inflation -4", { defaultInflation: "-4" }, "527.197 ₫"],
    // Depletes in MONTH 1, so no annual adjustment ever applies and the
    // final planned withdrawal is the initial one, at inflation 4.
    ["depletion inside the first year", { defaultBalance: "1.000.000" }, "30.000.000 ₫"],
    // Nothing is ever withdrawn, so there is no pair of figures to compare.
    ["a zero withdrawal", { defaultWithdrawal: "0" }, "0 ₫"],
  ] as const;

  for (const [name, overrides, finalWithdrawal] of STATES) {
    it(`stays true with ${name}`, async () => {
      const html = await render(overrides);
      // Every one of these is a VALID entry; none may start being rejected.
      expect(html).not.toContain('aria-invalid="true"');
      const detail = markupRegion(html, 'data-calc-region="detail"')!;
      const row = detail.slice(
        detail.indexOf(F.lastWithdrawalLabel),
        detail.indexOf(F.totalWithdrawnLabel),
      );
      expect(row, `${name}: final planned withdrawal`).toContain(finalWithdrawal);
      expect(detail).toContain(F.nominalVsRealNote);
    });
  }

  it("distinguishes the planned final withdrawal from what was paid", async () => {
    // The month-1 case is where the two diverge most: the schedule asked for
    // the full 30.000.000 ₫ and 1.006.434 ₫ was left. Both are on the page,
    // under labels that say which is which, plus the caveat that the month
    // count is not a count of full withdrawals.
    const html = await render({ defaultBalance: "1.000.000" });
    const detail = markupRegion(html, 'data-calc-region="detail"')!;
    expect(detail).toContain(F.lastPlannedLabel);
    expect(detail).toContain("30.000.000 ₫");
    expect(detail).toContain(F.lastPaidLabel);
    expect(detail).toContain("1.006.434 ₫");
    expect(detail).toContain(F.lastShortfallLabel);
    expect(detail).toContain("28.993.566 ₫");
    expect(detail).toContain(F.partialLastNotice);
  });

  it("does not tell a reader who entered 4 that they entered 0", async () => {
    // The chart summary mounted its note on `series.every(balance ===
    // realBalance)` and worded it as an entry. On the same month-1 case the
    // series is month 0 and a terminal 0, which agree at any inflation.
    const html = await render({ defaultBalance: "1.000.000" });
    expect(html).not.toContain("Bạn đang đặt lạm phát bằng 0");
    // What it says instead describes the drawing, and the real return the
    // page reports from the entry is still on screen beside it.
    expect(html).toContain(WITHDRAWAL.chart.coincidentLinesNote);
    expect(markupRegion(html, 'data-results-live="true"')).toContain("3,8462%");
  });

  it("still explains the coincidence on a genuine zero entry", async () => {
    const html = await render({ defaultInflation: "0" });
    expect(html).toContain(WITHDRAWAL.chart.coincidentLinesNote);
  });

  it("says nothing about coincident lines when the two paths separate", async () => {
    const html = await render();
    expect(html).not.toContain(WITHDRAWAL.chart.coincidentLinesNote);
  });

  /**
   * The convention text and the coincidence note have to agree.
   *
   * `indexNote` promised "hai đường không song song" and sat one sentence
   * before `coincidentLinesNote` saying they lie on top of each other. The
   * two rhythms are still stated — that is the convention, and it stays —
   * but nothing now guarantees the lines separate.
   */
  it("states the two rhythms without promising the lines separate", () => {
    // Whole content object, so the long teaching cannot re-promise it.
    expect(JSON.stringify(WITHDRAWAL)).not.toContain("song song");
    // The convention itself is intact: monthly deflation, annual step-up.
    expect(WITHDRAWAL.chart.indexNote).toContain("từng tháng");
    expect(WITHDRAWAL.chart.indexNote).toContain("mỗi năm");
    expect(WITHDRAWAL.chart.indexNote).toContain("có thể trùng hoặc tách");
  });
});

describe("the split region and CTA contract", () => {
  it("emits the split grid, all three regions and the CTA target", async () => {
    const html = await render();
    expect(html).toContain(
      'id="thu-nhap-dau-tu-nhap" data-calc-region="form"',
    );
    expect(html).toContain('data-calc-region="result"');
    expect(html).toContain('id="thu-nhap-dau-tu-ket-qua"');
    expect(html).toContain('aria-controls="thu-nhap-dau-tu-ket-qua"');
    expect(html).toContain('data-calc-cta="true"');
    expect(html).toContain("lg:grid-cols-5");
    // Exactly one live results region on the page.
    expect(html.split('data-results-live="true"').length - 1).toBe(1);
  });

  it("puts the chart ahead of the long detail region", async () => {
    const html = await render();
    expect(html.indexOf("<figure")).toBeGreaterThan(-1);
    expect(html.indexOf("<figure")).toBeLessThan(
      html.indexOf('data-calc-region="detail"'),
    );
    expect(markupRegion(html, 'data-calc-region="detail"')).not.toContain(
      'data-results-live="true"',
    );
  });

  it("marks the CTA help as pointing at a bad field only when one exists", async () => {
    const clean = await render();
    const broken = await render({ defaultBalance: "0" });
    // `ResultCta`'s `invalid` drives only the help sentence; the jump
    // destination is read from the DOM. So this asserts the two states
    // differ, not which words either one uses.
    expect(broken).toContain('aria-invalid="true"');
    expect(clean).not.toContain('aria-invalid="true"');
  });

  it("keeps the two field groups as real fieldsets", async () => {
    const html = await render();
    const form = markupRegion(html, 'data-calc-region="form"')!;
    expect(form).toContain(WITHDRAWAL.form.portfolioGroup);
    expect(form).toContain(WITHDRAWAL.form.assumptionGroup);
    expect(form.split("<fieldset").length - 1).toBe(2);
  });
});
