// Route 50 (`/cong-cu/thu-nhap-huu-tri/`) at its shipped defaults — the
// WITHDRAWAL view of the merged long-term plan.
//
// WHY THIS FILE EXISTS, in the shape `content/calculators/long-term-plan.test.ts`
// established for route 44. docs §6 records that three of this suite's five
// worst defects were invisible to a green test run because they lived in a
// DEFAULT INPUT or in a component rather than in a module. The cheapest
// substitute is to assert the module at its shipped defaults: parse the
// content file's own strings with the same parser the component uses, run the
// engine, format with the same formatter, and pin the result.
//
// The route's prose quotes exact computed figures — a sustainable draw, the
// portfolio's share of it, the shortfall against the desired spend, the
// end-of-period annuity's overstatement, what a five-year-longer horizon
// costs. Every one of them is derived HERE from the shipped strings and
// asserted to occur in the sentence that quotes it, so moving a default is a
// red test naming the sentences that have to move with it.
//
// It replaces this file's previous contents, which pinned the superseded USD
// scenario (100.000 / 20.000 / 80.000) against prose in dollars. That scenario
// is not this route's any more — all four long-term routes read
// `LONG_TERM_PLAN.defaults`, in đồng — and the object that held it has since
// been deleted, this route having been the last of the three still reading it.
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readRetirement } from "@/components/calc/retirement-fields";
import {
  formatMoney,
  formatPercent,
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";
import {
  LONGEVITY_STRESS_YEARS,
  fundedAtBoundary,
  resolveLongTermPlan,
  type WithdrawalPath,
} from "@/lib/calc/long-term-plan";
import { projectRetirement, type RetirementInput } from "@/lib/calc/retirement";
import { emphasisShare, missingPhrases } from "@/lib/prose-emphasis";
import { LONG_TERM_PLAN as L } from "@/content/calculators/long-term-plan";
import { RETIREMENT_INCOME as C } from "@/content/calculators/retirement-income";

/**
 * The read the component performs, omit array and all.
 *
 * `omit` names the field this route SOLVES for rather than asking. It is not
 * "fed to the engine as 0": `readRetirement` parses every key it finds and
 * only skips the invalid marking, so the shared scenario's desired spend still
 * reaches the model — which is exactly what the comparison on this page is
 * against. Asserted below rather than assumed.
 */
const OMIT = ["desiredAnnualSpending"] as const;
const READ = readRetirement(L.defaults, OMIT);

function shippedPlan(over: Partial<RetirementInput> = {}) {
  if (READ.input === null) throw new Error("the shipped defaults do not parse");
  const plan = resolveLongTermPlan({ ...READ.input, ...over });
  if (plan === null) throw new Error("resolveLongTermPlan refused the defaults");
  return plan;
}

/** The same formatters the component uses. Never `Intl`. */
const dong = (value: number) => formatMoney(value);
const pct = (value: number, dp = 2) => formatPercent(value, dp);

const pathOf = (
  plan: ReturnType<typeof shippedPlan>,
  key: WithdrawalPath["key"],
) => {
  const found = plan.withdrawal.paths.find((p) => p.key === key);
  if (found === undefined) throw new Error(`no "${key}" path`);
  return found;
};

const HEADER_COMMENT = (() => {
  const file = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "retirement-income.ts",
  );
  const source = readFileSync(file, "utf8");
  return source.slice(0, source.indexOf("export const"));
})();

/** Every user-facing string in the module, for the sweeps below. */
const ALL_TEXT = JSON.stringify(C);

