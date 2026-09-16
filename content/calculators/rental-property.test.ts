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

// The threshold written the Vietnamese way — "1 tỷ", not "1000 triệu" and not
// the formatted 1.000.000.000 — because that is how every one of the sites
// below actually quotes it. DERIVED from the constant, so the next revision
// moves this guard with it: at 500 triệu it produced "500 triệu", and the
// Decree 141 revision to 1 tỷ is what made the magnitude word change.
const threshold = VN_RENTAL_TAX_DEFAULTS.thresholdPerYear;
const asPhrase =
  threshold % 1_000_000_000 === 0
    ? `${threshold / 1_000_000_000} tỷ`
    : `${threshold / 1_000_000} triệu`;

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
    // The document that SET the current figure, its in-force date, and the
    // law that classifies rental income — so a reader in 2027 can tell the
    // figure's vintage without reading the source. `149/2025/QH15` is
    // deliberately gone: Nghị định 141/2026/NĐ-CP superseded the 500 triệu it
    // carried, and citing the superseded statute for a current default is
    // exactly the staleness this file exists to catch.
    expect(notice).toContain("141/2026/NĐ-CP");
    expect(notice).toContain("01/01/2026");
    expect(notice).toContain("109/2025/QH15");
    expect(notice).not.toContain("149/2025/QH15");
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
    expect(C.form.thresholdHelp).toContain(asPhrase);
  });

  it("quotes the threshold in the FAQ answer that names it", () => {
    const answer = C.faq.items.find((item) =>
      item.q.startsWith("Ngưỡng miễn thuế cho thuê hiện nay"),
    )?.a;
    expect(answer, "no FAQ item asks about the current threshold").toBeDefined();
    expect(answer).toContain(asPhrase);
  });

  it("quotes the threshold in this content file's own header comment", () => {
    // The header comment (module-level, above `export const RENTAL_PROPERTY`)
    // is the fourth site of the four that were meant to line up — narrow the
    // read to that header so a match elsewhere in the file cannot fake a pass.
    const src = readFileSync("content/calculators/rental-property.ts", "utf8");
    const header = src.slice(0, src.indexOf("export const RENTAL_PROPERTY"));
    expect(header).toContain(asPhrase);
  });

  it("prefills BOTH thresholds at the CURRENT figure, relief off", () => {
    // Two taxes, two fields, and both now carry Decree 141's 1 tỷ. Keeping
    // the superseded 500 triệu to preserve earlier outputs was rejected by
    // review: it charged a qualifying rental 65 triệu it does not owe.
    expect(parseMoney(C.form.defaultPitThreshold)).toBe(
      VN_RENTAL_TAX_DEFAULTS.thresholdPerYear,
    );
    expect(VN_RENTAL_TAX_DEFAULTS.thresholdPerYear).toBe(1_000_000_000);
    expect(C.form.defaultRelief).toBe("no");
  });

  it("cites Decree 141 for the current figure, and calls 500 triệu the OLD one", () => {
    for (const text of [C.form.thresholdHelp, C.taxVintageNotice]) {
      expect(text).toContain("141/2026/NĐ-CP");
      expect(text).toContain("1 tỷ");
      expect(text).toContain("01/01/2026");
    }
    // Where 500 triệu still appears it is named as what was REPLACED, never
    // as the current threshold.
    const faq = C.faq.items.find((item) => item.q.includes("500 triệu"))?.a;
    expect(faq, "no FAQ explains the superseded figure").toBeDefined();
    expect(faq).toContain("mức CŨ");
    expect(faq).toContain("141/2026/NĐ-CP");
  });

  it("keeps the shared-contract qualification on the PIT deduction", () => {
    // The two figures coincide today, so the reason they are separate fields
    // has to stay visible: the PIT deduction is allocated across one
    // taxpayer's rental contracts, and a second property does not bring a
    // second deduction.
    for (const text of [C.form.pitThresholdHelp, C.taxVintageNotice]) {
      expect(text).toContain("14/07/2026");
      expect(text.toLowerCase()).toContain("kinh doanh");
      expect(text.toLowerCase()).toContain("chung cho các hợp đồng");
    }
    expect(C.form.pitThresholdHelp).toContain(
      "Công cụ không xác định bạn thuộc diện nào",
    );
    const faq = C.faq.items.find((item) => item.q.includes("500 triệu"))?.a;
    expect(faq).toContain("không nhân đôi");
  });

  it("states the NQ43 relief as PIT-only, with the right arithmetic", () => {
    const faq = C.faq.items.find((item) => item.q.includes("Nghị quyết 43"))?.a;
    expect(faq, "no FAQ explains the relief").toBeDefined();
    // The two figures the review insisted on: 54 + 2,8 = 56,8, and NOT
    // 58 × 70% = 40,6, which is what reducing the combined bill would give.
    expect(faq).toContain("54 + 2,8 = 56,8");
    expect(faq).toContain("58 × 70% = 40,6");
    expect(faq).toContain("không đổi");
    // And the eligibility condition is on the whole business revenue.
    expect(faq).toContain("không phải doanh thu của riêng căn nhà này");
    expect(faq).toContain("dự thảo");
    // The field's own legend and help say the same, where the choice is made.
    expect(C.form.reliefHelp).toContain("KHÔNG giảm thuế GTGT");
    expect(C.form.reliefHelp).toContain("10 tỷ");
    expect(C.form.reliefHelp).toContain("24/08/2026");
  });

  it("links the primary documents, and keeps the review open on the list", () => {
    const urls = C.sources.items.map((item) => item.url);
    expect(urls.length).toBeGreaterThanOrEqual(3);
    for (const url of urls) expect(url).toMatch(/^https:\/\//);
    expect(new Set(urls).size).toBe(urls.length);
    expect(urls.some((u) => u.includes("nif.mof.gov.vn"))).toBe(true);
    expect(urls.some((u) => u.includes("nghi-quyet-so-43"))).toBe(true);
    // The document that sets the prefilled threshold has to be linked, not
    // just named: it is the one a reader would check first.
    expect(urls.some((u) => u.includes("nghi-dinh-so-141-2026"))).toBe(true);
    expect(urls.some((u) => u.includes("baochinhphu.vn"))).toBe(true);
    // The tax review is still a release gate, and the list says so.
    expect(C.sources.intro).toContain("chờ rà soát");
    expect(C.sources.intro).toContain("không phải tư vấn thuế");
    // A draft is labelled as one, in the label itself — not only in the note.
    const draft = C.sources.items.find((item) => item.url.includes("du-thao"));
    expect(draft?.label).toContain("DỰ THẢO");
    expect(draft?.note).toContain("không áp dụng");
  });

  it("names the scenarios by their assumption, with no likelihood attached", () => {
    const S = C.scenarios;
    expect(S.vacancyName).toContain("1 tháng");
    expect(S.expensesName).toContain("50%");
    expect(S.intro).toContain("không con số nào ở đây kèm xác suất");
    for (const claim of ["có thể sẽ", "dự báo rằng", "khả năng cao"]) {
      expect(
        [S.intro, S.hint, S.flipsNegativeNotice].join(" "),
        `scenario copy claims "${claim}"`,
      ).not.toContain(claim);
    }
  });

  it("quotes the threshold in the pure module's own docstring", () => {
    // lib/calc/rental-property.ts explains the same rule in its top docstring,
    // independently of the exported constant it sits above. Narrow the read
    // to that docstring (before the first `export`) for the same reason.
    const src = readFileSync("lib/calc/rental-property.ts", "utf8");
    const docstring = src.slice(0, src.indexOf("export "));
    expect(docstring).toContain(asPhrase);
  });
});
