/**
 * The shared vocabulary for a calculator's SEMANTIC result state.
 *
 * Pure module: no React, no I/O, no DOM, no Vietnamese. Unit-tested in
 * `result-status.test.ts`.
 *
 * WHY AN ENUM AND NOT A COLOUR RULE. The 2026-09-27 result-status plan found
 * three pilot pages answering "đủ hay thiếu" in black on the same pale panel
 * whichever way the answer went. The obvious repair — negative red, positive
 * green — is wrong on most of this suite: a falling loan balance is good, a
 * total interest is positive and not a success, and "vượt" a savings goal is
 * good. So a tone is a MEANING, decided by a per-tool adapter from the
 * engine's own flags, and only presenters turn a meaning into a colour:
 *
 * - `shortfall` — a VALID calculation shows the goal is not reached or the
 *   budget is negative. Not an input error: a financial deficit is an answer.
 * - `met` — every essential figure is known and the tool's OWN condition is
 *   met under the reader's assumptions. Never an approval.
 * - `caution` — a defined condition, not a threshold: an exact boundary, or a
 *   cost the result leaves out while it can still be computed.
 * - `unknown` — essential data missing or invalid, no target to compare with,
 *   or a mode that only computes an assumed ceiling. The DEFAULT: a presenter
 *   given nothing shows neutral, never a stale success.
 *
 * NO ARBITRARY THRESHOLDS. The one tolerance here is `LEDGER_RESIDUE_DONG`,
 * the half đồng the chart ledgers already use to decide whether a remainder
 * EXISTS — currency resolution, not a financial judgement. There is no "gần
 * thiếu" band and no 10% rule; the plan forbids inventing one.
 */

import { LEDGER_RESIDUE_DONG } from "@/lib/calc/charts/bars";

export const RESULT_TONES = ["shortfall", "met", "caution", "unknown"] as const;

export type ResultTone = (typeof RESULT_TONES)[number];

/**
 * True when a đồng amount is zero at the currency's resolution.
 *
 * For float residue only — two computations of the same quantity landing a
 * billionth of a đồng apart. `NaN` is not zero; it is not an amount at all.
 */
export function atLedgerZero(value: number): boolean {
  return Number.isFinite(value) && Math.abs(value) < LEDGER_RESIDUE_DONG;
}
