// /cong-cu/ty-suat-loi-nhuan-roi/ — original row 21.
//
// The row asks for a buyer-relevant example, the total-versus-annual
// distinction, and the fees NOT included named explicitly. It does NOT ask for
// a new engine: `computeRoi` is unchanged and its conventions are pinned in
// `lib/calc/roi.test.ts`. What this file guards is the copy, against three
// specific defects an independent audit found.
import { describe, expect, it } from "vitest";
import { computeRoi } from "@/lib/calc/roi";
import { formatDecimal, formatMoney, parseDecimal, parseMoney } from "@/lib/calc/number";
import { ROI as C } from "@/content/calculators/roi";

const F = C.form;

/** The component's own parse, field by field — docs §6. */
function shipped() {
  return computeRoi({
    cost: parseMoney(F.defaultCost)!,
    finalValue: parseMoney(F.defaultFinal)!,
    years: parseDecimal(F.defaultYears)!,
  })!;
}

describe("the shipped defaults are the home-fund example the row asks for", () => {
  it("parses each field with the parser its kind needs", () => {
    // "500.000.000" through `parseDecimal` would be 500; "3" is a decimal
    // year count, not money (docs §4).
    expect(parseMoney(F.defaultCost)).toBe(500_000_000);
    expect(parseMoney(F.defaultFinal)).toBe(700_000_000);
    expect(parseDecimal(F.defaultYears)).toBe(3);
  });

  it("reproduces the audit's independent figures", () => {
    const r = shipped();
    expect(r.gain).toBe(200_000_000);
    expect(r.roiPercent).toBeCloseTo(40, 10);
    // 500 → 700 over 3 years. The audit's own oracle for 500 → 650 in one
    // year is 30% total; this fixture is the page's.
    expect(formatDecimal(r.annualisedPercent!, 2)).toBe("11,87");
    expect(r.multiple).toBeCloseTo(1.4, 10);
  });

  it("frames the example as down-payment money, not an anonymous trade", () => {
    // Row 21: "dùng ví dụ gần người mua nhà".
    expect(C.lede).toContain("vốn dành để mua nhà");
    // The lede names the example in the readable magnitude form, not as a
    // grouped đồng figure: a lede sentence is prose, and the exact figures
    // are in the fields the reader is about to look at.
    expect(C.lede).toContain("500 triệu thành 700 triệu sau 3 năm");
    expect(formatMoney(parseMoney(F.defaultCost)!)).toBe("500.000.000");
    const homeFaq = C.faq.items.find((i) => i.q.includes("để dành mua nhà"));
    expect(homeFaq, "no FAQ answers the home-fund reader").toBeDefined();
    expect(homeFaq!.a).toContain("11,87%");
  });
});

describe("no unsupported deposit-rate comparison anywhere", () => {
  // The lede notice and a FAQ both asserted that 4,3%/năm is below deposit
  // interest. The site is a static export with no rate feed, so it cannot
  // know what a deposit pays; the arithmetic that made the point is kept and
  // the claim about banks is gone.
  const allCopy = [
    C.lede,
    C.leadNotice,
    ...C.formula.body,
    ...C.faq.items.flatMap((i) => [i.q, i.a]),
    // `flatMap` rather than a `v is string` predicate: the content object is
    // `as const`, so its values are literal types and `string` is not
    // assignable to them.
    ...Object.values(F).flatMap((v) => (typeof v === "string" ? [v] : [])),
  ].join(" ");

  it("keeps the eight-months versus eight-years arithmetic", () => {
    expect(C.leadNotice).toContain("65,7%/năm");
    expect(C.leadNotice).toContain("4,3%/năm");
  });

  it("claims nothing about what a deposit pays", () => {
    for (const claim of [
      "thấp hơn cả lãi tiền gửi",
      "cao hơn lãi tiền gửi",
      "thấp hơn lãi tiền gửi",
    ]) {
      expect(allCopy, `copy still claims "${claim}"`).not.toContain(claim);
    }
    // And it points at the reader's own rate instead.
    expect(C.leadNotice).toContain("mức lãi bạn thực sự được trả");
  });
});

describe("the total-loss explanation is true", () => {
  it("still withholds the annualised figure", () => {
    const loss = computeRoi({ cost: 500_000_000, finalValue: 0, years: 5 })!;
    expect(loss.roiPercent).toBe(-100);
    expect(loss.annualisedPercent).toBeNull();
  });

  it("no longer claims no such rate exists", () => {
    // −100%/năm satisfies cost × (1 + r)^n = 0 for every positive n, so the
    // old wording was false. The reason is interpretive now.
    const wording = [F.totalLossNotice, ...C.formula.body].join(" ");
    expect(wording).not.toContain("không mức nào đưa một số tiền dương về đúng 0");
    expect(wording).not.toContain("không có mức lợi nhuận theo năm nào diễn tả");
    expect(F.totalLossNotice).toContain("−100%/năm");
    expect(F.totalLossNotice).toContain("gây hiểu sai");
  });
});

describe("the endpoint and fee boundaries are stated, not implied", () => {
  it("says interim income is not dated", () => {
    // The audit's finding: adding rent or dividends into the final value is
    // allowed and gives a correct TOTAL return, but the page must not read as
    // a money-weighted one.
    expect(F.finalHelp).toContain("không xét chúng đến vào tháng nào");
    expect(C.formula.body.join(" ")).toContain("ĐIỂM ĐẦU");
    expect(C.formula.body.join(" ")).toContain("NPV và IRR");
  });

  it("says no fee is modelled or deducted automatically", () => {
    expect(F.costHelp).toContain("KHÔNG tự tính phí nào");
    expect(C.formula.body.join(" ")).toContain("Công cụ không tự tính phí");
  });

  it("keeps the unknown-period state useful", () => {
    // Total return survives without a holding period; only annualisation is
    // withheld, and the notice says the total is still usable.
    const unknown = computeRoi({ cost: 500_000_000, finalValue: 700_000_000 })!;
    expect(unknown.roiPercent).toBeCloseTo(40, 10);
    expect(unknown.annualisedPercent).toBeNull();
    expect(unknown.years).toBeNull();
    expect(F.noAnnualNotice).toContain("vẫn đúng và vẫn dùng được");
  });
});
