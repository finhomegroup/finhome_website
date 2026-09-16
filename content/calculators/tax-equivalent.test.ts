// /cong-cu/loi-suat-tuong-duong-thue/ — original row 24.
//
// The row asks for the waiting-to-buy context, a SOURCE AND EFFECTIVE DATE on
// the tax parameters, and a same-basis comparison. This file guards the two
// that were missing, and in particular the overbroad claim an independent
// source review found: the page used to state that every corporate bond
// coupon is taxed 5%, while the official exemption guidance lists government,
// local-government and GREEN bond interest among exempt items.
//
// It asserts nothing about what the law says. It asserts that the page cites
// its sources with dates, keeps the rate an editable input, names the exempt
// instruments, and does not claim a legal review it has not had.
import { describe, expect, it } from "vitest";
import { computeTaxEquivalent } from "@/lib/calc/tax-equivalent";
import { formatDecimal, parseDecimal } from "@/lib/calc/number";
import { TAX_EQUIVALENT as C } from "@/content/calculators/tax-equivalent";

const F = C.form;

const ALL_COPY = [
  C.lede,
  C.vietnamNotice,
  C.vietnamNoticeDetail,
  C.sources.intro,
  ...C.sources.items.flatMap((i) => [i.label, i.note]),
  ...C.formula.body,
  ...C.faq.items.flatMap((i) => [i.q, i.a]),
  // `flatMap` rather than a `v is string` predicate: the content object is
  // `as const`, so its values are literal types and `string` is not
  // assignable to them.
  ...Object.values(F).flatMap((v) => (typeof v === "string" ? [v] : [])),
].join(" ");

describe("the arithmetic the page quotes is the module's own", () => {
  it("grosses up the shipped default exactly as the copy says", () => {
    const yieldPercent = parseDecimal(F.defaultYield)!;
    const taxPercent = parseDecimal(F.defaultTaxRate)!;
    expect(yieldPercent).toBe(5.5);
    expect(taxPercent).toBe(5);

    const r = computeTaxEquivalent({
      direction: "toTaxable",
      yieldPercent,
      taxRatePercent: taxPercent,
    })!;
    expect(formatDecimal(r.taxablePercent, 6)).toBe("5,789474");
    expect(C.vietnamNotice).toContain("5,789474%");
  });

  it("nets down the other direction to the figure the copy quotes", () => {
    const r = computeTaxEquivalent({
      direction: "toAfterTax",
      yieldPercent: 5.8,
      taxRatePercent: 5,
    })!;
    expect(formatDecimal(r.afterTaxPercent, 2)).toBe("5,51");
    expect(C.vietnamNotice).toContain("5,51%");
  });
});

describe("every tax statement carries a source and a date", () => {
  it("dates both cited guidance documents and the law", () => {
    // The taxable side, the exempt side, and the law's effective date.
    expect(C.vietnamNoticeDetail).toContain("04/07/2026");
    expect(C.vietnamNoticeDetail).toContain("Nghị định 253/2026");
    expect(C.vietnamNoticeDetail).toContain("03/07/2026");
    expect(C.vietnamNoticeDetail).toContain("109/2025/QH15");
    expect(C.vietnamNoticeDetail).toContain("01/07/2026");
  });

  it("names the instruments the exemption guidance lists", () => {
    // The specific omission the review caught. A reader holding a government
    // or green bond was being told a rate that does not apply to it.
    for (const exempt of [
      "lãi tiền gửi tại tổ chức tín dụng",
      "trái phiếu chính phủ",
      "trái phiếu chính quyền địa phương",
      "bảo hiểm nhân thọ",
      "trái phiếu xanh",
    ]) {
      expect(
        C.vietnamNoticeDetail,
        `the exemption list omits ${exempt}`,
      ).toContain(exempt);
    }
  });

  it("never claims every bond coupon is taxed", () => {
    // The removed sentence, in the ASSERTED form it used to have.
    expect(ALL_COPY).not.toContain(
      "lãi trái phiếu doanh nghiệp và cổ tức tiền mặt thì chịu 5%",
    );
    // "mọi trái phiếu đều chịu 5%" IS in the copy — inside the sentence that
    // denies it. A bare substring search would fail on the correction itself,
    // so the check is that every occurrence is negated.
    const claim = "mọi trái phiếu đều chịu 5%";
    for (const text of [C.vietnamNoticeDetail, ...C.faq.items.map((i) => i.a)]) {
      const at = text.indexOf(claim);
      if (at === -1) continue;
      expect(
        text.slice(Math.max(0, at - 30), at),
        `"${claim}" appears without a negation before it`,
      ).toMatch(/KHÔNG thể nói|không thể nói|không phải/);
    }
    expect(C.vietnamNoticeDetail).toContain("KHÔNG thể nói");
  });

  it("keeps the rate an editable input, not the tool's conclusion", () => {
    expect(F.taxRateHelp).toContain("giả định của bạn");
    expect(F.taxRateHelp).toContain("công cụ không xác định sản phẩm của bạn");
  });

  it("states its own provenance limit instead of implying legal review", () => {
    expect(C.vietnamNoticeDetail).toContain("không phải do trang tự tra lại");
    expect(C.vietnamNoticeDetail).toContain("không phải tư vấn thuế");
    expect(C.vietnamNoticeDetail).toContain("không kiểm tra toàn văn");
    for (const claim of [
      "đã được thẩm định",
      "được cơ quan thuế xác nhận",
      "bảo đảm đúng quy định",
    ]) {
      expect(ALL_COPY, `copy claims "${claim}"`).not.toContain(claim);
    }
  });
});

