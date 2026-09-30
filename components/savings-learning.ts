import {
  accumulationSegments,
  cursorIndex,
  displayable,
  moneyText,
  share,
  type AccumulationImpact,
  type AccumulationView,
} from "@/components/calc/accumulation";
import {
  pairBars,
  stepDecimal,
  stepMoney,
  type FormValues,
  type Trial,
  type TrialAvailability,
} from "@/components/calc/learning-trials";
import { CHART_UI } from "@/content/calculators/chart-ui";
import { SAVINGS_LEARNING as L } from "@/content/calculators/savings-learning";
import { fill } from "@/lib/calc/charts/labels";
import { formatMoney, parseCount } from "@/lib/calc/number";
import type { SavingsGoalMode } from "@/lib/calc/savings-goal";
import { MAX_PROJECTION_MONTHS, type SavingsSchedule } from "@/lib/calc/savings-schedule";

/*
 * /cong-cu/muc-tieu-tiet-kiem/'s F3 panel — the pure half.
 *
 * THE ROWS ARE THE SCHEDULE'S. The cursor walks `schedule.points` by INDEX:
 * beyond 360 months those are sampled, and each still names the real month
 * it is. No month between two points is drawn, and no fraction of a
 * contribution ever is. Whether the target is reached is the engine's own
 * `fundedMonth` — no new tolerance.
 */

/** A whole count, grouped like the rest of the suite: "1.200". */
const n = (value: number) => formatMoney(value, 0);

/** Every balance, contributed total and target the vessel would print is displayable. */
export function savingsDisplayable(schedule: SavingsSchedule | null, target: number | null): boolean {
  if (schedule === null) return true;
  return displayable([
    ...schedule.points.flatMap((p) => [p.balance, p.contributed]),
    ...(target === null ? [] : [target]),
  ]);
}

/** The moment the cursor is on. Null when there is no schedule to read. */
export function savingsTimelineView(
  schedule: SavingsSchedule | null,
  mode: SavingsGoalMode,
  /** The target, ONLY in the two modes that have one; null in "target" mode. */
  target: number | null,
  picked: number | null,
): AccumulationView | null {
  if (schedule === null || schedule.status === "invalid" || schedule.points.length === 0) return null;
  if (!savingsDisplayable(schedule, mode === "target" ? null : target)) return null;
  const points = schedule.points;
  const lastIndex = points.length - 1;
  const index = cursorIndex(picked, lastIndex);
  const point = points[index];
  // The start is month 0's contributed figure: counted once, never again.
  const initial = points[0].contributed;
  const goal = mode === "target" ? null : target;
  const scale = Math.max(goal ?? 0, ...points.map((p) => p.balance));
  const segments = accumulationSegments(
    { initial, contributed: point.contributed, balance: point.balance },
    scale,
    L.segments,
  );
  const [, added, interest] = segments;

  const reachedAt = schedule.fundedMonth;
  const reached = reachedAt !== null && point.period >= reachedAt;
  const targetLine =
    goal === null
      ? null
      : reached
        ? reachedAt === 0
          ? fill(L.targetReachedStart, { target: moneyText(goal) })
          : fill(L.targetReached, { target: moneyText(goal), month: n(reachedAt) })
        : fill(L.targetShort, { target: moneyText(goal), gap: moneyText(Math.max(0, goal - point.balance)) });

  const notes: string[] = [
    mode === "contribution" ? L.solvedContribution : mode === "months" ? L.solvedMonths : L.solvedTarget,
  ];
  if (schedule.status === "alreadyFunded" && schedule.months === 0) notes.push(L.alreadyFunded);
  if (schedule.status === "unattainable") notes.push(L.unattainable);
  if (schedule.status === "beyondLimit") notes.push(fill(L.beyondLimit, { limit: n(schedule.limitMonths) }));
  if (schedule.status === "shortOfTarget") notes.push(L.shortOfTarget);
  if (schedule.sampled) notes.push(L.sampled);

  return {
    index,
    lastIndex,
    caption: point.period === 0 ? L.captionStart : fill(L.caption, { period: n(point.period) }),
    position: fill(L.position, {
      index: n(index + 1),
      count: n(points.length),
      period: n(point.period),
      months: n(schedule.months),
    }),
    balanceText: fill(L.balance, { balance: moneyText(point.balance) }),
    segments,
    targetPercent: goal === null ? null : share(goal, scale),
    targetLine,
    scaleText: fill(goal === null ? L.scaleBalance : L.scaleTarget, {
      scale: moneyText(scale),
      target: goal === null ? "" : moneyText(goal),
    }),
    sentence:
      point.period === 0
        ? fill(L.momentStart, { initial: moneyText(initial) })
        : fill(L.moment, {
            period: n(point.period),
            initial: moneyText(initial),
            added: added.text,
            interest: interest.text,
            balance: moneyText(point.balance),
          }),
    notes,
  };
}

/** The one reversible trial per mode — only ever on a TYPED field. */
export type SavingsTrialKey = "contribution" | "horizon";

