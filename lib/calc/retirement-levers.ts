/**
 * The three levers of /cong-cu/ke-hoach-huu-tri/'s hero: what one press of
 * "−" or "+" writes into a field, or why it writes nothing.
 *
 * Pure module: no React, no DOM, no Vietnamese. Unit-tested in
 * `retirement-levers.test.ts`.
 *
 * A LEVER TYPES FOR THE READER. Its output is the next raw STRING of the
 * field, in the field's own grammar, written through the same binding typing
 * uses — so a press and a keystroke cannot disagree about what the plan is.
 * Money steps the integer đồng digits and keeps a typed ",fraction" verbatim,
 * which is exactly the grouping `formatMoneyInput` would give: no float, no
 * re-parse of a formatted figure. Ages step a `parseCount` whole number.
 *
 * THE STEP IS IN THE ENGINE'S UNIT. `annualContribution` is credited once at
 * the start of each year and grows by `contributionGrowthPercent`, so the
 * step is "12 triệu/năm", never "1 triệu/tháng": on the route's defaults one
 * step is about 658 triệu of extra deposits by retirement, not 300. What a
 * step is worth in total is `contributionDelta` in `retirement-lever-facts.ts`
 * — a difference of two engine projections, not new arithmetic.
 */

import { formatMoney, parseCount, parseMoney } from "@/lib/calc/number";

/** One saving press, in đồng per year. The copy says "12 triệu/năm". */
export const LEVER_STEP_PER_YEAR = 12_000_000;

/**
 * One pension press, in đồng per MONTH — the route asks for the pension per
 * month. The copy says "1 triệu/tháng"; to the engine it is exactly 12 triệu
 * a year, because a spend in today's money has no timing of its own.
 */
export const LEVER_STEP_PER_MONTH = 1_000_000;

/**
 * Redeclared here: `lib/` does not import from `components/`. The pension is
 * the route's monthly field, `desiredMonthlySpending`.
 */
export type LeverKey =
  | "annualContribution"
  | "retirementAge"
  | "desiredMonthlySpending";

export const LEVER_KEYS: readonly LeverKey[] = [
  "annualContribution",
  "retirementAge",
  "desiredMonthlySpending",
];

export type LeverBlock =
  /** The field (or an age it depends on) does not parse. */
  | "unreadable"
  /** Already 0 ₫. */
  | "atMinimum"
  /** Retirement cannot come before today. */
  | "atEarliestAge"
  /** Retirement has to come before the end age. */
  | "atLatestAge"
  /** Retiring today: there is no year left to save in. */
  | "noAccumulationYears"
  /** The next figure would leave the exact-integer range. */
  | "tooLarge"
  /** The typed retirement age is before today; only "+" moves it back. */
  | "beforeCurrentAge"
  /** The typed retirement age is at or after the end age; only "−" helps. */
  | "afterEndAge"
  /** Today is not before the end age, so no retirement age is valid. */
  | "noValidAge";

export type LeverStep = { next: string | null; block: LeverBlock | null };

const blocked = (block: LeverBlock): LeverStep => ({ next: null, block });
const to = (next: string): LeverStep => ({ next, block: null });

/** The money grammar `parseMoney` accepts, unsigned: integer digits, fraction. */
const MONEY_PARTS = /^([\d.]*)(,\d*)?$/;

/**
 * Step a money field by `step` đồng in `direction`.
 *
 * Below zero clamps to "0" once — dropping any typed fraction, so a press on
 * "5.000.000,5" lands on "0" rather than looping at "0,5" — and a press at 0
 * is `atMinimum`.
 */
export function stepMoneyField(
  raw: string,
  direction: 1 | -1,
  step: number = LEVER_STEP_PER_YEAR,
): LeverStep {
  const trimmed = raw.trim();
  const value = parseMoney(trimmed);
  const parts = MONEY_PARTS.exec(trimmed);
  if (value === null || value < 0 || parts === null) return blocked("unreadable");
  const digits = parts[1].replace(/\./g, "");
  const whole = digits === "" ? 0 : Number(digits);
  if (!Number.isSafeInteger(whole)) return blocked("tooLarge");
  const next = whole + direction * step;
  if (!Number.isSafeInteger(next)) return blocked("tooLarge");
  if (next < 0) return value > 0 ? to("0") : blocked("atMinimum");
  return to(`${formatMoney(next, 0)}${parts[2] ?? ""}`);
}

/**
 * Step the retirement age by one year in `direction`, inside
 * [`currentAge`, `endAge − 1`].
 *
 * A press from OUTSIDE that range moves toward it instead of being refused —
 * the near-retiree who typed their own age over the default 35 presses "+"
 * and lands on today — while the press that would move further away names
 * why.
 */
export function stepRetirementAge(
  ages: { currentAge: string; retirementAge: string; endAge: string },
  direction: 1 | -1,
): LeverStep {
  const current = parseCount(ages.currentAge);
  const retirement = parseCount(ages.retirementAge);
  const end = parseCount(ages.endAge);
  if (current === null || retirement === null || end === null) {
    return blocked("unreadable");
  }
  const earliest = current;
  const latest = end - 1;
  if (earliest > latest) return blocked("noValidAge");
  if (retirement > latest) {
    return direction === -1 ? to(String(latest)) : blocked("afterEndAge");
  }
  if (retirement < earliest) {
    return direction === 1 ? to(String(earliest)) : blocked("beforeCurrentAge");
  }
  const next = retirement + direction;
  if (next < earliest) return blocked("atEarliestAge");
  if (next > latest) return blocked("atLatestAge");
  return to(String(next));
}

export type Lever = { key: LeverKey; down: LeverStep; up: LeverStep };

/**
 * The three levers, saving first. Each reads its OWN field, so a malformed
 * neighbour never blanks a lever — except the ages the retirement lever and
 * the saving lever's "no year left to save" rule genuinely depend on.
 */
export function retirementLevers(values: Readonly<Record<string, string>>): Lever[] {
  const v = (key: string) => values[key] ?? "";
  const current = parseCount(v("currentAge"));
  const retirement = parseCount(v("retirementAge"));
  // Retiring TODAY leaves no year to save in. A retirement age before today
  // is an input out of order — the age lever says so — not "retiring now".
  const retiringToday =
    current !== null && retirement !== null && retirement === current;

  const money = (key: LeverKey, step: number): Lever => ({
    key,
    down: stepMoneyField(v(key), -1, step),
    up: stepMoneyField(v(key), 1, step),
  });
  const saving: Lever = retiringToday
    ? { key: "annualContribution", down: blocked("noAccumulationYears"), up: blocked("noAccumulationYears") }
    : money("annualContribution", LEVER_STEP_PER_YEAR);
  const ages = {
    currentAge: v("currentAge"),
    retirementAge: v("retirementAge"),
    endAge: v("endAge"),
  };
  return [
    saving,
    {
      key: "retirementAge",
      down: stepRetirementAge(ages, -1),
      up: stepRetirementAge(ages, 1),
    },
    money("desiredMonthlySpending", LEVER_STEP_PER_MONTH),
  ];
}