describe("the source is a LINK, not a document name in a paragraph", () => {
  // Original row 24 asks for a source and an effective date on the tax
  // parameter. The dates were there; a reader had no way to open anything.
  it("gives one openable reference per cited document", () => {
    const urls = C.sources.items.map((i) => i.url);
    expect(urls).toHaveLength(3);
    for (const url of urls) expect(url).toMatch(/^https:\/\//);
    // The two guidance documents behind the 5% and behind the exemptions,
    // plus the law's own register page.
    expect(
      urls.some((u) => u.includes("thu-nhap-tu-dau-tu-von")),
      "no link to the taxable investment-income guidance",
    ).toBe(true);
    expect(
      urls.some((u) => u.includes("mien-thue-thu-nhap-ca-nhan")),
      "no link to the exemption guidance",
    ).toBe(true);
    expect(
      urls.some((u) => u.includes("vanban.chinhphu.vn")),
      "no link to the law's register entry",
    ).toBe(true);
    expect(new Set(urls).size).toBe(urls.length);
  });

  it("labels each one shortly and dates it", () => {
    for (const item of C.sources.items) {
      expect(item.label.length, item.url).toBeLessThan(80);
      expect(item.note, item.url).toBeTruthy();
    }
    expect(C.sources.items[0].label).toContain("04/07/2026");
    expect(C.sources.items[1].label).toContain("03/07/2026");
    expect(C.sources.items[2].note).toContain("01/07/2026");
  });

  it("keeps the provenance limit ON the list of official links", () => {
    // A list of government URLs implies a completeness this page has not
    // earned, so the limit travels with the list rather than only appearing
    // in a disclosure elsewhere on the page.
    expect(C.sources.intro).toContain("không phải danh sách đầy đủ");
    expect(C.sources.intro).toContain("không phải tư vấn thuế");
  });
});

describe("the two teaching sentences an independent review corrected", () => {
  it("does not claim the default example proves a ranking reversal", () => {
    // 5,8% gross nets 5,51%, still 0,01 point ABOVE the 5,5% deposit. The
    // deduction closes almost the whole gap; it does not turn the order over.
    const r = computeTaxEquivalent({
      direction: "toAfterTax",
      yieldPercent: 5.8,
      taxRatePercent: 5,
    })!;
    expect(r.afterTaxPercent).toBeGreaterThan(5.5);
    const sentence = C.formula.body.find((p) => p.includes("0,289474 điểm"));
    expect(sentence, "no sentence quotes the deduction").toBeDefined();
    expect(sentence!).toContain("chưa đảo ngược");
    expect(sentence!).not.toContain("đủ để đảo ngược");
  });

  it("does not let a real yield be taxed with a nominal-interest rate", () => {
    // Hypothetical counterexample, recomputed here: 6% nominal, 8% inflation,
    // 5% tax on the nominal interest. The two orders of operations disagree,
    // and the flattering one is the wrong one.
    const realAfterTax = (1 + 0.06 * 0.95) / 1.08 - 1;
    const taxedRealPreTax = (1.06 / 1.08 - 1) * 0.95;
    expect(realAfterTax).toBeCloseTo(-0.021296296, 9);
    expect(taxedRealPreTax).toBeCloseTo(-0.017592593, 9);
    expect(realAfterTax).not.toBeCloseTo(taxedRealPreTax, 4);

    const sentence = C.formula.body.find((p) => p.includes("lợi suất âm"));
    expect(sentence).toBeDefined();
    expect(sentence!).toContain("−2,1296296%");
    expect(sentence!).toContain("−1,7592593%");
    expect(sentence!).toContain("không tính lạm phát");
    // The claim that was removed: that the conversion is simply still valid.
    expect(ALL_COPY).not.toContain(
      "lợi suất thực sau lạm phát có thể âm và phép quy đổi vẫn đúng",
    );
  });
});

describe("the waiting-to-buy context the row asks for", () => {
  it("frames the question as money that is about to be spent", () => {
    expect(C.lede).toContain("TIỀN ĐANG CHỜ MUA NHÀ");
  });

  it("says the date matters more than the after-tax rate", () => {
    const answer = C.faq.items.find((i) => i.q.includes("sắp dùng để mua nhà"));
    expect(answer, "no FAQ answers the waiting-to-buy reader").toBeDefined();
    expect(answer!.a).toContain("NGÀY");
    expect(answer!.a).toContain("tiền gửi có kỳ hạn");
  });
});