describe("thu-nhap-huu-tri — the shared ₫ scenario, not one of its own", () => {
  it("holds no scenario, no form copy and no dollar anywhere", () => {
    // The merge's whole point: four routes, one set of assumptions and one set
    // of field labels. A route holding its own copy of the eleven defaults or
    // the eleven labels is how the four came to disagree in the first place.
    expect(C).not.toHaveProperty("defaults");
    expect(C).not.toHaveProperty("fields");
    expect(ALL_TEXT).not.toContain("USD");
    expect(ALL_TEXT).not.toContain("$");
    // And it IS denominated: the đồng sign is the convention (docs §4).
    // The currency words are the shared ones, not a fourth copy: two pages of
    // one plan must not disagree about what a billion is called.
    expect(C.chart.currency).toBe(L.money.currency);
    expect(C.chart.million).toBe(L.money.million);
    expect(C.chart.billion).toBe(L.money.billion);
    expect(C.chart.currency).toBe("₫");
  });

  it("takes the longevity horizon from the engine, not from its prose", () => {
    // The figure's path labels are templates filled from each path's OWN
    // `endAge`, so the horizon is never typed into the copy. The method and
    // the FAQ still spell the stress in words — "sống thêm năm năm" — which no
    // template can cover, so the constant is pinned here and those sentences
    // are named in the failure.
    for (const template of [
      C.chart.asEnteredPath,
      C.chart.sustainablePath,
      C.chart.longerLifePath,
    ]) {
      expect(template).toContain("{endAge}");
      expect(template).toContain("{outcome}");
    }
    expect(C.chart.outcomeShort).toContain("{short}");
    expect(
      LONGEVITY_STRESS_YEARS,
      'the method and the FAQ say "năm năm" / "thêm năm năm" in words',
    ).toBe(5);
    const words = [C.formula.body.join(" "), C.faq.items[3].a].join(" ");
    expect(words).toContain("năm năm");
  });

  it("parses every shared default with the parser its field kind needs", () => {
    // §4's single most repeated defect, as an executable fact: the same string
    // is a 1000x different number under the two grammars.
    expect(parseMoney("500.000")).toBe(500_000);
    expect(parseDecimal("500.000")).toBe(500);
    // Every money default in the shared ₫ scenario has two groups, which
    // `parseDecimal` refuses outright rather than misreading. So the wrong
    // parser on this form is a blank answer at đồng magnitudes and a 1000x one
    // at the single-group magnitudes above — which is why the parser is picked
    // from the FIELD and not by habit.
    expect(parseMoney("240.000.000")).toBe(240_000_000);
    expect(parseDecimal("240.000.000")).toBe(null);
    expect(READ.input).not.toBe(null);
    expect(Object.values(READ.invalid).some(Boolean)).toBe(false);
    expect(READ.input).toMatchObject({
      currentAge: 35,
      retirementAge: 60,
      endAge: 85,
      currentBalance: 500_000_000,
      annualContribution: 60_000_000,
      returnAfterPercent: 5,
      inflationPercent: 4,
      desiredAnnualSpending: 240_000_000,
      otherAnnualIncome: 36_000_000,
    });
  });

  it("never marks the solved-for field invalid, but still reads its value", () => {
    // Both halves matter. The field is hidden because the page answers it; the
    // VALUE is still the benchmark every alternative path is measured against,
    // so a page that fed 0 in here would compare its answer against nothing.
    const blank = readRetirement(
      { ...L.defaults, desiredAnnualSpending: "" },
      OMIT,
    );
    expect(blank.invalid.desiredAnnualSpending).toBe(false);
    expect(blank.input).not.toBe(null);
    expect(blank.input!.desiredAnnualSpending).toBe(0);
    expect(READ.input!.desiredAnnualSpending).toBe(240_000_000);
  });
});

