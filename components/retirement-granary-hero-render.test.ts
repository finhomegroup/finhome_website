/**
 * Rendered-markup contracts for /cong-cu/ke-hoach-huu-tri/'s tool-first hero
 * (2026-09-27, docs §1c): the card, the granary, the three levers and the
 * collapsed form, rendered the way the page composes them.
 *
 * Same fidelity as `retirement-plan-render.test.ts`: `renderToStaticMarkup`
 * in the plain `node` environment, with `vi.doMock` on the route's content
 * module to change one of ITS defaults — this page reads its own scenario
 * (`RETIREMENT_PLAN.defaults`, the pension per month), not the shared one.
 * Every count below is DERIVED from the engine or from the markup, never
 * quoted from prose. Nothing here checks appearance.
 */
import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { markupRegion } from "@/lib/markup-region";
import { readRoutePlan } from "@/components/retirement-plan-read";
import { sharedMoney } from "@/components/retirement-plan-target-view";
import { compactMoney, fill } from "@/lib/calc/charts/labels";
import { resolveLongTermPlan } from "@/lib/calc/long-term-plan";
import { projectRetirement } from "@/lib/calc/retirement";
import { contributionDelta, withSavingStep } from "@/lib/calc/retirement-lever-facts";
import { LONG_TERM_PLAN } from "@/content/calculators/long-term-plan";
import { RETIREMENT_PLAN as C } from "@/content/calculators/retirement-plan";

const CONTENT_PATH = "@/content/calculators/retirement-plan";
const MODEL_PATH = "@/lib/calc/charts/retirement-granary-chart";

async function render(
  defaults?: Partial<Record<string, string>>,
  { throwInModel = false } = {},
): Promise<string> {
  vi.resetModules();
  if (defaults) {
    vi.doMock(CONTENT_PATH, async () => {
      const actual = (await vi.importActual(CONTENT_PATH)) as {
        RETIREMENT_PLAN: typeof C;
      };
      return {
        ...actual,
        RETIREMENT_PLAN: {
          ...actual.RETIREMENT_PLAN,
          defaults: { ...actual.RETIREMENT_PLAN.defaults, ...defaults },
        },
      };
    });
  }
  if (throwInModel) {
    vi.doMock(MODEL_PATH, async () => ({
      ...((await vi.importActual(MODEL_PATH)) as object),
      retirementGranaryModel: () => {
        throw new Error("the granary model failed on purpose");
      },
    }));
  }
  const silence = vi.spyOn(console, "error").mockImplementation(() => {});
  try {
    const { RetirementPlanState } = await import("@/components/retirement-plan-state");
    const { RetirementGranaryHero } = await import("@/components/retirement-granary-hero");
    const calculator = (await import("@/components/retirement-plan-calculator")) as
      Record<string, ComponentType>;
    return renderToStaticMarkup(
      createElement(
        RetirementPlanState,
        null,
        createElement(RetirementGranaryHero),
        createElement(calculator.RetirementPlanCalculator),
      ),
    );
  } finally {
    silence.mockRestore();
    vi.doUnmock(CONTENT_PATH);
    vi.doUnmock(MODEL_PATH);
    vi.resetModules();
  }
}

const count = (html: string, needle: string | RegExp): number =>
  typeof needle === "string"
    ? html.split(needle).length - 1
    : (html.match(needle) ?? []).length;
const hero = (html: string) => markupRegion(html, 'data-granary-hero="true"') ?? "";

function planOf(defaults: Partial<Record<string, string>> = {}) {
  const read = readRoutePlan({ ...C.defaults, ...defaults });
  const plan = read.input === null ? null : resolveLongTermPlan(read.input);
  if (plan === null) throw new Error("fixture refused");
  return plan;
}

/** The render test's FUNDED_BOUNDARY: a forgiven sub-đồng residue at 84. */
const FUNDED_BOUNDARY = {
  currentAge: "60",
  retirementAge: "60",
  endAge: "85",
  currentBalance: "4.800.000.000",
  annualContribution: "0",
  contributionGrowthPercent: "0",
  returnBeforePercent: "4",
  returnAfterPercent: "4",
  inflationPercent: "4",
  desiredMonthlySpending: "20.000.000",
  otherMonthlyIncome: "4.000.000",
} as const;

