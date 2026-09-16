// Route 48's copy against the model it describes.
//
// WHY THIS FILE EXISTS. docs §6 records that three of this suite's five worst
// defects were invisible to a green test run because they lived in a DEFAULT
// INPUT or in a component rather than in a module. The cheapest substitute is
// to assert the module at its shipped defaults: parse the content file's own
// strings with the same parser the component uses, run the engine, format with
// the same formatter, and pin the result. This route's defaults are now the
// SHARED ones in `content/calculators/long-term-plan.ts`, so that is what is
// parsed here.
//
// AND EVERY QUOTED FIGURE. On these pages the prose IS the teaching: the notice
// above the calculator, the method section and the FAQ all quote computed
// đồng amounts, percentages and ages. A figure that disagrees with what the
// page renders is the worst defect class here, so each one is derived below
// from the shipped strings and asserted to occur in the sentence that quotes
// it. Move a default and the failure names the sentence that has to move with
// it.
//
// The previous version of this file pinned the superseded USD scenario
// (45 → 65 → 95 on dollars) and its dramatic "11,1% of the capital costs 5 of
// 30 years" claim. Both are gone with the denomination: that disproportion was
// a property of that fixture, and at đồng magnitudes the relation is near
// proportional. See the content file's header.
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readRetirement } from "@/components/calc/retirement-fields";
import { formatDecimal, formatMoney, formatPercent } from "@/lib/calc/number";
import { emphasisShare, missingPhrases } from "@/lib/prose-emphasis";
import { fill } from "@/lib/calc/charts/labels";
import {
  LONGEVITY_STRESS_YEARS,
  MAX_EXTRA_WORKING_YEARS,
  remedyFor,
  resolveLongTermPlan,
} from "@/lib/calc/long-term-plan";
import { LONG_TERM_PLAN as L } from "@/content/calculators/long-term-plan";
import { RETIREMENT_SAVINGS_ANALYSIS as C } from "@/content/calculators/retirement-savings-analysis";

const READ = readRetirement(L.defaults);

/** The plan all four routes open on, resolved once. */
function planAt(over: Record<string, number> = {}) {
  if (READ.input === null) throw new Error("the shipped defaults do not parse");
  const plan = resolveLongTermPlan({ ...READ.input, ...over });
  if (plan === null) throw new Error("resolveLongTermPlan refused the input");
  return plan;
}

/** The same formatters the component uses. Never `Intl`. */
const dong = (value: number) => formatMoney(value);
const pct = (value: number) => formatPercent(value, 1);

// One narrowing helper per remedy. `Remedy` is a discriminated union, so a
// generic "give me the one with this key" helper cannot narrow without a cast,
// and a cast in a test is a place a wrong assertion can hide.
function contributeRemedy(over: Record<string, number> = {}) {
  const found = remedyFor(planAt(over).gap, "contribute");
  if (found.key !== "contribute") throw new Error("wrong remedy");
  return found;
}

function retireRemedy(over: Record<string, number> = {}) {
  const found = remedyFor(planAt(over).gap, "retireLater");
  if (found.key !== "retireLater") throw new Error("wrong remedy");
  return found;
}

function spendRemedy(over: Record<string, number> = {}) {
  const found = remedyFor(planAt(over).gap, "spendLess");
  if (found.key !== "spendLess") throw new Error("wrong remedy");
  return found;
}

const HEADER_COMMENT = (() => {
  const file = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "retirement-savings-analysis.ts",
  );
  const source = readFileSync(file, "utf8");
  return source.slice(0, source.indexOf("export const"));
})();

/** Every user-facing string this file owns, for the sweeps below. */
function everyString(): string[] {
  const out: string[] = [];
  const walk = (value: unknown) => {
    if (typeof value === "string") out.push(value);
    else if (Array.isArray(value)) value.forEach(walk);
    else if (value !== null && typeof value === "object") {
      Object.values(value).forEach(walk);
    }
  };
  walk(C);
  return out;
}

