/**
 * Multi-stage dividend discount model, for
 * /cong-cu/co-phieu-tang-truong-khong-deu/.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in `ddm-multi.test.ts`.
 *
 * The Gordon model needs growth below the required return forever, which
 * rules out exactly the companies people want to value: the ones growing
 * faster than their cost of capital right now. This module splits the future
 * in two — an explicit high-growth stretch, then Gordon on the tail — so
 * `highGrowth` may exceed the required return while `terminalGrowth` may not.
 *
 * Two things the tests pin because they are easy to get wrong by one period:
 *
 * - The terminal value is computed at the END of the high-growth stretch,
 *   from the dividend of the year AFTER it: `D(n+1) ÷ (r − g_terminal)`. Then
 *   it is discounted back n periods, not n+1.
 * - Setting both growth rates equal must reproduce the plain Gordon value
 *   exactly, for any length of high-growth stretch. That single property
 *   catches almost every indexing mistake.
 *
 * `terminalSharePercent` is the figure worth reading: on any realistic input
 * most of the value sits in the terminal, which means most of the answer
 * comes from the assumption nobody can check.
 */

/** Hard ceiling on the explicit stretch — beyond this the model is fiction. */
const MAX_HIGH_GROWTH_YEARS = 20;

export type DdmMultiInput = {
  /** The dividend just paid (D0), in đồng per share. */
  dividend: number;
  /** Growth during the explicit stretch, in percent per year. */
  highGrowthPercent: number;
  /** Length of the explicit stretch, in whole years. */
  highGrowthYears: number;
  /** Perpetual growth after the stretch, in percent per year. */
  terminalGrowthPercent: number;
  /** Required rate of return, in percent per year. */
  requiredReturnPercent: number;
};

export type DdmMultiYear = {
  /** 1-based year. */
  year: number;
  /** Dividend paid that year. */
  dividend: number;
  /** That dividend discounted back to today. */
  presentValue: number;
};

export type DdmMultiResult = {
  /** One row per year of the explicit stretch. */
  years: DdmMultiYear[];
  /** Present value of the explicit dividends. */
  pvOfDividends: number;
  /** The dividend of the year AFTER the stretch — D(n+1). */
  terminalDividend: number;
  /** Gordon value at the end of the stretch. */
  terminalValue: number;
  /** That value discounted back n years. */
  pvOfTerminalValue: number;
  /** The two present values added. */
  intrinsicValue: number;
  /** How much of the value comes from the terminal, in percent. */
  terminalSharePercent: number;
};

/**
 * Value a share on two stages of dividend growth.
 *
 * Null when the model cannot price the inputs: a non-positive dividend, a
 * high-growth stretch that is not a whole number of years between 1 and 20, a
 * terminal growth rate at or above the required return, or any non-finite
 * number.
 *
 * `highGrowthPercent` is deliberately NOT capped by the required return —
 * being able to exceed it for a while is the reason this model exists.
 */
export function computeDdmMulti(
  input: DdmMultiInput,
): DdmMultiResult | null {
  const {
    dividend,
    highGrowthPercent,
    highGrowthYears,
    terminalGrowthPercent,
    requiredReturnPercent,
  } = input;

  const numbers = [
    dividend,
    highGrowthPercent,
    highGrowthYears,
    terminalGrowthPercent,
    requiredReturnPercent,
  ];
  if (numbers.some((value) => !Number.isFinite(value))) return null;
  if (dividend <= 0) return null;
  if (
    highGrowthYears < 1 ||
    highGrowthYears > MAX_HIGH_GROWTH_YEARS ||
    !Number.isInteger(highGrowthYears)
  ) {
    return null;
  }
  // Only the TERMINAL rate is bounded: perpetual growth at or above the
  // required return has no finite value.
  if (terminalGrowthPercent >= requiredReturnPercent) return null;

  const high = highGrowthPercent / 100;
  const terminal = terminalGrowthPercent / 100;
  const required = requiredReturnPercent / 100;

  const years: DdmMultiYear[] = [];
  let pvOfDividends = 0;

  for (let year = 1; year <= highGrowthYears; year += 1) {
    const paid = dividend * (1 + high) ** year;
    const presentValue = paid / (1 + required) ** year;
    if (!Number.isFinite(presentValue)) return null;
    pvOfDividends += presentValue;
    years.push({ year, dividend: paid, presentValue });
  }

  // D(n+1): the last explicit dividend grown at the TERMINAL rate, because
  // the first year of the tail already grows at the tail's rate.
  const lastExplicit = years[years.length - 1].dividend;
  const terminalDividend = lastExplicit * (1 + terminal);
  const terminalValue = terminalDividend / (required - terminal);
  // Discounted back n years, not n + 1: the terminal value is already stated
  // as of the end of year n.
  const pvOfTerminalValue =
    terminalValue / (1 + required) ** highGrowthYears;
  if (!Number.isFinite(pvOfTerminalValue)) return null;

  const intrinsicValue = pvOfDividends + pvOfTerminalValue;
  if (!Number.isFinite(intrinsicValue) || intrinsicValue <= 0) return null;

  return {
    years,
    pvOfDividends,
    terminalDividend,
    terminalValue,
    pvOfTerminalValue,
    intrinsicValue,
    terminalSharePercent: (pvOfTerminalValue / intrinsicValue) * 100,
  };
}
