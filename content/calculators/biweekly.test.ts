import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { formatDecimal, formatMoney, parseDecimal, parseMoney } from "@/lib/calc/number";
import {
  emphasise,
  emphasisShare,
  missingPhrases,
} from "@/lib/prose-emphasis";
import { markupRegion } from "@/lib/markup-region";
import { computeBiweekly, type BiweeklyInput } from "@/lib/calc/loan-variants";
import { BIWEEKLY as C } from "@/content/calculators/biweekly";
import { TOOL_NEXT_STEPS } from "@/content/calculators/next-steps";

/**
 * The module-at-shipped-defaults test docs §6 calls the highest-value
 * substitute for the coverage a green suite does not have. Original row 13.
 * This file did not exist before.
 *
 * The row's own question is "trả nợ thường xuyên hơn có giảm lãi không?", and
 * for one whole unit this page answered it with "hai yếu tố này cộng lại tạo
 * ra khoản tiết kiệm" — arithmetically true, proportionally misleading by a
 * factor of fifty. What is asserted below is that the page now states the
 * proportion, that the figures it states are the model's own, and that the
 * practical consequence is reachable as a link rather than as advice.
 */

const F = C.form;

/** The component's own parse and wiring, reproduced — docs §6. */
function shippedInput(): BiweeklyInput {
  const term = parseDecimal(F.defaultTerm)!;
  return {
    amount: parseMoney(F.defaultAmount)!,
    annualRatePercent: parseDecimal(F.defaultRate)!,
    termMonths: Math.round(
      F.defaultTermUnit === "years" ? term * 12 : term,
    ),
  };
}

function run(overrides: Partial<BiweeklyInput> = {}) {
  const result = computeBiweekly({ ...shippedInput(), ...overrides });
  expect(result).not.toBeNull();
  return result!;
}

