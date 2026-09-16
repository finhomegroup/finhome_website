/**
 * Content contracts for `/cong-cu/vay-thuong-mai/` (plan row 5).
 *
 * WHY THIS FILE EXISTS. This module had no test, and docs §6 (T11) records
 * what that costs: an audit found three of its five worst defects invisible to
 * a green run, because they lived in a component or in a default input rather
 * than in an engine. Two of the things asserted below are exactly that shape —
 * a parser choice in the component, and eleven figures quoted in prose that
 * nothing bound to the model.
 *
 * THE INVARIANTS ARE NOT THE MORTGAGE ONES, and that is the point of the
 * first describe block. docs §4 prescribes, for a loan-shaped test, "total
 * payments minus total interest equals the principal; the final balance is
 * strictly 0". The middle clause is FALSE for this product: a balloon loan
 * amortizes down to the balloon and stops, so its last scheduled balance is
 * the lump still owed. Copying the household-mortgage invariant here would
 * assert `0` and fail against correct code — so the identity is restated for
 * the shape that actually ships, and the non-zero ending is asserted as the
 * property it is.
 */
import { describe, expect, it } from "vitest";

import { readCommercialLoanFields } from "@/components/commercial-loan-calculator";
import { computeCommercialLoan } from "@/lib/calc/commercial-loan";
import { formatMoney, formatPercent } from "@/lib/calc/number";
import { emphasisShare, missingPhrases } from "@/lib/prose-emphasis";
import { COMMERCIAL_LOAN as C } from "@/content/calculators/commercial-loan";

/**
 * Ledger tolerance, in đồng.
 *
 * The identity sums 84 rows of a 5e9 principal. float64 carries ~1e-16
 * relative precision, so the accumulated error sits around 5e9 × 84 × 1e-16 ≈
 * 4e-5 đồng in the worst case. 1e-3 đồng is two decades above that and still
 * 1000× tighter than the smallest unit the page can display. An absolute bound
 * with a stated magnitude, per docs §8 — `toBeCloseTo(0, 8)` fails for a
 * correct answer at these magnitudes.
 */
const LEDGER_DONG = 1e-3;

/** The five shipped form strings, read exactly as the page reads them. */
const shippedFields = () =>
  readCommercialLoanFields({
    amount: C.form.defaultAmount,
    rate: C.form.defaultRate,
    term: C.form.defaultTerm,
    grace: C.form.defaultGrace,
    balloon: C.form.defaultBalloon,
  });

/** The module's own output at the shipped defaults. */
const shipped = () => computeCommercialLoan(shippedFields().input!)!;

/** Every user-facing string in the module, by WALKING the exported object. */
function userFacingStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) for (const v of value) userFacingStrings(v, out);
  else if (value !== null && typeof value === "object")
    for (const v of Object.values(value)) userFacingStrings(v, out);
  return out;
}

/**
 * Proper nouns a reader cannot mistake for shouting.
 *
 * `APR` is the only one this module uses.
 */
const PROPER_NOUNS = ["APR", "FinHome"];

/** Runs of three or more capitals, once the proper nouns are removed. */
function shoutedRuns(strings: readonly string[]): string[] {
  const found: string[] = [];
  for (const original of strings) {
    let text = original;
    // split/join, not a regex: these tokens can contain metacharacters.
    for (const noun of PROPER_NOUNS) text = text.split(noun).join(" ");
    // `\p{Lu}`, never a range like `Ạ-Ỹ` — that range spans the LOWERCASE
    // accented block, so `[Ạ-Ỹ]` matches "ạ" and the sweep reads as clean.
    for (const match of text.matchAll(/\p{Lu}{3,}/gu)) found.push(match[0]);
  }
  return [...new Set(found)];
}