describe("the hero at the shipped defaults", () => {
  it("sits once, with the one card, and adds no live region", async () => {
    const html = await render();
    const h = hero(html);
    expect(count(html, 'data-granary-hero="true"')).toBe(1);
    expect(count(html, "<section data-result-status")).toBe(1);
    expect(count(h, "<section data-result-status")).toBe(1);
    expect(h).not.toContain("data-calc-jump");
    expect(count(html, 'data-results-live="true"')).toBe(1);
    for (const live of ["aria-live", "<output", 'role="status"', 'role="alert"']) {
      expect(h, live).not.toContain(live);
    }
  });

  it("draws the engine's ledger: one bowl a year, the depletion year partial", async () => {
    const html = await render();
    const result = planOf().asEntered;
    const rows = result.years.filter((row) => !row.accumulating);
    expect(count(html, /data-bowl="/g)).toBe(rows.length);
    expect(count(html, 'data-bowl="full"')).toBe(result.yearsFunded);
    expect(count(html, 'data-bowl="partial"')).toBe(1);
    // Other income exists on the defaults: after the savings run out, each
    // bowl keeps its lower layer — never drawn as an empty year.
    expect(count(html, 'data-bowl="otherOnly"')).toBe(result.yearsShort - 1);
    expect(count(html, 'data-bowl="empty"')).toBe(0);
    const firstShort = /data-bowl="(?:partial|otherOnly|empty)" data-age="(\d+)"/.exec(html);
    expect(Number(firstShort?.[1])).toBe(result.depletionAge);
    expect(hero(html)).toContain(`data-bowl-count="${rows.length}"`);
    expect(hero(html)).toContain(`data-first-short-age="${result.depletionAge}"`);
  });

  it("keeps the figure contract: hidden SVGs, no SVG text, HTML caption", async () => {
    const h = hero(await render());
    const svgs = h.match(/<svg[^>]*>/g) ?? [];
    expect(svgs.length).toBeGreaterThan(5);
    for (const svg of svgs) {
      expect(svg).toContain('aria-hidden="true"');
      expect(svg).toContain('focusable="false"');
    }
    expect(h).not.toContain("<text");
    // The gable carries the short label; the whole definition follows the
    // levers, where its length cannot move them.
    expect(h).toMatch(new RegExp(`<figcaption[^>]*>${C.hero.figure.label}</figcaption>`));
    expect(h).toContain(`<p>${C.hero.figure.unit.withOtherIncome}</p>`);
    // The house is decoration: an image with an empty alt, holding no number.
    expect(h).toMatch(/<img[^>]*alt=""/);
    expect(h).not.toMatch(/\sid="(?!_R_)[^"]*"/);
  });

  it("offers three labelled levers whose names start with their visible text", async () => {
    const html = await render();
    const h = hero(html);
    expect(count(h, /data-lever="/g)).toBe(3);
    // The six −/+ buttons; the target's suggestion button is checked below.
    const buttons = [
      ...h.matchAll(/<button[^>]*aria-label="([^"]*)"[^>]*data-lever-step[^>]*>([^<]*)<\/button>/g),
    ];
    expect(buttons.length).toBe(6);
    for (const [tag, name, text] of buttons) {
      expect(name.startsWith(text), `${name} / ${text}`).toBe(true);
      expect(tag).toContain("min-h-11");
      expect(tag).toContain("min-w-11");
    }
    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("shows each lever's value from its own field, and names the growth", async () => {
    for (const defaults of [undefined, { annualContribution: "72.000.000" }]) {
      const h = hero(await render(defaults));
      const values = { ...C.defaults, ...defaults };
      expect(h).toContain(`>${values.annualContribution} ₫<`);
      expect(h).toContain(`>${fill(C.hero.levers.age, { age: values.retirementAge })}<`);
      // The pension is asked per month, and its lever says so.
      expect(h).toContain(
        `>${fill(C.hero.levers.perMonth, { amount: `${values.desiredMonthlySpending} ₫` })}<`,
      );
    }
    const h = hero(await render());
    expect(h).toContain(`tăng ${C.defaults.contributionGrowthPercent}%/năm`);
    // …and the monthly pension's hint gives the year the engine counts in.
    expect(h).toContain(fill(C.hero.levers.desiredMonthlySpending.hint, { annual: "96 triệu" }));
  });

  it("states what one saving step is worth, in today's money, from two engine projections", async () => {
    const plan = planOf();
    const delta = contributionDelta(plan.asEntered, projectRetirement(withSavingStep(plan.input)))!;
    const h = hero(await render());
    expect(h).toContain(
      fill(C.hero.stepTotal, {
        total: compactMoney(delta.realTotal, LONG_TERM_PLAN.money),
        age: delta.lastContributionAge,
      }),
    );
    // The basis is said, and the real total sits between the flat 25 × 12
    // triệu and the nominal sum: the growth beats inflation on the defaults.
    expect(C.hero.stepTotal).toContain("theo giá hôm nay");
    expect(delta.realTotal).toBeGreaterThan(25 * 12_000_000);
    expect(delta.realTotal).toBeLessThan(delta.total);
  });

  it("keeps the conditions visible, outside the reading disclosure", async () => {
    const h = hero(await render());
    const reading = h.slice(h.indexOf("data-hero-reading"), h.indexOf("</details>", h.indexOf("data-hero-reading")));
    expect(h).toContain(C.form.estimateNote);
    expect(reading).not.toContain(C.form.estimateNote);
    expect(h).toContain("Chưa trừ thuế và phí");
    expect(reading).not.toContain("Chưa trừ thuế và phí");
  });

  it("asks for three fields, and collapses the eight optional ones naming every value", async () => {
    const html = await render();
    const form = markupRegion(html, 'data-calc-region="form"') ?? "";
    const details = /<details[^>]*data-form-disclosure="true"[^>]*>/.exec(form)?.[0] ?? "";
    expect(details).not.toBe("");
    expect(details).not.toMatch(/\sopen(=|\s|>)/);
    // Three inputs before the disclosure, eight inside it.
    const at = form.indexOf(details);
    expect(count(form.slice(0, at), /<input[^>]*data-calc-field="/g)).toBe(3);
    expect(count(form.slice(at), /<input[^>]*data-calc-field="/g)).toBe(8);
    for (const key of ["currentAge", "retirementAge", "desiredMonthlySpending"]) {
      expect(form.slice(0, at)).toMatch(new RegExp(`data-calc-field="${key}"`));
    }
    const summary = form.slice(at, form.indexOf("</summary>", at));
    const d = C.defaults;
    for (const value of [d.returnBeforePercent, d.returnAfterPercent, d.inflationPercent]) {
      expect(summary).toContain(`${value}%/năm`);
    }
    expect(summary).toContain(`tăng ${d.contributionGrowthPercent}%/năm`);
    // Other income is asked per month on this route, and summarised the same way.
    for (const value of ["100 triệu", "15 triệu/năm", "4 triệu/tháng", `tuổi ${d.endAge}`]) {
      expect(summary).toContain(value);
    }
  });

  it("keeps saying which inputs are still the example after the saving changes", async () => {
    const h = hero(await render({ annualContribution: "72.000.000" }));
    expect(h).toContain(C.hero.sampleItems.currentBalance);
    expect(h).toContain(C.hero.limitation);
    expect(h.toLowerCase()).not.toContain("không gửi");
    expect(h).not.toContain("Số của bạn");
  });

  it("reserves the card's and the figure's height above the levers", async () => {
    const h = hero(await render());
    expect(h).toMatch(/data-hero-card-slot="true" class="[^"]*min-h-/);
    // Five groups make two rows already; a four-group span gets a spacer row.
    expect(hero(await render({ retirementAge: "65" }))).toContain("row-start-2");
  });
});

describe("the hero's target: how much to have, and one change that gets there", () => {
  const target = (html: string) => markupRegion(hero(html), "data-hero-target") ?? "";

  it("sits after the levers and before the reading, and states the engine's requirement", async () => {
    const html = await render();
    const h = hero(html);
    const at = h.indexOf("data-hero-target");
    expect(at).toBeGreaterThan(h.lastIndexOf("data-lever="));
    expect(at).toBeLessThan(h.indexOf("data-hero-reading"));
    const plan = planOf();
    const panel = target(html);
    expect(panel).toContain('data-hero-target="short"');
    // One price basis for the whole panel, said at its top.
    const tagAt = panel.indexOf(C.hero.target.basisTag);
    expect(tagAt).toBeGreaterThan(-1);
    expect(tagAt).toBeLessThan(panel.indexOf("<dl"));
    // Three rows, label and figure: needed, reached, missing — at one precision.
    const rows = markupRegion(panel, "data-hero-target-rows", "dl") ?? "";
    expect(count(rows, "<dt")).toBe(3);
    expect(count(rows, "<dd")).toBe(3);
    expect(rows).toContain(fill(C.hero.target.rows.required, { age: plan.input.retirementAge }));
    expect(rows).toContain(`>${sharedMoney([plan.gap.realBalanceRequired])[0]}<`);
    expect(rows).toContain(`>${C.hero.target.rows.short}<`);
    // The basket holds the share as rice, and only draws it: the sentence says it.
    const share = Math.floor(plan.gap.coveragePercent!);
    expect(panel).toContain(`data-hero-basket="${share}"`);
    expect(panel).toContain(`transform:scaleY(${(share / 100).toFixed(3)})`);
    // …and "theo giá hôm nay" by one bowl of phở.
    expect(panel).toContain(fill(C.hero.target.pho, { today: "50.000 ₫", then: "150.000 ₫", age: 60 }));
  });

  it("offers one press that types the suggestion, named from its visible text", async () => {
    const panel = target(await render());
    const button = /<button[^>]*data-hero-target-apply[^>]*>([^<]*)<\/button>/.exec(panel);
    expect(button?.[1]).toBe(C.hero.target.apply);
    const name = /aria-label="([^"]*)"/.exec(button![0])?.[1] ?? "";
    expect(name.startsWith(C.hero.target.apply)).toBe(true);
    // A whole monthly figure, 2,3 triệu, typed as its year.
    expect(name).toContain("27.600.000 ₫");
    expect(button![0]).toContain("min-h-11");
    expect(button![0]).not.toMatch(/\saria-disabled="/);
  });

  it("keeps the button, inert, once the plan is funded, and draws no bar when nothing is required", async () => {
    const funded = target(await render({ annualContribution: "51.000.000" }));
    expect(funded).toContain('data-hero-target="funded"');
    expect(funded).toMatch(new RegExp(`aria-disabled="true"[^>]*>${C.hero.target.settled.funded}<`));
    const covered = target(await render({ otherMonthlyIncome: "20.000.000" }));
    expect(covered).toContain('data-hero-target="noNeed"');
    // Nothing required: the basket keeps its place but draws no rice.
    expect(covered).toMatch(/<svg[^>]*aria-hidden="true"[^>]*class="[^"]*\binvisible\b/);
    expect(covered).toContain(`>${C.hero.target.zero}<`);
  });
});

describe("the hero in its other states", () => {
  it("renders nothing, and leaves the tool whole, when its model throws", async () => {
    const html = await render(undefined, { throwInModel: true });
    expect(html).not.toContain("data-granary-hero");
    expect(count(html, 'data-results-live="true"')).toBe(1);
    expect(html).toContain('data-calc-region="form"');
  });

  it("draws no bowls and a neutral card while a field is invalid", async () => {
    const html = await render({ currentAge: "" });
    expect(html).not.toContain("data-bowl=");
    expect(hero(html)).toContain('data-result-status="unknown"');
    expect(hero(html)).toContain(C.hero.figure.unavailableLabel);
    // Why, VISIBLY, in the card — not only inside the reading disclosure.
    const card = markupRegion(hero(html), "data-result-status", "section") ?? "";
    // React escapes "<" in text; the notice names "tuổi dự định nghỉ < tuổi kết thúc".
    expect(card).toContain(C.form.invalidNotice.replace(/</g, "&lt;"));
    // The house keeps its rows: a field cleared mid-edit must not pull the
    // form below up under the reader's caret.
    expect(count(hero(html), 'class="invisible"')).toBe(5);
    expect(html).toMatch(/<details[^>]*data-form-disclosure="true"[^>]*open=""/);
  });

  it("draws a full granary when funded, and when a residue is forgiven", async () => {
    const funded = await render({ annualContribution: "120.000.000" });
    expect(count(funded, 'data-bowl="full"')).toBe(25);
    expect(hero(funded)).toContain('data-result-status="met"');
    const boundary = await render(FUNDED_BOUNDARY);
    expect(planOf(FUNDED_BOUNDARY).asEntered.depletionAge).toBe(84);
    expect(count(boundary, 'data-bowl="full"')).toBe(25);
    expect(hero(boundary)).toContain('data-result-status="caution"');
  });

  it("covers the years other income pays for, and names each cause", async () => {
    const other = await render({ otherMonthlyIncome: "20.000.000" });
    expect(count(other, 'data-bowl="covered"')).toBe(25);
    expect(hero(other)).toContain(C.hero.figure.legend.coveredOtherIncome);
    const nothing = await render({ desiredMonthlySpending: "0" });
    expect(count(nothing, 'data-bowl="covered"')).toBe(25);
    expect(hero(nothing)).toContain(C.hero.figure.legend.coveredNoSpending);
    expect(hero(nothing)).not.toContain(C.hero.figure.legend.coveredOtherIncome);
  });

  it("leaves no template placeholder in any state", async () => {
    for (const html of [
      await render(),
      await render(FUNDED_BOUNDARY),
      await render({ otherMonthlyIncome: "20.000.000" }),
      await render({ desiredMonthlySpending: "0" }),
      await render({ currentAge: "" }),
      await render({ retirementAge: "35" }),
    ]) {
      expect(html).not.toMatch(/\{[a-zA-Z]+\}/);
      expect(html).not.toContain("undefined");
      expect(html).not.toContain("NaN");
    }
  });
});

describe("the granary's inks", () => {
  /** WCAG relative luminance of a `#rrggbb` token read from `app/globals.css`. */
  function luminance(token: string): number {
    const css = readFileSync("app/globals.css", "utf8");
    const hex = new RegExp(`--color-${token}:\\s*#([0-9a-f]{6})`, "i").exec(css)?.[1];
    expect(hex, token).toBeDefined();
    const channel = (i: number) => {
      const c = parseInt(hex!.slice(i, i + 2), 16) / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
  }

  it("clear 3:1 on white and on the house's wall, so a rice level and an empty bowl stay visible", () => {
    // WCAG 1.4.11: the rice's edge and the bowl's outline are the graphical
    // objects a reader needs; the pale `grain` fill behind the edge is not.
    // #bac5b9 is the DARKEST pixel of the wall the shelves sit on, sampled
    // from public/images/tools/retirement-house-*.webp's source (the shaded
    // edge under the ceiling) — re-sample it if the picture changes.
    const wall = (() => {
      const channel = (hex: string) => {
        const c = parseInt(hex, 16) / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * channel("ba") + 0.7152 * channel("c5") + 0.0722 * channel("b9");
    })();
    for (const token of ["grain-ink", "bowl"]) {
      expect(1.05 / (luminance(token) + 0.05), `${token} on white`).toBeGreaterThanOrEqual(3);
      expect((wall + 0.05) / (luminance(token) + 0.05), `${token} on the wall`).toBeGreaterThanOrEqual(3);
    }
  });
});

describe("the hero's edge cases", () => {
  it("keeps a hundred-year span inside the house", async () => {
    const h = hero(await render({ currentAge: "20", retirementAge: "20", endAge: "120", currentBalance: "0", annualContribution: "0" }));
    expect(count(h, /data-bowl="/g)).toBe(100);
    expect(h).toContain("grid-cols-5");
    expect(h).toMatch(/overflow-hidden/);
  });

  it("says a clamped press lands on 0 ₫, and a shrinking contribution shrinks", async () => {
    const low = hero(await render({ annualContribution: "5.000.000" }));
    expect(low).toMatch(new RegExp(`aria-label="${C.hero.levers.toZero}[^"]*"[^>]*>${C.hero.levers.toZero}<`));
    const falling = hero(await render({ contributionGrowthPercent: "-3" }));
    expect(falling).toContain(fill(C.hero.levers.growthDown, { growth: "3" }));
    expect(falling).not.toContain("tăng -");
  });
});

describe("the hero's try, and taking it back", () => {
  it("offers the way to the reader's own numbers beside the suggestion, and says how saving is counted", async () => {
    const h = hero(await render());
    const panel = markupRegion(h, "data-hero-target") ?? "";
    expect(panel).toMatch(/<button[^>]*data-hero-open-form="true"[^>]*>Nhập số của bạn<\/button>/);
    // One way in, not two.
    expect(count(h, 'data-hero-open-form="true"')).toBe(1);
    expect(panel).toContain(C.hero.target.timing);
  });
});
