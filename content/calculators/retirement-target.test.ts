// Route 45's copy, bound to the model it describes.
//
// WHY THIS FILE EXISTS. docs §6 records that three of this suite's five worst
// defects were invisible to a green test run because they lived in a DEFAULT
// INPUT or in a component rather than in a module. The cheapest substitute is
// to assert the module at its shipped defaults: parse the shared content
// module's own strings with the same parser the component uses, run the
// engine, format with the same formatter, and pin the result.
//
// On this route the prose IS the teaching. The notice above the calculator
// exists to say that the headline figure GROWS, and it can only say that by
// quoting the first year's figure and the last year's; the FAQ prices starting
// ten years later and contributing a level amount instead. Every one of those
// numbers is a model output, and a figure that disagrees with what the page
// renders is the worst defect available here — so each is re-derived from the
// shipped default STRINGS and asserted to occur in the sentence that quotes
// it. Move a default and the failure names the sentence that has to move with
// it.
//
// THE RATIOS ARE NOT THE USD ONES SCALED. This route shipped denominated in
// dollars, and none of its ratios survive re-denomination: a level
// contribution cost 22,8% more than the growing plan's first year and now
// costs 57,9% more; starting ten years late cost 119,3% more and now costs
// 140,3%; lifetime growth was 776,9% of what went in and is now 562,9%. The
// accumulation is 25 years here, not 30. Nothing below was converted — it was
// recomputed by running `resolveLongTermPlan`.
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { readRetirement } from "@/components/calc/retirement-fields";
import { formatDecimal, formatMoney, formatPercent } from "@/lib/calc/number";
import { resolveLongTermPlan } from "@/lib/calc/long-term-plan";
import { solveRequiredContribution } from "@/lib/calc/retirement";
import { emphasisShare, missingPhrases } from "@/lib/prose-emphasis";
import { LONG_TERM_PLAN as L } from "@/content/calculators/long-term-plan";
import { RETIREMENT_TARGET as C } from "@/content/calculators/retirement-target";

/** Exactly what the component omits, so the parse is the page's parse. */
const READ = readRetirement(L.defaults, ["annualContribution"]);

/**
 * The input this route feeds the model.
 *
 * The contribution is zeroed, for the reason the component states: this page
 * solves for it and does not render the field, so the shared scenario's
 * 60.000.000 ₫ must not sit inside the model under an input the reader cannot
 * see. `solveRequiredContribution` ignores that field anyway, so the answer is
 * the same figure the gap view prices — the merge holds either way.
 */
function shippedInput() {
  if (READ.input === null) throw new Error("the shipped defaults do not parse");
  return { ...READ.input, annualContribution: 0 };
}

function shippedPlan() {
  const plan = resolveLongTermPlan(shippedInput());
  if (plan === null) throw new Error("resolveLongTermPlan refused the defaults");
  return plan;
}

/** The same formatter the component uses. Never `Intl`. */
const dong = (value: number) => formatMoney(value);

/** Every user-facing string on the page, for the sweeps. */
function everything(): string {
  return [
    C.pageTitle,
    C.metaTitle,
    C.metaDescription,
    C.lede,
    ...Object.values(C.form).flatMap((value) =>
      typeof value === "string" ? [value] : Object.values(value),
    ),
    C.growingNotice,
    C.growingNoticeDetail,
    C.growingNoticeDetailTitle,
    ...C.formula.body,
    ...C.faq.items.flatMap((item) => [item.q, item.a]),
  ].join(" ");
}

describe("route 45 is denominated in đồng and models no country's law", () => {
  it("mentions no dollars and no United States tax vehicle", () => {
    // The registry's `usRules` flag was removed from this slug in the
    // foundation slice — `lib/calc/retirement.ts` is arithmetic on a balance,
    // a contribution, two returns and an inflation rate, and nothing in it is
    // American. What WAS American was the denomination, and the copy also
    // named 401(k), IRA and Roth as though the model knew about them.
    const text = everything();
    for (const claim of ["USD", "Hoa Kỳ", "401", "IRA", "Roth"]) {
      expect(text, `still mentions ${claim}`).not.toContain(claim);
    }
  });

  it("reads the shared scenario rather than a scenario of its own", () => {
    // Four routes, one set of assumptions, or the merge is a lie.
    expect(C.slug).toBe("/cong-cu/tinh-huu-tri");
    const input = shippedInput();
    expect(input.currentAge).toBe(35);
    expect(input.retirementAge).toBe(60);
    expect(input.endAge).toBe(85);
    expect(input.currentBalance).toBe(500_000_000);
    expect(input.desiredAnnualSpending).toBe(240_000_000);
    // A money field read with the money grammar. §4's most repeated defect.
    expect(L.defaults.currentBalance).toContain(".");
  });

  it("carries no field copy of its own", () => {
    // Eleven labels in four places is four places to edit and three to
    // forget. `LONG_TERM_PLAN.fields` is the single copy, and the shape of
    // this object is what stops a route quietly growing a second one.
    expect(C).not.toHaveProperty("fields");
  });
});

