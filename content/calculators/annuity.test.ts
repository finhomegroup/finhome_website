import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  formatDecimal,
  formatMoney,
  formatPercent,
  parseCount,
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";
import {
  computeAnnuity,
  type AnnuityInput,
  type AnnuityMode,
} from "@/lib/calc/annuity";
import { ANNUITY as C } from "@/content/calculators/annuity";

const D = C.form.defaults;

/** The component's own parse and wiring, reproduced — docs §6. */
function shippedInput(): AnnuityInput {
  const mode = D.mode as AnnuityMode;
  return {
    mode,
    premium: mode === "payment" ? parseMoney(D.premium)! : 0,
    desiredPayment: mode === "premium" ? parseMoney(D.desiredPayment)! : 0,
    paymentsPerYear: Number(D.frequency),
    years: parseCount(D.years)!,
    ratePercent: parseDecimal(D.rate)!,
    paymentAtStart: D.timing === "start",
    deferralYears: parseCount(D.deferral)!,
    taxRatePercent: parseDecimal(D.tax)!,
    quotedPayment: parseMoney(D.quoted)!,
  };
}

function run(over: Partial<AnnuityInput> = {}) {
  const result = computeAnnuity({ ...shippedInput(), ...over });
  if (!result) throw new Error("computeAnnuity returned null");
  return result;
}

const usd = (v: number) => formatMoney(v);
const usdCents = (v: number) => formatMoney(v, 2);

const HEADER_COMMENT = (() => {
  const file = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "annuity.ts",
  );
  const source = readFileSync(file, "utf8");
  return source.slice(0, source.indexOf("export const"));
})();