describe("tra-no-hai-tuan at its shipped defaults", () => {
  it("parses every default with the parser its field kind needs", () => {
    expect(shippedInput()).toEqual({
      amount: 2_000_000_000,
      annualRatePercent: 8.5,
      termMonths: 240,
    });
  });

  it("reproduces the hand-computed reference figures", () => {
    // Independent of the module: a 2 tỷ / 8,5% / 240-month loan has a level
    // instalment of 17.356.464,67 ₫, and running the three fixed-payment
    // schedules by hand gives the interest totals pinned in
    // `lib/calc/loan-variants.test.ts`. These are the same figures reached
    // through the component's parse of the shipped default STRINGS, which is
    // the part a module test cannot see.
    const r = run();
    expect(r.monthlyPayment).toBeCloseTo(17_356_464.67, 2);
    expect(r.biweeklyPayment).toBeCloseTo(8_678_232.33, 2);
    expect(r.interestSaving).toBeCloseTo(442_837_513, -3);
    expect(r.biweeklyPeriods).toBe(429);
    expect(formatDecimal(r.biweeklyYears, 1)).toBe("16,5");
  });

  it("splits the saving 98,2 / 1,8 at the defaults the page quotes", () => {
    const split = run().split!;
    expect(split.extraPaymentSaving).toBeCloseTo(434_935_373, -3);
    expect(split.frequencySaving).toBeCloseTo(7_902_140, -3);
    expect(split.samePayment).toBeCloseTo(8_010_676, -1);
    // The proportion the copy states, derived rather than transcribed.
    const total = split.extraPaymentSaving + split.frequencySaving;
    expect((split.extraPaymentSaving / total) * 100).toBeCloseTo(98.2, 1);
    expect((split.frequencySaving / total) * 100).toBeCloseTo(1.8, 1);
  });

  it("quotes the model's own figures in the copy, not rounded retellings", () => {
    const r = run();
    const split = r.split!;
    const copy = [
      C.lede,
      C.prepaymentNotice,
      ...C.formula.body,
      ...C.faq.items.map((item) => item.a),
    ].join(" ");
    for (const figure of [
      formatMoney(r.interestSaving),
      formatMoney(split.extraPaymentSaving),
      formatMoney(split.frequencySaving),
    ]) {
      expect(copy, `copy no longer quotes ${figure}`).toContain(figure);
    }
    // And the two percentages, including the other measurement order's, which
    // the prose states so the figures are not read as exact.
    expect(copy).toContain("98,2%");
    expect(copy).toContain("1,8%");
    expect(copy).toContain("98,4%");
    expect(copy).toContain("1,6%");
  });

  it("no longer says the two causes simply add up to the saving", () => {
    // The sentence this row existed to fix. It is not enough to delete it:
    // the replacement has to state which cause dominates.
    const prose = C.formula.body.join(" ");
    expect(prose).not.toContain("Hai yếu tố này cộng lại tạo ra khoản tiết kiệm");
    expect(prose).toContain("không ngang nhau");
    expect(C.lede).toContain("không phải từ việc trả thường xuyên hơn");
  });

  it("answers the row's own question with the number", () => {
    // `plan-disposition.ts`'s question for this row is "Trả nợ thường xuyên
    // hơn có giảm lãi không?". One FAQ item answers exactly that, and the
    // answer is the frequency leg.
    const item = C.faq.items.find((each) =>
      each.q.includes("thường xuyên hơn"),
    );
    expect(item, "no FAQ item answers the row's own question").toBeDefined();
    expect(item!.a).toContain(formatMoney(run().split!.frequencySaving));
    expect(item!.a).toContain("1,8%");
    expect(item!.a).toContain("Gần như không");
  });

  it("explains how the split is derived and that the order matters", () => {
    // A decomposition whose method is unstated is indistinguishable from two
    // estimates. The intermediate schedule and the order-dependence are both
    // written down.
    const prose = C.formula.body.join(" ");
    expect(prose).toContain("12/26");
    expect(prose).toContain("tổng tiền trả trong một năm bằng đúng lịch hằng tháng");
    expect(prose).toContain("phụ thuộc thứ tự đo");
    // And the accrual convention the frequency leg carries with it.
    expect(prose).toContain("chia cho 26");
  });

  it("points at a schedule banks actually offer", () => {
    // The row's requirement: prioritise schedules banks support, and open the
    // main loan tool's extra-payment mode. `vay-mua-nha` is P1, which is what
    // `next-steps.test.ts` requires of a destination, and rows 10 and 13 are
    // the only two P4 rows permitted an entry at all.
    const steps = TOOL_NEXT_STEPS["tra-no-hai-tuan"];
    expect(steps, "row 13 has no next steps").toBeDefined();
    expect(steps.tools.map((t) => t.slug)).toContain("vay-mua-nha");
    expect(steps.intro).toContain("không từ lịch trả hai tuần");
    // The FAQ says the same in the reader's own words.
    expect(C.faq.items[0].a).toContain("trả thêm vào gốc");
    expect(C.formula.body.join(" ")).toContain("trả thêm vào gốc");
  });

  it("quotes no unverified fee range, and keeps the fee caveat", () => {
    // The invented "Phần lớn … 1–3%" universal a browser check already had
    // removed from `loan.ts:149` — swept there by `loan.test.ts:225-232` —
    // was still in this file's notice.
    const copy = [
      C.lede,
      C.prepaymentNotice,
      ...C.formula.body,
      ...C.faq.items.map((item) => item.a),
    ].join(" ");
    for (const range of ["1–3%", "1-3%"]) {
      expect(copy, `copy quotes the range ${range}`).not.toContain(range);
    }
    expect(C.prepaymentNotice).not.toContain("Phần lớn ngân hàng");
    // What is true, and still said: the tool does not model the fee, the
    // contract decides it, and the schedule may not be on offer.
    expect(C.prepaymentNotice).toContain("chưa tính phí trả nợ trước hạn");
    expect(C.prepaymentNotice).toContain("hợp đồng");
    expect(C.prepaymentNotice).toContain("Không phải ngân hàng nào cũng");
  });

  it("declares emphasis that exists in the prose and stays under the cap", () => {
    // The three things `lib/prose-emphasis.ts` says can go wrong with a
    // declared phrase list, asserted rather than trusted. A phrase that
    // matches nothing is an editorial defect — a typo, or a phrase that
    // drifted when a sentence was reworded — and must fail a test rather
    // than silently render as ordinary text.
    const body = [...C.formula.body];
    const phrases = [...C.formula.emphasis];
    expect(missingPhrases(body, phrases)).toEqual([]);
    // MAX_EMPHASIS_SHARE for a calculator's method is 0,2. Measured 6,2%.
    expect(emphasisShare(body, phrases)).toBeLessThan(0.2);
    expect(emphasisShare(body, phrases)).toBeCloseTo(0.062, 3);
    // Each phrase in exactly ONE paragraph, so an emphasis cannot be
    // attached to the wrong block.
    for (const phrase of phrases) {
      const hits = body.filter((paragraph) => paragraph.includes(phrase));
      expect(hits.length, `"${phrase}" appears in ${hits.length} paragraphs`)
        .toBe(1);
    }
  });
});

