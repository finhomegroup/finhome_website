/** /cong-cu/tinh-phan-tram/'s living ruler, pure half, against `computePercent`. */
import { describe, expect, it } from "vitest";
import { decimalsFor, eqResult, eqTerms } from "@/components/arith-learning-display";
import {
  makePercentTrial,
  nextPercentValue,
  percentAvailability,
  percentEquation,
  percentFormState,
  percentImpact,
  percentLesson,
  percentSnapshot,
} from "@/components/percent-learning";
import { heldTrials, initialTrialState, trialReducer } from "@/components/calc/learning-trials";
import { ARITH_WORDS as W } from "@/content/calculators/arith-learning-words";
import { PERCENT as C } from "@/content/calculators/percent";
import { PERCENT_LEARNING as L } from "@/content/calculators/percent-learning";

const M = C.form.modes;
const DEFAULTS: Record<string, string> = {
  mode: "of",
  ofPercent: M.of.defaultA,
  ofTotal: M.of.defaultB,
  sharePart: M.share.defaultA,
  shareWhole: M.share.defaultB,
  changeFrom: M.change.defaultA,
  changeTo: M.change.defaultB,
  pointsFrom: M.points.defaultA,
  pointsTo: M.points.defaultB,
};
const at = (patch: Record<string, string> = {}) => percentFormState({ ...DEFAULTS, ...patch });
const ready = (patch: Record<string, string> = {}, focus: "a" | "b" = "a") => {
  const l = percentLesson(at(patch), focus);
  if (l.kind !== "ready") throw new Error(l.kind);
  return l;
};
const HUGE = `1${"0".repeat(308)}`;

describe("the four modes map to the engine's own figures", () => {
  it("of: 30% of 2 tỷ = 600 triệu, the part inside the base on one ruler", () => {
    expect(percentSnapshot(at())!.answer).toBe("600.000.000 ₫");
    const l = ready();
    expect(l.bars.map((b) => [b.marker, b.text])).toEqual([
      ["base", "2.000.000.000 ₫"],
      ["part", "600.000.000 ₫"],
    ]);
    expect(l.bars[0].bar).toEqual({ from: 0, to: 100, negative: false });
    expect(l.bars[1].bar!.to).toBeCloseTo(30, 9);
    expect(l.notes[0]).toContain("30,00%");
    expect(l.signed).toBe(false);
  });

  it("share: 300k of 2M = 15%; change: 20M → 23M = 15% and 3M; points: 7 → 9 = 2 points, +28,57%", () => {
    expect(percentSnapshot(at({ mode: "share" }))!.answer).toBe("15,00%");
    expect(percentSnapshot(at({ mode: "change" }))).toEqual({ answer: "15,00%", second: "3.000.000 ₫" });
    expect(percentSnapshot(at({ mode: "points" }))).toEqual({ answer: `2,00 ${M.points.pointsUnit}`, second: "28,57%" });
  });
});

