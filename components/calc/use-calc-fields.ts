"use client";

import { useState } from "react";

/** What a field component needs to be controlled. Spread it onto the field. */
export type FieldBinding = {
  value: string;
  onValueChange: (next: string) => void;
};

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
 */
export function useCalcFields<T extends Record<string, string>>(initial: T) {
  const [values, setValues] = useState<Record<keyof T, string>>(initial);

  function bind(key: keyof T & string): FieldBinding {
    return {
      value: values[key],
      onValueChange: (next: string) =>
        setValues((current) => ({ ...current, [key]: next })),
    };
  }

  function reset() {
    setValues(initial);
  }

  return { values, bind, reset };
}