describe("tra-no-hai-tuan — the emphasis actually RENDERS", () => {
  /**
   * The check that makes the reading disposition a fact rather than a claim.
   *
   * `tra-no-hai-tuan` is one of three routes that render their own page body
   * instead of `CalculatorPage`, so it does not inherit the shell's
   * `ProseText`. A declared phrase list plus a route that forgot to thread it
   * produces exactly the failure
   * `app/cong-cu/vay-mua-nha/page.tsx`'s docstring describes: "a claim about
   * markup that never rendered". Source-level tests cannot see it — the
   * phrases are declared and present either way — so this renders the REAL
   * route and reads the bytes.
   *
   * `scripts/check-built-markup.mjs:147-162` enforces the same contract on
   * the built export, but only that SOME `<strong>` exists and only once the
   * row is filed `emphasis` in `plan-disposition.ts`. This is the stronger
   * and earlier half: every declared phrase, by name, inside a `<strong>`.
   */
  async function renderRoute(): Promise<string> {
    const mod = await import("@/app/cong-cu/tra-no-hai-tuan/page");
    return renderToStaticMarkup(createElement(mod.default));
  }

  it("wraps every declared phrase in a real <strong>", async () => {
    const html = await renderRoute();
    for (const phrase of C.formula.emphasis) {
      expect(
        html,
        `"${phrase}" is declared but does not render inside a <strong>`,
      ).toContain(`<strong class="font-semibold text-ink">${phrase}</strong>`);
    }
  });

  it("emphasises inside the explanation, not somewhere else on the page", async () => {
    // Bounded with `markupRegion` rather than a hand-rolled slice — four
    // hand-rolled bounds in this repo were wrong, three of them by finding a
    // close tag textually instead of counting depth. The marker is the prose
    // section's own heading, which is why `formula.title` and the split
    // group's `splitTitle` are deliberately different strings.
    const html = await renderRoute();
    const region = markupRegion(html, C.formula.title, "section");
    expect(region, "could not bound the prose section").not.toBeNull();
    for (const phrase of C.formula.emphasis) {
      expect(region!, `"${phrase}" renders outside the prose section`)
        .toContain(`<strong class="font-semibold text-ink">${phrase}</strong>`);
    }
  });

  it("leaves the paragraph a single string, joinable back to the source", async () => {
    // The invariant the whole mechanism exists for: emphasis is data beside
    // the paragraph, so what a reader copies and what the search index holds
    // cannot drift from what they see. Stripping the tags from the rendered
    // paragraph must give the content string back exactly.
    const html = await renderRoute();
    for (const paragraph of C.formula.body) {
      const marked = emphasise(paragraph, C.formula.emphasis)
        .map((span) =>
          span.emphasis
            ? `<strong class="font-semibold text-ink">${span.text}</strong>`
            : span.text,
        )
        .join("");
      expect(html, "a prose paragraph is not rendered intact").toContain(
        marked,
      );
      expect(marked.replace(/<[^>]+>/g, "")).toBe(paragraph);
    }
  });

  it("renders no emphasis anywhere it was not declared", async () => {
    // A guard against the mechanism being used twice, or a stray `<strong>`
    // creeping into the hand-written body of this pre-shell route: the count
    // of rendered `<strong>` equals the number of declared spans.
    const html = await renderRoute();
    const declared = C.formula.body.reduce(
      (sum, paragraph) =>
        sum +
        emphasise(paragraph, C.formula.emphasis).filter((s) => s.emphasis)
          .length,
      0,
    );
    expect(declared).toBe(C.formula.emphasis.length);
    expect((html.match(/<strong/g) ?? []).length).toBe(declared);
  });
});

describe("tra-no-hai-tuan — the split's boundaries", () => {
  it("withholds the split rather than reporting zeros when it cannot be built", () => {
    // Reachable, not hypothetical: at a long term the level instalment
    // converges onto the interest charge, so the same-money schedule's
    // instalment no longer covers it. The page says so in its own words
    // instead of showing four dashes.
    const long = run({ termMonths: 6000 });
    expect(long.split).toBeNull();
    expect(F.splitUnavailable).toContain("không tách được");
    expect(F.splitUnavailable).toContain("không phải");
  });

  it("splits nothing at a zero rate and says nothing false about it", () => {
    const split = run({ annualRatePercent: 0 }).split!;
    expect(split.frequencySaving).toBeCloseTo(0, 6);
    expect(split.extraPaymentSaving).toBeCloseTo(0, 6);
  });

  it("labels the split rows, and keeps them out of the live region", () => {
    // Labels exist for all four rows the non-live group renders. The live
    // region itself is asserted by `live-region.test.ts`; what this checks is
    // that no label is missing, which would render an unlabelled figure.
    for (const label of [
      F.splitTitle,
      F.extraPaymentSavingLabel,
      F.frequencySavingLabel,
      F.samePaymentLabel,
      F.sameInterestLabel,
      F.detailTitle,
    ]) {
      expect(label.trim().length).toBeGreaterThan(3);
    }
  });
});