describe("edges: over 100, negatives, zero, undefined relative", () => {
  it("share over 100% is not clamped; negative parts go on a signed axis", () => {
    const over = ready({ mode: "share", sharePart: "3.000.000" });
    expect(over.notes).toContain(L.share.over);
    expect(over.bars[1].bar!.to).toBe(100);
    const neg = ready({ mode: "share", sharePart: "-300.000" });
    expect(neg.notes[0]).toBe(L.share.signed);
    expect(neg.bars.find((b) => b.marker === "part")!.bar!.negative).toBe(true);
  });

  it("change −200 → −100 is +50% over the magnitude of the start", () => {
    const s = at({ mode: "change", changeFrom: "-200", changeTo: "-100" });
    expect(percentSnapshot(s)!.answer).toBe("50,00%");
    expect(ready({ mode: "change", changeFrom: "-200", changeTo: "-100" }).notes[0]).toContain("200 ₫");
  });

  it("points 0 → 7 keeps 7 points and names the missing relative; 7 → 0 and a negative old rate work", () => {
    const zero = ready({ mode: "points", pointsFrom: "0", pointsTo: "7" });
    expect(zero.notes).toContain(L.points.relativeNone);
    expect(percentSnapshot(at({ mode: "points", pointsFrom: "0", pointsTo: "7" }))!.answer).toBe(`7,00 ${M.points.pointsUnit}`);
    expect(percentSnapshot(at({ mode: "points", pointsFrom: "7", pointsTo: "0" }))!.answer).toBe(`-7,00 ${M.points.pointsUnit}`);
    expect(at({ mode: "points", pointsFrom: "-2", pointsTo: "1" }).aInvalid).toBe(false);
  });

  it("a zero divisor is invalid (share whole, change start); a zero base in 'of' is a valid 0", () => {
    expect(percentLesson(at({ mode: "share", shareWhole: "0" }), "a").kind).toBe("empty");
    expect(percentLesson(at({ mode: "change", changeFrom: "0" }), "a").kind).toBe("empty");
    const zero = ready({ ofTotal: "0" });
    expect(zero.notes).toContain(L.of.zeroBase);
    expect(percentSnapshot(at({ ofTotal: "0" }))!.answer).toBe("0 ₫");
  });
});

describe("computation and display limits are named, never drawn as a claim", () => {
  it("1.000% of 10^308: a non-finite result is a named limit and the try is off", () => {
    const s = at({ ofPercent: "1000", ofTotal: HUGE });
    expect(percentLesson(s, "a").kind).toBe("limit");
    expect(percentAvailability("ofPercent", { ...DEFAULTS, ofPercent: "1000", ofTotal: HUGE }, s)).toEqual({ enabled: false, reason: W.blockedLimit });
  });

  it("finite but unprintable: figures named, NO shape claim beside the withheld drawing", () => {
    const l = ready({ ofPercent: "100", ofTotal: "1.000.000.000.000.000.000" });
    expect(l.withheld).toBe(true);
    expect(l.notes).toEqual([W.drawWithheld]);
    expect(l.bars.every((b) => b.bar === null)).toBe(true);
    expect(l.bars[1].text).toBe(W.tooLarge);
  });
});

describe("equation operands: exact read-back or a named limit (root P1/P7)", () => {
  it("operands share one precision and read back exactly; sub-đồng money is kept", () => {
    expect(eqTerms("rate", [0.001, 0], 2)).toEqual({ kind: "ok", texts: ["0,001", "0,000"], dp: 3 });
    expect(eqTerms("money", [0.3, -0.3], 0)).toEqual({ kind: "ok", texts: ["0,3", "-0,3"], dp: 1 });
    expect(eqTerms("money", [2_000_000], 0)).toEqual({ kind: "ok", texts: ["2.000.000"], dp: 0 });
  });

  it("past ten decimals is `precision`, never a rounded-to-zero term; past the print limit is `unprintable`", () => {
    expect(eqTerms("rate", [1e-11, 0], 2)).toEqual({ kind: "precision" });
    expect(eqTerms("rate", [1e16], 2)).toEqual({ kind: "unprintable" });
  });

  it("distinct operands never collapse: 1.000.000 vs 1.000.000,000001", () => {
    const t = eqTerms("money", [1_000_000.000001, 1_000_000], 0);
    if (t.kind !== "ok") throw new Error(t.kind);
    expect(t.texts).toEqual(["1.000.000,000001", "1.000.000,000000"]);
  });
});

