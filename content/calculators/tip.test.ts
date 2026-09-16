import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";
import { formatMoney, parseCount, parseDecimal, parseMoney } from "@/lib/calc/number";
import { splitBill, type TipInput } from "@/lib/calc/tip";
import { TIP as C } from "@/content/calculators/tip";
import { nextStepsFor } from "@/content/calculators/next-steps";

/**
 * The module-at-shipped-defaults test docs §6 calls the highest-value
 * substitute for the coverage a green suite does not have. Original row 69.
 * This file did not exist before.
 *
 * Row 69 is the one P4 row the audit found needed NOTHING — its whole
 * requirement, "split VAT, service charge and tip apart", is already enforced
 * by the model rather than merely asserted in copy. That made it the one row
 * with no protection for the property it is cited for: `next-steps.ts`'s
 * header names this page as the cautionary example its sparse-by-default rule
 * exists to protect, and nothing checked that it stays that way. These are
 * property guards, not a reproduction of any defect.
 */

const F = C.form;

/** The component's own parse and wiring, reproduced — docs §6. */
function shippedInput(): TipInput {
  return {
    bill: parseMoney(F.defaultBill)!,
    servicePercent: parseDecimal(F.defaultService)!,
    taxPercent: parseDecimal(F.defaultTax)!,
    tipPercent: parseDecimal(F.defaultTip)!,
    // A whole count of people, no unit toggle: `parseCount`, per docs §4.
    people: parseCount(F.defaultPeople)!,
    roundTo: Number(F.defaultRound) || 0,
  };
}

function run(overrides: Partial<TipInput> = {}) {
  const result = splitBill({ ...shippedInput(), ...overrides });
  expect(result).not.toBeNull();
  return result!;
}

describe("tinh-tien-tip at its shipped defaults", () => {
  it("parses every default with the parser its field kind needs", () => {
    const input = shippedInput();
    expect(input.bill).toBe(1_000_000);
    expect(input.servicePercent).toBe(5);
    expect(input.taxPercent).toBe(8);
    expect(input.people).toBe(4);
  });

  it("rejects a grouped head count rather than reading it as one person", () => {
    expect(parseDecimal("1.000")).toBe(1);
    expect(parseCount("1.000")).toBeNull();
    expect(parseCount("4")).toBe(4);
    expect(parseCount("4,5")).toBeNull();
  });

  it("opens with no tip, because Vietnam has no tipping custom", () => {
    // The row's requirement, and the reason this page has no next-steps
    // block. A default of 15–20% would be a United States convention
    // presented as a Vietnamese bill.
    expect(F.defaultTip).toBe("0");
    expect(run().tip).toBe(0);
    expect(C.tippingNotice).toContain("mặc định tiền tip là 0");
    expect(C.tippingNotice).toContain("không có tập quán tip");
  });

  it("keeps the three charges apart in the model, not just in the copy", () => {
    // Three separate inputs, three separate outputs, and a cascade in the
    // documented order: service on the bill, VAT on bill + service, tip on
    // the bill and untaxed. Each is derived here rather than restated.
    const r = run();
    expect(r.service).toBeCloseTo(1_000_000 * 0.05, 6);
    expect(r.tax).toBeCloseTo((1_000_000 + r.service) * 0.08, 6);
    expect(r.total).toBeCloseTo(1_000_000 + r.service + r.tax + r.tip, 6);
    // Changing one charge moves only that charge and the total.
    const tipped = run({ tipPercent: 10 });
    expect(tipped.service).toBeCloseTo(r.service, 6);
    expect(tipped.tax).toBeCloseTo(r.tax, 6);
    expect(tipped.tip).toBeCloseTo(100_000, 6);
    // VAT is charged on the service charge, so raising service raises tax.
    const served = run({ servicePercent: 10 });
    expect(served.tax).toBeGreaterThan(r.tax);
    // And never on the tip: a tip change leaves tax alone, asserted above.
  });

  it("reproduces the cascade figure the prose quotes", () => {
    expect(formatMoney(run().total)).toBe("1.134.000");
    expect(C.formula.body[0]).toContain("1.134.000");
  });

  it("rounds each person's share, never the total", () => {
    // The prose's own worked example: 427.000 ₫ across three people rounded
    // up to 10.000 ₫ is 150.000 ₫ each, 450.000 ₫ paid, 23.000 ₫ over.
    const r = splitBill({
      bill: 427_000,
      servicePercent: 0,
      taxPercent: 0,
      tipPercent: 0,
      people: 3,
      roundTo: 10_000,
    })!;
    expect(r).not.toBeNull();
    expect(formatMoney(r.perPersonRounded)).toBe("150.000");
    expect(formatMoney(r.totalPaid)).toBe("450.000");
    expect(formatMoney(r.roundingExtra)).toBe("23.000");
    expect(r.totalPaid).toBe(r.perPersonRounded * 3);
    expect(C.formula.body[2]).toContain("23.000");
  });

  it("carries no next-steps block, which is the point of citing it", () => {
    // `next-steps.ts`'s header: the temptation the file guards against is a
    // home-buying funnel under a tip calculator. This row is the example.
    expect(nextStepsFor("tinh-tien-tip")).toBeUndefined();
  });
});