describe("phan-tich-tiet-kiem-huu-tri at the shared shipped defaults", () => {
  it("ships no scenario of its own", () => {
    // All four long-term routes answer from ONE set of assumptions or the
    // merge is a lie. This file used to carry its own eleven defaults — that
    // is how a page came to be 45 years old in dollars while its three
    // siblings were 35 in đồng.
    expect(Object.keys(C)).not.toContain("fields");
    expect(READ.input).not.toBe(null);
    expect(Object.values(READ.invalid).some(Boolean)).toBe(false);
  });

  it("says nothing about United States law or dollars anywhere", () => {
    // The `usRules` notice is gone from the registry; a leftover sentence
    // would reinstate the claim without the flag, which is exactly the state
    // this route was left in by the foundation slice.
    const everything = everyString().join(" ");
    for (const claim of ["Hoa Kỳ", "USD", "401", "IRA", "Roth", "$"]) {
      expect(everything, `still mentions ${claim}`).not.toContain(claim);
    }
  });

  it("shouts nowhere — no ALL-CAPS word mid-sentence", () => {
    // The previous copy used capitals where typography belongs: "HƠN", "GIÁ
    // HÔM NAY", "HAI", "CẢ HAI". A rendered-page check found this route
    // shipping zero `<strong>` elements, so capitals were doing the work
    // emphasis should — and `formula.emphasis` does it now.
    //
    // Two or more consecutive uppercase letters is the signal; Vietnamese
    // sentence case never produces one, and this page has no acronym or
    // currency code left to exempt — so there is deliberately no allowlist
    // here, unlike the two 401(k) files.
    //
    // WORD-BOUNDED, which the bare `\p{Lu}{2,}` was not: without the bound
    // it reports the "IR" inside a mixed-case token, and it has no way to
    // tell a capitalised URL path from prose. Both are fixed the same way
    // the rest of the suite now does it.
    const shouted = (text: string) =>
      (text
        .replace(/https?:\/\/\S+/g, " ")
        .match(/(?<!\p{L})\p{Lu}{2,}(?!\p{L})/gu) ?? []) as string[];

    // Vacuity guard: the shape this page shipped, and the two the bare
    // pattern got wrong.
    expect(shouted("phần HƠN so với GIÁ HÔM NAY")).toEqual([
      "HƠN",
      "GIÁ",
      "HÔM",
      "NAY",
    ]);
    expect(shouted("theo https://x.test/USCODE-2024")).toEqual([]);

    for (const value of everyString()) {
      expect(shouted(value), `"${value.slice(0, 60)}…" shouts`).toEqual([]);
    }
  });

  it("opens on a plan that is SHORT, with all three remedies available", () => {
    // A planning tool whose default state reports "đủ" demonstrates nothing,
    // and this route is the one where the default scenario pays off: it is the
    // only one of the four that prices all three remedies. The judgement
    // `content/calculators/long-term-plan.ts` records as this file's.
    const plan = planAt();
    expect(plan.gap.funded).toBe(false);
    expect(plan.gap.realShortfall).toBeGreaterThan(0);
    for (const key of ["contribute", "retireLater", "spendLess"] as const) {
      expect(remedyFor(plan.gap, key).available, key).toBe(true);
    }
  });

  it("leaves the coverage row EMPTY, not 100%, when no capital is needed", () => {
    // Other income already covers the spend. "100% covered" and "nothing to
    // cover" are different statements and the page must not conflate them —
    // `formula.body[2]` says so and the component mounts the row on this very
    // field being non-null.
    const gap = planAt({ desiredAnnualSpending: 30_000_000 }).gap;
    expect(gap.realBalanceRequired).toBe(0);
    expect(gap.coveragePercent).toBe(null);
    expect(gap.realShortfall).toBe(0);
  });
});

