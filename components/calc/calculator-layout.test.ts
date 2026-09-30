/**
 * The layout-region and CTA contracts, on rendered markup.
 *
 * WHAT THIS FILE CAN AND CANNOT ESTABLISH, stated first because the 2026-09-21
 * approved contract is explicit that source tests are not visual proof.
 *
 * It CAN establish: that three regions are emitted, exactly once each, in the
 * order form → result → detail; that the order is the same whether the layout
 * is split or single, which is the property that keeps DOM order, tab order
 * and the required mobile sequence identical; that the CTA names the region it
 * moves the reader to; that the region it names actually exists, is focusable
 * and is labelled by its own heading; and that the help sentence under the
 * button tells the truth about which of the two states the form is in.
 *
 * It CANNOT establish that anything looks right. Whether the 40/60 split reads
 * as two columns at 1440 px, whether the button is reachable without covering
 * the keyboard at 390 px, whether the focus ring is visible, and whether the
 * smooth scroll lands where a reader expects are all browser observations at a
 * measured viewport, and none of them is made here. The class assertion below
 * checks that a class is EMITTED, which is not the same claim as "it renders
 * that way".
 *
 * `renderToStaticMarkup` in the runner's plain `node` environment — the idiom
 * `loan-calculator.test.ts` and `retirement-plan-render.test.ts` established.
 * There is no jsdom here, so the click handler's behaviour (focus, scroll,
 * opening ancestor `<details>`) is NOT exercised by this file. That is a real
 * gap and it is named rather than papered over: it needs a browser.
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { createElement, type ComponentType, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CalculatorLayout } from "@/components/calc/calculator-layout";
import { NumberField } from "@/components/calc/number-field";
import { ResultCta } from "@/components/calc/result-cta";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import { TOOL_SHELL as C } from "@/content/calculators/tool-shell";

const FORM_ID = "test-nhap";
const RESULT_ID = "test-ket-qua";

/**
 * `createElement` with children passed positionally.
 *
 * `ResultGroup` declares `children` REQUIRED, which `createElement`'s variadic
 * overload does not satisfy, while `react/no-children-prop` forbids passing it
 * as a prop. Widening the component type satisfies both.
 */
function withChildren<P extends object>(
  type: ComponentType<P>,
  props: Omit<P, "children">,
  ...children: ReactNode[]
) {
  return createElement(
    type as ComponentType<Omit<P, "children">>,
    props,
    ...children,
  );
}

/** One composition standing in for any calculator that adopts the mechanism. */
function render(
  options: {
    columns?: "split" | "single";
    invalid?: boolean;
    detail?: boolean;
    sticky?: boolean;
    learning?: boolean;
  } = {},
): string {
  const {
    columns = "split",
    invalid = false,
    detail = true,
    sticky = false,
    learning = false,
  } = options;

  return renderToStaticMarkup(
    createElement(CalculatorLayout, {
      formId: FORM_ID,
      columns,
      form: createElement(NumberField, {
        label: "Số tiền vay",
        unit: "₫",
        help: "Ví dụ 2.000.000.000.",
        error: "Vui lòng nhập một số lớn hơn 0.",
        value: invalid ? "" : "2.000.000.000",
        onValueChange: () => {},
        invalid,
      }),
      cta: createElement(ResultCta, {
        formId: FORM_ID,
        targetId: RESULT_ID,
        invalid,
        sticky,
        answer: { label: "Trả mỗi tháng", value: "17.356.465 ₫" },
      }),
      primary: withChildren(
        ResultGroup,
        { title: "Kết quả", anchorId: RESULT_ID },
        createElement(ResultRow, {
          label: "Trả mỗi tháng",
          value: invalid ? null : "17.356.465 ₫",
          emphasis: true,
        }),
      ),
      learning: learning ? createElement("div", { "data-test": "learning" }) : undefined,
      actions: createElement("div", { "data-test": "actions" }),
      chart: createElement("div", { "data-test": "chart" }),
      nextSteps: createElement("div", { "data-test": "next-steps" }),
      detail: detail ? createElement("div", { "data-test": "detail" }) : null,
    }),
  );
}

/** Positions of the three region markers, in document order. */
function regionOrder(html: string): string[] {
  return [...html.matchAll(/data-calc-region="([a-z]+)"/g)].map((m) => m[1]);
}

const count = (html: string, needle: string): number =>
  html.split(needle).length - 1;