describe("nien-kim at its shipped defaults", () => {
  it("parses every default with the parser its field kind needs", () => {
    // "250.000" through parseDecimal is 250, and "4,5" through parseMoney
    // is 45 — both parsers are wrong for the other field.
    expect(shippedInput()).toEqual({
      mode: "payment",
      premium: 250_000,
      desiredPayment: 0,
      paymentsPerYear: 12,
      years: 20,
      ratePercent: 4.5,
      paymentAtStart: true,
      deferralYears: 0,
      taxRatePercent: 22,
      quotedPayment: 1_500,
    });
  });

  it("ships a quote, so the inversion is visible without typing anything", () => {
    const r = run();
    expect(r.quotedPayment).toBeGreaterThan(0);
    expect(r.quotedImpliedRatePercent).not.toBe(null);
  });

  it("quotes the payment and the payout rate", () => {
    const r = run();
    expect(usdCents(r.payment)).toBe("1.575,71");
    expect(usdCents(r.annualPayment)).toBe("18.908,57");
    expect(formatPercent(r.payoutRatePercent!, 2)).toBe("7,56%");
    expect(C.payoutRateNotice).toContain("18.908,57");
    expect(C.payoutRateNotice).toContain("7,56%");
    expect(C.lede).toContain("7,56%");
  });

  it("splits each payment into capital and interest", () => {
    const r = run();
    expect(usdCents(r.excludedPerPayment)).toBe("1.041,67");
    expect(usdCents(r.taxablePerPayment)).toBe("534,05");
    expect(formatPercent(r.exclusionRatioPercent!, 1)).toBe("66,1%");
    // The two parts add back to the whole payment.
    expect(r.excludedPerPayment + r.taxablePerPayment).toBeCloseTo(r.payment, 8);
    for (const figure of ["1.575,71", "1.041,67", "534,05"]) {
      expect(C.payoutRateNotice, `notice is missing ${figure}`).toContain(
        figure,
      );
    }
  });

  it("quotes the effective tax rate against the marginal one", () => {
    const r = run();
    expect(usdCents(r.taxPerPayment)).toBe("117,49");
    expect(usdCents(r.netPerPayment)).toBe("1.458,22");
    expect(formatPercent(r.effectiveTaxRatePercent!, 2)).toBe("7,46%");
    expect(r.effectiveTaxRatePercent!).toBeLessThan(22);
    expect(C.payoutRateNotice).toContain("7,46%");
    expect(C.payoutRateNotice).toContain("22%");
  });

  it("quotes the money-back point and the multiple", () => {
    const r = run();
    expect(formatDecimal(r.moneyBackYears!, 1)).toBe("13,2");
    expect(formatDecimal(r.payoutMultiple!, 2)).toBe("1,51");
    expect(usd(r.totalPaid)).toBe("378.171");
    expect(usd(r.interestEarned)).toBe("128.171");
    expect(C.payoutRateNotice).toContain("13,2");
    const a = C.faq.items[0].a;
    for (const figure of ["378.171", "250.000", "1,51"]) {
      expect(a, `FAQ 1 is missing ${figure}`).toContain(figure);
    }
  });

  it("inverts the shipped quote to a rate below the assumed one", () => {
    const r = run();
    expect(formatPercent(r.quotedImpliedRatePercent!, 2)).toBe("3,92%");
    expect(usdCents(r.quoteAdvantage!)).toBe("-75,71");
    expect(r.quotedImpliedRatePercent!).toBeLessThan(4.5);
    expect(C.faq.items[1].q).toContain("3,92%");
  });

  it("finds the quote that would match the assumed rate", () => {
    // The header records 1.581 as the break-even quote. Check it straddles.
    const below = run({ quotedPayment: 1_575 });
    const above = run({ quotedPayment: 1_581 });
    expect(below.quoteAdvantage!).toBeLessThan(0);
    expect(above.quoteAdvantage!).toBeGreaterThan(0);
    expect(formatPercent(above.quotedImpliedRatePercent!, 2)).toBe("4,54%");
  });

  it("recovers the assumed rate from its own payment", () => {
    // The check that makes the whole inversion trustworthy.
    const forward = run();
    const inverted = run({ quotedPayment: forward.payment });
    expect(inverted.quotedImpliedRatePercent!).toBeCloseTo(4.5, 6);
    expect(inverted.quoteAdvantage!).toBeCloseTo(0, 8);
  });

  it("quotes the deferred contract", () => {
    const r = run({ deferralYears: 10 });
    expect(usd(r.valueAtAnnuitisation)).toBe("391.748");
    expect(usdCents(r.payment)).toBe("2.469,13");
    expect(r.payment).toBeGreaterThan(run().payment);
    const a = C.faq.items[4].a;
    expect(a).toContain("391.748");
    expect(a).toContain("2.469,13");
    expect(a).toContain("1.575,71");
  });

  it("quotes the premium the other mode solves", () => {
    const r = run({
      mode: "premium",
      premium: 0,
      desiredPayment: parseMoney(D.desiredPayment)!,
    });
    expect(usd(r.premium)).toBe("317.316");
    // And the round trip holds: that premium buys that payment back.
    const back = run({ premium: r.premium });
    expect(back.payment).toBeCloseTo(2_000, 6);
  });

  it("quotes the end-of-period payment and the one period of interest", () => {
    const start = run();
    const end = run({ paymentAtStart: false });
    expect(usdCents(end.payment)).toBe("1.581,62");
    expect(end.payment / start.payment).toBeCloseTo(1 + 0.045 / 12, 10);
    const a = C.faq.items[3].a;
    for (const figure of ["1.575,71", "1.581,62", "0,375%"]) {
      expect(a, `FAQ 4 is missing ${figure}`).toContain(figure);
    }
  });

  it("pins the term table, and its falling payout rate", () => {
    const input = shippedInput();
    const terms = Array.from(new Set([10, 15, 20, 25, 30, input.years])).sort(
      (a, b) => a - b,
    );
    expect(terms).toEqual([10, 15, 20, 25, 30]);
    const payouts = terms.map((years) => run({ years }).payoutRatePercent!);
    // The claim the table intro makes: a shorter term LOOKS like a higher
    // yield, purely because it returns capital faster.
    for (let i = 1; i < payouts.length; i += 1) {
      expect(payouts[i]).toBeLessThan(payouts[i - 1]);
    }
    expect(usdCents(run({ years: 10 }).payment)).toBe("2.581,28");
    expect(usdCents(run({ years: 30 }).payment)).toBe("1.261,98");
  });

  it("says out loud that it does not price a life contract", () => {
    expect(C.formula.body[1]).toContain("suốt đời");
    expect(C.formula.body[1]).toContain("tỷ lệ tử vong");
    expect(C.form.yearsHelp).toContain("KỲ HẠN XÁC ĐỊNH");
    // And that the tax shelter is not permanent.
    expect(C.formula.body[5]).toContain("không kéo dài mãi");
    expect(C.faq.items[2].q).toContain("suốt đời");
  });

  it("records the bracket defect the long-term test caught", () => {
    // docs §8 defects 1 and 5, third recurrence. The prose says so, and the
    // behaviour it describes is asserted here.
    expect(C.formula.body[3]).toContain("480");
    const long = run({ years: 40, ratePercent: 6, quotedPayment: 0 });
    const inverted = run({
      years: 40,
      ratePercent: 6,
      quotedPayment: long.payment,
    });
    expect(inverted.totalPayments).toBe(480);
    expect(inverted.quotedImpliedRatePercent!).toBeCloseTo(6, 6);
  });
});

describe("nien-kim — provenance header", () => {
  it("records every figure the prose quotes", () => {
    const r = run();
    const deferred = run({ deferralYears: 10 });
    const premiumMode = run({
      mode: "premium",
      premium: 0,
      desiredPayment: parseMoney(D.desiredPayment)!,
    });
    const end = run({ paymentAtStart: false });
    for (const figure of [
      usdCents(r.payment),
      usdCents(r.annualPayment),
      usdCents(r.excludedPerPayment),
      usdCents(r.taxablePerPayment),
      usdCents(r.taxPerPayment),
      usdCents(r.netPerPayment),
      usd(r.totalPaid),
      usd(r.interestEarned),
      usd(r.premium),
      formatPercent(r.payoutRatePercent!, 2),
      formatPercent(r.exclusionRatioPercent!, 1),
      formatPercent(r.effectiveTaxRatePercent!, 2),
      formatDecimal(r.payoutMultiple!, 2),
      formatDecimal(r.moneyBackYears!, 1),
      formatPercent(r.quotedImpliedRatePercent!, 2),
      usd(deferred.valueAtAnnuitisation),
      usdCents(deferred.payment),
      usd(premiumMode.premium),
      usdCents(end.payment),
      usdCents(run({ years: 10 }).payment),
      usdCents(run({ years: 30 }).payment),
    ]) {
      expect(HEADER_COMMENT, `header comment is missing ${figure}`).toContain(
        figure,
      );
    }
  });
});
