import type { RouteFieldKey } from "@/components/retirement-plan-read";
import { compactMoney, fill } from "@/lib/calc/charts/labels";
import {
  formatQuantity,
  parseCount,
  parseDecimal,
  parseMoney,
  PLACEHOLDER,
} from "@/lib/calc/number";
import { LONG_TERM_PLAN as L } from "@/content/calculators/long-term-plan";
import { RETIREMENT_PLAN as C } from "@/content/calculators/retirement-plan";

const F = C.form;
const H = C.hero;

const rate = (value: number) => formatQuantity(value, 4);

/*
 * /cong-cu/ke-hoach-huu-tri/'s sentences that RESTATE the reader's inputs:
 * which of them are still the example, what the collapsed form holds, and
 * the rates behind the conclusion. Pure builders, filled from the content
 * file; every value comes from a parse of its own field, never from a
 * formatted string.
 */

/**
 * An input amount, rounded for a summary line: "500 triệu", not "500,0
 * triệu" — the reader typed a round figure. A string operation on OUR OWN
 * `compactMoney` output, never a re-parse of a formatted figure. Results keep
 * `compactMoney` as it is.
 */
export const inputAmount = (value: number) =>
  compactMoney(value, L.money).replace(/,0(?= )/, "");

/**
 * The contribution's growth, said the way it moves — "tăng 5%/năm", "giảm
 * 3%/năm" — never "tăng -3%/năm". `each` is the per-year form for a lever's
 * accessible name.
 */
export function growthWords(percent: number | null): { phrase: string; each: string } {
  if (percent === null) return { phrase: PLACEHOLDER, each: PLACEHOLDER };
  const growth = rate(Math.abs(percent));
  const down = percent < 0;
  return {
    phrase: fill(down ? H.levers.growthDown : H.levers.growthUp, { growth }),
    each: fill(down ? H.levers.growthEachDown : H.levers.growthEachUp, { growth }),
  };
}

/** The hidden inputs the hero names while they still hold the example. */
const SAMPLE_KEYS = ["currentAge", "currentBalance", "otherMonthlyIncome", "endAge"] as const;
const RATE_KEYS = [
  "contributionGrowthPercent",
  "returnBeforePercent",
  "returnAfterPercent",
  "inflationPercent",
] as const;

/** "A, B và C" — the list grammar, from the content file. */
function listOf(items: readonly string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(H.listSeparator)}${H.listLast}${items[items.length - 1]}`;
}

/**
 * "Đang dùng số mẫu cho …", naming the hidden fields still at the shipped
 * default — or null once none is. Names, not values: the values are the
 * form summary's, and one quantity lives in one place.
 */
export function sampleLine(untouched: readonly RouteFieldKey[]): string | null {
  const still = new Set(untouched);
  const items: string[] = SAMPLE_KEYS.filter((key) => still.has(key)).map(
    (key) => H.sampleItems[key],
  );
  if (RATE_KEYS.some((key) => still.has(key))) items.push(H.sampleItems.rates);
  return items.length === 0 ? null : fill(H.sampleLine, { list: listOf(items) });
}

/**
 * The optional fields' two summary lines: every value they hold, all of which
 * move the result. Each value from its OWN field's parse, so one malformed field shows
 * the placeholder in its own slot rather than blanking the rest.
 */
export function disclosureLines(values: Readonly<Record<string, string>>): [string, string] {
  const v = (key: RouteFieldKey) => values[key] ?? "";
  const age = (key: RouteFieldKey) => {
    const n = parseCount(v(key));
    return n === null ? PLACEHOLDER : String(n);
  };
  const money = (key: RouteFieldKey) => {
    const n = parseMoney(v(key));
    return n === null || n < 0 ? PLACEHOLDER : inputAmount(n);
  };
  const pct = (key: RouteFieldKey) => {
    const n = parseDecimal(v(key));
    return n === null ? PLACEHOLDER : rate(n);
  };
  // The reader's own money first — the sample amounts decide the answer as
  // much as the rates do, and are the ones a reader can actually check.
  return [
    fill(H.disclosure.values, {
      balance: money("currentBalance"),
      contribution: money("annualContribution"),
      otherIncome: money("otherMonthlyIncome"),
      endAge: age("endAge"),
    }),
    fill(H.disclosure.rates, {
      before: pct("returnBeforePercent"),
      after: pct("returnAfterPercent"),
      inflation: pct("inflationPercent"),
      growthPhrase: growthWords(parseDecimal(v("contributionGrowthPercent"))).phrase,
    }),
  ];
}

/**
 * The reader's own rates, stated beside the conclusion they produced.
 *
 * From each rate field's OWN parse, like the form summary, so the sentence
 * keeps its place — and its caveats, "Chưa trừ thuế và phí" — while another
 * field is being retyped: a line that vanished on an unreadable field would
 * pull the form up under the reader's caret.
 */
export function assumptionsUsed(values: Readonly<Record<string, string>>): string {
  const pct = (key: RouteFieldKey) => {
    const n = parseDecimal(values[key] ?? "");
    return n === null ? PLACEHOLDER : rate(n);
  };
  return fill(F.assumptionsUsed, {
    before: pct("returnBeforePercent"),
    after: pct("returnAfterPercent"),
    inflation: pct("inflationPercent"),
    growthPhrase: growthWords(parseDecimal(values.contributionGrowthPercent ?? "")).phrase,
  });
}