/**
 * The markup of the `<div>` carrying `attribute`, to its MATCHING close.
 *
 * A slice to the first `</div>` would stop at the first child and make any
 * "is not inside" assertion pass for free, so the depth is counted. `<div`
 * never self-closes in HTML output, which is what makes the scan sufficient.
 */
function subtreeOf(html: string, attribute: string): string {
  const start = html.lastIndexOf("<div", html.indexOf(attribute));
  let depth = 0;
  for (const m of html.slice(start).matchAll(/<div\b|<\/div>/g)) {
    depth += m[0] === "</div>" ? -1 : 1;
    if (depth === 0) return html.slice(start, start + m.index + 6);
  }
  throw new Error(`components/calc/calculator-layout.test.ts: "${attribute}" has no matching close`);
}

describe("the three layout regions", () => {
  it("emits form, then result, then detail — in split mode", () => {
    expect(regionOrder(render({ columns: "split" }))).toEqual([
      "form",
      "result",
      "detail",
    ]);
  });

  it("emits the SAME order in single mode", () => {
    // The property the whole design rests on: the compact utilities and the
    // long tools produce one reading order, so nothing about tab order or
    // screen-reader order depends on which mode a route picked.
    expect(regionOrder(render({ columns: "single" }))).toEqual([
      "form",
      "result",
      "detail",
    ]);
  });

  it("omits the detail region entirely rather than rendering an empty one", () => {
    // An empty full-width block below the tool is a gap a reader has to scroll
    // past. A tool with no detail gets no region.
    expect(regionOrder(render({ detail: false }))).toEqual(["form", "result"]);
  });

  it("puts the form id on the form region, so the CTA's search is scoped", () => {
    const html = render();
    expect(html).toContain(`id="${FORM_ID}" data-calc-region="form"`);
  });

  it("keeps the chart and the next step inside the result region", () => {
    // Both belong with the answer: the figure because it IS the answer drawn,
    // the next step because the audit's P2 asks for it beside the answer
    // rather than below the tables.
    const html = render();
    const result = html.slice(
      html.indexOf('data-calc-region="result"'),
      html.indexOf('data-calc-region="detail"'),
    );
    expect(result).toContain('data-test="chart"');
    expect(result).toContain('data-test="next-steps"');
  });

  it("emits answer → compact actions → chart → long guidance", () => {
    // The order the third browser round asked for, and the ONLY thing this
    // file can establish about it: source order. On the floating-rate tool at
    // 390×844 the first next-step heading was 1101,9 px past the bottom of the
    // answer, behind an 805,2 px plot. Nothing here reorders by CSS, so source
    // order IS reading order — but whether the block now lands within a
    // screen of the answer is a browser measurement, not this assertion.
    const html = render();
    const at = (needle: string) => html.indexOf(needle);
    expect(at(`id="${RESULT_ID}"`)).toBeLessThan(at('data-test="actions"'));
    expect(at('data-test="actions"')).toBeLessThan(at('data-test="chart"'));
    expect(at('data-test="chart"')).toBeLessThan(at('data-test="next-steps"'));
    expect(at('data-test="next-steps"')).toBeLessThan(
      at('data-calc-region="detail"'),
    );
  });

  it("the opt-in learning slot sits between the answer and the actions, in both modes", () => {
    // The 2026-09-29 living-infographic pilots: a 1440 × 1000 browser pass
    // found "Làm gì tiếp" between the answer and the approved visual. The
    // slot fixes that by SOURCE order — nothing is reordered by CSS.
    for (const columns of ["split", "single"] as const) {
      const html = render({ columns, learning: true });
      const at = (needle: string) => html.indexOf(needle);
      expect(at(`id="${RESULT_ID}"`)).toBeLessThan(at('data-test="learning"'));
      expect(at('data-test="learning"')).toBeLessThan(at('data-test="actions"'));
      expect(at('data-test="actions"')).toBeLessThan(at('data-test="chart"'));
      expect(at('data-test="chart"')).toBeLessThan(at('data-test="next-steps"'));
      // Inside the result region, outside the live announcement.
      expect(subtreeOf(html, 'data-calc-region="result"')).toContain('data-test="learning"');
      expect(subtreeOf(html, 'data-results-live="true"')).not.toContain('data-test="learning"');
      expect(html).not.toMatch(/\border-(?:first|last|none|\d)/);
    }
  });

  it("a route that passes no learning slot keeps the original order, with no slot at all", () => {
    const html = render();
    expect(html).not.toContain('data-test="learning"');
    const at = (needle: string) => html.indexOf(needle);
    expect(at(`id="${RESULT_ID}"`)).toBeLessThan(at('data-test="actions"'));
    expect(at('data-test="actions"')).toBeLessThan(at('data-test="chart"'));
  });

  it("keeps the actions OUT of the live announcement", () => {
    // `actions` is a SIBLING of `primary`, so it sits outside
    // `ResultGroup`'s inner live div. If it were inside, every recalculation
    // would read two static links back before the figure the reader wanted.
    // Asserted on the live element's own subtree rather than on a slice of the
    // whole document, because the live div OPENS before the actions in DOM
    // order and a naive slice would pass either way.
    const html = render();
    const live = subtreeOf(html, 'data-results-live="true"');
    expect(live).toContain("17.356.465"); // the slice really is the answer
    expect(live).not.toContain('data-test="actions"');
    expect(count(html, 'data-results-live="true"')).toBe(1);
  });

  it("leaves the CTA's form scoping alone when actions are present", () => {
    // The button finds its fields by the form region's id. Adding a slot
    // between the answer and the figure must not introduce a second id or
    // move the one the CTA names.
    const html = render();
    expect(count(html, `id="${FORM_ID}"`)).toBe(1);
    expect(html).toContain(`id="${FORM_ID}" data-calc-region="form"`);
  });

  it("asks the grid for a 40/60 split only in split mode", () => {
    // A CLASS assertion, so it proves the class is emitted and nothing more —
    // 2 of 5 columns beside 3 of 5. Whether that paints as two readable
    // columns is a browser question.
    expect(render({ columns: "split" })).toContain("lg:col-span-2");
    expect(render({ columns: "single" })).not.toContain("lg:col-span-2");
  });
});

