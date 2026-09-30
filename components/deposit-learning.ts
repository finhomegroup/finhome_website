import { displayable, share } from "@/components/calc/accumulation";
import {
  pairBars,
  type FormValues,
  type PairBar,
  type Trial,
  type TrialAvailability,
} from "@/components/calc/learning-trials";
import { CHART_UI } from "@/content/calculators/chart-ui";
import { DEPOSIT_LEARNING as L } from "@/content/calculators/deposit-learning";
import { fill } from "@/lib/calc/charts/labels";
import { addMonths, fromDayNumber, toDayNumber, type CalendarDate } from "@/lib/calc/dates";
import { planDeposit, type DepositPlan, type DepositPlanInput } from "@/lib/calc/deposit-plan";
import { formatDecimal, formatMoney } from "@/lib/calc/number";
import { MAX_DEPOSIT_CYCLES, type DepositPayout, type TermDepositResult } from "@/lib/calc/term-deposit";

/*
 * /cong-cu/tien-gui-co-ky-han/'s cash-event panel — the pure half.
 *
 * NO INTEREST IS COMPUTED HERE. The months view reads `computeTermDeposit`'s
 * aggregates (it has no per-month schedule, and none is invented); the dates
 * view reads `planDeposit`'s real cycle dates and its cash figures. The only
 * arithmetic is shares of a named whole, day offsets from the shared calendar
 * helpers, and positions on the timeline.
 */

/** Exact đồng: the page's own rows use the same precision. */
export const dong = (figure: number) => `${formatMoney(figure)} ₫`;
/** "9", "4,5": a month count that may be the supported fractional break. */
const monthText = (months: number) =>
  Number.isInteger(months) ? formatDecimal(months, 0) : formatDecimal(months, 2).replace(/,?0+$/, "");
export const dateText = (date: CalendarDate) =>
  `${formatDecimal(date.day, 0)}/${formatDecimal(date.month, 0)}/${formatDecimal(date.year, 0)}`;

export type DepositEvent = {
  key: string;
  kind: "start" | "maturity" | "end" | "exit" | "need";
  label: string;
  /** "Tháng 6" or "31/7/2026". */
  when: string;
  /** Position on the timeline, 0–100. */
  percent: number;
};

export type DepositPart = { key: string; label: string; text: string; percent: number };

export type DepositView = {
  mode: "term" | "dates";
  caption: string;
  events: readonly DepositEvent[];
  /** "… và 8 lần đáo hạn khác" when maturities were thinned. */
  moreNote: string | null;
  state: string;
  tone: "neutral" | "caution";
  /** The split bar's named whole; null when there is no cash to split. */
  whole: string | null;
  /** A condition the whole depends on, said BEFORE the figures. */
  wholeNote: string | null;
  parts: readonly DepositPart[];
  lines: readonly string[];
};

/** At most this many maturities are drawn; the rest are counted, not hidden. */
export const MAX_DRAWN_MATURITIES = 6;

function thin<T>(items: readonly T[]): { shown: T[]; hidden: number } {
  if (items.length <= MAX_DRAWN_MATURITIES) return { shown: [...items], hidden: 0 };
  const head = items.slice(0, 3);
  const tail = items.slice(-3);
  return { shown: [...head, ...tail], hidden: items.length - 6 };
}

const signed = (value: number, positive: string, negative: string, zero: string) =>
  value === 0 ? zero : fill(value > 0 ? positive : negative, { amount: dong(Math.abs(value)) });

// ------------------------------------------------------------ months view

export type TermInputs = {
  principal: number;
  termMonths: number;
  cycles: number;
  payout: DepositPayout;
  /** The typed break month, or null when the field is blank. */
  breakAfter: number | null;
};

export function termDisplayable(result: TermDepositResult | null, principal: number): boolean {
  if (result === null) return true;
  return displayable(
    [principal, result.totalValue, result.totalInterest, result.finalPrincipal, result.earlyInterest, result.earlyForegoneInterest, result.earlyLoss].filter(
      (figure): figure is number => figure !== null,
    ),
  );
}