describe("thu-nhap-huu-tri — the draw the capital supports", () => {
  it("leads on the level real spend the capital sustains", () => {
    const plan = shippedPlan();
    const sustainable = plan.withdrawal.sustainableSpending;
    expect(sustainable).not.toBe(null);
    expect(dong(sustainable!)).toBe("219.057.403");
    expect(dong(sustainable! / 12)).toBe("18.254.784");
    const other = READ.input!.otherAnnualIncome;
    expect(dong(sustainable! - other)).toBe("183.057.403");
    expect(dong((sustainable! - other) / 12)).toBe("15.254.784");
    expect(dong(plan.withdrawal.spendingShortfall)).toBe("20.942.597");
    expect(
      pct((sustainable! / READ.input!.desiredAnnualSpending) * 100, 1),
    ).toBe("91,3%");
  });

  it("reaches that draw from the capital the four routes agree on", () => {
    // The same two figures route 44 leads with. If these ever diverge, the
    // merge is a lie and both pages are quoting their own arithmetic.
    const plan = shippedPlan();
    expect(dong(plan.asEntered.balanceAtRetirement)).toBe("10.902.417.350");
    expect(dong(plan.asEntered.realBalanceAtRetirement)).toBe("4.089.679.933");
    expect(pct(plan.asEntered.initialWithdrawalRatePercent!)).toBe("4,99%");
    // The rate THIS page reports is the sustainable draw's, not the desired
    // spend's: quoting 4,99% beside a 219 triệu answer would describe a
    // different plan.
    const sustainable = pathOf(plan, "sustainable");
    expect(
      pct(sustainable.projection.initialWithdrawalRatePercent!),
    ).toBe("4,48%");
  });

  it("resolves three alternatives in a fixed order, each with its own verdict", () => {
    const plan = shippedPlan();
    expect(plan.withdrawal.paths.map((p) => p.key)).toEqual([
      "asEntered",
      "sustainable",
      "longerLife",
    ]);

    const entered = pathOf(plan, "asEntered");
    expect(entered.annualSpending).toBe(240_000_000);
    expect(entered.funded).toBe(false);
    expect(entered.projection.depletionAge).toBe(82);
    expect(entered.projection.yearsShort).toBe(3);

    const sustainable = pathOf(plan, "sustainable");
    expect(sustainable.funded).toBe(true);
    expect(sustainable.projection.depletionAge).toBe(null);
    expect(sustainable.projection.realFinalBalance).toBeLessThan(1);

    // Longevity needs no new assumption: the same spend, a later horizon.
    const longer = pathOf(plan, "longerLife");
    expect(longer.endAge).toBe(READ.input!.endAge + LONGEVITY_STRESS_YEARS);
    expect(longer.endAge).toBe(90);
    expect(longer.annualSpending).toBe(240_000_000);
    expect(longer.funded).toBe(false);
    expect(longer.projection.yearsShort).toBe(8);
  });

  it("is the MAXIMUM the capital supports, not a safe-looking figure below it", () => {
    // Feeding the answer back in must fund the plan exactly; a million more
    // must not. Without this the page could print any number it liked.
    const plan = shippedPlan();
    const sustainable = plan.withdrawal.sustainableSpending!;
    const back = projectRetirement({
      ...READ.input!,
      desiredAnnualSpending: sustainable,
    })!;
    expect(fundedAtBoundary(back, READ.input!.endAge).funded).toBe(true);
    expect(back.realFinalBalance).toBeLessThan(1);
    const over = projectRetirement({
      ...READ.input!,
      desiredAnnualSpending: sustainable + 1_000_000,
    })!;
    expect(over.depletionAge).toBe(84);
    expect(C.formula.body.join(" ")).toContain("cạn ở tuổi 84");
  });
});