describe("vay-thuong-mai's form fields", () => {
  it("reads the month counts with the COUNT grammar, not the decimal one", () => {
    // The defect this assertion reproduces. `term` and `grace` went through
    // `parseDecimal` behind a `!Number.isInteger(...)` guard, and
    // `parseDecimal("1.000")` is `1` — an integer — so the guard could never
    // fire. A reader who typed a grouped "1.000" months got a silently
    // accepted ONE-MONTH loan, priced and tabulated, with no error shown.
    const grouped = readCommercialLoanFields({
      amount: C.form.defaultAmount,
      rate: C.form.defaultRate,
      term: "1.000",
      grace: "0",
      balloon: C.form.defaultBalloon,
    });
    expect(grouped.term).toBeNull();
    expect(grouped.termInvalid).toBe(true);
    // And nothing reaches the engine, so no figure is computed off a 1.
    expect(grouped.input).toBeNull();

    const groupedGrace = readCommercialLoanFields({
      amount: C.form.defaultAmount,
      rate: C.form.defaultRate,
      term: C.form.defaultTerm,
      grace: "1.000",
      balloon: C.form.defaultBalloon,
    });
    expect(groupedGrace.grace).toBeNull();
    expect(groupedGrace.graceInvalid).toBe(true);

    // And a fractional term, which the same guard was meant to catch.
    const fractional = readCommercialLoanFields({
      amount: C.form.defaultAmount,
      rate: C.form.defaultRate,
      term: "84,5",
      grace: "0",
      balloon: C.form.defaultBalloon,
    });
    expect(fractional.term).toBeNull();
    expect(fractional.termInvalid).toBe(true);
  });

  it("keeps the money and rate grammars where they belong", () => {
    const f = shippedFields();
    expect(f.amount).toBe(5_000_000_000);
    expect(f.rate).toBe(11);
    expect(f.term).toBe(84);
    expect(f.grace).toBe(12);
    expect(f.balloon).toBe(20);
    for (const flag of [
      f.amountInvalid,
      f.rateInvalid,
      f.termInvalid,
      f.graceInvalid,
      f.balloonInvalid,
    ])
      expect(flag).toBe(false);
    // And the resolved input the page actually feeds the engine.
    expect(f.input).toEqual({
      amount: 5_000_000_000,
      annualRatePercent: 11,
      termMonths: 84,
      graceMonths: 12,
      balloonPercent: 20,
    });

    // A rate typed the English way must stay a rate: parseMoney("7.5") is 75.
    expect(
      readCommercialLoanFields({
        amount: "1",
        rate: "7.5",
        term: "12",
        grace: "0",
        balloon: "0",
      }).rate,
    ).toBe(7.5);
  });
});

describe("vay-thuong-mai's schedule invariants", () => {
  const r = shipped();

  it("balances the ledger across the schedule and the balloon", () => {
    // docs §4's identity, restated for a loan that does not amortize to zero:
    // everything paid on schedule, PLUS the lump at maturity, less all the
    // interest, is the principal drawn. This crosses the drawn schedule rather
    // than the returned aggregate — `totalPaid` is returned as
    // `amount + totalInterest`, so asserting it against those two would be
    // tautological and would catch nothing.
    const paid = r.schedule.reduce((sum, row) => sum + row.payment, 0);
    expect(
      Math.abs(paid + r.balloonAmount - r.totalInterest - 5_000_000_000),
    ).toBeLessThan(LEDGER_DONG);

    // The returned aggregate must agree with the schedule it summarises.
    expect(Math.abs(r.totalPaid - (paid + r.balloonAmount))).toBeLessThan(
      LEDGER_DONG,
    );
    const interest = r.schedule.reduce((sum, row) => sum + row.interest, 0);
    expect(Math.abs(interest - r.totalInterest)).toBeLessThan(LEDGER_DONG);
  });

  it("ends on the balloon, NOT on zero", () => {
    // The mortgage invariant inverted, deliberately. A test copied from a
    // household loan would assert 0 here and fail on correct code; the real
    // property is that the last scheduled balance is exactly the lump the FAQ
    // tells the reader to plan for.
    const last = r.schedule.at(-1)!;
    expect(Math.abs(last.balance - r.balloonAmount)).toBeLessThan(LEDGER_DONG);
    expect(r.balloonAmount).toBe(1_000_000_000);
    expect(last.balance).toBeGreaterThan(0);
    expect(r.schedule).toHaveLength(84);
  });

  it("splits every row into interest and principal that sum to its payment", () => {
    for (const row of r.schedule) {
      expect(Math.abs(row.interest + row.principal - row.payment)).toBeLessThan(
        LEDGER_DONG,
      );
    }
    // The grace period repays no principal at all — the lesson the page's
    // table intro is about, as a property of the schedule rather than a claim.
    for (const row of r.schedule.slice(0, 12)) expect(row.principal).toBe(0);
    expect(r.schedule[12].principal).toBeGreaterThan(0);
  });

  it("prices a realistic long term rather than refusing one", () => {
    // docs §8 defects 1, 5 and 10: a root finder's bracket has overflowed in
    // three separate modules, and every time the tests used only short terms.
    // This module uses `pmt` rather than a solve, but the rule stands — pin a
    // long-dated case.
    const long = computeCommercialLoan({
      amount: 5_000_000_000,
      annualRatePercent: 11,
      termMonths: 360,
      graceMonths: 24,
      balloonPercent: 20,
    });
    expect(long).not.toBeNull();
    expect(long!.amortizingPayment).toBeGreaterThan(0);
    expect(Number.isFinite(long!.totalInterest)).toBe(true);
  });
});

