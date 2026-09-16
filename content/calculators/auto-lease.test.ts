import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  CATEGORY_LABELS,
  calculatorPath,
  getCalculator,
} from "@/content/calculators/registry";
import { dispositionFor } from "@/content/calculators/plan-disposition";
import { matchesQuery, type SearchableTool } from "@/lib/calc/tool-search";
import { nextStepsFor } from "@/content/calculators/next-steps";
import {
  formatDecimal,
  formatMoney,
  formatPercent,
  parseCount,
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";
import { computeAutoLease, type AutoLeaseInput } from "@/lib/calc/auto-lease";
import { computeAutoLoan } from "@/lib/calc/auto-loan";
import { AUTO_LEASE as C } from "@/content/calculators/auto-lease";

/**
 * The module-at-shipped-defaults test docs §6 calls the highest-value
 * substitute for the coverage a green suite does not have: three of the
 * 2026-09-09 audit's five worst defects lived in a component or a default
 * input rather than in a module, so `lib/calc/auto-lease.test.ts` passing
 * proves nothing about what this page actually renders.
 *
 * Original row 32. This file did not exist before; 27 of the 36 P4 rows had
 * none.
 */

const F = C.form;

/** Repo root, for the two checks that can only be made by reading source. */
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");

/** The component's own parse and wiring, reproduced — docs §6. */
function shippedInput(): AutoLeaseInput {
  return {
    price: parseMoney(F.defaultPrice)!,
    downPayment: parseMoney(F.defaultDown)!,
    tradeIn: parseMoney(F.defaultTradeIn)!,
    capitalisedFees: parseMoney(F.defaultFees)!,
    residualValue: parseMoney(F.defaultResidual)!,
    // A whole count of months: `parseCount`, per docs §4. The component used
    // `parseDecimal` with an `Number.isInteger` guard behind it, which is the
    // arrangement `parseCount`'s own docstring calls out — `parseDecimal`
    // reads "1.000" as 1, so a grouped term silently became a one-month
    // lease with no field marked invalid.
    termMonths: parseCount(F.defaultTerm)!,
    annualRatePercent: parseDecimal(F.defaultRate)!,
    taxPercent: parseDecimal(F.defaultTax)!,
  };
}

function run(overrides: Partial<AutoLeaseInput> = {}) {
  const result = computeAutoLease({ ...shippedInput(), ...overrides });
  expect(result).not.toBeNull();
  return result!;
}

const dong = (value: number) => `${formatMoney(value)} ₫`;

describe("thue-mua-xe at its shipped defaults", () => {
  it("parses every default with the parser its field kind needs", () => {
    expect(shippedInput()).toEqual({
      price: 800_000_000,
      downPayment: 100_000_000,
      tradeIn: 0,
      capitalisedFees: 0,
      residualValue: 440_000_000,
      termMonths: 36,
      annualRatePercent: 9,
      // 0, and that is a legal conclusion rather than a convenience: a genuine
      // cho thuê tài chính is dịch vụ cấp tín dụng and therefore không chịu
      // thuế GTGT (Điều 5 khoản 9 điểm a Luật 48/2024/QH15). The field shipped
      // 10 for a whole unit. See the VAT describe block below.
      taxPercent: 0,
    });
  });

  it("rejects a grouped term rather than reading it as one month", () => {
    // The defect `parseCount` exists to make reachable. `parseDecimal("1.000")`
    // is 1, and 1 is an integer, so the field's own "số nguyên" error never
    // fired and the page priced a one-month lease.
    expect(parseDecimal("1.000")).toBe(1);
    expect(parseCount("1.000")).toBeNull();
    // And it still accepts what the help text tells the reader to type.
    for (const ok of ["24", "36", "48"]) {
      expect(parseCount(ok)).toBe(Number(ok));
    }
    expect(parseCount("36,5")).toBeNull();
  });

  it("reproduces every figure the provenance header records", () => {
    // The header at the top of `auto-lease.ts` records the module's output
    // for these defaults. If a default moves, this is what goes red instead
    // of the prose quietly going stale.
    const r = run();
    expect(dong(r.capitalisedCost)).toBe("700.000.000 ₫");
    expect(dong(r.depreciationCharge)).toBe("7.222.222 ₫");
    expect(dong(r.financeCharge)).toBe("4.275.000 ₫");
    expect(dong(r.monthlyPaymentBeforeTax)).toBe("11.497.222 ₫");
    // No rate on the rental, so the payment IS the pre-tax payment.
    expect(dong(r.monthlyTax)).toBe("0 ₫");
    expect(dong(r.monthlyPayment)).toBe("11.497.222 ₫");
    expect(dong(r.totalOfPayments)).toBe("413.900.000 ₫");
    expect(dong(r.totalCost)).toBe("513.900.000 ₫");
    // And the one figure the copy quotes for the taxable-lease branch, at the
    // 8% Nghị định 174/2025/NĐ-CP Điều 2 khoản 1 runs to 31/12/2026.
    const taxable = run({ taxPercent: 8 });
    expect(dong(taxable.monthlyTax)).toBe("919.778 ₫");
    expect(dong(taxable.monthlyPayment)).toBe("12.417.000 ₫");
  });

  it("quotes those figures in the copy, so the page cannot drift from the model", () => {
    const r = run();
    const copy = [
      C.contextNotice,
      C.contextDetail,
      ...C.formula.body,
      ...C.faq.items.map((item) => item.a),
    ].join(" ");
    for (const figure of [
      formatMoney(r.monthlyPayment),
      formatMoney(r.monthlyPaymentBeforeTax),
      formatMoney(r.depreciationCharge),
      formatMoney(r.financeCharge),
      formatMoney(r.totalCost),
      // The taxable-lease branch's payment and its tax, both quoted in
      // `formula.body`. `monthlyTax` at the shipped rate is deliberately NOT
      // in this list: `formatMoney(0)` is "0", so asserting the copy contains
      // it passes on any prose at all — a vacuous check, and this page's whole
      // correction is about the zero being MEANT.
      formatMoney(run({ taxPercent: 8 }).monthlyPayment),
      formatMoney(run({ taxPercent: 8 }).monthlyTax),
    ]) {
      expect(copy, `copy no longer quotes ${figure}`).toContain(figure);
    }
  });

  it("quotes the loan side from the loan module, not from memory", () => {
    // `contextDetail` and FAQ item 1 put the lease payment beside a loan
    // payment on the SAME car, and those two figures were prose nobody pinned.
    // They survived the VAT correction unchanged, which is exactly when an
    // unpinned figure rots: the lease side moved and the loan side did not.
    const loan = computeAutoLoan({
      price: 800_000_000,
      downPayment: 100_000_000,
      tradeIn: 0,
      annualRatePercent: 9,
      termMonths: 36,
    });
    expect(loan).not.toBeNull();
    expect(loan!.amountFinanced).toBe(700_000_000);
    expect(dong(loan!.loan.monthlyPrincipalInterest)).toBe("22.259.813 ₫");
    expect(C.contextDetail).toContain(
      formatMoney(loan!.loan.monthlyPrincipalInterest),
    );
    // FAQ item 1 quotes the loan's whole cost INCLUDING the deposit, which
    // never entered the loan — the same "add the cash back" convention
    // `totalCost` uses on the lease side.
    const loanWithDeposit = loan!.loan.totalPayment + 100_000_000;
    expect(dong(loanWithDeposit)).toBe("901.353.263 ₫");
    expect(C.faq.items[0].a).toContain(formatMoney(loanWithDeposit));
    // And the lease side of that same comparison, at the shipped rate.
    expect(C.faq.items[0].a).toContain(formatMoney(run().totalCost));
    expect(C.contextDetail).toContain(formatMoney(run().monthlyPayment));
  });

  it("no longer quotes the figures the false 10% produced", () => {
    // The anti-regression half, and the reason it is worth writing: the
    // sentence "VAT được tính trên khoản trả này, không trên giá xe: 10% là
    // 1.149.722 ₫" was false under every branch of the law, and a page that
    // still carries its arithmetic has not been corrected.
    const copy = [
      C.lede,
      C.contextNotice,
      C.contextDetail,
      ...C.formula.body,
      ...C.faq.items.map((item) => item.a),
      ...Object.values(F).filter((v) => typeof v === "string"),
    ].join(" ");
    // Vacuity control first: the sweep can see a figure that IS there.
    expect(copy).toContain("11.497.222");
    for (const stale of ["1.149.722", "12.646.944", "455.290.000", "555.290.000"]) {
      expect(copy, `copy still quotes the 10% figure ${stale}`).not.toContain(
        stale,
      );
    }
  });

  it("keeps the money factor and the residual share the copy explains", () => {
    const r = run();
    // moneyFactor = annualRatePercent / 2400, which the prose states.
    expect(r.moneyFactor).toBeCloseTo(9 / 2400, 12);
    expect(formatDecimal(r.moneyFactor, 5)).toBe("0,00375");
    expect(formatPercent(r.residualPercent, 0)).toBe("55%");
    expect(C.formula.body[2]).toContain("0,00375");
    expect(C.formula.body[3]).toContain("2400");
  });

  it("holds the ledger together: payments, depreciation and finance charge", () => {
    const r = run();
    // Every đồng of the pre-tax payment is one of the two charges, and the
    // term totals are those charges times the term. A lease has no declining
    // balance, which is exactly why this identity is this simple — and why
    // stating it is worth doing: the page's whole lesson is that the finance
    // charge does NOT fall over time.
    expect(r.depreciationCharge + r.financeCharge).toBeCloseTo(
      r.monthlyPaymentBeforeTax,
      6,
    );
    expect(r.totalDepreciation).toBeCloseTo(r.depreciationCharge * 36, 6);
    expect(r.totalFinanceCharge).toBeCloseTo(r.financeCharge * 36, 6);
    expect(r.monthlyPaymentBeforeTax + r.monthlyTax).toBeCloseTo(
      r.monthlyPayment,
      6,
    );
    expect(r.totalOfPayments).toBeCloseTo(r.monthlyPayment * 36, 6);
    // Total cost adds back the cash that never entered the contract.
    expect(r.totalCost).toBeCloseTo(r.totalOfPayments + 100_000_000, 6);
    // And the two charges move in OPPOSITE directions with the residual,
    // which is the experiment the copy prescribes.
    const higher = run({ residualValue: 500_000_000 });
    expect(higher.depreciationCharge).toBeLessThan(r.depreciationCharge);
    expect(higher.financeCharge).toBeGreaterThan(r.financeCharge);
  });
});

describe("thue-mua-xe — the two things the page must say before a figure", () => {
  it("puts the unmodelled end-of-contract fees in the VISIBLE notice", () => {
    // These were FAQ item 4 only — inside the collapsed accordion — while the
    // notice above the calculator was spent on the loan comparison. Per-km
    // overage and excess-damage charges are the two fees that actually bite,
    // and a reader who reads `totalCost` without knowing they are missing has
    // been given a number that is short by an unknown amount.
    expect(C.contextNotice).toContain("vượt số km");
    expect(C.contextNotice).toContain("hư hỏng");
    expect(C.contextNotice).toContain("không tính");
    // Still answered in depth in the FAQ; promoted, not moved.
    expect(C.faq.items.some((item) => item.q.includes("km"))).toBe(true);
  });

  it("names the decree in the reader's copy, not only in a code comment", () => {
    // `Nghị định 39/2014` was in the module docstring and nowhere a reader
    // could see it, while the notice made the claim the decree is the basis
    // for — that finance leasing here is a licensed activity aimed at
    // businesses.
    expect(C.contextNotice).toContain("39/2014");
    expect(C.contextNotice).toContain("giấy phép");
  });

  it("qualifies the ownership claim by contract type instead of flatly", () => {
    // The contradiction an audit flagged: the notice said you do not own the
    // car at expiry, full stop, while FAQ item 5 says many Vietnamese
    // finance-lease contracts transfer ownership. Both cannot be unqualified.
    // The notice no longer makes the flat claim; the detail slot states that
    // it depends on the contract, and names both shapes.
    expect(C.contextNotice).not.toContain("KHÔNG sở hữu");
    expect(C.contextDetail).toContain("tùy hợp đồng");
    expect(C.contextDetail).toContain("chuyển quyền sở hữu");
    // And the FAQ's answer still agrees with it.
    const ownership = C.faq.items.find((item) => item.q.includes("mua lại"));
    expect(ownership).toBeDefined();
    expect(ownership!.a).toContain("Tùy hợp đồng");
  });

  it("keeps the visible notice short enough to stay above the form", () => {
    // docs §3: a long notice pushed the form off the first screens on a
    // phone, which is why `noticeDetail` exists. The detail may be long.
    expect(C.contextNotice.length).toBeLessThan(420);
    expect(C.contextDetailTitle.length).toBeGreaterThan(10);
  });

  it("links the vehicle comparison, not the home journey", () => {
    // Row 32's own `next` requirement is a vehicle comparison. It cannot go
    // through `TOOL_NEXT_STEPS`: `next-steps.test.ts` forbids an entry on any
    // library-shelved row and this one is `tien-ich`, and it also requires
    // every destination to be P1 or P2 while `vay-mua-xe` is P3. So the link
    // is an in-content href, resolved through the REGISTRY rather than
    // written out — the same `relatedTool` shape rows 46/47 use — so a slug
    // that stops being a live route fails the build instead of shipping a
    // dead link this page told the reader to follow.
    expect(C.relatedTool.slug).toBe("vay-mua-xe");
    expect(calculatorPath(C.relatedTool.slug)).toBe("/cong-cu/vay-mua-xe");
    const entry = getCalculator(C.relatedTool.slug);
    expect(entry, "relatedTool is not in the registry").toBeDefined();
    expect(entry!.status).toBe("live");
    expect(C.relatedTool.why.trim().length).toBeGreaterThan(20);
    // Not the home journey: this page must not push a mortgage funnel.
    expect(nextStepsFor("thue-mua-xe")).toBeUndefined();
    // And the route actually renders it — the "entry but no slot" failure
    // `next-steps.test.ts` exists for, which this mechanism does not inherit.
    const page = readFileSync(
      path.join(ROOT, "app/cong-cu/thue-mua-xe/page.tsx"),
      "utf8",
    );
    expect(page, "the route never uses relatedTool").toContain("relatedTool");
  });

  it("quotes no unverified fee or population range", () => {
    // docs §7's standing rule, and the specific tokens `loan.test.ts` and
    // `affordability.test.ts` already sweep for.
    const copy = [
      C.lede,
      C.contextNotice,
      C.contextDetail,
      ...C.formula.body,
      ...C.faq.items.map((item) => item.a),
      // No `v is string` predicate here. `F` is `as const`, so
      // `Object.values(F)` is a union of string LITERALS, and a predicate
      // widening that to `string` is what TS2677 rejects — while the bare
      // `typeof` check narrows correctly on its own, so the predicate was
      // never earning anything.
      ...Object.values(F).filter((v) => typeof v === "string"),
    ].join(" ");
    for (const range of ["1–3%", "1-3%", "35–40", "45–55", "70–80"]) {
      expect(copy, `copy quotes the range ${range}`).not.toContain(range);
    }
  });
});

/**
 * The VAT correction, which is a LEGAL defect rather than an arithmetic one.
 *
 * The page's own notice says it models cho thuê tài chính. A genuine finance
 * lease by a licensed finance-leasing company is dịch vụ cấp tín dụng and
 * therefore a non-taxable object — không chịu thuế GTGT — under Điều 5 khoản 9
 * điểm a Luật Thuế giá trị gia tăng số 48/2024/QH15, repeated verbatim at
 * Nghị định 181/2025/NĐ-CP Điều 4 khoản 4 điểm a. So there is no rate on the
 * rental, on either half of it, and the field's prefilled 10% was wrong.
 *
 * Two things this block exists to keep apart, because "default 0" is one
 * sentence away from the opposite error:
 *
 * 1. The lease invoice is NOT VAT-free. The lessor passes the leased asset's
 *    INPUT VAT through to the lessee and the invoice's tax-rate field carries
 *    the symbol CTTC rather than a percentage — Nghị định 254/2026/NĐ-CP Điều
 *    6 khoản 3 điểm g. The tool does not model that, so the page has to say so
 *    rather than let a 0 ₫ row imply no tax exists.
 * 2. The field is still a rate the reader can type, because an ordinary
 *    taxable asset lease is taxed on the whole contractual rent (Điều 7 khoản
 *    1 điểm d) at 8% until 31/12/2026 (Nghị quyết 204/2025/QH15, Nghị định
 *    174/2025/NĐ-CP Điều 2 khoản 1). A default of 0 that silently stopped
 *    applying a typed rate would be a second defect wearing the fix's clothes.
 */
describe("thue-mua-xe — the VAT treatment of a finance lease", () => {
  it("ships 0 as the rate on the rental, and says why in the field's help", () => {
    expect(F.defaultTax).toBe("0");
    expect(parseDecimal(F.defaultTax)).toBe(0);
    // The basis, not just the number: a bare 0 is indistinguishable from a
    // forgotten field.
    expect(F.taxHelp).toContain("không chịu thuế GTGT");
    expect(F.taxHelp).toContain("dịch vụ cấp tín dụng");
    expect(F.taxHelp).toContain("48/2024/QH15");
    expect(F.taxHelp).toContain("Điều 5 khoản 9 điểm a");
  });

  it("applies no tax at that default, so the payment is the rent itself", () => {
    const r = run();
    expect(r.monthlyTax).toBe(0);
    expect(r.monthlyPayment).toBe(r.monthlyPaymentBeforeTax);
    // The result label must not promise a tax the default does not charge.
    // "đã gồm VAT" on a 0% default was the shipped version of that promise.
    expect(F.monthlyLabel).not.toContain("đã gồm VAT");
  });

  it("still applies a rate the reader types, at the 8% a taxable lease pays", () => {
    // The guard against "default 0" decaying into "VAT was removed". The field
    // is editable on purpose: a reader pricing cho thuê tài sản thông thường
    // types 8, and the base is the WHOLE rent — Điều 7 khoản 1 điểm d.
    const zero = run();
    const taxable = run({ taxPercent: 8 });
    expect(taxable.monthlyTax).toBeCloseTo(
      taxable.monthlyPaymentBeforeTax * 0.08,
      6,
    );
    expect(taxable.monthlyPayment).toBeGreaterThan(zero.monthlyPayment);
    expect(dong(taxable.monthlyPayment)).toBe("12.417.000 ₫");
    // The rent the rate applies to is depreciation AND finance charge, with no
    // funding component stripped out — the base Điều 7 khoản 1 điểm đ would
    // allow for an installment SALE and does not allow for a lease.
    expect(taxable.monthlyPaymentBeforeTax).toBeCloseTo(
      taxable.depreciationCharge + taxable.financeCharge,
      6,
    );
    // And the copy tells the reader to type it, with the date it expires.
    expect(F.taxHelp).toContain("8%");
    expect(F.taxHelp).toContain("31/12/2026");
    expect(F.taxHelp).toContain("01/01/2027");
    expect(F.taxHelp).toContain("10%");
  });

  it("discloses the CTTC pass-through it does not model", () => {
    // The invoice is not VAT-free even though the rental carries no rate, and
    // a 0 ₫ row on the page would otherwise say it was.
    for (const text of [F.taxHelp, C.formula.body[4]]) {
      expect(text).toContain("CTTC");
      expect(text).toContain("đầu vào");
    }
    expect(F.taxHelp).toContain("254/2026/NĐ-CP");
    expect(F.taxHelp).toContain("không mô phỏng");
    expect(C.sources.intro).toContain("không mô phỏng");
  });

  it("bounds the typed rate at both ends, and says the real range", () => {
    // `business-forecast-calculator.tsx` bounds its tax field at 100 and this
    // one did not, so a typed 800 was a valid rate. Read from source because
    // the predicate lives in a component, which no engine test can see — docs
    // §6, and the same reason `count-fields.test.ts` reads components.
    const component = readFileSync(
      path.join(ROOT, "components/auto-lease-calculator.tsx"),
      "utf8",
    );
    const predicate = /const taxInvalid =([^;]*);/.exec(component);
    expect(predicate, "taxInvalid predicate not found").not.toBeNull();
    expect(predicate![1]).toContain("tax < 0");
    expect(predicate![1], "no upper bound on the tax field").toContain(
      "tax > 100",
    );
    expect(F.taxInvalid).toContain("0 đến 100");
  });
});

describe("thue-mua-xe's citations", () => {
  it("gives every source a real, openable https url", () => {
    // The point of the slot: a reader can open it. A `sources` block whose
    // items carry an empty or relative url is a "Nguồn" heading over nothing,
    // which docs §3 says is worse than no heading.
    expect(C.sources.items.length).toBeGreaterThanOrEqual(1);
    for (const item of C.sources.items) {
      expect(item.url.startsWith("https://")).toBe(true);
      expect(item.url.trim().length).toBeGreaterThan(10);
      expect(item.label.trim().length).toBeGreaterThan(10);
      expect((item.note ?? "").trim().length).toBeGreaterThan(20);
    }
    // And the route renders it, the "content but no slot" failure that would
    // otherwise leave every citation invisible.
    const page = readFileSync(
      path.join(ROOT, "app/cong-cu/thue-mua-xe/page.tsx"),
      "utf8",
    );
    expect(page, "the route never passes sources").toContain("sources={C.sources}");
  });

  it("cites each instrument the tax copy leans on, by number", () => {
    const notes = C.sources.items
      .map((i) => `${i.label} ${i.note ?? ""}`)
      .join(" ");
    for (const instrument of [
      "48/2024/QH15", // the non-taxable object, and the taxable-lease base
      "181/2025/NĐ-CP", // repeats the first verbatim
      "204/2025/QH15", // the 2-point reduction
      "174/2025/NĐ-CP", // and the decree that runs it
      "254/2026/NĐ-CP", // the CTTC invoice rule
    ]) {
      expect(notes, `no source note cites ${instrument}`).toContain(instrument);
    }
    // The expiry is a fact with a date, and no prediction sits beside it.
    expect(notes).toContain("31/12/2026");
    expect(notes).toContain("01/01/2027");
  });

  it("states the provenance limit rather than implying completeness", () => {
    // docs §3: `intro` is where the limit goes. The limits that matter here
    // are that nothing was looked up live, that this is not tax advice, and
    // that the money the tool leaves out is the CTTC pass-through.
    const intro = C.sources.intro;
    expect(intro).toContain("rà soát nguồn của dự án");
    expect(intro).toContain("không phải tư vấn thuế");
    expect(intro).toContain("không phải danh sách đầy đủ");
    expect(intro).toContain("CTTC");
  });
});

/**
 * WHAT THIS PRODUCT IS CALLED, and why the name is a correctness guard rather
 * than a style preference.
 *
 * The row shipped as "Tính thuê mua xe" through an entire audit, and NOTHING
 * in the suite pinned it — the title, the registry entry, the category label
 * and the disposition question were all unprotected strings, which is how the
 * word survived being read many times.
 *
 * "Thuê mua" asserts the thing this page's own disclosure denies. `contextDetail`
 * says ownership is "tùy hợp đồng" and that the lessee ends with the car only
 * if the contract allows a buy-out and they pay it, so the "mua" half is a
 * contract option rather than part of the product. The word is correct in
 * housing law — khoản 22 Điều 2 Luật Nhà ở số 27/2023/QH15 defines `thuê mua
 * nhà ở` as paying a share up front, the rest as monthly rent, and taking
 * ownership once the term ends and the balance is paid, which genuinely is
 * rent-then-own. For a vehicle, Nghị định 39/2014/NĐ-CP calls the activity
 * `cho thuê tài chính`, and that is also the term in Điều 5 khoản 9 điểm a of
 * Luật Thuế GTGT 48/2024/QH15 — the article this page's VAT copy rests on. The
 * title was naming the product one way while its own legal basis named it
 * another.
 *
 * The SLUG deliberately still says `thue-mua-xe`, because it is a published URL
 * and this is a static export with no redirect layer. That is safe only because
 * the slug is part of the search haystack, so the old word still finds the tool
 * — asserted below, since that is the single thing that makes keeping the URL
 * defensible instead of merely convenient.
 */
describe("thue-mua-xe calls the product what the law calls it", () => {
  const OLD = "thuê mua";
  const NEW = "thuê tài chính";

  /** Every string a reader can actually see on this row. */
  const readerFacing: Record<string, string> = {
    pageTitle: C.pageTitle,
    metaTitle: C.metaTitle,
    metaDescription: C.metaDescription,
    contextNotice: C.contextNotice,
    contextDetailTitle: C.contextDetailTitle,
    contextDetail: C.contextDetail,
    relatedToolTitle: C.relatedTool.title,
    relatedToolWhy: C.relatedTool.why,
    ...Object.fromEntries(
      Object.entries(C.form).map(([k, v]) => [`form.${k}`, String(v)]),
    ),
    ...Object.fromEntries(C.formula.body.map((p, i) => [`formula.body[${i}]`, p])),
    ...Object.fromEntries(
      C.faq.items.flatMap((item, i) => [
        [`faq[${i}].q`, item.q],
        [`faq[${i}].a`, item.a],
      ]),
    ),
  };

  it("names the product in the title and the registry", () => {
    expect(C.pageTitle.toLowerCase()).toContain(NEW);
    expect(C.metaTitle.toLowerCase()).toContain(NEW);
    const entry = getCalculator("thue-mua-xe");
    expect(entry, "row left the registry").toBeDefined();
    expect(entry!.title.toLowerCase()).toContain(NEW);
    expect(entry!.title.toLowerCase()).not.toContain(OLD);
  });

  it("uses the old word nowhere a reader can see it except the lede gloss", () => {
    // The lede keeps it ON PURPOSE — "nhiều nơi vẫn gọi là thuê mua" is how a
    // reader who knows the old word finds their footing. Everywhere else it is
    // the wrong name, so this lists offenders by field instead of asserting a
    // bare boolean: a failure has to say WHICH string regressed.
    const offenders = Object.entries(readerFacing)
      .filter(([, value]) => value.toLowerCase().includes(OLD))
      .map(([key]) => key);
    expect(
      offenders,
      "these reader-facing strings still call a finance lease a hire-purchase",
    ).toEqual([]);
    // Non-vacuity: the sweep must really be looking at populated copy.
    expect(Object.keys(readerFacing).length).toBeGreaterThan(25);
    expect(
      Object.values(readerFacing).filter((v) => v.length > 40).length,
    ).toBeGreaterThan(8);
  });

  it("defines the term in the lede, because the right name is still jargon", () => {
    // Accuracy that nobody understands is not an improvement. The lede has to
    // say what the arrangement IS and that ownership is not automatic.
    expect(C.lede.toLowerCase()).toContain(NEW);
    expect(C.lede.toLowerCase()).toContain(OLD); // the gloss
    expect(C.lede).toContain("tùy hợp đồng");
  });
  it("is still found by the old word, which is what the kept URL rests on", () => {
    const entry = getCalculator("thue-mua-xe")!;
    const disposition = dispositionFor("thue-mua-xe")!;
    const real: SearchableTool = {
      slug: "thue-mua-xe",
      title: entry.title,
      summary: entry.summary,
      question: disposition.question,
      categoryLabel: CATEGORY_LABELS[entry.category],
    };
    // What a reader typing the old name actually experiences.
    expect(matchesQuery(real, "thue mua")).toBe(true);

    // And prove the SLUG is sufficient on its own, which is the claim the
    // decision to keep `/cong-cu/thue-mua-xe/` depends on. This needs EVERY
    // other field cleared of both tokens, not just the title: "thuê" survives
    // in "thuê tài chính" and "mua" survives in "vay để mua" and "vay mua xe",
    // so a match on the full entry proves nothing about the slug. An earlier
    // assertion in this suite failed exactly this way in reverse — it claimed
    // removing a label killed a match while the slug still carried the term.
    const slugOnly: SearchableTool = {
      slug: "thue-mua-xe",
      title: "Cho thuê tài chính ô tô",
      summary: "",
      question: "",
      categoryLabel: "Khác",
    };
    expect(matchesQuery(slugOnly, "thue mua")).toBe(true);
    // The control: drop the slug and the phrase no longer matches, so the
    // assertion above is about the slug rather than about anything left over.
    expect(matchesQuery({ ...slugOnly, slug: "cho-thue-tai-chinh-o-to" }, "thue mua")).toBe(
      false,
    );
  });
});
