import { FLOATING_LEARNING as L } from "@/content/calculators/floating-learning";
import { fill } from "@/lib/calc/charts/labels";
import type { RateStressComparison } from "@/lib/calc/floating-loan";
import { formatMoney, formatPercent } from "@/lib/calc/number";
import { atLedgerZero } from "@/lib/calc/result-status";

/*
 * /cong-cu/lai-suat-tha-noi/'s "Xem từng tháng quanh mốc hết ưu đãi" — the
 * living-infographic F2 view (.runtime/living-next-slice.md).
 *
 * Pure: no React, no DOM. NO SECOND PAYMENT FORMULA. Every payment, interest,
 * principal and balance is a row of the schedule `compareRateStress` already
 * built for the answer rows, and every rate is a phase of that same result.
 * The only arithmetic here is a difference of two figures the engine gave
 * (a budget minus a row's payment, one row minus another) and shares of one
 * named whole.
 */

/*
 * Rounded the way the first pair's monthly ruler reads (mortgage-learning.ts):
 * a monthly amount in triệu with two decimals ("20,48 triệu"), in đồng below
 * a million rather than "0,00 triệu"; a debt in triệu with one decimal and a
 * grouped whole part ("1.951,5 triệu").
 */
const millions = (figure: number, dp: number) => `${formatMoney(figure / 1e6, dp)} triệu`;
/** A monthly amount: this month's payment, its parts, a gap, a budget. */
export const monthlyText = (figure: number) =>
  Math.abs(figure) < 1e6 ? `${formatMoney(figure)} ₫` : millions(figure, 2);
/** A debt stock. */
export const debtText = (figure: number) => millions(figure, 1);
const rounded = monthlyText;
/** Full đồng with the currency mark, for the collapsed exact reading. */
const money = (figure: number) => `${formatMoney(figure)} ₫`;
const rate = (percent: number) => `${formatPercent(percent, 2)}/năm`;
const share = (part: number, whole: number) => (whole > 0 ? (Math.max(0, part) / whole) * 100 : 0);

/** One rate phase on the term axis. */
export type FloatingPhaseMark = {
  key: string;
  fromMonth: number;
  toMonth: number;
  promo: boolean;
  /** Its months as a share of the whole term, 0–100. */
  percent: number;
};

/** One payment level at the boundary, on one axis from 0. */
export type FloatingLevel = {
  key: "promo" | "post" | "peak";
  label: string;
  value: number;
  text: string;
  percent: number;
};

export type FloatingBudgetView =
  | { state: "none"; text: string }
  | { state: "fits" | "equal" | "over"; text: string };

export type FloatingMonthView = {
  month: number;
  months: number;
  /** The first month after the promotion; null when there is none. */
  boundaryMonth: number | null;
  inPromo: boolean;
  caption: string;
  timelineTitle: string;
  phases: readonly FloatingPhaseMark[];
  /** The looked-at month's centre on the term axis, 0–100. */
  monthPercent: number;
  /** The boundary's left edge on the term axis, 0–100; null without a promotion. */
  boundaryPercent: number | null;
  ratesLine: string;
  scenarioLine: string;
  headline: string;
  shares: { principal: number; interest: number };
  shareTexts: { principal: string; interest: string };
  principalText: string;
  interestText: string;
  debtLine: string;
  /** Null unless a stress preset is chosen. */
  compare: string | null;
  budget: FloatingBudgetView;
  levels: readonly FloatingLevel[];
  /** The budget's place on the levels' axis; null without a budget. */
  budgetPercent: number | null;
  budgetText: string | null;
  /** "Ở tháng 13, khoản trả tăng khoảng …"; null without a promotion. */
  changeLine: string | null;
  exact: readonly { key: string; label: string; value: string }[];
};

/** The looked-at month: the reader's pick, clamped, else the boundary, else 1. */
export function floatingDefaultMonth(stress: RateStressComparison, picked: number | null): number {
  const months = stress.selected.loan.schedule.length;
  const boundary = boundaryOf(stress);
  const wanted = picked ?? boundary ?? 1;
  return Math.min(Math.max(1, Math.round(wanted)), months);
}

/**
 * The first post-promotional month, or null when there is no promotion.
 * `postPromoMonth` is 1 when the promotion is 0 months — that is the whole
 * term on the post rate, not a boundary.
 */
function boundaryOf(stress: RateStressComparison): number | null {
  const first = stress.selected.postPromoMonth;
  return first !== null && first > 1 ? first : null;
}