describe("the CTA contract", () => {
  it("names the result region it moves the reader to", () => {
    expect(render()).toContain(`aria-controls="${RESULT_ID}"`);
  });

  it("points at a region that exists, takes focus, and announces its heading", () => {
    // The three halves of `anchorId`. Without the `aria-labelledby`, focusing
    // the region announces nothing and moving focus buys nothing over a
    // scroll; without `tabindex`, `focus()` does nothing at all.
    const html = render();
    expect(html).toContain(`id="${RESULT_ID}"`);
    expect(html).toContain('tabindex="-1"');
    expect(html).toContain(`aria-labelledby="${RESULT_ID}-title"`);
    expect(html).toContain(`id="${RESULT_ID}-title"`);
  });

  it("is never disabled, in either state", () => {
    // A disabled button is the worst answer to an invalid form: it removes the
    // one control that could say what is wrong. The invalid branch navigates
    // to the field instead.
    expect(render({ invalid: false })).not.toContain("disabled");
    expect(render({ invalid: true })).not.toContain("disabled");
  });

  it("promises no calculation it is not performing", () => {
    // The button label sits over a result that is already current. The note
    // saying so is not decoration — without it "Xem kết quả" reads as "press
    // this to compute", which is the one inference this must not invite.
    const html = render({ invalid: false });
    expect(html).toContain(C.cta.label);
    expect(html).toContain(C.cta.autoNote);
    expect(html).not.toContain(C.cta.invalidNote);
  });

  it("switches the note to the recovery when a field is unusable", () => {
    const html = render({ invalid: true });
    expect(html).toContain(C.cta.invalidNote);
    expect(html).not.toContain(C.cta.autoNote);
  });

  it("describes the button with the note, so focusing it reads the state", () => {
    const html = render({ invalid: true });
    const described = /aria-describedby="([^"]+)"/.exec(
      html.slice(html.indexOf("<button")),
    );
    expect(described).not.toBeNull();
    expect(html).toContain(`id="${described![1]}"`);
  });
});

describe("an invalid form keeps no authoritative figure", () => {
  it("shows the placeholder rather than the last good number", () => {
    // The contract: an invalid state must not keep a stale authoritative
    // result. `ResultRow` renders `—` for a null value and the calculators
    // pass null whenever any shown field is unusable, so the assertion is that
    // the figure is GONE, not that a warning was added beside it.
    const html = render({ invalid: true });
    expect(html).not.toContain("17.356.465");
    expect(html).toContain("—");

    // Discrimination control: the same composition DOES render the figure when
    // the field is valid, so the check above is not passing vacuously.
    expect(render({ invalid: false })).toContain("17.356.465");
  });

  it("leaves what the reader typed alone", () => {
    // `ResultCta` reads the DOM and never writes a field, and the form state
    // lives in `useCalcFields` as raw strings. Asserted on the markup the
    // valid case produces: the typed string is rendered back verbatim, in
    // Vietnamese money grammar, not normalised.
    expect(render({ invalid: false })).toContain('value="2.000.000.000"');
  });
});