export function termDepositView(result: TermDepositResult | null, input: TermInputs): DepositView | null {
  if (result === null || !termDisplayable(result, input.principal)) return null;
  const total = result.totalMonths;
  const maturities = Array.from({ length: input.cycles }, (_, i) => (i + 1) * input.termMonths);
  const { shown, hidden } = thin(maturities);
  const events: DepositEvent[] = [
    { key: "start", kind: "start", label: L.events.start, when: fill(L.monthAt, { m: "0" }), percent: 0 },
    ...shown.map((month) => {
      const n = month / input.termMonths;
      const end = month === total;
      return {
        key: `maturity-${n}`,
        kind: end ? ("end" as const) : ("maturity" as const),
        label: end ? `${fill(L.events.maturity, { n: formatDecimal(n, 0) })} · ${L.events.end}` : fill(L.events.maturity, { n: formatDecimal(n, 0) }),
        when: fill(L.monthAt, { m: formatDecimal(month, 0) }),
        percent: share(month, total),
      };
    }),
  ];
  const breaking = result.earlyInterest !== null && input.breakAfter !== null;
  if (breaking) {
    events.push({
      key: "exit",
      kind: "exit",
      label: L.events.exit,
      when: fill(L.monthAt, { m: monthText(input.breakAfter as number) }),
      percent: share(input.breakAfter as number, total),
    });
  }
  events.sort((a, b) => a.percent - b.percent || (a.kind === "exit" ? 1 : -1));

  const paidAlong = input.payout !== "maturity";
  const parts: DepositPart[] = [
    { key: "principal", label: L.parts.principal, text: dong(input.principal), percent: share(input.principal, result.totalValue) },
    {
      key: "interest",
      label: paidAlong ? fill(L.parts.interestPaidAlong, { n: formatDecimal(result.payoutCount, 0) }) : L.parts.interest,
      text: dong(result.totalInterest),
      percent: share(result.totalInterest, result.totalValue),
    },
  ];

  const lines: string[] = [];
  if (result.compounded && input.cycles > 1) lines.push(fill(L.finalPrincipal, { amount: dong(result.finalPrincipal) }));
  let state: string = L.termNoBreak;
  if (breaking) {
    const m = input.breakAfter as number;
    const onMaturity = m % input.termMonths === 0;
    state = fill(onMaturity ? L.termBreakAtMaturity : L.termBreakBefore, { m: monthText(m) });
    lines.push(fill(L.termEarly, { m: monthText(m), early: dong(result.earlyInterest as number) }));
    lines.push(fill(L.termSame, { same: dong(result.earlyForegoneInterest as number) }));
    lines.push(signed(result.earlyLoss as number, L.termLossPositive, L.termLossNegative, L.termLossZero));
    if (paidAlong) lines.push(L.termPaidAlong);
  }

  return {
    mode: "term",
    caption: L.captionTerm,
    events,
    moreNote: hidden > 0 ? fill(L.events.more, { n: formatDecimal(hidden, 0) }) : null,
    state,
    tone: breaking && (input.breakAfter as number) % input.termMonths !== 0 ? "caution" : "neutral",
    whole: fill(breaking ? L.wholeTermIfHeld : L.wholeTermEnd, { m: formatDecimal(total, 0), total: dong(result.totalValue) }),
    wholeNote: paidAlong ? L.wholeNotePaidAlong : null,
    parts,
    lines,
  };
}

// ------------------------------------------------------------- dates view

export function planDisplayable(plan: DepositPlan | null): boolean {
  if (plan === null) return true;
  return displayable(
    [
      plan.availableAtNeedDate,
      plan.newPaymentAtNeedDate,
      plan.principalReturned,
      plan.interestPaidAtNeedDate,
      plan.interestAlreadyPaid,
      plan.rateDifference,
      plan.foregoneFutureInterest,
      ...plan.cycles.flatMap((cycle) => [cycle.opening, cycle.interest]),
    ].filter((figure): figure is number => figure !== null),
  );
}