describe("vay-thuong-mai's prose, against the model it describes", () => {
  const r = shipped();

  it("quotes the three payments the module actually returns", () => {
    // docs §8 defect 19: "a number in a sentence is a test fixture that has
    // not been written yet". Every figure below is quoted in the module's
    // header comment, its `structureNotice` or its `formula.body`, and none of
    // them was bound to the engine until now.
    const copy = userFacingStrings(C).join(" ");
    expect(copy).toContain(formatMoney(r.gracePayment));
    expect(copy).toContain(formatMoney(r.amortizingPayment));
    expect(copy).toContain(formatMoney(r.balloonAmount));
    expect(copy).toContain(formatMoney(r.totalInterest));
    expect(copy).toContain(formatMoney(r.plainPayment));
    expect(copy).toContain(formatMoney(r.plainTotalInterest));
    expect(copy).toContain(formatMoney(r.structureCost));
  });

  it("quotes a structure cost that is really the difference of the two", () => {
    // The page's central claim: this structure is not cheaper, it costs more.
    // If that ever stopped being true of the shipped defaults the notice would
    // be teaching the opposite of the arithmetic.
    expect(r.structureCost).toBeGreaterThan(0);
    expect(
      Math.abs(r.structureCost - (r.totalInterest - r.plainTotalInterest)),
    ).toBeLessThan(LEDGER_DONG);
    expect(r.gracePayment).toBeLessThan(r.plainPayment);
    expect(formatPercent(r.interestToPrincipalPercent, 2)).toBe("53,84%");
  });

  it("answers where the balloon principal is repaid from, ABOVE the accordion", () => {
    // The row's own requirement, and the promotion this unit exists to do.
    // The three routes were written only into FAQ item 2 — inside a collapsed
    // `Accordion` — while the visible slot above the calculator said nothing
    // about where the lump comes from. A reader who never opens the accordion
    // is the reader who most needs it.
    //
    // Asserted on `balloonSourceNotice` specifically, not on "the copy
    // somewhere", because the whole finding was that the sentence existed and
    // was buried.
    const promoted = C.balloonSourceNotice;
    expect(promoted).toContain("tái cấp vốn");
    expect(promoted).toContain("bán tài sản");
    expect(promoted).toContain("dòng tiền");
    // And it must keep naming refinancing as the risky one rather than just
    // listing three options neutrally.
    expect(promoted).toContain("rủi ro");
    expect(promoted).toContain(formatMoney(r.balloonAmount));

    // The FAQ answer stays too: the accordion is where a reader who wants the
    // long version looks, and deleting it would be a net loss of copy.
    const faq = C.faq.items.map((i) => i.a).join(" ");
    expect(faq).toContain("tái cấp vốn");
  });

  it("keeps the table's own two points, which MOVED rather than vanished", () => {
    // `form.table.intro` used to fill the `intro` slot and now does not
    // exist; the slot carries `balloonSourceNotice`. The rule from the label
    // geometry work applies to any shortened or replaced copy: assert the
    // qualification moved, not merely that the old string is gone. Both of
    // the table's points have to still be on the page.
    const promoted = C.balloonSourceNotice;
    // The grace year repays no principal — and the schedule agrees.
    expect(promoted).toContain("kỳ ân hạn");
    expect(promoted).toContain("dư nợ không giảm một đồng nào");
    // The balance stops at the balloon rather than at zero.
    expect(promoted).toContain("thay vì 0");
    expect(promoted).toContain(formatMoney(r.balloonAmount));
    // And the superseded key is gone, so the page cannot carry two strings
    // that disagree about where the balance stops.
    expect("intro" in C.form.table).toBe(false);
  });

  it("declares emphasis phrases that resolve against the method prose", () => {
    // The phrases are declared but deliberately not wired — see the key's own
    // docstring. What is checked here is what would break silently later: a
    // reword that orphans a phrase. `missingPhrases` is the same mechanism
    // `plan-disposition.test.ts` uses on the rows that ARE filed `emphasis`,
    // so the filing needs no new guard when it happens.
    const body = [...C.formula.body];
    expect(missingPhrases(body, [...C.formula.emphasis])).toEqual([]);

    // Each phrase in exactly one paragraph, or the "at most one emphasis per
    // phrase per paragraph" rule would mark the wrong sentence.
    for (const phrase of C.formula.emphasis) {
      const hits = body.filter((p) => p.includes(phrase)).length;
      expect(hits, `"${phrase}" appears in ${hits} paragraphs`).toBe(1);
    }

    // Under the calculator-method cap. Landed rows sit at 6–14%.
    const share = emphasisShare(body, [...C.formula.emphasis]);
    expect(share).toBeLessThan(0.2);
    expect(share).toBeGreaterThan(0);

    // Sentence case, so marking them replaces the shouting rather than
    // bolding it. This is the check U1's first pass needed: phrases that
    // still contained the capitals would have wrapped `<strong>` around them.
    expect(shoutedRuns([...C.formula.emphasis])).toEqual([]);
  });

  it("no longer claims refinancing is the most common route", () => {
    // An unsupported generalisation, flagged by the scope audit and confirmed
    // in source: "Đường thứ ba phổ biến nhất" is a frequency claim about
    // Vietnamese commercial borrowers that this project has no data for. The
    // RISK half of the sentence is supportable and is kept; the frequency half
    // is removed rather than rescaled. docs §8 defect 20 is the precedent —
    // "rescaling a wrong claim to new units preserves the wrongness".
    const copy = userFacingStrings(C).join(" ");
    expect(copy).not.toContain("phổ biến nhất");
  });

  it("quotes no invented statistical range", () => {
    // Same list as `loan.test.ts`, `auto-lease.test.ts` and
    // `apr-advanced.test.ts`, rather than a new list that could drift. This
    // page names arrangement, valuation and commitment fees and sends the
    // reader to the APR tool for them, which is the right shape; a made-up
    // percentage band would not be.
    const copy = userFacingStrings(C).join(" ");
    for (const range of ["1–3%", "1-3%", "35–40", "45–55", "70–80", "3–6 tháng"])
      expect(copy, `copy quotes "${range}"`).not.toContain(range);
  });

  it("shouts at nobody", () => {
    // Vacuity fixtures FIRST, using lines this module really shipped, because
    // a sweep that reports zero is indistinguishable from a sweep that is
    // broken — and this exact check has reported a false zero before.
    expect(shoutedRuns(["trên TOÀN BỘ số tiền vay"])).toEqual(["TOÀN"]);
    expect(shoutedRuns(["phải trả lời TRƯỚC khi ký"])).toEqual(["TRƯỚC"]);
    expect(shoutedRuns(["đẩy khoản trả LÊN, còn phần gốc kéo nó XUỐNG"])).toEqual(
      ["LÊN", "XUỐNG"],
    );
    // A proper noun is not shouting, and neither is a two-letter capital.
    expect(shoutedRuns(["hãy dùng công cụ APR nâng cao của FinHome"])).toEqual([]);
    expect(shoutedRuns(["kỳ hạn ĐÃ gồm kỳ ân hạn"])).toEqual([]);

    expect(shoutedRuns(userFacingStrings(C))).toEqual([]);
  });

  it("carries a non-empty title, lede and at least one FAQ item", () => {
    // Shape guard, so none of the sweeps above can pass by the module being
    // empty. docs §8: never pin the suite's own size — this is a floor, not a
    // count.
    expect(C.pageTitle.trim().length).toBeGreaterThan(5);
    expect(C.lede.trim().length).toBeGreaterThan(20);
    expect(C.faq.items.length).toBeGreaterThanOrEqual(1);
    expect(userFacingStrings(C).length).toBeGreaterThan(20);
  });
});
