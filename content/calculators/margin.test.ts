/**
 * Content contracts for `/cong-cu/margin-va-markup/` (plan row 61).
 *
 * THIS ROW WAS AUDITED AS COMPLETE, and re-reading the source agrees: every
 * `change`/`visual`/`lesson`/`next` item on the plan row is satisfied, there
 * is no chart because the row asked for none, and `sources` is genuinely not
 * applicable to two divisions. So nothing here is a repair.
 *
 * WHY IT STILL GETS A TEST. "Complete" is a statement about today. The page's
 * whole value is one worked counter-example — a 40% markup being a 28,57%
 * margin — carried in three places at once: the title, the notice above the
 * calculator, and the method section. A reword of any of them could quietly
 * drop the lesson while leaving a page that still looks finished, and
 * nothing would have failed. Today's clearest lesson in this suite was that
 * an invented "1–3%" range survived in `apr-advanced.ts` precisely because
 * that module had no test of its own, so a row being in good shape is not a
 * reason to leave it unguarded.
 *
 * ALSO PINNED: that this row ships NO emphasis. It is filed `direct` in
 * `content/calculators/plan-disposition.ts`, and `plan-disposition.test.ts`
 * asserts `prose.emphasis` is undefined for every `direct` row — so adding an
 * emphasis array here would turn that file red from this one. The assertion
 * below states the constraint locally, where someone editing this file will
 * see it.
 */
import { describe, expect, it } from "vitest";

import { computeMargin } from "@/lib/calc/margin";
import { formatDecimal, formatMoney, parseDecimal, parseMoney } from "@/lib/calc/number";
import { MARGIN as C } from "@/content/calculators/margin";

/** Every user-facing string in the module, by WALKING the exported object. */
function userFacingStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) for (const v of value) userFacingStrings(v, out);
  else if (value !== null && typeof value === "object")
    for (const v of Object.values(value)) userFacingStrings(v, out);
  return out;
}

/** Proper nouns a reader cannot mistake for shouting. */
const PROPER_NOUNS = ["FinHome"];

/** Runs of three or more capitals, once the proper nouns are removed. */
function shoutedRuns(strings: readonly string[]): string[] {
  const found: string[] = [];
  for (const original of strings) {
    let text = original;
    for (const noun of PROPER_NOUNS) text = text.split(noun).join(" ");
    // `\p{Lu}`, never a range like `Ạ-Ỹ` — that range spans the LOWERCASE
    // accented block, so `[Ạ-Ỹ]` matches "ạ" and the sweep reads as clean.
    for (const match of text.matchAll(/\p{Lu}{3,}/gu)) found.push(match[0]);
  }
  return [...new Set(found)];
}

const COST = parseMoney(C.form.defaultCost)!;

describe("margin-va-markup at its shipped defaults", () => {
  it("parses the cost as money and the two rates as rates", () => {
    // The cost is "600.000": `parseDecimal` reads that as 600, which would
    // price a 600.000 ₫ item at 1.000 ₫ and leave both percentages correct —
    // a defect no ratio check could see.
    expect(COST).toBe(600_000);
    expect(parseMoney(C.form.defaultPrice)).toBe(1_000_000);
    expect(parseDecimal(C.form.defaultMargin)).toBe(40);
    expect(parseDecimal(C.form.defaultMarkup)).toBe(50);
  });

  it("opens on a state where the three modes agree with each other", () => {
    // The tool converts between two rates, so its three prefilled modes must
    // describe ONE consistent shop. The price mode's 600.000 → 1.000.000 is
    // exactly the margin mode's 40%, and the markup mode's 50% is the same
    // pair read the other way round. If they ever disagreed, switching mode
    // would silently change the answer.
    const byPrice = computeMargin({
      mode: "price",
      cost: COST,
      value: parseMoney(C.form.defaultPrice)!,
    })!;
    const byMargin = computeMargin({
      mode: "margin",
      cost: COST,
      value: parseDecimal(C.form.defaultMargin)!,
    })!;
    const byMarkup = computeMargin({
      mode: "markup",
      cost: COST,
      value: parseDecimal(C.form.defaultMarkup)!,
    })!;

    expect(byPrice.price).toBe(byMargin.price);
    expect(byPrice.marginPercent).toBe(40);
    expect(byPrice.markupPercent).toBeCloseTo(100 / 1.5, 10);
    // The markup mode's own pair, which the lede quotes.
    expect(formatDecimal(byMarkup.marginPercent, 2)).toBe("33,33");
    expect(C.lede).toContain("markup 50% chỉ là margin 33,33%");
  });
});

