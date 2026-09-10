"use client";

import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import type { FieldBinding } from "@/components/calc/use-calc-fields";
import { parseMoney } from "@/lib/calc/number";
import type { FinancialsInput } from "@/lib/calc/financials";

/**
 * The thirteen statement lines both financial-statement calculators need.
 *
 * Shared because `/cong-cu/cac-chi-so-tai-chinh/` and
 * `/cong-cu/phan-tich-bao-cao-tai-chinh/` read the SAME statements — the
 * second just reads two periods of them. Duplicating thirteen labelled money
 * fields twice over would be 26 chances for the two pages to disagree about
 * what "chi phí hoạt động" means.
 *
 * Labels come in from the page's content object, so no user-facing text lives
 * here. The component only knows the shape.
 */

/** Keys in the order they appear, grouped as a reader would expect. */
export const INCOME_KEYS = [
  "revenue",
  "costOfGoodsSold",
  "operatingExpenses",
  "interestExpense",
  "taxExpense",
] as const;

export const ASSET_KEYS = [
  "cash",
  "receivables",
  "inventory",
  "otherCurrentAssets",
  "nonCurrentAssets",
] as const;

export const LIABILITY_KEYS = [
  "currentLiabilities",
  "longTermDebt",
  "otherNonCurrentLiabilities",
] as const;

export const STATEMENT_KEYS = [
  ...INCOME_KEYS,
  ...ASSET_KEYS,
  ...LIABILITY_KEYS,
] as const;

export type StatementKey = (typeof STATEMENT_KEYS)[number];

/** Label and help text for one line, supplied by the page. */
export type LineCopy = { label: string; help: string };

export type StatementCopy = {
  incomeGroup: string;
  assetGroup: string;
  liabilityGroup: string;
  invalid: string;
  unit: string;
  lines: Record<StatementKey, LineCopy>;
};

/**
 * Parse a set of raw statement strings.
 *
 * Returns the numbers alongside a per-key invalid flag, so the page can mark
 * the offending field rather than blanking every result.
 */
export function readStatement(
  values: Record<string, string>,
  prefix = "",
): {
  input: Omit<FinancialsInput, "sharesOutstanding" | "sharePrice"> | null;
  invalid: Record<StatementKey, boolean>;
} {
  const parsed = {} as Record<StatementKey, number | null>;
  const invalid = {} as Record<StatementKey, boolean>;

  for (const key of STATEMENT_KEYS) {
    const raw = values[`${prefix}${key}`] ?? "";
    const value = parseMoney(raw);
    parsed[key] = value;
    // Every statement line is a magnitude: a negative cost or balance is a
    // data-entry error, not a company. Losses come out of the arithmetic.
    invalid[key] = value === null || value < 0;
  }

  const anyInvalid = STATEMENT_KEYS.some((key) => invalid[key]);
  if (anyInvalid) return { input: null, invalid };

  return {
    input: {
      revenue: parsed.revenue!,
      costOfGoodsSold: parsed.costOfGoodsSold!,
      operatingExpenses: parsed.operatingExpenses!,
      interestExpense: parsed.interestExpense!,
      taxExpense: parsed.taxExpense!,
      cash: parsed.cash!,
      receivables: parsed.receivables!,
      inventory: parsed.inventory!,
      otherCurrentAssets: parsed.otherCurrentAssets!,
      nonCurrentAssets: parsed.nonCurrentAssets!,
      currentLiabilities: parsed.currentLiabilities!,
      longTermDebt: parsed.longTermDebt!,
      otherNonCurrentLiabilities: parsed.otherNonCurrentLiabilities!,
    },
    invalid,
  };
}

/** The three field groups for one period's statements. */
export function StatementFields({
  copy,
  invalid,
  bind,
  prefix = "",
  titleSuffix = "",
  className,
}: {
  copy: StatementCopy;
  invalid: Record<StatementKey, boolean>;
  bind: (key: string) => FieldBinding;
  /** Prefix on the field keys, for a page holding two periods. */
  prefix?: string;
  /** Appended to each group title, e.g. " — năm nay". */
  titleSuffix?: string;
  className?: string;
}) {
  const group = (title: string, keys: readonly StatementKey[], first: boolean) => (
    <FieldGroup
      title={`${title}${titleSuffix}`}
      className={first ? className : "mt-8"}
    >
      {keys.map((key) => (
        <NumberField
          key={key}
          {...bind(`${prefix}${key}`)}
          label={copy.lines[key].label}
          unit={copy.unit}
          help={copy.lines[key].help}
          error={copy.invalid}
          invalid={invalid[key]}
        />
      ))}
    </FieldGroup>
  );

  return (
    <>
      {group(copy.incomeGroup, INCOME_KEYS, true)}
      {group(copy.assetGroup, ASSET_KEYS, false)}
      {group(copy.liabilityGroup, LIABILITY_KEYS, false)}
    </>
  );
}