describe("route 45's prose quotes the model, not a memory of it", () => {
  const plan = shippedPlan();
  const answer = plan.contribution;
  const projection = answer.projection!;
  const input = plan.input;
  const lastYear = projection.years.filter((row) => row.accumulating).at(-1)!;
  const accumulationYears = input.retirementAge - input.currentAge;

  it("solves a contribution at all, on the shipped scenario", () => {
    // A planning tool whose default state reports "đã đủ" demonstrates
    // nothing — the judgement the shared scenario was chosen for.
    expect(answer.state).toBe("solved");
    expect(answer.annualContribution).not.toBe(null);
    expect(plan.asEntered.depletionAge).not.toBe(null);
  });

  it("quotes the first year's figure and the last year's in the notice", () => {
    // The notice exists to say the headline GROWS, which it can only do by
    // showing both ends. The monthly figures are the annual ones divided by
    // twelve, which is the only arithmetic this page's copy does.
    expect(C.growingNotice).toContain(dong(answer.annualContribution!));
    expect(C.growingNotice).toContain(dong(answer.monthlyEquivalent!));
    expect(C.growingNotice).toContain(dong(lastYear.contribution));
    expect(C.growingNotice).toContain(dong(lastYear.contribution / 12));
    // And the multiple between them, so the sentence carries the size of the
    // change rather than leaving the reader to divide.
    const multiple = lastYear.contribution / answer.annualContribution!;
    expect(C.growingNotice).toContain(`${formatDecimal(multiple, 1)} lần`);
    // The last contribution is the year BEFORE the retirement age.
    expect(lastYear.age).toBe(input.retirementAge - 1);
  });

  it("prices the level alternative in the detail panel", () => {
    // The same plan paid as a constant amount: a figure a reader can put on a
    // standing order and never revisit. Solved by the same function with the
    // growth rate set to zero, which is exactly what the field does.
    const flat = solveRequiredContribution({
      ...input,
      contributionGrowthPercent: 0,
    })!;
    const detail = C.growingNoticeDetail;
    expect(detail).toContain(dong(flat.annualContribution));
    expect(detail).toContain(dong(flat.monthlyContribution));
    const premium =
      (flat.annualContribution / answer.annualContribution! - 1) * 100;
    expect(detail).toContain(`${formatDecimal(premium, 1)}%`);
    // The reversal this route's USD copy got wrong: the level plan costs MORE
    // in year one and LESS over the whole period, because the money goes in
    // earlier and compounds for longer. Asserted on the shipped scenario, not
    // claimed in general — "do not assert an inequality that holds on your
    // fixture" cuts both ways, so the COPY says "trên các giả định mặc định"
    // and the TEST is what pins it to this one.
    expect(flat.annualContribution).toBeGreaterThan(answer.annualContribution!);
    expect(flat.projection.totalContributed).toBeLessThan(
      projection.totalContributed,
    );
    expect(detail).toContain(
      dong(projection.totalContributed - flat.projection.totalContributed),
    );
  });

  it("quotes the lifetime total against the naive multiple", () => {
    // 25 times the first year is not what the plan costs, and the gap is the
    // whole reason the notice exists.
    const naive = answer.annualContribution! * accumulationYears;
    const method = C.formula.body.join(" ");
    expect(method).toContain(dong(projection.totalContributed));
    expect(method).toContain(dong(naive));
    expect(method).toContain(String(accumulationYears));
    expect(projection.totalContributed).toBeGreaterThan(naive);
  });

  it("quotes the capital the solved plan reaches AND the capital needed", () => {
    // These are the same figure, reached two different ways: a search on the
    // year-by-year projection, and an annuity-due factor on the real return.
    // Their agreement is the page's own verification, so the method paragraph
    // that claims it has to quote the number.
    expect(projection.realBalanceAtRetirement).toBeCloseTo(
      projection.requiredRealBalanceAtRetirement,
      1,
    );
    expect(C.formula.body.join(" ")).toContain(
      dong(projection.realBalanceAtRetirement),
    );
  });

  it("quotes what ten years of waiting costs", () => {
    const late = solveRequiredContribution({
      ...input,
      currentAge: input.currentAge + 10,
    })!;
    const answerText = C.faq.items.map((item) => item.a).join(" ");
    expect(answerText).toContain(dong(late.annualContribution));
    expect(answerText).toContain(dong(late.monthlyContribution));
    const premium =
      (late.annualContribution / answer.annualContribution! - 1) * 100;
    expect(answerText).toContain(`${formatDecimal(premium, 1)}%`);
    expect(answerText).toContain(dong(late.projection.totalContributed));
  });

  it("quotes the growth and the withdrawal rate from the projection", () => {
    const answerText = C.faq.items.map((item) => item.a).join(" ");
    expect(answerText).toContain(dong(projection.totalGrowth));
    const share = (projection.totalGrowth / projection.totalContributed) * 100;
    expect(answerText).toContain(`${formatDecimal(share, 1)}%`);
    expect(projection.initialWithdrawalRatePercent).not.toBe(null);
    expect(everything()).toContain(
      formatPercent(projection.initialWithdrawalRatePercent!, 2),
    );
  });

  it("keeps the verification the result rows actually show", () => {
    // The sustainable spend the solved plan supports is the spend that was
    // asked for. Two different routes to one figure again, and the method
    // paragraph says so — so it must be true.
    expect(projection.sustainableSpending).not.toBe(null);
    expect(projection.sustainableSpending!).toBeCloseTo(
      input.desiredAnnualSpending,
      1,
    );
    expect(projection.spendingShortfall).toBe(0);
    // An ABSOLUTE bound with a reason, not `toBeCloseTo(0, 6)` — docs §8's
    // "a tolerance can be too TIGHT as well as too loose". `bisect` stops at a
    // 1e-4 bracket on the contribution and `solveRequiredContribution` then
    // steps UP by that same tolerance to settle on the funded side, so the
    // final balance is a small positive overshoot compounded to the horizon:
    // 0,0265 ₫ on a 12 tỷ plan. Under one đồng is the claim the row makes.
    expect(Math.abs(projection.finalBalance)).toBeLessThan(1);
  });
});

