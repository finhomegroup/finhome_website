"use client";

import { useState } from "react";
import {
  formatMoneyInput,
  formatRateInput,
  type InputFormat,
} from "@/lib/calc/number-input";

/** What a field component needs to be controlled. Spread it onto the field. */
export type FieldBinding = {
  value: string;
  onValueChange: (next: string) => void;
  /**
   * Live formatting for `NumberField`, present only for a key the form named
   * in its `FieldFormats`. `SelectField` and the other controls ignore it.
   */
  format?: InputFormat;
};

/**
 * Which of a form's keys format while the reader types, by the grammar the
 * form PARSES that key with — the display side of the dispatch every
 * calculator's parse already makes:
 *
 * - a key read through `parseMoney` is `"money"`: digits group with dots as
 *   they arrive, so a typed "2700000" shows "2.700.000";
 * - a key read through `parseDecimal` is `"rate"`: a typed "." shows as ","
 *   and nothing groups, because `parseDecimal("1.000")` is 1;
 * - a key read through `parseCount` or `parseMagnitude`, a select, a date
 *   part or a mode switch is ABSENT — `parseCount` rejects a dot, so grouping
 *   a count would invalidate it, and a year or a list is not a quantity.
 *
 * Explicit per key, written beside the parse it mirrors, never inferred from
 * the value's shape: "3.000" is rejected in a count field but means three
 * thousand in a money field. `RetirementFields` wires the same rule for its
 * eleven keys by hand; this is the general form for a calculator that binds
 * its own fields. The mapped type means a literal with a key the form does
 * not have is a compile error, not a silently unformatted field.
 */
export type FieldFormats<T extends Record<string, string>> = {
  readonly [K in keyof T]?: InputFormat;
};

/**
 * What the reader's typing leaves in each formatted field: every key named in
 * `formats` run through the grammar it names, every other key untouched. Pure,
 * and for tests — the proof that a calculator reads the same figures off the
 * formatted strings as off its raw defaults goes through this.
 */
export function formatFieldValues<T extends Record<string, string>>(
  values: T,
  formats: FieldFormats<T>,
): T {
  const next: Record<string, string> = { ...values };
  for (const key of Object.keys(formats) as (keyof T & string)[]) {
    const format = formats[key];
    if (format === "money") next[key] = formatMoneyInput(values[key]);
    else if (format === "rate") next[key] = formatRateInput(values[key]);
  }
  return next as T;
}

/**
 * Field state for a calculator form.
 *
 * Values are kept as raw STRINGS, never parsed numbers. The parse happens at
 * render time, in the calculator, so that a half-typed "7," survives in the
 * input instead of being normalised away under the user's cursor.
 *
 * `values` is widened to `string` per key rather than keeping the literal
 * types TypeScript infers from `initial`. Those literals are wrong the moment
 * the user types: a field initialised to `"no"` is not of type `"no"`, and
 * narrowing it to that turns a legitimate `values.x === "yes"` check into a
 * compile error about types with "no overlap".
 *
 * `formats` is optional and per key — see `FieldFormats`. A form that passes
 * none keeps handing every raw string up unchanged, exactly as before.
 */
export function useCalcFields<T extends Record<string, string>>(
  initial: T,
  formats?: FieldFormats<T>,
) {
  const [values, setValues] = useState<Record<keyof T, string>>(initial);

  function bind(key: keyof T & string): FieldBinding {
    const format = formats?.[key];
    return {
      value: values[key],
      onValueChange: (next: string) =>
        setValues((current) => ({ ...current, [key]: next })),
      ...(format ? { format } : {}),
    };
  }

  function reset() {
    setValues(initial);
  }

  /**
   * Replace every field at once — for a page that opens a named example the
   * reader asked for. The caller decides whether that is allowed; this never
   * runs on its own.
   */
  function load(next: Record<keyof T, string>) {
    setValues(next);
  }

  return { values, bind, reset, load };
}
