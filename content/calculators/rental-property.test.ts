// Audit defect class #8: a vendored legal constant needs its effective date
// AND its base recorded. The threshold on this page was prefilled at 100
// triệu through two revisions (→ 200 → 500), so the page's own default state
// charged 17.100.000 ₫ of tax that was not owed and every headline below it
// was wrong.
//
// The numbers live in lib/ (pure) and the Vietnamese copy in content/, which
// is the right split — but it means the next revision can move one and not
// the other. This test is the join: the copy must quote the constants.
//
// The threshold is quoted in FOUR consumer/source-facing places, not one:
// taxVintageNotice (the results block), thresholdHelp (directly under the
// input field), the FAQ answer about the threshold, and this file's own
// header comment — plus the pure module's docstring in lib/calc/. Binding
// only taxVintageNotice is exactly how the 100 triệu default survived two
// revisions while the copy elsewhere kept quoting the old figure: a change
// to VN_RENTAL_TAX_DEFAULTS.thresholdPerYear must fail here until every one
// of these sites is updated, not just the one this file happens to test.
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { RENTAL_PROPERTY as C } from "@/content/calculators/rental-property";
import { VN_RENTAL_TAX_DEFAULTS } from "@/lib/calc/rental-property";
import { formatMoney, parseMoney, parseDecimal } from "@/lib/calc/number";

// The threshold written the Vietnamese way ("500 triệu"), not the formatted
// 500.000.000 — that is how every one of the sites below actually quotes it.
const trieu = VN_RENTAL_TAX_DEFAULTS.thresholdPerYear / 1_000_000;
const asTrieu = `${trieu} triệu`;

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

  it("quotes the threshold in the help text under the input field", () => {
    // This is the text a reader sees WHILE typing into the threshold field —
    // it is read far more often than the results-block notice, and it was
    // the one left behind through two of the threshold's three revisions.
    expect(C.form.thresholdHelp).toContain(asTrieu);
  });

  it("quotes the threshold in the FAQ answer that names it", () => {
    const answer = C.faq.items.find((item) =>
      item.q.startsWith("Ngưỡng miễn thuế cho thuê hiện nay"),
    )?.a;
    expect(answer, "no FAQ item asks about the current threshold").toBeDefined();
    expect(answer).toContain(asTrieu);
  });

  it("quotes the threshold in this content file's own header comment", () => {
    // The header comment (module-level, above `export const RENTAL_PROPERTY`)
    // is the fourth site of the four that were meant to line up — narrow the
    // read to that header so a match elsewhere in the file cannot fake a pass.
    const src = readFileSync("content/calculators/rental-property.ts", "utf8");
    const header = src.slice(0, src.indexOf("export const RENTAL_PROPERTY"));
    expect(header).toContain(asTrieu);
  });

  it("quotes the threshold in the pure module's own docstring", () => {
    // lib/calc/rental-property.ts explains the same rule in its top docstring,
    // independently of the exported constant it sits above. Narrow the read
    // to that docstring (before the first `export`) for the same reason.
    const src = readFileSync("lib/calc/rental-property.ts", "utf8");
    const docstring = src.slice(0, src.indexOf("export "));
    expect(docstring).toContain(asTrieu);
  });
});