describe("route 48's prose quotes the model, not a memory of it", () => {
  it("quotes the coverage, the years lost and the depletion age in the notice", () => {
    const plan = planAt();
    const span = plan.input.endAge - plan.input.retirementAge;
    for (const figure of [
      pct(plan.gap.coveragePercent as number),
      String(plan.asEntered.depletionAge),
      String(plan.asEntered.yearsShort),
      String(span),
    ]) {
      expect(C.coverageNotice, `notice is missing ${figure}`).toContain(figure);
    }
  });

  it("repeats exactly those figures in the method, and no third number", () => {
    const plan = planAt();
    const body = C.formula.body[1];
    expect(body).toContain(pct(plan.gap.coveragePercent as number));
    expect(body).toContain(String(plan.asEntered.depletionAge));
    // One extra working year, which is the sharp fact this page teaches: a
    // plan can reach 98,4% of the capital it needs and still run out of money.
    const later = planAt({ retirementAge: plan.input.retirementAge + 1 });
    expect(later.gap.funded).toBe(false);
    expect(body).toContain(pct(later.gap.coveragePercent as number));
    expect(body).toContain(String(later.asEntered.depletionAge));
  });

  it("prices all three remedies at the figures the model returns", () => {
    const body = C.formula.body[4];
    const contribute = contributeRemedy();
    const retire = retireRemedy();
    const spend = spendRemedy();
    const entered = planAt().input;

    expect(body).toContain(dong(contribute.extraPerYear as number));
    expect(body).toContain(dong((contribute.extraPerYear as number) / 12));
    expect(body).toContain(
      pct(((contribute.extraPerYear as number) / entered.annualContribution) * 100),
    );
    expect(body).toContain(String(retire.retirementAge));
    expect(body).toContain(String(entered.retirementAge));
    expect(body).toContain(dong(spend.annualSpending as number));
    expect(body).toContain(pct(spend.percentOfDesired as number));
  });

  it("quotes both blades of the retire-later remedy", () => {
    // The distinction the paragraph is about: retiring later moves the capital
    // reached UP and the capital required DOWN, and contributing more moves
    // only the first. Asserted as a measured relation, not as an adjective.
    const now = planAt();
    const retire = retireRemedy();
    const later = planAt({ retirementAge: retire.retirementAge as number });

    expect(later.gap.realBalanceReached).toBeGreaterThan(
      now.gap.realBalanceReached,
    );
    expect(later.gap.realBalanceRequired).toBeLessThan(
      now.gap.realBalanceRequired,
    );
    expect(later.gap.funded).toBe(true);

    const body = C.formula.body[5];
    for (const figure of [
      dong(now.gap.realBalanceReached),
      dong(later.gap.realBalanceReached),
      dong(now.gap.realBalanceRequired),
      dong(later.gap.realBalanceRequired),
    ]) {
      expect(body, `method paragraph 6 is missing ${figure}`).toContain(figure);
    }

    // The counter-intuitive figure the paragraph ends on: the contribution the
    // plan needs at the later age is BELOW the one already being made.
    const needed = later.contribution.annualContribution as number;
    expect(needed).toBeLessThan(now.input.annualContribution);
    expect(body).toContain(dong(needed));

    // And the FAQ answer that asks which remedy is cheapest quotes the same
    // two sides plus the coverage they produce, so the two surfaces agree.
    const answer = C.faq.items[1].a;
    expect(answer).toContain(dong(later.gap.realBalanceReached));
    expect(answer).toContain(dong(later.gap.realBalanceRequired));
    expect(answer).toContain(pct(later.gap.coveragePercent as number));
  });

  it("quotes the post-retirement-return lever in both places it appears", () => {
    // `formula.body[6]`'s and FAQ 5's shared claim: the lever moves the
    // REQUIREMENT and leaves the saving untouched.
    const now = planAt();
    const optimistic = planAt({ returnAfterPercent: 7 });
    expect(optimistic.gap.realBalanceRequired).toBeLessThan(
      now.gap.realBalanceRequired,
    );
    expect(optimistic.gap.funded).toBe(true);
    expect(optimistic.gap.realBalanceReached).toBeCloseTo(
      now.gap.realBalanceReached,
      6,
    );

    for (const text of [C.formula.body[6], C.faq.items[4].a]) {
      expect(text).toContain(dong(now.gap.realBalanceRequired));
      expect(text).toContain(dong(optimistic.gap.realBalanceRequired));
    }
    expect(C.formula.body[6]).toContain(
      pct(optimistic.gap.coveragePercent as number),
    );
    expect(C.faq.items[4].a).toContain(dong(now.gap.realBalanceReached));
  });

  it("quotes the real return and the near-proportional years lost", () => {
    // FAQ 1's answer, which replaces the old copy's disproportion claim with
    // the relation this scenario actually has. Stated as measured, and
    // explicitly not as a law — docs §7: do not assert an inequality that
    // holds on your fixture.
    const plan = planAt();
    const input = plan.input;
    const realReturn =
      ((1 + input.returnAfterPercent / 100) /
        (1 + input.inflationPercent / 100) -
        1) *
      100;
    const capitalMissing = 100 - (plan.gap.coveragePercent as number);
    const yearsMissing =
      (plan.asEntered.yearsShort / (input.endAge - input.retirementAge)) * 100;

    const answer = C.faq.items[0].a;
    expect(answer).toContain(formatDecimal(realReturn, 2));
    expect(answer).toContain(pct(capitalMissing));
    expect(answer).toContain(pct(yearsMissing));
    expect(C.faq.items[0].q).toContain(pct(plan.gap.coveragePercent as number));
  });

  it("quotes the contribution remedy in both readings, with the caveat", () => {
    // `monthlyEquivalent` is `annual / 12`, a BUDGETING division: twelve
    // month-end deposits land behind one January deposit, so it is not a
    // funded monthly instruction. FAQ 3 is where that is said.
    const contribute = contributeRemedy();
    const answer = C.faq.items[2].a;
    expect(answer).toContain(dong(contribute.annualContribution as number));
    expect(answer).toContain(dong(contribute.monthlyEquivalent as number));
    expect(answer).toContain(dong(contribute.extraPerYear as number));
    expect(contribute.monthlyEquivalent).toBeCloseTo(
      (contribute.annualContribution as number) / 12,
      9,
    );
  });

  it("names both model bounds from their own constants", () => {
    // A bound the engine enforces has to exist in the copy (docs §7), and it
    // has to come from the constant. Asserted with the surrounding words so
    // the digit cannot match by accident somewhere else in the paragraph.
    expect(C.formula.body[3]).toContain(
      `tối đa ${MAX_EXTRA_WORKING_YEARS} năm`,
    );
    expect(C.faq.items[6].a).toContain(
      `lâu hơn ${LONGEVITY_STRESS_YEARS} năm`,
    );
  });
});