describe("thu-nhap-huu-tri — the figures its prose quotes", () => {
  it("quotes the real return as a ratio, never as a subtraction", () => {
    const input = READ.input!;
    const real =
      ((1 + input.returnAfterPercent / 100) /
        (1 + input.inflationPercent / 100) -
        1) *
      100;
    expect(pct(real)).toBe("0,96%");
    expect(pct(input.returnAfterPercent - input.inflationPercent)).toBe("1,00%");
    expect(C.formula.body.join(" ")).toContain("0,96%");
  });

  it("prices the end-of-period annuity mistake in đồng and in years", () => {
    // THE distinction this page teaches. An ordinary-annuity factor overstates
    // the safe draw by exactly (1 + real return), and the overstated figure
    // then fails to reach the horizon — so a plan reports a draw it cannot
    // actually sustain.
    const input = READ.input!;
    const plan = shippedPlan();
    const sustainable = plan.withdrawal.sustainableSpending!;
    const real =
      (1 + input.returnAfterPercent / 100) /
        (1 + input.inflationPercent / 100) -
      1;
    const overstated = sustainable * (1 + real);
    expect(dong(overstated)).toBe("221.163.724");
    expect(dong(overstated - sustainable)).toBe("2.106.321");
    const ran = projectRetirement({
      ...input,
      desiredAnnualSpending: overstated,
    })!;
    // Not forgiven by the boundary policy: it is real money, not float residue.
    expect(fundedAtBoundary(ran, input.endAge).funded).toBe(false);
    expect(ran.depletionAge).toBe(84);
    expect(dong(ran.lastWithdrawalShortfall!)).toBe("404.578.947");

    const body = C.formula.body.join(" ");
    for (const figure of [
      dong(overstated),
      dong(sustainable),
      dong(overstated - sustainable),
      dong(ran.lastWithdrawalShortfall!),
    ]) {
      expect(body, `the method never quotes ${figure}`).toContain(figure);
    }
  });

  it("quotes what living five years longer costs the draw", () => {
    const input = READ.input!;
    const plan = shippedPlan();
    const stressed = shippedPlan({ endAge: input.endAge + LONGEVITY_STRESS_YEARS });
    const other = input.otherAnnualIncome;
    const now = plan.withdrawal.sustainableSpending! - other;
    const then = stressed.withdrawal.sustainableSpending! - other;
    expect(dong(then)).toBe("156.077.672");
    expect(dong(stressed.withdrawal.sustainableSpending!)).toBe("192.077.672");
    expect(pct((1 - then / now) * 100, 1)).toBe("14,7%");
    // The notice is split across a visible sentence and its disclosure, per
    // `CalculatorPage`'s own guidance; the figures live in the second half.
    const notice = `${C.notice} ${C.noticeDetailTitle} ${C.noticeDetail}`;
    for (const figure of [dong(then), dong(now), "14,7%"]) {
      expect(notice, `the notice never quotes ${figure}`).toContain(figure);
    }
  });

  it("holds the real draw level while the nominal one more than doubles", () => {
    const plan = shippedPlan();
    const drawing = pathOf(plan, "sustainable").projection.years.filter(
      (year) => !year.accumulating,
    );
    const first = drawing[0];
    const last = drawing.at(-1)!;
    expect(first.age).toBe(60);
    expect(last.age).toBe(84);
    expect(dong(first.withdrawal)).toBe("488.001.075");
    expect(dong(last.withdrawal)).toBe("1.250.895.188");
    expect(last.withdrawal / first.withdrawal).toBeGreaterThan(2);
    // The column that stands still, which is the page's whole argument.
    const levels = new Set(drawing.map((year) => dong(year.realWithdrawal)));
    expect([...levels]).toEqual(["183.057.403"]);
    const body = C.formula.body.join(" ");
    for (const figure of [
      dong(first.withdrawal),
      dong(last.withdrawal),
      dong(first.realWithdrawal),
    ]) {
      expect(body, `the method never quotes ${figure}`).toContain(figure);
    }
  });

  it("compares against a flat 4% of the capital without endorsing one", () => {
    const plan = shippedPlan();
    const other = READ.input!.otherAnnualIncome;
    const flat = plan.asEntered.realBalanceAtRetirement * 0.04;
    const fromPortfolio = plan.withdrawal.sustainableSpending! - other;
    expect(dong(flat)).toBe("163.587.197");
    expect(pct((fromPortfolio / flat - 1) * 100, 1)).toBe("11,9%");
    const answer = C.faq.items.map((item) => item.a).join(" ");
    expect(answer).toContain(dong(flat));
    expect(answer).toContain("11,9%");
  });

  it("degenerates to capital-over-years when the real return is zero", () => {
    // The limit the annuity formula divides by zero at, and the one case where
    // the annuity-due and ordinary factors coincide.
    const input = READ.input!;
    const flat = shippedPlan({ returnAfterPercent: input.inflationPercent });
    const span = input.endAge - input.retirementAge;
    expect(span).toBe(25);
    const expected =
      flat.asEntered.realBalanceAtRetirement / span + input.otherAnnualIncome;
    expect(flat.withdrawal.sustainableSpending!).toBeCloseTo(expected, 6);
    expect(dong(flat.withdrawal.sustainableSpending!)).toBe("199.587.197");
    expect(C.faq.items.map((item) => item.a).join(" ")).toContain(
      dong(flat.withdrawal.sustainableSpending!),
    );
  });

  it("quotes the purchasing power an unindexed payment keeps", () => {
    const input = READ.input!;
    const years = input.retirementAge - input.currentAge;
    const kept = 1 / Math.pow(1 + input.inflationPercent / 100, years);
    expect(pct(kept * 100, 1)).toBe("37,5%");
    expect(C.faq.items.map((item) => item.a).join(" ")).toContain("37,5%");
  });
});