describe("computed results: floating dust is exact, decimal truncation is '≈' (root round 4)", () => {
  it("dust at the last place is not a truncation", () => {
    // A real dust fixture: 0,1 + 0,2 is 0.30000000000000004 in binary floats.
    expect(0.1 + 0.2).not.toBe(0.3);
    expect(decimalsFor(0.1 + 0.2, 2)).toEqual({ dp: 2, exact: true });
    expect(eqResult("rate", (0.1 + 0.2) * 100, 2, "%")).toBe("30,00%");
    expect(decimalsFor(0.15 * 100, 2)).toEqual({ dp: 2, exact: true });
    expect(decimalsFor(600_000_000, 0)).toEqual({ dp: 0, exact: true });
    expect(eqResult("rate", (300_000 / 2_000_000) * 100, 2, "%")).toBe("15,00%");
  });

  it("a repeating result cut at ten decimals is declared approximate", () => {
    expect(decimalsFor((1 / 3) * 100, 2)).toEqual({ dp: 10, exact: false });
    expect(decimalsFor((1 / 7) * 100, 2)).toEqual({ dp: 10, exact: false });
    expect(eqResult("rate", (1 / 3) * 100, 2, "%")).toBe("≈ 33,3333333333%");
    expect(eqResult("rate", (0.1 / 1000.1) * 100, 2, "%")).toMatch(/^≈ 0,00999900\d*%$/);
  });

  it("a terminating result that needs more than two decimals is exact at its own length", () => {
    // 1 ÷ 8 = 12,5%; 1 ÷ 16 = 6,25%; 1 ÷ 32 = 3,125%.
    expect(eqResult("rate", (1 / 32) * 100, 2, "%")).toBe("3,125%");
    expect(eqResult("rate", (1 / 8) * 100, 2, "%")).toBe("12,50%");
  });
});

describe("tries: one field per mode, exact response, undo and retirement", () => {
  it("of: 30 → 40 points gives 800 triệu; the key must match the mode", () => {
    const s = at();
    expect(nextPercentValue("ofPercent", DEFAULTS)).toBe("40");
    const t = makePercentTrial("ofPercent", DEFAULTS, 0, s)!;
    const after = percentSnapshot(percentFormState(t.after))!;
    expect(after.answer).toBe("800.000.000 ₫");
    const impact = percentImpact(t, after, "of");
    expect(impact.fieldLine).toBe(`${L.trials.ofPercent.field}: 30% → 40%`);
    expect(impact.lines[0]).toBe(`${M.of.resultLabel}: 600.000.000 ₫ → 800.000.000 ₫.`);
    expect(makePercentTrial("pointsTo", DEFAULTS, 0, s)).toBeNull();
  });

  it("points: 9 → 10 adds one point; change: after + 10% of |start|", () => {
    const p = { ...DEFAULTS, mode: "points" };
    expect(nextPercentValue("pointsTo", p)).toBe("10");
    expect(nextPercentValue("changeTo", DEFAULTS)).toBe("25.000.000");
    expect(nextPercentValue("sharePart", DEFAULTS)).toBe("500.000");
  });

  it("undo takes back the latest; a manual edit (the mode radio included) retires every trial", () => {
    let st = initialTrialState<"ofPercent" | "sharePart" | "changeTo" | "pointsTo", NonNullable<ReturnType<typeof percentSnapshot>>>();
    const t1 = makePercentTrial("ofPercent", DEFAULTS, st.revision, at())!;
    st = trialReducer(st, { type: "apply", trial: t1 });
    expect(heldTrials(st, t1.after)).toHaveLength(1);
    st = trialReducer(st, { type: "undo" });
    expect(st.trials).toHaveLength(0);
    st = trialReducer(st, { type: "apply", trial: makePercentTrial("ofPercent", DEFAULTS, st.revision, at())! });
    st = trialReducer(st, { type: "edit" });
    expect(st.trials).toHaveLength(0);
    expect(trialReducer(st, { type: "apply", trial: t1 })).toBe(st);
  });
});