export function datesDepositView(plan: DepositPlan | null, renew: boolean): DepositView | null {
  if (plan === null || !planDisplayable(plan)) return null;
  const startDay = toDayNumber(plan.cycles[0].start) as number;
  const dayOf = (date: CalendarDate) => (toDayNumber(date) as number) - startDay;
  const last = plan.cycles[plan.cycles.length - 1];
  const axis = Math.max(plan.daysFromStart, dayOf(last.maturity), 1);
  const { shown, hidden } = thin(plan.cycles);
  const events: DepositEvent[] = [
    { key: "start", kind: "start", label: L.events.start, when: dateText(plan.cycles[0].start), percent: 0 },
    ...shown.map((cycle) => ({
      key: `maturity-${cycle.index}`,
      kind: "maturity" as const,
      label: fill(L.events.maturity, { n: formatDecimal(cycle.index, 0) }),
      when: dateText(cycle.maturity),
      percent: share(dayOf(cycle.maturity), axis),
    })),
    { key: "need", kind: "need", label: L.events.need, when: dateText(plan.needDate), percent: share(plan.daysFromStart, axis) },
  ];
  events.sort((a, b) => a.percent - b.percent || (a.kind === "need" ? 1 : -1));
  const base = {
    mode: "dates" as const,
    caption: L.captionDates,
    events,
    moreNote: hidden > 0 ? fill(L.events.more, { n: formatDecimal(hidden, 0) }) : null,
  };

  if (plan.status === "beyondLimit") {
    return {
      ...base,
      state: fill(L.statusBeyond, { limit: formatDecimal(MAX_DEPOSIT_CYCLES, 0) }),
      tone: "caution",
      whole: null,
      wholeNote: null,
      parts: [],
      lines: [],
    };
  }

  const available = plan.availableAtNeedDate as number;
  const lines: string[] = [
    fill(L.available, { amount: dong(available) }),
    fill(L.newPayment, { amount: dong(plan.newPaymentAtNeedDate as number) }),
  ];
  let parts: DepositPart[];
  let state: string;
  if (plan.status === "afterMaturity") {
    // Held since maturity: the start and the interest ALREADY received make up
    // what the saver has; nothing new is paid that day.
    const initial = plan.cycles[0].opening;
    const already = plan.interestAlreadyPaid as number;
    parts = [
      { key: "principal", label: L.parts.principal, text: dong(initial), percent: share(initial, available) },
      { key: "interestAlready", label: L.parts.interestAlready, text: dong(already), percent: share(already, available) },
    ];
    state = fill(L.statusAfter, { date: dateText(plan.currentMaturity) });
  } else {
    const principal = plan.principalReturned as number;
    const interest = plan.interestPaidAtNeedDate as number;
    parts = [
      {
        key: "principal",
        label: renew && plan.termsElapsed > 1 ? L.parts.principalRenewed : L.parts.principal,
        text: dong(principal),
        percent: share(principal, available),
      },
      { key: "interestAtNeed", label: L.parts.interestAtNeed, text: dong(interest), percent: share(interest, available) },
    ];
    state = plan.status === "atMaturity" ? L.statusAt : L.statusBefore;
  }
  if (plan.status === "beforeMaturity") {
    lines.push(signed(plan.rateDifference as number, L.rateDiffPositive, L.rateDiffNegative, L.rateDiffZero));
    lines.push(
      fill(L.foregone, {
        days: formatDecimal(plan.daysToPendingMaturity as number, 0),
        amount: dong(plan.foregoneFutureInterest as number),
      }),
    );
    lines.push(L.notPenalty);
  }
  return {
    ...base,
    state,
    tone: plan.status === "beforeMaturity" ? "caution" : "neutral",
    whole: fill(L.wholeNeed, { total: dong(available) }),
    wholeNote: null,
    parts,
    lines,
  };
}

// ---------------------------------------------------------------- trials

export type DepositTrialKey = "breakBefore" | "breakAt" | "breakEnd" | "needBefore" | "needAt" | "needAfter";
export const TERM_TRIAL_KEYS: readonly DepositTrialKey[] = ["breakBefore", "breakAt", "breakEnd"];
export const DATE_TRIAL_KEYS: readonly DepositTrialKey[] = ["needBefore", "needAt", "needAfter"];

/** What was on screen when a trial was pressed. */
export type DepositSnapshot = {
  mode: "term" | "dates";
  /** The before value in words: "tháng 9" / "30/4/2026". */
  whenText: string;
  available: number | null;
};
export type DepositTrial = Trial<DepositTrialKey, DepositSnapshot>;

/**
 * The FIXED landmark each trial writes, from the typed term and cycles (or
 * deposit date): never "the next boundary" re-read after the state updates.
 * Null when the landmark does not exist or is not distinct.
 */
export function termTarget(key: DepositTrialKey, termMonths: number, cycles: number): number | null {
  const total = termMonths * cycles;
  if (key === "breakBefore") return termMonths > 1 ? termMonths - 1 : null;
  // With one cycle the first maturity IS the end of the plan: one button.
  if (key === "breakAt") return cycles > 1 ? termMonths : null;
  if (key === "breakEnd") return total;
  return null;
}

export function dateTarget(key: DepositTrialKey, start: CalendarDate, termMonths: number): CalendarDate | null {
  const first = addMonths(start, termMonths);
  if (first === null) return null;
  const day = toDayNumber(first);
  if (day === null) return null;
  const offset = key === "needBefore" ? -1 : key === "needAt" ? 0 : key === "needAfter" ? 1 : null;
  return offset === null ? null : fromDayNumber(day + offset);
}

/** The fields a trial writes, and their values. */
export function trialWrites(
  key: DepositTrialKey,
  ctx: { termMonths: number; cycles: number; start: CalendarDate | null },
): Record<string, string> | null {
  if (TERM_TRIAL_KEYS.includes(key)) {
    const month = termTarget(key, ctx.termMonths, ctx.cycles);
    return month === null ? null : { breakAfter: String(month) };
  }
  if (ctx.start === null) return null;
  const date = dateTarget(key, ctx.start, ctx.termMonths);
  return date === null
    ? null
    : { needDay: String(date.day), needMonth: String(date.month), needYear: String(date.year) };
}

