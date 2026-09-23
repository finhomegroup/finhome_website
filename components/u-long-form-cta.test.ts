/**
 * WHICH US TOOLS PIN A SHORT CURRENT ANSWER, AND WHICH DO NOT.
 *
 * The twin of `components/b2-long-form-cta.test.ts`, for the US shelf. The
 * audit's global desktop requirement is that changing a field on a long form
 * leaves the current answer readable without scrolling back and forth, using
 * the existing mechanism — `ResultCta`'s `sticky` plus `answer`, which renders
 * `data-calc-answer` inside the `.fh-cta-pin` block — and never by pinning the
 * result column itself.
 *
 * THIS FILE EXISTS BECAUSE THE FIRST PASS GOT THE RULE WRONG. Every US route
 * was left in flow on the argument that `.fh-cta-pin` only acts from 1024x900
 * up, which is exactly where the split layout already puts the answer beside
 * the form. That argument is refuted by the shelf next door:
 * `quyen-chon-black-scholes` is `columns="split"` with `wide` and STILL needs
 * the pin, because `lg:items-start` holds the result column at the top of the
 * grid while a tall form scrolls past it. A browser pass measured that form at
 * 1143,75 px at 1440x1000, with the focus ring at y 528..575 and the result
 * region at y -382..-140 — entirely above the viewport.
 *
 * THE CONTROL COUNT WAS A STAND-IN, AND TWO ROUTES HAVE NOW OUTGROWN IT. The
 * original rule here was structural: split, plus at least the measured form's
 * six controls. An independent pass at 1440×1000 then clicked the LAST FIELD of
 * each US route against the 2026-09-22T10:16:38.280Z export and measured two of
 * the five unpinned ones losing their answer anyway:
 *
 *   uoc-tinh-an-sinh-xa-hoi    last field y 529–575; monthly amount and chosen
 *                              age both above the viewport, only the
 *                              replacement rate and supporting rows left
 *   phan-tich-an-sinh-xa-hoi   last field y 529–575; total-money optimum above
 *                              the viewport, present-value optimum on the edge
 *
 * A measurement of a route beats a heuristic about that route, so both now pin
 * — in `PAIRED`, because on both of them the answer is two things at once and
 * the pin has to carry both. The count is NOT the rule and never was — it is what
 * you fall back on for a form nobody has measured. The remaining three are the
 * CSV-"Gọn" single-column tools, and the same review said explicitly not to pin
 * them from field count alone: their last controls still need their own
 * disposition, so they stay in flow until someone measures them.
 *
 * WHAT IS NOT CLAIMED HERE: `renderToStaticMarkup` in the runner's plain `node`
 * environment checks WIRING only (AGENTS.md: nothing in this suite checks
 * appearance). The measurements above are the independent review's, quoted; no
 * form's height was measured from this side, and the eight pins that predate
 * this round still rest on the black-scholes precedent rather than on their own
 * measured heights.
 */
import { describe, expect, it } from "vitest";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Us401kCalculator } from "@/components/us-401k-calculator";
import { Us401kMaxCalculator } from "@/components/us-401k-max-calculator";
import { UsDividendTaxCalculator } from "@/components/us-dividend-tax-calculator";
import { UsHsaCalculator } from "@/components/us-hsa-calculator";
import { UsInflationCalculator } from "@/components/us-inflation-calculator";
import { UsIraCalculator } from "@/components/us-ira-calculator";
import { UsMortgageDeductionCalculator } from "@/components/us-mortgage-deduction-calculator";
import { UsPayrollTaxCalculator } from "@/components/us-payroll-tax-calculator";
import { UsRmdCalculator } from "@/components/us-rmd-calculator";
import { UsSocialSecurityAnalysisCalculator } from "@/components/us-social-security-analysis-calculator";
import { UsSocialSecurityEstimateCalculator } from "@/components/us-social-security-estimate-calculator";
import { UsSocialSecurityPayoutCalculator } from "@/components/us-social-security-payout-calculator";
import { UsTbillCalculator } from "@/components/us-tbill-calculator";

const markup = (Component: ComponentType) =>
  renderToStaticMarkup(createElement(Component));

