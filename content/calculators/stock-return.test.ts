import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";
import {
  formatDecimal,
  formatMoney,
  formatPercent,
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";
import {
  computeStockReturn,
  type StockReturnInput,
} from "@/lib/calc/stock-return";
import { STOCK_RETURN as C } from "@/content/calculators/stock-return";

/**
 * Row 38's content contracts. This file did not exist before.
 *
 * TWO THINGS ARE PINNED HERE AND THEY FAIL FOR DIFFERENT REASONS.
 *
 * 1. THE FIGURES IN THE PROSE ARE THE MODULE'S OWN. Every amount and percent
 *    quoted in `formula.body` and in `taxOnLossNotice` is derived here by
 *    running `computeStockReturn` on the shipped defaults, so a changed
 *    default or a changed engine turns the page's worked examples red instead
 *    of leaving them quietly wrong. Nothing in the suite checked that before.
 *
 * 2. THE TWO PREFILLED RATES ARE STATUTORY, AND BOTH WERE UNDATED. They were
 *    also both CORRECT — nothing here corrects a rate. What the copy lacked
 *    was an instrument, an effective date and a citation a reader can open:
 *    "hiện là 0,1% giá trị bán" and "hiện là 5%" name no law and no date, and
 *    a reader cannot judge a default whose basis is invisible. So the pairing
 *    is what is asserted: the field's default, the rate quoted in its help
 *    text, the instrument, and the 01/07/2026 effective date all have to say
 *    the same thing. `sources-wiring.test.ts` separately proves the citation
 *    block reaches the page at all.
 *
 * THE VACUITY TRAP THIS FILE AVOIDS, written down because a sibling row hit
 * it in the same session: `formatMoney(0)` is the string "0", and every
 * Vietnamese paragraph on this page contains a "0" somewhere — in "0,1%", in
 * "30.000", in a date. An assertion that copy "contains" a formatted zero
 * therefore passes without reading anything. `quotes()` below refuses a
 * figure that short, so a future default of 0 fails the guard rather than
 * satisfying it.
 */

const F = C.form;

/** The component's own parse and wiring, reproduced — docs §6. */
function shippedInput(): StockReturnInput {
  return {
    // `parseMoney` on the share count and all three prices, exactly as
    // `components/stock-return-calculator.tsx` does: the count is written
    // "10.000" with a thousands dot, which `parseDecimal` would read as 10.
    shares: parseMoney(F.defaultShares)!,
    buyPricePerShare: parseMoney(F.defaultBuy)!,
    sellPricePerShare: parseMoney(F.defaultSell)!,
    dividendPerShare: parseMoney(F.defaultDividend)!,
    // Rates and a term in years-with-a-fraction: `parseDecimal`, per docs §4.
    years: parseDecimal(F.defaultYears)!,
    brokerageFeePercent: parseDecimal(F.defaultFee)!,
    transferTaxPercent: parseDecimal(F.defaultTransferTax)!,
    dividendTaxPercent: parseDecimal(F.defaultDividendTax)!,
  };
}

function run(overrides: Partial<StockReturnInput> = {}) {
  const result = computeStockReturn({ ...shippedInput(), ...overrides });
  expect(result).not.toBeNull();
  return result!;
}

/**
 * A formatted figure the copy has to quote, refusing one too short to mean
 * anything. See the trap in this file's header: "0" is in every paragraph.
 */
function quotes(text: string, figure: string, where: string) {
  expect(
    figure.length,
    `${where}: "${figure}" is too short to assert — a formatted zero or ` +
      `single digit is contained in any Vietnamese sentence`,
  ).toBeGreaterThan(3);
  expect(text, `${where} no longer quotes ${figure}`).toContain(figure);
}

describe("loi-nhuan-co-phieu at its shipped defaults", () => {
  it("parses every default with the parser its field kind needs", () => {
    const input = shippedInput();
    expect(input.shares).toBe(10_000);
    expect(input.buyPricePerShare).toBe(30_000);
    expect(input.sellPricePerShare).toBe(36_000);
    expect(input.dividendPerShare).toBe(1_500);
    expect(input.years).toBe(2);
    expect(input.brokerageFeePercent).toBe(0.15);
    expect(input.transferTaxPercent).toBe(0.1);
    expect(input.dividendTaxPercent).toBe(5);
    // The 1000× grammar trap, on the two đồng-denominated fields whose
    // defaults are written with a thousands dot. Both would be off by 1000
    // under `parseDecimal`, which is docs §4's single most repeated defect.
    expect(parseDecimal(F.defaultShares)).toBe(10);
    expect(parseDecimal(F.defaultDividend)).not.toBe(1_500);
    // The rate fields are the other way round and the comma is why: "0,1"
    // reads the same either way, so the bug cannot hide in this direction.
    expect(parseMoney(F.defaultTransferTax)).toBe(0.1);
  });

  it("quotes its own buy-side arithmetic in the method", () => {
    const r = run();
    quotes(C.formula.body[0], formatMoney(r.grossCost), "formula.body[0]");
    quotes(C.formula.body[0], formatMoney(r.buyFee), "formula.body[0]");
    quotes(C.formula.body[0], formatMoney(r.totalCost), "formula.body[0]");
  });

  it("quotes its own sell-side and dividend arithmetic", () => {
    const r = run();
    quotes(C.formula.body[1], formatMoney(r.transferTax), "formula.body[1]");
    quotes(C.formula.body[1], formatMoney(r.netProceeds), "formula.body[1]");
    quotes(C.formula.body[2], formatMoney(r.grossDividends), "formula.body[2]");
    quotes(C.formula.body[2], formatMoney(r.netDividends), "formula.body[2]");
  });

  it("quotes the headline return, the frictionless one and the drag", () => {
    const r = run();
    quotes(C.formula.body[3], formatMoney(r.netProfit), "formula.body[3]");
    quotes(
      C.formula.body[3],
      formatPercent(r.returnPercent, 3),
      "formula.body[3]",
    );
    quotes(
      C.formula.body[3],
      formatPercent(r.grossReturnPercent, 3),
      "formula.body[3]",
    );
    quotes(
      C.formula.body[3],
      formatDecimal(r.dragPoints, 3),
      "formula.body[3]",
    );
  });

  it("quotes both break-even prices, with and without the dividend", () => {
    // The page's own point: the dividend is what puts break-even BELOW the
    // purchase price, and the more common case is the other one.
    const withDividend = run().breakEvenPricePerShare!;
    const without = run({ dividendPerShare: 0 }).breakEvenPricePerShare!;
    expect(withDividend).toBeLessThan(30_000);
    expect(without).toBeGreaterThan(30_000);
    quotes(C.formula.body[4], formatMoney(withDividend), "formula.body[4]");
    quotes(C.formula.body[4], formatMoney(without), "formula.body[4]");
  });

  it("quotes the taxed-on-a-loss example the notice is built on", () => {
    // 24.000 ₫ and no dividend: a 20% price fall, a deeper loss than 20%,
    // and transfer tax charged on a trade that made nothing.
    const loss = run({ sellPricePerShare: 24_000, dividendPerShare: 0 });
    expect(loss.taxedOnALoss).toBe(true);
    expect(loss.netProfit).toBeLessThan(0);
    // The notice writes the loss unsigned ("bạn lỗ 20,320%"), so the figure
    // is derived unsigned rather than asserted against a minus sign the copy
    // does not use.
    quotes(
      C.taxOnLossNotice,
      formatPercent(Math.abs(loss.returnPercent), 3),
      "taxOnLossNotice",
    );
    quotes(C.taxOnLossNotice, formatMoney(loss.transferTax), "taxOnLossNotice");
    quotes(
      C.taxOnLossNotice,
      formatMoney(loss.breakEvenPricePerShare!),
      "taxOnLossNotice",
    );
    // And the loss really is deeper than the price move.
    expect(Math.abs(loss.returnPercent)).toBeGreaterThan(20);
  });
});

/**
 * THE TWO PREFILLED RATES, AND WHAT THE PAGE OWES THE READER ABOUT THEM.
 *
 * The instrument numbers are asserted as strings because that is the claim:
 * a reader who wants to check the 0,1% has to be given a document number and
 * a date, and "theo quy định hiện hành" is exactly the phrasing these
 * assertions exist to stop the page drifting back to.
 */
describe("loi-nhuan-co-phieu states the basis for both rates it prefills", () => {
  const LAW = "109/2025/QH15";
  const DECREE = "253/2026/NĐ-CP";
  const IN_FORCE = "01/07/2026";

  it("quotes the same rates in the help texts that it prefills", () => {
    expect(F.defaultTransferTax).toBe("0,1");
    expect(F.defaultDividendTax).toBe("5");
    expect(
      F.transferTaxHelp,
      "the transfer-tax help no longer quotes the rate the field prefills",
    ).toContain(`${F.defaultTransferTax}%`);
    expect(
      F.dividendTaxHelp,
      "the dividend help no longer quotes the rate the field prefills",
    ).toContain(`${F.defaultDividendTax}%`);
  });

  it("names the instrument and the effective date on both fields", () => {
    for (const [where, help] of [
      ["transferTaxHelp", F.transferTaxHelp],
      ["dividendTaxHelp", F.dividendTaxHelp],
    ] as const) {
      expect(help, `${where} names no law`).toContain(LAW);
      expect(help, `${where} names no decree`).toContain(DECREE);
      expect(help, `${where} is undated`).toContain(IN_FORCE);
    }
    // The article, not just the number: the transfer rate is Điều 13 khoản 2
    // and the dividend rate is Điều 12 khoản 1 và khoản 2.
    expect(F.transferTaxHelp).toContain("Điều 13 khoản 2");
    expect(F.dividendTaxHelp).toContain("Điều 12 khoản 1 và khoản 2");
  });

  it("no longer asserts either rate in the bare present tense", () => {
    // The exact shape of the defect: "hiện là 0,1%", "hiện là 5%". Asserted
    // on the two help texts and on the first FAQ answer, which carried the
    // same phrasing.
    const dated = [
      F.transferTaxHelp,
      F.dividendTaxHelp,
      C.faq.items[0].a,
      C.lede,
      C.taxOnLossNotice,
      C.metaDescription,
    ];
    for (const text of dated)
      expect(text, `"hiện là" survives in: ${text.slice(0, 60)}…`).not.toContain(
        "hiện là",
      );
    // And the date and the law reached the reader-facing surfaces above the
    // fold too, not only the field help.
    expect(C.lede).toContain(IN_FORCE);
    expect(C.lede).toContain(LAW);
    expect(C.metaDescription).toContain(IN_FORCE);
    expect(C.taxOnLossNotice).toContain(IN_FORCE);
    expect(C.taxOnLossNotice).toContain("Điều 13 khoản 2");
  });

  it("says the transfer tax has no cost deduction, per transaction", () => {
    // The substance of Điều 13 khoản 2, and the reason a losing trade pays.
    for (const text of [F.transferTaxHelp, C.lede, C.taxOnLossNotice])
      expect(text).toContain("không được trừ giá vốn");
    expect(F.transferTaxHelp).toContain("từng lần");
    expect(C.faq.items[0].a).toContain("từng lần");
  });

  it("discloses the two-year fund exemption where the rate is typed", () => {
    // Điều 5 khoản 4 of the law: open-ended fund certificates held two years
    // or more are exempt, so the 0,1% does not apply to them at all. That
    // bears on the number in the box, which is why it is in the field help
    // and not only in the accordion.
    expect(F.transferTaxHelp).toContain("chứng chỉ quỹ mở");
    expect(F.transferTaxHelp).toContain("2 năm");
    expect(F.transferTaxHelp).toContain("miễn thuế");
    const answer = C.faq.items[0].a;
    expect(answer).toContain("Điều 5 khoản 4");
    expect(answer).toContain("Điều 43");
    // The holding rule and the transitional point, in the fuller answer.
    expect(answer).toContain("vào trước ra trước");
    expect(answer).toContain(`trước ${IN_FORCE}`);
  });

  it("declines derivatives instead of implying it prices them", () => {
    // Same 0,1%, different base — a formula the decree delegates to a
    // circular this project did not read. The page says so in the field
    // help, in the FAQ and in the sources intro.
    expect(F.transferTaxHelp).toContain("phái sinh");
    expect(C.faq.items[0].a).toContain("Điều 54 khoản 5");
    expect(C.faq.items[0].a).toContain("Bộ Tài chính");
    expect(C.sources.intro).toContain("phái sinh");
  });

  it("says a single flat 5% is wrong for a holder paid in shares", () => {
    const shareDividend = C.faq.items.find((item) =>
      item.q.includes("Cổ tức bằng cổ phiếu"),
    );
    expect(shareDividend, "the stock-dividend FAQ entry is gone").toBeDefined();
    const a = shareDividend!.a;
    // Not taxed at receipt, then taxed TWICE on disposal: 5% investment
    // income on the dividend value PLUS 0,1% on the sale value.
    expect(a).toContain("không bị tính thuế lúc nhận");
    expect(a).toContain("hai lần");
    expect(a).toContain("mệnh giá");
    expect(a).toContain("Điều 52 khoản 4");
    expect(a).toContain("Điều 55 khoản 2 và khoản 4");
    // THE CORRECTED CLAIM, pinned both ways. The answer used to say the
    // stock-dividend tax "nằm trong phần thuế chuyển nhượng" — one charge,
    // already counted. It is a SECOND charge on top, so the old sentence
    // understated the bill for exactly the readers it addressed.
    expect(
      a,
      "the answer is back to folding the deferred 5% into the transfer tax",
    ).not.toContain("nằm trong phần thuế chuyển nhượng");
    expect(a).toContain("cộng thêm");
    // And the field a reader types into warns them before they trust it.
    expect(F.dividendTaxHelp).toContain("chỉ dành cho cổ tức tiền mặt");
  });

  it("says the 5% is not mechanical, and names the exemptions", () => {
    const exempt = C.faq.items.find((item) => item.q.includes("không chịu 5%"));
    expect(exempt, "the dividend-exemption FAQ entry is gone").toBeDefined();
    const a = exempt!.a;
    // Điều 4 khoản 19 (startups), khoản 16 (green bonds), khoản 4 (agri
    // co-op members and contract farmers) — none of which had an equivalent
    // in the repealed 2007 regime.
    expect(a).toContain("Điều 4 khoản 19");
    expect(a).toContain("Điều 4 khoản 16");
    expect(a).toContain("Điều 4 khoản 4");
    expect(a).toContain("khởi nghiệp sáng tạo");
    expect(a).toContain("trái phiếu xanh");
    expect(a).toContain("hợp tác xã nông nghiệp");
    expect(a).toContain("Điều 37 khoản 1");
    // The actionable half, which is why the field help points here.
    expect(a).toContain("đặt ô thuế cổ tức về 0");
    expect(F.dividendTaxHelp).toContain("hợp tác xã nông nghiệp");
  });

  it("withheld at source, by a party the reader is told about", () => {
    expect(F.dividendTaxHelp).toContain("khấu trừ tại nguồn");
    expect(F.dividendTaxHelp).toContain("Điều 55 khoản 1");
    // Who files the transfer tax, which is not the reader.
    expect(C.faq.items[0].a).toContain("ngân hàng lưu ký");
    expect(C.faq.items[0].a).toContain("Điều 56");
  });

  it("gives the reader links, with the provenance limit on the list", () => {
    expect(C.sources.items.length).toBeGreaterThanOrEqual(3);
    for (const item of C.sources.items) {
      expect(item.url.startsWith("https://"), `${item.url} is not https`).toBe(
        true,
      );
      // A "Nguồn" heading over a bare URL is not a citation either.
      expect(item.label.length).toBeGreaterThan(20);
      expect(item.note, `${item.label} has no note`).toBeDefined();
    }
    // Both instruments are actually reachable, not just named in prose.
    const urls = C.sources.items.map((item) => item.url).join(" ");
    expect(urls).toContain("congbao");
    expect(urls).toContain("253m-ndcp");
    // The limit the shell's docstring says belongs in `intro`: read once in a
    // review, not at the moment the page is opened, and not tax advice.
    expect(C.sources.intro).toContain("rà soát");
    expect(C.sources.intro).toContain("không phải tư vấn thuế");
  });

  it("states the decree's weaker provenance rather than levelling the two", () => {
    // THE ASYMMETRY IS THE POINT. The law was read from its Công báo typeset
    // copy; the decree's only locatable signed copy is an image scan with no
    // text layer, so its articles were established by character recognition.
    // A source list that presented both as equally verified would claim a
    // completeness this page has not earned — and nowhere in the copy is the
    // decree quoted verbatim, which is the operative consequence.
    expect(C.sources.intro).toContain("bản chụp");
    expect(C.sources.intro).toContain("nhận dạng ký tự");
    expect(C.sources.intro).toContain("không trích nguyên văn");
    const decree = C.sources.items.find((item) => item.label.includes(DECREE));
    expect(decree, "the decree left the source list").toBeDefined();
    expect(decree!.note).toContain("nhận dạng ký tự");
    expect(decree!.label).toContain("bản chụp");
    // The law's own entry carries the repeal, so a reader is not left
    // checking the 2007 law by mistake.
    const law = C.sources.items.find((item) =>
      item.note?.includes("04/2007/QH12"),
    );
    expect(law, "the repeal of the 2007 law is not recorded").toBeDefined();
    expect(law!.note).toContain("Điều 29 khoản 1");
  });

  it("keeps both tax fields at 0 or more and under 100", () => {
    // Source-level, the way `tip.test.ts` guards its own bound: the
    // predicate lives in the component and there is no render harness here.
    //
    // VERIFIED AS DELIBERATE, NOT CHANGED. The strict `< 100` matches all
    // three rate fields, matches each field's own error message, and is what
    // leaves `noBreakEvenNotice` reachable only through a COMBINATION of
    // rates reaching 100% of the sale — which is the case that notice
    // describes. A single rate at exactly 100 would make the sale retain
    // nothing on its own, and the engine refuses it too
    // (`lib/calc/stock-return.ts` returns null at `>= 100`), so accepting it
    // in the field would show a blank result with no error.
    const component = readFileSync(
      new URL("../../components/stock-return-calculator.tsx", import.meta.url),
      "utf8",
    );
    expect(component).toContain(
      "transferTax === null || transferTax < 0 || transferTax >= 100",
    );
    expect(component).toContain(
      "dividendTax === null || dividendTax < 0 || dividendTax >= 100",
    );
    expect(F.transferTaxInvalid).toContain("0 đến dưới 100");
    expect(F.dividendTaxInvalid).toContain("0 đến dưới 100");
    // The engine agrees with the form, in both directions.
    expect(computeStockReturn({ ...shippedInput(), transferTaxPercent: 100 }))
      .toBeNull();
    expect(computeStockReturn({ ...shippedInput(), dividendTaxPercent: 100 }))
      .toBeNull();
    expect(run({ transferTaxPercent: 99.9 })).not.toBeNull();
  });

  it("makes the exempt-fund instruction do what the copy says", () => {
    // The field help tells a holder of two-year fund units to enter 0. That
    // is only honest if the model then charges nothing — so the instruction
    // is checked against the engine rather than left as prose.
    const loss = run({ sellPricePerShare: 24_000, dividendPerShare: 0 });
    const exempt = run({
      sellPricePerShare: 24_000,
      dividendPerShare: 0,
      transferTaxPercent: 0,
    });
    expect(exempt.transferTax).toBe(0);
    expect(exempt.taxedOnALoss).toBe(false);
    expect(exempt.netProfit - loss.netProfit).toBeCloseTo(loss.transferTax, 6);
    expect(loss.transferTax).toBeGreaterThan(0);
  });
});