export function trialLabel(
  key: DepositTrialKey,
  ctx: { termMonths: number; cycles: number; start: CalendarDate | null },
): string {
  const writes = trialWrites(key, ctx);
  // No figure to name (unreadable term or date): the same control, no "—".
  if (writes === null) return L.trialsNeutral[key];
  if (TERM_TRIAL_KEYS.includes(key)) {
    return fill(L.trials[key], { m: writes.breakAfter });
  }
  return fill(L.trials[key], {
    date: `${writes.needDay}/${writes.needMonth}/${writes.needYear}`,
  });
}

/**
 * The controls a page SHOWS. A landmark that does not exist for a readable
 * term — "1 tháng trước" on a 1-month term, "đúng đáo hạn đầu" when it IS
 * the end of a one-cycle plan — is not rendered at all. With the term
 * unreadable nothing is known, so the generic pair stays, neutrally named
 * and disabled, rather than every control vanishing.
 */
export function visibleTrialKeys(
  mode: "term" | "dates",
  ctx: { termMonths: number; cycles: number },
): readonly DepositTrialKey[] {
  if (mode === "dates") return DATE_TRIAL_KEYS;
  const known = Number.isInteger(ctx.termMonths) && ctx.termMonths >= 1 && Number.isInteger(ctx.cycles) && ctx.cycles >= 1;
  if (!known) return ["breakBefore", "breakEnd"];
  return TERM_TRIAL_KEYS.filter((key) => termTarget(key, ctx.termMonths, ctx.cycles) !== null);
}

/**
 * The plan a DATE preset would produce, from the same engine with the
 * proposed need date — so a preset is enabled only when that date actually
 * computes. A need date before the deposit, or one past the supported terms,
 * is repairable by a preset; an overflowing rate or an unsupported term is
 * not, and the engine says so by returning null for every date.
 */
export function datesTargetPlan(
  key: DepositTrialKey,
  base: Omit<DepositPlanInput, "needDate">,
): DepositPlan | null {
  const target = dateTarget(key, base.start, base.termMonths);
  return target === null ? null : planDeposit({ ...base, needDate: target });
}

/** Why a date preset is off, or null when its target computes and prints. */
export function datesTargetBlocked(key: DepositTrialKey, base: Omit<DepositPlanInput, "needDate">): string | null {
  const plan = datesTargetPlan(key, base);
  if (plan === null) return L.blocked.targetUnusable;
  return planDisplayable(plan) ? null : L.blocked.tooLarge;
}

export function depositTrialAvailability(
  key: DepositTrialKey,
  ctx: { termMonths: number; cycles: number; start: CalendarDate | null; values: FormValues; blocked: string | null },
): TrialAvailability {
  if (ctx.blocked !== null) return { enabled: false, reason: ctx.blocked };
  const writes = trialWrites(key, ctx);
  if (writes === null) return { enabled: false, reason: L.blocked.noTarget };
  const here = Object.entries(writes).every(([field, value]) => (ctx.values[field] ?? "").trim() === value);
  return here ? { enabled: false, reason: L.blocked.here } : { enabled: true };
}

export function makeDepositTrial({
  key,
  values,
  revision,
  snapshot,
  ctx,
}: {
  key: DepositTrialKey;
  values: FormValues;
  revision: number;
  snapshot: DepositSnapshot;
  ctx: { termMonths: number; cycles: number; start: CalendarDate | null; blocked: string | null };
}): DepositTrial | null {
  if (!depositTrialAvailability(key, { ...ctx, values }).enabled) return null;
  const writes = trialWrites(key, ctx);
  if (writes === null) return null;
  return { key, revision, before: { ...values }, after: { ...values, ...writes }, beforeResult: snapshot, beforeLabel: "" };
}

export type DepositImpact = {
  key: string;
  heading: string;
  lines: readonly string[];
  bars: readonly PairBar[] | null;
  barsTitle: string;
  barsNote: string;
};

export function depositImpactView(trial: DepositTrial, now: DepositSnapshot, reading: string): DepositImpact {
  const before = trial.beforeResult;
  const I = L.impact;
  const line =
    before.mode === "term"
      ? fill(I.termLine, { before: before.whenText, after: trial.after.breakAfter ?? "", reading })
      : fill(I.datesLine, { before: before.whenText, after: now.whenText, reading });
  return {
    key: trial.key,
    heading: I.heading,
    lines: [line],
    bars:
      before.available !== null && now.available !== null
        ? pairBars(before.available, now.available, { before: I.barsBefore, after: I.barsAfter }, CHART_UI.money)
        : null,
    barsTitle: I.barsTitle,
    barsNote: I.barsNote,
  };
}