describe("margin-va-markup's counter-example, in all three places", () => {
  // The trap, computed: wanting a 40% margin and marking cost up by 40%.
  const wanted = computeMargin({ mode: "margin", cost: COST, value: 40 })!;
  const mistake = computeMargin({ mode: "markup", cost: COST, value: 40 })!;

  it("is arithmetically what the notice says it is", () => {
    // docs §8 defect 19: a number in a sentence is a fixture nobody wrote.
    // Every figure in `trapNotice` is derived here.
    expect(wanted.price).toBe(1_000_000);
    expect(mistake.price).toBe(840_000);
    expect(formatDecimal(mistake.marginPercent, 2)).toBe("28,57");
    const shortfall = wanted.marginPercent - mistake.marginPercent;
    expect(formatDecimal(shortfall, 2)).toBe("11,43");

    expect(C.trapNotice).toContain(formatMoney(COST));
    expect(C.trapNotice).toContain(formatMoney(wanted.price));
    expect(C.trapNotice).toContain(formatMoney(mistake.price));
    expect(C.trapNotice).toContain(formatDecimal(mistake.marginPercent, 2));
    expect(C.trapNotice).toContain(formatDecimal(shortfall, 2));
  });

  it("keeps the lesson in the TITLE, where a truncated hub card still shows it", () => {
    // The row's lesson is that one profit has two numbers. It is in the page
    // `h1` itself, which is what gets linked, bookmarked and read aloud — the
    // same argument `plan-disposition.test.ts` makes about the US rows'
    // titles. A title reworded to "Công cụ tính margin" would lose it.
    // Case-folded: the title sentence-cases the first word ("Margin và
    // markup"), and a case-sensitive check fails on correct copy.
    const title = C.pageTitle.toLowerCase();
    expect(title).toContain("margin");
    expect(title).toContain("markup");
    expect(title).toContain("hai con số");
  });

  it("opens the form with a question rather than a mode name", () => {
    // Question-first, which this row already had and most of the corporate
    // set does not: the reader is asked which figure they know before being
    // shown three radio labels.
    expect(C.form.modeLegend.trim().endsWith("?")).toBe(true);
    expect(C.form.modeLegend).toContain("Bạn biết");
  });

  it("never prescribes a margin, because there is no correct one", () => {
    // The temptation on a pricing page is a benchmark, and a benchmark here
    // would be invented. The FAQ answers "how much is enough" with the only
    // defensible answer — enough to cover YOUR fixed costs — and names no
    // number. Same defect class as the "1–3%" range, in a different dress.
    const copy = userFacingStrings(C).join(" ");
    for (const range of ["1–3%", "1-3%", "35–40", "45–55", "70–80", "3–6 tháng"])
      expect(copy, `copy quotes "${range}"`).not.toContain(range);
    expect(copy).toContain("Tùy ngành");
    expect(copy).toContain("chi phí cố định của bạn");
  });

  it("shows a loss rather than refusing one", () => {
    // Selling below cost is a real situation and both rates go negative. The
    // page says it displays that instead of erroring, so it is pinned — a
    // refusal here would hide exactly the case a shop owner needs to see.
    const loss = computeMargin({ mode: "price", cost: COST, value: 500_000 })!;
    expect(loss.profit).toBeLessThan(0);
    expect(loss.marginPercent).toBeLessThan(0);
    expect(loss.markupPercent).toBeLessThan(0);
    expect(userFacingStrings(C).join(" ")).toContain("Bán dưới giá vốn");
  });
});

describe("margin-va-markup's copy hygiene", () => {
  it("ships NO emphasis, because the row is filed `direct`", () => {
    // `plan-disposition.test.ts` iterates `READING_DISPOSITIONS` and asserts
    // `prose.emphasis` is undefined for every `direct` row, and this row's
    // `formula` is wired into `CALCULATOR_PROSE`. Adding an emphasis array
    // here would turn that file red from this one, so the constraint is
    // stated where the edit would happen.
    expect("emphasis" in C.formula).toBe(false);
    expect("proseEmphasis" in C).toBe(false);
  });

  it("shouts at nobody", () => {
    // Vacuity fixtures first, in the register this suite's copy uses. This
    // module happened to be clean already, which is exactly why the fixtures
    // matter: without them a clean sweep and a broken sweep look identical.
    expect(shoutedRuns(["Margin chia lợi nhuận cho GIÁ BÁN"])).toEqual([
      "GIÁ",
      "BÁN",
    ]);
    expect(shoutedRuns(["markup KHÔNG có giới hạn trên"])).toEqual(["KHÔNG"]);
    expect(shoutedRuns(["Margin và markup: cùng một lợi nhuận"])).toEqual([]);

    expect(shoutedRuns(userFacingStrings(C))).toEqual([]);
  });

  it("carries a non-empty title, lede and at least one FAQ item", () => {
    expect(C.pageTitle.trim().length).toBeGreaterThan(5);
    expect(C.lede.trim().length).toBeGreaterThan(20);
    expect(C.faq.items.length).toBeGreaterThanOrEqual(1);
    expect(userFacingStrings(C).length).toBeGreaterThan(20);
  });
});