/**
 * Character bound for a column heading in a REAL table at 390 px.
 *
 * MEASURED, not guessed. At a 390 px viewport this figure's table is 300 px
 * wide. Three columns, of which two carry numbers and need roughly 60-90 px,
 * so the auto-layout left the third heading about 60 px — and a 32-character
 * heading ("Vốn còn lại cuối kỳ, giá hôm nay") wrapped there to six lines,
 * "Vốn / còn lại / cuối / kỳ, giá / hôm / nay". Because table cells stretch to
 * the tallest, that made the whole `<thead>` 129 px for a three-row table: a
 * wall of fragments above the data. 13 characters is what survives in two
 * lines at that width.
 *
 * WHY A CARD-LABEL BOUND WOULD NOT HAVE CAUGHT IT. `ResultTable`'s
 * `mobileCards` fallback is for a table too wide to read at 390 px, and docs
 * §3 sets it "from five columns up" — so this three-column table correctly has
 * none and renders as a real table at 390, where the starvation arrives
 * through column auto-layout instead of through a two-track grid. Rows 45 and
 * 48 each pinned a bound for the card mechanism; this is the same failure
 * class through the other one.
 *
 * The fix for a heading that wants to say more is to move the qualification
 * into `tableHint`, which is full-width prose above the table and has no such
 * constraint. The test below holds that the qualification was MOVED and not
 * deleted, because a shorter heading that loses the deflator would be a worse
 * defect than a tall one.
 *
 * A ratchet at today's maximum, exactly like `MAX_EMPHASIS_SHARE`: it stops a
 * new heading making this worse. It is not a licence to trim the others, which
 * a desktop reader still has to be able to tell apart.
 */
const MAX_COLUMN_HEADING_CHARS = 13;

describe("thu-nhap-huu-tri — the figure's table at 390 px", () => {
  it("keeps every column heading short enough to survive the width", () => {
    // Every heading this figure can render, including the empty model's.
    const headings = {
      ageColumn: C.chart.ageColumn,
      yearColumn: C.chart.yearColumn,
      realColumn: C.chart.realColumn,
      periodColumn: C.chart.periodColumn,
    };
    for (const [key, heading] of Object.entries(headings)) {
      expect(
        heading.length,
        `${key} is ${heading.length} characters ("${heading}"), over the ${MAX_COLUMN_HEADING_CHARS}-character bound a 390 px column leaves`,
      ).toBeLessThanOrEqual(MAX_COLUMN_HEADING_CHARS);
    }
  });

  it("keeps the qualification a short heading cannot carry, in the hint", () => {
    // The deflator and the horizon are what the long heading was for. Dropping
    // them would turn a layout fix into a correctness one: "Vốn còn lại" alone
    // does not say WHEN, and on this figure each path has its own horizon.
    expect(C.chart.realColumn).not.toContain("hôm nay");
    expect(C.chart.tableHint).toContain("cuối kỳ");
    expect(C.chart.tableHint).toContain("theo giá hôm nay");
    // And the hint names the column it is qualifying, so the two cannot drift.
    expect(C.chart.tableHint).toContain(C.chart.realColumn);
  });

  it("still tells the two numeric columns apart", () => {
    // The other half of the bound. A heading trimmed to fit that a desktop
    // reader cannot distinguish from its neighbour is not a fix.
    expect(C.chart.realColumn).not.toBe(C.chart.yearColumn);
    expect(C.chart.realColumn.length).toBeGreaterThan(4);
    expect(C.chart.yearColumn.length).toBeGreaterThan(4);
  });
});

