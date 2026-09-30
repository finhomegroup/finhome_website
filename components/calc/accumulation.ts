import { formatMoney, PLACEHOLDER } from "@/lib/calc/number";
import type { PairBar } from "@/components/calc/learning-trials";

/*
 * The F3 accumulation view, shared by /cong-cu/muc-tieu-tiet-kiem/ and
 * /cong-cu/lai-kep/ (living infographic, 2026-09-29).
 *
 * Pure: no React, no DOM. It only SHAPES rows an engine already returned —
 * `projectSavings`' sampled points, `computeCompound`'s credited snapshots —
 * into one moment of a vessel: the starting money, the money added since,
 * and the interest, each a share of ONE named scale. No balance is computed
 * here; no point between two engine rows is invented.
 */

export type AccumulationSegmentKey = "initial" | "added" | "interest";

export type AccumulationSegment = {
  key: AccumulationSegmentKey;
  label: string;
  /** Share of the vessel's named scale, 0–100. */
  percent: number;
  text: string;
};

/** One moment of the vessel, as the panel draws it. */
export type AccumulationView = {
  /** Index into the engine's rows, and the last one. */
  index: number;
  lastIndex: number;
  /** The moment in words: "Tháng 24", "Sau 1,5 năm (3 kỳ ghép lãi)". */
  caption: string;
  /** The cursor's place in the rows: "Điểm 25/61". */
  position: string;
  balanceText: string;
  segments: readonly AccumulationSegment[];
  /** The target's height on the scale; null where there is no target. */
  targetPercent: number | null;
  /** The target in words at this moment; null without a target. */
  targetLine: string | null;
  /** What 100% of the vessel is. */
  scaleText: string;
  /** One plain sentence about this moment. */
  sentence: string;
  /** Conditions that qualify every figure (sampling, uncredited time, state). */
  notes: readonly string[];
};

/** What the latest trial did, from two engine results. */
export type AccumulationImpact = {
  key: string;
  heading: string;
  lines: readonly string[];
  bars: readonly PairBar[] | null;
  barsTitle: string;
  barsNote: string;
};

/**
 * A money figure the reader compares: triệu with one decimal and a grouped
 * whole part ("506,6 triệu"), đồng below a million. Coarse tỷ rounding hid
 * real differences on the comparison pair (2026-09-29 review).
 */
export function moneyText(figure: number): string {
  return Math.abs(figure) < 1e6 ? `${formatMoney(figure)} ₫` : `${formatMoney(figure / 1e6, 1)} triệu`;
}

/**
 * True when every figure is inside the suite's DISPLAY capability — the
 * boundary `formatMoney` already owns (it returns `PLACEHOLDER` past it). A
 * vessel whose amounts would print "— triệu", or whose added money has
 * vanished into float precision beside a huge start, is not ready data: the
 * panel says so instead. No second threshold is defined here.
 */
export function displayable(figures: readonly number[]): boolean {
  return figures.every((figure) => formatMoney(figure) !== PLACEHOLDER);
}

export const share = (part: number, whole: number) =>
  whole > 0 && Number.isFinite(whole) ? (Math.max(0, part) / whole) * 100 : 0;

/**
 * The three parts of one engine row: what the saver started with, what was
 * put in since (never counting the start twice), and what the rate added.
 * A float residue below zero is shown as 0, never as a negative interest.
 */
export function accumulationSegments(
  row: { initial: number; contributed: number; balance: number },
  scale: number,
  labels: Record<AccumulationSegmentKey, string>,
): AccumulationSegment[] {
  const added = Math.max(0, row.contributed - row.initial);
  const interest = Math.max(0, row.balance - row.contributed);
  return [
    { key: "initial", label: labels.initial, percent: share(row.initial, scale), text: moneyText(row.initial) },
    { key: "added", label: labels.added, percent: share(added, scale), text: moneyText(added) },
    { key: "interest", label: labels.interest, percent: share(interest, scale), text: moneyText(interest) },
  ];
}

/** The cursor clamped to the rows; null means "the last row". */
export function cursorIndex(picked: number | null, lastIndex: number): number {
  if (picked === null || !Number.isFinite(picked)) return lastIndex;
  return Math.min(Math.max(0, Math.round(picked)), lastIndex);
}