/**
 * Which trial a mode offers. The contribution is an INPUT in "months" and
 * "target" modes; in "contribution" mode it is the solved figure, so the
 * trial moves the typed horizon instead — the solved field is never written.
 */
export function savingsTrialKeys(mode: SavingsGoalMode): readonly SavingsTrialKey[] {
  return mode === "contribution" ? ["horizon"] : ["contribution"];
}

/** What was on screen when a trial was pressed, from the engine only. */
export type SavingsSnapshot = {
  mode: SavingsGoalMode;
  /** The contribution the plan ran on (solved or typed). */
  contribution: number | null;
  fundedMonth: number | null;
  balance: number | null;
  totalContributed: number | null;
  interest: number | null;
};

export type SavingsTrial = Trial<SavingsTrialKey, SavingsSnapshot>;

const FIELD: Record<SavingsTrialKey, "contribution" | "months"> = { contribution: "contribution", horizon: "months" };

/** The field's next raw string, or null when the step cannot be written exactly. */
export function nextSavingsValue(key: SavingsTrialKey, raw: string): string | null {
  if (key === "contribution") return stepMoney(raw, 1_000_000);
  const next = stepDecimal(raw, 12);
  return next === null || parseCount(next) === null ? null : next;
}

export function savingsTrialAvailability(
  key: SavingsTrialKey,
  {
    usable,
    mode,
    values,
    reason = L.blocked.invalid,
  }: {
    usable: boolean;
    mode: SavingsGoalMode;
    values: FormValues;
    /** Why it is off when not usable — never "a field is wrong" when none is. */
    reason?: string;
  },
): TrialAvailability {
  if (!savingsTrialKeys(mode).includes(key)) return { enabled: false, reason: L.blocked.invalid };
  if (!usable) return { enabled: false, reason };
  const next = nextSavingsValue(key, values[FIELD[key]] ?? "");
  if (next === null) return { enabled: false, reason: L.blocked.unrepresentable };
  if (key === "horizon" && (parseCount(next) ?? Infinity) > MAX_PROJECTION_MONTHS) {
    return { enabled: false, reason: L.blocked.horizonLimit };
  }
  return { enabled: true };
}

export function makeSavingsTrial({
  key,
  values,
  revision,
  snapshot,
  usable,
}: {
  key: SavingsTrialKey;
  values: FormValues;
  revision: number;
  snapshot: SavingsSnapshot;
  usable: boolean;
}): SavingsTrial | null {
  if (!savingsTrialAvailability(key, { usable, mode: snapshot.mode, values }).enabled) return null;
  const field = FIELD[key];
  const next = nextSavingsValue(key, values[field] ?? "");
  if (next === null) return null;
  return {
    key,
    revision,
    before: { ...values },
    after: { ...values, [field]: next },
    beforeResult: snapshot,
    beforeLabel: "",
  };
}

/** The written field, for "apply" and "undo". */
export const savingsTrialField = (key: SavingsTrialKey) => FIELD[key];

/** What the latest trial did: the two engine snapshots, compared. */
export function savingsImpactView(trial: SavingsTrial, now: SavingsSnapshot): AccumulationImpact {
  const before = trial.beforeResult;
  const I = L.impact;
  const labels = { before: I.barsBefore, after: I.barsAfter };
  const base = { key: trial.key, heading: I.heading, barsNote: I.barsNote };
  if (trial.key === "horizon") {
    const bars =
      before.contribution !== null && now.contribution !== null
        ? pairBars(before.contribution, now.contribution, labels, CHART_UI.money)
        : null;
    return {
      ...base,
      barsTitle: I.barsTitleContribution,
      bars,
      lines:
        before.contribution !== null && now.contribution !== null
          ? [fill(I.contribution, { before: moneyText(before.contribution), after: moneyText(now.contribution) })]
          : [],
    };
  }
  if (before.mode === "months") {
    const b = before.fundedMonth;
    const a = now.fundedMonth;
    const line =
      a === null
        ? I.monthsStillNot
        : b === null
          ? fill(I.monthsNowReached, { after: n(a) })
          : a < b
            ? fill(I.monthsEarlier, { after: n(a), before: n(b), n: n(b - a) })
            : fill(I.monthsSame, { after: n(a) });
    return { ...base, barsTitle: "", bars: null, lines: [line] };
  }
  const ok =
    before.balance !== null &&
    now.balance !== null &&
    before.totalContributed !== null &&
    now.totalContributed !== null &&
    before.interest !== null &&
    now.interest !== null;
  return {
    ...base,
    barsTitle: I.barsTitleBalance,
    bars: ok ? pairBars(before.balance as number, now.balance as number, labels, CHART_UI.money) : null,
    lines: ok
      ? [
          fill(I.balance, {
            delta: moneyText((now.balance as number) - (before.balance as number)),
            contributed: moneyText((now.totalContributed as number) - (before.totalContributed as number)),
            interest: moneyText((now.interest as number) - (before.interest as number)),
          }),
        ]
      : [],
  };
}