describe("thu-nhap-huu-tri — reading treatment", () => {
  it("shouts nowhere in a sentence", () => {
    // ALL-CAPS mid-sentence was doing the work typography should. `\p{Lu}`
    // rather than a hand-written character class: Vietnamese capitals live
    // in three Unicode blocks, and an `Ạ-Ỹ` range spans the LOWERCASE
    // accented letters between them, so the class version reports "ượ" as
    // shouting.
    //
    // TWO CORRECTIONS to the version this replaces, both of them holes
    // rather than preferences:
    //
    // 1. WHOLE WORDS at two letters, not runs of three. The three-letter
    //    minimum read as clean over lines that shout in two-letter words —
    //    "ÂM", "ÍT", "CỐ" all shipped on the investing shelf and none was
    //    reported. Vietnamese is full of two-letter words. The word
    //    boundary is what lets the minimum drop without reporting the "IR"
    //    inside a mixed-case token.
    // 2. WALK THE OBJECT instead of listing fields. The list below used to
    //    be seven hand-written entries covering 27 of this module's 96
    //    strings: every form label, help line and error, both meta strings
    //    and the chart column headings were unscanned. A field list goes
    //    stale the moment a field is added, and `noticeDetail` itself is a
    //    field that arrived after the first version of this test.
    //
    // URLs are stripped first — a capitalised href is a path, not prose.
    const everyString = (value: unknown, out: string[] = []): string[] => {
      if (typeof value === "string") out.push(value);
      else if (Array.isArray(value))
        for (const v of value) everyString(v, out);
      else if (value !== null && typeof value === "object")
        for (const v of Object.values(value)) everyString(v, out);
      return out;
    };
    const shouted = (text: string) =>
      [
        ...text
          .replace(/https?:\/\/\S+/g, " ")
          .matchAll(/(?<!\p{L})\p{Lu}{2,}(?!\p{L})/gu),
      ].map((match) => match[0]);

    // Vacuity guard first, on the shapes this page really shipped plus the
    // two-letter case the old rule missed.
    expect(shouted("theo GIÁ HÔM NAY")).toEqual(["GIÁ", "HÔM", "NAY"]);
    expect(shouted("Nhập số ÂM cho tiền bỏ ra.")).toEqual(["ÂM"]);
    expect(shouted("nguồn https://x.test/USCODE-2024 đã dẫn")).toEqual([]);

    for (const text of everyString(C)) {
      const found = shouted(text);
      expect(
        found,
        `"${found[0]}" is shouted in: ${text.slice(0, 60)}…`,
      ).toEqual([]);
    }
  });

  it("declares emphasis that actually occurs, once each", () => {
    const { body, emphasis } = C.formula;
    expect(emphasis.length).toBeGreaterThan(0);
    expect(missingPhrases(body, emphasis)).toEqual([]);
    // `CalculatorPage` applies the whole list to EVERY paragraph, so a phrase
    // occurring in two of them is emphasised twice.
    for (const phrase of emphasis) {
      const hits = body.filter((paragraph) => paragraph.includes(phrase));
      expect(hits.length, `"${phrase}" occurs in ${hits.length} paragraphs`).toBe(
        1,
      );
    }
    // No duplicates: a phrase declared twice reads as two editorial decisions.
    expect(new Set(emphasis).size).toBe(emphasis.length);
  });

  it("marks the annuity convention, which is what this page is about", () => {
    // Route 44 emphasises the same phrase for the same reason. The
    // end-of-period factor is the error that makes a plan report "đủ" and then
    // fall short, and it is the one distinction a reader cannot infer.
    expect(C.formula.emphasis).toContain("niên kim đầu kỳ");
  });

  it("keeps the emphasised share under the ratchet", () => {
    // MAX_EMPHASIS_SHARE for a calculator's method is 0,2. Emphasis everywhere
    // is emphasis nowhere; route 44 landed at 12,6%.
    const share = emphasisShare(C.formula.body, C.formula.emphasis);
    expect(share, `emphasises ${(share * 100).toFixed(1)}% of the method`).toBeLessThan(
      0.2,
    );
  });

  it("keeps the disclaimer clause check:markup counts", () => {
    // The shared long-term override replaces what FOLLOWS the opening clause
    // and never the clause itself; replacing the whole text failed the gate
    // with "one disclaimer: found 0".
    expect(L.scope.disclaimer).toContain(
      "Công cụ này chỉ mang tính minh họa",
    );
  });
});

describe("thu-nhap-huu-tri — provenance header", () => {
  it("records every figure the prose quotes", () => {
    const input = READ.input!;
    const plan = shippedPlan();
    const sustainable = plan.withdrawal.sustainableSpending!;
    const other = input.otherAnnualIncome;
    const stressed = shippedPlan({
      endAge: input.endAge + LONGEVITY_STRESS_YEARS,
    });
    const drawing = pathOf(plan, "sustainable").projection.years.filter(
      (year) => !year.accumulating,
    );
    const real =
      (1 + input.returnAfterPercent / 100) /
        (1 + input.inflationPercent / 100) -
      1;
    for (const figure of [
      dong(sustainable),
      dong(sustainable / 12),
      dong(sustainable - other),
      dong((sustainable - other) / 12),
      dong(plan.withdrawal.spendingShortfall),
      dong(plan.asEntered.balanceAtRetirement),
      dong(plan.asEntered.realBalanceAtRetirement),
      dong(drawing[0].withdrawal),
      dong(drawing.at(-1)!.withdrawal),
      dong(sustainable * (1 + real)),
      dong(stressed.withdrawal.sustainableSpending! - other),
      dong(plan.asEntered.realBalanceAtRetirement * 0.04),
    ]) {
      expect(HEADER_COMMENT, `header comment is missing ${figure}`).toContain(
        figure,
      );
    }
  });
});
