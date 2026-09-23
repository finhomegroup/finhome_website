/**
 * Rendered-markup contracts for /cong-cu/tang-luong/ — audit row 65, "Giữ
 * tăng theo tiền/phần trăm rõ ràng; đưa lương mới và tăng thực mỗi tháng ngay
 * dưới form."
 *
 * WHAT THIS FILE CAN ESTABLISH: that all three modes still own a distinct
 * second box with its own unit and error, that the new salary and the monthly
 * rise are the two announced figures with the salary emphasised, that the
 * three per-year/percentage restatements moved into the detail region, and
 * that the savings-goal stage and its four distinguishable states survived
 * the layout change intact.
 *
 * WHAT IT CANNOT: appearance, and whether the second stage is discoverable
 * below the salary answer.
 */
import { describe, expect, it, vi } from "vitest";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { markupRegion } from "@/lib/markup-region";
import { RAISE } from "@/content/calculators/raise";

const CONTENT = "@/content/calculators/raise";

type FormPatch = Partial<Record<keyof typeof RAISE.form, string>>;

async function render(
  patch?: FormPatch,
  props?: { actions?: ReactNode; nextSteps?: ReactNode },
): Promise<string> {
  vi.resetModules();
  if (patch) {
    vi.doMock(CONTENT, async () => {
      const actual =
        await vi.importActual<typeof import("@/content/calculators/raise")>(
          CONTENT,
        );
      return {
        RAISE: { ...actual.RAISE, form: { ...actual.RAISE.form, ...patch } },
      };
    });
  }
  try {
    const loaded = await import("@/components/raise-calculator");
    return renderToStaticMarkup(
      createElement(loaded.RaiseCalculator, props ?? null),
    );
  } finally {
    vi.doUnmock(CONTENT);
    vi.resetModules();
  }
}

const C = RAISE.form;

/** The `emphasis` treatment `ResultRow` owns. */
const HEADLINE = "md:text-3xl";

describe("the new salary and the monthly rise lead", () => {
  it("keeps the pre-implementation default figures", async () => {
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live).not.toBeNull();
    // 20.000.000 + 18% = 23.600.000, a rise of 3.600.000 a month.
    expect(live!).toContain("23.600.000 ₫");
    expect(live!).toContain("3.600.000 ₫");
  });

  it("emphasises exactly one row, the new salary", async () => {
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live!.split(HEADLINE).length - 1).toBe(1);
    expect(live!.slice(0, live!.indexOf(HEADLINE))).toContain(C.nextLabel);
  });

  it("announces two figures and moves the other three to detail", async () => {
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live!).toContain(C.increaseLabel);
    for (const moved of [
      C.increasePerYearLabel,
      C.nextPerYearLabel,
    ]) {
      expect(live!, `"${moved}" is still announced`).not.toContain(moved);
    }

    const detail = markupRegion(html, 'data-calc-region="detail"');
    expect(detail).not.toBeNull();
    expect(detail!).toContain(C.detailTitle);
    expect(detail!).toContain(C.increasePercentLabel);
    expect(detail!).toContain("18,00%");
    // 3.600.000 × 12 and 23.600.000 × 12.
    expect(detail!).toContain("43.200.000 ₫");
    expect(detail!).toContain("283.200.000 ₫");
  });

  it("keeps one live region across both stages", async () => {
    // The salary block owns it; the goal group below is `live={false}`.
    const html = await render();
    expect(html.split('data-results-live="true"').length - 1).toBe(1);
  });
});

describe("the three modes stay distinct", () => {
  // The mode is CLIENT STATE with a hardcoded "percent" start — there is no
  // content default for it — so static markup can only ever show the percent
  // box. What is assertable here is that all three choices are still offered
  // beside it, and that the three boxes remain three different questions.
  it("offers all three choices and labels the percent box", async () => {
    const html = await render();
    const form = markupRegion(html, 'data-calc-region="form"');
    expect(form).not.toBeNull();
    expect(form!).toContain(C.modeLegend);
    expect(form!).toContain(C.modePercent);
    expect(form!).toContain(C.modeAmount);
    expect(form!).toContain(C.modeTarget);
    expect(form!).toContain(C.percentLabel);
    expect(form!).toContain(C.percentUnit);
    expect(form!).toContain(C.percentHelp);
  });

  it("keeps a separate label, unit, help and error per mode", async () => {
    // A percentage left in a box that now means đồng would compute a wrong
    // answer without looking wrong, which is why each mode owns its own text.
    const labels = [C.percentLabel, C.amountLabel, C.targetLabel];
    const helps = [C.percentHelp, C.amountHelp, C.targetHelp];
    const errors = [C.percentInvalid, C.amountInvalid, C.targetInvalid];
    for (const group of [labels, helps, errors]) {
      expect(new Set(group).size).toBe(3);
      for (const text of group) expect(text.trim()).not.toBe("");
    }
    // The two money modes legitimately share a unit; the percentage one must
    // not, because that is the pair a leftover value would silently corrupt.
    expect(C.amountUnit).toBe(C.targetUnit);
    expect(C.percentUnit).not.toBe(C.amountUnit);
    // And each mode keeps its own prefilled value.
    expect(new Set([C.defaultPercent, C.defaultAmount, C.defaultTarget]).size)
      .toBe(3);
  });

  it("refuses a cut past zero, on the mode's own box", async () => {
    // -200% of 20.000.000 is pay below zero. The engine returns null and the
    // percent box — not the salary box — carries the blame.
    const html = await render({ defaultPercent: "-200" });
    expect(html).toContain(C.percentInvalid);
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live!).not.toContain("₫");
  });

  it("accepts a pay cut that stays above zero", async () => {
    const html = await render({ defaultPercent: "-10" });
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live!).toContain("18.000.000 ₫");
    // The rise is negative, and the formatter uses an ASCII minus.
    expect(live!).toContain("-2.000.000 ₫");
  });
});