describe("route 48's reading treatment", () => {
  it("declares only phrases that actually occur", () => {
    // `lib/prose-emphasis.ts` rule 4: a declared phrase that matches nothing
    // is silently skipped at render time and a failing test here. Reword a
    // sentence and its phrase list has to move with it.
    const missing = missingPhrases(C.formula.body, C.formula.emphasis);
    expect(missing, `phrases that do not occur: ${missing.join(" / ")}`).toEqual(
      [],
    );
  });

  it("puts each phrase in exactly ONE paragraph", () => {
    // `CalculatorPage` applies the whole list to every paragraph, so a phrase
    // appearing in two of them is emphasised twice — the "bold everything"
    // failure the mechanism exists to avoid.
    for (const phrase of C.formula.emphasis) {
      const hits = C.formula.body.filter((p) => p.includes(phrase));
      expect(hits.length, `"${phrase}" occurs in ${hits.length} paragraphs`).toBe(
        1,
      );
    }
  });

  it("keeps the emphasised share restrained", () => {
    // Same ratchet `plan-disposition.test.ts` holds every calculator's method
    // to: emphasis everywhere is emphasis nowhere. Row 44 landed at 12,6%.
    const share = emphasisShare(C.formula.body, C.formula.emphasis);
    expect(
      share,
      `emphasises ${(share * 100).toFixed(1)}% of the method`,
    ).toBeLessThan(0.2);
  });

  it("emphasises the remedy distinction rather than the arithmetic", () => {
    // This page's teaching is what closes a gap and what each remedy costs.
    // A phrase that is a figure would emphasise the assumptions and bury the
    // conclusion — the failure `lib/prose-emphasis.ts` rejects an algorithm
    // for. The figures are in the result rows and the table.
    for (const phrase of C.formula.emphasis) {
      expect(phrase, `"${phrase}" emphasises a number`).not.toMatch(/\d/);
    }
  });
});

