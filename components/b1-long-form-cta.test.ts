/**
 * WHICH B1 COST TOOLS PIN A SHORT CURRENT ANSWER, AND WHICH DO NOT.
 *
 * The third of these files, after `b2-long-form-cta.test.ts` (investing) and
 * `u-long-form-cta.test.ts` (US). Same requirement, same mechanism, same
 * limits: `ResultCta`'s `sticky` plus `answer`, which renders
 * `data-calc-answer` inside the `.fh-cta-pin` block — never a pinned result
 * column.
 *
 * THESE SIX WERE MEASURED, NOT ESTIMATED. An independent pass at 1440×1000
 * focused the last visible textbox of each route in its default mode and read
 * the first result row's box off the page:
 *
 *   vay-thuong-mai                 focus 528,75–574,75; result −103,75..−43,75
 *   phan-tich-khoan-vay            result −283,5..−223,5
 *   diem-chiet-khau                result −232,5..−182,5
 *   chi-tra-lai                    focus 529–575; result −373,75..−313,75
 *   lai-kep                        focus 529–575; result −96,5..−36,5
 *   gia-tri-tien-te-theo-thoi-gian result −263,5..−203,5
 *
 * Every one of those is the primary answer entirely above the viewport while a
 * lower field is being edited, which is the defect the pin exists for. A
 * measurement of a route beats any heuristic about that route — `lai-kep` is
 * five controls in ONE group and still loses its answer, which is why the
 * control count is not the rule here either.
 *
 * AND THREE ROUTES ARE EXPLICITLY HELD IN FLOW. The same review said not to
 * pin the percentage, biweekly or Rule-72 tools, and said in as many words
 * that Rule 72's first question scrolling away while the second is answered is
 * NOT a defect: that page asks two independent questions and neither is "the"
 * current answer. So these three are a HOLD with a reason, not an omission.
 *
 * WHAT IS NOT CLAIMED HERE. `renderToStaticMarkup` in the runner's plain
 * `node` environment checks WIRING only (AGENTS.md: nothing in this suite
 * checks appearance). The measurements above are the independent review's,
 * quoted. Whether each pinned block clears the form at 1440×1000 and 1024×900,
 * stays in flow at 1024×768, and stays hidden at 390 px is a browser question
 * for the review that follows this repair.
 */
import { describe, expect, it, vi } from "vitest";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { BiweeklyCalculator } from "@/components/biweekly-calculator";
import { CommercialLoanCalculator } from "@/components/commercial-loan-calculator";
import { CompoundCalculator } from "@/components/compound-calculator";
import { InterestOnlyCalculator } from "@/components/interest-only-calculator";
import { LoanAnalysisCalculator } from "@/components/loan-analysis-calculator";
import { PercentCalculator } from "@/components/percent-calculator";
import { PointsCalculator } from "@/components/points-calculator";
import { RuleOf72Calculator } from "@/components/rule-of-72-calculator";
import { TvmCalculator } from "@/components/tvm-calculator";
import { PLACEHOLDER } from "@/lib/calc/number";

const markup = (Component: ComponentType) =>
  renderToStaticMarkup(createElement(Component));

/** The six measured long forms. */
const PINNED = [
  ["vay-thuong-mai", CommercialLoanCalculator],
  ["phan-tich-khoan-vay", LoanAnalysisCalculator],
  ["diem-chiet-khau", PointsCalculator],
  ["chi-tra-lai", InterestOnlyCalculator],
  ["lai-kep", CompoundCalculator],
  ["gia-tri-tien-te-theo-thoi-gian", TvmCalculator],
] as const satisfies readonly (readonly [string, ComponentType])[];

/** Held in flow on the review's own instruction — see the header. */
const UNPINNED = [
  ["tinh-phan-tram", PercentCalculator],
  ["tra-no-hai-tuan", BiweeklyCalculator],
  ["quy-tac-72", RuleOf72Calculator],
] as const satisfies readonly (readonly [string, ComponentType])[];

