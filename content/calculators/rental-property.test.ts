// Audit defect class #8: a vendored legal constant needs its effective date
// AND its base recorded. The threshold on this page was prefilled at 100
// triệu through two revisions (→ 200 → 500), so the page's own default state
// charged 17.100.000 ₫ of tax that was not owed and every headline below it
// was wrong.
//
// The numbers live in lib/ (pure) and the Vietnamese copy in content/, which
// is the right split — but it means the next revision can move one and not
// the other. This test is the join: the copy must quote the constants.
import { describe, expect, it } from "vitest";
import { RENTAL_PROPERTY as C } from "@/content/calculators/rental-property";
import { VN_RENTAL_TAX_DEFAULTS } from "@/lib/calc/rental-property";
import { formatMoney, parseMoney, parseDecimal } from "@/lib/calc/number";

describe("the rental-tax copy quotes the module's constants", () => {
  it("prefills the form from the exported defaults", () => {
    expect(parseMoney(C.form.defaultThreshold)).toBe(
      VN_RENTAL_TAX_DEFAULTS.thresholdPerYear,
    );
    expect(parseDecimal(C.form.defaultVatRate)).toBe(
      VN_RENTAL_TAX_DEFAULTS.vatPercent,
    );
    expect(parseDecimal(C.form.defaultPitRate)).toBe(
      VN_RENTAL_TAX_DEFAULTS.pitPercent,
    );
  });

  it("names the statute and the date the reader would need to check it", () => {
    const notice = C.taxVintageNotice;
    // The threshold, written the Vietnamese way.
    expect(notice).toContain(
      formatMoney(VN_RENTAL_TAX_DEFAULTS.thresholdPerYear),
    );
    expect(notice).toContain(`${VN_RENTAL_TAX_DEFAULTS.vatPercent}%`);
    expect(notice).toContain(`${VN_RENTAL_TAX_DEFAULTS.pitPercent}%`);
    // Both statutes and both in-force dates, so a reader in 2027 can tell the
    // figure's vintage without reading the source.
    expect(notice).toContain("149/2025/QH15");
    expect(notice).toContain("109/2025/QH15");
    expect(notice).toContain("01/01/2026");
    expect(notice).toContain("01/07/2026");
  });

  it("says the two taxes have different bases, which is the whole point", () => {
    // A single combined 10% overstates the bill by pitPercent of the threshold
    // at every revenue above it. The copy must not collapse them again.
    expect(C.taxVintageNotice).toMatch(/toàn bộ/);
    expect(C.taxVintageNotice).toMatch(/vượt/);
  });
});
