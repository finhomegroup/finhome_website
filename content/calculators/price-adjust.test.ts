import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";
import {
  formatMoney,
  formatPercent,
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";
import { adjustPrice, type PriceAdjustInput } from "@/lib/calc/price-adjust";
import { PRICE_ADJUST as C } from "@/content/calculators/price-adjust";

/**
 * THE MODULE AT ITS SHIPPED DEFAULTS — docs §6 calls this the highest-value
 * substitute for the coverage a green suite does not have. Original row 60.
 * This file did not exist before, which is exactly why the page's prose
 * figures were allowed to go stale: `lib/calc/price-adjust.test.ts` proves the
 * arithmetic, and NOTHING checked that the worked figures quoted in the copy
 * still come out of it at the defaults the page ships.
 *
 * Every figure asserted below is DERIVED by running `adjustPrice` and then
 * formatted with `formatMoney`, never typed in by hand. So a change to
 * `defaultTax`, `defaultPrice` or `defaultDiscountPercent` that leaves the
 * prose behind is a red test naming the sentence, rather than a page quietly
 * claiming a number the tool no longer produces.
 *
 * Two traps this file is written around, both from docs §8:
 *
 * - `formatMoney(0) === "0"`, so `expect(copy).toContain(formatMoney(zero))`
 *   passes on any sentence containing a zero digit. The zero-valued default
 *   (`defaultDiscountAmount`) is asserted as a NUMBER, never as a substring.
 * - a percentage is quoted in the prose as "28%", not as `formatPercent`'s
 *   "28,00%", so the pairing is built from the raw model value.
 */

const F = C.form;

/** The component's own parse and wiring, reproduced — docs §4 and §6. */
function shippedInput(): PriceAdjustInput {
  return {
    // Money grammar: "1.000.000" is 1e6, not 1.
    listPrice: parseMoney(F.defaultPrice)!,
    // Rates: `parseDecimal`, where "," is the decimal mark.
    discountPercent: parseDecimal(F.defaultDiscountPercent)!,
    secondDiscountPercent: parseDecimal(F.defaultSecondDiscountPercent)!,
    discountAmount: parseMoney(F.defaultDiscountAmount)!,
    taxPercent: parseDecimal(F.defaultTax)!,
    // The radio's own value, read the way the component reads it.
    taxIncluded: F.defaultTaxIncluded === "yes",
  };
}

function run(overrides: Partial<PriceAdjustInput> = {}) {
  const result = adjustPrice({ ...shippedInput(), ...overrides });
  expect(result).not.toBeNull();
  return result!;
}

const SHIPPED_TAX = parseDecimal(F.defaultTax)!;
const SHIPPED_PRICE = parseMoney(F.defaultPrice)!;
const SHIPPED_FIRST = parseDecimal(F.defaultDiscountPercent)!;

describe("giam-gia-va-thue at its shipped defaults", () => {
  it("parses every default with the parser its field kind needs", () => {
    const input = shippedInput();
    expect(input.listPrice).toBe(1_000_000);
    expect(input.discountPercent).toBe(20);
    expect(input.secondDiscountPercent).toBe(10);
    expect(input.taxPercent).toBe(8);
    // Asserted as a number, not as a formatted substring: `formatMoney(0)` is
    // "0" and would match almost any sentence on the page.
    expect(input.discountAmount).toBe(0);
    expect(input.taxIncluded).toBe(true);
  });

  it("rejects the wrong grammar on the money and rate fields", () => {
    // The 1000× trap, both directions. `parseDecimal` refuses this page's
    // grouped price outright — it allows one separator, and a second one is a
    // rejection rather than a silent 1 — but a single group is exactly the
    // 1000× error, so both shapes are pinned.
    expect(parseDecimal(F.defaultPrice)).toBeNull();
    expect(parseDecimal("500.000")).toBe(500);
    expect(parseMoney(F.defaultTax)).toBe(SHIPPED_TAX);
    expect(parseMoney("7.5")).toBe(75);
  });

  it("opens tax-included, which is the whole editorial point", () => {
    expect(F.defaultTaxIncluded).toBe("yes");
    const r = run();
    // Nothing is added to the label price in this mode: the tax is the share
    // already inside what you pay.
    expect(r.finalPrice).toBe(SHIPPED_PRICE - r.discount);
    expect(r.tax).toBeCloseTo(r.finalPrice - r.finalPrice / (1 + SHIPPED_TAX / 100), 6);
    expect(r.ledger.at(-1)!.key).toBe("taxInside");
    expect(r.ledger.at(-1)!.delta).toBe(0);
  });

  it("reproduces the successive-discount figures the copy quotes", () => {
    const r = run();
    // 20% then 10% is 28% off, not 30% — the page's lesson, derived.
    //
    // Rendered through `formatPercent` rather than interpolated raw:
    // `1 − 0,8 × 0,9` is 27.999999999999993 in binary floating point, so
    // `${value}%` would be looking for a nineteen-digit string in the prose.
    // The suite's own formatter is what the page would use.
    const whole = (value: number) => formatPercent(value, 0);
    expect(r.combinedDiscountPercent).toBeCloseTo(28, 10);
    expect(r.naiveSumPercent).toBe(30);
    expect(F.combinedNote).toContain(whole(r.combinedDiscountPercent));
    expect(F.combinedNote).toContain(whole(r.naiveSumPercent));
    const faq = C.faq.items.find((item) => item.q.includes("30%"));
    expect(faq, "the non-additivity FAQ entry is gone").toBeDefined();
    expect(faq!.a).toContain(whole(r.combinedDiscountPercent));
    // And the money gap the same two sentences quote, at 100 triệu.
    const base = 100_000_000;
    const real = run({ listPrice: base });
    const naive = run({
      listPrice: base,
      discountPercent: r.naiveSumPercent,
      secondDiscountPercent: 0,
    });
    const gap = naive.discount - real.discount;
    expect(gap).toBe(2_000_000);
    const inTrieu = (value: number) => formatMoney(value / 1_000_000);
    expect(F.combinedNote).toContain(`${inTrieu(base)} triệu`);
    expect(F.combinedNote).toContain(`${inTrieu(gap)} triệu đồng`);
    expect(faq!.a).toContain(`${inTrieu(gap)} triệu đồng`);
  });

  it("reproduces the voucher-order figures in the method copy", () => {
    // "giảm 20% rồi trừ voucher 50.000 … còn 750.000, còn trừ voucher trước
    // rồi giảm 20% lại còn 760.000" — two runs, not arithmetic in a comment.
    const voucher = 50_000;
    const percentFirst = run({
      secondDiscountPercent: 0,
      discountAmount: voucher,
    });
    const voucherFirst = run({
      listPrice: SHIPPED_PRICE - voucher,
      secondDiscountPercent: 0,
    });
    expect(formatMoney(percentFirst.finalPrice)).toBe("750.000");
    expect(formatMoney(voucherFirst.finalPrice)).toBe("760.000");
    // The order matters, and in the direction the copy claims.
    expect(percentFirst.finalPrice).toBeLessThan(voucherFirst.finalPrice);
    expect(C.formula.body[0]).toContain(formatMoney(percentFirst.finalPrice));
    expect(C.formula.body[0]).toContain(formatMoney(voucherFirst.finalPrice));
    expect(C.formula.body[0]).toContain(formatMoney(voucher));
  });

  it("reproduces the saving-ratio figures in the method copy", () => {
    // "Tiết kiệm 200.000 trên giá 1.000.000 là 20%; nếu chia cho giá cuối
    // 800.000 thì ra 25%". One run, three figures, and the wrong denominator
    // computed rather than asserted.
    const r = run({ secondDiscountPercent: 0 });
    expect(r.savingPercent).toBeCloseTo(SHIPPED_FIRST, 10);
    const onFinal = (r.saving / r.finalPrice) * 100;
    expect(onFinal).toBeCloseTo(25, 10);
    const body = C.formula.body[3];
    expect(body).toContain(formatMoney(r.saving));
    expect(body).toContain(formatMoney(r.priceWithoutDiscount));
    expect(body).toContain(formatMoney(r.finalPrice));
    expect(body).toContain(`${r.savingPercent}%`);
    expect(body).toContain(`${onFinal}%`);
  });
});

/**
 * THE FIGURES THAT MOVE WITH THE PREFILLED RATE.
 *
 * Two illustrations on this page are rate-dependent, and both were written
 * against a prefilled 10 and left behind when the default became 8. Both are
 * now deliberately quoted AT THE SHIPPED RATE rather than at the standard 10%,
 * so a reader who types the illustration's own inputs into the live form gets
 * the sentence's own number back. That decision is what these assertions pin:
 * they run the module at `defaultTax`, so restoring a 10% figure in the prose
 * without moving the default — or moving the default without the prose — is
 * red, and the copy that names the rate has to name the same one.
 */
describe("giam-gia-va-thue quotes its rate-dependent figures at the shipped rate", () => {
  it("prices the foreign-tool illustration at the prefilled rate", () => {
    // "với mức 8% đang điền sẵn, 800.000 ₫ thành 864.000 ₫" — a shelf price
    // with tax wrongly added on top, which is the error the default prevents.
    const shelf = 800_000;
    const added = run({
      listPrice: shelf,
      discountPercent: 0,
      secondDiscountPercent: 0,
      taxIncluded: false,
    });
    expect(added.netPrice).toBe(shelf);
    expect(formatMoney(added.finalPrice)).toBe("864.000");
    expect(C.taxIncludedNotice).toContain(formatMoney(shelf));
    expect(C.taxIncludedNotice).toContain(formatMoney(added.finalPrice));
    // The sentence names the rate its figure came from.
    expect(C.taxIncludedNotice).toContain(`${F.defaultTax}%`);
    // And the inflation is exactly the tax rate, which is the claim.
    expect(added.finalPrice / shelf).toBeCloseTo(1 + SHIPPED_TAX / 100, 12);
  });

  it("prices the both-modes saving illustration at the prefilled rate", () => {
    // "trên giá 1.000.000 với mức 8% đang điền sẵn, cùng mức giảm 20%, bạn
    // tiết kiệm 200.000 khi giá đã gồm thuế và 216.000 khi thuế được cộng
    // thêm, vì bản thân giá gốc trong trường hợp sau đã là 1.080.000".
    const included = run({ secondDiscountPercent: 0 });
    const excluded = run({ secondDiscountPercent: 0, taxIncluded: false });
    expect(formatMoney(included.saving)).toBe("200.000");
    expect(formatMoney(excluded.saving)).toBe("216.000");
    expect(formatMoney(excluded.priceWithoutDiscount)).toBe("1.080.000");
    // The ratio is what does NOT move, which is the question being answered.
    expect(excluded.savingPercent).toBeCloseTo(included.savingPercent, 10);
    expect(excluded.saving).toBeGreaterThan(included.saving);

    const faq = C.faq.items.find((item) => item.q.includes("tỷ lệ tiết kiệm"));
    expect(faq, "the unchanged-ratio FAQ entry is gone").toBeDefined();
    expect(faq!.a).toContain(formatMoney(included.saving));
    expect(faq!.a).toContain(formatMoney(excluded.saving));
    expect(faq!.a).toContain(formatMoney(excluded.priceWithoutDiscount));
    expect(faq!.a).toContain(`${F.defaultTax}%`);
  });
});

/**
 * THE PREFILLED 8 IS A LEGAL PARAMETER WITH AN EXPIRY DATE, NOT AN EXAMPLE.
 *
 * The help text used to call 10 "một ví dụ" and name no instrument. Prefilling
 * 10 is not neutral: it is an implicit claim that no reduction is in force,
 * which is the mirror image of the defect `content/calculators/tip.ts` had
 * when it prefilled 8 with no basis. The decree has now been read in the
 * project's source review, so the page states the basis.
 *
 * What is asserted is the PAIRING, not the phrasing: the default, the rate in
 * the help text, the articles it is attributed to, and the end date all have
 * to say the same thing. The realistic failure is the reduction lapsing on
 * 31/12/2026 while `defaultTax` still says 8. Article attribution is pinned as
 * a phrase because an earlier draft of this research credited the rate to
 * Điều 1 khoản 1, which sets only the eligible scope.
 */
describe("giam-gia-va-thue states the basis for the tax rate it prefills", () => {
  const REDUCED_UNTIL = "31/12/2026";
  const STANDARD_AGAIN = "01/01/2027";

  it("quotes the same rate in the help text that it prefills in the field", () => {
    expect(F.defaultTax).toBe("8");
    expect(
      F.taxHelp,
      "the help text no longer quotes the rate the field prefills",
    ).toContain(`${F.defaultTax}%`);
    // And no longer calls it an example, which is what it used to do.
    expect(F.taxHelp).not.toContain("làm ví dụ");
  });

  it("names the instruments behind both the reduced and the standard rate", () => {
    expect(F.taxHelp).toContain("174/2025/NĐ-CP");
    expect(F.taxHelp).toContain("204/2025/QH15");
    expect(F.taxHelp).toContain("48/2024/QH15");
    // The standard rate, so a reader knows what the 8 is a discount from.
    expect(F.taxHelp).toContain("10%");
    expect(F.taxHelp).toContain("khoản 3 Điều 9");
  });

  it("attributes the rate to the article that actually sets it", () => {
    // Điều 1 khoản 1 sets the eligible SCOPE. The figure comes from khoản 2
    // điểm a, and the carve-out for special-consumption goods from khoản 1
    // điểm b. Pinned as whole phrases: a test for the two article numbers
    // separately would pass on a sentence that swapped them.
    expect(F.taxHelp).toContain(
      `${F.defaultTax}% nằm tại Điều 1 khoản 2 điểm a`,
    );
    expect(F.taxHelp).toContain("Điều 1 khoản 1 điểm b");
    expect(F.taxHelp).toContain("Điều 2 khoản 1");
  });

  it("dates the reduction rather than presenting it as permanent", () => {
    expect(F.taxHelp).toContain(REDUCED_UNTIL);
    expect(F.taxHelp).toContain(STANDARD_AGAIN);
    expect(C.sources.intro).toContain(REDUCED_UNTIL);
    // No prediction that it will be extended — the copy says what happens if
    // nothing is done, which is the return to 10%.
    expect(F.taxHelp).toContain("Quốc hội");
    // The FAQ answer for a reader whose invoice says 10 has to agree with it.
    const mixed = C.faq.items.find((item) => item.q.includes("10%"));
    expect(mixed, "the two-rate FAQ entry is gone").toBeDefined();
    expect(mixed!.a).toContain(REDUCED_UNTIL);
  });

  it("says the prefilled rate is not a universal retail rate", () => {
    // The caveat that decides whether the default is right for the reader at
    // all: the rate on a receipt depends on the SELLER's VAT method. 8% is the
    // deduction-method figure; a percentage-of-revenue seller gets a 20% cut
    // in their percentage rate instead, and many small sellers issue no VAT
    // invoice at all. This belongs in the field help, not in a footnote.
    expect(F.taxHelp).toContain("khấu trừ");
    expect(F.taxHelp).toContain("tỷ lệ phần trăm trên doanh thu");
    expect(F.taxHelp).toContain("Điều 1 khoản 2 điểm b");
    expect(F.taxHelp).toContain("không xuất hóa đơn");
    // The categories that never got the reduction, and the one that did
    // despite looking as though it should not have.
    expect(F.taxHelp).toContain("tiêu thụ đặc biệt");
    expect(F.taxHelp).toContain("Phụ lục I");
    expect(F.taxHelp).toContain("xăng");
    // And the instruction that was right all along, kept.
    expect(F.taxHelp).toContain("hóa đơn của bạn là căn cứ");
  });

  it("gives the reader links, with a stated provenance limit", () => {
    // Pinned exactly, not as a minimum: `intro` opens "Hai văn bản dưới đây",
    // which is the sibling page's house wording and the one count in this
    // copy that a third link would silently falsify.
    expect(C.sources.items).toHaveLength(2);
    expect(C.sources.intro).toContain("Hai văn bản");
    for (const item of C.sources.items) {
      expect(item.url.startsWith("https://"), `${item.url} is not https`).toBe(
        true,
      );
      // A "Nguồn" heading over a bare URL is not a citation either.
      expect(item.label.length).toBeGreaterThan(20);
      expect(item.note, `${item.label} has no note`).toBeDefined();
    }
    // The limit the shell's docstring says belongs in `intro`: these were read
    // once, during a review, not at the moment the reader opens the page.
    expect(C.sources.intro).toContain("rà soát");
    expect(C.sources.intro).toContain("không phải tư vấn thuế");
  });

  it("rejects a tax rate above 100, which the field used to accept", () => {
    // Source-level, the way `tip.test.ts` guards the same bound: the predicate
    // lives in the component and there is no render harness in this suite.
    //
    // This is an inconsistency INSIDE ONE FILE rather than a deliberate
    // asymmetry — the two discount percentages in the same component have
    // enforced 0–100 all along — so both predicates are asserted together.
    const component = readFileSync(
      new URL("../../components/price-adjust-calculator.tsx", import.meta.url),
      "utf8",
    );
    expect(component).toContain("tax === null || tax < 0 || tax > 100");
    expect(component).toContain("discountPercent > 100");
    expect(F.taxInvalid).toContain("0 đến 100");
    // Same wording as the discount fields, since it is now the same range.
    expect(F.taxInvalid).toBe(F.discountPercentInvalid);
  });
});

/**
 * THE OTHER SOFTENED CLAIM STAYS SOFTENED.
 *
 * The same audit softened TWO undated claims on this page: the VAT rate, whose
 * instrument has now been read, and the consumer-protection claim about what a
 * displayed price must be, whose instrument has NOT. Lifting one is not a
 * reason to lift the other — the source review read a VAT decree and a VAT
 * law, and neither says anything about price display obligations.
 *
 * The risk this guards is specific and plausible: a later reader sees dated
 * decrees and article numbers all over the tax copy, concludes the page is now
 * in the business of citing law, and "completes" it by restoring the
 * consumer-protection assertion from `lib/calc/price-adjust.ts`'s module
 * docstring — which states it as fact and has no citation either.
 */
describe("giam-gia-va-thue keeps the consumer-protection claim as convention", () => {
  const userFacing = JSON.stringify(C);

  it("asserts no price-display legal obligation anywhere in the copy", () => {
    expect(userFacing).not.toContain("Bảo vệ quyền lợi người tiêu dùng");
    expect(userFacing).not.toContain("luật yêu cầu");
    expect(userFacing).not.toContain("bắt buộc niêm yết");
  });

  it("describes the retail convention and sends the reader to their invoice", () => {
    expect(F.taxIncludedHelp).toContain("thường");
    expect(F.taxIncludedHelp).toContain("hóa đơn của bạn");
    const whenExcluded = C.faq.items.find((item) =>
      item.q.includes("chưa gồm thuế"),
    );
    expect(whenExcluded, "the tax-included FAQ entry is gone").toBeDefined();
    expect(whenExcluded!.a).toContain("thông lệ");
  });

  it("keeps the scope boundary the same audit added", () => {
    // Filed `context` in plan-disposition.ts, so the scope notice carries its
    // weight in words rather than in `<strong>`: `check:markup` fails this
    // page if it ships any emphasis at all.
    expect(C.scopeNotice).toContain("MỘT giao dịch");
    expect(userFacing).not.toContain("<strong");
  });
});
