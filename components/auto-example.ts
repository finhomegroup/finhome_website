/*
 * Public named examples for /cong-cu/vay-mua-xe/ — the guide's "Thử đúng ví
 * dụ này" link (journey review 2026-09-30, step 3).
 *
 * Pure: no DOM. The calculator reads `window.location.hash` and asks these
 * functions what to do; everything here can be pinned without a browser.
 *
 * THE FRAGMENT IS AN ID, NOT DATA. Only an exact key of
 * `AUTO_LOAN.namedExamples` is recognised, so no figure can be put into the
 * form from a URL, and nothing personal is ever written to one. Static-safe:
 * a fragment never reaches a server, and the prerendered page is the default
 * example until the client reads it.
 */
import type { AutoLoanFormValues } from "@/components/auto-loan-calculator";
import { AUTO_LOAN as C } from "@/content/calculators/auto-loan";
import { valuesKey } from "@/components/calc/learning-trials";

export type AutoExampleId = keyof typeof C.namedExamples;

/** The named example a URL fragment ("#…" or bare) names, or null. */
export function namedExampleId(hash: string): AutoExampleId | null {
  const id = hash.startsWith("#") ? hash.slice(1) : hash;
  // Own keys only: "constructor" or "__proto__" in a fragment is not an example.
  return Object.prototype.hasOwnProperty.call(C.namedExamples, id)
    ? (id as AutoExampleId)
    : null;
}

/** A fresh copy of the example's form strings. */
export function namedExampleValues(id: AutoExampleId): AutoLoanFormValues {
  return { ...C.namedExamples[id].values };
}

/** The public link that opens an example. */
export function namedExampleHref(id: AutoExampleId): string {
  return `${C.slug}/#${id}`;
}

export type ExampleArrival = "load" | "offer" | "ignore";

/**
 * What a named fragment does to the form on screen.
 *
 * - no recognised ID, or the form already reads exactly the example: nothing;
 * - an UNTOUCHED form — every field at its starting values, no trial held —
 *   takes the example, because nothing the reader typed is lost;
 * - anything else keeps the reader's figures and OFFERS the example. A link
 *   must never overwrite what someone typed.
 */
export function exampleArrival(
  id: AutoExampleId | null,
  form: { untouched: boolean; values: AutoLoanFormValues },
): ExampleArrival {
  if (id === null) return "ignore";
  if (valuesKey(form.values) === valuesKey(namedExampleValues(id))) return "ignore";
  return form.untouched ? "load" : "offer";
}
