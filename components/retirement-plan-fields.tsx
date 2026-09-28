"use client";

import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import {
  MONEY_KEYS,
  RATE_KEYS,
  type FieldCopy,
} from "@/components/calc/retirement-fields";
import type { RouteFieldKey } from "@/components/retirement-plan-read";
import type { FieldBinding } from "@/components/calc/use-calc-fields";
import type { InputFormat } from "@/lib/calc/number-input";
import { LONG_TERM_PLAN as L } from "@/content/calculators/long-term-plan";
import { RETIREMENT_PLAN as C } from "@/content/calculators/retirement-plan";

/**
 * /cong-cu/ke-hoach-huu-tri/'s form in two tiers: THREE fields a reader
 * answers from memory — today's age, the age to retire at, the pension they
 * want — and the other eight, optional, behind a disclosure whose summary
 * names every value they hold.
 *
 * Route-local on purpose. `RetirementFields` serves four routes and renders
 * every group even when all its fields are omitted; the three sibling pages
 * keep it unchanged. This file uses the same primitives the same way — one
 * `NumberField` per key, the grammar dispatch below mirroring its `formatOf`,
 * the field copy from the shared scenario — and regroups them. The two
 * retirement incomes are asked per month (`retirement-plan-read.ts`).
 */

export const ESSENTIAL_KEYS = ["currentAge", "retirementAge", "desiredMonthlySpending"] as const;

/** The shared money keys plus this route's two monthly incomes. */
const MONEY: ReadonlySet<string> = new Set([
  ...MONEY_KEYS,
  "desiredMonthlySpending",
  "otherMonthlyIncome",
]);
const RATE: ReadonlySet<string> = new Set(RATE_KEYS);

/** The same dispatch `readRetirement` parses by: money groups, a rate takes a comma. */
const formatOf = (key: RouteFieldKey): InputFormat | undefined =>
  MONEY.has(key) ? "money" : RATE.has(key) ? "rate" : undefined;

const errorOf = (key: RouteFieldKey): string =>
  MONEY.has(key)
    ? L.fields.moneyInvalid
    : RATE.has(key)
      ? L.fields.rateInvalid
      : L.fields.ageInvalid;

/**
 * This route's own wording where it asks differently; the shared copy
 * elsewhere. Typed as the route's whole key set, so a key missing from both
 * is a compile error, not a render-time throw.
 */
const COPY: Record<RouteFieldKey, FieldCopy> = { ...L.fields.fields, ...C.hero.fields };
const copyOf = (key: RouteFieldKey): FieldCopy => COPY[key];

type Props = {
  invalid: Record<RouteFieldKey, boolean>;
  bind: (key: RouteFieldKey) => FieldBinding;
};

function Field({ fieldKey, invalid, bind }: Props & { fieldKey: RouteFieldKey }) {
  const copy = copyOf(fieldKey);
  return (
    <NumberField
      {...bind(fieldKey)}
      label={copy.label}
      unit={copy.unit}
      help={copy.help}
      error={errorOf(fieldKey)}
      invalid={invalid[fieldKey]}
      format={formatOf(fieldKey)}
      fieldKey={fieldKey}
    />
  );
}

/** The three fields every reader is asked for, after who they are for. */
export function RetirementEssentialFields(props: Props) {
  return (
    <FieldGroup title={C.hero.fieldGroups.essential}>
      {/* One person or the couple: decided before the first field, because
          it decides what every field holds. */}
      <p className="text-sm leading-relaxed text-ink-3">{C.hero.fieldGroups.essentialIntro}</p>
      {ESSENTIAL_KEYS.map((key) => (
        <Field key={key} fieldKey={key} {...props} />
      ))}
    </FieldGroup>
  );
}

/** The eight optional fields, grouped as the shared form groups them, in this route's words. */
export function RetirementOptionalFields(props: Props) {
  const group = (title: string, keys: readonly RouteFieldKey[], className?: string) => (
    <FieldGroup title={title} className={className}>
      {keys.map((key) => (
        <Field key={key} fieldKey={key} {...props} />
      ))}
    </FieldGroup>
  );
  return (
    <>
      {group(C.hero.fieldGroups.balance, ["currentBalance", "annualContribution", "contributionGrowthPercent"])}
      {group(C.hero.fieldGroups.incomeAndHorizon, ["otherMonthlyIncome", "endAge"], "mt-8")}
      {group(C.hero.fieldGroups.rates, ["returnBeforePercent", "returnAfterPercent", "inflationPercent"], "mt-8")}
    </>
  );
}