/**
 * Split forms at or above the measured shape. The number is the control count
 * — `NumberField` plus `SelectField` — against the measured form's six.
 */
const PINNED = [
  ["tiet-kiem-thue-vay-mua-nha", UsMortgageDeductionCalculator], // 7
  ["tai-khoan-tiet-kiem-y-te-hoa-ky", UsHsaCalculator], // 13
  ["thue-co-tuc", UsDividendTaxCalculator], // 6 — the boundary row
  ["gop-401k", Us401kCalculator], // 11
  ["toi-da-401k", Us401kMaxCalculator], // 9
  ["ira-truyen-thong-hay-roth", UsIraCalculator], // 8
  ["rut-toi-thieu-bat-buoc", UsRmdCalculator], // 7
  ["chi-tra-an-sinh-xa-hoi", UsSocialSecurityPayoutCalculator], // 9
] as const satisfies readonly (readonly [string, ComponentType])[];

/**
 * Pinned, but carrying a labelled PAIR rather than one figure.
 *
 * Both were measured losing their answer (see the header), and on both the
 * answer is two things at once: an amount is meaningless without the claiming
 * age it belongs to, and this shelf's analysis route exists to say there are
 * two optima rather than one. The shape is `quyen-chon-black-scholes`'s — one
 * `answer`, one label, both halves joined by `·`, `null` if either half is
 * null — and it is why these rows are exempt from the single-figure assertion
 * below: neither half may be promoted to "the" answer.
 *
 * The content-level checks (both halves present, each the same string its own
 * row renders, the placeholder instead of half a pair when a field is
 * unusable) are in `components/us-social-security-render.test.ts`, which has
 * the content modules and the patched-defaults lever. Here they only have to
 * pin at all.
 */
const PAIRED = [
  ["uoc-tinh-an-sinh-xa-hoi", UsSocialSecurityEstimateCalculator],
  ["phan-tich-an-sinh-xa-hoi", UsSocialSecurityAnalysisCalculator],
] as const satisfies readonly (readonly [string, ComponentType])[];

/** The compact tools. */
const UNPINNED = [
  // The three CSV-"Gọn" routes: `columns="single"`, so there is no second
  // column for the pin to compensate for, and the forms are short.
  ["lam-phat-hoa-ky", UsInflationCalculator],
  ["tin-phieu-kho-bac-hoa-ky", UsTbillCalculator],
  ["thue-luong-hoa-ky", UsPayrollTaxCalculator],
] as const satisfies readonly (readonly [string, ComponentType])[];

describe("the long US forms pin a short current answer", () => {
  for (const [slug, Component] of [...PINNED, ...PAIRED]) {
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
  }

  // Single-answer routes only. A `PAIRED` strip ends with its second half, so
  // "the last figure in the strip is the emphasised row's value" is false for
  // it by design — and the analysis route has no emphasised row at all. Those
  // two are checked half by half in `us-social-security-render.test.ts`.
  for (const [slug, Component] of PINNED) {
    it(`${slug} restates the emphasised row, not a second rounding`, () => {
      // `ResultCta`'s `answer` contract: the SAME formatted string the primary
      // row renders. Each of these components formats it once into a local and
      // passes that local to both, so the two can never drift — asserted here
      // by requiring the pinned figure to appear again inside the emphasised
      // row's own markup.
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
    it(`${slug} stays in flow until its own last control is measured`, () => {
      // The independent review was explicit about these three: do not pin
      // them from field count, their final controls still need their own
      // disposition. So this is a HOLD, not a finding that they are fine.
      const html = markup(Component);
      expect(html, `${slug}: gained a pin it has no height for`).not.toContain(
        "fh-cta-pin",
      );
      expect(html).not.toContain('data-calc-answer="true"');
    });
  }

  it("accounts for every US route in the milestone exactly once", () => {
    const slugs = [...PINNED, ...PAIRED, ...UNPINNED].map(([slug]) => slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    // The same thirteen rows `content/calculators/u-entry-contract.test.ts`
    // derives from the registry's `usRules` flag.
    expect(slugs.length).toBe(13);
  });
});