describe("near-equal operands keep a readable, consistent precision (root P5)", () => {
  const unit = M.points.pointsUnit;
  it("points 7,001 → 7,002: '7,002 − 7,001 = 0,001', never '7,00 − 7,00'", () => {
    const eq = percentEquation(at({ mode: "points", pointsFrom: "7,001", pointsTo: "7,002" }))!;
    expect(eq).toBe(`7,002 − 7,001 = 0,001 ${unit}`);
    expect(eq).not.toContain("7,00 −");
  });

  it("points 0 → 0,001, the default 7 → 9 and a negative difference keep exact assembled equations", () => {
    expect(percentEquation(at({ mode: "points", pointsFrom: "0", pointsTo: "0,001" }))).toBe(`0,001 − 0,000 = 0,001 ${unit}`);
    expect(percentEquation(at({ mode: "points" }))).toBe(`9,00 − 7,00 = 2,00 ${unit}`);
    expect(percentEquation(at({ mode: "points", pointsFrom: "7,002", pointsTo: "7,001" }))).toBe(`7,001 − 7,002 = -0,001 ${unit}`);
  });

  it("change 1.000,1 → 1.000,2: sub-đồng operands at ordinary magnitude stay distinct", () => {
    const eq = percentEquation(at({ mode: "change", changeFrom: "1.000,1", changeTo: "1.000,2" }))!;
    expect(eq.startsWith("(1.000,2 − 1.000,1) ÷ 1.000,1 = ")).toBe(true);
    // 0,1 ÷ 1.000,1 is a repeating decimal: marked approximate, never a false 0.
    expect(eq).toMatch(/= ≈ 0,00999900\d*%$/);
  });

  it("of and share keep their defaults; a repeating share is marked ≈", () => {
    expect(percentEquation(at())).toBe("30,00% × 2.000.000.000 = 600.000.000 ₫");
    expect(percentEquation(at({ mode: "share" }))).toBe("300.000 ÷ 2.000.000 = 15,00%");
    expect(percentEquation(at({ mode: "share", sharePart: "1", shareWhole: "3" }))).toMatch(/^1 ÷ 3 = ≈ 33,3333333333%$/);
  });

  it("an overflow result is named in the equation, never 'Infinity' or a glued unit", () => {
    const eq = percentEquation(at({ ofPercent: "1000", ofTotal: HUGE }))!;
    expect(eq).toContain(W.tooLarge);
    expect(eq).not.toMatch(/NaN|Infinity|—/);
  });

  it("at the cap: 0 → 0,0000000001 (10 decimals) is shown exactly", () => {
    expect(percentEquation(at({ mode: "points", pointsFrom: "0", pointsTo: "0,0000000001" }))).toBe(
      `0,0000000001 − 0,0000000000 = 0,0000000001 ${unit}`,
    );
  });

  it("past the cap: 0 → 0,00000000001 names the limit — no fabricated zero arithmetic — while the answer stays non-zero", () => {
    const s = at({ mode: "points", pointsFrom: "0", pointsTo: "0,00000000001" });
    const eq = percentEquation(s)!;
    expect(eq).toBe(L.equationLimit);
    expect(eq).not.toContain("0,0000000000");
    expect(percentSnapshot(s)!.answer).not.toMatch(/^0(,0+)? /);
  });

  it("near-equal ordinary-large operands stay distinct: rates and money", () => {
    expect(percentEquation(at({ mode: "points", pointsFrom: "1000,0000001", pointsTo: "1000,0000002" }))).toBe(
      `1000,0000002 − 1000,0000001 = 0,0000001 ${unit}`,
    );
    const eq = percentEquation(at({ mode: "change", changeFrom: "1.000.000", changeTo: "1.000.000,000001" }))!;
    expect(eq.startsWith("(1.000.000,000001 − 1.000.000,000000) ÷ 1.000.000,000000 = ")).toBe(true);
    expect(eq).not.toMatch(/= (≈ )?0(,0+)?%$/);
  });

  it("equal operands give a true zero, not a limitation", () => {
    expect(percentEquation(at({ mode: "points", pointsFrom: "7", pointsTo: "7" }))).toBe(`7,00 − 7,00 = 0,00 ${unit}`);
  });
});
