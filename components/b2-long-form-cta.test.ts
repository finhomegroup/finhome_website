/**
 * WHICH INVESTING TOOLS PIN A SHORT CURRENT ANSWER, AND WHICH DO NOT.
 *
 * The audit's global desktop requirement is that changing a field on a long
 * form leaves the current answer readable without scrolling back and forth.
 * The mechanism already exists — `ResultCta`'s `sticky` plus its `answer`
 * prop, which renders `data-calc-answer` inside the `.fh-cta-pin` block — and
 * before this pass no route on the investing shelf used it.
 *
 * THE SELECTION RULE IS THE CSS, NOT TASTE. `app/globals.css` only pins
 * `.fh-cta-pin` inside `@media (min-width: 64rem) and (min-height: 56.25rem)`,
 * so a form that cannot exceed roughly 900 px gains nothing but a second
 * restatement of a number the reader can already see. `PINNED` below holds the
 * routes whose forms can; `UNPINNED` holds the rest, and each of those carries
 * the reason in its own component.
 *
 * A DECLINE IS A MEASURABLE CLAIM, not a preference, and this file has now
 * carried two that were wrong. `quyen-chon-black-scholes` sat in UNPINNED on
 * the estimate that six short field boxes cannot fill 900 px; measured, the
 * form is 1143,75 px at 1440×1000. `co-phieu-tang-truong-khong-deu` sat there
 * on five boxes in three legends; measured at the same viewport, its answer is
 * at y −178,25 to −4,25 with the last field focused. Both declines also rested
 * on "this page has two figures, and the strip carries one" — an argument for
 * a labelled PAIR, which is what both now pass. Any row moving the other way
 * needs the same kind of evidence.
 *
 * `renderToStaticMarkup` in the runner's plain `node` environment — the
 * pattern `components/calc/chart/chart-render.test.ts` documents. This checks
 * WIRING, not appearance: nothing here has been seen at a viewport, and
 * whether the pinned block actually clears the form is a browser question.
 */
import { describe, expect, it } from "vitest";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { BondCalculator } from "@/components/bond-calculator";
import { BlackScholesCalculator } from "@/components/black-scholes-calculator";
import { CapmCalculator } from "@/components/capm-calculator";
import { DdmCalculator } from "@/components/ddm-calculator";
import { DdmMultiCalculator } from "@/components/ddm-multi-calculator";
import { EducationSavingsCalculator } from "@/components/education-savings-calculator";
import { ExpectedReturnCalculator } from "@/components/expected-return-calculator";
import { FibonacciCalculator } from "@/components/fibonacci-calculator";
import { FundFeesCalculator } from "@/components/fund-fees-calculator";
import { HoldingPeriodCalculator } from "@/components/holding-period-calculator";
import { IrrNpvCalculator } from "@/components/irr-npv-calculator";
import { PivotCalculator } from "@/components/pivot-calculator";
import { RoiCalculator } from "@/components/roi-calculator";
import { StockReturnCalculator } from "@/components/stock-return-calculator";
import { TaxEquivalentCalculator } from "@/components/tax-equivalent-calculator";
import { WaccCalculator } from "@/components/wacc-calculator";
import { WithdrawalCalculator } from "@/components/withdrawal-calculator";

const markup = (Component: ComponentType) =>
  renderToStaticMarkup(createElement(Component));

/** Long forms: tall enough for the pin's own height gate to matter. */
const PINNED = [
  ["trai-phieu", BondCalculator],
  ["irr-npv", IrrNpvCalculator],
  ["tiet-kiem-hoc-phi", EducationSavingsCalculator],
  ["phi-quy-dau-tu", FundFeesCalculator],
  ["loi-nhuan-co-phieu", StockReturnCalculator],
  ["loi-nhuan-ky-vong", ExpectedReturnCalculator],
  ["wacc", WaccCalculator],
  // Added after a browser pass measured this form at 1143,75 px at 1440×1000
  // with the result region off-screen at y −382..−140. It was in UNPINNED
  // below on the argument that the pinned block restates one answer while
  // this page has two prices; the fix was to restate BOTH as a labelled pair,
  // not to leave the answer off the screen. See the component.
  ["quyen-chon-black-scholes", BlackScholesCalculator],
  // Added on the same kind of evidence, and for the same reason. An
  // independent pass at 1440×1000 focused this form's last field ("Lợi nhuận
  // yêu cầu", y 529–575) and measured the result block at y −178,25 to −4,25:
  // both the per-share value and the terminal share off the top. It too was in
  // UNPINNED on "this page has a pair, not one answer" — which the pair shape
  // answers rather than the reader scrolling. See the component.
  ["co-phieu-tang-truong-khong-deu", DdmMultiCalculator],
] as const satisfies readonly (readonly [string, ComponentType])[];

/** Compact tools. */
const UNPINNED = [
  ["ty-suat-loi-nhuan-roi", RoiCalculator],
  ["loi-suat-tuong-duong-thue", TaxEquivalentCalculator],
  ["thu-nhap-dau-tu", WithdrawalCalculator],
  ["co-phieu-tang-truong-deu", DdmCalculator],
  ["capm", CapmCalculator],
  ["loi-nhuan-ky-nam-giu", HoldingPeriodCalculator],
  ["diem-pivot", PivotCalculator],
  ["fibonacci", FibonacciCalculator],
] as const satisfies readonly (readonly [string, ComponentType])[];

describe("the long investing forms pin a short current answer", () => {
  for (const [slug, Component] of PINNED) {
    it(`${slug} emits the pinned block with an answer in it`, () => {
      const html = markup(Component);
      expect(html, `${slug}: no .fh-cta-pin`).toContain("fh-cta-pin");
      expect(html, `${slug}: pinned block carries no answer`).toContain(
        'data-calc-answer="true"',
      );
    });

    it(`${slug} hides the restatement from assistive technology`, () => {
      // It is a duplicate of a row the result region already announces, and
      // `ResultGroup` owns the page's single live region — so the pinned copy
      // is decorative by contract, not by preference.
      const html = markup(Component);
      const at = html.indexOf('data-calc-answer="true"');
      const paragraph = html.lastIndexOf("<p", at);
      expect(html.slice(paragraph, at)).toContain('aria-hidden="true"');
    });
  }

  for (const [slug, Component] of UNPINNED) {
    it(`${slug} does not pin, and says nothing twice`, () => {
      const html = markup(Component);
      expect(html, `${slug}: gained a pin it has no height for`).not.toContain(
        "fh-cta-pin",
      );
      expect(html).not.toContain('data-calc-answer="true"');
    });
  }

  it("accounts for all seventeen routes exactly once", () => {
    const slugs = [...PINNED, ...UNPINNED].map(([slug]) => slug);
    expect(new Set(slugs).size).toBe(17);
  });
});
