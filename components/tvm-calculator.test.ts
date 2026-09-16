/**
 * Rendered-markup contracts for /cong-cu/gia-tri-tien-te-theo-thoi-gian/
 * (original row 18).
 *
 * `renderToStaticMarkup` in the runner's plain `node` environment — the
 * pattern `components/calc/chart/chart-render.test.ts` documents.
 *
 * THREE THINGS ONLY A RENDER CAN CHECK HERE.
 *
 * 1. The page OPENS on an everyday question, not on "chọn đại lượng cần tìm".
 *    That is a default, and docs §6 records that a defect in a default is
 *    invisible to a module test.
 * 2. The sign convention is MODE-LOCAL. It governs the advanced solver only,
 *    and the guided mode takes positive amounts — so the notice must not be
 *    rendered beside a form that has no signs in it. Row 56 shipped exactly
 *    this defect the other way round.
 * 3. The timeline is drawn in the guided mode and NOT in the advanced one,
 *    where the schedule engine cannot model the solver's own options.
 */
import { describe, expect, it, vi } from "vitest";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { TVM } from "@/content/calculators/tvm";

type Loose = Record<string, unknown>;

/** Render the calculator, optionally overriding `question` defaults. */
async function render(questionOverrides?: Record<string, string>) {
  const contentPath = "@/content/calculators/tvm";
  vi.resetModules();
  if (questionOverrides) {
    vi.doMock(contentPath, async () => {
      const actual = (await vi.importActual(contentPath)) as { TVM: Loose };
      const original = actual.TVM;
      return {
        TVM: {
          ...original,
          question: { ...(original.question as Loose), ...questionOverrides },
        },
      };
    });
  }
  try {
    const loaded = (await import("@/components/tvm-calculator")) as Record<
      string,
      ComponentType
    >;
    return renderToStaticMarkup(createElement(loaded.TvmCalculator));
  } finally {
    vi.doUnmock(contentPath);
    vi.resetModules();
  }
}

const Q = TVM.question;

describe("the page opens on a question, not on five letters", () => {
  it("defaults to the balance question with its own fields", async () => {
    const html = await render();
    expect(Q.defaultMode).toBe("balanceAfter");
    expect(html).toContain(Q.modeBalance);
    expect(html).toContain(Q.savingsLabel);
    expect(html).toContain(Q.contributionLabel);
    expect(html).toContain(Q.monthsLabel);
    // And the advanced mode is offered, not hidden.
    expect(html).toContain(Q.modeAdvanced);
  });

  it("answers it at the shipped defaults", async () => {
    // 500 triệu + 5 triệu/tháng, 36 tháng, 6%/năm danh nghĩa.
    const html = await render();
    expect(html).toContain("795.020.787 ₫");
    expect(html).toContain(Q.balanceAnswerLabel);
    expect(html).toContain(Q.paidLabel);
  });

  it("keeps the sign convention OUT of the guided mode", async () => {
    // The guided fields take positive amounts, so the notice about negative
    // payments describes nothing on screen.
    const html = await render();
    expect(html).not.toContain(TVM.signNotice);
    expect(html).toContain(Q.savingsHelp);
  });

  it("draws the timeline beside the answer", async () => {
    const html = await render();
    expect(html).toContain(TVM.chart.title);
    expect(html).toContain(TVM.chart.balancePath);
    expect(html).toContain(TVM.chart.contributedPath);
    // Every chart `<svg>` is hidden from the accessibility tree; the visible
    // prose and the table are the text equivalent (docs §3).
    for (const svg of html.match(/<svg[^>]*>/g) ?? []) {
      expect(svg).toContain('aria-hidden="true"');
      expect(svg).toContain('focusable="false"');
    }
  });
});

describe("the how-long question distinguishes algebra from a schedule", () => {
  it("reports month 37, and 36,56 kỳ only as algebra", async () => {
    const html = await render({ defaultMode: "monthsNeeded" });
    expect(html).toContain(Q.monthsAnswerLabel);
    expect(html).toContain(`37 ${Q.monthsUnit}`);
    expect(html).toContain(Q.exactPeriodsLabel);
    expect(html).toContain(`36,56 ${Q.periodsUnit}`);
    // The sentence that says why they are not the same number.
    expect(html).toContain(Q.exactPeriodsNotice);
    // Both sides of the boundary, from the chart's own summary.
    expect(html).toContain("795.020.787 ₫");
    expect(html).toContain("803.995.891 ₫");
  });

  it("never renders the fractional count as the answer", async () => {
    const html = await render({ defaultMode: "monthsNeeded" });
    expect(html).not.toContain(`36,56 ${Q.monthsUnit}`);
    expect(html).not.toContain(`36 ${Q.monthsUnit}`);
  });
});

describe("the contribution question", () => {
  it("asks for a positive monthly amount", async () => {
    const html = await render({ defaultMode: "contributionNeeded" });
    expect(html).toContain(Q.contributionAnswerLabel);
    expect(html).toContain("5.126.581 ₫");
    // The field it solves for is hidden, like the advanced mode does.
    expect(html).not.toContain(Q.contributionHelp);
    expect(html).toContain(Q.goalHelp);
  });

  it("answers an ALREADY-FUNDED plan with 0, not a negative instruction", async () => {
    // The reviewed case: 900 triệu toward an 800 triệu goal at 36 months and
    // 6% solved to −7.042.194 ₫/tháng, and that was the headline while the
    // chart drew a contribution of 0. The primary answer is now the plan.
    const html = await render({
      defaultMode: "contributionNeeded",
      defaultSavings: "900.000.000",
      defaultGoal: "800.000.000",
      defaultMonths: "36",
      defaultRate: "6",
    });
    const answerRow = html.slice(
      html.indexOf(Q.contributionAnswerLabel),
      html.indexOf(Q.paidLabel),
    );
    expect(answerRow).toContain("0 ₫");
    expect(answerRow).toContain(Q.alreadyEnoughLabel);
    // The signed figure is NOT in the answer row …
    expect(answerRow).not.toContain("7.042.194");
    // … it is in the detail block, under its own name.
    expect(html).toContain(Q.algebraicContributionLabel);
    expect(html).toContain("-7.042.194 ₫");
    // And the sentence says the two are different questions.
    expect(html).toContain(Q.negativeContributionNotice);
  });

  it("does not call the friendly detail block 'Cả năm đại lượng'", async () => {
    // That heading belongs to the advanced mode, which has five quantities.
    const html = await render({ defaultMode: "contributionNeeded" });
    expect(html).toContain(Q.detailTitle);
    expect(html).not.toContain(TVM.form.detailTitle);
  });
});

describe("the advanced mode is preserved, with its own notice", () => {
  it("renders the five-quantity solver and the sign convention", async () => {
    const html = await render({ defaultMode: "advanced" });
    expect(html).toContain(TVM.signNotice);
    expect(html).toContain(TVM.form.solveLegend);
    expect(html).toContain(TVM.form.presentLabel);
    expect(html).toContain(TVM.form.timingLegend);
    // The loan default it has always shipped.
    expect(html).toContain("-17.356.465");
  });

  it("draws no timeline there, because the schedule cannot model it", async () => {
    const html = await render({ defaultMode: "advanced" });
    expect(html).not.toContain(TVM.chart.title);
  });

  it("keeps exactly one live results region in either mode", async () => {
    for (const mode of ["balanceAfter", "advanced"]) {
      const html = await render({ defaultMode: mode });
      expect(
        (html.match(/data-results-live="true"/g) ?? []).length,
        `mode ${mode}`,
      ).toBe(1);
    }
  });
});
