"use client";

import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import type { FieldBinding } from "@/components/calc/use-calc-fields";
import { parseDecimal, parseMoney } from "@/lib/calc/number";
import type { RetirementInput } from "@/lib/calc/retirement";

/**
 * The shared input block for the five retirement projection pages.
 *
 * Extracted because five pages read the SAME eleven inputs off the same
 * engine. `docs/calculator-suite-status.md` §3 says the third tool to need
 * a repeated primitive should extract it; this is the fifth.
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
 * `omit` names fields the page solves for rather than asking. An omitted
 * field is never marked invalid and its value is fed to the engine as 0,
 * which the solving pages then override.
 */
export function readRetirement(
  values: Record<string, string>,
  omit: readonly RetirementFieldKey[] = [],
): RetirementRead {
  const skipped = new Set<RetirementFieldKey>(omit);
  const invalid = {} as Record<RetirementFieldKey, boolean>;
  const numbers = {} as Record<RetirementFieldKey, number>;

  for (const key of AGE_KEYS) {
    const value = parseMoney(values[key] ?? "");
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

/** Defaults every page starts from, overridden per page where it matters. */
export const RETIREMENT_DEFAULTS: Record<RetirementFieldKey, string> = {
  currentAge: "35",
  retirementAge: "65",
  endAge: "95",
  currentBalance: "100.000",
  annualContribution: "20.000",
  contributionGrowthPercent: "2",
  returnBeforePercent: "7",
  returnAfterPercent: "5",
  inflationPercent: "2,5",
  desiredAnnualSpending: "80.000",
  otherAnnualIncome: "25.000",
};