/**
 * THE PREFILLED 8 IS A LEGAL PARAMETER, AND IT HAS AN EXPIRY DATE.
 *
 * The help text used to read "Thường là 8% hoặc 10%", which names no
 * instrument and no date. Prefilling 8 rather than 10 is an implicit claim
 * that the 2-point reduction is in force, and a reader cannot decide whether
 * to override a default whose basis they cannot see.
 *
 * What is asserted here is the pairing, not the prose: the default, the rate
 * quoted in the help text, and the end date quoted in the help text and in
 * the sources note all have to say the same thing. The realistic failure is
 * not someone deleting the citation — it is the reduction lapsing on
 * 31/12/2026 while `defaultTax` still says 8 and the help text still calls it
 * current. `content/calculators/sources-wiring.test.ts` separately proves the
 * block reaches the page at all, which is the other half of the same worry.
 */
describe("tinh-tien-tip states the basis for the VAT it prefills", () => {
  const REDUCED_UNTIL = "31/12/2026";

  it("quotes the same rate in the help text that it prefills in the field", () => {
    expect(F.defaultTax).toBe("8");
    expect(
      F.taxHelp,
      "the help text no longer quotes the rate the field prefills",
    ).toContain(`${F.defaultTax}%`);
  });

  it("names the instruments behind both the reduced and the standard rate", () => {
    // The reduction and the law it reduces. Numbered instruments rather than
    // "theo quy định hiện hành", which is the phrasing this assertion exists
    // to prevent the page drifting back to.
    expect(F.taxHelp).toContain("174/2025/NĐ-CP");
    expect(F.taxHelp).toContain("204/2025/QH15");
    expect(F.taxHelp).toContain("48/2024/QH15");
    // And the standard rate, so a reader knows what the 8 is a discount from.
    expect(F.taxHelp).toContain("10%");
  });

  it("dates the reduction rather than presenting it as permanent", () => {
    expect(F.taxHelp).toContain(REDUCED_UNTIL);
    expect(C.sources.intro).toContain(REDUCED_UNTIL);
    // The FAQ answer for a reader whose bill says 10 has to agree with it.
    const mixed = C.faq.items.find((item) => item.q.includes("10%"));
    expect(mixed, "the two-rate FAQ entry is gone").toBeDefined();
    expect(mixed!.a).toContain(REDUCED_UNTIL);
  });

  it("says the single field cannot describe a two-rate bill", () => {
    // The tool takes ONE rate. A restaurant bill with beer on it legitimately
    // carries two, because special-consumption-taxed goods are outside the
    // reduction. Saying so is the difference between an approximation and a
    // wrong number, and the page has to own it in the field help — not only
    // in an FAQ a reader may never open.
    expect(F.taxHelp).toContain("một mức");
    expect(C.sources.intro).toContain("hai mức");
  });

  it("gives the reader links, with a stated provenance limit", () => {
    expect(C.sources.items.length).toBeGreaterThanOrEqual(2);
    for (const item of C.sources.items) {
      expect(item.url.startsWith("https://"), `${item.url} is not https`).toBe(
        true,
      );
      // A "Nguồn" heading over a bare URL is not a citation either.
      expect(item.label.length).toBeGreaterThan(20);
      expect(item.note, `${item.label} has no note`).toBeDefined();
    }
    // The limit the shell's docstring says belongs in `intro`: these were read
    // once, during a review, and not at the moment the reader opens the page.
    expect(C.sources.intro).toContain("rà soát");
    expect(C.sources.intro).toContain("không phải tư vấn thuế");
  });

  it("rejects a VAT rate above 100, which the field used to accept", () => {
    // Source-level, the way `business-forecast-calculator.test.ts` guards its
    // own parser choice: the predicate lives in the component and there is no
    // render harness in this suite.
    //
    // The bound applies to `tax` ALONE. `service` and `tip` are the payer's
    // discretionary amounts rather than statutory rates, so this asserts the
    // asymmetry is deliberate instead of leaving it to look like an oversight.
    const component = readFileSync(
      new URL("../../components/tip-calculator.tsx", import.meta.url),
      "utf8",
    );
    expect(component).toContain("tax === null || tax < 0 || tax > 100");
    expect(component).toContain("const tipInvalid = tip === null || tip < 0;");
    expect(F.taxInvalid).toContain("0 đến 100");
  });
});