const sharePct = (percent: number) => `${formatPercent(percent, 1)}`;

/** What `formatMoney` can print; past it, it returns the "—" placeholder. */
const PRINTABLE = 1e18;
const printable = (figure: number) => Number.isFinite(figure) && Math.abs(figure) < PRINTABLE;

/**
 * The panel's state, kept apart so no state borrows another's explanation:
 *
 * - `invalid` — a field reports an error (`aria-invalid`); the fix jumps to it;
 * - `modelLimit` — every field is accepted, but the engine returned no usable
 *   schedule (e.g. an amount of 10^308). No single field is blamed: the
 *   limit belongs to the current inputs together, and the recovery opens the
 *   form rather than naming one field;
 * - `displayLimit` — the schedule is finite, but an amount this view would
 *   show (the month's payment, its parts, the debt, a boundary level, the
 *   budget, the baseline month) is past the print limit (e.g. 10^24). Nothing
 *   is drawn or quoted: bars from unprintable numbers beside "— ₫" readings
 *   would contradict each other. It carries the FIELDS that set the
 *   unprintable figures — `amount` for the loan's own amounts, `budget` for
 *   the typed budget, both when both are — so the recovery is a real one;
 * - `ready` — the view.
 */
export type FloatingLesson =
  | { kind: "invalid" }
  | { kind: "modelLimit" }
  | { kind: "rateLimit"; fields: readonly FloatingRateField[] }
  | { kind: "displayLimit"; fields: readonly ("amount" | "budget")[] }
  | { kind: "ready"; view: FloatingMonthView };

/** The rate controls a displayed rate can come from, in form order. */
export type FloatingRateField = "promoRate" | "postRate" | "adjustStep" | "rateCap";
const RATE_FIELD_ORDER: readonly FloatingRateField[] = ["promoRate", "postRate", "adjustStep", "rateCap"];

/** `formatPercent`'s own ceiling: at or past it the formatter prints "—". */
const PRINTABLE_RATE = 1e18;
const unprintableRate = (percent: number) => !(Number.isFinite(percent) && Math.abs(percent) < PRINTABLE_RATE);

/**
 * The rate controls behind any rate THIS view would print that the percent
 * formatter cannot: every phase rate (caption, rates line, top rate), the
 * requested post rate when a preset is chosen, and the capped rate when the
 * cap holds. Attribution follows how the engine builds the phases:
 *
 * - the promotional phase → the promotional rate;
 * - the first post-promotional phase → the post rate, and the cap when the
 *   engine reports it held (then the printed rate IS the cap);
 * - a later phase → the step per review (it accumulates on the post rate),
 *   and the cap when it held;
 * - the requested post rate (post rate + preset) → the post rate.
 *
 * A cap that brings every printed rate within range is honoured, not
 * reported: postRate 10^19 capped at 5% prints 5%.
 */
export function displayedRateFields(stress: RateStressComparison): FloatingRateField[] {
  const selected = stress.selected;
  const phases = selected.loan.phases;
  const boundary = boundaryOf(stress);
  const firstPost = boundary === null ? 0 : 1;
  const fields = new Set<FloatingRateField>();
  phases.forEach((phase, index) => {
    if (!unprintableRate(phase.annualRatePercent)) return;
    if (boundary !== null && index === 0) {
      fields.add("promoRate");
      return;
    }
    fields.add(index === firstPost ? "postRate" : "adjustStep");
    if (selected.cappedByRateCap) fields.add("rateCap");
  });
  if (selected.shiftPoints > 0 && unprintableRate(selected.requestedPostRatePercent)) fields.add("postRate");
  if (selected.cappedByRateCap && unprintableRate(selected.postRatePercent)) {
    fields.add("postRate");
    fields.add("rateCap");
  }
  return RATE_FIELD_ORDER.filter((field) => fields.has(field));
}

