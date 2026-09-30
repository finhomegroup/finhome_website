/** /cong-cu/margin-va-markup/'s two frames, pure half, against `computeMargin`. */
import { describe, expect, it } from "vitest";
import {
  makeMarginTrial,
  marginAvailability,
  marginFormState,
  marginImpact,
  marginLesson,
  marginSnapshot,
  marginTrialKeys,
  nextMarginValue,
} from "@/components/margin-learning";
import { initialTrialState, trialReducer } from "@/components/calc/learning-trials";
import { ARITH_WORDS as W } from "@/content/calculators/arith-learning-words";
import { MARGIN as C } from "@/content/calculators/margin";
import { MARGIN_LEARNING as L } from "@/content/calculators/margin-learning";

const F = C.form;
const DEFAULTS: Record<string, string> = { mode: F.defaultMode, cost: F.defaultCost, price: F.defaultPrice, margin: F.defaultMargin, markup: F.defaultMarkup };
const at = (patch: Record<string, string> = {}) => marginFormState({ ...DEFAULTS, ...patch });
const ready = (patch: Record<string, string> = {}) => {
  const l = marginLesson(at(patch));
  if (l.kind !== "ready") throw new Error(l.kind);
  return l;
};

describe("one profit, two denominators", () => {
  it("cost 600k, price 1M: profit 400k, margin 40%, markup 66,6667% — each frame on its own scale", () => {
    expect(marginSnapshot(at())).toMatchObject({ price: "1.000.000 ₫", profitText: "400.000 ₫", margin: "40,0000%", markup: "66,6667%" });
    const l = ready();
    expect(l.state).toBe("gain");
    const [price, cost] = l.frames;
    expect(price.side).toBe("price");
    expect(price.denominator.bar!.to).toBe(100);
    expect(price.profit.bar!.to).toBeCloseTo(40, 9);
    expect(cost.denominator.bar!.to).toBe(100);
    expect(cost.profit.bar!.to).toBeCloseTo((400 / 600) * 100, 9);
    expect(price.ratio).toContain("400.000 ₫ ÷ 1.000.000 ₫ = 40,0000%");
    expect(cost.ratio).toContain("400.000 ₫ ÷ 600.000 ₫ = 66,6667%");
  });

  it("targets: markup 50 → price 900k, margin 33,3333%; margin 40 → price 1M", () => {
    expect(marginSnapshot(at({ mode: "markup" }))).toMatchObject({ price: "900.000 ₫", profitText: "300.000 ₫", margin: "33,3333%" });
    expect(marginSnapshot(at({ mode: "margin" }))!.price).toBe("1.000.000 ₫");
  });
});

describe("loss, negative price, break-even, near 100%", () => {
  it("price 300k: a loss, never clamped (−300k, −100%, −50%)", () => {
    const l = ready({ price: "300.000" });
    expect(l.state).toBe("loss");
    expect(marginSnapshot(at({ price: "300.000" }))).toMatchObject({ profitText: "-300.000 ₫", margin: "-100,0000%", markup: "-50,0000%" });
    expect(l.profitLabel).toBe(L.loss);
    expect(l.frames[0].profit.bar!.negative).toBe(true);
  });

  it("price −300k: margin +300% with a −900k profit is NOT a profitable sale", () => {
    const l = ready({ price: "-300.000" });
    expect(l.state).toBe("negativePrice");
    expect(l.notes[0]).toBe(L.states.negativePrice);
    expect(marginSnapshot(at({ price: "-300.000" }))).toMatchObject({ profitText: "-900.000 ₫", margin: "300,0000%", markup: "-150,0000%" });
  });

  it("break-even is 0% in both frames; a margin near 100% is said", () => {
    expect(ready({ price: "600.000" }).state).toBe("even");
    expect(ready({ mode: "margin", margin: "99,5" }).notes).toContain(L.states.nearFull);
  });

  it("zero cost, zero price and margin 100 are invalid", () => {
    expect(marginLesson(at({ cost: "0" })).kind).toBe("empty");
    expect(marginLesson(at({ price: "0" })).kind).toBe("empty");
    expect(marginLesson(at({ mode: "margin", margin: "100" })).kind).toBe("empty");
    expect(at({ mode: "markup", markup: "-100" }).valueInvalid).toBe(true);
  });
});

describe("computation limits: no verdict, no unsafe try (root P2)", () => {
  const HUGE = `1${"0".repeat(308)}`;
  it("cost 10^308 with markup 100 overflows the price: a named limit, not 'gain'", () => {
    const s = at({ mode: "markup", cost: HUGE, markup: "100" });
    expect(marginLesson(s).kind).toBe("limit");
    expect(marginAvailability("markup", { ...DEFAULTS, mode: "markup", cost: HUGE, markup: "100" }, s)).toEqual({ enabled: false, reason: W.blockedLimit });
  });
});

describe("tries per mode, with actual differences", () => {
  it("price mode offers price −10% and cost +10%; target modes offer +5 points", () => {
    expect(marginTrialKeys("price")).toEqual(["price", "cost"]);
    expect(marginTrialKeys("margin")).toEqual(["margin"]);
    expect(nextMarginValue("price", DEFAULTS)).toBe("900.000");
    expect(nextMarginValue("cost", DEFAULTS)).toBe("660.000");
    expect(nextMarginValue("markup", DEFAULTS)).toBe("55");
  });

  it("price −10%: profit falls by exactly 100.000 ₫, stated as a signed difference", () => {
    const t = makeMarginTrial("price", DEFAULTS, 0, at())!;
    const impact = marginImpact(t, marginSnapshot(marginFormState(t.after))!);
    expect(impact.lines[1]).toBe("Lãi mỗi đơn vị: 400.000 ₫ → 300.000 ₫ (đổi -100.000 ₫).");
    expect(impact.tradeoff).toBe(L.impact.tradeoff.price);
  });

  it("a target margin past 95 cannot take +5; a key from another mode is refused", () => {
    const values = { ...DEFAULTS, mode: "margin", margin: "97" };
    expect(marginAvailability("margin", values, marginFormState(values))).toEqual({ enabled: false, reason: L.blockedMargin });
    expect(makeMarginTrial("markup", DEFAULTS, 0, at())).toBeNull();
  });

  it("undo and manual-edit retirement", () => {
    let st = initialTrialState<"price" | "cost" | "margin" | "markup", NonNullable<ReturnType<typeof marginSnapshot>>>();
    const t1 = makeMarginTrial("cost", DEFAULTS, st.revision, at())!;
    st = trialReducer(st, { type: "apply", trial: t1 });
    st = trialReducer(st, { type: "undo" });
    expect(st.trials).toHaveLength(0);
    st = trialReducer(st, { type: "apply", trial: makeMarginTrial("cost", DEFAULTS, st.revision, at())! });
    st = trialReducer(st, { type: "edit" });
    expect(st.trials).toHaveLength(0);
  });
});