describe("the long B1 cost forms pin a short current answer", () => {
  for (const [slug, Component] of PINNED) {
    it(`${slug} emits the pinned block with an answer in it`, () => {
      const html = markup(Component);
      expect(html, `${slug}: no .fh-cta-pin`).toContain("fh-cta-pin");
      expect(html, `${slug}: pinned block carries no answer`).toContain(
        'data-calc-answer="true"',
      );
    });

    it(`${slug} hides the restatement from assistive technology`, () => {
      // It duplicates a row the result region already announces, and
      // `ResultGroup` owns the page's single live region — so the pinned copy
      // is decorative by contract, not by preference.
      const html = markup(Component);
      const at = html.indexOf('data-calc-answer="true"');
      expect(html.slice(html.lastIndexOf("<p", at), at)).toContain(
        'aria-hidden="true"',
      );
    });

    it(`${slug} restates the emphasised row, not a second rounding`, () => {
      // `ResultCta`'s `answer` contract: the SAME formatted string the primary
      // row renders. Each component formats it once and passes that value to
      // both, so the two cannot drift — asserted by requiring the pinned
      // figure to appear again inside the emphasised row's own markup.
      const html = markup(Component);
      const at = html.indexOf('data-calc-answer="true"');
      const strip = html.slice(at, html.indexOf("</p>", at));
      const figure = [...strip.matchAll(/>([^<>]+)<\/span>/g)].at(-1)?.[1];
      expect(figure, `${slug}: pinned strip has no figure`).toBeTruthy();
      const emphasised = html.indexOf("md:text-3xl");
      expect(emphasised, `${slug}: no emphasised row`).toBeGreaterThan(-1);
      expect(
        html.slice(emphasised, html.indexOf("</div>", emphasised)),
        `${slug}: pinned "${figure}" is not the emphasised row's own value`,
      ).toContain(figure!);
    });
  }

  for (const [slug, Component] of UNPINNED) {
    it(`${slug} stays in flow, and says nothing twice`, () => {
      const html = markup(Component);
      expect(html, `${slug}: gained a pin the review declined`).not.toContain(
        "fh-cta-pin",
      );
      expect(html).not.toContain('data-calc-answer="true"');
    });
  }

  it("accounts for all nine routes exactly once", () => {
    const slugs = [...PINNED, ...UNPINNED].map(([slug]) => slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(slugs.length).toBe(9);
  });
});

/**
 * THE PIN IN A STATE THAT IS NOT THE DEFAULT.
 *
 * Two of these six choose their answer conditionally — `chi-tra-lai` by
 * whether the loan has a grace period at all, and
 * `gia-tri-tien-te-theo-thoi-gian` by which of six questions is selected — and
 * the review asked for the active MODE to be preserved, not only the shipped
 * defaults. A pin hard-coded to one branch would restate a figure the result
 * panel is not leading with, or on the no-grace path one it does not render.
 *
 * `vi.doMock` on the CONTENT module is the only lever this suite has for a
 * non-default state: the components read their defaults through
 * `useCalcFields` and nothing else reaches them from outside. The dynamic
 * `import()` stays a literal so the path remains statically analysable.
 */
const STRIP = 'data-calc-answer="true"';

/** `[label, value]` of the pinned strip. */
function pinned(html: string): [string, string] {
  const at = html.indexOf(STRIP);
  expect(at, "no pinned strip").toBeGreaterThan(-1);
  const strip = html.slice(at, html.indexOf("</p>", at));
  const spans = [...strip.matchAll(/>([^<>]*)<\/span>/g)].map((m) => m[1]);
  expect(spans.length, "pinned strip is not a label/value pair").toBe(2);
  return [spans[0], spans[1]];
}

async function withDefaults(
  path: string,
  exportName: string,
  group: string,
  patch: Record<string, string>,
  load: () => Promise<{ [key: string]: ComponentType }>,
  componentName: string,
): Promise<string> {
  vi.resetModules();
  vi.doMock(path, async () => {
    const actual = (await vi.importActual(path)) as Record<
      string,
      Record<string, Record<string, unknown>>
    >;
    const content = actual[exportName];
    return {
      [exportName]: {
        ...content,
        [group]: { ...content[group], ...patch },
      },
    };
  });
  try {
    const mod = await load();
    return renderToStaticMarkup(createElement(mod[componentName]));
  } finally {
    vi.doUnmock(path);
    vi.resetModules();
  }
}

describe("the pinned answer follows the active mode", () => {
  it("chi-tra-lai pins the first payment when the loan has no grace period", async () => {
    const { INTEREST_ONLY } = await import("@/content/calculators/interest-only");
    const html = await withDefaults(
      "@/content/calculators/interest-only",
      "INTEREST_ONLY",
      "form",
      { defaultGrace: "0" },
      () => import("@/components/interest-only-calculator"),
      "InterestOnlyCalculator",
    );
    const [label] = pinned(html);
    // There is no jump, so the jump row is not mounted and the emphasis is on
    // the first payment. The pin has to move with it.
    expect(label).toBe(INTEREST_ONLY.form.firstPaymentLabel);
    expect(label).not.toBe(INTEREST_ONLY.form.graceJumpLabel);
  });

  it("chi-tra-lai pins the jump on the shipped grace period", async () => {
    const { INTEREST_ONLY } = await import("@/content/calculators/interest-only");
    const [label] = pinned(markup(InterestOnlyCalculator));
    expect(label).toBe(INTEREST_ONLY.form.graceJumpLabel);
  });

  it("gia-tri-tien-te-theo-thoi-gian pins each question's own answer", async () => {
    const { TVM } = await import("@/content/calculators/tvm");
    const [shipped] = pinned(markup(TvmCalculator));
    expect(shipped).toBe(TVM.question.balanceAnswerLabel);

    for (const [mode, label] of [
      ["contributionNeeded", TVM.question.contributionAnswerLabel],
      ["monthsNeeded", TVM.question.monthsAnswerLabel],
      // The fourth mode is the five-quantity solver, whose label is the
      // quantity it is solving for — `defaultSolveFor` is the payment.
      ["advanced", TVM.form.solvePayment],
    ] as const) {
      const html = await withDefaults(
        "@/content/calculators/tvm",
        "TVM",
        "question",
        { defaultMode: mode },
        () => import("@/components/tvm-calculator"),
        "TvmCalculator",
      );
      expect(pinned(html)[0], mode).toBe(label);
    }
  });

  it("shows the placeholder rather than half an answer on an unusable form", async () => {
    // The invalid state the review asked to keep intact: `money()` returns
    // null and `ResultCta` renders its own placeholder, exactly as the row
    // does. Nothing is computed from a field that did not parse.
    const html = await withDefaults(
      "@/content/calculators/compound",
      "COMPOUND",
      "form",
      { defaultPrincipal: "không phải số" },
      () => import("@/components/compound-calculator"),
      "CompoundCalculator",
    );
    expect(pinned(html)[1]).toBe(PLACEHOLDER);
  });
});