export function floatingLesson(
  stress: RateStressComparison | null,
  picked: number | null,
  budget: number | null,
  fieldsUsable: boolean,
): FloatingLesson {
  if (!fieldsUsable) return { kind: "invalid" };
  if (stress === null) return { kind: "modelLimit" };
  const schedule = stress.selected.loan.schedule;
  if (schedule.length < 1) return { kind: "modelLimit" };
  const month = floatingDefaultMonth(stress, picked);
  const row = schedule[month - 1];
  const base = stress.baseline.loan.schedule[month - 1];
  // The loan's own amounts: all set by the loan inputs, the amount first.
  const loanFigures = [
    row.payment,
    row.interest,
    row.principal,
    row.balance,
    row.balance + row.principal,
    stress.selected.loan.highestPayment,
    ...stress.selected.loan.phases.map((p) => p.payment),
    ...(stress.selected.postPromoPayment === null ? [] : [stress.selected.postPromoPayment]),
    ...(base === undefined ? [] : [base.payment]),
  ];
  if (loanFigures.some((f) => !Number.isFinite(f))) return { kind: "modelLimit" };
  // A rate the view would print, past the percent formatter's limit — even
  // while every amount is printable (1 ₫ at 10^19 %/năm).
  const rateFields = displayedRateFields(stress);
  if (rateFields.length > 0) return { kind: "rateLimit", fields: rateFields };
  const fields: ("amount" | "budget")[] = [];
  if (loanFigures.some((f) => !printable(f))) fields.push("amount");
  if (budget !== null && !printable(budget)) fields.push("budget");
  if (fields.length > 0) return { kind: "displayLimit", fields };
  const view = floatingMonthView(stress, picked, budget);
  return view === null ? { kind: "modelLimit" } : { kind: "ready", view };
}

/**
 * The panel's view of one month of the SELECTED scenario, with the baseline
 * beside it when a preset is chosen. Null when the page has no result.
 *
 * `budget` is the reader's own field, parsed, or null when blank — never a
 * figure inferred from income.
 */