// The remedy table has to READ at 390 px, and both halves of each row are
// this file's copy.
describe("route 48's remedy table fits a 390 px phone", () => {
  /**
   * Geometry, from an independent browser review at a verified 390x844
   * viewport (`innerWidth` 390, DPR 2, `documentElement.scrollWidth` 390).
   *
   * `ResultTable`'s `mobileCards` block renders each row as a
   * `grid-cols-[1fr_auto] gap-x-3` pair about 300 px wide. The value track is
   * `whitespace-nowrap` and sized to its own content; the LABEL track takes
   * what is left and wraps. That priority is deliberate and documented in
   * `components/calc/result-table.tsx` — a money figure must never break
   * across lines, and that primitive has fourteen consumers — so the label is
   * what has to fit, and this is a CONTENT bound rather than a component one.
   *
   * What the review measured on the shipped copy: a 233 px value
   * ("Thêm 10.007.403 ₫ mỗi năm") left the 24-character
   * "So với kế hoạch hiện tại" a 55 px track, which rendered as four ragged
   * lines — "So với / kế / hoạch / hiện tại" — on two of the three remedy
   * blocks and one line on the third.
   *
   * The per-character rates are calibrated from that review's own
   * measurements and rounded UP, so the bound is conservative:
   *   label `dt` at `text-sm` (14 px): "So với kế hoạch hiện tại" 24 chars
   *     wrapped inside 55 px, and "Nghỉ muộn hơn" 13 chars sat on one line in
   *     189 px -> about 7 px/char, bounded at 7,5.
   *   value `dd` at `font-display text-base tabular-nums` (16 px):
   *     25 chars/233 px, 25 chars/228 px and 10 chars/99 px -> 9,1 to 9,9
   *     px/char, bounded at 10.
   *
   * There is no browser in this session, so this pins the CONSTRAINT and not
   * the string: shorten or lengthen either the heading or a cell template and
   * the arithmetic decides, rather than a hard-coded label.
   */
  const ROW_PX = 300;
  const GAP_PX = 12;
  const LABEL_PX_PER_CHAR = 7.5;
  const VALUE_PX_PER_CHAR = 10;

  const R = C.form.remedies;

  /** Every cell the target column renders at the shipped defaults. */
  function targetCells(): string[] {
    const retire = retireRemedy();
    return [
      `${dong(contributeRemedy().annualContribution as number)} ₫`,
      fill(R.retireTarget, { age: String(retire.retirementAge) }),
      `${dong(spendRemedy().annualSpending as number)} ₫`,
    ];
  }

  /** Every cell the change column renders at the shipped defaults. */
  function changeCells(): string[] {
    const retire = retireRemedy();
    return [
      fill(R.contributeChange, {
        amount: `${dong(contributeRemedy().extraPerYear as number)} ₫`,
      }),
      fill(R.retireChange, { years: String(retire.extraYears) }),
      fill(R.spendChange, {
        amount: `${dong(spendRemedy().reductionPerYear as number)} ₫`,
      }),
    ];
  }

  it.each([
    ["target", () => R.targetColumn, targetCells],
    ["change", () => R.changeColumn, changeCells],
  ])(
    "keeps the %s column's heading on one line beside its widest cell",
    (_name, heading, cells) => {
      const widest = Math.max(...cells().map((cell) => cell.length));
      const available = ROW_PX - GAP_PX - widest * VALUE_PX_PER_CHAR;
      const headingPx = heading().length * LABEL_PX_PER_CHAR;
      expect(
        headingPx,
        `"${heading()}" needs ${headingPx.toFixed(0)} px but the widest cell ` +
          `(${widest} chars) leaves ${available.toFixed(0)} px`,
      ).toBeLessThanOrEqual(available);
    },
  );

  it("leaves room for a reader's own tỷ-scale amount, not just the defaults", () => {
    // The shipped scenario is a 8-digit đồng figure. A reader entering a
    // tỷ-scale plan produces a 10-digit one — "Thêm 1.234.567.890 ₫", 20
    // characters — and the heading has to survive that too, or the defect
    // comes back on the reader's own inputs rather than on the default state.
    const widest = fill(C.form.remedies.contributeChange, {
      amount: "1.234.567.890 ₫",
    }).length;
    const available = ROW_PX - GAP_PX - widest * VALUE_PX_PER_CHAR;
    expect(
      C.form.remedies.changeColumn.length * LABEL_PX_PER_CHAR,
    ).toBeLessThanOrEqual(available);
  });

  it("keeps the desktop heading unambiguous, not just short", () => {
    // The same string is the desktop `<th>`, where there is room. A heading
    // trimmed until it no longer says what the column means would trade one
    // defect for another, so the referent lives in the table's own intro
    // paragraph — prose, where 390 px is not a constraint.
    expect(C.form.remedies.intro).toContain("so với kế hoạch hiện tại");
    expect(C.form.remedies.changeColumn.length).toBeGreaterThan(5);
  });
});