// Carried over from this file's pre-merge version, which was pinned entirely
// to the USD scenario. These guards are currency-INDEPENDENT and were about to
// be lost with it: the states the page distinguishes, the omitted field's
// invalid flag, and the provenance header docs §6 asks every route to keep.
describe("route 45 keeps the states apart", () => {
  it("answers 0, not a small number, when the balance already funds the plan", () => {
    const plan = resolveLongTermPlan({
      ...shippedInput(),
      currentBalance: 8_000_000_000,
    })!;
    expect(plan.contribution.state).toBe("alreadyFunded");
    expect(plan.contribution.annualContribution).toBe(0);
    expect(plan.contribution.monthlyEquivalent).toBe(0);
    expect(C.form.fundedNotice).toContain("0");
  });

  it("refuses rather than guesses when nothing in the bracket funds the plan", () => {
    const plan = resolveLongTermPlan({
      ...shippedInput(),
      desiredAnnualSpending: 5e14,
    })!;
    expect(plan.contribution.state).toBe("unreachable");
    expect(plan.contribution.annualContribution).toBe(null);
    // Three different failures, three different sentences. A shared message
    // would tell a reader to check their ages when the ages are fine.
    const notices = [
      C.form.unsolvableNotice,
      C.form.invalidNotice,
      C.form.noTimeNotice,
    ];
    expect(new Set(notices).size).toBe(notices.length);
  });

  it("never marks the solved-for field invalid", () => {
    // The omitted field is not rendered, so an invalid flag on it could never
    // be seen or corrected — it would blank the whole page with no
    // explanation of what to fix.
    const blank = readRetirement(
      { ...L.defaults, annualContribution: "" },
      ["annualContribution"],
    );
    expect(blank.invalid.annualContribution).toBe(false);
    expect(blank.input).not.toBe(null);
  });

  it("rejects a bad age through the shared reader, not through the page", () => {
    const bad = readRetirement({ ...L.defaults, retirementAge: "abc" }, [
      "annualContribution",
    ]);
    expect(bad.input).toBe(null);
    expect(bad.invalid.retirementAge).toBe(true);
  });

  it("lands the plan on zero, which is what a minimum means", () => {
    // `solveRequiredContribution` guarantees a FUNDED projection — the
    // settling step in its body exists because bisection converges on a
    // BRACKET and its midpoint can sit on the depleting side. A headline
    // saying "this funds the plan" beside a table showing depletion is the
    // contract that step protects.
    const projection = shippedPlan().contribution.projection!;
    expect(projection.depletionAge).toBe(null);
    expect(dong(projection.finalBalance)).toBe("0");
  });

  it("grows the contribution, which is the reason the notice exists", () => {
    const plan = shippedPlan();
    const projection = plan.contribution.projection!;
    const lastYear = projection.years.filter((row) => row.accumulating).at(-1)!;
    expect(lastYear.contribution).toBeGreaterThan(
      plan.contribution.annualContribution!,
    );
  });
});

