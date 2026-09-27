/**
 * Which of the eleven shared retirement inputs format while the reader types.
 *
 * The four money fields group thousands with dots and the four rate fields
 * show a comma decimal mark; the three ages are whole counts and are left
 * alone, because `parseCount` accepts digits only and a dot there would make
 * the field invalid. Pinned on the rendered markup, where `NumberField`
 * writes the grammar it was given, and on `readRetirement`, which must read
 * the same figures off formatted strings as off the raw defaults.
 */
import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  AGE_KEYS,
  MONEY_KEYS,
  RATE_KEYS,
  RetirementFields,
  readRetirement,
  type RetirementFieldKey,
} from "@/components/calc/retirement-fields";
import { formatMoneyInput, formatRateInput } from "@/lib/calc/number-input";
import { LONG_TERM_PLAN } from "@/content/calculators/long-term-plan";

const KEYS: readonly RetirementFieldKey[] = [...AGE_KEYS, ...MONEY_KEYS, ...RATE_KEYS];

function render(values: Record<RetirementFieldKey, string>): string {
  const invalid = Object.fromEntries(KEYS.map((key) => [key, false])) as Record<
    RetirementFieldKey,
    boolean
  >;
  return renderToStaticMarkup(
    createElement(RetirementFields, {
      copy: LONG_TERM_PLAN.fields,
      invalid,
      bind: (key) => ({ value: values[key], onValueChange: () => {} }),
    }),
  );
}

function count(markup: string, needle: string): number {
  return markup.split(needle).length - 1;
}

describe("which fields format while typing", () => {
  const markup = render(LONG_TERM_PLAN.defaults);

  it("every money field groups, every rate field takes a comma, no age does", () => {
    expect(count(markup, 'data-format="money"')).toBe(MONEY_KEYS.length);
    expect(count(markup, 'data-format="rate"')).toBe(RATE_KEYS.length);
    expect(count(markup, "data-format=")).toBe(MONEY_KEYS.length + RATE_KEYS.length);
    expect(count(markup, 'inputMode="decimal"')).toBe(KEYS.length);
  });

  it("puts the money grammar on the money inputs, not merely somewhere on the page", () => {
    // Each money default is unique on the page, so the input carrying it can
    // be found and its own attributes read.
    for (const key of MONEY_KEYS) {
      const input = markup.match(
        new RegExp(`<input[^>]*value="${LONG_TERM_PLAN.defaults[key]}"[^>]*>`),
      )?.[0];
      expect(input, key).toBeDefined();
      expect(input, key).toContain('data-format="money"');
    }
  });
});

describe("readRetirement on formatted strings", () => {
  it("reads the same plan off formatted defaults as off the raw ones", () => {
    const formatted = { ...LONG_TERM_PLAN.defaults };
    for (const key of MONEY_KEYS) formatted[key] = formatMoneyInput(formatted[key]);
    for (const key of RATE_KEYS) formatted[key] = formatRateInput(formatted[key]);
    expect(readRetirement(formatted)).toEqual(readRetirement(LONG_TERM_PLAN.defaults));
    expect(readRetirement(formatted).input).not.toBeNull();
  });

  it("reads an ungrouped entry and its grouped form as one figure", () => {
    const raw = { ...LONG_TERM_PLAN.defaults, currentBalance: "1234567890,5" };
    const grouped = {
      ...LONG_TERM_PLAN.defaults,
      currentBalance: formatMoneyInput("1234567890,5"),
    };
    expect(grouped.currentBalance).toBe("1.234.567.890,5");
    expect(readRetirement(grouped).input?.currentBalance).toBe(1234567890.5);
    expect(readRetirement(grouped)).toEqual(readRetirement(raw));
  });

  it("reads a rate typed with a dot and shown with a comma as one figure", () => {
    const raw = { ...LONG_TERM_PLAN.defaults, returnBeforePercent: "7.5" };
    const shown = {
      ...LONG_TERM_PLAN.defaults,
      returnBeforePercent: formatRateInput("7.5"),
    };
    expect(shown.returnBeforePercent).toBe("7,5");
    expect(readRetirement(shown).input?.returnBeforePercent).toBe(7.5);
    expect(readRetirement(shown)).toEqual(readRetirement(raw));
  });
});