describe("phan-tich-tiet-kiem-huu-tri — provenance header", () => {
  it("records every figure the prose quotes", () => {
    const now = planAt();
    const retire = retireRemedy();
    const later = planAt({ retirementAge: retire.retirementAge as number });
    const optimistic = planAt({ returnAfterPercent: 7 });
    const contribute = contributeRemedy();
    const spend = spendRemedy();
    const oneYearLater = planAt({
      retirementAge: now.input.retirementAge + 1,
    });
    const realReturn =
      ((1 + now.input.returnAfterPercent / 100) /
        (1 + now.input.inflationPercent / 100) -
        1) *
      100;

    for (const figure of [
      dong(now.gap.realBalanceReached),
      dong(now.asEntered.balanceAtRetirement),
      dong(now.gap.realBalanceRequired),
      dong(now.asEntered.requiredBalanceAtRetirement),
      dong(now.gap.realShortfall),
      pct(now.gap.coveragePercent as number),
      dong(now.asEntered.lastWithdrawalPlanned as number),
      dong(now.asEntered.lastWithdrawalPaid as number),
      dong(now.asEntered.lastWithdrawalShortfall as number),
      dong(contribute.annualContribution as number),
      dong(contribute.monthlyEquivalent as number),
      dong(contribute.extraPerYear as number),
      dong((contribute.extraPerYear as number) / 12),
      dong(spend.annualSpending as number),
      dong(spend.reductionPerYear as number),
      pct(spend.percentOfDesired as number),
      dong(later.gap.realBalanceReached),
      dong(later.gap.realBalanceRequired),
      pct(later.gap.coveragePercent as number),
      dong(later.contribution.annualContribution as number),
      dong(optimistic.gap.realBalanceRequired),
      pct(optimistic.gap.coveragePercent as number),
      // The one-extra-year case the method paragraph turns on, and the two
      // shares FAQ 1 compares. Recorded in the header so the provenance is
      // complete rather than nearly complete.
      pct(oneYearLater.gap.coveragePercent as number),
      String(oneYearLater.asEntered.depletionAge),
      pct(100 - (now.gap.coveragePercent as number)),
      pct(
        (now.asEntered.yearsShort /
          (now.input.endAge - now.input.retirementAge)) *
          100,
      ),
      formatDecimal(realReturn, 2),
    ]) {
      expect(HEADER_COMMENT, `header comment is missing ${figure}`).toContain(
        figure,
      );
    }
  });
});