describe("route 45's provenance header", () => {
  it("records every figure the prose quotes", () => {
    // The header comment is where a maintainer looks to see WHERE a quoted
    // number came from. A figure in the copy and not in the header is a figure
    // with no provenance; a figure in the header that the model no longer
    // produces is caught by the pins above.
    const source = readFileSync(
      new URL("retirement-target.ts", import.meta.url),
      "utf8",
    );
    const header = source.slice(0, source.indexOf("export const"));

    const plan = shippedPlan();
    const answer = plan.contribution;
    const projection = answer.projection!;
    const lastYear = projection.years.filter((row) => row.accumulating).at(-1)!;
    const flat = solveRequiredContribution({
      ...plan.input,
      contributionGrowthPercent: 0,
    })!;
    const late = solveRequiredContribution({
      ...plan.input,
      currentAge: plan.input.currentAge + 10,
    })!;

    for (const figure of [
      dong(answer.annualContribution!),
      dong(answer.monthlyEquivalent!),
      dong(lastYear.contribution),
      dong(lastYear.contribution / 12),
      dong(projection.totalContributed),
      dong(answer.annualContribution! * 25),
      dong(projection.totalGrowth),
      dong(projection.balanceAtRetirement),
      dong(projection.realBalanceAtRetirement),
      dong(projection.requiredRealBalanceAtRetirement),
      dong(flat.annualContribution),
      dong(flat.monthlyContribution),
      dong(flat.projection.totalContributed),
      dong(late.annualContribution),
      dong(late.monthlyContribution),
      dong(late.projection.totalContributed),
      formatPercent(projection.initialWithdrawalRatePercent!, 2),
    ]) {
      expect(header, `header comment is missing ${figure}`).toContain(figure);
    }
  });
});

describe("route 45's reading treatment", () => {
  it("declares emphasis phrases that all occur in the method", () => {
    // A declared phrase that matches nothing is a typo, a phrase that drifted
    // when a sentence was reworded, or emphasis attached to the wrong block —
    // all three are editorial defects that fail here rather than rendering as
    // ordinary text.
    const phrases = C.formula.emphasis ?? [];
    expect(phrases.length).toBeGreaterThan(0);
    expect(missingPhrases(C.formula.body, [...phrases])).toEqual([]);
  });

  it("marks each phrase in exactly ONE paragraph", () => {
    // `CalculatorPage` applies the whole list to every paragraph, so a phrase
    // present in five of them is emphasised five times — the "bold
    // everything" failure the mechanism exists to avoid.
    for (const phrase of C.formula.emphasis ?? []) {
      const hits = C.formula.body.filter((p) => p.includes(phrase)).length;
      expect(hits, `"${phrase}" occurs in ${hits} paragraphs`).toBe(1);
    }
  });

  it("keeps the emphasised share restrained", () => {
    // Emphasis everywhere is emphasis nowhere. Same ratchet the reading pass
    // applies to the nine calculator surfaces that already carry it.
    const share = emphasisShare(C.formula.body, C.formula.emphasis ?? []);
    expect(
      share,
      `emphasises ${(share * 100).toFixed(1)}% of the method`,
    ).toBeLessThan(0.2);
  });

  it("shouts nowhere mid-sentence", () => {
    // The capitals were the only emphasis available before `ProseText`
    // existed. This page shouted "GIÁ HÔM NAY" and "NĂM ĐẦU" inside
    // sentences; sentence case plus declared phrases replaces both.
    //
    // WHOLE WORDS, and the `.filter(run => run.length > 3)` this replaces is
    // why. That filter re-opened the hole the `{2,}` was there to close: it
    // discarded every two-letter shout, so "ÂM", "ÍT" and "CỐ" — all three
    // of them real lines from the investing shelf — passed. The old pattern
    // also swallowed trailing whitespace and capitals into one run, which is
    // why it needed a `.trim()` and a length filter at all.
    //
    // URLs are stripped first: a capitalised href is a path, not prose.
    const shouted = (text: string) =>
      [
        ...text
          .replace(/https?:\/\/\S+/g, " ")
          .matchAll(/(?<!\p{L})\p{Lu}{2,}(?!\p{L})/gu),
      ].map((match) => match[0]);

    // Vacuity guard first: the fixtures the weak version passed.
    expect(shouted("Nhập số ÂM cho tiền bỏ ra.")).toEqual(["ÂM"]);
    expect(shouted("GIÁ HÔM NAY của khoản tiền")).toEqual(["GIÁ", "HÔM", "NAY"]);
    expect(shouted("https://x.test/USCODE và mức cần đạt")).toEqual([]);

    expect(shouted(everything())).toEqual([]);
  });
});
