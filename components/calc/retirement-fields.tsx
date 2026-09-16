"use client";

import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import type { FieldBinding } from "@/components/calc/use-calc-fields";
import {
  formatMoney,
  parseCount,
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";
import type { RetirementInput } from "@/lib/calc/retirement";
import { LONG_TERM_PLAN } from "@/content/calculators/long-term-plan";

/**
 * The shared input block for the four retirement projection pages.
 *
 * Extracted because four pages read the SAME eleven inputs off the same
 * engine — `ke-hoach-huu-tri`, `tinh-huu-tri`, `thu-nhap-huu-tri` and
 * `phan-tich-tiet-kiem-huu-tri`. `docs/calculator-suite-status.md` §3 says
 * the third tool to need a repeated primitive should extract it.
 *
 * `phan-tich-thu-nhap-huu-tri` was expected to be the fifth and is not: it
 * needs a per-source indexation rate that `retirement.ts` does not model, so
 * it has its own engine and its own fields. Its divergence is the point of
 * that page, not an oversight — see `lib/calc/retirement-income-sources.ts`.
 *
 * Two fields are optional, because two of the pages SOLVE for them rather
 * than asking: `tinh-huu-tri` solves the contribution, and `thu-nhap-huu-tri`
 * solves the spending. Hiding a field the page does not read is not
 * cosmetic — a visible input that has no effect on the answer is a page
 * lying about what it does.
 *
 * All user-facing text arrives from the page's content object. This
 * component only knows the shape and the validation rules.
 */

export const AGE_KEYS = ["currentAge", "retirementAge", "endAge"] as const;
export const MONEY_KEYS = [
  "currentBalance",
  "annualContribution",
  "desiredAnnualSpending",
  "otherAnnualIncome",
] as const;
export const RATE_KEYS = [
  "contributionGrowthPercent",
  "returnBeforePercent",
  "returnAfterPercent",
  "inflationPercent",
] as const;

export type RetirementFieldKey =
  | (typeof AGE_KEYS)[number]
  | (typeof MONEY_KEYS)[number]
  | (typeof RATE_KEYS)[number];

/** Label, unit and help for one field, supplied by the page. */
export type FieldCopy = { label: string; unit?: string; help: string };

export type RetirementCopy = {
  ageGroup: string;
  balanceGroup: string;
  spendingGroup: string;
  rateGroup: string;
  ageInvalid: string;
  moneyInvalid: string;
  rateInvalid: string;
  fields: Record<RetirementFieldKey, FieldCopy>;
};

export type RetirementRead = {
  /** Parsed input, or null when any shown field is unusable. */
  input: RetirementInput | null;
  invalid: Record<RetirementFieldKey, boolean>;
};

/**
 * Parse the raw strings.
 *
 * `omit` names fields the page solves for rather than asking, and it does
 * exactly ONE thing: it suppresses that field's invalid marking. It does NOT
 * withhold the value. Every key is parsed from `values` unconditionally, and
 * the `?? 0` below is the fallback for an unparseable string — not for an
 * omitted field.
 *
 * So an omitted field still reaches the engine carrying whatever `values`
 * holds for it, which since the shared defaults landed is a real figure the
 * reader can neither see nor change. An earlier version of this comment
 * claimed the value "is fed to the engine as 0"; that was false, and two
 * pages each worked around it differently before it was caught.
 *
 * A page that omits a field therefore owns a decision, and must make it
 * explicitly:
 *
 * - zero it in the component, when the field genuinely plays no part in the
 *   answer (`tinh-huu-tri` does this, and its funded-boundary fixture depends
 *   on it — without the zeroing that plan funds outright); or
 * - present it as a stated assumption, when the answer IS measured against it
 *   (`thu-nhap-huu-tri` renders the shared plan's desired spend as a labelled
 *   row, because its shortfall is the distance from that figure).
 *
 * Neither is more correct in general. What is wrong is leaving it implicit.
 */
export function readRetirement(
  values: Record<string, string>,
  omit: readonly RetirementFieldKey[] = [],
): RetirementRead {
  const skipped = new Set<RetirementFieldKey>(omit);
  const invalid = {} as Record<RetirementFieldKey, boolean>;
  const numbers = {} as Record<RetirementFieldKey, number>;

  for (const key of AGE_KEYS) {
    // An age is a whole count, so `parseCount`: `parseMoney` read "3.5" as
    // 35 and marked it valid, because it discards "." as grouping before the
    // `Number.isInteger` guard below ever runs.
    const value = parseCount(values[key] ?? "");
    numbers[key] = value ?? 0;
    invalid[key] =
      !skipped.has(key) &&
      (value === null || !Number.isInteger(value) || value < 0 || value > 120);
  }

  for (const key of MONEY_KEYS) {
    const value = parseMoney(values[key] ?? "");
    numbers[key] = value ?? 0;
    invalid[key] = !skipped.has(key) && (value === null || value < 0);
  }

  for (const key of RATE_KEYS) {
    const value = parseDecimal(values[key] ?? "");
    numbers[key] = value ?? 0;
    invalid[key] =
      !skipped.has(key) && (value === null || value < -100 || value > 100);
  }

  const anyInvalid = Object.values(invalid).some(Boolean);

  // The engine rejects contradictory ages itself; returning the numbers and
  // letting it decide keeps one authority on what a valid plan is.
  return {
    input: anyInvalid
      ? null
      : {
          currentAge: numbers.currentAge,
          retirementAge: numbers.retirementAge,
          endAge: numbers.endAge,
          currentBalance: numbers.currentBalance,
          annualContribution: numbers.annualContribution,
          contributionGrowthPercent: numbers.contributionGrowthPercent,
          returnBeforePercent: numbers.returnBeforePercent,
          returnAfterPercent: numbers.returnAfterPercent,
          inflationPercent: numbers.inflationPercent,
          desiredAnnualSpending: numbers.desiredAnnualSpending,
          otherAnnualIncome: numbers.otherAnnualIncome,
        },
    invalid,
  };
}

export function RetirementFields({
  copy,
  invalid,
  bind,
  omit = [],
  className,
}: {
  copy: RetirementCopy;
  invalid: Record<RetirementFieldKey, boolean>;
  /**
   * Typed to the field keys rather than `string`: a function accepting a
   * wider key union is still assignable here, so a page that holds extra
   * state of its own composes fine, while a typo in a key name does not.
   */
  bind: (key: RetirementFieldKey) => FieldBinding;
  /** Fields the page solves for, which must not be rendered. */
  omit?: readonly RetirementFieldKey[];
  className?: string;
}) {
  const skipped = new Set<RetirementFieldKey>(omit);

  const field = (key: RetirementFieldKey, error: string) =>
    skipped.has(key) ? null : (
      <NumberField
        key={key}
        {...bind(key)}
        label={copy.fields[key].label}
        unit={copy.fields[key].unit}
        help={copy.fields[key].help}
        error={error}
        invalid={invalid[key]}
      />
    );

  return (
    <>
      <FieldGroup title={copy.ageGroup} className={className}>
        {AGE_KEYS.map((key) => field(key, copy.ageInvalid))}
      </FieldGroup>

      <FieldGroup title={copy.balanceGroup} className="mt-8">
        {field("currentBalance", copy.moneyInvalid)}
        {field("annualContribution", copy.moneyInvalid)}
        {field("contributionGrowthPercent", copy.rateInvalid)}
      </FieldGroup>

      <FieldGroup title={copy.spendingGroup} className="mt-8">
        {field("desiredAnnualSpending", copy.moneyInvalid)}
        {field("otherAnnualIncome", copy.moneyInvalid)}
      </FieldGroup>

      <FieldGroup title={copy.rateGroup} className="mt-8">
        {field("returnBeforePercent", copy.rateInvalid)}
        {field("returnAfterPercent", copy.rateInvalid)}
        {field("inflationPercent", copy.rateInvalid)}
      </FieldGroup>
    </>
  );
}

/**
 * One đồng amount, formatted once for all four routes.
 *
 * The parse side of this module dispatches four grammars by field kind (§4);
 * the format side belongs beside it for the same reason — a route that
 * hand-rolled its own suffix is how four pages of ONE plan came to render the
 * same quantity four ways. The four previously each held
 * `` `${formatMoney(v)} USD` ``, which is the line the currency change is
 * actually about.
 *
 * `formatMoney`, never `Intl` or `toLocaleString`: these pages are prerendered
 * at their defaults and the client must hydrate to byte-identical strings.
 * The symbol comes from the content module, so no Vietnamese-facing string is
 * invented here.
 */
export function longTermMoney(value: number, dp = 0): string {
  return `${formatMoney(value, dp)} ${LONG_TERM_PLAN.money.currency}`;
}

/*
 * `RETIREMENT_DEFAULTS` used to live here: the pre-merge USD scenario every
 * retirement page started from. Its own docstring said "delete it when the
 * last of the three migrates", and all four long-horizon routes now read
 * `LONG_TERM_PLAN.defaults` from `content/calculators/long-term-plan.ts`
 * instead — one đồng scenario, so the four views cannot disagree.
 *
 * Worth keeping the defect it caused, because the shape recurs: its money
 * strings were written in Vietnamese grammar ("100.000", "2,5") and parsed by
 * the right parser, so nothing about the GRAMMAR was wrong. Only the
 * magnitudes were dollars. A page reading it therefore rendered one hundred
 * thousand đồng of retirement savings under a correct-looking đồng label, and
 * every test passed, because the tests pinned the strings rather than asking
 * whether the figure was a plausible quantity of the currency it claimed.
 */