export function floatingMonthView(
  stress: RateStressComparison | null,
  picked: number | null,
  budget: number | null,
): FloatingMonthView | null {
  if (stress === null) return null;
  const { selected, baseline } = stress;
  const loan = selected.loan;
  const months = loan.schedule.length;
  if (months < 1) return null;
  const month = floatingDefaultMonth(stress, picked);
  const row = loan.schedule[month - 1];
  const boundary = boundaryOf(stress);
  const inPromo = boundary !== null && month < boundary;

  const phaseOf = loan.phases.find((p) => month >= p.fromMonth && month <= p.toMonth) ?? loan.phases.at(-1)!;
  const promoPhase = boundary === null ? null : loan.phases[0];
  const postPhase = boundary === null ? loan.phases[0] : loan.phases[1];

  const phases: FloatingPhaseMark[] = loan.phases.map((p, index) => ({
    key: `phase-${index}`,
    fromMonth: p.fromMonth,
    toMonth: p.toMonth,
    promo: boundary !== null && index === 0,
    percent: share(p.toMonth - p.fromMonth + 1, months),
  }));

  // Further rate CHANGES after the first post-promotional phase. A capped
  // step leaves later phases at the same rate: those are not changes. The
  // maximum named is the POST-promotional one: a promotion above the later
  // path (15% then 5% stepping to a 7% cap) must not be called the top.
  const postPhases = loan.phases.slice(boundary === null ? 0 : 1);
  const changes = loan.phases
    .slice(boundary === null ? 1 : 2)
    .filter((p, index, list) => p.annualRatePercent !== (index === 0 ? postPhase : list[index - 1]).annualRatePercent);
  const topRate = Math.max(...postPhases.map((p) => p.annualRatePercent));
  const ratesLine = [
    boundary === null || promoPhase === null
      ? fill(L.ratesNoPromo, { postRate: rate(postPhase.annualRatePercent) })
      : fill(L.ratesPromo, {
          last: boundary - 1,
          promoRate: rate(promoPhase.annualRatePercent),
          first: boundary,
          postRate: rate(postPhase.annualRatePercent),
        }),
    changes.length > 0 ? fill(L.ratesStepped, { count: changes.length, topRate: rate(topRate) }) : null,
  ]
    .filter(Boolean)
    .join(" ");

  const scenarioLine = [
    selected.shiftPoints === 0
      ? L.scenarioBaseline
      : fill(L.scenarioShift, {
          points: selected.shiftPoints,
          rate: rate(selected.requestedPostRatePercent),
        }),
    selected.cappedByRateCap ? fill(L.scenarioCapped, { rate: rate(selected.postRatePercent) }) : null,
  ]
    .filter(Boolean)
    .join(" ");

  const principalShare = share(row.principal, row.payment);
  const interestShare = share(row.interest, row.payment);

  // The SAME month of the reader's own schedule, while a preset is chosen.
  let compare: string | null = null;
  const base = baseline.loan.schedule[month - 1];
  if (selected.shiftPoints > 0 && base !== undefined) {
    const diff = row.payment - base.payment;
    const baselineText = rounded(base.payment);
    // Why the same, from what the result shows: the promotion, which no
    // preset touches; else the engine's own cap flag (after the promotion a
    // positive preset can leave a month unchanged only if the cap holds both
    // rates at one level); else no cause is claimed.
    const sameText = inPromo
      ? L.compareSamePromo
      : selected.cappedByRateCap
        ? L.compareSameCapped
        : L.compareSameNeutral;
    compare = atLedgerZero(diff)
      ? fill(sameText, { baseline: baselineText })
      : fill(diff > 0 ? L.compareHigher : L.compareLower, {
          baseline: baselineText,
          amount: rounded(Math.abs(diff)),
        });
  }

  // ONE month's row against the budget: every sentence names that month and
  // says it is not a verdict on the other months.
  const budgetView: FloatingBudgetView =
    budget === null
      ? { state: "none", text: L.budgetNone }
      : (() => {
          const left = budget - row.payment;
          if (atLedgerZero(left)) return { state: "equal" as const, text: fill(L.budgetEqual, { month }) };
          return left > 0
            ? { state: "fits" as const, text: fill(L.budgetFits, { month, amount: rounded(left) }) }
            : { state: "over" as const, text: fill(L.budgetOver, { month, amount: rounded(-left) }) };
        })();

  // The boundary columns: the promotional payment, the first one after it,
  // and the peak ONLY when it is a genuinely later month.
  const raw: { key: FloatingLevel["key"]; label: string; value: number }[] = [];
  if (promoPhase !== null && boundary !== null) {
    raw.push({ key: "promo", label: fill(L.levelPromo, { last: boundary - 1 }), value: promoPhase.payment });
  }
  if (selected.postPromoPayment !== null && selected.postPromoMonth !== null) {
    raw.push({
      key: "post",
      label: boundary === null ? L.levelOnly : fill(L.levelPost, { month: selected.postPromoMonth }),
      value: selected.postPromoPayment,
    });
  }
  if (selected.peakMonth !== selected.postPromoMonth && selected.peakMonth !== 1) {
    raw.push({ key: "peak", label: fill(L.levelPeak, { month: selected.peakMonth }), value: loan.highestPayment });
  }
  const axis = Math.max(...raw.map((level) => level.value), budget ?? 0);
  const levels: FloatingLevel[] = raw.map((level) => ({
    ...level,
    text: rounded(level.value),
    percent: share(level.value, axis),
  }));

  let changeLine: string | null = null;
  if (promoPhase !== null && boundary !== null && selected.postPromoPayment !== null) {
    const change = selected.postPromoPayment - promoPhase.payment;
    changeLine = atLedgerZero(change)
      ? fill(L.changeSame, { month: boundary })
      : fill(change > 0 ? L.changeUp : L.changeDown, { month: boundary, amount: rounded(Math.abs(change)) });
  }

  const before = row.balance + row.principal;
  return {
    month,
    months,
    boundaryMonth: boundary,
    inPromo,
    caption: `${fill(L.caption, { month, rate: rate(phaseOf.annualRatePercent) })} (${
      boundary === null ? L.noPromo : inPromo ? L.inPromo : L.afterPromo
    })`,
    timelineTitle: fill(L.timelineTitle, { months }),
    phases,
    monthPercent: share(month - 0.5, months),
    boundaryPercent: boundary === null ? null : share(boundary - 1, months),
    ratesLine,
    scenarioLine,
    headline: fill(L.headline, { payment: rounded(row.payment) }),
    shares: { principal: principalShare, interest: interestShare },
    shareTexts: { principal: sharePct(principalShare), interest: sharePct(interestShare) },
    principalText: rounded(row.principal),
    interestText: rounded(row.interest),
    debtLine: atLedgerZero(row.balance)
      ? fill(L.paidOff, { month })
      : fill(L.debtLine, { month, after: debtText(row.balance) }),
    compare,
    budget: budgetView,
    levels,
    budgetPercent: budget === null || axis <= 0 ? null : share(budget, axis),
    budgetText: budget === null ? null : rounded(budget),
    changeLine,
    exact: [
      { key: "payment", label: L.exactPayment, value: money(row.payment) },
      { key: "interest", label: L.exactInterest, value: money(row.interest) },
      { key: "principal", label: L.exactPrincipal, value: money(row.principal) },
      { key: "before", label: L.exactBefore, value: money(before) },
      { key: "after", label: L.exactAfter, value: money(row.balance) },
    ],
  };
}