/**
 * The pinned block, as the three CSS rules that have to agree.
 *
 * A browser found the one thing a class assertion had missed: pinned on a
 * 768px-tall viewport the block covered the input a Tab press moved to. The
 * repair is in CSS, so what is checkable here is that the component defers to
 * it and that the stylesheet actually carries all three parts. Whether a
 * focused field now clears the block is still a browser measurement.
 */
describe("the pinned block defers its threshold to CSS", () => {
  const globalsCss = readFileSync(
    new URL("../../app/globals.css", import.meta.url),
    "utf8",
  );
  /** The one `@media` block that owns pinning, isolated from the rest. */
  const pinBlock = globalsCss.slice(
    globalsCss.indexOf("@media (min-width: 64rem) and (min-height:"),
    globalsCss.indexOf(".fh-rt-exact"),
  );

  it("hands the decision to one class instead of a width variant", () => {
    // `lg:sticky` was the bug: `lg` is a width, and the failure was a height.
    const html = render({ sticky: true });
    expect(html).toContain("fh-cta-pin");
    expect(html).not.toContain("lg:sticky");
    expect(render({ sticky: false })).not.toContain("fh-cta-pin");
  });

  it("pins only above a viewport height, and one taller than the failure", () => {
    expect(pinBlock).toContain("position: sticky");
    // 56.25rem = 900px. The failures were 768px and 720px tall.
    const height = /min-height:\s*([\d.]+)rem/.exec(pinBlock);
    expect(height).not.toBeNull();
    expect(Number(height![1]) * 16).toBeGreaterThan(768);
  });

  it("reserves the block's own ceiling for a focused field, not a fixed number", () => {
    // Sequential focus navigation is the path that failed, and
    // `scroll-padding-bottom` is what the browser consults for it. A FLAT
    // number was the second failure: 240px was measured on the short pilot and
    // a no-break-even answer made the block 231,5px plus its offset. So the
    // block is capped and the reserve is that same cap — checked here as the
    // two rules referring to one variable, because a stylesheet cannot be
    // measured from a `node` test.
    expect(pinBlock).toContain("max-height: var(--fh-cta-pin-max)");
    expect(pinBlock).toContain("bottom: var(--fh-cta-pin-offset)");
    // Bounded by the declaration's own `;`, not by the first `)`: the value is
    // a `calc()` containing `var()` calls, so a paren-terminated match would
    // cut it off mid-variable. No `s` flag — `tsconfig` targets ES2017, where
    // `dotAll` is a type error, and a negated class already spans newlines.
    const reserve = /scroll-padding-bottom:([^;]*);/.exec(pinBlock);
    expect(reserve).not.toBeNull();
    expect(reserve![1]).toContain("var(--fh-cta-pin-max)");
    expect(reserve![1]).toContain("var(--fh-cta-pin-offset)");

    // And the ceiling itself still clears the tallest block a browser has
    // measured, so the cap is a guard rather than a new clipping defect.
    const ceiling = /--fh-cta-pin-max:\s*min\(([\d.]+)rem,\s*([\d.]+)vh\)/.exec(
      globalsCss,
    );
    expect(ceiling).not.toBeNull();
    expect(Number(ceiling![1]) * 16).toBeGreaterThanOrEqual(247.5);
    // 900px is the pinning threshold, so the `vh` term must not undercut the
    // measured block at the shortest viewport that pins.
    expect(Number(ceiling![2]) * 9).toBeGreaterThanOrEqual(247.5);
  });

  it("keeps that padding off pages with no pinned block", () => {
    // 200-odd pages have no CTA to clear, and their anchor scrolling should
    // not move. Scoped by the class itself, so the two cannot disagree.
    expect(pinBlock).toContain("html:has(.fh-cta-pin)");
  });
});

describe("exactly one live results region", () => {
  it("does not add a second one for the CTA's note", () => {
    // docs §4. The note under the button is deliberately NOT live: the field
    // announces its own validity change, and a second announcement of one
    // event from another place reads as a second problem.
    const html = render({ invalid: true });
    expect(count(html, 'data-results-live="true"')).toBe(1);
  });
});