describe("the savings-goal stage survived", () => {
  it("still asks its own questions, below the salary answer", async () => {
    const html = await render();
    expect(html).toContain(C.goalGroup);
    expect(html).toContain(C.netIncreaseLabel);
    expect(html).toContain(C.startGroup);
    expect(html).toContain(C.goalResultTitle);
    // Below: the salary answer's region comes first.
    expect(html.indexOf('data-results-live="true"')).toBeLessThan(
      html.indexOf(C.goalGroup),
    );
  });

  it("keeps the four goal states distinguishable", async () => {
    // Unknown net rise is not a pay cut, and neither is a 0% share.
    const unknown = await render({ defaultNetIncrease: "" });
    expect(unknown).toContain(C.unknownNetNotice);
    expect(unknown).not.toContain(C.payCutNotice);

    const cut = await render({ defaultNetIncrease: "-1.000.000" });
    expect(cut).toContain(C.payCutNotice);
    expect(cut).not.toContain(C.unknownNetNotice);

    const zeroShare = await render({ defaultShare: "0" });
    expect(zeroShare).toContain(C.zeroShareNotice);

    const broken = await render({ defaultGoalTarget: "0" });
    expect(broken).toContain(C.goalInvalidNotice);
  });

  it("distinguishes a 0% share from a 0 ₫ net rise", async () => {
    // ONE engine state, two causes. An independent runtime round found the
    // second reader told "Bạn đang để dành 0% mức tăng" while their own
    // share field said 50, and advised to raise a percentage of nothing.
    const zeroNet = await render({
      defaultNetIncrease: "0",
      defaultShare: "50",
    });
    expect(zeroNet).toContain(C.zeroNetNotice);
    expect(zeroNet).not.toContain(C.zeroShareNotice);

    // A real rise saved at 0% keeps the original sentence: here raising the
    // percentage genuinely is the thing to do.
    const zeroShare = await render({
      defaultNetIncrease: "2.000.000",
      defaultShare: "0",
    });
    expect(zeroShare).toContain(C.zeroShareNotice);
    expect(zeroShare).not.toContain(C.zeroNetNotice);

    // Both at zero: the rise is the binding reason, so it leads.
    const both = await render({
      defaultNetIncrease: "0",
      defaultShare: "0",
    });
    expect(both).toContain(C.zeroNetNotice);
    expect(both).not.toContain(C.zeroShareNotice);
  });

  it("still names an unreachable goal as unreachable", async () => {
    // Nothing saved each month and nothing accumulated: no month funds it.
    const html = await render({
      defaultNetIncrease: "0",
      defaultShare: "0",
      defaultBaseline: "0",
      defaultInitial: "0",
    });
    expect(html).toContain(C.unreachableNotice);
  });
});

describe("the layout wiring", () => {
  it("is a compact single column with a CTA pointing at the answer", async () => {
    const html = await render();
    expect(html).toContain('id="tang-luong-nhap" data-calc-region="form"');
    expect(html).toContain('id="tang-luong-ket-qua"');
    expect(html).toContain('aria-controls="tang-luong-ket-qua"');
    expect(html).toContain('data-calc-cta="true"');
    expect(html).not.toContain("lg:grid-cols-5");
    expect(html).not.toContain("<svg");
  });

  it("renders the actions after the goal stage, not between the two", async () => {
    const html = await render(undefined, {
      actions: createElement("div", { "data-test": "actions" }),
      nextSteps: createElement("div", { "data-test": "next-steps" }),
    });
    // The salary answer is not the page's last figure, so the guidance sits
    // below the goal result rather than in the layout's own slots.
    expect(html.indexOf(C.goalResultTitle)).toBeLessThan(
      html.indexOf('data-test="actions"'),
    );
    expect(html.indexOf('data-test="actions"')).toBeLessThan(
      html.indexOf('data-test="next-steps"'),
    );
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live!).not.toContain('data-test="actions"');
  });
});
